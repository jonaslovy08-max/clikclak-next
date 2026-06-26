'use client'
/*
  app/admin/forgot-password/page.tsx

  Page de demande de réinitialisation du mot de passe admin.
  Accessible sans session.
*/

import { Suspense }      from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link              from 'next/link'
import { requestPasswordReset, type ForgotPasswordState } from './actions'

const initialState: ForgotPasswordState = {}

/* Affiche le bandeau "lien invalide" si ?error=invalid_link */
function InvalidLinkBanner() {
  const params = useSearchParams()
  if (params.get('error') !== 'invalid_link') return null
  return (
    <p className="text-sm font-rubik text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-btn px-4 py-2.5 mb-6">
      Le lien est invalide ou a expiré. Recommencez la procédure.
    </p>
  )
}

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<ForgotPasswordState, FormData>(
    requestPasswordReset,
    initialState,
  )

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-accent font-rubik font-bold text-2xl tracking-tight">ClikClak</span>
            <span className="text-foreground/40 font-rubik text-sm font-medium uppercase tracking-widest pt-0.5">Admin</span>
          </div>
          <p className="text-foreground/50 text-sm font-rubik">
            Réinitialisation du mot de passe
          </p>
        </div>

        <Suspense fallback={null}>
          <InvalidLinkBanner />
        </Suspense>

        {state.success ? (
          /* Message générique — ne révèle pas si l'email existe */
          <div className="space-y-6">
            <div className="p-4 rounded-card bg-green-500/8 border border-green-500/20">
              <p className="text-sm font-rubik text-green-400 font-medium">Email envoyé</p>
              <p className="text-sm font-rubik text-foreground/60 mt-1">
                Si un compte correspond à cette adresse, un lien de réinitialisation a été envoyé.
              </p>
              <p className="text-xs font-rubik text-foreground/40 mt-2">
                Vérifiez votre boîte mail et vos spams. Le lien expire rapidement.
              </p>
            </div>
            <Link
              href="/admin/login"
              className="block w-full h-11 rounded-btn border border-white/15 text-foreground/70 font-rubik font-medium text-sm text-center leading-[44px] hover:text-foreground hover:bg-white/5 transition-colors duration-220"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-rubik font-medium text-foreground/70">
                Adresse e-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                disabled={pending}
                className="
                  w-full h-11 px-4 rounded-btn
                  bg-white/5 border border-white/15
                  text-foreground font-rubik text-sm
                  placeholder:text-foreground/30
                  focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-220
                "
                placeholder="admin@exemple.com"
              />
            </div>

            {state.error && (
              <p role="alert" className="text-sm font-rubik text-red-400 bg-red-400/10 border border-red-400/20 rounded-btn px-4 py-2.5">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="
                w-full h-11 rounded-btn
                bg-accent text-primary-foreground
                font-rubik font-semibold text-sm
                hover:bg-accent/90
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-220
              "
            >
              {pending ? 'Envoi en cours…' : 'Envoyer le lien'}
            </button>

            <div className="text-center pt-2">
              <Link
                href="/admin/login"
                className="text-sm font-rubik text-foreground/40 hover:text-foreground/70 transition-colors"
              >
                ← Retour à la connexion
              </Link>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
