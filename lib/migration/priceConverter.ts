/*
  lib/migration/priceConverter.ts

  Conversion pure et stricte des prix source → price_cents + pricing_mode.
  Aucune transformation silencieuse : toute valeur non reconnue lance une erreur.

  Formats reconnus (après inspection des données réelles) :
    number          → fixed      (ex: 249.99 → 24999, 129 → 12900)
    "CHF 249.99"    → fixed      (format iPhone via chf())
    "CHF 249"       → fixed      (variante entière)
    "Sur demande"   → on_request / available
    "Sur devis"     → quote / available
    "Ne peut pas être remplacé"                   → on_request / unavailable / public_note conservé
    "Non disponible — modèle non pris en charge"  → on_request / unavailable / public_note conservé

  Les valeurs d'indisponibilité ("Ne peut pas être remplacé", "Non disponible")
  sont des valeurs CONNUES dans les données sources (Samsung S6, Huawei P30 Pro).
  Elles mappent vers pricing_mode = on_request + availability = unavailable
  et conservent le texte source dans public_note.
*/

import type { PriceResult } from './repairMigrationTypes'

/* ── Valeurs reconnues ──────────────────────────────────────────── */

// Valeurs textuelles signifiant « indisponible » :
// pricing_mode = on_request, availability = unavailable, public_note = texte source
const UNAVAILABLE_VALUES = new Map([
  ['ne peut pas être remplacé',                   'Ne peut pas être remplacé'],
  ['non disponible — modèle non pris en charge',  'Non disponible — modèle non pris en charge'],
  ['non disponible',                              'Non disponible'],
])

// Valeurs mappées vers on_request (disponible, mais sans prix affiché)
const ON_REQUEST_VALUES = new Set(['sur demande'])

// Valeurs mappées vers quote
const QUOTE_VALUES = new Set(['sur devis'])

/* ── Helpers ─────────────────────────────────────────────────── */

/** Convertit un nombre flottant en centimes sans erreur de virgule flottante. */
function toCents(value: number): number {
  const s = value.toFixed(2)
  const parts = s.split('.')
  const whole  = parseInt(parts[0], 10) * 100
  const frac   = parseInt(parts[1] ?? '00', 10)
  return whole + frac
}

/** Normalise une chaîne : minuscules, trim, espaces insécables retirés. */
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/ /g, ' ')
    .replace(/\s+/g, ' ')
}

/* ── Type de résultat enrichi ──────────────────────────────────── */

export interface PriceConversionResult {
  result:        PriceResult
  /** 'unavailable' uniquement pour les valeurs sources signifiant l'indisponibilité */
  availability?: 'available' | 'unavailable'
  /** Texte source conservé intégralement pour les valeurs spéciales */
  public_note?:  string
  /** Avertissement descriptif, non bloquant */
  warning?:      string
}

/* ── Conversion principale ───────────────────────────────────── */

/**
 * Convertit une valeur source vers PriceConversionResult.
 * Lance une erreur si la valeur est non reconnue.
 * @param raw  valeur source (price de RepairItem / MainRepair / OtherRepair)
 * @param ctx  contexte pour les messages d'erreur
 */
export function convertPrice(
  raw: number | string,
  ctx: string,
): PriceConversionResult {

  /* ── Cas 1 : nombre ─── */
  if (typeof raw === 'number') {
    if (!isFinite(raw) || isNaN(raw)) {
      throw new Error(`[${ctx}] Prix numérique invalide : ${raw}`)
    }
    if (raw < 0) {
      throw new Error(`[${ctx}] Prix négatif non autorisé : ${raw}`)
    }
    return { result: { mode: 'fixed', cents: toCents(raw) }, availability: 'available' }
  }

  /* ── Cas 2 : chaîne ─── */
  const n = norm(raw)

  // "CHF 249.99" / "CHF 249" (format iPhone via chf())
  const chfMatch = n.match(/^chf\s+([\d]+(?:\.[\d]+)?)$/)
  if (chfMatch) {
    const val = parseFloat(chfMatch[1])
    if (!isFinite(val) || val < 0) {
      throw new Error(`[${ctx}] Prix CHF invalide : "${raw}"`)
    }
    return { result: { mode: 'fixed', cents: toCents(val) }, availability: 'available' }
  }

  // "Sur devis" → quote, disponible
  if (QUOTE_VALUES.has(n)) {
    return { result: { mode: 'quote', cents: null }, availability: 'available' }
  }

  // "Sur demande" → on_request, disponible
  if (ON_REQUEST_VALUES.has(n)) {
    return { result: { mode: 'on_request', cents: null }, availability: 'available' }
  }

  // Valeurs d'indisponibilité connues → on_request, unavailable, public_note conservé
  const unavailableText = UNAVAILABLE_VALUES.get(n)
  if (unavailableText) {
    return {
      result:       { mode: 'on_request', cents: null },
      availability: 'unavailable',
      public_note:  unavailableText,  // texte source exact, non modifié
      warning:      `Service indisponible (${unavailableText}) — availability=unavailable, public_note conservé`,
    }
  }

  // Valeur non reconnue → erreur bloquante
  throw new Error(
    `[${ctx}] Valeur de prix non reconnue : "${raw}". ` +
    'Ajouter un cas explicite dans priceConverter.ts si cette valeur est intentionnelle.'
  )
}

