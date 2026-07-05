'use server'
/*
  app/admin/(dashboard)/integrations/instagram/actions.ts

  Server Actions protégées pour l'intégration Instagram :
  - Gestion des connexions (retry webhook, déconnexion)
  - Boîte de réception (réponse manuelle)

  Chaque action vérifie la session, valide les entrées, et redirige
  avec un code non sensible. Next.js fournit la protection CSRF native.
*/

import { redirect }               from 'next/navigation'
import { revalidatePath }         from 'next/cache'
import { Redis }                  from '@upstash/redis'
import { requireInstagramAccess } from '@/lib/admin/auth'
import {
  listInstagramConnections,
  deleteInstagramConnection,
  updateInstagramConnectionWebhook,
  getInstagramConnectionByAccountId,
  decryptConnectionToken,
} from '@/lib/meta/instagram/connections'
import {
  subscribeInstagramAccountToMessages,
  unsubscribeInstagramAccount,
} from '@/lib/meta/instagram/oauth'
import {
  getInstagramConversation,
  recordOutboundInstagramMessage,
} from '@/lib/meta/instagram/messages'
import { resolveInstagramSendConfig } from '@/lib/meta/instagram/resolver'
import { sendInstagramTextMessage }    from '@/lib/meta/instagram/client'
import {
  orchestrateManualReply,
  type ManualReplyDeps,
} from '@/lib/meta/instagram/inboxOrchestrator'
import { isValidUuid } from '@/lib/meta/instagram/accessControl'

const PAGE_PATH = '/admin/integrations/instagram'

/* ── Rate limiting réponses manuelles ─────────────────────────────── */

const MANUAL_REPLY_RL_PREFIX  = 'meta:instagram:manual-reply'
const MANUAL_REPLY_LIMIT      = 20
const MANUAL_REPLY_WINDOW     = 60  // secondes
const SUBMISSION_ID_PREFIX    = 'meta:instagram:reply-submit'
const SUBMISSION_LOCK_TTL     = 30        // secondes — verrou pendant l'envoi
const SUBMISSION_DONE_TTL     = 24 * 3600 // secondes — confirmation après succès (24h)

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

async function checkManualReplyRateLimit(userId: string): Promise<boolean> {
  try {
    const redis = getRedis()
    const key   = `${MANUAL_REPLY_RL_PREFIX}:${userId}`
    const count = await redis.incr(key)
    if (count === 1) await redis.expire(key, MANUAL_REPLY_WINDOW)
    return count <= MANUAL_REPLY_LIMIT
  } catch {
    return true /* fail open si Redis indisponible */
  }
}

/* ── Idempotence d'envoi : lock temporaire → confirm | release ─── */

function lockKey(sid: string): string { return `${SUBMISSION_ID_PREFIX}:${sid}:lock` }
function doneKey(sid: string): string { return `${SUBMISSION_ID_PREFIX}:${sid}:done` }

/**
 * Vérifie si l'envoi est déjà réussi (:done 24h), puis tente un NX sur :lock (30s).
 * Retourne true si le verrou est acquis (traitement autorisé).
 * Retourne false si l'envoi est déjà confirmé ou si le verrou existe déjà.
 * Ne stocke jamais le texte du message dans Redis.
 */
async function acquireSendLock(submissionId: string): Promise<boolean> {
  try {
    const redis = getRedis()
    /* Vérifier si cet envoi est déjà confirmé (succès antérieur) */
    const done = await redis.get(doneKey(submissionId))
    if (done !== null) return false
    /* Tenter d'acquérir le verrou temporaire (NX) */
    const result = await redis.set(lockKey(submissionId), '1', { nx: true, ex: SUBMISSION_LOCK_TTL })
    return result !== null
  } catch {
    return true /* fail open si Redis indisponible */
  }
}

/**
 * Après envoi Instagram réussi : marque :done 24h + supprime :lock.
 * Bloque toute nouvelle tentative avec le même submissionId.
 */
async function confirmSendSuccess(submissionId: string): Promise<void> {
  try {
    const redis = getRedis()
    await redis.set(doneKey(submissionId), '1', { ex: SUBMISSION_DONE_TTL })
    await redis.del(lockKey(submissionId))
  } catch { /* best-effort */ }
}

/**
 * En cas d'échec avant envoi ou d'échec Meta : supprime :lock pour permettre un retry.
 * Ne crée pas de :done — la prochaine tentative peut utiliser le même ou un nouveau ID.
 */
async function releaseSendLock(submissionId: string): Promise<void> {
  try {
    await getRedis().del(lockKey(submissionId))
  } catch { /* best-effort */ }
}

