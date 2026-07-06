/*
  navUtils — logique de section active pour Header / MobileMenu.

  Règle : si aucune règle ne correspond, retourne null.
  Ne jamais fallback sur "Accueil" par défaut.
  Supporte FR (sans préfixe) et EN (/en/...).
*/

export type NavSection = 'home' | 'repair' | 'services' | 'contact' | 'shop'

export function getActiveSection(pathname: string): NavSection | null {
  /* ── FR ── */
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/shop-reparation-smartphone-lausanne')) return 'shop'
  if (pathname.startsWith('/contact-clik-clak-lausanne')) return 'contact'
  if (
    pathname.startsWith('/services/recuperation-donnees') ||
    pathname.startsWith('/services/rachat-de-votre-smartphone') ||
    pathname.startsWith('/services/depannage-reparation-domicile') ||
    pathname.startsWith('/service-de-coursier') ||
    pathname.startsWith('/reparation-degat-eau-lausanne') ||
    pathname.startsWith('/services/entreprises')
  ) return 'services'
  if (
    pathname.startsWith('/reparation') ||
    pathname.startsWith('/services/reparation') ||
    pathname.startsWith('/services/changement-batterie') ||
    pathname.startsWith('/services/connecteur-de-charge') ||
    pathname.startsWith('/services/diagnostic') ||
    pathname.startsWith('/services/nettoyage')
  ) return 'repair'

  /* ── EN ── */
  if (pathname === '/en' || pathname === '/en/') return 'home'
  if (pathname.startsWith('/en/contact')) return 'contact'
  if (
    pathname.startsWith('/en/services/data-recovery') ||
    pathname.startsWith('/en/services/sell-your-device') ||
    pathname.startsWith('/en/services/home-repair-service') ||
    pathname.startsWith('/en/courier-service') ||
    pathname.startsWith('/en/water-damage-repair-lausanne') ||
    pathname.startsWith('/en/services/business')
  ) return 'services'
  if (
    pathname.startsWith('/en/repair') ||
    pathname.startsWith('/en/services/smartphone-repair') ||
    pathname.startsWith('/en/services/iphone-repair') ||
    pathname.startsWith('/en/services/samsung-repair') ||
    pathname.startsWith('/en/services/huawei-repair') ||
    pathname.startsWith('/en/services/ipad-repair') ||
    pathname.startsWith('/en/services/macbook-repair') ||
    pathname.startsWith('/en/services/oppo-repair') ||
    pathname.startsWith('/en/services/sony-xperia-repair') ||
    pathname.startsWith('/en/services/battery-replacement') ||
    pathname.startsWith('/en/services/charging-port-repair') ||
    pathname.startsWith('/en/services/diagnostics') ||
    pathname.startsWith('/en/services/screen-repair') ||
    pathname.startsWith('/en/express-computer-repair') ||
    pathname.startsWith('/en/express-tablet-repair')
  ) return 'repair'

  return null
}

/*
  Mappe une section active sur le href du lien navLinks correspondant.
  Retourne null pour shop et contact (dans rightLinks, hors portée de la barre).
*/
export function getSectionNavHref(section: NavSection | null, locale: 'fr' | 'en' = 'fr'): string | null {
  if (locale === 'en') {
    switch (section) {
      case 'home':     return '/en'
      case 'repair':   return '/en/services/smartphone-repair'
      case 'services': return '/en/services/data-recovery' // first services item href
      default:         return null
    }
  }
  switch (section) {
    case 'home':     return '/'
    case 'repair':   return '/reparation'
    case 'services': return '/services-nav'
    default:         return null
  }
}
