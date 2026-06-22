/*
  lib/chatbot/repairPricing.ts

  Résolveur déterministe de tarifs de réparation.
  Lit uniquement les données réelles via repairPricesIndex.ts.
  Aucun prix n'est inventé, estimé ou calculé.

  Retourne une structure PricingMatch utilisée par app/api/chatbot/route.ts
  pour construire une réponse SANS appeler Anthropic lorsque les données existent.
*/

import {
  searchRepairPrices,
  getRepairIndex,
  REPAIR_BRAND_HREFS,
  REPAIR_BRAND_LABELS,
  type RepairBrand,
} from './repairPricesIndex'
import { normalizeText } from './normalizeSearch'

/* ── Types ─────────────────────────────────────────────────────── */

export type PricingStatus =
  | 'found'          // Correspondance marque + modèle + réparation — prix retourné
  | 'no_price'       // Correspondance exacte — prix sur demande uniquement
  | 'model_needed'   // Marque + réparation trouvées, modèle manquant
  | 'repair_needed'  // Marque + modèle trouvés, type de réparation manquant
  | 'brand_only'     // Marque trouvée seulement
  | 'not_found'      // Aucune correspondance

export type PricingEntry = { label: string; price: string; href: string }

export type PricingMatch = {
  status:       PricingStatus
  brand?:       string        // "iPhone", "Samsung"…
  brandHref?:   string        // page listing tarifs de la marque
  model?:       string        // "iPhone 14 Pro"
  modelHref?:   string        // page spécifique du modèle (iPhone) ou listing (autres)
  repairLabel?: string        // "Écran", "Batterie", "Connecteur de charge"…
  results?:     PricingEntry[]
}

/* ── Détection de la marque ─────────────────────────────────────── */

const BRAND_TOKENS: Array<{ brand: RepairBrand; tokens: string[] }> = [
  { brand: 'iphone',  tokens: ['iphone', 'i phone'] },
  { brand: 'ipad',    tokens: ['ipad', 'i pad']     },
  { brand: 'macbook', tokens: ['macbook', 'mac book', 'macbook pro', 'macbook air'] },
  { brand: 'samsung', tokens: ['samsung', 'galaxy'] },
  { brand: 'huawei',  tokens: ['huawei', 'honor']   },
  { brand: 'oppo',    tokens: ['oppo', 'find x', 'reno'] },
]

function detectBrand(norm: string): RepairBrand | null {
  for (const { brand, tokens } of BRAND_TOKENS) {
    if (tokens.some(t => norm.includes(normalizeText(t)))) return brand
  }
  return null
}

/* ── Détection du type de réparation ───────────────────────────── */

type RepairToken = { key: string; label: string; tokens: string[] }

const REPAIR_TOKENS: RepairToken[] = [
  {
    key:    'screen',
    label:  'Écran',
    tokens: [
      'ecran casse', 'changer ecran', 'remplacer ecran', 'reparation ecran',
      'vitre cassee', 'vitre brisee', 'vitre fissuree',
      'ecran', 'vitre', 'screen', 'lcd', 'oled', 'display', 'affichage',
      'casse', 'fissure', 'brise', 'craque', 'tactile',
    ],
  },
  {
    key:    'battery',
    label:  'Batterie',
    tokens: [
      'changer batterie', 'remplacer batterie', 'reparation batterie',
      'batterie', 'battery', 'autonomie', 'decharge', 'ne charge plus',
      'charge lente', 'se decharge', 'gonflee',
    ],
  },
  {
    key:    'connector',
    label:  'Connecteur de charge',
    tokens: [
      'connecteur de charge', 'port de charge', 'prise de charge',
      'connecteur', 'lightning', 'usb-c', 'usbc', 'usb c',
      'ne se charge pas', 'ne charge pas', 'branchement',
    ],
  },
  {
    key:    'camera',
    label:  'Caméra',
    tokens: [
      'camera principale', 'camera frontale', 'photo floue',
      'camera', 'photo', 'objectif', 'lentille', 'flash',
    ],
  },
  {
    key:    'backglass',
    label:  'Vitre arrière',
    tokens: [
      'vitre arriere', 'dos casse', 'face arriere', 'vitre dos',
      'chassis', 'dos du telephone',
    ],
  },
  {
    key:    'diagnostic',
    label:  'Diagnostic',
    tokens: [
      'ne s allume plus', 'ne s allume pas', 'eteint', 's eteint tout seul',
      'plante', 'bug', 'probleme', 'diagnostic',
    ],
  },
]

function detectRepairType(norm: string): RepairToken | null {
  let best: (RepairToken & { matchLen: number }) | null = null
  for (const rt of REPAIR_TOKENS) {
    for (const token of rt.tokens) {
      const t = normalizeText(token)
      if (norm.includes(t)) {
        if (!best || t.length > best.matchLen) {
          best = { ...rt, matchLen: t.length }
        }
      }
    }
  }
  return best
}

