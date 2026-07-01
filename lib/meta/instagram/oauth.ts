/*
  lib/meta/instagram/oauth.ts

  Wrapper serveur pour les fonctions OAuth Instagram.
  import "server-only" : interdit l'import depuis un Client Component.

  Le code de production importe depuis ce fichier.
  Les tests tsx importent depuis oauthCore.ts (module pur sans server-only).
*/

import 'server-only'

export {
  generateOAuthState,
  createInstagramAuthorizationUrl,
  exchangeInstagramAuthorizationCode,
  exchangeForLongLivedToken,
  fetchInstagramProfessionalProfile,
  subscribeInstagramAccountToMessages,
  unsubscribeInstagramAccount,
  INSTAGRAM_SCOPES,
  graphVersion,
  DEFAULT_GRAPH_VERSION,
  type ShortLivedTokenResponse,
  type LongLivedTokenResponse,
  type InstagramProfile,
} from './oauthCore'
