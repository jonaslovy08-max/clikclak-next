/*
  lib/meta/instagram/conversation.ts

  Gestion du contexte de conversation Instagram via Upstash Redis.
  Réutilise le même client Redis que le chatbot (Redis.fromEnv()).

  Fonctionnalités :
  1. Dédoublonnage fiable par message.mid (trois états : claim → done | release)
  2. Historique court par sender.id (max 8 messages utilisateur, TTL 30 min)

  Aucune donnée personnelle n'est stockée — uniquement les textes des
  messages nécessaires à la résolution tarifaire.

  ─────────────────────────────────────────────────────────────────────────
  Protocole de dédoublonnage à trois états
  ─────────────────────────────────────────────────────────────────────────

  Clés Redis :
    meta:instagram:message:{mid}:lock   verrou temporaire (2 min, NX)
    meta:instagram:message:{mid}:done   marqueur de succès définitif (24 h)

  Flux nominal :
    1. claimInstagramMessage(mid)         → true  (verrou acquis, message nouveau)
    2. [résolution tarifaire + envoi]
    3. Si envoi réussi :
         markInstagramMessageProcessed(mid) → enregistre :done, supprime :lock
       Si envoi échoue :
         releaseInstagramMessageClaim(mid)  → supprime :lock (retry autorisé)

  Cas ignorés (claimInstagramMessage → false) :
    - :done présent  → déjà traité avec succès (ne pas réémettre)
    - :lock présent  → traitement concurrent en cours (une seule exécution)
*/

import { Redis } from '@upstash/redis'

/* ── Client Redis (singleton lazy) ───────────────────────────── */

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

/* ── Clés de dédoublonnage ────────────────────────────────────── */

const MSG_PREFIX     = 'meta:instagram:message'
const LOCK_TTL_SECS  = 2 * 60        // 2 minutes — temps max de traitement
const DONE_TTL_SECS  = 24 * 60 * 60  // 24 heures — fenêtre de protection doublon

function lockKey(mid: string): string { return `${MSG_PREFIX}:${mid}:lock` }
function doneKey(mid: string): string { return `${MSG_PREFIX}:${mid}:done` }

/**
 * Tente de revendiquer le traitement d'un message.
 *
 * Retourne true si le traitement peut commencer (verrou acquis).
 * Retourne false si :done existe déjà (succès antérieur) ou si :lock
 * existe déjà (traitement concurrent en cours).
 *
 * Lance une exception si Redis est indisponible — l'appelant doit
 * considérer ce cas comme un échec et ne pas traiter le message.
 */
export async function claimInstagramMessage(mid: string): Promise<boolean> {
  const redis = getRedis()

  /* Vérifier d'abord si le traitement est déjà terminé avec succès */
  const done = await redis.get(doneKey(mid))
  if (done !== null) return false

  /* Tenter d'acquérir le verrou (NX = uniquement si absent) */
  const result = await redis.set(lockKey(mid), '1', { nx: true, ex: LOCK_TTL_SECS })
  return result !== null
}

/**
 * Marque le message comme traité avec succès.
 * Enregistre la clé :done (TTL 24h) et supprime le verrou temporaire.
 * La suppression du verrou est best-effort : en cas d'échec, le TTL de
 * 2 minutes garantit l'expiration automatique.
 */
export async function markInstagramMessageProcessed(mid: string): Promise<void> {
  const redis = getRedis()
  await redis.set(doneKey(mid), '1', { ex: DONE_TTL_SECS })
  try {
    await redis.del(lockKey(mid))
  } catch {
    /* Le verrou expirera seul dans au plus 2 min */
  }
}

/**
 * Libère le verrou en cas d'échec d'envoi.
 * Permet une nouvelle tentative lors de la prochaine livraison du payload.
 * Best-effort : si Redis est indisponible, le verrou expire dans 2 min.
 */
export async function releaseInstagramMessageClaim(mid: string): Promise<void> {
  try {
    await getRedis().del(lockKey(mid))
  } catch {
    /* expiration automatique dans 2 min */
  }
}

/* ── Contexte de conversation ──────────────────────────────────── */

const CONV_KEY_PREFIX   = 'meta:instagram:conversation'
const CONV_TTL_SECONDS  = 30 * 60 // 30 minutes
const MAX_USER_MESSAGES = 8

/**
 * Texte d'un message utilisateur, stocké pour la résolution multi-tour.
 * On conserve uniquement les messages "user" — la réponse du bot n'est
 * pas utile au résolveur tarifaire et n'est pas stockée.
 */
export interface StoredUserMessage {
  text:      string
  timestamp: number
}

/**
 * Charge l'historique des messages utilisateur pour un sender.
 * Retourne un tableau vide si aucun historique n'existe.
 */
export async function loadConversation(senderId: string): Promise<StoredUserMessage[]> {
  const redis = getRedis()
  const key   = `${CONV_KEY_PREFIX}:${senderId}`
  const raw   = await redis.get<StoredUserMessage[]>(key)
  return Array.isArray(raw) ? raw : []
}

/**
 * Sauvegarde l'historique enrichi d'un nouveau message utilisateur.
 * Conserve les MAX_USER_MESSAGES messages les plus récents.
 * Rafraîchit le TTL à chaque interaction.
 */
export async function appendAndSaveConversation(
  senderId: string,
  history:  StoredUserMessage[],
  newText:  string,
): Promise<void> {
  const redis = getRedis()
  const key   = `${CONV_KEY_PREFIX}:${senderId}`

  const updated: StoredUserMessage[] = [
    ...history,
    { text: newText, timestamp: Date.now() },
  ].slice(-MAX_USER_MESSAGES)

  await redis.set(key, updated, { ex: CONV_TTL_SECONDS })
}

/**
 * Construit une chaîne de texte combinant les N messages récents.
 * Utilisée par le résolveur pour la résolution multi-tour.
 */
export function buildRecentContext(
  history:     StoredUserMessage[],
  currentText: string,
  maxMessages  = 5,
): string {
  const recentTexts = history
    .slice(-maxMessages)
    .map(m => m.text)
  return [...recentTexts, currentText].join(' ')
}
