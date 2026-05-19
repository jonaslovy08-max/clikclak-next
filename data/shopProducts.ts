/*
  shopProducts.ts — catalogue produits shop ClikClak

  Règle : chaque produit doit correspondre à un dossier image réel dans
  /public/assets/images/shop/products/

  Tous les produits listés ici sont achetables (availability: 'en-stock', price > 0).

  IMPORTANT — PRIX : les valeurs marquées "PRIX À CONFIRMER" sont indicatives.
  Elles doivent être validées avant mise en production.
*/

/* ── Types ─────────────────────────────────────────────────────── */

export type ShopMainCategory =
  | 'occasion-neuf'
  | 'pieces-detachees'
  | 'accessoires-autres'

export type ShopCondition =
  | 'neuf'
  | 'occasion'
  | 'reconditionné'
  | 'compatible'
  | 'original'
  | 'sur-demande'

export type ShopAvailability =
  | 'en-stock'
  | 'sur-commande'
  | 'sur-demande'
  | 'rupture'

export interface ShopSpecs {
  storage?:       string
  batteryHealth?: string
  color?:         string
  grade?:         string
  warranty?:      string
}

export type ShopImageSource = 'real' | 'supplier' | 'generated' | 'placeholder'

/* ── Grade esthétique ──────────────────────────────────────────── */

export type ShopGrade = 'NEUF' | 'A+' | 'A' | 'B' | 'C' | 'A_CONFIRMER'

export const GRADE_LABELS: Record<ShopGrade, string> = {
  'NEUF':       'Neuf',
  'A+':         'A+',
  'A':          'A',
  'B':          'B',
  'C':          'C',
  'A_CONFIRMER': 'Grade à confirmer',
}

/*
  Le grade décrit l'état ESTHÉTIQUE (écran, coque, châssis, boutons, lentilles).
  Il ne remplace pas les infos techniques : batterie, stockage, tests, garantie.
*/
export const GRADE_DESCRIPTIONS: Record<ShopGrade, string> = {
  'NEUF':       'Produit neuf, vendu comme neuf. Les accessoires et conditions sont indiqués sur la fiche.',
  'A+':         'État esthétique excellent, très proche du neuf. Aucune rayure visible ni impact notable dans un usage normal.',
  'A':          'Très bon état esthétique. Micro-traces ou signes d\'utilisation très légers, généralement peu visibles.',
  'B':          'Bon état esthétique. Traces visibles possibles : petites rayures, marques sur la coque, les tranches ou le châssis.',
  'C':          'État esthétique plus marqué. Rayures, impacts ou signes d\'usure visibles. Le prix est généralement plus accessible.',
  'A_CONFIRMER': 'Le grade esthétique exact doit encore être confirmé. Les photos, l\'état général et les informations techniques restent prioritaires avant achat.',
}

export interface ShopProduct {
  id:                string
  slug:              string
  name:              string
  mainCategory:      ShopMainCategory
  subCategory?:      string
  brand?:            string
  model?:            string
  compatibleModels?: string[]
  condition?:        ShopCondition
  price:             number        // Prix en CHF
  availability:      ShopAvailability
  images:            string[]
  imageSource?:      ShopImageSource
  isIllustrative?:   boolean
  shortDescription:  string
  description?:      string
  specs?:            ShopSpecs
  comment?:          string
  tags?:             string[]
  grade?:            ShopGrade  // État esthétique — ne renseigner que si connu et vérifié
}

export const SHOP_CURRENCY = 'CHF' as const

/* ── Labels UI ─────────────────────────────────────────────────── */

export const MAIN_CATEGORY_LABELS: Record<ShopMainCategory, string> = {
  'occasion-neuf':      'Occasion et neuf',
  'pieces-detachees':   'Pièces détachées',
  'accessoires-autres': 'Accessoires / autres',
}

