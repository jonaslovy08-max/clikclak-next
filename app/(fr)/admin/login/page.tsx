'use client'
/*
  app/admin/login/page.tsx

  Page de connexion admin.
  - Affiche un bandeau de succès si ?password_updated=1
  - Lien « Mot de passe oublié ? » vers /admin/forgot-password
*/

import { Suspense }       from 'react'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link               from 'next/link'
import { signIn, type SignInState } from './actions'

const initialState: SignInState = {}

/* Bandeau de succès après réinitialisation — isolé en Suspense pour useSearchParams */
function PasswordUpdatedBanner() {
  const params = useSearchParams()
  if (params.get('password_updated') !== '1') return null
  return (
    <div className="mb-6 p-4 rounded-card bg-green-500/8 border border-green-500/20">
      <p className="text-sm font-rubik text-green-400 font-medium">Mot de passe mis à jour</p>
      <p className="text-sm font-rubik text-foreground/60 mt-0.5">
        Votre mot de passe a été mis à jour. Vous pouvez vous connecter.
      </p>
    </div>
  )
}

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, initialState)

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo + titre */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-accent font-rubik font-bold text-2xl tracking-tight">
              ClikClak
            </span>
            <span className="text-foreground/40 font-rubik text-sm font-medium uppercase tracking-widest pt-0.5">
              Admin
            </span>
          </div>
          <p className="text-foreground/50 text-sm font-rubik">
            Interface d&apos;administration — accès restreint
          </p>
        </div>

        {/* Bandeau mot de passe mis à jour */}
        <Suspense fallback={null}>
          <PasswordUpdatedBanner />
        </Suspense>

        {/* Formulaire */}
        <form action={action} className="space-y-4">

          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-rubik font-medium text-foreground/70"
            >
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

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="block text-sm font-rubik font-medium text-foreground/70"
              >
                Mot de passe
              </label>
              <Link
                href="/admin/forgot-password"
                className="text-xs font-rubik text-foreground/35 hover:text-foreground/60 transition-colors"
                tabIndex={-1}
              >
                Mot de passe oublié&nbsp;?
              </Link>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={pending}
              className="
                w-full h-11 px-4 rounded-btn
                bg-white/5 border border-white/15
                text-foreground font-rubik text-sm
                focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-220
              "
            />
          </div>

          {/* Erreur générique */}
          {state.error && (
            <p
              role="alert"
              className="text-sm font-rubik text-red-400 bg-red-400/10 border border-red-400/20 rounded-btn px-4 py-2.5"
            >
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
            {pending ? 'Connexion en cours…' : 'Se connecter'}
          </button>

        </form>

        <p className="mt-8 text-center text-xs text-foreground/25 font-rubik">
          Accès réservé aux administrateurs ClikClak
        </p>

      </div>
    </div>
  )
}
