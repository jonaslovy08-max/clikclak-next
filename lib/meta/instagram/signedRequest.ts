/*
  lib/meta/instagram/signedRequest.ts

  Wrapper serveur pour la validation du signed_request Meta.
  import "server-only" : interdit l'import depuis un Client Component.

  Lit META_INSTAGRAM_APP_SECRET depuis process.env et délègue à
  signedRequestCore.ts (module pur, testable).
*/

import 'server-only'
import { parseAndVerifySignedRequestWithSecret, type ParsedSignedRequest } from './signedRequestCore'

export type { ParsedSignedRequest }

/**
 * Parse et vérifie un signed_request Meta.
 * Lit le secret depuis META_INSTAGRAM_APP_SECRET.
 * @throws Si le secret est absent, ou si la signature est invalide.
 */
export function parseAndVerifySignedRequest(raw: string): ParsedSignedRequest {
  const secret = process.env.META_INSTAGRAM_APP_SECRET
  if (!secret) {
    throw new Error('[signedRequest] META_INSTAGRAM_APP_SECRET manquant.')
  }
  return parseAndVerifySignedRequestWithSecret(raw, secret)
}
