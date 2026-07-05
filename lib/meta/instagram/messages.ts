/*
  lib/meta/instagram/messages.ts

  Persistance des conversations et messages Instagram dans Supabase.
  import "server-only" : interdit l'import depuis un Client Component.

  Règles :
  - Accès exclusif via le client service role.
  - Aucun token ni données sensibles dans les erreurs ou logs.
  - Les messages expirés ne sont jamais retournés.
  - L'insertion d'un inbound avec le même external_mid est idempotente.
  - Une panne de persistance ne doit pas casser le pipeline d'envoi Instagram.
*/

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

async function getAdminDb(): Promise<SupabaseClient> {
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
  return createSupabaseAdminClient()
}

/* ── Types publics ───────────────────────────────────────────────── */

export interface ConversationRow {
  id:                   string
  instagram_account_id: string
  participant_id:       string
  last_message_at:      string
  last_inbound_at:      string | null
  last_message_preview: string | null
  created_at:           string
  updated_at:           string
}

export interface MessageRow {
  id:              string
  conversation_id: string
  external_mid:    string | null
  direction:       'inbound' | 'outbound'
  source:          'instagram' | 'auto_reply' | 'manual_reply'
  text:            string
  status:          'received' | 'sent' | 'failed'
  reply_to_mid:    string | null
  sent_by:         string | null
  occurred_at:     string
  created_at:      string
  expires_at:      string
}

/* Longueur maximale du texte stocké en base (4096 chars) */
const MAX_TEXT_LENGTH = 4096
/** Tronque un texte avant insertion */
function safeText(text: string): string {
  return text.slice(0, MAX_TEXT_LENGTH)
}

/* Longueur maximale du preview */
const MAX_PREVIEW_LENGTH = 200

/* ── Conversation ────────────────────────────────────────────────── */

/**
 * Trouve ou crée une conversation pour un couple (accountId, participantId).
 * Idempotent : retourne toujours la même conversation pour une même paire.
 */
export async function findOrCreateInstagramConversation(
  instagramAccountId: string,
  participantId:      string,
  occurredAt:         Date,
): Promise<ConversationRow> {
  const db = await getAdminDb()

  /* Tentative de récupération de l'existante */
  const { data: existing } = await db
    .from('instagram_conversations')
    .select('*')
    .eq('instagram_account_id', instagramAccountId)
    .eq('participant_id', participantId)
    .single()

  if (existing) return existing as ConversationRow

  /* Création */
  const { data, error } = await db
    .from('instagram_conversations')
    .insert({
      instagram_account_id: instagramAccountId,
      participant_id:       participantId,
      last_message_at:      occurredAt.toISOString(),
    })
    .select('*')
    .single()

  if (error || !data) {
    /* Race condition : une autre requête parallèle a déjà créé la conversation */
    const { data: retry } = await db
      .from('instagram_conversations')
      .select('*')
      .eq('instagram_account_id', instagramAccountId)
      .eq('participant_id', participantId)
      .single()
    if (!retry) throw new Error('[messages] findOrCreateInstagramConversation: échec')
    return retry as ConversationRow
  }

  return data as ConversationRow
}

/** Met à jour les métadonnées d'une conversation après un nouveau message. */
async function updateConversationMeta(
  db:             SupabaseClient,
  conversationId: string,
  occurredAt:     Date,
  preview:        string,
  isInbound:      boolean,
): Promise<void> {
  const update: Record<string, unknown> = {
    last_message_at:      occurredAt.toISOString(),
    last_message_preview: preview.slice(0, MAX_PREVIEW_LENGTH),
    updated_at:           new Date().toISOString(),
  }
  if (isInbound) update.last_inbound_at = occurredAt.toISOString()

  await db
    .from('instagram_conversations')
    .update(update)
    .eq('id', conversationId)
}

/* ── Messages ────────────────────────────────────────────────────── */

/**
 * Enregistre un message entrant.
 * Idempotent sur external_mid : une même valeur ne produit qu'une seule ligne.
 */