export const CONDITION_LABELS: Record<ShopCondition, string> = {
  'neuf':          'Neuf',
  'occasion':      'Occasion',
  'reconditionné': 'Reconditionné',
  'compatible':    'Compatible',
  'original':      'Original',
  'sur-demande':   'Sur demande',
}

export interface AvailabilityStyle {
  label:  string
  color:  string
  bg:     string
  border: string
}

export const AVAILABILITY_STYLES: Record<ShopAvailability, AvailabilityStyle> = {
  'en-stock':     { label: 'En stock',     color: '#ccff33',               bg: 'rgba(204,255,51,0.08)',   border: 'rgba(204,255,51,0.3)'   },
  'sur-commande': { label: 'Sur commande', color: 'rgba(255,200,80,0.9)',  bg: 'rgba(255,200,80,0.07)',   border: 'rgba(255,200,80,0.25)'  },
  'sur-demande':  { label: 'Sur demande',  color: 'rgba(242,242,242,0.5)', bg: 'rgba(242,242,242,0.04)',  border: 'rgba(242,242,242,0.15)' },
  'rupture':      { label: 'Rupture',      color: 'rgba(255,100,100,0.8)', bg: 'rgba(255,100,100,0.06)',  border: 'rgba(255,100,100,0.2)'  },
}

/* ── Badge produit unique ──────────────────────────────────────── */

export interface ProductBadge {
  label:    string
  isAccent: boolean  // true → lime, false → neutral
}

export function getProductBadge(product: ShopProduct): ProductBadge {
  const { mainCategory, condition } = product

  if (mainCategory === 'occasion-neuf') {
    if (condition === 'neuf')          return { label: 'Neuf',          isAccent: true }
    if (condition === 'reconditionné') return { label: 'Reconditionné', isAccent: true }
    if (condition === 'occasion')      return { label: 'Occasion',      isAccent: true }
    return { label: 'Occasion / Neuf', isAccent: false }
  }

  if (mainCategory === 'pieces-detachees') {
    if (condition === 'original')   return { label: 'Pièce originale',  isAccent: false }
    if (condition === 'compatible') return { label: 'Pièce compatible', isAccent: false }
    return { label: 'Pièce sur demande', isAccent: false }
  }

  /* accessoires-autres */
  if (condition === 'neuf')       return { label: 'Accessoire neuf',       isAccent: false }
  if (condition === 'compatible') return { label: 'Accessoire compatible', isAccent: false }
  return { label: 'Accessoire', isAccent: false }
}

/* ── Achetable ─────────────────────────────────────────────────── */

export function isProductPurchasable(p: ShopProduct): boolean {
  return p.availability === 'en-stock' && p.price > 0
}

/* ── Catalogue ─────────────────────────────────────────────────── */
/*
  Tous les produits présents ici ont une image réelle dans
  /public/assets/images/shop/products/

  Les prix marqués sont indicatifs — PRIX À CONFIRMER avant mise en production.
*/

