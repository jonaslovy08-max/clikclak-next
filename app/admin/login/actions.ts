'use server'
/*
  app/admin/login/actions.ts

  Server Action pour la connexion admin.
  Ne journalise jamais le mot de passe.
  Retourne un message d'erreur générique pour tous les cas d'échec.
*/

import { createSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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

  // Vérifier que le profil admin existe et est actif
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Connexion impossible. Vérifiez vos identifiants.' }
  }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('active, role')
    .eq('id', user.id)
    .single()

  if (!profile || !profile.active || !['admin', 'editor'].includes(profile.role)) {
    await supabase.auth.signOut()
    return { error: 'Connexion impossible. Vérifiez vos identifiants.' }
  }

  redirect('/admin')
}