export async function recordInboundInstagramMessage(
  conversationId: string,
  mid:            string,
  text:           string,
  occurredAt:     Date,
): Promise<MessageRow | null> {
  const db   = await getAdminDb()
  const safe = safeText(text)

  /* Nettoyage best-effort des messages expirés */
  cleanupExpiredInstagramMessages().catch(() => undefined)

  /* Vérifier si ce mid est déjà enregistré (idempotence) */
  const { data: existing } = await db
    .from('instagram_messages')
    .select('*')
    .eq('external_mid', mid)
    .single()
  if (existing) return existing as MessageRow

  const { data, error } = await db
    .from('instagram_messages')
    .insert({
      conversation_id: conversationId,
      external_mid:    mid,
      direction:       'inbound',
      source:          'instagram',
      text:            safe,
      status:          'received',
      occurred_at:     occurredAt.toISOString(),
    })
    .select('*')
    .single()

  if (error || !data) {
    /* Possible race condition sur l'index unique */
    const { data: retry } = await db
      .from('instagram_messages')
      .select('*')
      .eq('external_mid', mid)
      .single()
    return retry as MessageRow | null
  }

  await updateConversationMeta(db, conversationId, occurredAt, safe, true)

  return data as MessageRow
}

/**
 * Enregistre une réponse sortante (automatique ou manuelle).
 */
export async function recordOutboundInstagramMessage(
  conversationId: string,
  text:           string,
  source:         'auto_reply' | 'manual_reply',
  occurredAt:     Date,
  opts?: { replyToMid?: string; sentBy?: string },
): Promise<MessageRow | null> {
  const db   = await getAdminDb()
  const safe = safeText(text)

  const { data, error } = await db
    .from('instagram_messages')
    .insert({
      conversation_id: conversationId,
      direction:       'outbound',
      source,
      text:            safe,
      status:          'sent',
      reply_to_mid:    opts?.replyToMid ?? null,
      sent_by:         opts?.sentBy ?? null,
      occurred_at:     occurredAt.toISOString(),
    })
    .select('*')
    .single()

  if (error || !data) return null

  await updateConversationMeta(db, conversationId, occurredAt, safe, false)

  return data as MessageRow
}

/* ── Lecture ─────────────────────────────────────────────────────── */

/**
 * Liste les conversations d'un compte Instagram, triées par dernier message.
 */
export async function listInstagramConversations(
  instagramAccountId: string,
  limit = 50,
): Promise<ConversationRow[]> {
  const db = await getAdminDb()

  /* Nettoyage best-effort */
  cleanupExpiredInstagramMessages().catch(() => undefined)

  const { data } = await db
    .from('instagram_conversations')
    .select('*')
    .eq('instagram_account_id', instagramAccountId)
    .order('last_message_at', { ascending: false })
    .limit(limit)

  return (data ?? []) as ConversationRow[]
}

/**
 * Retourne une conversation par son UUID.
 */
export async function getInstagramConversation(
  conversationId: string,
): Promise<ConversationRow | null> {
  const db = await getAdminDb()
  const { data } = await db
    .from('instagram_conversations')
    .select('*')
    .eq('id', conversationId)
    .single()
  return data ? (data as ConversationRow) : null
}

/**
 * Liste les messages d'une conversation (non expirés, ordre chronologique).
 */
export async function listInstagramMessages(
  conversationId: string,
  limit = 100,
): Promise<MessageRow[]> {
  const db = await getAdminDb()
  const { data } = await db
    .from('instagram_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .gt('expires_at', new Date().toISOString())
    .order('occurred_at', { ascending: true })
    .limit(limit)
  return (data ?? []) as MessageRow[]
}

/**
 * Retourne last_inbound_at d'une conversation.
 */
export async function getLastInboundAt(
  conversationId: string,
): Promise<Date | null> {
  const db = await getAdminDb()
  const { data } = await db
    .from('instagram_conversations')
    .select('last_inbound_at')
    .eq('id', conversationId)
    .single()
  if (!data?.last_inbound_at) return null
  return new Date(data.last_inbound_at as string)
}

/**
 * Supprime les messages dont expires_at est dépassé.
 * Opération best-effort — les erreurs sont silencieuses.
 */
export async function cleanupExpiredInstagramMessages(): Promise<void> {
  try {
    const db = await getAdminDb()
    await db
      .from('instagram_messages')
      .delete()
      .lt('expires_at', new Date().toISOString())
  } catch {
    /* Best-effort, jamais bloquant */
  }
}

/**
 * Supprime toutes les conversations d'un participant (RGPD / data deletion).
 * Les messages sont supprimés en cascade par la FK de la migration.
 */
export async function deleteConversationsByParticipant(
  participantId: string,
): Promise<void> {
  const db = await getAdminDb()
  await db
    .from('instagram_conversations')
    .delete()
    .eq('participant_id', participantId)
}
