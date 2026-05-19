import { URLS } from '@/lib/urls'

// Ordre calé sur la hiérarchie business (CLAUDE.md)
export const NAV_MAIN = [
  { label: 'Réparation',              href: URLS.reparation },
  { label: 'iPhone',                  href: URLS.services.iphone },
  { label: 'Samsung',                 href: URLS.services.samsung },
  { label: 'MacBook',                 href: URLS.services.macbook },
  { label: 'Récupération de données', href: URLS.services.recuperationDonnees },
  { label: 'Shop',                    href: URLS.shop },
  { label: 'Contact',                 href: URLS.contact },
] as const

export const NAV_SERVICES = [
  { label: 'Réparation iPhone',           href: URLS.services.iphone },
  { label: 'Réparation Samsung',          href: URLS.services.samsung },
  { label: 'Réparation Huawei',           href: URLS.services.huawei },
  { label: 'Réparation Xiaomi',           href: URLS.services.xiaomi },
  { label: 'Réparation Google Pixel',     href: URLS.services.googlePixel },
  { label: 'Réparation OPPO',             href: URLS.services.oppo },
  { label: 'Réparation MacBook',          href: URLS.services.macbook },
  { label: 'Réparation tablette',         href: URLS.services.tablette },
  { label: 'Réparation dégât d\'eau',     href: URLS.reparationDegatsEau },
  { label: 'Récupération de données',     href: URLS.services.recuperationDonnees },
  { label: 'Dépannage à domicile',        href: URLS.services.domicile },
  { label: 'Service de coursier',         href: URLS.coursier },
] as const