/* ── Détection du modèle ────────────────────────────────────────── */

/* Mots génériques à retirer avant la correspondance partielle.
   "iphone" est inclus pour permettre le matching de "14 pro" seul dans une requête
   comme "et pour le 14 pro ?" → "iphone 14 pro" stripped = "14 pro" → match ✓ */
const STRIP_WORDS = ['iphone', 'galaxy', 'apple', 'macbook', 'huawei', 'oppo', 'honor']

function modelMatchScore(modelNorm: string, queryNorm: string): number {
  /* Niveau 1 : label complet inclus dans la requête */
  if (queryNorm.includes(modelNorm)) return modelNorm.length * 2

  /* Niveau 2 : label sans mots génériques inclus dans la requête */
  const stripped = STRIP_WORDS
    .reduce((s, w) => s.replace(new RegExp(`\\b${w}\\b`, 'g'), ''), modelNorm)
    .trim()
    .replace(/\s+/g, ' ')

  if (stripped.length >= 2 && queryNorm.includes(stripped)) return stripped.length

  return 0
}

function detectModel(norm: string, brand: RepairBrand): string | null {
  const index = getRepairIndex()

  /* Collecte les modèles uniques pour cette marque */
  const modelMap = new Map<string, string>() // modelNorm → modelLabel
  for (const e of index) {
    if (e.brand !== brand) continue
    const n = normalizeText(e.modelLabel)
    if (!modelMap.has(n)) modelMap.set(n, e.modelLabel)
  }

  let best: { label: string; score: number } | null = null

  for (const [modelNorm, modelLabel] of modelMap) {
    const score = modelMatchScore(modelNorm, norm)
    if (score > 0 && (!best || score > best.score)) {
      best = { label: modelLabel, score }
    }
  }

  return best?.label ?? null
}

/* ── Résolveur principal ────────────────────────────────────────── */

/**
 * Retourne le token de marque (ex: "iphone") détecté dans un message.
 * Utilisé par la route pour construire des requêtes augmentées multi-tour.
 */
export function detectBrandTokenFromMessage(message: string): string | null {
  const brand = detectBrand(normalizeText(message))
  if (!brand) return null
  return BRAND_TOKENS.find(b => b.brand === brand)?.tokens[0] ?? null
}

/**
 * Retourne le premier token de réparation (ex: "ecran") détecté dans un message.
 */
export function detectRepairTokenFromMessage(message: string): string | null {
  return detectRepairType(normalizeText(message))?.tokens[0] ?? null
}

/**
 * Analyse un message et retourne une correspondance tarifaire déterministe.
 * Ne fait aucun appel réseau, ne génère aucun prix.
 */
export function resolveRepairPricing(message: string): PricingMatch {
  const norm = normalizeText(message)

  const brand = detectBrand(norm)
  if (!brand) return { status: 'not_found' }

  const brandLabel = REPAIR_BRAND_LABELS[brand]
  const brandHref  = REPAIR_BRAND_HREFS[brand]
  const repair     = detectRepairType(norm)
  const model      = detectModel(norm, brand)

  /* Marque seule */
  if (!model && !repair) {
    return { status: 'brand_only', brand: brandLabel, brandHref }
  }

  /* Réparation détectée, modèle manquant */
  if (!model && repair) {
    return { status: 'model_needed', brand: brandLabel, brandHref, repairLabel: repair.label }
  }

  /* Modèle détecté, réparation manquante */
  if (model && !repair) {
    const entries = searchRepairPrices({ brand, modelQuery: model })
    const href    = entries[0]?.href ?? brandHref
    return { status: 'repair_needed', brand: brandLabel, model, modelHref: href }
  }

  /* Marque + modèle + réparation → recherche tarifaire
     Filtre par correspondance exacte de label pour éviter que "iPhone 14 Pro"
     matche aussi "iPhone 14 Pro Max" (substring match de searchRepairPrices). */
  const rawResults = searchRepairPrices({
    brand,
    modelQuery: model!,
    repairType: repair!.key,
  })

  const modelNormExact = normalizeText(model!)
  const results = rawResults.filter(
    r => normalizeText(r.modelLabel) === modelNormExact
  )

  if (results.length === 0) {
    return { status: 'not_found', brand: brandLabel, brandHref }
  }

  /* Déduplique par label de réparation (au cas où la source contient un doublon) */
  const seen = new Set<string>()
  const entries: PricingEntry[] = []
  for (const r of results) {
    if (seen.has(r.repairLabel)) continue
    seen.add(r.repairLabel)
    entries.push({ label: r.repairLabel, price: r.price, href: r.href })
  }

  const href      = entries[0].href
  const hasPrices = entries.some(e => e.price.startsWith('CHF'))

  if (!hasPrices) {
    return {
      status:      'no_price',
      brand:       brandLabel,
      model:       model!,
      repairLabel: repair!.label,
      modelHref:   href,
      results:     entries,
    }
  }

  return {
    status:      'found',
    brand:       brandLabel,
    model:       model!,
    repairLabel: repair!.label,
    modelHref:   href,
    results:     entries,
  }
}

