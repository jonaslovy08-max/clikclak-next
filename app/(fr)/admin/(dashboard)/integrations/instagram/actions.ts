'use server'
/*
  app/admin/(dashboard)/integrations/instagram/actions.ts

  Server Actions protégées pour la gestion des connexions Instagram.

  Chaque action :
    1. Vérifie la session (admin|editor|instagram_reviewer via requireInstagramAccess)
    2. Valide l'identifiant reçu
    3. Exécute l'opération et redirige avec un code non sensible
    4. Ne retourne jamais de token ni de payload chiffré

  Next.js Server Actions intègrent une protection CSRF native (Origin header).
  FormData est le 2e paramètre requis pour les form actions liées via .bind().
*/

import { redirect }           from 'next/navigation'
import { revalidatePath }     from 'next/cache'
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

const PAGE_PATH = '/admin/integrations/instagram'

/* ── Validation de l'identifiant UUID ───────────────────────────── */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function isValidUuid(id: string): boolean {
  return UUID_RE.test(id)
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

  /* Charger la connexion complète (avec token chiffré) */
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

  /* Tentative de désabonnement (best-effort) */
  if (conn.webhook_subscribed) {
    try {
      const full        = await getInstagramConnectionByAccountId(conn.instagram_user_id)
      if (full) {
        const accessToken = decryptConnectionToken(full)
        await unsubscribeInstagramAccount(full.instagram_user_id, accessToken)
      }
    } catch {
      /* Désabonnement best-effort — on supprime quand même la connexion locale */
    }
  }

  await deleteInstagramConnection(connectionId)
  revalidatePath(PAGE_PATH)
  redirect(`${PAGE_PATH}?success=disconnected`)
}
