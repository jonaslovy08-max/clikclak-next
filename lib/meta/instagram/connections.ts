/*
  lib/meta/instagram/connections.ts

  Accès CRUD à la table instagram_connections via le client Supabase service role.
  import "server-only" : interdit l'import depuis un Client Component.

  Règles :
  - Aucun token en clair ne circule : chiffrement avant écriture, déchiffrement
    après lecture uniquement pour les opérations qui l'exigent.
  - listInstagramConnections retourne InstagramConnectionPublic (sans encrypted_access_token).
  - resolveInstagramSendConfig est dans resolver.ts (sans server-only) pour rester
    testable par les scripts de test du webhook.
*/

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import { encryptToken, decryptToken } from './tokenCrypto'

/* Import dynamique pour éviter que server-only de lib/supabase/admin.ts
   ne remonte dans resolver.ts (importé par le webhook dans les tests). */
async function getAdminDb(): Promise<SupabaseClient> {
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
  return createSupabaseAdminClient()
}

/* ── Types ───────────────────────────────────────────────────────── */

export type InstagramConnectionStatus = 'active' | 'pending' | 'expired' | 'revoked' | 'error'

/** Connexion complète — contient le token chiffré. Usage interne uniquement. */
export interface InstagramConnection {
  id:                     string
  instagram_user_id:      string
  username:               string | null
  account_type:           string | null
  profile_picture_url:    string | null
  encrypted_access_token: string
  token_expires_at:       string | null
  scopes:                 string[]
  webhook_subscribed:     boolean
  status:                 InstagramConnectionStatus
  connected_by:           string | null
  created_at:             string
  updated_at:             string
}

/** Projection publique — jamais de token chiffré dans les réponses UI. */
export interface InstagramConnectionPublic {
  id:                  string
  instagram_user_id:   string
  username:            string | null
  account_type:        string | null
  profile_picture_url: string | null
  token_expires_at:    string | null
  scopes:              string[]
  webhook_subscribed:  boolean
  status:              InstagramConnectionStatus
  connected_by:        string | null
  created_at:          string
  updated_at:          string
}

export interface InstagramConnectionInput {
  instagram_user_id:   string
  username:            string | null
  account_type:        string | null
  profile_picture_url: string | null
  plaintext_token:     string    // chiffré avant insertion
  token_expires_at:    Date | null
  scopes:              string[]
  webhook_subscribed:  boolean
  status:              InstagramConnectionStatus
  connected_by:        string | null
}

export interface InstagramSendConfig {
  accountId:    string
  accessToken:  string
  graphVersion?: string
}

/* ── Colonnes publiques (sans token chiffré) ─────────────────────── */

const PUBLIC_COLUMNS = [
  'id', 'instagram_user_id', 'username', 'account_type',
  'profile_picture_url', 'token_expires_at', 'scopes',
  'webhook_subscribed', 'status', 'connected_by', 'created_at', 'updated_at',
].join(', ')

/* ── CRUD ────────────────────────────────────────────────────────── */

/**
 * Insère ou met à jour une connexion Instagram.
 * Upsert sur instagram_user_id → idempotent (reconnexion mise à jour, pas dupliquée).
 */
export async function saveInstagramConnection(
  input: InstagramConnectionInput,
): Promise<InstagramConnectionPublic> {
  const db        = await getAdminDb()
  const encrypted = encryptToken(input.plaintext_token)

  const { data, error } = await db
    .from('instagram_connections')
    .upsert(
      {
        instagram_user_id:      input.instagram_user_id,
        username:               input.username,
        account_type:           input.account_type,
        profile_picture_url:    input.profile_picture_url,
        encrypted_access_token: encrypted,
        token_expires_at:       input.token_expires_at?.toISOString() ?? null,
        scopes:                 input.scopes,
        webhook_subscribed:     input.webhook_subscribed,
        status:                 input.status,
        connected_by:           input.connected_by,
        updated_at:             new Date().toISOString(),
      },
      { onConflict: 'instagram_user_id' },
    )
    .select(PUBLIC_COLUMNS)
    .single()

  if (error) {
    throw new Error(`[connections] Sauvegarde impossible: ${error.message.slice(0, 80)}`)
  }

  return data as unknown as InstagramConnectionPublic
}

/**
 * Charge la connexion complète (avec token chiffré) par identifiant Instagram.
 * Réservé aux opérations internes nécessitant le token (envoi, désabonnement).
 * Retourne null si absente ou en cas d'erreur.
 */
export async function getInstagramConnectionByAccountId(
  instagramUserId: string,
  opts?: {
    _lookupOverride?: (id: string) => Promise<InstagramConnection | null>
  },
): Promise<InstagramConnection | null> {
  if (opts?._lookupOverride) return opts._lookupOverride(instagramUserId)

  try {
    const db = await getAdminDb()
    const { data, error } = await db
      .from('instagram_connections')
      .select('*')
      .eq('instagram_user_id', instagramUserId)
      .in('status', ['active', 'pending'])
      .single()
    if (error || !data) return null
    return data as InstagramConnection
  } catch {
    return null
  }
}

/**
 * Liste toutes les connexions pour la page admin.
 * Retourne uniquement la projection publique — jamais encrypted_access_token.
 */
export async function listInstagramConnections(): Promise<InstagramConnectionPublic[]> {
  const db = await getAdminDb()

  const { data, error } = await db
    .from('instagram_connections')
    .select(PUBLIC_COLUMNS)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`[connections] Listing impossible: ${error.message.slice(0, 80)}`)
  }

  return (data ?? []) as unknown as InstagramConnectionPublic[]
}

/** Supprime une connexion par son UUID. */
export async function deleteInstagramConnection(id: string): Promise<void> {
  const db            = await getAdminDb()
  const { error }     = await db.from('instagram_connections').delete().eq('id', id)
  if (error) throw new Error(`[connections] Suppression impossible: ${error.message.slice(0, 80)}`)
}

/** Met à jour statut et webhook_subscribed d'une seule requête. */
export async function updateInstagramConnectionWebhook(
  id:                string,
  webhookSubscribed: boolean,
  status:            InstagramConnectionStatus,
): Promise<void> {
  const db = await getAdminDb()
  const { error } = await db
    .from('instagram_connections')
    .update({ webhook_subscribed: webhookSubscribed, status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`[connections] Mise à jour webhook impossible: ${error.message.slice(0, 80)}`)
}

/** Met à jour le statut seul. */
export async function updateConnectionStatus(
  id:     string,
  status: InstagramConnectionStatus,
): Promise<void> {
  const db = await getAdminDb()
  const { error } = await db
    .from('instagram_connections')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`[connections] Mise à jour statut impossible: ${error.message.slice(0, 80)}`)
}

/** Marque le webhook_subscribed. */
export async function setWebhookSubscribed(id: string, subscribed: boolean): Promise<void> {
  const db = await getAdminDb()
  const { error } = await db
    .from('instagram_connections')
    .update({ webhook_subscribed: subscribed, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new Error(`[connections] Mise à jour webhook_subscribed impossible: ${error.message.slice(0, 80)}`)
}

/**
 * Déchiffre le token d'une connexion complète.
 * Réservé aux opérations internes (envoi, désabonnement).
 * Ne jamais retourner au client.
 */
export function decryptConnectionToken(conn: InstagramConnection): string {
  return decryptToken(conn.encrypted_access_token)
}
