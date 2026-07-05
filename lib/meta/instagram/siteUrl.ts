/*
  lib/meta/instagram/siteUrl.ts

  Helper pur — résolution de l'URL publique du site pour les redirections OAuth.
  SANS import "server-only" : importable par les scripts de test tsx.

  Problème résolu :
  Derrière un proxy inverse (Infomaniak, Vercel, etc.), request.nextUrl peut
  retourner http://localhost:3000, produisant des redirections invalides comme
  https://localhost:3000/admin/integrations/instagram?error=...

  Solution :
  Lire NEXT_PUBLIC_SITE_URL (valeur configurée explicitement en production)
  et rejeter localhost et protocoles non-https en environnement de production.

  redirect_uri envoyée à Instagram : toujours depuis META_INSTAGRAM_OAUTH_REDIRECT_URI,
  jamais depuis cette fonction.
*/

const FALLBACK_URL = 'https://clikclak.ch'

/**
 * Retourne l'URL de base publique du site, prête à être utilisée comme
 * origine des redirections internes OAuth (sans slash final).
 *
 * - Lit NEXT_PUBLIC_SITE_URL.
 * - En production (NODE_ENV=production), rejette localhost et les URLs non-https.
 * - Supprime proprement un éventuel slash final.
 * - Retourne le fallback https://clikclak.ch si la valeur est invalide.
 *
 * @param _nodeEnv  Valeur de NODE_ENV — paramètre optionnel pour les tests.
 *                  Par défaut : process.env.NODE_ENV.
 */
export function getPublicSiteBaseUrl(_nodeEnv?: string): string {
  const nodeEnv = _nodeEnv ?? process.env.NODE_ENV ?? ''
  const raw     = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  if (!raw) return FALLBACK_URL

  let url: URL
  try {
    url = new URL(raw)
  } catch {
    return FALLBACK_URL
  }

  /* En production : rejeter localhost et les protocoles non-https */
  if (nodeEnv === 'production') {
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1'
    if (isLocalhost || url.protocol !== 'https:') {
      return FALLBACK_URL
    }
  }

  /* Supprimer le slash final */
  return url.origin.replace(/\/+$/, '')
}
