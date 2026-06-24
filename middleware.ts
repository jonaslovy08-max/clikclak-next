/*
  middleware.ts

  Rafraîchit la session Supabase SSR et protège les routes /admin.
  La vérification du rôle admin est effectuée dans le layout serveur.

  Protection :
  - /admin/* sans session → redirect /admin/login
  - /admin/login avec session valide → redirect /admin
*/

import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

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

  // Route protégée sans session → login
  if (!user && pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
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
