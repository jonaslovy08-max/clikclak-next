'use server'
/*
  app/admin/reset-password/actions.ts

  Server Action de changement de mot de passe après récupération.
  Requiert une session valide (récupération ou normale).
  Ne journalise jamais le mot de passe.

  Après succès :
  - déconnecte la session de récupération
  - redirige vers /admin/login?password_updated=1
*/

import { redirect }               from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface ResetPasswordState {
  error?:       string
  fieldErrors?: {
    password?: string[]
    confirm?:  string[]
  }
}

const MIN_LENGTH = 12
const MAX_LENGTH = 128

export async function resetPassword(
  _prev: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const password = (formData.get('password') as string | null) ?? ''
  const confirm  = (formData.get('confirm')  as string | null) ?? ''

  /* Validation côté serveur */
  const fieldErrors: NonNullable<ResetPasswordState['fieldErrors']> = {}

  if (password.length < MIN_LENGTH) {
    fieldErrors.password = [`Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.`]
  } else if (password.length > MAX_LENGTH) {
    fieldErrors.password = ['Le mot de passe est trop long.']
  }

  if (password !== confirm) {
    fieldErrors.confirm = ['Les mots de passe ne correspondent pas.']
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors }
  }

  const supabase = await createSupabaseServerClient()

  /* Vérifier que la session est valide (récupération ou normale) */
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Lien invalide ou expiré. Recommencez la procédure depuis /admin/forgot-password.' }
  }

  /* Changer le mot de passe */
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: 'Impossible de mettre à jour le mot de passe. Recommencez la procédure.' }
  }

  /* Déconnecter la session de récupération */
  await supabase.auth.signOut()

  redirect('/admin/login?password_updated=1')
}