/* ── Tests internes ──────────────────────────────────────────── */

function assertEqual<T>(actual: T, expected: T, msg: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `[priceConverter test] ${msg}\n  attendu : ${JSON.stringify(expected)}\n  reçu    : ${JSON.stringify(actual)}`
    )
  }
}
function assertThrows(fn: () => unknown, pattern: RegExp, msg: string): void {
  try {
    fn()
    throw new Error(`[priceConverter test] ${msg} — exception attendue mais non levée`)
  } catch (e: unknown) {
    if (e instanceof Error && e.message.includes('[priceConverter test]')) throw e
    if (!(e instanceof Error) || !pattern.test(e.message)) {
      throw new Error(`[priceConverter test] ${msg} — pattern ${pattern} non trouvé dans : ${String(e)}`)
    }
  }
}

export function runPriceConverterTests(): void {
  const ctx = 'TEST'

  // Nombres
  assertEqual(convertPrice(249.99, ctx).result, { mode: 'fixed', cents: 24999 }, '249.99 → 24999')
  assertEqual(convertPrice(129,    ctx).result, { mode: 'fixed', cents: 12900 }, '129 → 12900')
  assertEqual(convertPrice(79.99,  ctx).result, { mode: 'fixed', cents:  7999 }, '79.99 → 7999')
  assertEqual(convertPrice(0,      ctx).result, { mode: 'fixed', cents:     0 }, '0 → 0')
  assertEqual(convertPrice(249.99, ctx).availability, 'available', '249.99 → available')

  // Chaînes CHF (format iPhone)
  assertEqual(convertPrice('CHF 249.99', ctx).result, { mode: 'fixed', cents: 24999 }, 'CHF 249.99 → 24999')
  assertEqual(convertPrice('CHF 249',    ctx).result, { mode: 'fixed', cents: 24900 }, 'CHF 249 → 24900')
  assertEqual(convertPrice('CHF 99.99',  ctx).result, { mode: 'fixed', cents:  9999 }, 'CHF 99.99 → 9999')

  // Sur demande → on_request / available
  assertEqual(convertPrice('Sur demande', ctx).result,       { mode: 'on_request', cents: null }, 'Sur demande → on_request')
  assertEqual(convertPrice('Sur demande', ctx).availability, 'available',                        'Sur demande → available')
  if (convertPrice('Sur demande', ctx).public_note !== undefined) throw new Error('[priceConverter test] Sur demande ne doit pas avoir de public_note')

  // Sur devis → quote / available
  assertEqual(convertPrice('Sur devis', ctx).result,       { mode: 'quote', cents: null }, 'Sur devis → quote')
  assertEqual(convertPrice('Sur devis', ctx).availability, 'available',                   'Sur devis → available')

  // "Ne peut pas être remplacé" → on_request / unavailable / public_note conservé
  const r1 = convertPrice('Ne peut pas être remplacé', ctx)
  assertEqual(r1.result,       { mode: 'on_request', cents: null },  'NPPERE → on_request')
  assertEqual(r1.availability, 'unavailable',                         'NPPERE → unavailable')
  assertEqual(r1.public_note,  'Ne peut pas être remplacé',           'NPPERE → public_note exact')
  if (!r1.warning) throw new Error('[priceConverter test] avertissement attendu pour NPPERE')

  // "Non disponible" → on_request / unavailable / public_note conservé
  const r2 = convertPrice('Non disponible — modèle non pris en charge', ctx)
  assertEqual(r2.result,       { mode: 'on_request', cents: null },                          'ND → on_request')
  assertEqual(r2.availability, 'unavailable',                                                  'ND → unavailable')
  assertEqual(r2.public_note,  'Non disponible — modèle non pris en charge',                  'ND → public_note exact')
  if (!r2.warning) throw new Error('[priceConverter test] avertissement attendu pour ND')

  // Valeur inconnue → erreur
  assertThrows(() => convertPrice('Gratuit', ctx), /non reconnue/, 'valeur inconnue doit lever une erreur')

  console.log('  ✓ priceConverter : 18 assertions réussies')
}
