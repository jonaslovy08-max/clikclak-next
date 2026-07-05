/*
  lib/meta/instagram/oauthCore.ts

  Fonctions OAuth Instagram pures et testables.
  Ce module ne contient PAS import "server-only" afin de rester importable
  par les scripts de test tsx.

  IMPORTANT : n'importer jamais ce module depuis un Client Component.
  oauth.ts (avec import "server-only") est le wrapper à utiliser en production.

  API : Instagram API with Instagram Login
  Scopes : instagram_business_basic, instagram_business_manage_messages
*/

import { randomBytes } from 'node:crypto'

/* ── Types ───────────────────────────────────────────────────────── */

export interface ShortLivedTokenResponse {
  access_token: string
  token_type:   string
}

export interface LongLivedTokenResponse {
  access_token: string
  token_type:   string
  expires_in:   number
}

export interface InstagramProfile {
  id:                  string
  username:            string
  account_type?:       string
  profile_picture_url?: string
}

/* ── Variables d'environnement ───────────────────────────────────── */

function requireInstagramEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `[instagram:oauth] Variable d'environnement manquante : ${name}. ` +
      `Ne jamais afficher sa valeur dans les logs.`
    )
  }
  return value
}

export const DEFAULT_GRAPH_VERSION = 'v25.0'

export function graphVersion(): string {
  return process.env.META_GRAPH_API_VERSION ?? DEFAULT_GRAPH_VERSION
}

/* ── Scopes Instagram Login ──────────────────────────────────────── */

export const INSTAGRAM_SCOPES = [
  'instagram_business_basic',
  'instagram_business_manage_messages',
] as const

/* ── Génération du state et de l'URL d'autorisation ─────────────── */

export function generateOAuthState(): string {
  return randomBytes(32).toString('hex')
}

export function createInstagramAuthorizationUrl(state: string): string {
  const appId       = requireInstagramEnv('META_INSTAGRAM_APP_ID')
  const redirectUri = requireInstagramEnv('META_INSTAGRAM_OAUTH_REDIRECT_URI')

  const params = new URLSearchParams({
    client_id:     appId,
    redirect_uri:  redirectUri,
    scope:         INSTAGRAM_SCOPES.join(','),
    response_type: 'code',
    state,
  })

  return `https://api.instagram.com/oauth/authorize?${params.toString()}`
}

/* ── Échange code → short-lived token ───────────────────────────── */

export async function exchangeInstagramAuthorizationCode(
  code: string,
): Promise<ShortLivedTokenResponse> {
  const appId        = requireInstagramEnv('META_INSTAGRAM_APP_ID')
  const clientSecret = requireInstagramEnv('META_INSTAGRAM_CLIENT_SECRET')
  const redirectUri  = requireInstagramEnv('META_INSTAGRAM_OAUTH_REDIRECT_URI')

  const body = new URLSearchParams({
    client_id:     appId,
    client_secret: clientSecret,
    grant_type:    'authorization_code',
    redirect_uri:  redirectUri,
    code,
  })

  const res = await fetch('https://api.instagram.com/oauth/access_token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    body.toString(),
  })

  if (!res.ok) {
    const status = res.status
    let detail   = String(status)
    try {
      const d  = await res.json() as { error_message?: string; error_description?: string }
      detail   = d.error_description ?? d.error_message ?? String(status)
    } catch { /* ignore */ }
    throw new Error(`[instagram:oauth] Échange de code échoué (${status}): ${detail.slice(0, 120)}`)
  }

  const data = await res.json() as ShortLivedTokenResponse
  if (!data.access_token) throw new Error('[instagram:oauth] access_token absent dans la réponse.')
  return data
}

/* ── Échange short → long-lived token ───────────────────────────── */

export async function exchangeForLongLivedToken(
  shortToken: string,
): Promise<LongLivedTokenResponse> {
  const clientSecret = requireInstagramEnv('META_INSTAGRAM_CLIENT_SECRET')

  /* L'échange long-lived est un GET selon la spec Instagram.
     client_secret est obligatoire dans les query params (contrainte API Meta).
     La valeur ne doit pas apparaître dans les logs applicatifs.
     Note : les tokens longue durée expirent (~60 jours). Planifier le renouvellement. */
  const params = new URLSearchParams({
    grant_type:    'ig_exchange_token',
    client_secret: clientSecret,
    access_token:  shortToken,
  })

  const res = await fetch(`https://graph.instagram.com/access_token?${params.toString()}`)

  if (!res.ok) {
    const status = res.status
    let detail   = String(status)
    try {
      const d = await res.json() as { error?: { message?: string } }
      detail   = d.error?.message ?? String(status)
    } catch { /* ignore */ }
    throw new Error(`[instagram:oauth] Échange long-lived échoué (${status}): ${detail.slice(0, 120)}`)
  }

  const data = await res.json() as LongLivedTokenResponse
  if (!data.access_token) throw new Error('[instagram:oauth] access_token absent dans la réponse long-lived.')
  return data
}

/* ── Profil Instagram ────────────────────────────────────────────── */

export async function fetchInstagramProfessionalProfile(
  accessToken: string,
): Promise<InstagramProfile> {
  const version = graphVersion()
  /* Utiliser Authorization header — jamais le token dans l'URL (évite les logs proxy) */
  const url = `https://graph.instagram.com/${version}/me?fields=id,username,account_type,profile_picture_url`

  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    const status = res.status
    let detail   = String(status)
    try {
      const d = await res.json() as { error?: { message?: string } }
      detail   = d.error?.message ?? String(status)
    } catch { /* ignore */ }
    throw new Error(`[instagram:oauth] Récupération profil échouée (${status}): ${detail.slice(0, 120)}`)
  }

  const data = await res.json() as {
    id?: string; user_id?: string; username?: string;
    account_type?: string; profile_picture_url?: string
  }

  const id = data.id ?? data.user_id
  if (!id)           throw new Error('[instagram:oauth] Identifiant de compte absent.')
  if (!data.username) throw new Error('[instagram:oauth] username absent.')

  return {
    id,
    username:            data.username,
    account_type:        data.account_type,
    profile_picture_url: data.profile_picture_url,
  }
}

/* ── Abonnement webhook ──────────────────────────────────────────── */

export async function subscribeInstagramAccountToMessages(
  instagramUserId: string,
  accessToken:     string,
): Promise<boolean> {
  const version = graphVersion()
  const url     = `https://graph.instagram.com/${version}/${instagramUserId}/subscribed_apps`

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/x-www-form-urlencoded',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: 'subscribed_fields=messages',
  })

  if (!res.ok) {
    const status = res.status
    let detail   = String(status)
    try {
      const d = await res.json() as { error?: { message?: string } }
      detail   = d.error?.message ?? String(status)
    } catch { /* ignore */ }
    console.error('[instagram:oauth] Abonnement webhook échoué', { status, detail: detail.slice(0, 80) })
    return false
  }

  const data = await res.json() as { success?: boolean }
  return data.success === true
}

export async function unsubscribeInstagramAccount(
  instagramUserId: string,
  accessToken:     string,
): Promise<boolean> {
  const version = graphVersion()
  const url     = `https://graph.instagram.com/${version}/${instagramUserId}/subscribed_apps`

  const res = await fetch(url, {
    method:  'DELETE',
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!res.ok) {
    console.error('[instagram:oauth] Désabonnement webhook échoué', { status: res.status })
    return false
  }

  const data = await res.json() as { success?: boolean }
  return data.success === true
}
