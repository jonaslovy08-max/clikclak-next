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
import { localizeChatbotHref } from './i18n'
import type { ChatbotLocale } from './locale'

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
      /* FR */
      'ecran casse', 'changer ecran', 'remplacer ecran', 'reparation ecran',
      'vitre cassee', 'vitre brisee', 'vitre fissuree',
      'ecran', 'vitre', 'lcd', 'oled', 'affichage',
      'casse', 'fissure', 'brise', 'craque', 'tactile',
      /* EN */
      'screen', 'display', 'broken screen', 'cracked screen', 'replace screen',
      'screen repair', 'shattered', 'cracked', 'glass replacement',
    ],
  },
  {
    key:    'battery',
    label:  'Batterie',
    tokens: [
      /* FR */
      'changer batterie', 'remplacer batterie', 'reparation batterie',
      'batterie', 'autonomie', 'decharge', 'ne charge plus',
      'charge lente', 'se decharge', 'gonflee',
      /* EN */
      'battery', 'replace battery', 'battery replacement', 'wont charge',
      'not charging', 'drains fast', 'swollen battery', 'poor battery life',
    ],
  },
  {
    key:    'connector',
    label:  'Connecteur de charge',
    tokens: [
      /* FR */
      'connecteur de charge', 'port de charge', 'prise de charge',
      'connecteur', 'lightning', 'usb-c', 'usbc', 'usb c',
      'ne se charge pas', 'ne charge pas', 'branchement',
      /* EN */
      'charging port', 'charging issue', 'wont charge', 'not charging',
      'charging socket',
    ],
  },
  {
    key:    'camera',
    label:  'Caméra',
    tokens: [
      /* FR */
      'camera principale', 'camera frontale', 'photo floue',
      'camera', 'photo', 'objectif', 'lentille', 'flash',
      /* EN */
      'main camera', 'front camera', 'blurry photo', 'lens', 'camera lens',
    ],
  },
  {
    key:    'backglass',
    label:  'Vitre arrière',
    tokens: [
      /* FR */
      'vitre arriere', 'dos casse', 'face arriere', 'vitre dos',
      'chassis', 'dos du telephone',
      /* EN */
      'back glass', 'rear glass', 'cracked back', 'back cover',
    ],
  },
  {
    key:    'diagnostic',
    label:  'Diagnostic',
    tokens: [
      /* FR */
      'ne s allume plus', 'ne s allume pas', 'eteint', 's eteint tout seul',
      'plante', 'bug', 'probleme', 'diagnostic',
      /* EN */
      'wont turn on', 'not turning on', 'wont power on', 'frozen', 'crashes',
      'diagnostics', 'issue', 'problem', 'malfunction',
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

/** Localise un href métier (FR par défaut) selon la locale du chatbot. */
function loc(href: string, locale: ChatbotLocale): string {
  return localizeChatbotHref(href, locale)
}

/* ── Helpers grammaticaux français ─────────────────────────────── */

const VOWELS = 'aeiouàâäéèêëîïôùûüœæ'

/** Vrai si le mot commence par une voyelle (pour l'élision). */
function startsWithVowel(s: string): boolean {
  return VOWELS.includes(s.trim()[0]?.toLowerCase() ?? '')
}

/**
 * "de l'iPhone 12"  | "du Samsung Galaxy S24"
 * Gère l'élision devant voyelle et "du" devant consonne.
 */
function deAppareil(device: string): string {
  return startsWithVowel(device) ? `de l'${device}` : `du ${device}`
}

/** Informations grammaticales d'un label de réparation. */
type ReparationInfo = {
  /** Article de début de phrase ("Le", "La", "L'"). */
  article: 'Le' | 'La' | "L'"
  /** Syntagme nominal sans article, ex : "remplacement de l'écran". */
  phrase:  string
  /** true si le sujet est masculin (pour l'accord "proposé" vs "proposée"). */
  masc:    boolean
}

/**
 * Retourne la structure grammaticale correcte pour un label de réparation.
 * Centralise toutes les règles de genre et d'élision.
 */
function getReparationInfo(repairLabel: string): ReparationInfo {
  const n = normalizeText(repairLabel) // lowercase + sans accents

  /* Écran (et variantes "Écran & vitre", "Écran LCD"…) */
  if (n.includes('ecran')) {
    return { article: 'Le', phrase: "remplacement de l'écran", masc: true }
  }

  /* Batterie */
  if (n.includes('batt')) {
    return { article: 'Le', phrase: 'remplacement de la batterie', masc: true }
  }

  /* Connecteur de charge / NFC */
  if (n.includes('connect') || n.includes('charge') || n.includes('nfc')) {
    return { article: 'La', phrase: 'réparation du connecteur de charge', masc: false }
  }

  /* Vitre arrière / châssis / face arrière / dos */
  if (n.includes('vitre') || n.includes('chassis') || n.includes('dos')) {
    return { article: 'Le', phrase: 'remplacement de la vitre arrière', masc: true }
  }

  /* Lentille caméra */
  if (n.includes('lentille')) {
    return { article: 'Le', phrase: 'remplacement de la lentille caméra', masc: true }
  }

  /* Caméra principale / frontale / générique */
  if (n.includes('camera') || n.includes('camero') || n.includes('photo')) {
    if (n.includes('principal') || n.includes('arriere')) {
      return { article: 'La', phrase: 'réparation de la caméra principale', masc: false }
    }
    if (n.includes('frontal')) {
      return { article: 'La', phrase: 'réparation de la caméra frontale', masc: false }
    }
    return { article: 'La', phrase: 'réparation de la caméra', masc: false }
  }

  /* Diagnostic */
  if (n.includes('diagn')) {
    return { article: 'Le', phrase: 'diagnostic', masc: true }
  }

  /* Fallback générique — élision si début par voyelle */
  if (startsWithVowel(repairLabel)) {
    return { article: "L'", phrase: repairLabel, masc: true }
  }
  return { article: 'La', phrase: `réparation de ${repairLabel.toLowerCase()}`, masc: false }
}

/**
 * Équivalent anglais de getReparationInfo — pas de genre ni d'élision
 * en anglais, donc une simple phrase suffit.
 */
function getReparationPhraseEn(repairLabel: string): string {
  const n = normalizeText(repairLabel)

  if (n.includes('ecran')) return 'screen replacement'
  if (n.includes('batt')) return 'battery replacement'
  if (n.includes('connect') || n.includes('charge') || n.includes('nfc')) return 'charging port repair'
  if (n.includes('vitre') || n.includes('chassis') || n.includes('dos')) return 'back glass replacement'
  if (n.includes('lentille')) return 'camera lens replacement'
  if (n.includes('camera') || n.includes('camero') || n.includes('photo')) {
    if (n.includes('principal') || n.includes('arriere')) return 'main camera repair'
    if (n.includes('frontal')) return 'front camera repair'
    return 'camera repair'
  }
  if (n.includes('diagn')) return 'diagnostic'

  return `${repairLabel.toLowerCase()} repair`
}

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

function buildPricingResponseFr(match: PricingMatch): PricingResponse {
  switch (match.status) {

    case 'found': {
      const entries = match.results!
      const device  = deviceName(match.brand!, match.model!)
      const rep     = getReparationInfo(match.repairLabel!)
      const deApp   = deAppareil(device)
      const actions: ChatbotAction[] = []

      if (match.modelHref) {
        actions.push({ label: 'Voir les détails', href: match.modelHref, variant: LINK })
      }
      actions.push({ label: 'Nous contacter', href: CONTACT_HREF, variant: BTN })

      /* Accord du participe passé ("proposé" ou "proposée") */
      const passe = rep.masc ? 'proposé' : 'proposée'

      if (entries.length === 1) {
        const e = entries[0]
        return {
          answer: `Bien sûr. ${rep.article} ${rep.phrase} ${deApp} est ${passe} à ${fmtPrice(e.price)}.\n\nConsultez la page ci-dessous pour les détails ou contactez l'atelier.`,
          actions,
        }
      }

      /* Plusieurs options — liste sans Markdown brut */
      const lines = entries.map(e => `${e.label} : ${fmtPrice(e.price)}`).join('\n')
      return {
        answer: `Voici les options disponibles pour ${rep.article === "L'" ? "l'" : rep.article.toLowerCase() + ' '}${rep.phrase} ${deApp} :\n\n${lines}\n\nContactez l'atelier pour choisir l'option la plus adaptée.`,
        actions,
      }
    }

    case 'no_price': {
      const device  = deviceName(match.brand!, match.model!)
      const rep     = getReparationInfo(match.repairLabel ?? 'réparation')
      const deApp   = deAppareil(device)
      const actions: ChatbotAction[] = [
        { label: 'Nous contacter', href: CONTACT_HREF, variant: BTN },
      ]
      if (match.modelHref) {
        actions.unshift({ label: 'Voir la page réparation', href: match.modelHref, variant: LINK })
      }
      return {
        answer: `Je n'ai pas de tarif publié pour ${rep.article === "L'" ? "l'" : rep.article.toLowerCase() + ' '}${rep.phrase} ${deApp}. Contactez l'atelier pour obtenir un devis précis.`,
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
      return { answer: '', actions: [] }
  }
}

function buildPricingResponseEn(match: PricingMatch): PricingResponse {
  switch (match.status) {

    case 'found': {
      const entries = match.results!
      const device  = deviceName(match.brand!, match.model!)
      const phrase  = getReparationPhraseEn(match.repairLabel!)
      const actions: ChatbotAction[] = []

      if (match.modelHref) {
        actions.push({ label: 'View details', href: loc(match.modelHref, 'en'), variant: LINK })
      }
      actions.push({ label: 'Contact us', href: loc(CONTACT_HREF, 'en'), variant: BTN })

      if (entries.length === 1) {
        const e = entries[0]
        return {
          answer: `Sure. The ${phrase} for the ${device} is ${fmtPrice(e.price)}.\n\nSee the page below for details or contact the workshop.`,
          actions,
        }
      }

      const lines = entries.map(e => `${e.label} : ${fmtPrice(e.price)}`).join('\n')
      return {
        answer: `Here are the available options for the ${phrase} on the ${device}:\n\n${lines}\n\nContact the workshop to choose the most suitable option.`,
        actions,
      }
    }

    case 'no_price': {
      const device = deviceName(match.brand!, match.model!)
      const phrase = getReparationPhraseEn(match.repairLabel ?? 'repair')
      const actions: ChatbotAction[] = [
        { label: 'Contact us', href: loc(CONTACT_HREF, 'en'), variant: BTN },
      ]
      if (match.modelHref) {
        actions.unshift({ label: 'View repair page', href: loc(match.modelHref, 'en'), variant: LINK })
      }
      return {
        answer: `I don't have a published price for the ${phrase} on the ${device}. Contact the workshop for a precise quote.`,
        actions,
      }
    }

    case 'model_needed': {
      const brand = match.brand!
      return {
        answer: `What is the exact model of your ${brand}?\n\n(example: ${brand} 14, ${brand} 15 Pro…)`,
        actions: [{ label: `${brand} prices`, href: loc(match.brandHref!, 'en'), variant: LINK }],
      }
    }

    case 'repair_needed': {
      const device = deviceName(match.brand!, match.model!)
      return {
        answer: `Which repair would you like for your ${device}?\n\nScreen, battery, charging port or something else?`,
        actions: [
          { label: 'View prices', href: loc(match.modelHref!, 'en'), variant: LINK },
          { label: 'Contact us', href: loc(CONTACT_HREF, 'en'), variant: BTN },
        ],
      }
    }

    case 'brand_only': {
      return {
        answer: `I'll help you with your ${match.brand!}. What model do you have and what type of repair would you like?`,
        actions: [{ label: `${match.brand!} prices`, href: loc(match.brandHref!, 'en'), variant: LINK }],
      }
    }

    default:
      return { answer: '', actions: [] }
  }
}

export function buildPricingResponse(match: PricingMatch, locale: ChatbotLocale): PricingResponse {
  return locale === 'en' ? buildPricingResponseEn(match) : buildPricingResponseFr(match)
}
