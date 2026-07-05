/*
  lib/admin/auth.ts

  Vérification de la session admin côté serveur.
  Deux niveaux d'accès :

  requireAdminProfile()    → admin|editor (accès complet)
  requireInstagramAccess() → admin|editor|instagram_reviewer (Instagram uniquement)

  La logique de rôles est dans lib/meta/instagram/accessControl.ts (testable).
  Ne jamais importer lib/supabase/admin.ts ici.
*/

import 'server-only'
import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import type { AdminProfile } from './types'
import {
  FULL_ADMIN_ROLES,
  INSTAGRAM_ROLES,
  isAllowedRole,
} from '@/lib/meta/instagram/accessControl'

async function loadProfile(allowedRoles: readonly string[]): Promise<AdminProfile> {
  const supabase = await createSupabaseServerClient()

  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) redirect('/admin/login')

  const { data: profile, error: profileError } = await supabase
    .from('admin_profiles')
    .select('id, email, role, active')
    .eq('id', user.id)
    .single()

  if (
    profileError ||
    !profile ||
    !isAllowedRole(profile.role as string, profile.active as boolean, allowedRoles)
  ) {
    await supabase.auth.signOut()
    redirect('/admin/login')
  }

  return {
    id:    profile.id    as string,
    email: profile.email as string,
    role:  profile.role  as AdminProfile['role'],
  }
}

/**
 * Vérifie la session et exige le rôle admin ou editor.
 * Donne accès à l'ensemble de l'interface admin.
 */
export async function requireAdminProfile(): Promise<AdminProfile> {
  return loadProfile(FULL_ADMIN_ROLES)
}

/**
 * Vérifie la session et accepte admin|editor|instagram_reviewer.
 * Donne accès uniquement aux pages d'intégration Instagram.
 */
export async function requireInstagramAccess(): Promise<AdminProfile> {
  return loadProfile(INSTAGRAM_ROLES)
}
