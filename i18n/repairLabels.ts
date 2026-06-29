/*
  i18n/repairLabels.ts — Centralized translation helpers for repair labels.

  All visible repair-related French strings are translated here at display level.
  Data files (data/*.ts) are NOT modified — this file translates at render time.

  Usage:
    import { getRepairLabel, getRepairPrice, ... } from '@/i18n/repairLabels'
*/

export type RepairLocale = 'fr' | 'en'

/* ── 1. Repair label translation map ──────────────────────────────────────── */
const REPAIR_LABEL_MAP: Record<string, string> = {
  // Screen
  'Écran':                               'Screen',
  'Écran & vitre':                       'Screen & glass',
  'Écran & vitre iPad':                  'iPad screen & glass',
  'Vitre':                               'Glass',
  'Vitre iPad':                          'iPad glass',
  'Vitre arrière / Châssis':             'Back glass / Frame',
  'Face arrière':                        'Back glass',
  'Remplacement d\'écran':               'Screen replacement',
  'Changement d\'écran':                 'Screen replacement',
  'Remplacement de l\'écran':            'Screen replacement',
  // Battery
  'Batterie':                            'Battery',
  'Batterie iPad Mini':                  'iPad Mini battery',
  'Remplacement de batterie':            'Battery replacement',
  'Remplacement batterie':               'Battery replacement',
  // Charging
  'Connecteur de charge':                'Charging port',
  'Connecteur de charge ou NFC':         'Charging port or NFC',
  'Connecteur de charge / USB-C / MagSafe': 'Charging port / USB-C / MagSafe',
  // Camera
  'Caméra':                              'Camera',
  'Caméra principale':                   'Main camera',
  'Caméra frontale':                     'Front camera',
  'Lentille caméra':                     'Camera lens',
  'Caméra arrière':                      'Rear camera',
  // Buttons
  'Boutons Home / Volume / Power':       'Home / Volume / Power buttons',
  'Bouton Home':                         'Home button',
  'Bouton Power':                        'Power button',
  'Bouton Volume':                       'Volume button',
  // Diagnostics
  'Diagnostic':                          'Diagnostics',
  // MacBook-specific
  'Clavier':                             'Keyboard',
  'Trackpad':                            'Trackpad',
  'Haut-parleurs':                       'Speakers',
  'Ventilateur / nettoyage interne':     'Fan / internal cleaning',
  'Nettoyage interne':                   'Internal cleaning',
  'Surchauffe':                          'Overheating',
  'Problème logiciel':                   'Software issue',
  'Récupération de données':             'Data recovery',
  'Dégâts d\'eau / oxydation':           'Water damage / oxidation',
  'Nettoyage':                           'Cleaning',
  // Touch/Face ID
  'Face ID':                             'Face ID',
  'Touch ID':                            'Touch ID',
  // Other
  'Microphone':                          'Microphone',
  'Dos en verre':                        'Back glass',
  'Châssis':                             'Frame',
}

/* ── 2. Price string translation map ──────────────────────────────────────── */
const PRICE_STRING_MAP: Record<string, Record<RepairLocale, string>> = {
  'Sur devis':                    { fr: 'Sur devis',                    en: 'Quote required' },
  'Sur demande':                  { fr: 'Sur demande',                  en: 'On request' },
  'Ne peut pas être remplacé':    { fr: 'Ne peut pas être remplacé',    en: 'Cannot be replaced' },
}

/* ── 3. Model label suffix map ─────────────────────────────────────────────── */
const MODEL_SUFFIX_MAP: Array<{ fr: RegExp; en: string }> = [
  { fr: /\s*et supérieur/g,           en: ' and later' },
  { fr: /\s*ou supérieur/g,           en: ' or later' },
  { fr: /\s*à\s*/g,                   en: ' to ' },   // for "2016 à 2019"
  { fr: /\s*ou\s+(\d{4})$/g,         en: ' or $1' },  // for "2016 ou 2017"
]

