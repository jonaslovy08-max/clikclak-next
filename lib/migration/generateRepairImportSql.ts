/*
  lib/migration/generateRepairImportSql.ts

  Génère le SQL d'import transactionnel depuis un RepairMigrationPlan validé.
  Purement fonctionnel : aucune écriture Supabase, aucun effet de bord.
  Le SQL est atomique (BEGIN/COMMIT) et déterministe (sans date dans le corps).
*/

import type { RepairMigrationPlan } from './repairMigrationTypes'

/* ── Volumes attendus ─────────────────────────────────────────── */

export const EXPECTED_VOLUMES = {
  brands:             7,
  device_categories:  3,
  device_families:    50,
  device_models:      212,
  repair_types:       30,
  repair_offers:      1308,
  model_slug_history: 0,
  price_fixed:        1142,
  price_on_request:   32,
  price_quote:        130,
  price_unavailable:  4,
  with_public_note:   4,
  with_subtitle:      96,
} as const

export const EXPECTED_FINGERPRINT = 'b4548ff71bb067e7f443d24dbaeedaa26f2c471c79ad3645c912e7dc16f6e585'

/* ── Helpers SQL ──────────────────────────────────────────────── */

/**
 * Échappe une valeur string en littéral SQL PostgreSQL.
 * Les apostrophes sont doublées. NULL/undefined → SQL NULL.
 */
