/**
 * i18n/routes.ts — Table de correspondance complète FR ↔ EN.
 *
 * ROUTES : clé → { fr: string; en: string | null }
 *   en: null  → page FR uniquement (pas de version EN)
 *
 * Helpers :
 *   getLocalizedPath(key, locale, params?)  → URL pour la locale donnée
 *   getAlternatePath(currentPath, targetLocale) → URL équivalente dans l'autre locale
 */

export type RouteKey = keyof typeof ROUTES

export const ROUTES = {
  home:               { fr: '/',                                               en: '/en' },
  contact:            { fr: '/contact-clik-clak-lausanne',                     en: '/en/contact' },
  repair:             { fr: '/reparation',                                     en: '/en/repair' },
  about:              { fr: '/clik-clak-repair-lausanne',                      en: null },
  cgv:                { fr: '/cgv',                                            en: '/en/terms-and-conditions' },
  privacy:            { fr: '/politique-confidentialite',                      en: '/en/privacy-policy' },
  blog:               { fr: '/blog',                                           en: null },
  blogPost:           { fr: '/blog/:slug',                                     en: null },

  /* ── Réparation — type d'appareil ── */
  smartphoneRepair:   { fr: '/reparation-smartphone-express',                  en: '/en/services/smartphone-repair' },
  computerRepair:     { fr: '/reparation-ordinateur-express',                  en: '/en/express-computer-repair' },
  tabletRepair:       { fr: '/reparation-tablette-express',                    en: '/en/express-tablet-repair' },
  waterDamage:        { fr: '/reparation-degat-eau-lausanne',                  en: '/en/water-damage-repair-lausanne' },

  /* ── Services ── */
  screenRepair:       { fr: '/services/reparation-ecran',                      en: '/en/services/screen-repair' },
  batteryReplacement: { fr: '/services/changement-batterie',                   en: '/en/services/battery-replacement' },
  chargingPort:       { fr: '/services/connecteur-de-charge',                  en: '/en/services/charging-port-repair' },
  dataRecovery:       { fr: '/services/recuperation-donnees',                  en: '/en/services/data-recovery' },
  diagnostic:         { fr: '/services/diagnostic',                            en: '/en/services/diagnostics' },
  homeRepairService:  { fr: '/services/depannage-reparation-domicile',         en: '/en/services/home-repair-service' },
  courierService:     { fr: '/service-de-coursier',                            en: '/en/courier-service' },
  sellDevice:         { fr: '/services/rachat-de-votre-smartphone',            en: '/en/services/sell-your-device' },
  deviceCleaning:     { fr: '/services/nettoyage',                             en: '/en/services/device-cleaning' },
  dataTransfer:       { fr: '/services/transfert-donnees',                     en: '/en/services/data-transfer' },

  /* ── Marques smartphone ── */
  iphoneRepair:       { fr: '/services/reparation-iphone',                     en: '/en/services/iphone-repair' },
  samsungRepair:      { fr: '/services/reparation-samsung-lausanne',           en: '/en/services/samsung-repair' },
  huaweiRepair:       { fr: '/services/reparation-huawei-lausanne',            en: '/en/services/huawei-repair' },
  oppoRepair:         { fr: '/services/reparation-oppo',                       en: '/en/services/oppo-repair' },
  sonyRepair:         { fr: '/services/reparation-sony-xperia',                en: '/en/services/sony-xperia-repair' },
  pixelRepair:        { fr: '/services/reparation-google-pixel',               en: '/en/services/google-pixel-repair' },
  xiaomiRepair:       { fr: '/services/reparation-xiaomi',                     en: '/en/services/xiaomi-repair' },

  /* ── Tablettes ── */
  ipadRepair:         { fr: '/services/reparation-ipad',                       en: '/en/services/ipad-repair' },
  tabletBrandRepair:  { fr: '/services/reparation-tablette',                   en: '/en/services/tablet-repair' },

  /* ── Ordinateurs ── */
  macbookRepair:      { fr: '/services/reparation-macbook',                    en: '/en/services/macbook-repair' },

  /* ── Modèles dynamiques — :slug ── */
  iphoneModel:        { fr: '/services/reparation-iphone/:slug',               en: '/en/services/iphone-repair/:slug' },
  samsungModel:       { fr: '/services/reparation-samsung-lausanne/:slug',     en: '/en/services/samsung-repair/:slug' },
  huaweiModel:        { fr: '/services/reparation-huawei-lausanne/:slug',      en: '/en/services/huawei-repair/:slug' },
  ipadModel:          { fr: '/services/reparation-ipad/:slug',                 en: '/en/services/ipad-repair/:slug' },
  macbookModel:       { fr: '/services/reparation-macbook/:slug',              en: '/en/services/macbook-repair/:slug' },
  oppoModel:          { fr: '/services/reparation-oppo/:slug',                 en: '/en/services/oppo-repair/:slug' },
  sonyModel:          { fr: '/services/reparation-sony-xperia/:slug',          en: '/en/services/sony-xperia-repair/:slug' },

  /* ── Shop — FR uniquement (SHOP_ENABLED=false) ── */
  shop:               { fr: '/shop-reparation-smartphone-lausanne',            en: null },
} as const satisfies Record<string, { fr: string; en: string | null }>

/* ─────────────────────────────────────────────────────────────────────────────
   getLocalizedPath — retourne l'URL pour la locale donnée.
   Si en === null, retourne le chemin FR en fallback.
   params.slug remplace le segment :slug dans les routes dynamiques.
───────────────────────────────────────────────────────────────────────────── */
export function getLocalizedPath(
  key: RouteKey,
  locale: 'fr' | 'en',
  params?: { slug?: string },
): string {
  const route = ROUTES[key]
  let path: string = locale === 'en' ? (route.en ?? route.fr) : route.fr

  if (params?.slug) {
    path = path.replace(':slug', params.slug)
  }

  return path
}

/* ─────────────────────────────────────────────────────────────────────────────
   getAlternatePath — retourne l'URL équivalente dans l'autre locale.
   Gère les routes dynamiques (:slug) par correspondance de pattern.
   Fallback : '/' pour FR, '/en' pour EN.
───────────────────────────────────────────────────────────────────────────── */
export function getAlternatePath(currentPath: string, targetLocale: 'fr' | 'en'): string {
  const fallback = targetLocale === 'en' ? '/en' : '/'

  /* Normalise le path en retirant le trailing slash pour la comparaison */
  const normalized = currentPath.endsWith('/') && currentPath !== '/'
    ? currentPath.slice(0, -1)
    : currentPath

  for (const route of Object.values(ROUTES)) {
    const sourcePattern = targetLocale === 'en' ? route.fr : (route.en ?? null)
    const targetPattern = targetLocale === 'en' ? (route.en ?? null) : route.fr

    if (!sourcePattern || !targetPattern) continue

    /* Route statique — correspondance exacte */
    if (!sourcePattern.includes(':slug')) {
      if (normalized === sourcePattern) return targetPattern
      continue
    }

    /* Route dynamique — correspondance par pattern */
    const prefix = sourcePattern.replace('/:slug', '')
    if (normalized.startsWith(prefix + '/')) {
      const slug = normalized.slice(prefix.length + 1)
      if (slug && !slug.includes('/')) {
        return targetPattern.replace(':slug', slug)
      }
    }
  }

  return fallback
}
