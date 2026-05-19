/*
  navUtils — logique de section active pour Header / MobileMenu.

  Règle : si aucune règle ne correspond, retourne null.
  Ne jamais fallback sur "Accueil" par défaut.
*/

export type NavSection = 'home' | 'repair' | 'recovery' | 'contact' | 'shop'

export function getActiveSection(pathname: string): NavSection | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/shop-reparation-smartphone-lausanne')) return 'shop'
  if (pathname.startsWith('/contact-clik-clak-lausanne')) return 'contact'
  if (pathname.startsWith('/services/recuperation-donnees')) return 'recovery'
  if (
    pathname.startsWith('/reparation') ||
    pathname.startsWith('/services/reparation') ||
    pathname.startsWith('/services/changement-batterie') ||
    pathname.startsWith('/services/connecteur-de-charge') ||
    pathname.startsWith('/services/diagnostic') ||
    pathname.startsWith('/services/nettoyage') ||
    pathname.startsWith('/services/depannage-reparation-domicile') ||
    pathname.startsWith('/service-de-coursier')
  ) return 'repair'
  return null
}

/*
  Mappe une section sur le href du lien navLinks correspondant
  (pour positionner la barre indicatrice).
  Retourne null pour shop et contact qui sont dans rightLinks (hors portée de la barre).
*/
export function getSectionNavHref(section: NavSection | null): string | null {
  switch (section) {
    case 'home':     return '/'
    case 'repair':   return '/reparation'
    case 'recovery': return '/services/recuperation-donnees'
    default:         return null
  }
}