export function sqlLiteral(v: string | null | undefined): string {
  if (v === null || v === undefined) return 'NULL'
  return "'" + String(v).replace(/'/g, "''") + "'"
}

/** Représente un entier nullable en SQL. */
export function sqlInt(v: number | null | undefined): string {
  if (v === null || v === undefined) return 'NULL'
  return String(Math.trunc(v))
}

/**
 * Littéral texte pour VALUES + JOIN. Sur la première ligne (isFirst=true),
 * les NULL sont explicitement castés en ::text pour que PostgreSQL puisse
 * inférer le type de la colonne.
 */
function t(v: string | null | undefined, isFirst: boolean): string {
  if (v === null || v === undefined) return isFirst ? 'NULL::text' : 'NULL'
  return sqlLiteral(v)
}

/**
 * Entier nullable pour VALUES + JOIN. Sur la première ligne, NULL::integer.
 */
function n(v: number | null | undefined, isFirst: boolean): string {
  if (v === null || v === undefined) return isFirst ? 'NULL::integer' : 'NULL'
  return sqlInt(v)
}

/* ── Génération SQL import ───────────────────────────────────── */

export function generateRepairImportSql(plan: RepairMigrationPlan): string {
  const lines: string[] = []
  const L = (s = '') => lines.push(s)
  const sep = (title: string) => {
    L('')
    L('-- ' + '='.repeat(70))
    L(`-- ${title}`)
    L('-- ' + '='.repeat(70))
  }

  // ── En-tête ──────────────────────────────────────────────────
  L('-- ' + '='.repeat(70))
  L('-- Projet           : ClikClak')
  L('-- Type             : Import initial des réparations (Phase 1B)')
  L(`-- Fingerprint plan : ${plan.fingerprint}`)
  L('-- Volumes attendus :')
  L(`--   brands              ${EXPECTED_VOLUMES.brands}`)
  L(`--   device_categories   ${EXPECTED_VOLUMES.device_categories}`)
  L(`--   device_families     ${EXPECTED_VOLUMES.device_families}`)
  L(`--   device_models       ${EXPECTED_VOLUMES.device_models}`)
  L(`--   repair_types        ${EXPECTED_VOLUMES.repair_types}`)
  L(`--   repair_offers       ${EXPECTED_VOLUMES.repair_offers}`)
  L(`--   model_slug_history  ${EXPECTED_VOLUMES.model_slug_history}`)
  L('-- Date de génération : voir migration-reports/repair-import-manifest.json')
  L('-- AVERTISSEMENT    : Exécuter une seule fois sur des tables vides.')
  L('--                    Ne pas relancer en cas d\'erreur.')
  L('-- ' + '='.repeat(70))

  // ── BEGIN ─────────────────────────────────────────────────────
  L('')
  L('BEGIN;')

  // ── 1. Verrouillage ──────────────────────────────────────────
  sep('1. Verrouillage des tables métier (empêche les écritures concurrentes)')
  L('')
  L('LOCK TABLE')
  L('  public.brands,')
  L('  public.device_categories,')
  L('  public.device_families,')
  L('  public.device_models,')
  L('  public.repair_types,')
  L('  public.repair_offers,')
  L('  public.model_slug_history')
  L('IN SHARE ROW EXCLUSIVE MODE;')

  // ── 2. Contrôle préalable ─────────────────────────────────────
  sep('2. Contrôle préalable — toutes les tables métier doivent être vides')
  L('')
  L('DO $$')
  L('DECLARE')
  L('  cnt bigint;')
  L('BEGIN')
  const guardTables = [
    'brands', 'device_categories', 'device_families', 'device_models',
    'repair_types', 'repair_offers', 'model_slug_history',
  ]
  for (const tbl of guardTables) {
    L(`  SELECT COUNT(*) INTO cnt FROM public.${tbl};`)
    L(`  IF cnt > 0 THEN`)
    L(`    RAISE EXCEPTION 'Import refusé : public.${tbl} contient déjà % ligne(s). Vérifier avant de réessayer.', cnt;`)
    L(`  END IF;`)
  }
  L('END;')
  L('$$;')

  // ── 3. Marques ────────────────────────────────────────────────
  sep('3. Insertion des marques (7)')
  L('')
  L('INSERT INTO public.brands')
  L('  (internal_key, name, slug, h1_prefix, h1_brand, brand_icon,')
  L('   breadcrumb_label, breadcrumb_href, public_base_path,')
  L('   default_model_slug, initial_family_count, repair_note, search_placeholder,')
  L('   status, sort_order)')
  L('VALUES')
  plan.brands.forEach((b, i) => {
    const comma = i < plan.brands.length - 1 ? ',' : ';'
    L(
      `  (${sqlLiteral(b.internal_key)}, ${sqlLiteral(b.name)}, ${sqlLiteral(b.slug)}, ` +
      `${sqlLiteral(b.h1_prefix)}, ${sqlLiteral(b.h1_brand)}, ${sqlLiteral(b.brand_icon)}, ` +
      `${sqlLiteral(b.breadcrumb_label)}, ${sqlLiteral(b.breadcrumb_href)}, ${sqlLiteral(b.public_base_path)}, ` +
      `${sqlLiteral(b.default_model_slug)}, ${sqlInt(b.initial_family_count)}, ${sqlLiteral(b.repair_note)}, ` +
      `${sqlLiteral(b.search_placeholder)}, ${sqlLiteral(b.status)}, ${b.sort_order})${comma}`
    )
  })

  // ── 4. Catégories ─────────────────────────────────────────────
  sep('4. Insertion des catégories (3)')
  L('')
  L('INSERT INTO public.device_categories')
  L('  (internal_key, name, slug, status, sort_order)')
  L('VALUES')
  plan.deviceCategories.forEach((c, i) => {
    const comma = i < plan.deviceCategories.length - 1 ? ',' : ';'
    L(`  (${sqlLiteral(c.internal_key)}, ${sqlLiteral(c.name)}, ${sqlLiteral(c.slug)}, ${sqlLiteral(c.status)}, ${c.sort_order})${comma}`)
  })

  // ── 5. Familles (FK brand_id) ─────────────────────────────────
  sep('5. Insertion des familles (50) — brand_id résolu par JOIN')
  L('')
  L('INSERT INTO public.device_families')
  L('  (brand_id, internal_key, name, short_label, button_prefix, status, sort_order)')
  L('SELECT b.id, v.internal_key, v.name, v.short_label, v.button_prefix, v.status, v.sort_order')
  L('FROM (VALUES')
  plan.deviceFamilies.forEach((f, i) => {
    const first = i === 0
    const comma = i < plan.deviceFamilies.length - 1 ? ',' : ''
    L(
      `  (${t(f.brand_internal_key, first)}, ${t(f.internal_key, first)}, ${t(f.name, first)}, ` +
      `${t(f.short_label, first)}, ${t(f.button_prefix, first)}, ${t(f.status, first)}, ` +
      `${first ? f.sort_order + '::integer' : f.sort_order})${comma}`
    )
  })
  L(') AS v(brand_internal_key, internal_key, name, short_label, button_prefix, status, sort_order)')
  L('JOIN public.brands b ON b.internal_key = v.brand_internal_key;')

  // ── 6. Modèles (FK family_id + category_id) ───────────────────
  sep('6. Insertion des modèles (212) — FKs résolus par JOIN')
  L('')
  L('INSERT INTO public.device_models')
  L('  (family_id, category_id, internal_key, name, slug, legacy_slug, status, sort_order)')
  L('SELECT df.id, dc.id, v.internal_key, v.name, v.slug, v.legacy_slug, v.status, v.sort_order')
  L('FROM (VALUES')
  plan.deviceModels.forEach((m, i) => {
    const first = i === 0
    const comma = i < plan.deviceModels.length - 1 ? ',' : ''
    L(
      `  (${t(m.brand_internal_key, first)}, ${t(m.family_internal_key, first)}, ${t(m.category_internal_key, first)}, ` +
      `${t(m.internal_key, first)}, ${t(m.name, first)}, ${t(m.slug, first)}, ` +
      `${t(m.legacy_slug, first)}, ${t(m.status, first)}, ` +
      `${first ? m.sort_order + '::integer' : m.sort_order})${comma}`
    )
  })
  L(') AS v(brand_internal_key, family_internal_key, category_internal_key, internal_key, name, slug, legacy_slug, status, sort_order)')
  L('JOIN public.brands b    ON b.internal_key   = v.brand_internal_key')
  L('JOIN public.device_families df ON df.internal_key = v.family_internal_key AND df.brand_id = b.id')
  L('JOIN public.device_categories dc ON dc.internal_key = v.category_internal_key;')

  // ── 7. Types de réparation ────────────────────────────────────
  sep('7. Insertion des types de réparation (30)')
  L('')
  L('INSERT INTO public.repair_types')
  L('  (internal_key, name, short_name, slug, category, description, status, sort_order)')
  L('VALUES')
  plan.repairTypes.forEach((rt, i) => {
    const comma = i < plan.repairTypes.length - 1 ? ',' : ';'
    L(
      `  (${sqlLiteral(rt.internal_key)}, ${sqlLiteral(rt.name)}, ${sqlLiteral(rt.short_name)}, ` +
      `${sqlLiteral(rt.slug)}, ${sqlLiteral(rt.category)}, ${sqlLiteral(rt.description)}, ` +
      `${sqlLiteral(rt.status)}, ${rt.sort_order})${comma}`
    )
  })

  // ── 8. Offres (FK device_model_id + repair_type_id) ───────────
  sep('8. Insertion des offres de réparation (1 308) — FKs résolus par JOIN')
  L('')
  L('INSERT INTO public.repair_offers')
  L('  (device_model_id, repair_type_id, variant_key, variant_name, subtitle,')
  L('   pricing_mode, price_cents, currency, availability,')
  L('   duration_minutes, warranty_months,')
  L('   public_note, internal_note, status, sort_order)')
  L('SELECT dm.id, rt.id,')
  L('  v.variant_key, v.variant_name, v.subtitle,')
  L('  v.pricing_mode, v.price_cents, v.currency, v.availability,')
  L('  v.duration_minutes, v.warranty_months,')
  L('  v.public_note, v.internal_note, v.status, v.sort_order')
  L('FROM (VALUES')
  plan.repairOffers.forEach((o, i) => {
    const first = i === 0
    const comma = i < plan.repairOffers.length - 1 ? ',' : ''
    L(
      `  (${t(o.device_model_internal_key, first)}, ${t(o.repair_type_internal_key, first)}, ` +
      `${t(o.variant_key, first)}, ${t(o.variant_name, first)}, ${t(o.subtitle, first)}, ` +
      `${t(o.pricing_mode, first)}, ${n(o.price_cents, first)}, ` +
      `${t(o.currency, first)}, ${t(o.availability, first)}, ` +
      `${n(o.duration_minutes, first)}, ${n(o.warranty_months, first)}, ` +
      `${t(o.public_note, first)}, ${t(o.internal_note, first)}, ` +
      `${t(o.status, first)}, ` +
      `${first ? o.sort_order + '::integer' : o.sort_order})${comma}`
    )
  })
  L(') AS v(model_internal_key, type_internal_key, variant_key, variant_name, subtitle,')
  L('       pricing_mode, price_cents, currency, availability,')
  L('       duration_minutes, warranty_months,')
  L('       public_note, internal_note, status, sort_order)')
  L('JOIN public.device_models dm ON dm.internal_key = v.model_internal_key')
  L('JOIN public.repair_types  rt ON rt.internal_key = v.type_internal_key;')

  // ── 9. Contrôles de volumes post-import ───────────────────────
  sep('9. Contrôles de volumes post-insertion')
  L('')
  L('DO $$')
  L('DECLARE')
  L('  cnt bigint;')
  L('BEGIN')

  const volumeChecks: Array<[string, number]> = [
    ['brands',             EXPECTED_VOLUMES.brands],
    ['device_categories',  EXPECTED_VOLUMES.device_categories],
    ['device_families',    EXPECTED_VOLUMES.device_families],
    ['device_models',      EXPECTED_VOLUMES.device_models],
    ['repair_types',       EXPECTED_VOLUMES.repair_types],
    ['repair_offers',      EXPECTED_VOLUMES.repair_offers],
    ['model_slug_history', EXPECTED_VOLUMES.model_slug_history],
  ]
  for (const [tbl, expected] of volumeChecks) {
    L(`  SELECT COUNT(*) INTO cnt FROM public.${tbl};`)
    L(`  IF cnt != ${expected} THEN`)
    L(`    RAISE EXCEPTION 'Volume inattendu : public.${tbl} = % (attendu ${expected})', cnt;`)
    L(`  END IF;`)
  }

  L('')
  L('  -- Vérification des modes de prix et disponibilités')
  const priceChecks: Array<[string, string, number]> = [
    ['pricing_mode = \'fixed\' AND availability = \'available\'', 'fixed disponibles', EXPECTED_VOLUMES.price_fixed],
    ['pricing_mode = \'on_request\' AND availability = \'available\'', 'on_request disponibles', EXPECTED_VOLUMES.price_on_request],
    ['pricing_mode = \'quote\'', 'quote', EXPECTED_VOLUMES.price_quote],
    ['availability = \'unavailable\'', 'unavailable', EXPECTED_VOLUMES.price_unavailable],
    ['public_note IS NOT NULL', 'avec public_note', EXPECTED_VOLUMES.with_public_note],
    ['subtitle IS NOT NULL', 'avec subtitle', EXPECTED_VOLUMES.with_subtitle],
  ]
  for (const [where, label, expected] of priceChecks) {
    L(`  SELECT COUNT(*) INTO cnt FROM public.repair_offers WHERE ${where};`)
    L(`  IF cnt != ${expected} THEN`)
    L(`    RAISE EXCEPTION 'Compteur prix inattendu : ${label} = % (attendu ${expected})', cnt;`)
    L(`  END IF;`)
  }
  L('END;')
  L('$$;')

  // ── 10. Contrôles de cohérence métier ─────────────────────────
  sep('10. Contrôles de cohérence métier')
  L('')
  L('DO $$')
  L('DECLARE')
  L('  cnt bigint;')
  L('BEGIN')
  L('  -- Toute offre unavailable doit avoir une public_note')
  L('  SELECT COUNT(*) INTO cnt FROM public.repair_offers')
  L('    WHERE availability = \'unavailable\' AND public_note IS NULL;')
  L('  IF cnt > 0 THEN')
  L('    RAISE EXCEPTION \'Erreur métier : % offre(s) unavailable sans public_note\', cnt;')
  L('  END IF;')
  L('')
  L('  -- Aucune offre fixed sans price_cents (redondant avec CHECK mais explicite)')
  L('  SELECT COUNT(*) INTO cnt FROM public.repair_offers')
  L('    WHERE pricing_mode = \'fixed\' AND price_cents IS NULL;')
  L('  IF cnt > 0 THEN')
  L('    RAISE EXCEPTION \'Erreur cohérence : % offre(s) fixed sans price_cents\', cnt;')
  L('  END IF;')
  L('')
  L('  -- Aucune offre on_request/quote avec price_cents')
  L('  SELECT COUNT(*) INTO cnt FROM public.repair_offers')
  L('    WHERE pricing_mode IN (\'on_request\', \'quote\') AND price_cents IS NOT NULL;')
  L('  IF cnt > 0 THEN')
  L('    RAISE EXCEPTION \'Erreur cohérence : % offre(s) non-fixed avec price_cents\', cnt;')
  L('  END IF;')
  L('')
  L('  -- Tous les slugs de modèles sont uniques (redondant avec UNIQUE mais explicite)')
  L('  SELECT COUNT(*) - COUNT(DISTINCT slug) INTO cnt FROM public.device_models;')
  L('  IF cnt != 0 THEN')
  L('    RAISE EXCEPTION \'Erreur unicité : % slug(s) de modèle en doublon\', cnt;')
  L('  END IF;')
  L('')
  L('  -- Aucune entrée dans model_slug_history (aucun slug n\'a changé)')
  L('  SELECT COUNT(*) INTO cnt FROM public.model_slug_history;')
  L('  IF cnt != 0 THEN')
  L('    RAISE EXCEPTION \'Erreur inattendue : model_slug_history contient % ligne(s)\', cnt;')
  L('  END IF;')
  L('END;')
  L('$$;')

  // ── 11. Récapitulatif SELECT ───────────────────────────────────
  sep('11. Récapitulatif — résultat visible dans le SQL Editor')
  L('')
  L('SELECT table_name, imported_rows FROM (')
  L("  SELECT 'brands'            AS table_name, COUNT(*) AS imported_rows FROM public.brands")
  L("  UNION ALL SELECT 'device_categories', COUNT(*) FROM public.device_categories")
  L("  UNION ALL SELECT 'device_families',   COUNT(*) FROM public.device_families")
  L("  UNION ALL SELECT 'device_models',     COUNT(*) FROM public.device_models")
  L("  UNION ALL SELECT 'repair_types',      COUNT(*) FROM public.repair_types")
  L("  UNION ALL SELECT 'repair_offers',     COUNT(*) FROM public.repair_offers")
  L("  UNION ALL SELECT 'model_slug_history', COUNT(*) FROM public.model_slug_history")
  L(') summary ORDER BY table_name;')

  L('')
  L('COMMIT;')

  return lines.join('\n')
}

/* ── Génération SQL rollback ─────────────────────────────────── */

export function generateRollbackSql(plan: RepairMigrationPlan): string {
  const lines: string[] = []
  const L = (s = '') => lines.push(s)

  L('-- ' + '='.repeat(70))
  L('-- Projet   : ClikClak')
  L('-- Type     : ROLLBACK de l\'import initial des réparations (Phase 1B)')
  L(`-- Fingerprint plan : ${plan.fingerprint}`)
  L('-- AVERTISSEMENT CRITIQUE :')
  L('--   Ce rollback est destiné UNIQUEMENT à une annulation immédiate')
  L('--   après l\'import, AVANT toute utilisation de l\'interface admin.')
  L('--   Il refuse de s\'exécuter si les volumes ne correspondent pas exactement')
  L('--   à ceux de l\'import initial (protection contre la perte de données admin).')
  L('--   NE JAMAIS exécuter automatiquement.')
  L('-- ' + '='.repeat(70))
  L('')
  L('BEGIN;')
  L('')
  L('-- Vérification que les données correspondent exactement à l\'import initial')
  L('DO $$')
  L('DECLARE')
  L('  cnt bigint;')
  L('BEGIN')
  const rollbackChecks: Array<[string, number]> = [
    ['brands',           EXPECTED_VOLUMES.brands],
    ['device_categories', EXPECTED_VOLUMES.device_categories],
    ['device_families',  EXPECTED_VOLUMES.device_families],
    ['device_models',    EXPECTED_VOLUMES.device_models],
    ['repair_types',     EXPECTED_VOLUMES.repair_types],
    ['repair_offers',    EXPECTED_VOLUMES.repair_offers],
  ]
  for (const [tbl, expected] of rollbackChecks) {
    L(`  SELECT COUNT(*) INTO cnt FROM public.${tbl};`)
    L(`  IF cnt != ${expected} THEN`)
    L(`    RAISE EXCEPTION 'Rollback refusé : public.${tbl} = % (attendu ${expected} de l''import initial). Des modifications peuvent avoir eu lieu.', cnt;`)
    L(`  END IF;`)
  }
  L('END;')
  L('$$;')
  L('')
  L('-- Suppression dans l\'ordre inverse des dépendances')
  L('DELETE FROM public.repair_offers;')
  L('DELETE FROM public.device_models;')
  L('DELETE FROM public.repair_types;')
  L('DELETE FROM public.device_families;')
  L('DELETE FROM public.device_categories;')
  L('DELETE FROM public.brands;')
  L('')
  L('-- Vérification post-rollback : tables vides')
  L('DO $$')
  L('DECLARE')
  L('  cnt bigint;')
  L('BEGIN')
  for (const [tbl] of rollbackChecks) {
    L(`  SELECT COUNT(*) INTO cnt FROM public.${tbl};`)
    L(`  IF cnt != 0 THEN`)
    L(`    RAISE EXCEPTION 'Rollback incomplet : public.${tbl} contient encore % ligne(s)', cnt;`)
    L(`  END IF;`)
  }
  L('END;')
  L('$$;')
  L('')
  L('SELECT \'Rollback terminé — toutes les tables métier sont vides.\' AS status;')
  L('')
  L('COMMIT;')

  return lines.join('\n')
}

/* ── Tests internes ──────────────────────────────────────────── */

function assertEqual<T>(actual: T, expected: T, msg: string): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `[generateRepairImportSql test] ${msg}\n  attendu : ${JSON.stringify(expected)}\n  reçu    : ${JSON.stringify(actual)}`
    )
  }
}

