'use server'
/*
  app/admin/forgot-password/actions.ts

  Envoie un email de réinitialisation de mot de passe via Supabase Auth.
  - Ne révèle jamais si l'adresse existe ou non.
  - Construit l'URL de redirection depuis les en-têtes de la requête.
  - Ne journalise pas l'adresse email.
*/

import { headers }                  from 'next/headers'
import { createSupabaseServerClient } from '@/lib/supabase/server'

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

  // Construire l'origin depuis les headers — fonctionne en dev et en prod
  const headersList = await headers()
  const origin =
    headersList.get('origin') ??
    (() => {
      const proto = headersList.get('x-forwarded-proto') ?? 'http'
      const host  = headersList.get('host') ?? 'localhost:3000'
      return `${proto}://${host}`
    })()

  const redirectTo = `${origin}/auth/callback?next=/admin/reset-password`

  const supabase = await createSupabaseServerClient()

  // Supabase retourne toujours "success" même si l'email est inconnu.
  // Ne jamais tester l'erreur pour en déduire l'existence du compte.
  await supabase.auth.resetPasswordForEmail(email, { redirectTo })

  return { success: true }
}
