/*
  lib/meta/instagram/signedRequest.ts

  Wrapper serveur pour la validation du signed_request Meta.
  import "server-only" : interdit l'import depuis un Client Component.

  Utilise une liste fermée de deux secrets approuvés (dans cet ordre) :
    1. META_INSTAGRAM_CLIENT_SECRET — secret Instagram associé à l'App ID
    2. META_INSTAGRAM_APP_SECRET    — secret général Meta (compatibilité)

  Délègue la validation cryptographique à signedRequestCore.ts (module pur).
*/

import 'server-only'
import {
  parseAndVerifySignedRequestWithSecrets,
  type ParsedSignedRequest,
} from './signedRequestCore'

export type { ParsedSignedRequest }

/**
 * Parse et vérifie un signed_request Meta.
 * Essaie META_INSTAGRAM_CLIENT_SECRET puis META_INSTAGRAM_APP_SECRET.
 * @throws Si aucun secret n'est disponible ou si la signature est invalide.
 */
export function parseAndVerifySignedRequest(raw: string): ParsedSignedRequest {
  const secrets = [
    process.env.META_INSTAGRAM_CLIENT_SECRET,
    process.env.META_INSTAGRAM_APP_SECRET,
  ].filter((s): s is string => Boolean(s))

  if (secrets.length === 0) {
    throw new Error('[signedRequest] Aucun secret Instagram disponible (META_INSTAGRAM_CLIENT_SECRET / META_INSTAGRAM_APP_SECRET).')
  }

  return parseAndVerifySignedRequestWithSecrets(raw, secrets)
}
