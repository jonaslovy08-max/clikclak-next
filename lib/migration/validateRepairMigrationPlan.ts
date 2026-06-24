/*
  lib/migration/validateRepairMigrationPlan.ts

  Valide les contraintes métier du plan de migration.
  Vérifie toutes les invariants sans écrire dans Supabase.
*/

import type { RepairMigrationPlan, MigrationIssue } from './repairMigrationTypes'

export interface ValidationResult {
  errors:   MigrationIssue[]
  warnings: MigrationIssue[]
  passed:   string[]  // liste des vérifications réussies
}

export function validateRepairMigrationPlan(plan: RepairMigrationPlan): ValidationResult {
  const errors:   MigrationIssue[] = []
  const warnings: MigrationIssue[] = []
  const passed:   string[]          = []

  function err(code: string, message: string, ctx?: MigrationIssue['context']) {
    errors.push({ severity: 'error', code, message, context: ctx })
  }
  function ok(label: string) { passed.push(label) }

  /* ── Marques ──────────────────────────────────────────────── */
  {
    const keys = plan.brands.map(b => b.internal_key)
    const slugs = plan.brands.map(b => b.slug)
    const paths = plan.brands.map(b => b.public_base_path)

    checkUnique(keys, 'BRAND_KEY_DUPLICATE', 'internal_key marque', err)
    checkUnique(slugs, 'BRAND_SLUG_DUPLICATE', 'slug marque', err)
    checkUnique(paths, 'BRAND_PATH_DUPLICATE', 'public_base_path marque', err)

    for (const b of plan.brands) {
      if (!b.internal_key) err('BRAND_EMPTY_KEY', `internal_key vide`)
      if (!b.h1_brand)     err('BRAND_EMPTY_H1', `h1_brand vide pour "${b.internal_key}"`, { brand: b.internal_key })
      if (!b.public_base_path) err('BRAND_EMPTY_PATH', `public_base_path vide pour "${b.internal_key}"`, { brand: b.internal_key })
    }
    if (!errors.some(e => e.code.startsWith('BRAND'))) ok('Marques : unicité et champs essentiels')
  }

  /* ── Catégories ────────────────────────────────────────────── */
  {
    checkUnique(plan.deviceCategories.map(c => c.internal_key), 'CAT_KEY_DUPLICATE', 'internal_key catégorie', err)
    checkUnique(plan.deviceCategories.map(c => c.slug), 'CAT_SLUG_DUPLICATE', 'slug catégorie', err)
    ok('Catégories : unicité')
  }

  /* ── Familles ──────────────────────────────────────────────── */
  {
    const brandKeys = new Set(plan.brands.map(b => b.internal_key))

    // Unicité brand + internal_key
    const famBrandKeys = plan.deviceFamilies.map(f => `${f.brand_internal_key}:${f.internal_key}`)
    checkUnique(famBrandKeys, 'FAMILY_KEY_DUPLICATE', 'brand+internal_key famille', err)

    // Unicité brand + name
    const famBrandNames = plan.deviceFamilies.map(f => `${f.brand_internal_key}:${f.name.toLowerCase()}`)
    checkUnique(famBrandNames, 'FAMILY_NAME_DUPLICATE', 'brand+name famille', err)

    // Référence marque
    for (const f of plan.deviceFamilies) {
      if (!brandKeys.has(f.brand_internal_key)) {
        err('FAMILY_BRAND_NOT_FOUND', `Famille "${f.internal_key}" référence une marque inconnue : "${f.brand_internal_key}"`,
          { brand: f.brand_internal_key, family: f.internal_key })
      }
      if (!f.name) err('FAMILY_EMPTY_NAME', `name vide pour famille "${f.internal_key}"`, { family: f.internal_key })
    }
    if (!errors.some(e => e.code.startsWith('FAMILY'))) ok('Familles : unicité et références marques')
  }

  /* ── Modèles ──────────────────────────────────────────────── */
  {
    const familyIndex = new Set(plan.deviceFamilies.map(f => `${f.brand_internal_key}:${f.internal_key}`))
    const catKeys     = new Set(plan.deviceCategories.map(c => c.internal_key))
    const modelKeys   = plan.deviceModels.map(m => m.internal_key)
    const modelSlugs  = plan.deviceModels.map(m => m.slug)

    checkUnique(modelKeys, 'MODEL_KEY_DUPLICATE', 'internal_key modèle', err)
    checkUnique(modelSlugs, 'MODEL_SLUG_DUPLICATE', 'slug modèle', err)

    for (const m of plan.deviceModels) {
      const famRef = `${m.brand_internal_key}:${m.family_internal_key}`
      if (!familyIndex.has(famRef)) {
        err('MODEL_FAMILY_NOT_FOUND', `Modèle "${m.internal_key}" référence une famille inconnue : "${m.family_internal_key}"`,
          { brand: m.brand_internal_key, model: m.internal_key })
      }
      if (!catKeys.has(m.category_internal_key)) {
        err('MODEL_CATEGORY_NOT_FOUND', `Modèle "${m.internal_key}" référence une catégorie inconnue : "${m.category_internal_key}"`,
          { model: m.internal_key })
      }
      if (!m.slug) {
        err('MODEL_EMPTY_SLUG', `slug vide pour modèle "${m.internal_key}"`, { model: m.internal_key })
      }
      // Le slug ne doit pas avoir été modifié par rapport au slug source
      if (m.slug !== m.legacy_slug) {
        err('MODEL_SLUG_MISMATCH',
          `slug "${m.slug}" ≠ legacy_slug "${m.legacy_slug}" pour "${m.internal_key}" — le slug public serait modifié`,
          { model: m.internal_key })
      }
      if (!m.name) {
        err('MODEL_EMPTY_NAME', `name vide pour modèle "${m.internal_key}"`, { model: m.internal_key })
      }
    }
    if (!errors.some(e => e.code.startsWith('MODEL'))) ok('Modèles : unicité, slugs inchangés, références')
  }

  /* ── Types de réparation ──────────────────────────────────── */
  {
    const VALID_CATS = new Set(['screen', 'battery', 'other'])
    checkUnique(plan.repairTypes.map(t => t.internal_key), 'REPAIR_TYPE_KEY_DUPLICATE', 'internal_key type réparation', err)
    checkUnique(plan.repairTypes.map(t => t.slug), 'REPAIR_TYPE_SLUG_DUPLICATE', 'slug type réparation', err)

    for (const t of plan.repairTypes) {
      if (!VALID_CATS.has(t.category)) {
        err('REPAIR_TYPE_INVALID_CAT', `Catégorie invalide "${t.category}" pour type "${t.internal_key}"`,
          { repair: t.internal_key })
      }
      if (!t.name) {
        err('REPAIR_TYPE_EMPTY_NAME', `name vide pour type "${t.internal_key}"`, { repair: t.internal_key })
      }
    }
    if (!errors.some(e => e.code.startsWith('REPAIR_TYPE'))) ok('Types de réparation : unicité et catégories valides')
  }

  /* ── Offres ──────────────────────────────────────────────── */
  {
    const modelKeySet  = new Set(plan.deviceModels.map(m => m.internal_key))
    const typeKeySet   = new Set(plan.repairTypes.map(t => t.internal_key))
    const VALID_MODES  = new Set(['fixed', 'on_request', 'quote'])
    const VALID_AVAIL  = new Set(['available', 'on_request', 'unavailable'])
    const VALID_STATUS = new Set(['active', 'inactive', 'archived'])

    const offerCompositeKeys = plan.repairOffers.map(
      o => `${o.device_model_internal_key}||${o.repair_type_internal_key}||${o.variant_key}`
    )
    checkUnique(offerCompositeKeys, 'OFFER_COMPOSITE_DUPLICATE', 'offre (modèle+type+variante)', err)

    let priceConsistencyOk = true
    for (const o of plan.repairOffers) {
      if (!modelKeySet.has(o.device_model_internal_key)) {
        err('OFFER_MODEL_NOT_FOUND', `Offre référence un modèle inconnu : "${o.device_model_internal_key}"`,
          { model: o.device_model_internal_key })
      }
      if (!typeKeySet.has(o.repair_type_internal_key)) {
        err('OFFER_TYPE_NOT_FOUND', `Offre référence un type inconnu : "${o.repair_type_internal_key}"`,
          { repair: o.repair_type_internal_key })
      }
      if (!o.variant_key) {
        err('OFFER_EMPTY_VARIANT_KEY', `variant_key vide pour offre modèle "${o.device_model_internal_key}"`,
          { model: o.device_model_internal_key })
      }
      if (!VALID_MODES.has(o.pricing_mode)) {
        err('OFFER_INVALID_MODE', `pricing_mode invalide "${o.pricing_mode}"`, { model: o.device_model_internal_key })
        priceConsistencyOk = false
      }
      // Cohérence mode/cents
      if (o.pricing_mode === 'fixed' && (o.price_cents === null || o.price_cents < 0)) {
        err('OFFER_FIXED_NO_CENTS', `pricing_mode=fixed mais price_cents=${o.price_cents}`,
          { model: o.device_model_internal_key, repair: o.repair_type_internal_key })
        priceConsistencyOk = false
      }
      if ((o.pricing_mode === 'on_request' || o.pricing_mode === 'quote') && o.price_cents !== null) {
        err('OFFER_NON_FIXED_WITH_CENTS', `pricing_mode=${o.pricing_mode} mais price_cents=${o.price_cents} (attendu null)`,
          { model: o.device_model_internal_key, repair: o.repair_type_internal_key })
        priceConsistencyOk = false
      }
      if (!VALID_AVAIL.has(o.availability)) {
        err('OFFER_INVALID_AVAIL', `availability invalide "${o.availability}"`, { model: o.device_model_internal_key })
      }
      if (!VALID_STATUS.has(o.status)) {
        err('OFFER_INVALID_STATUS', `status invalide "${o.status}"`, { model: o.device_model_internal_key })
      }
      if (o.currency !== 'CHF') {
        err('OFFER_INVALID_CURRENCY', `devise non CHF : "${o.currency}"`, { model: o.device_model_internal_key })
      }
      if (o.duration_minutes !== null && o.duration_minutes <= 0) {
        err('OFFER_INVALID_DURATION', `duration_minutes doit être > 0 si renseigné`, { model: o.device_model_internal_key })
      }
      if (o.warranty_months !== null && o.warranty_months < 0) {
        err('OFFER_INVALID_WARRANTY', `warranty_months doit être >= 0 si renseigné`, { model: o.device_model_internal_key })
      }
      // Offre indisponible : price_cents doit être null ET public_note doit être renseigné
      if (o.availability === 'unavailable') {
        if (o.price_cents !== null) {
          err('OFFER_UNAVAILABLE_WITH_CENTS',
            `availability=unavailable mais price_cents=${o.price_cents} (attendu null)`,
            { model: o.device_model_internal_key, repair: o.repair_type_internal_key })
          priceConsistencyOk = false
        }
        if (!o.public_note) {
          err('OFFER_UNAVAILABLE_NO_NOTE',
            `availability=unavailable mais public_note vide — le texte source doit être conservé`,
            { model: o.device_model_internal_key, repair: o.repair_type_internal_key })
        }
      }
    }
    if (!errors.some(e => e.code.startsWith('OFFER'))) {
      ok('Offres : unicité clé composite, références modèles/types')
      if (priceConsistencyOk) ok('Offres : cohérence pricing_mode / price_cents / availability')
    }

    // Bilan des offres indisponibles
    const unavailableOffers = plan.repairOffers.filter(o => o.availability === 'unavailable')
    if (unavailableOffers.length > 0) {
      ok(`Offres indisponibles : ${unavailableOffers.length} offre(s) correctement marquées unavailable avec public_note`)
    }

    /* Vérification couverture : aucun modèle sans offre */
    const modelsWithOffer = new Set(plan.repairOffers.map(o => o.device_model_internal_key))
    const modelsWithout = plan.deviceModels.filter(m => !modelsWithOffer.has(m.internal_key))
    if (modelsWithout.length > 0) {
      for (const m of modelsWithout) {
        warnings.push({
          severity: 'warning',
          code: 'MODEL_NO_OFFERS',
          message: `Modèle "${m.internal_key}" sans aucune offre de réparation`,
          context: { model: m.internal_key },
        })
      }
    } else {
      ok('Couverture : tous les modèles ont au moins une offre')
    }
  }

  // Ajoute aussi les issues du plan lui-même (générées lors de la construction)
  errors.push(...plan.errors)
  warnings.push(...plan.warnings)

  return { errors, warnings, passed }
}

/* ── Helper : unicité ─────────────────────────────────────────── */

function checkUnique(
  values:  string[],
  code:    string,
  label:   string,
  addError: (code: string, message: string) => void,
): void {
  const seen = new Map<string, number>()
  for (const v of values) {
    seen.set(v, (seen.get(v) ?? 0) + 1)
  }
  for (const [v, count] of seen) {
    if (count > 1) {
      addError(code, `Doublon ${label} (${count}×) : "${v}"`)
    }
  }
}
