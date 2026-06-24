/*
  app/admin/layout.tsx

  Layout racine de la zone admin.
  Gère uniquement les métadonnées — pas de sidebar, pas d'auth.
  La vérification de session est dans app/admin/(dashboard)/layout.tsx.
*/

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    default: 'ClikClak Admin',
    template: '%s — ClikClak Admin',
  },
  robots: {
    index:   false,
    follow:  false,
    nocache: true,
  },
}

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