export function runGeneratorTests(): void {
  // Échappement apostrophe
  assertEqual(sqlLiteral("L'exemple"), "'L''exemple'", "apostrophe → doublée")
  // Apostrophe multiple
  assertEqual(sqlLiteral("c'est l'été"), "'c''est l''été'", "double apostrophe")
  // Retour à la ligne (conservé tel quel dans un littéral SQL)
  assertEqual(sqlLiteral("ligne1\nligne2"), "'ligne1\nligne2'", "newline conservé")
  // Unicode
  assertEqual(sqlLiteral("Réparation — Écran"), "'Réparation — Écran'", "unicode + tiret long")
  // Null
  assertEqual(sqlLiteral(null), 'NULL', "null → NULL")
  assertEqual(sqlLiteral(undefined), 'NULL', "undefined → NULL")
  // Chaîne vide
  assertEqual(sqlLiteral(''), "''", "chaîne vide")
  // Slash
  assertEqual(sqlLiteral('/assets/icons/icon-iphone.svg'), "'/assets/icons/icon-iphone.svg'", "slash")

  // sqlInt
  assertEqual(sqlInt(null), 'NULL', "null → NULL")
  assertEqual(sqlInt(undefined), 'NULL', "undefined → NULL")
  assertEqual(sqlInt(12900), '12900', "12900")
  assertEqual(sqlInt(0), '0', "0")
  assertEqual(sqlInt(-1), '-1', "négatif")

  // Volumes attendus
  assertEqual(EXPECTED_VOLUMES.brands, 7, "7 marques attendues")
  assertEqual(EXPECTED_VOLUMES.device_categories, 3, "3 catégories attendues")
  assertEqual(EXPECTED_VOLUMES.device_families, 50, "50 familles attendues")
  assertEqual(EXPECTED_VOLUMES.device_models, 212, "212 modèles attendus")
  assertEqual(EXPECTED_VOLUMES.repair_types, 30, "30 types attendus")
  assertEqual(EXPECTED_VOLUMES.repair_offers, 1308, "1308 offres attendues")
  assertEqual(EXPECTED_VOLUMES.price_fixed, 1142, "1142 fixed attendus")
  assertEqual(EXPECTED_VOLUMES.price_unavailable, 4, "4 unavailable attendus")
  assertEqual(EXPECTED_VOLUMES.with_public_note, 4, "4 public_note attendus")
  assertEqual(EXPECTED_VOLUMES.with_subtitle, 96, "96 subtitles attendus")

  // Empreinte attendue
  assertEqual(EXPECTED_FINGERPRINT.length, 64, "fingerprint = 64 chars SHA-256")

  console.log('  ✓ generateRepairImportSql : 19 assertions réussies')
}
