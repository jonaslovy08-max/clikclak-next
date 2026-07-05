/*
  lib/middleware/pathname.ts

  Utilitaire pur et testable pour l'injection de x-pathname dans les
  headers de requête du middleware Next.js.

  Règle de sécurité :
  - x-pathname est TOUJOURS supprimé de la valeur envoyée par le navigateur.
  - x-pathname est TOUJOURS recalculé depuis request.nextUrl.pathname.
  - Aucune valeur client n'est jamais propagée.
*/

/** Interface minimale nécessaire — compatible NextRequest et objets de test. */
export interface PathnameRequest {
  headers: Headers
  nextUrl: { pathname: string }
}

/**
 * Construit un objet Headers sûr depuis la requête entrante.
 *
 * - Copie tous les headers existants.
 * - Supprime toute valeur x-pathname éventuellement injectée par le client.
 * - Réinjecte x-pathname depuis request.nextUrl.pathname (source de confiance).
 *
 * À utiliser dans chaque NextResponse.next({ request: { headers } })
 * du middleware, y compris lors de la recréation de la réponse Supabase.
 */
export function createRequestHeaders(request: PathnameRequest): Headers {
  const headers = new Headers(request.headers)
  headers.delete('x-pathname')
  headers.set('x-pathname', request.nextUrl.pathname)
  return headers
}
