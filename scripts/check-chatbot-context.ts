/**
 * scripts/check-chatbot-context.ts
 *
 * Vérifie que getClikClakSiteContext('en') ne contient aucun titre,
 * description ou en-tête français connu, et que getClikClakSiteContext('fr')
 * reste inchangé (toujours en français). Appel direct de la fonction —
 * aucun serveur requis, aucun appel Anthropic.
 *
 * Usage: npm run check:chatbot-context
 */

import { getClikClakSiteContext } from '../lib/chatbot/siteContext'
import { SERVICES } from '../lib/chatbot/servicesIndex'
import { CONTACT_INFO } from '../lib/chatbot/contactInfo'

let failures = 0

function fail(message: string): void {
  failures += 1
  console.error(`  ❌ ${message}`)
}

function ok(message: string): void {
  console.log(`  ✅ ${message}`)
}

/** Recherche par mots entiers — évite les faux positifs du type
 *  "Diagnostic" (FR) trouvé dans "Diagnostics" (EN). */
function containsWhole(haystack: string, needle: string): boolean {
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![A-Za-zÀ-ÿ])${escaped}(?![A-Za-zÀ-ÿ])`).test(haystack)
}

console.log('Checking getClikClakSiteContext("en") for French leakage...\n')

const enContext = getClikClakSiteContext('en')
const frContext = getClikClakSiteContext('fr')

/* ── 1. Aucun titre ni description FR de SERVICES ne doit apparaître ── */
for (const s of SERVICES) {
  if (containsWhole(enContext, s.title)) {
    fail(`French service title found in EN context: "${s.title}"`)
  }
  if (containsWhole(enContext, s.description)) {
    fail(`French service description found in EN context: "${s.description}"`)
  }
}
if (failures === 0) ok('No French SERVICES title/description found in EN context')

/* ── 2. Aucun en-tête structurel FR connu ── */
const FR_HEADERS = [
  'CONTEXTE CLIKCLAK',
  'SERVICES DISPONIBLES',
  'Catégories',
  'Ville',
  'Page contact et formulaire',
  "RÈGLES D'UTILISATION DU CONTEXTE",
  'Adresse exacte et horaires',
  'boutique',
  'pièces détachées',
  'smartphones neufs ou d\'occasion',
  'Suisse',
  CONTACT_INFO.note,
]
const headerHits = FR_HEADERS.filter(h => containsWhole(enContext, h))
if (headerHits.length > 0) {
  for (const h of headerHits) fail(`French structural header found in EN context: "${h}"`)
} else {
  ok('No known French structural header found in EN context')
}

/* ── 3. Sanity : le contexte FR reste bien en français ── */
if (!frContext.includes('CONTEXTE CLIKCLAK')) {
  fail('FR context no longer starts with "CONTEXTE CLIKCLAK" — FR context may have regressed')
} else {
  ok('FR context still in French (unaffected)')
}

/* ── 4. Sanity : le contexte EN contient bien le header EN attendu ── */
if (!enContext.includes('CLIKCLAK CONTEXT')) {
  fail('EN context does not contain expected "CLIKCLAK CONTEXT" header')
} else {
  ok('EN context contains expected English header')
}

/* ── 5. Tous les liens du contexte EN doivent être /en/... (ou non localisables) ── */
const hrefMatches = enContext.match(/https?:\/\/\S+|(?<![\w/])\/[a-z0-9/-]+/gi) ?? []
const nonEnLinks = hrefMatches.filter(h =>
  !h.startsWith('/en') &&
  !h.includes('shop-reparation-smartphone-lausanne'), // shop FR-only, exclusion documentée
)
if (nonEnLinks.length > 0) {
  for (const link of nonEnLinks) fail(`Non-/en link found in EN context: "${link}"`)
} else {
  ok('All localizable links in EN context use /en/...')
}

console.log('')
if (failures > 0) {
  console.error(`FAILED — ${failures} issue(s) found.\n`)
  process.exit(1)
} else {
  console.log('PASSED — EN context is fully English, FR context unaffected.\n')
}
