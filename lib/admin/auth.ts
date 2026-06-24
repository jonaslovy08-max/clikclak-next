/*
  lib/admin/auth.ts

  Vérification de la session admin côté serveur.
  À utiliser dans les layouts et pages protégées.

  Ne jamais importer lib/supabase/admin.ts ici.
  Utilise uniquement le client SSR authentifié (session RLS).
*/

import 'server-only'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { AdminProfile } from './types'

/**
 * Vérifie la session et le profil admin.
 * Redirige vers /admin/login si non authentifié ou profil invalide.
 * Retourne le profil admin si valide.
 */
export async function requireAdminProfile(): Promise<AdminProfile> {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect('/admin/login')
  }

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, email, role, active')
    .eq('id', user.id)
    .single()

  if (
    profileError ||
    !profile ||
    !profile.active ||
    !['admin', 'editor'].includes(profile.role)
  ) {
    // Session valide mais profil absent ou désactivé → logout propre
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return {
    id:    profile.id as string,
    email: profile.email as string,
    role:  profile.role as AdminProfile['role'],
  }
}
