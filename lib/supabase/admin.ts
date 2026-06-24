/*
  lib/supabase/admin.ts

  Client Supabase privilégié utilisant la Secret key.
  Ce client contourne les politiques RLS.

  STRICTEMENT RÉSERVÉ au serveur :
    - Scripts de migration
    - Opérations nécessitant réellement des privilèges élevés
    - Journalisation système

  NE JAMAIS importer dans un Client Component ('use client').
  NE JAMAIS exposer dans un bundle navigateur.

  L'import de 'server-only' provoque une erreur de build si ce fichier
  est accidentellement importé côté client.
*/

import 'server-only'
import { createClient } from '@supabase/supabase-js'

let _adminClient: ReturnType<typeof createClient> | null = null

export function createSupabaseAdminClient() {
  if (_adminClient) return _adminClient

  const url       = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!url) {
    throw new Error(
      '[Supabase Admin] NEXT_PUBLIC_SUPABASE_URL manquante.\n' +
      'Variable requise côté serveur. Ne jamais l\'afficher dans les logs.'
    )
  }
  if (!secretKey) {
    throw new Error(
      '[Supabase Admin] SUPABASE_SECRET_KEY manquante.\n' +
      'Variable strictement serveur. Ne jamais la logger ni l\'exposer.'
    )
  }

  _adminClient = createClient(url, secretKey, {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  })

  return _adminClient
}
