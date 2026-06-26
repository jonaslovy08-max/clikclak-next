/**
 * Table de correspondance FR → EN et EN → FR pour le sélecteur de langue.
 * Ajouter ici chaque paire de pages bilingues.
 */

export const FR_TO_EN: Record<string, string> = {
  '/':                                   '/en',
  '/contact-clik-clak-lausanne':         '/en/contact',
  '/reparation-smartphone-express':      '/en/services/smartphone-repair',
  '/services/reparation-iphone':         '/en/services/iphone-repair',
  '/services/reparation-samsung-lausanne': '/en/services/samsung-repair',
  '/services/rachat-de-votre-smartphone': '/en/services/sell-your-device',
  '/reparation':                         '/en/repairs',
  '/blog':                               '/en/blog',
  '/clik-clak-repair-lausanne':          '/en/about',
}

export const EN_TO_FR: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN).map(([fr, en]) => [en, fr])
)

/** Retourne l'URL équivalente dans l'autre langue.
 *  Si aucune correspondance, retourne '/' (FR) ou '/en' (EN). */
export function getAlternateUrl(pathname: string, targetLocale: 'fr' | 'en'): string {
  if (targetLocale === 'en') {
    return FR_TO_EN[pathname] ?? '/en'
  }
  return EN_TO_FR[pathname] ?? '/'
}
