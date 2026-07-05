/*
  middleware.ts

  1. Routes /admin/* → protection Supabase SSR (comportement original conservé)
  2. Toutes les routes → x-pathname injecté dans les headers de requête

  x-pathname est utilisé par :
  - i18n/request.ts (next-intl) pour charger les messages FR/EN ;
  - app/(fr)/admin/(dashboard)/layout.tsx pour détecter la page courante
    du rôle instagram_reviewer.

  Sécurité : createRequestHeaders() supprime systématiquement toute valeur
  x-pathname envoyée par le navigateur et recalcule depuis nextUrl.pathname.
  Cela s'applique désormais aussi aux routes /admin/* (correction du bug
  de page vide pour le rôle instagram_reviewer).

  Cookies Supabase : dans handleAdminRoute, la recréation de supabaseResponse
  dans setAll appelle createRequestHeaders(request) APRÈS que
  request.cookies.set() a mis à jour les headers Cookie sous-jacents.
  Les cookies fraîchement rafraîchis sont donc bien inclus dans la réponse.
*/

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { createRequestHeaders } from '@/lib/middleware/pathname'

const ADMIN_PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password']

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  /*
   * Initialiser supabaseResponse avec les headers sûrs (x-pathname inclus).
   * L'option { request: { headers } } transmet ces headers aux Server Components.
   */
  let supabaseResponse = NextResponse.next({
    request: { headers: createRequestHeaders(request) },
  })

  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !pubKey) return supabaseResponse

  const supabase = createServerClient(url, pubKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        /*
         * 1. request.cookies.set() met à jour l'état interne ET le header
         *    Cookie sous-jacent de request.headers.
         * 2. createRequestHeaders(request) est appelé APRÈS, donc il copie
         *    les cookies mis à jour en plus d'injecter x-pathname.
         * 3. Les cookies sont ensuite écrits sur la response via .cookies.set().
         */
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request: { headers: createRequestHeaders(request) },
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl
  const isPublicAdminPath = ADMIN_PUBLIC_PATHS.some(p => pathname.startsWith(p))

  if (!user && pathname.startsWith('/admin') && !isPublicAdminPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return NextResponse.redirect(loginUrl)
  }
  if (user && pathname.startsWith('/admin/login')) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  return supabaseResponse
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    return handleAdminRoute(request)
  }

  /*
   * Routes non-admin : injecter x-pathname pour i18n/request.ts.
   * Même protection : toute valeur envoyée par le navigateur est écrasée.
   */
  return NextResponse.next({
    request: { headers: createRequestHeaders(request) },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|assets|api|auth|.*\\..*).*)',
  ],
}