export const SHOP_PRODUCTS: ShopProduct[] = [

  /* ── OCCASION ET NEUF ──────────────────────────────────────── */

  {
    id:               'iphone-15-pro-256gb-noir',
    slug:             'iphone-15-pro-256gb-noir',
    name:             'iPhone 15 Pro 256 Go — Noir',
    mainCategory:     'occasion-neuf',
    subCategory:      'Smartphones',
    brand:            'Apple',
    model:            'iPhone 15 Pro',
    condition:        'occasion',
    price:            749, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/occasion-neuf/iphone-15-pro-256gb-noir/main.webp',
      '/assets/images/shop/products/occasion-neuf/iphone-15-pro-256gb-noir/back.webp',
      '/assets/images/shop/products/occasion-neuf/iphone-15-pro-256gb-noir/side.webp',
      '/assets/images/shop/products/occasion-neuf/iphone-15-pro-256gb-noir/detail-camera.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'iPhone 15 Pro 256 Go, coloris Noir Titanium. Contrôlé et testé par ClikClak.',
    description:
      'iPhone 15 Pro 256 Go en coloris Noir Titanium. ' +
      'Appareil contrôlé et testé avant mise en vente. ' +
      'Disponibilité et état précisés au moment de la commande.',
    specs: {
      storage: '256 Go',
      color:   'Noir Titanium',
    },
    comment: 'Contactez-nous pour confirmer la disponibilité et l\'état exact de l\'appareil.',
    tags: ['iphone', 'iphone 15', 'iphone 15 pro', 'apple', 'occasion', 'smartphone', '256 go', 'noir', 'titanium'],
  },
  {
    id:               'samsung-galaxy-s22-rec-violet',
    slug:             'samsung-galaxy-s22-rec-violet',
    name:             'Samsung Galaxy S22 — Reconditionné Violet',
    mainCategory:     'occasion-neuf',
    subCategory:      'Smartphones',
    brand:            'Samsung',
    model:            'Galaxy S22',
    condition:        'reconditionné',
    price:            399, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    grade:            'A',
    images:           [
      '/assets/images/shop/products/occasion-neuf/samsung-galaxy-s22-rec-violet/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Samsung Galaxy S22 reconditionné, coloris Violet. Contrôlé et testé par ClikClak.',
    description:
      'Samsung Galaxy S22 reconditionné en coloris Violet. ' +
      'Appareil contrôlé et testé avant mise en vente.',
    specs: {
      color: 'Violet',
    },
    comment: 'Contactez-nous pour confirmer la disponibilité et l\'état exact de l\'appareil.',
    tags: ['samsung', 'galaxy', 's22', 'reconditionné', 'android', 'smartphone', 'violet'],
  },
  {
    id:               'iphone-12-mini-64gb',
    slug:             'iphone-12-mini-64gb',
    name:             'iPhone 12 mini 64 Go',
    mainCategory:     'occasion-neuf',
    subCategory:      'Smartphones',
    brand:            'Apple',
    model:            'iPhone 12 mini',
    condition:        'occasion',
    price:            229, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/occasion-neuf/iphone-12-mini-64gb/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'iPhone 12 mini 64 Go d\'occasion, contrôlé et testé par ClikClak.',
    description:
      'iPhone 12 mini 64 Go d\'occasion sélectionné par ClikClak. ' +
      'Appareil testé et vérifié avant mise en vente.',
    specs: {
      storage: '64 Go',
    },
    comment: 'Contactez-nous pour confirmer la disponibilité et l\'état exact de l\'appareil.',
    tags: ['iphone', 'iphone 12', 'iphone 12 mini', 'apple', 'occasion', 'smartphone', '64 go', 'mini'],
  },
  {
    id:               'iphone-x-pro-max-128gb-noir',
    slug:             'iphone-x-pro-max-128gb-noir',
    name:             'iPhone XS Max 128 Go — Noir',
    mainCategory:     'occasion-neuf',
    subCategory:      'Smartphones',
    brand:            'Apple',
    model:            'iPhone XS Max',
    condition:        'occasion',
    price:            279, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/occasion-neuf/iphone-x-pro-max-128gb-noir/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'iPhone XS Max 128 Go coloris Noir, d\'occasion, contrôlé et testé par ClikClak.',
    description:
      'iPhone XS Max 128 Go en coloris Noir, d\'occasion. ' +
      'Appareil testé et vérifié avant mise en vente.',
    specs: {
      storage: '128 Go',
      color:   'Noir',
    },
    comment: 'Contactez-nous pour confirmer la disponibilité et l\'état exact de l\'appareil.',
    tags: ['iphone', 'iphone xs max', 'iphone xs', 'apple', 'occasion', 'smartphone', '128 go', 'noir'],
  },
  {
    id:               'ipad-air-256gb',
    slug:             'ipad-air-256gb',
    name:             'iPad Air 256 Go',
    mainCategory:     'occasion-neuf',
    subCategory:      'Tablettes',
    brand:            'Apple',
    model:            'iPad Air',
    condition:        'occasion',
    price:            479, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/occasion-neuf/ipad-air-256gb/main.webp',
      '/assets/images/shop/products/occasion-neuf/ipad-air-256gb/front.webp',
      '/assets/images/shop/products/occasion-neuf/ipad-air-256gb/back.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'iPad Air 256 Go d\'occasion, contrôlé et testé par ClikClak.',
    description:
      'iPad Air 256 Go d\'occasion sélectionné par ClikClak. ' +
      'Appareil testé et vérifié avant mise en vente.',
    specs: {
      storage: '256 Go',
    },
    comment: 'Contactez-nous pour confirmer la disponibilité et l\'état exact de l\'appareil.',
    tags: ['ipad', 'ipad air', 'apple', 'occasion', 'tablette', '256 go'],
  },
  {
    id:               'macbook-pro-14-m1-512gb',
    slug:             'macbook-pro-14-m1-512gb',
    name:             'MacBook Pro 14" M1 — 512 Go',
    mainCategory:     'occasion-neuf',
    subCategory:      'Ordinateurs',
    brand:            'Apple',
    model:            'MacBook Pro 14"',
    condition:        'occasion',
    price:            1249, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/occasion-neuf/macbook-pro-14-m1-512gb/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'MacBook Pro 14" puce M1, 512 Go d\'occasion, contrôlé et testé par ClikClak.',
    description:
      'MacBook Pro 14" avec puce Apple M1, 512 Go d\'occasion. ' +
      'Appareil testé et vérifié avant mise en vente.',
    specs: {
      storage: '512 Go',
    },
    comment: 'Contactez-nous pour confirmer la disponibilité et la configuration exacte.',
    tags: ['macbook', 'macbook pro', 'apple', 'occasion', 'ordinateur', 'laptop', 'm1', '512 go', '14'],
  },

  /* ── PIÈCES DÉTACHÉES ───────────────────────────────────────── */

  {
    id:               'ecran-iphone-16-pro',
    slug:             'ecran-iphone-16-pro',
    name:             'Écran iPhone 16 Pro',
    mainCategory:     'pieces-detachees',
    subCategory:      'Écrans',
    brand:            'Apple',
    compatibleModels: ['iPhone 16 Pro', 'iPhone 16 Pro Max'],
    condition:        'compatible',
    price:            89, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/pieces-detachees/ecran-iphone-16-pro/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Dalle OLED de remplacement compatible pour iPhone 16 Pro / 16 Pro Max.',
    description:
      'Écran de remplacement compatible pour iPhone 16 Pro et iPhone 16 Pro Max. ' +
      'Dalle OLED qualité premium. Vérifiez la compatibilité avec votre modèle exact avant achat.',
    comment:
      'Ce type de pièce nécessite une installation soignée. ' +
      'ClikClak peut effectuer la pose en atelier si vous le souhaitez.',
    tags: ['ecran', 'iphone', 'iphone 16', 'iphone 16 pro', 'dalle', 'oled', 'remplacement'],
  },
  {
    id:               'batterie-iphone-12',
    slug:             'batterie-iphone-12',
    name:             'Batterie iPhone 12',
    mainCategory:     'pieces-detachees',
    subCategory:      'Batteries',
    brand:            'Apple',
    compatibleModels: ['iPhone 12', 'iPhone 12 mini', 'iPhone 12 Pro', 'iPhone 12 Pro Max'],
    condition:        'compatible',
    price:            39, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/pieces-detachees/batterie-iphone-12/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Batterie de remplacement compatible pour iPhone 12 / 12 mini / 12 Pro / 12 Pro Max.',
    description:
      'Batterie compatible pour iPhone 12 (et variantes). Capacité proche de l\'originale. ' +
      'Installation possible en atelier ClikClak.',
    tags: ['batterie', 'iphone', 'iphone 12', 'battery', 'autonomie'],
  },
  {
    id:               'connecteur-charge-galaxy-s23',
    slug:             'connecteur-charge-galaxy-s23',
    name:             'Connecteur de charge Galaxy S23',
    mainCategory:     'pieces-detachees',
    subCategory:      'Connecteurs de charge',
    brand:            'Samsung',
    compatibleModels: ['Galaxy S23', 'Galaxy S23+', 'Galaxy S23 Ultra'],
    condition:        'compatible',
    price:            29, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/pieces-detachees/connecteur-charge-galaxy-s23/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Connecteur USB-C de charge compatible pour Samsung Galaxy S23 / S23+ / S23 Ultra.',
    comment: 'ClikClak peut effectuer la pose en atelier si vous le souhaitez.',
    tags: ['connecteur', 'usb-c', 'samsung', 'galaxy', 's23', 'charge'],
  },
  {
    id:               'connecteur-charge-huawei-p30',
    slug:             'connecteur-charge-huawei-p30',
    name:             'Connecteur de charge Huawei P30',
    mainCategory:     'pieces-detachees',
    subCategory:      'Connecteurs de charge',
    brand:            'Huawei',
    compatibleModels: ['Huawei P30', 'Huawei P30 Pro'],
    condition:        'compatible',
    price:            25, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/pieces-detachees/connecteur-charge-huawei-p30/main.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Connecteur de charge compatible pour Huawei P30 / P30 Pro.',
    comment: 'ClikClak peut effectuer la pose en atelier si vous le souhaitez.',
    tags: ['connecteur', 'huawei', 'p30', 'charge'],
  },

  /* ── ACCESSOIRES / AUTRES ───────────────────────────────────── */

  {
    id:               'coque-iphone-15-pro-transparente',
    slug:             'coque-iphone-15-pro-transparente',
    name:             'Coque iPhone 15 Pro — Transparente',
    mainCategory:     'accessoires-autres',
    subCategory:      'Coques',
    condition:        'neuf',
    brand:            'Apple',
    compatibleModels: ['iPhone 15 Pro'],
    price:            24, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    grade:            'NEUF',
    images:           [
      '/assets/images/shop/products/accessoires-autres/coque-iphone-15-pro-transparente/main.webp',
      '/assets/images/shop/products/accessoires-autres/coque-iphone-15-pro-transparente/side.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Coque transparente neuve pour iPhone 15 Pro.',
    tags: ['coque', 'iphone 15 pro', 'apple', 'transparente', 'protection', 'neuf'],
  },
  {
    id:               'cable-usb-c',
    slug:             'cable-usb-c',
    name:             'Câble USB-C / Lightning',
    mainCategory:     'accessoires-autres',
    subCategory:      'Câbles',
    price:            19, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/accessoires-autres/cable-usb-c-lightning/main.webp',
      '/assets/images/shop/products/accessoires-autres/cable-usb-c-lightning/detail_usb-c.webp',
      '/assets/images/shop/products/accessoires-autres/cable-usb-c-lightning/detail_lighning.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Câble de charge et synchronisation USB-C / Lightning.',
    tags: ['cable', 'usb-c', 'usbc', 'lightning', 'charge', 'data', 'iphone'],
  },
  {
    id:               'chargeur-rapide',
    slug:             'chargeur-rapide',
    name:             'Chargeur rapide',
    mainCategory:     'accessoires-autres',
    subCategory:      'Chargeurs',
    price:            35, /* PRIX À CONFIRMER */
    availability:     'en-stock',
    images:           [
      '/assets/images/shop/products/accessoires-autres/chargeur-usb-c-20w/main.webp',
      '/assets/images/shop/products/accessoires-autres/chargeur-usb-c-20w/back.webp',
    ],
    imageSource:      'real',
    isIllustrative:   false,
    shortDescription: 'Bloc de charge rapide compatible selon votre appareil.',
    tags: ['chargeur', 'charge', 'rapide', 'adaptateur', 'bloc'],
  },
]
