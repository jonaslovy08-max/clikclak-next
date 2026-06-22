/*
  lib/chatbot/rateLimiter.ts

  Rate limiting Upstash Redis pour le chatbot ClikClak.
  Trois fenêtres glissantes indépendantes : minute, heure, jour.
  Blocage temporaire après violations répétées.

  Redis reçoit uniquement des identifiants HMAC anonymes.
  Aucune donnée personnelle n'est stockée.
*/

import { Redis }      from '@upstash/redis'
import { Ratelimit }  from '@upstash/ratelimit'
import { CHATBOT_LIMITS } from './config'

/* ── Initialisation Redis ───────────────────────────────────────── */

let _redis: Redis | null = null

function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

/* ── Limiteurs par fenêtre ──────────────────────────────────────── */

let _minute: Ratelimit | null = null
let _hour:   Ratelimit | null = null
let _day:    Ratelimit | null = null

function getMinuteLimit(): Ratelimit {
  if (!_minute) _minute = new Ratelimit({
    redis:   getRedis(),
    limiter: Ratelimit.slidingWindow(CHATBOT_LIMITS.perMinute, '1 m'),
    prefix:  'clikclak:chatbot:minute',
  })
  return _minute
}

function getHourLimit(): Ratelimit {
  if (!_hour) _hour = new Ratelimit({
    redis:   getRedis(),
    limiter: Ratelimit.slidingWindow(CHATBOT_LIMITS.perHour, '1 h'),
    prefix:  'clikclak:chatbot:hour',
  })
  return _hour
}

function getDayLimit(): Ratelimit {
  if (!_day) _day = new Ratelimit({
    redis:   getRedis(),
    limiter: Ratelimit.slidingWindow(CHATBOT_LIMITS.perDay, '24 h'),
    prefix:  'clikclak:chatbot:day',
  })
  return _day
}

/* ── Type résultat ──────────────────────────────────────────────── */

export type ChatbotRateLimitResult = {
  success:   boolean
  remaining: number
  reset:     number           // timestamp ms
  limitType: 'minute' | 'hour' | 'day' | null
}

/* ── Vérification rate limit ────────────────────────────────────── */

/**
 * Vérifie les trois fenêtres glissantes dans l'ordre (minute → heure → jour).
 * Une requête bloquée par la fenêtre minute ne consomme pas de jeton heure/jour.
 * Lance une exception si Redis est indisponible — la route doit retourner 503.
 */
export async function checkRateLimit(identifier: string): Promise<ChatbotRateLimitResult> {
  /* Fenêtre minute */
  const min = await getMinuteLimit().limit(identifier)
  if (!min.success) {
    return { success: false, remaining: min.remaining, reset: min.reset, limitType: 'minute' }
  }

  /* Fenêtre heure */
  const hr = await getHourLimit().limit(identifier)
  if (!hr.success) {
    return { success: false, remaining: hr.remaining, reset: hr.reset, limitType: 'hour' }
  }

  /* Fenêtre jour */
  const day = await getDayLimit().limit(identifier)
  if (!day.success) {
    return { success: false, remaining: day.remaining, reset: day.reset, limitType: 'day' }
  }

  return {
    success:   true,
    remaining: Math.min(min.remaining, hr.remaining, day.remaining),
    reset:     min.reset,
    limitType: null,
  }
}

/* ── Blocage temporaire ─────────────────────────────────────────── */

const BLOCK_KEY_PREFIX     = 'clikclak:chatbot:blocked'
const VIOLATION_KEY_PREFIX = 'clikclak:chatbot:violations'

/**
 * Retourne true si l'identifiant est temporairement bloqué.
 * Lance une exception si Redis est indisponible.
 */
export async function isTemporarilyBlocked(identifier: string): Promise<boolean> {
  const val = await getRedis().get(`${BLOCK_KEY_PREFIX}:${identifier}`)
  return val !== null
}

/**
 * Enregistre une violation manifeste (injection de prompt détectée).
 * Après maxViolations violations, bloque l'identifiant pendant blockDurationSeconds.
 * Fire-and-forget : les erreurs sont loggées mais ne bloquent pas la réponse.
 */
export async function registerViolation(identifier: string): Promise<void> {
  const redis    = getRedis()
  const violKey  = `${VIOLATION_KEY_PREFIX}:${identifier}`

  const count = await redis.incr(violKey)

  /* Expiration automatique sur la première violation */
  if (count === 1) {
    await redis.expire(violKey, CHATBOT_LIMITS.blockDurationSeconds)
  }

  /* Blocage après N violations */
  if (count >= CHATBOT_LIMITS.maxViolations) {
    await redis.set(
      `${BLOCK_KEY_PREFIX}:${identifier}`,
      '1',
      { ex: CHATBOT_LIMITS.blockDurationSeconds },
    )
  }
}
