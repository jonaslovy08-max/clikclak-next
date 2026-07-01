/*
  lib/meta/instagram/tokenCryptoCore.ts

  Primitives cryptographiques AES-256-GCM pures et testables.
  Ce module ne contient PAS import "server-only" afin de rester importable
  par les scripts de test tsx.

  IMPORTANT : n'importer jamais ce module depuis un Client Component.
  Le module de production tokenCrypto.ts (avec import "server-only") en est
  le wrapper à utiliser depuis le code applicatif.

  Format du payload chiffré :
    v1:{iv_hex}:{ciphertext_hex}:{authTag_hex}
*/

import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

const ALGORITHM   = 'aes-256-gcm' as const
const IV_BYTES    = 12
const TAG_BYTES   = 16
const VERSION_TAG = 'v1'

/* ── Gestion de la clé ──────────────────────────────────────────── */

let _key: Buffer | null = null

function getEncryptionKey(): Buffer {
  if (_key) return _key

  const b64 = process.env.META_INSTAGRAM_TOKEN_ENCRYPTION_KEY
  if (!b64) throw new Error('[tokenCrypto] META_INSTAGRAM_TOKEN_ENCRYPTION_KEY manquante.')

  const key = Buffer.from(b64, 'base64')
  if (key.length !== 32) {
    throw new Error(
      `[tokenCrypto] META_INSTAGRAM_TOKEN_ENCRYPTION_KEY invalide : ` +
      `${key.length} octets reçus, 32 requis.`
    )
  }

  _key = key
  return _key
}

/* ── Chiffrement ─────────────────────────────────────────────────── */

export function encryptToken(plaintext: string): string {
  if (!plaintext) throw new Error('[tokenCrypto] Le token à chiffrer ne peut pas être vide.')

  const key    = getEncryptionKey()
  const iv     = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES })
  const ct     = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag    = cipher.getAuthTag()

  return `${VERSION_TAG}:${iv.toString('hex')}:${ct.toString('hex')}:${tag.toString('hex')}`
}

/* ── Déchiffrement ───────────────────────────────────────────────── */

export function decryptToken(payload: string): string {
  if (!payload || !payload.startsWith(`${VERSION_TAG}:`)) {
    throw new Error('[tokenCrypto] Payload invalide : version inconnue.')
  }

  const parts = payload.split(':')
  if (parts.length !== 4) throw new Error('[tokenCrypto] Payload invalide : segments incorrects.')

  const [, ivHex, ctHex, tagHex] = parts
  let iv: Buffer, ct: Buffer, tag: Buffer
  try {
    iv  = Buffer.from(ivHex,  'hex')
    ct  = Buffer.from(ctHex,  'hex')
    tag = Buffer.from(tagHex, 'hex')
  } catch {
    throw new Error('[tokenCrypto] Payload invalide : encodage hexadécimal incorrect.')
  }

  if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) {
    throw new Error('[tokenCrypto] Payload invalide : longueur IV ou tag incorrecte.')
  }

  const key = getEncryptionKey()
  try {
    const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_BYTES })
    decipher.setAuthTag(tag)
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8')
  } catch {
    throw new Error('[tokenCrypto] Déchiffrement échoué : clé incorrecte ou payload altéré.')
  }
}

/* ── Réinitialisation de la clé (tests uniquement) ──────────────── */

export function _resetKeyForTests(): void {
  _key = null
}
