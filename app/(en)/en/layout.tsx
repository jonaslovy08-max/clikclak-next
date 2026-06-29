/*
  app/(en)/en/layout.tsx

  Layout intermédiaire de la section /en/*.
  Le root layout app/(en)/layout.tsx fournit déjà <html lang="en">.
  Ce layout transmet simplement les enfants — aucun script nécessaire.
*/

import type { Metadata } from 'next'

export const metadata: Metadata = {
  robots: { index: true, follow: true },
}

export default function EnSectionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
