'use client'
/*
  ChatbotWrapper — rend le chatbot uniquement sur les routes françaises.
  Masqué sur /en/* jusqu'à la traduction du chatbot en anglais (Phase 2).
*/

import { usePathname } from 'next/navigation'
import ClikClakAssistant from './ClikClakAssistant'

export default function ChatbotWrapper() {
  const pathname = usePathname()
  // Ne pas rendre le chatbot français sur les pages anglaises
  if (pathname.startsWith('/en')) return null
  return <ClikClakAssistant />
}
