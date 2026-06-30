'use client'
/*
  ChatbotWrapper — rend le chatbot ClikClak sur toutes les routes FR et EN.
  Détermine la locale depuis le pathname (même logique que GlobalFloatingActions)
  et la transmet explicitement au composant, jusqu'à l'API.
  Une seule instance du chatbot est jamais montée (un seul RootProviders actif
  par route, donc un seul ChatbotWrapper).
  Exclusion unique : /admin et /admin/* (back-office, pas de chatbot public).
*/

import { usePathname } from 'next/navigation'
import ClikClakAssistant from './ClikClakAssistant'
import { chatbotLocaleFromPathname } from '@/lib/chatbot/locale'

function isAdminRoute(pathname: string): boolean {
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export default function ChatbotWrapper() {
  const pathname = usePathname()
  if (isAdminRoute(pathname)) return null

  const locale = chatbotLocaleFromPathname(pathname)
  return <ClikClakAssistant locale={locale} />
}
