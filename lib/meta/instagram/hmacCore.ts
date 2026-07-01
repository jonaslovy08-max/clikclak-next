/*
  lib/meta/instagram/hmacCore.ts

  Primitives cryptographiques HMAC-SHA256 pures et testables.
  SANS import "server-only" : importable par les scripts de test tsx.

  Fonctionnalités :
  - calcul HMAC-SHA256 sur Buffer ou string ;
  - décodage et validation d'une signature hexadécimale (format X-Hub-Signature-256) ;
  - comparaison en temps constant (timingSafeEqual) ;
  - vérification d'une signature hex contre une liste ordonnée de secrets approuvés.

  Ce module ne lit JAMAIS process.env.
  Ne jamais inclure un secret dans un log ou une erreur.
  Ne jamais accepter une liste de secrets vide.
*/

import { createHmac, timingSafeEqual } from 'node:crypto'

/* ── Calcul HMAC-SHA256 ──────────────────────────────────────────── */

/**
 * Calcule HMAC-SHA256 et retourne le digest brut (Buffer de 32 octets).
 */
export function computeHmacSha256(
  message: Buffer | string,
  secret:  string,
): Buffer {
  return createHmac('sha256', secret).update(message).digest()
}

/* ── Décodage de signature hexadécimale ─────────────────────────── */

/**
 * Décode une signature hexadécimale (64 chars, SHA-256) en Buffer.
 * Retourne null si vide, malformée ou d'une longueur incorrecte.
 */
export function decodeHexSignature(hex: string): Buffer | null {
  if (!hex || !/^[a-f0-9]{64}$/i.test(hex)) return null
  return Buffer.from(hex, 'hex')
}

/* ── Comparaison en temps constant ──────────────────────────────── */

/**
 * Compare deux Buffers en temps constant.
 * Retourne false si les longueurs diffèrent (sans lever d'exception).
 */
export function safeEqual(a: Buffer, b: Buffer): boolean {
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/* ── Vérification multi-secrets pour les webhooks X-Hub-Signature-256 */

/**
 * Vérifie une signature HMAC-SHA256 (format hex) contre une liste ordonnée
 * de secrets approuvés. Déduplique les secrets identiques.
 *
 * @param message  Corps brut de la requête (Buffer ou string).
 * @param hexSig   Valeur hexadécimale de la signature (sans le préfixe "sha256=").
 * @param secrets  Liste ordonnée de secrets à essayer.
 *
 * @returns Index du premier secret correspondant (0-based), ou null si aucun.
 *
 * @throws {Error} Si la liste de secrets est vide après déduplication.
 */
export function verifyHmacAgainstSecrets(
  message: Buffer | string,
  hexSig:  string,
  secrets: string[],
): number | null {
  /* Déduplication : conserver l'ordre, ignorer les doublons */
  const seen:   Set<string> = new Set()
  const unique: string[]    = []
  for (const s of secrets) {
    if (s && !seen.has(s)) { seen.add(s); unique.push(s) }
  }

  if (unique.length === 0) {
    throw new Error('[hmacCore] Aucun secret approuvé disponible.')
  }

  const received = decodeHexSignature(hexSig)
  if (!received) return null

  for (let i = 0; i < unique.length; i++) {
    const expected = computeHmacSha256(message, unique[i])
    if (safeEqual(received, expected)) return i
  }

  return null
}
