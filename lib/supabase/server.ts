/*
  lib/supabase/server.ts

  Client Supabase pour Server Components, Route Handlers et Server Actions.
  Utilise la Publishable key limitée par RLS.

  Usage :
    const supabase = await createSupabaseServerClient()
    const { data } = await supabase.from('brands').select('*')

  Ne pas importer SUPABASE_SECRET_KEY ici.
  Pour les opérations privilégiées → lib/supabase/admin.ts
*/

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `[Supabase] Variable d'environnement manquante : ${name}\n` +
      `Ajouter la valeur dans .env.local ou dans les variables Infomaniak.`
    )
  }
  return value
}

export async function createSupabaseServerClient() {
  const url     = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
  const publishableKey = requireEnv('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')

  const cookieStore = await cookies()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          /*
            Server Components ne peuvent pas modifier les cookies.
            Les cookies de session sont gérés par les Route Handlers et
            Server Actions — cette branche est silencieuse dans ce contexte.
          */
        }
      },
    },
  })
}
