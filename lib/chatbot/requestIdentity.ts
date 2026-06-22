/*
  lib/chatbot/requestIdentity.ts

  Construit un identifiant anonyme et opaque pour le rate limiting.
  Ne conserve ni ne retourne jamais l'IP brute, le User-Agent brut,
  ni aucune donnée personnelle.

  Redis ne reçoit que le hash HMAC-SHA256.
*/

import { createHmac } from 'crypto'
import type { NextRequest } from 'next/server'

/**
 * Retourne un identifiant HMAC-SHA256 anonyme du visiteur.
 * Retourne null si CHATBOT_RATE_LIMIT_SALT est absent — dans ce cas
 * la route doit retourner 503 sans appeler Anthropic.
 */
export function getVisitorIdentity(req: NextRequest): string | null {
  const salt = process.env.CHATBOT_RATE_LIMIT_SALT
  if (!salt || salt.length < 16) return null

  /* Extraction IP — première valeur de x-forwarded-for (Vercel/proxy) */
  const xff   = req.headers.get('x-forwarded-for') ?? ''
  const xri   = req.headers.get('x-real-ip') ?? ''
  const rawIp = xff.split(',')[0]?.trim() || xri.trim() || 'unknown'

  /* User-Agent tronqué — jamais loggé, uniquement hashé */
  const rawUa = (req.headers.get('user-agent') ?? '').slice(0, 256)

  const payload = `${rawIp}|${rawUa}`

  return createHmac('sha256', salt).update(payload).digest('hex')
}
