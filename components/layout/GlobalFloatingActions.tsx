'use client'

/*
  GlobalFloatingActions — injecte FloatingContactActions sur toutes les pages
  sauf /contact-clik-clak-lausanne où les actions sont intégrées dans la page.

  Monté dans app/layout.tsx (hors PageTransitionWrapper) pour rester
  indépendant des transitions de page.
*/

import { usePathname } from 'next/navigation'
import FloatingContactActions from '@/components/home/FloatingContactActions'

const HIDDEN_PATHS = ['/contact-clik-clak-lausanne', '/contact-clik-clak-lausanne/']

export default function GlobalFloatingActions() {
  const pathname = usePathname()
  if (HIDDEN_PATHS.includes(pathname)) return null
  return <FloatingContactActions layout="stack" />
}
