/*
  middleware.ts

  Rafraîchit la session Supabase SSR et protège les routes /admin.
  La vérification du rôle admin est effectuée dans le layout serveur.

  Routes publiques (sans session) :
  - /admin/login
  - /admin/forgot-password

  /auth/callback est hors du matcher (/admin/:path*), pas de protection ici.

  /admin/reset-password est accessible avec la session de récupération
  créée par /auth/callback après échange du code PKCE.
*/

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/* Chemins /admin accessibles sans session authentifiée */
const ADMIN_PUBLIC_PATHS = ['/admin/login', '/admin/forgot-password']

export async function middleware(request: NextRequest): Promise<NextResponse> {
  let supabaseResponse = NextResponse.next({ request })

  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !pubKey) {
    return supabaseResponse
  }

  const supabase = createServerClient(url, pubKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Rafraîchit le token de session — ne pas supprimer cet appel
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isPublicAdminPath = ADMIN_PUBLIC_PATHS.some(p => pathname.startsWith(p))

  // Route protégée sans session → login
  if (!user && pathname.startsWith('/admin') && !isPublicAdminPath) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/admin/login'
    return NextResponse.redirect(loginUrl)
  }

  // Déjà connecté sur /admin/login → tableau de bord
  if (user && pathname.startsWith('/admin/login')) {
    const adminUrl = request.nextUrl.clone()
    adminUrl.pathname = '/admin'
    return NextResponse.redirect(adminUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/admin/:path*'],
}
