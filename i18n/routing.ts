import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales:       ['fr', 'en'] as const,
  defaultLocale: 'fr',
  // FR = pas de préfixe, EN = /en
  localePrefix:  'as-needed',
  localeDetection: false,
})

export type Locale = (typeof routing.locales)[number]
