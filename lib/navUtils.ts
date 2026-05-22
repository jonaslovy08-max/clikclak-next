/*
  navUtils — logique de section active pour Header / MobileMenu.

  Règle : si aucune règle ne correspond, retourne null.
  Ne jamais fallback sur "Accueil" par défaut.
*/

export type NavSection = 'home' | 'repair' | 'services' | 'contact' | 'shop'

export function getActiveSection(pathname: string): NavSection | null {
  if (pathname === '/') return 'home'
  if (pathname.startsWith('/shop-reparation-smartphone-lausanne')) return 'shop'
  if (pathname.startsWith('/contact-clik-clak-lausanne')) return 'contact'

  /* Pages Services (hors réparations marque/modèle) */
  if (
    pathname.startsWith('/services/recuperation-donnees') ||
    pathname.startsWith('/services/rachat-de-votre-smartphone') ||
    pathname.startsWith('/services/depannage-reparation-domicile') ||
    pathname.startsWith('/service-de-coursier') ||
    pathname.startsWith('/reparation-degat-eau-lausanne')
  ) return 'services'

  /* Pages Réparation */
  if (
    pathname.startsWith('/reparation') ||
    pathname.startsWith('/services/reparation') ||
    pathname.startsWith('/services/changement-batterie') ||
    pathname.startsWith('/services/connecteur-de-charge') ||
    pathname.startsWith('/services/diagnostic') ||
    pathname.startsWith('/services/nettoyage')
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
    case 'services': return '/services-nav'
    default:         return null
  }
}
