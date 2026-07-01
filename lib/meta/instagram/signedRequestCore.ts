/*
  lib/meta/instagram/signedRequestCore.ts

  Validation du signed_request Meta — module pur et testable.
  SANS import "server-only" : importable par les scripts de test tsx.

  IMPORTANT : n'importer jamais depuis un Client Component.
  signedRequest.ts (avec server-only) est le point d'entrée de production.

  Format signed_request :
    {base64url_signature}.{base64url_payload}
  Signature = HMAC-SHA256(payload_base64url_string, APP_SECRET)
  Payload   = JSON({ algorithm?, user_id, issued_at? })
*/

import { createHmac, timingSafeEqual } from 'node:crypto'

export interface ParsedSignedRequest {
  user_id: string
}

/** Décode une chaîne Base64 URL-safe en Buffer. */
export function base64UrlDecode(str: string): Buffer {
  const padLen = (4 - (str.length % 4)) % 4
  const padded = str + '='.repeat(padLen)
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

/**
 * Parse et vérifie un signed_request Meta en prenant le secret en paramètre.
 * @param raw    Valeur brute du champ signed_request.
 * @param secret APP_SECRET de l'application Meta.
 */
export function parseAndVerifySignedRequestWithSecret(
  raw:    string,
  secret: string,
): ParsedSignedRequest {
  if (!raw || typeof raw !== 'string') {
    throw new Error('[signedRequest] Valeur signed_request absente ou invalide.')
  }

  const dotIndex = raw.indexOf('.')
  if (dotIndex < 1 || dotIndex === raw.length - 1) {
    throw new Error('[signedRequest] Format invalide : séparateur absent.')
  }

  const signatureB64 = raw.slice(0, dotIndex)
  const payloadB64   = raw.slice(dotIndex + 1)

  /* Décoder et parser le payload */
  let payload: { algorithm?: string; user_id?: unknown }
  try {
    payload = JSON.parse(base64UrlDecode(payloadB64).toString('utf8')) as typeof payload
  } catch {
    throw new Error('[signedRequest] Payload invalide : décodage ou parsing JSON échoué.')
  }

  /* Vérification de l'algorithme */
  if (payload.algorithm !== undefined && payload.algorithm !== 'HMAC-SHA256') {
    throw new Error('[signedRequest] Algorithme non supporté.')
  }

  /* HMAC calculé sur la chaîne payloadB64 (pas sur le JSON décodé) */
  const expectedSig = createHmac('sha256', secret).update(payloadB64).digest()

  let receivedSig: Buffer
  try {
    receivedSig = base64UrlDecode(signatureB64)
  } catch {
    throw new Error('[signedRequest] Signature invalide : décodage base64 échoué.')
  }

  /* Comparaison en temps constant */
  if (
    receivedSig.length !== expectedSig.length ||
    !timingSafeEqual(receivedSig, expectedSig)
  ) {
    throw new Error('[signedRequest] Signature invalide.')
  }

  /* Validation user_id */
  if (!payload.user_id || typeof payload.user_id !== 'string' || !payload.user_id.trim()) {
    throw new Error('[signedRequest] Payload invalide : user_id absent ou vide.')
  }

  return { user_id: payload.user_id.trim() }
}
