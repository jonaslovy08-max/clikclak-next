/*
  app/auth/callback/route.ts

  Route Handler PKCE pour Supabase Auth.
  Échange le `code` contre une session et redirige vers le chemin demandé.

  Sécurité :
  - `next` est limité à une liste de chemins autorisés (pas de redirection externe)
  - Les erreurs redirigent vers /admin/forgot-password?error=invalid_link
  - Le code PKCE est à usage unique — ne jamais réessayer
*/

import { createServerClient }  from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

/* Chemins autorisés pour le paramètre `next` */
const ALLOWED_NEXT_PATHS = ['/admin/reset-password'] as const

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams, origin } = request.nextUrl

  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin/reset-password'

  /* Valider le chemin cible — refuser toute URL externe ou chemin non autorisé */
  const safePath: string = ALLOWED_NEXT_PATHS.includes(next as typeof ALLOWED_NEXT_PATHS[number])
    ? next
    : '/admin/reset-password'

  const errorRedirect = NextResponse.redirect(
    `${origin}/admin/forgot-password?error=invalid_link`,
  )

  if (!code) {
    return errorRedirect
  }

  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const pubKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !pubKey) {
    return errorRedirect
  }

  /* La réponse de succès est créée avant l'échange du code
     pour que setAll() puisse y écrire les cookies de session. */
  const successRedirect = NextResponse.redirect(`${origin}${safePath}`)

  const supabase = createServerClient(url, pubKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        /* Propager les cookies dans request (pour Supabase interne)
           ET dans la réponse de redirection (pour le navigateur). */
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        cookiesToSet.forEach(({ name, value, options }) =>
          successRedirect.cookies.set(name, value, options)
        )
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    /* Code invalide, expiré ou déjà utilisé */
    return errorRedirect
  }

  return successRedirect
}