/* ── Retenter l'abonnement webhook ──────────────────────────────── */

export async function retryWebhookSubscription(
  connectionId: string,
  _formData: FormData,
): Promise<void> {
  void _formData
  await requireInstagramAccess()

  if (!isValidUuid(connectionId)) redirect(`${PAGE_PATH}?error=invalid_id`)

  const connections = await listInstagramConnections()
  const conn        = connections.find(c => c.id === connectionId)
  if (!conn) redirect(`${PAGE_PATH}?error=not_found`)

  const full = await getInstagramConnectionByAccountId(conn.instagram_user_id)
  if (!full) redirect(`${PAGE_PATH}?error=not_found`)

  let accessToken: string
  try {
    accessToken = decryptConnectionToken(full)
  } catch {
    redirect(`${PAGE_PATH}?error=token_error`)
  }

  const ok = await subscribeInstagramAccountToMessages(full.instagram_user_id, accessToken)
  if (ok) {
    await updateInstagramConnectionWebhook(connectionId, true, 'active')
    revalidatePath(PAGE_PATH)
    redirect(`${PAGE_PATH}?success=webhook_retried`)
  }

  redirect(`${PAGE_PATH}?error=webhook_failed`)
}

/* ── Déconnexion d'un compte Instagram ──────────────────────────── */

export async function disconnectInstagramAccount(
  connectionId: string,
  _formData: FormData,
): Promise<void> {
  void _formData
  await requireInstagramAccess()

  if (!isValidUuid(connectionId)) redirect(`${PAGE_PATH}?error=invalid_id`)

  const connections = await listInstagramConnections()
  const conn        = connections.find(c => c.id === connectionId)

  if (!conn) {
    revalidatePath(PAGE_PATH)
    redirect(`${PAGE_PATH}?success=already_disconnected`)
  }

  if (conn.webhook_subscribed) {
    try {
      const full = await getInstagramConnectionByAccountId(conn.instagram_user_id)
      if (full) {
        const accessToken = decryptConnectionToken(full)
        await unsubscribeInstagramAccount(full.instagram_user_id, accessToken)
      }
    } catch { /* best-effort */ }
  }

  await deleteInstagramConnection(connectionId)
  revalidatePath(PAGE_PATH)
  redirect(`${PAGE_PATH}?success=disconnected`)
}

/* ── Réponse manuelle Instagram ─────────────────────────────────── */

export async function sendManualInstagramReply(
  conversationId: string,
  text:           string,
  _formData:      FormData,
): Promise<void> {
  void _formData
  const profile = await requireInstagramAccess()

  if (!isValidUuid(conversationId)) {
    redirect(`${PAGE_PATH}?conversation=${encodeURIComponent(conversationId)}&reply_error=invalid_id`)
  }

  /* Extraire le submissionId depuis FormData (généré côté client, UUID opaque) */
  const submissionId = typeof _formData.get('submissionId') === 'string'
    ? (_formData.get('submissionId') as string)
    : undefined

  const deps: ManualReplyDeps = {
    getConversation: getInstagramConversation,

    getConnectionStatus: async (accountId) => {
      const conns = await listInstagramConnections()
      const conn  = conns.find(c => c.instagram_user_id === accountId)
      if (!conn) return null
      return conn.status === 'active' ? 'active' : 'other'
    },

    checkRateLimit: (userId) => checkManualReplyRateLimit(userId),

    acquireSendLock:    acquireSendLock,
    confirmSendSuccess: confirmSendSuccess,
    releaseSendLock:    releaseSendLock,

    resolveConfig: resolveInstagramSendConfig,

    sendMessage: (participantId, replyText, config) =>
      sendInstagramTextMessage(participantId, replyText, config),

    recordOutbound: async (convId, replyText, userId) => {
      const msg = await recordOutboundInstagramMessage(
        convId, replyText, 'manual_reply', new Date(), { sentBy: userId }
      )
      return msg?.id ?? null
    },
  }

  const result = await orchestrateManualReply(
    conversationId,
    text,
    profile.id,
    deps,
    submissionId,
  )

  const redirectBase = `${PAGE_PATH}?conversation=${encodeURIComponent(conversationId)}`

  switch (result.outcome) {
    case 'sent':
    case 'sent_not_saved':
      revalidatePath(PAGE_PATH)
      redirect(`${redirectBase}&reply_success=${result.outcome}`)
    default:
      redirect(`${redirectBase}&reply_error=${result.outcome}`)
  }
}
