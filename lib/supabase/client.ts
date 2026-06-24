/*
  lib/supabase/client.ts

  Client Supabase pour les Client Components ('use client').
  Utilise uniquement la Publishable key, protégée par RLS.

  Usage :
    const supabase = createSupabaseBrowserClient()
    const { data } = await supabase.from('...').select('*')

  Ce fichier ne contient aucune méthode ou clé privilégiée.
  Pour les opérations serveur → lib/supabase/server.ts
  Pour les opérations privilégiées → lib/supabase/admin.ts (serveur uniquement)
*/

'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  const url            = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_URL manquante. ' +
      'Ajouter la valeur dans .env.local.'
    )
  }
  if (!publishableKey) {
    throw new Error(
      '[Supabase] NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquante. ' +
      'Ajouter la valeur dans .env.local.'
    )
  }

  return createBrowserClient(url, publishableKey)
}
