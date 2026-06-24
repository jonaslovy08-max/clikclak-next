'use client'
/*
  app/admin/login/page.tsx

  Page de connexion admin.
  Client Component — gère l'état du formulaire et l'action serveur.
  Ne révèle jamais si un email existe, si le compte est désactivé, etc.
*/

import { useActionState } from 'react'
import { signIn, type SignInState } from './actions'

const initialState: SignInState = {}

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
            <label
              htmlFor="password"
              className="block text-sm font-rubik font-medium text-foreground/70"
            >
              Mot de passe
            </label>
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
