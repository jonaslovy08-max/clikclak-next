/*
  lib/contact/rateLimiter.ts

  Rate limiting Upstash Redis pour le formulaire de contact ClikClak.
  Namespace distinct du chatbot pour ne pas partager les quotas.

  Limites :
    5 soumissions par heure
    20 soumissions par 24 heures

  Redis ne reçoit que des identifiants HMAC anonymes.
  En cas de panne Redis → exception → la route retourne 503.
*/

import { Redis }     from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

let _redis: Redis | null = null
let _hour:  Ratelimit | null = null
let _day:   Ratelimit | null = null

function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

function getHourLimit(): Ratelimit {
  if (!_hour) _hour = new Ratelimit({
    redis:   getRedis(),
    limiter: Ratelimit.slidingWindow(5, '1 h'),
    prefix:  'clikclak:contact:hour',
  })
  return _hour
}

function getDayLimit(): Ratelimit {
  if (!_day) _day = new Ratelimit({
    redis:   getRedis(),
    limiter: Ratelimit.slidingWindow(20, '24 h'),
    prefix:  'clikclak:contact:day',
  })
  return _day
}

export type ContactRateLimitResult = {
  success:    boolean
  retryAfter: number  // secondes jusqu'à la prochaine fenêtre
}

/**
 * Vérifie les deux fenêtres glissantes (heure → jour).
 * Séquentiel : ne consomme pas de jeton jour si la limite heure est dépassée.
 * Lance une exception si Redis est indisponible — la route doit retourner 503.
 */
export async function checkContactRateLimit(identifier: string): Promise<ContactRateLimitResult> {
  const hour = await getHourLimit().limit(identifier)
  if (!hour.success) {
    return {
      success:    false,
      retryAfter: Math.max(1, Math.ceil((hour.reset - Date.now()) / 1000)),
    }
  }

  const day = await getDayLimit().limit(identifier)
  if (!day.success) {
    return {
      success:    false,
      retryAfter: Math.max(1, Math.ceil((day.reset - Date.now()) / 1000)),
    }
  }

  return { success: true, retryAfter: 0 }
}