/* ── Formateurs de réponse ──────────────────────────────────────── */

export type ChatbotAction = {
  label:    string
  href:     string
  /** 'button' → CTA secondaire (Contact) | 'link' → lien texte lime (tarifs, réparation) */
  variant?: 'button' | 'link'
}

export type PricingResponse = {
  answer:  string
  actions: ChatbotAction[]
}

/* Formate un prix : "CHF 259.99" → "CHF 259.–" */
function fmtPrice(raw: string): string {
  return raw.replace(/^(CHF\s*)(\d+)\.\d+$/, '$1$2.–').replace(/^(CHF\s*)(\d+)$/, '$1$2.–')
}

const CONTACT_HREF  = '/contact-clik-clak-lausanne'
const BTN: ChatbotAction['variant']  = 'button'
const LINK: ChatbotAction['variant'] = 'link'

/**
 * Construit le nom d'appareil affiché dans la réponse.
 * Si le modèle commence déjà par le nom de la marque (ex: "iPhone 14 Pro"),
 * on n'ajoute pas le brand en préfixe pour éviter "iPhone iPhone 14 Pro".
 */
function deviceName(brand: string, model: string): string {
  const brandNorm = normalizeText(brand).split(' ')[0] // "iphone", "samsung"…
  if (normalizeText(model).startsWith(brandNorm)) return model
  return `${brand} ${model}`
}

export function buildPricingResponse(match: PricingMatch): PricingResponse {
  switch (match.status) {

    case 'found': {
      const entries = match.results!
      const device  = deviceName(match.brand!, match.model!)
      const repair  = match.repairLabel!.toLowerCase()
      const actions: ChatbotAction[] = []

      if (match.modelHref) {
        actions.push({ label: 'Voir les détails', href: match.modelHref, variant: LINK })
      }
      actions.push({ label: 'Nous contacter', href: CONTACT_HREF, variant: BTN })

      if (entries.length === 1) {
        const e = entries[0]
        return {
          answer: `Bien sûr. Le ${repair} du ${device} est proposé à **${fmtPrice(e.price)}**.\n\nConsultez la page ci-dessous pour les détails ou contactez l'atelier.`,
          actions,
        }
      }

      const lines = entries.map(e => `**${e.label} : ${fmtPrice(e.price)}**`).join('\n')
      return {
        answer: `Voici les options disponibles pour le ${repair} du ${device} :\n\n${lines}\n\nContactez l'atelier pour choisir l'option la plus adaptée.`,
        actions,
      }
    }

    case 'no_price': {
      const device  = deviceName(match.brand!, match.model!)
      const actions: ChatbotAction[] = [
        { label: 'Nous contacter', href: CONTACT_HREF, variant: BTN },
      ]
      if (match.modelHref) {
        actions.unshift({ label: 'Voir la page réparation', href: match.modelHref, variant: LINK })
      }
      return {
        answer: `Je n'ai pas de tarif publié pour cette réparation sur le ${device}. Contactez l'atelier pour obtenir un devis précis.`,
        actions,
      }
    }

    case 'model_needed': {
      const brand = match.brand!
      return {
        answer: `Quel est le modèle exact de votre ${brand} ?\n\n(exemple : ${brand} 14, ${brand} 15 Pro…)`,
        actions: [{ label: `Tarifs ${brand}`, href: match.brandHref!, variant: LINK }],
      }
    }

    case 'repair_needed': {
      const device = deviceName(match.brand!, match.model!)
      return {
        answer: `Quelle réparation souhaitez-vous effectuer sur votre ${device} ?\n\nÉcran, batterie, connecteur de charge ou autre ?`,
        actions: [
          { label: 'Voir les tarifs', href: match.modelHref!, variant: LINK },
          { label: 'Nous contacter', href: CONTACT_HREF, variant: BTN },
        ],
      }
    }

    case 'brand_only': {
      return {
        answer: `Je vais vous aider avec votre ${match.brand!}. Quel modèle avez-vous et quel type de réparation souhaitez-vous ?`,
        actions: [{ label: `Tarifs ${match.brand!}`, href: match.brandHref!, variant: LINK }],
      }
    }

    default:
      return {
        answer:  '',
        actions: [],
      }
  }
}
