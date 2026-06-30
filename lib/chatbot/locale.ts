/*
  lib/chatbot/locale.ts

  Source unique de vérité pour la locale du chatbot.
  Importable côté client ET serveur (aucun secret, aucune dépendance serveur).
*/

export type ChatbotLocale = 'fr' | 'en'

export const DEFAULT_CHATBOT_LOCALE: ChatbotLocale = 'fr'

/**
 * Normalise une valeur arbitraire (body JSON client, état React, etc.)
 * vers une locale chatbot strictement valide.
 * Ne fait jamais confiance à la valeur brute du client — toute valeur
 * différente de la chaîne exacte "en" retombe sur "fr".
 */
export function parseChatbotLocale(value: unknown): ChatbotLocale {
  return value === 'en' ? 'en' : DEFAULT_CHATBOT_LOCALE
}

/** Dérive la locale chatbot à partir d'un pathname Next.js (/en/* → en). */
export function chatbotLocaleFromPathname(pathname: string): ChatbotLocale {
  return pathname.startsWith('/en') ? 'en' : 'fr'
}
