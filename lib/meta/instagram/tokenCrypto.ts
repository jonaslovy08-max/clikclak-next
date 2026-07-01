/*
  lib/meta/instagram/tokenCrypto.ts

  Wrapper serveur pour les primitives crypto.
  import "server-only" : ne peut PAS être importé depuis un Client Component.

  Le code de production importe depuis ce fichier.
  Les tests tsx importent depuis tokenCryptoCore.ts (module pur sans server-only).
*/

import 'server-only'

export { encryptToken, decryptToken } from './tokenCryptoCore'
