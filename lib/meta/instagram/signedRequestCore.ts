/*
  lib/meta/instagram/signedRequestCore.ts

  Validation du signed_request Meta — module pur et testable.
  SANS import "server-only" : importable par les scripts de test tsx.

  IMPORTANT : n'importer jamais depuis un Client Component.
  signedRequest.ts (avec server-only) est le point d'entrée de production.

  Format signed_request :
    {base64url_signature}.{base64url_payload}
  Signature = HMAC-SHA256(payload_base64url_string, secret)
  Payload   = JSON({ algorithm?, user_id, issued_at? })

  Note : ce format (base64url) est distinct du format webhook (hex).
  Ne pas mélanger les deux chemins de validation.
*/

import { computeHmacSha256, safeEqual } from './hmacCore'

export interface ParsedSignedRequest {
  user_id: string
}

/* ── Décodage Base64 URL-safe ────────────────────────────────────── */

/** Décode une chaîne Base64 URL-safe en Buffer. */
export function base64UrlDecode(str: string): Buffer {
  const padLen = (4 - (str.length % 4)) % 4
  const padded = str + '='.repeat(padLen)
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

/* ── Parsing du format {sig}.{payload} ───────────────────────────── */

interface SignedRequestParts {
  signatureB64: string
  payloadB64:   string
}

function parseSignedRequestStructure(raw: string): SignedRequestParts {
  if (!raw || typeof raw !== 'string') {
    throw new Error('[signedRequest] Valeur signed_request absente ou invalide.')
  }

  const dotIndex = raw.indexOf('.')
  if (dotIndex < 1 || dotIndex === raw.length - 1) {
    throw new Error('[signedRequest] Format invalide : séparateur absent.')
  }

  return {
    signatureB64: raw.slice(0, dotIndex),
    payloadB64:   raw.slice(dotIndex + 1),
  }
}

interface SignedRequestPayload {
  algorithm?: string
  user_id?:   unknown
}

function parseSignedRequestPayload(payloadB64: string): SignedRequestPayload {
  try {
    return JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as SignedRequestPayload
  } catch {
    throw new Error('[signedRequest] Payload invalide : décodage ou parsing JSON échoué.')
  }
}

function validateAlgorithm(payload: SignedRequestPayload): void {
  if (payload.algorithm !== undefined && payload.algorithm !== 'HMAC-SHA256') {
    throw new Error('[signedRequest] Algorithme non supporté.')
  }
}

function validateUserId(payload: SignedRequestPayload): string {
  if (!payload.user_id || typeof payload.user_id !== 'string' || !payload.user_id.trim()) {
    throw new Error('[signedRequest] Payload invalide : user_id absent ou vide.')
  }
  return payload.user_id.trim()
}

/* ── Validation HMAC (base64url) ─────────────────────────────────── */

function verifySingleSecret(
  signatureB64: string,
  payloadB64:   string,
  secret:       string,
): boolean {
  const expected = computeHmacSha256(payloadB64, secret)

  let received: Buffer
  try {
    received = base64UrlDecode(signatureB64)
  } catch {
    return false
  }

  return safeEqual(received, expected)
}

/* ── API publique ────────────────────────────────────────────────── */

/**
 * Parse et vérifie un signed_request avec un unique secret.
 * Conservé pour la compatibilité avec le code existant.
 */
export function parseAndVerifySignedRequestWithSecret(
  raw:    string,
  secret: string,
): ParsedSignedRequest {
  return parseAndVerifySignedRequestWithSecrets(raw, [secret])
}

/**
 * Parse et vérifie un signed_request contre une liste ordonnée de secrets.
 *
 * Étapes :
 *  1. Valider la structure {sig}.{payload} → échec immédiat si malformé.
 *  2. Décoder et parser le JSON → échec immédiat si invalide.
 *  3. Vérifier algorithm === "HMAC-SHA256" si présent → échec immédiat si autre.
 *  4. Essayer chaque secret dans l'ordre (HMAC sur payloadB64 en base64url).
 *  5. Valider user_id dans le payload du premier secret correspondant.
 *
 * Le secret lui-même n'apparaît jamais dans les erreurs.
 */
export function parseAndVerifySignedRequestWithSecrets(
  raw:     string,
  secrets: string[],
): ParsedSignedRequest {
  const { signatureB64, payloadB64 } = parseSignedRequestStructure(raw)
  const payload                       = parseSignedRequestPayload(payloadB64)

  validateAlgorithm(payload)

  /* Déduplication des secrets */
  const seen:   Set<string> = new Set()
  const unique: string[]    = []
  for (const s of secrets) {
    if (s && !seen.has(s)) { seen.add(s); unique.push(s) }
  }

  if (unique.length === 0) {
    throw new Error('[signedRequest] Aucun secret approuvé disponible.')
  }

  for (const secret of unique) {
    if (verifySingleSecret(signatureB64, payloadB64, secret)) {
      const userId = validateUserId(payload)
      return { user_id: userId }
    }
  }

  throw new Error('[signedRequest] Signature invalide.')
}
