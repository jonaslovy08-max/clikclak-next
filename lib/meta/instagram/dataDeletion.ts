/*
  lib/meta/instagram/dataDeletion.ts

  Fonctions de suppression des données Instagram et de suivi des demandes
  de suppression reçues de Meta.

  import "server-only" : interdit l'import depuis un Client Component.
  Accès Supabase via le client service role uniquement.
  Aucun user_id ni token en clair dans les enregistrements de suivi.
*/

import 'server-only'
import { randomUUID }  from 'node:crypto'
import { Redis }       from '@upstash/redis'
import type { SupabaseClient } from '@supabase/supabase-js'

/* ── Client Supabase (import dynamique pour testabilité des modules dépendants) */

async function getAdminDb(): Promise<SupabaseClient> {
  const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
  return createSupabaseAdminClient()
}

/* ── Client Redis (lazy singleton) ─────────────────────────────── */

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

/* ── Clés Redis Instagram ────────────────────────────────────────── */

const CONV_KEY_PREFIX = 'meta:instagram:conversation'

/* ── Suppression des données par user_id ─────────────────────────── */

/**
 * Supprime toutes les données Instagram contrôlées par Clik Clak
 * pour un identifiant Instagram donné.
 *
 * Idempotente : l'absence de données est traitée comme un succès.
 *
 * Données supprimées :
 *   - Ligne dans instagram_connections (si instagram_user_id correspond)
 *   - Clé Redis de conversation : meta:instagram:conversation:{userId}
 *
 * Non supprimées (non énumérables, TTL naturelle) :
 *   - meta:instagram:message:{mid}:lock   (max 2 min)
 *   - meta:instagram:message:{mid}:done   (max 24h)
 *   Ces clés sont indexées par message.mid, pas par user_id.
 *   Elles ne contiennent pas de données personnelles — uniquement un
 *   marqueur d'existence. Leur durée de conservation maximale est 24h.
 *
 * @throws Si une vraie erreur Supabase empêche la suppression.
 */
export async function deleteInstagramDataByUserId(userId: string): Promise<void> {
  const db = await getAdminDb()

  /* 1. Suppression dans instagram_connections */
  const { error } = await db
    .from('instagram_connections')
    .delete()
    .eq('instagram_user_id', userId)

  if (error) {
    throw new Error(`[dataDeletion] Suppression connexion échouée: ${error.message.slice(0, 80)}`)
  }

  /* 2. Suppression de l'historique de conversation Redis (best-effort) */
  try {
    await getRedis().del(`${CONV_KEY_PREFIX}:${userId}`)
  } catch {
    /* Non bloquant — la clé expire naturellement en 30 min au plus */
  }
}

/* ── Suivi des demandes de suppression ──────────────────────────── */

export interface DataDeletionRequest {
  id:                string
  confirmation_code: string
  status:            'processing' | 'completed' | 'failed'
  requested_at:      string
  completed_at:      string | null
  created_at:        string
}

/**
 * Enregistre une demande de suppression complétée.
 * Génère un code de confirmation UUID aléatoire.
 * N'enregistre aucun user_id — privacy by design.
 *
 * @returns Le code de confirmation généré.
 */
export async function recordDataDeletionCompleted(): Promise<string> {
  const db   = await getAdminDb()
  const code = randomUUID()
  const now  = new Date().toISOString()

  const { error } = await db
    .from('instagram_data_deletion_requests')
    .insert({
      confirmation_code: code,
      status:            'completed',
      requested_at:      now,
      completed_at:      now,
    })

  if (error) {
    throw new Error(`[dataDeletion] Enregistrement confirmation échoué: ${error.message.slice(0, 80)}`)
  }

  return code
}

/**
 * Recherche une demande de suppression par son code de confirmation.
 * Retourne null si le code est inconnu.
 */
export async function getDataDeletionByCode(
  confirmationCode: string,
): Promise<DataDeletionRequest | null> {
  const db = await getAdminDb()

  const { data, error } = await db
    .from('instagram_data_deletion_requests')
    .select('id, confirmation_code, status, requested_at, completed_at, created_at')
    .eq('confirmation_code', confirmationCode)
    .single()

  if (error || !data) return null
  return data as DataDeletionRequest
}
