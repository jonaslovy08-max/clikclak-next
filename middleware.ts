/*
  middleware.ts

  1. Routes /admin/* → protection Supabase SSR (comportement original conservé)
  2. Toutes les autres routes → x-pathname sur les headers de requête

  x-pathname est utilisé par i18n/request.ts (next-intl) pour charger
  les bons fichiers de messages (fr.json ou en.json) selon la locale.
  Il n'est plus utilisé pour déterminer html lang (géré par les route groups).

  Sécurité : x-pathname est toujours écrasé depuis request.nextUrl.pathname
  — jamais depuis une valeur envoyée par le navigateur.
*/

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

const ADMIN_PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password']

async function handleAdminRoute(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !pubKey) return supabaseResponse

  const supabase = createServerClient(url, pubKey, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
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

  // Injecter x-pathname dans les headers de REQUÊTE pour i18n/request.ts.
  // Supprime toute valeur éventuellement envoyée par le navigateur (sécurité).
  const requestHeaders = new Headers(request.headers)
  requestHeaders.delete('x-pathname')
  requestHeaders.set('x-pathname', pathname)

  return NextResponse.next({
    request: { headers: requestHeaders },
  })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|assets|api|auth|.*\\..*).*)',
  ],
}
