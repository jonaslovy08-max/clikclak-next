'use server'
/*
  app/admin/forgot-password/actions.ts

  Envoie un email de réinitialisation de mot de passe via Supabase Auth.
  - Ne révèle jamais si l'adresse existe ou non.
  - Utilise getPublicOrigin() pour éviter l'adresse interne du proxy.
  - Ne journalise pas l'adresse email.
*/

import { headers }                  from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getPublicOrigin }           from '@/lib/auth/publicOrigin'

export interface ForgotPasswordState {
  success?: boolean
  error?:   string
}

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = ((formData.get('email') as string | null) ?? '').trim()

  if (!email) {
    return { error: 'Adresse e-mail requise.' }
  }

  /* Construire l'origine publique depuis les headers du proxy.
     Priorise x-forwarded-host sur host pour fonctionner correctement
     derrière Infomaniak et tout autre reverse proxy. */
  const headersList = await headers()
  let publicOrigin: string
  try {
    publicOrigin = getPublicOrigin(headersList)
  } catch {
    /* Hôte non reconnu — erreur générique sans détail interne */
    return { error: 'Erreur de configuration. Contactez l\'administrateur.' }
  }

  const redirectTo = `${publicOrigin}/auth/callback?next=/admin/reset-password`

  const supabase = await createSupabaseServerClient()

  /* Supabase retourne toujours "success" même si l'email est inconnu.
     Ne jamais tester l'erreur pour en déduire l'existence du compte. */
  await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  return { success: true }
}
