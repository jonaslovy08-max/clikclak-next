'use server'
/*
  app/admin/login/actions.ts

  Server Action pour la connexion admin.
  Ne journalise jamais le mot de passe.
  Retourne un message d'erreur générique pour tous les cas d'échec.

  Rôles autorisés :
  - admin          → /admin
  - editor         → /admin
  - instagram_reviewer → /admin/integrations/instagram

  La logique de redirection est centralisée dans
  lib/meta/instagram/accessControl.getAdminLoginDestination().
*/

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getAdminLoginDestination } from '@/lib/meta/instagram/accessControl'

export interface SignInState {
  error?: string
}

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email    = (formData.get('email') as string | null)?.trim() ?? ''
  const password = (formData.get('password') as string | null) ?? ''

  if (!email || !password) {
    return { error: 'Connexion impossible. Vérifiez vos identifiants.' }
  }

  const supabase = await createSupabaseServerClient()

  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: 'Connexion impossible. Vérifiez vos identifiants.' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Connexion impossible. Vérifiez vos identifiants.' }
  }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('active, role')
    .eq('id', user.id)
    .single()

  const destination = getAdminLoginDestination(
    profile?.role   as string | null,
    profile?.active as boolean | null,
  )

  if (!destination) {
    await supabase.auth.signOut()
    return { error: 'Connexion impossible. Vérifiez vos identifiants.' }
  }

  redirect(destination)
}