/* ── 4. Repair note map ─────────────────────────────────────────────────────── */
const REPAIR_NOTE_MAP: Record<string, string> = {
  'ipad':    'Prices are indicative and may vary depending on the device condition and parts availability. A diagnostic is carried out before any intervention.',
  'macbook': 'MacBook and iMac prices are indicative and may vary depending on the exact configuration, parts availability and the condition of the device. A diagnostic assessment may be required before the price can be confirmed.',
  'samsung': 'Most Samsung repairs are carried out in-store in Lausanne. Turnaround depends on parts availability.',
  'huawei':  'Huawei repair in Lausanne. Contact us for any unlisted model or for a diagnostic.',
  'oppo':    'OPPO repair in Lausanne. Contact us for any unlisted model or for a diagnostic.',
  'sony':    'Sony Xperia prices are indicative and may vary depending on parts availability and the condition of the device.',
  'default': 'Prices are indicative and may vary. Contact us for a diagnostic.',
}

/* ── 5. Unknown label tracking (dev only) ───────────────────────────────────── */
const UNKNOWN_EN_LABELS = new Set<string>()

export function getUnknownLabels(): string[] {
  return [...UNKNOWN_EN_LABELS]
}

/* ══════════════════════════════════════════════════════════════════════════════
   Helper functions
══════════════════════════════════════════════════════════════════════════════ */

/**
 * Translates a French repair label to English.
 * When locale='fr', returns the label unchanged.
 * When locale='en' and label not found, tracks it and returns original.
 */
export function getRepairLabel(frLabel: string, locale: RepairLocale): string {
  if (locale === 'fr') return frLabel
  const en = REPAIR_LABEL_MAP[frLabel]
  if (en !== undefined) return en
  UNKNOWN_EN_LABELS.add(frLabel)
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[repairLabels] Unknown EN repair label: "${frLabel}"`)
  }
  return frLabel
}

/**
 * Translates a price value to locale-appropriate string.
 * Number prices are always formatted as CHF amount.
 * String prices (e.g. 'Sur devis') are translated for EN.
 */
export function getRepairPrice(price: string | number, locale: RepairLocale): string {
  if (typeof price === 'number') {
    return `CHF ${Math.trunc(price)}`
  }
  if (locale === 'fr') return price
  const mapping = PRICE_STRING_MAP[price]
  if (mapping) return mapping[locale]
  // If it looks like a CHF price, return as-is
  return price
}

/**
 * Applies French→EN suffix replacements to model labels.
 * E.g. "MacBook Air 2016 et supérieur" → "MacBook Air 2016 and later"
 */
export function normalizeModelLabel(label: string, locale: RepairLocale): string {
  if (locale === 'fr') return label
  let result = label
  for (const { fr, en } of MODEL_SUFFIX_MAP) {
    result = result.replace(fr, en)
  }
  return result
}

/**
 * Returns the "From:" prefix label for pricing.
 */
export function getPricePrefix(locale: RepairLocale): string {
  return locale === 'en' ? 'From:' : 'À partir de :'
}

/**
 * Returns the aria-label for the price info button.
 */
export function getPriceInfoLabel(locale: RepairLocale): string {
  return locale === 'en' ? 'Price information' : 'Informations sur le prix affiché'
}

/**
 * Returns the tooltip text explaining price variability.
 */
export function getPriceInfoTooltipText(locale: RepairLocale): string {
  return locale === 'en'
    ? 'Several replacement part qualities are available depending on the model. The final choice is confirmed in-store.'
    : 'Plusieurs qualités de pièces de rechange existent selon le modèle. Le choix est à confirmer en magasin.'
}

/**
 * Returns the "no model found" message for the search dropdown.
 */
export function getNoModelFoundText(query: string, locale: RepairLocale): string {
  return locale === 'en'
    ? `No model found for "${query}"`
    : `Aucun modèle trouvé pour « ${query} »`
}

/**
 * Returns the "View pricing →" link label in search results.
 */
export function getViewPricingText(locale: RepairLocale): string {
  return locale === 'en' ? 'View pricing →' : 'Voir les tarifs →'
}

/**
 * Returns the aria-label for the device search input.
 */
export function getSearchAriaLabel(locale: RepairLocale): string {
  return locale === 'en' ? 'Search for a device' : 'Rechercher un appareil'
}

/**
 * Returns the English version of a brand repairNote,
 * or undefined if the brand note is not known.
 */
export function getRepairNoteEN(brandNote: string | undefined, brand: string): string | undefined {
  const key = brand.toLowerCase()
  if (key in REPAIR_NOTE_MAP) return REPAIR_NOTE_MAP[key]
  return REPAIR_NOTE_MAP['default']
}

/* Re-export formatPrice for convenience */
export { formatPrice } from '@/data/repairTypes'
