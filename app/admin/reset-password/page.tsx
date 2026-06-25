'use client'
/*
  app/admin/reset-password/page.tsx

  Page de définition du nouveau mot de passe.
  Accessible uniquement avec une session valide (depuis /auth/callback).
  Si aucune session → le middleware redirige vers /admin/login.
*/

import { useActionState, useState } from 'react'
import Link                         from 'next/link'
import { resetPassword, type ResetPasswordState } from './actions'

const initialState: ResetPasswordState = {}

const inputClass = `
  w-full h-11 px-4 rounded-btn
  bg-white/5 border border-white/15
  text-foreground font-rubik text-sm
  placeholder:text-foreground/30
  focus:outline-none focus:ring-2 focus:ring-accent/60 focus:border-accent/60
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-220
`

export default function ResetPasswordPage() {
  const [state, action, pending] = useActionState<ResetPasswordState, FormData>(
    resetPassword,
    initialState,
  )
  const [showPw, setShowPw] = useState(false)

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
            Choisir un nouveau mot de passe
          </p>
        </div>

        {/* Erreur de session invalide */}
        {state.error && (
          <div className="mb-6 p-4 rounded-card bg-red-400/8 border border-red-400/20">
            <p className="text-sm font-rubik text-red-400">{state.error}</p>
            <Link
              href="/admin/forgot-password"
              className="mt-2 inline-block text-xs font-rubik text-accent hover:underline"
            >
              Recommencer la procédure →
            </Link>
          </div>
        )}

        <form action={action} className="space-y-4">

          {/* Nouveau mot de passe */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-rubik font-medium text-foreground/70">
                Nouveau mot de passe
              </label>
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="text-xs font-rubik text-foreground/35 hover:text-foreground/60 transition-colors"
                aria-label={showPw ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPw ? 'Masquer' : 'Afficher'}
              </button>
            </div>
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={12}
              maxLength={128}
              disabled={pending}
              className={inputClass}
              placeholder="12 caractères minimum"
            />
            {state.fieldErrors?.password && (
              <p role="alert" className="text-xs font-rubik text-red-400">{state.fieldErrors.password[0]}</p>
            )}
          </div>

          {/* Confirmation */}
          <div className="space-y-1.5">
            <label htmlFor="confirm" className="block text-sm font-rubik font-medium text-foreground/70">
              Confirmer le mot de passe
            </label>
            <input
              id="confirm"
              name="confirm"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
              required
              disabled={pending}
              className={inputClass}
            />
            {state.fieldErrors?.confirm && (
              <p role="alert" className="text-xs font-rubik text-red-400">{state.fieldErrors.confirm[0]}</p>
            )}
          </div>

          <p className="text-xs font-rubik text-foreground/30">
            Minimum 12 caractères. Utilisez une combinaison de lettres, chiffres et symboles.
          </p>

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
            {pending ? 'Enregistrement…' : 'Enregistrer le mot de passe'}
          </button>

        </form>

      </div>
    </div>
  )
}
