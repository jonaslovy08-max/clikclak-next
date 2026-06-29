'use client'
/*
  components/admin/AdminSignOutButton.tsx

  Bouton de déconnexion utilisant un formulaire HTML avec Server Action.
  Client Component car interactif, mais l'action est serveur.
*/

import { signOut } from '@/app/(fr)/admin/actions'

export function AdminSignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="
          w-full flex items-center gap-2 px-3 py-2 rounded-btn
          text-sm font-rubik text-foreground/50
          hover:text-foreground hover:bg-white/5
          transition-colors duration-220
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
        "
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M10 11l3-3-3-3M13 8H6"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          />
        </svg>
        Se déconnecter
      </button>
    </form>
  )
}
