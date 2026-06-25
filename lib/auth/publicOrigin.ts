/*
  lib/auth/publicOrigin.ts

  Reconstruit l'origine publique depuis les headers du reverse proxy.
  Server-only — ne jamais importer côté client.

  Problème résolu :
    Derrière Infomaniak ou tout reverse proxy, `request.nextUrl.origin`
    et `request.headers.get('host')` retournent l'adresse interne
    (ex : http://localhost:3000). Le navigateur reçoit alors une
    redirection vers localhost, ce qui est incorrect en staging/prod.

  Solution :
    Prioriser `x-forwarded-host` (défini par le proxy avec le vrai
    domaine public) sur `host` (adresse interne du processus Node.js).
    Combiner avec `x-forwarded-proto` pour le bon protocole.

  Sécurité :
    - Liste fermée de domaines autorisés (ALLOWED_HOSTS)
    - Aucune valeur arbitraire de header acceptée
    - Fallback sur NEXT_PUBLIC_SITE_URL si configuré
    - Lève une erreur si aucun domaine sûr ne peut être déterminé
*/

import 'server-only'

/* Domaines publics autorisés — modifier si le projet change de domaine */
const ALLOWED_HOSTS: ReadonlySet<string> = new Set([
  'localhost:3000',
  'staging.clikclak.ch',
  'clikclak.ch',
  'www.clikclak.ch',
])

/** Interface minimale compatible avec NextRequest.headers et ReadonlyHeaders (next/headers) */
interface HeaderReader {
  get(name: string): string | null
}

/**
 * Retourne l'origine publique sûre à partir des headers de la requête.
 *
 * Priorité :
 *   1. x-forwarded-host (domaine public défini par le proxy)
 *   2. host (peut être interne — utilisé uniquement si dans ALLOWED_HOSTS)
 *   3. NEXT_PUBLIC_SITE_URL (variable d'env de secours)
 *
 * Lève une erreur si aucun domaine autorisé ne peut être déterminé.
 *
 * @example
 *   // Route Handler
 *   const origin = getPublicOrigin(request.headers)
 *   // Server Action
 *   const origin = getPublicOrigin(await headers())
 */
export function getPublicOrigin(headers: HeaderReader): string {
  // x-forwarded-host peut contenir plusieurs valeurs séparées par des virgules
  const forwardedHost = headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto = headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const directHost = headers.get('host')?.split(',')[0]?.trim()

  // Préférer le host fourni par le proxy (valeur publique réelle)
  const host = forwardedHost || directHost

  if (host && ALLOWED_HOSTS.has(host)) {
    const proto = host.startsWith('localhost:')
      ? 'http'
      : forwardedProto === 'https' || forwardedProto === 'http'
        ? forwardedProto
        : 'https'   // défaut sécurisé pour les domaines publics sans x-forwarded-proto

    return `${proto}://${host}`
  }

  // Fallback configuré explicitement (NEXT_PUBLIC_SITE_URL)
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  if (configured) {
    return configured
  }

  throw new Error(
    `[getPublicOrigin] Impossible de déterminer une origine publique sûre. ` +
    `Host résolu : "${host ?? 'none'}". ` +
    `Configurer NEXT_PUBLIC_SITE_URL ou vérifier les headers x-forwarded-host.`
  )
}
