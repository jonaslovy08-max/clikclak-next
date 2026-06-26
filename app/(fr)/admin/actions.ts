'use server'
/*
  app/admin/actions.ts

  Server Actions partagées pour la zone admin.
  Seule la déconnexion est ici — aucune mutation métier.
*/

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut(): Promise<never> {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
