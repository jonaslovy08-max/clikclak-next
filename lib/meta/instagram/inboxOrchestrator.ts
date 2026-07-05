/*
  lib/meta/instagram/inboxOrchestrator.ts

  Orchestrateur pur de la boite de reception Instagram.
  SANS import "server-only" — testable directement par les scripts tsx.

  Fonctionnalités :
  - Validation du texte de réponse manuelle.
  - Vérification de la fenêtre de 24 heures.
  - Rate limiting par utilisateur admin.
  - Orchestration de l'envoi et de la persistance.
  - Résultats typés sans exception levée vers l'appelant.

  Les dépendances réseau et base sont injectées — jamais de constante fixe.
*/

import type { ConversationRow } from './messages'
import type { InstagramSendConfig } from './connections'

/* ── Types ────────────────────────────────────────────────────────── */

export type ManualReplyOutcome =
  | 'sent'                // Envoyé et persisté
  | 'sent_not_saved'      // Envoyé mais persistance échouée
  | 'rate_limited'        // Trop de tentatives
  | 'duplicate_submit'    // Double soumission — claim Redis NX échoué
  | 'window_expired'      // Fenêtre 24h dépassée
  | 'no_inbound'          // Aucun message entrant dans cette conversation
  | 'not_found'           // Conversation introuvable
  | 'no_config'           // Compte Instagram non configuré ou inactif
  | 'invalid_text'        // Texte vide ou > 1000 chars
  | 'connection_inactive' // Connexion Instagram inactive
  | 'send_failed'         // Envoi Instagram échoué

export interface ManualReplyResult {
  outcome:   ManualReplyOutcome
  messageId?: string
}

export interface ManualReplyDeps {
  getConversation:  (id: string) => Promise<ConversationRow | null>
  getConnectionStatus: (accountId: string) => Promise<'active' | 'other' | null>
  checkRateLimit:   (userId: string) => Promise<boolean>  // true = autorisé
  /**
   * Idempotence à trois états (lock temporaire → confirm | release) :
   *
   * acquireSendLock(sid):
   *   - Vérifie que le `:done` n'existe pas (envoi déjà réussi → false).
   *   - Pose un lock NX `:lock` TTL 30s (fenêtre d'envoi atomique → true si premier).
   *
   * confirmSendSuccess(sid):
   *   - Après envoi Instagram confirmé : SET `:done` TTL 24h + DEL `:lock`.
   *   - Bloque toute nouvelle tentative avec le même submissionId.
   *
   * releaseSendLock(sid):
   *   - En cas d'échec avant l'envoi ou d'échec Meta : DEL `:lock`.
   *   - Permet une nouvelle tentative avec le même ou un nouveau submissionId.
   *
   * Toutes sont optionnelles. Jamais le texte dans Redis.
   */
  acquireSendLock?:     (submissionId: string) => Promise<boolean>
  confirmSendSuccess?:  (submissionId: string) => Promise<void>
  releaseSendLock?:     (submissionId: string) => Promise<void>
  resolveConfig:    (accountId: string) => Promise<InstagramSendConfig | null>
  sendMessage:      (participantId: string, text: string, config: InstagramSendConfig) => Promise<boolean>
  recordOutbound:   (conversationId: string, text: string, sentBy: string) => Promise<string | null>
}

/* ── Constantes ──────────────────────────────────────────────────── */

const MAX_REPLY_LENGTH  = 1000
const WINDOW_24H_MS     = 24 * 60 * 60 * 1000

/* ── Validation ──────────────────────────────────────────────────── */

export function validateManualReplyText(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.length >= 1 && trimmed.length <= MAX_REPLY_LENGTH
}

export function isWithin24Hours(lastInboundAt: Date | null, now: Date = new Date()): boolean {
  if (!lastInboundAt) return false
  return now.getTime() - lastInboundAt.getTime() < WINDOW_24H_MS
}

/* ── Orchestrateur ───────────────────────────────────────────────── */

/**
 * Orchestre l'envoi d'une réponse manuelle Instagram.
 * Injecte toutes les dépendances réseau — testable sans Supabase ni Meta.
 *
 * @param submissionId  UUID opaque généré côté client par soumission.
 *                      Utilisé pour l'idempotence NX Redis (jamais le texte).
 */
export async function orchestrateManualReply(
  conversationId: string,
  rawText:        string,
  userId:         string,
  deps:           ManualReplyDeps,
  submissionId?:  string,
): Promise<ManualReplyResult> {
  /* 1. Validation du texte */
  const text = rawText.trim()
  if (!validateManualReplyText(text)) {
    return { outcome: 'invalid_text' }
  }

  /* 2. Rate limiting */
  const allowed = await deps.checkRateLimit(userId)
  if (!allowed) return { outcome: 'rate_limited' }

  /* 2b. Idempotence — acquisition atomique du verrou d'envoi
     acquireSendLock vérifie d'abord si l'envoi est déjà confirmé (:done),
     puis tente un NX (:lock TTL 30s). Retourne false si doublon ou déjà envoyé. */
  if (submissionId && deps.acquireSendLock) {
    const lockAcquired = await deps.acquireSendLock(submissionId)
    if (!lockAcquired) return { outcome: 'duplicate_submit' }
  }

  /* 3. Chargement de la conversation (best-effort : panne DB → not_found) */
  let conversation: ConversationRow | null
  try {
    conversation = await deps.getConversation(conversationId)
  } catch {
    return { outcome: 'not_found' }
  }
  if (!conversation) return { outcome: 'not_found' }

  /* 4. Connexion Instagram active */
  const connStatus = await deps.getConnectionStatus(conversation.instagram_account_id)
  if (!connStatus) return { outcome: 'not_found' }
  if (connStatus !== 'active') return { outcome: 'connection_inactive' }

  /* 5. Vérification de la fenêtre de 24 heures */
  const lastInbound = conversation.last_inbound_at
    ? new Date(conversation.last_inbound_at)
    : null

  if (!lastInbound) return { outcome: 'no_inbound' }
  if (!isWithin24Hours(lastInbound)) return { outcome: 'window_expired' }

  /* 6. Résoudre la configuration d'envoi */
  const config = await deps.resolveConfig(conversation.instagram_account_id)
  if (!config) return { outcome: 'no_config' }

  /* 7. Envoi Instagram */
  const sent = await deps.sendMessage(conversation.participant_id, text, config)

  if (!sent) {
    /* Échec envoi : libérer le verrou pour permettre une nouvelle tentative */
    if (submissionId && deps.releaseSendLock) {
      await deps.releaseSendLock(submissionId).catch(() => undefined)
    }
    return { outcome: 'send_failed' }
  }

  /* 7b. Confirmer le succès : marquer :done 24h + supprimer :lock */
  if (submissionId && deps.confirmSendSuccess) {
    await deps.confirmSendSuccess(submissionId).catch(() => undefined)
  }

  /* 8. Persistance (best-effort — l'envoi a déjà réussi) */
  const messageId = await deps.recordOutbound(conversationId, text, userId)
  if (!messageId) {
    return { outcome: 'sent_not_saved' }
  }

  return { outcome: 'sent', messageId }
}
