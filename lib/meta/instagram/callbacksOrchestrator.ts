/*
  lib/meta/instagram/callbacksOrchestrator.ts

  Orchestrateurs purs pour les callbacks Meta de désautorisation et
  de suppression des données.
  SANS import "server-only" : importables par les scripts de test tsx.

  Les routes (deauthorize/route.ts et data-deletion/route.ts) sont des
  wrappers minces qui fournissent les dépendances réelles.
*/

import { parseAndVerifySignedRequestWithSecret } from './signedRequestCore'

/* ── Types ────────────────────────────────────────────────────────── */

export interface CallbackResponse {
  status: number
  body:   unknown
}

export interface DeauthorizeDeps {
  /** Lire META_INSTAGRAM_APP_SECRET depuis l'environnement. */
  getAppSecret: () => string | undefined
  /** Supprimer toutes les données Instagram pour un user_id. */
  deleteUserData: (userId: string) => Promise<void>
}

export interface DataDeletionDeps {
  getAppSecret:  () => string | undefined
  deleteUserData: (userId: string) => Promise<void>
  /** Créer un enregistrement de demande complétée. Retourne le code UUID. */
  recordCompleted: () => Promise<string>
  /** URL de base du site (sans trailing slash). */
  siteUrl: string
}

/* ── Extraction du signed_request depuis le corps ─────────────────── */

export function extractSignedRequest(
  rawBody:     string,
  contentType: string,
): string | null {
  const ct = contentType.toLowerCase()

  if (ct.includes('application/x-www-form-urlencoded')) {
    return new URLSearchParams(rawBody).get('signed_request')
  }

  if (ct.includes('application/json')) {
    try {
      const parsed = JSON.parse(rawBody) as { signed_request?: string }
      return parsed.signed_request ?? null
    } catch {
      return null
    }
  }

  /* Fallback : tenter form-urlencoded sans Content-Type explicite */
  return new URLSearchParams(rawBody).get('signed_request')
}

/* ── Orchestrateur de désautorisation ─────────────────────────────── */

/**
 * Orchestre le traitement du callback de désautorisation Instagram.
 * Retourne un objet { status, body } que la route transforme en Response.
 */
export async function handleDeauthorizeCallback(
  rawBody:     string,
  contentType: string,
  deps:        DeauthorizeDeps,
): Promise<CallbackResponse> {
  /* 1. Extraction du signed_request */
  const signedRequestRaw = extractSignedRequest(rawBody, contentType)
  if (!signedRequestRaw) {
    return { status: 400, body: { error: 'signed_request manquant.' } }
  }

  /* 2. Validation de la signature */
  const secret = deps.getAppSecret()
  if (!secret) {
    return { status: 500, body: { error: 'Configuration serveur incomplète.' } }
  }

  let userId: string
  try {
    const parsed = parseAndVerifySignedRequestWithSecret(signedRequestRaw, secret)
    userId = parsed.user_id
  } catch (err) {
    const isAlgo = err instanceof Error && err.message.includes('Algorithme')
    return {
      status: isAlgo ? 400 : 401,
      body:   { error: 'Signature invalide.' },
    }
  }

  /* 3. Suppression des données */
  try {
    await deps.deleteUserData(userId)
  } catch {
    return { status: 500, body: { error: 'Erreur interne.' } }
  }

  /* 4. Réponse sans révéler l'existence ou non de la connexion */
  return { status: 200, body: { success: true } }
}

/* ── Orchestrateur de suppression des données ─────────────────────── */

/**
 * Orchestre le traitement du callback de suppression des données.
 * Ordre garanti : suppression → enregistrement → réponse.
 */
export async function handleDataDeletionCallback(
  rawBody:     string,
  contentType: string,
  deps:        DataDeletionDeps,
): Promise<CallbackResponse> {
  /* 1. Extraction et validation */
  const signedRequestRaw = extractSignedRequest(rawBody, contentType)
  if (!signedRequestRaw) {
    return { status: 400, body: { error: 'signed_request manquant.' } }
  }

  const secret = deps.getAppSecret()
  if (!secret) {
    return { status: 500, body: { error: 'Configuration serveur incomplète.' } }
  }

  let userId: string
  try {
    userId = parseAndVerifySignedRequestWithSecret(signedRequestRaw, secret).user_id
  } catch {
    return { status: 401, body: { error: 'Signature invalide.' } }
  }

  /* 2. Suppression — pas de confirmation si échec */
  try {
    await deps.deleteUserData(userId)
  } catch {
    return { status: 500, body: { error: 'Erreur interne — réessayer.' } }
  }

  /* 3. Enregistrement de la confirmation */
  let confirmationCode: string
  try {
    confirmationCode = await deps.recordCompleted()
  } catch {
    return { status: 500, body: { error: 'Erreur interne — réessayer.' } }
  }

  /* 4. Réponse Meta */
  const statusUrl = `${deps.siteUrl}/suppression-donnees?confirmation=${encodeURIComponent(confirmationCode)}`

  return {
    status: 200,
    body:   { url: statusUrl, confirmation_code: confirmationCode },
  }
}
