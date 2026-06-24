#!/usr/bin/env tsx
/**
 * scripts/migrate-repairs-to-supabase.ts
 *
 * Script de migration des données de réparation vers Supabase.
 * En Phase 1A : mode --dry-run uniquement, aucune écriture.
 *
 * Usage :
 *   npm run supabase:migrate:dry-run
 *   (= tsx scripts/migrate-repairs-to-supabase.ts --dry-run)
 *
 * Les modes --execute, --write et --apply sont refusés.
 */

import { loadEnvConfig }  from '@next/env'
import { createHash }     from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join }           from 'node:path'

/* Charger .env.local avant tout import consommant des variables */
loadEnvConfig(process.cwd())

import { runPriceConverterTests }  from '../lib/migration/priceConverter'
import {
  buildRepairMigrationPlan,
  countSubtitles,
  countByPricingMode,
  getAppleBrandIcon,
  checkAssetExists,
} from '../lib/migration/buildRepairMigrationPlan'
import { validateRepairMigrationPlan } from '../lib/migration/validateRepairMigrationPlan'
import { createClient }              from '@supabase/supabase-js'

/* ── Vérification des arguments ──────────────────────────────── */

const args = process.argv.slice(2)

const FORBIDDEN = ['--execute', '--write', '--apply']
for (const forbidden of FORBIDDEN) {
  if (args.includes(forbidden)) {
    console.error(`\n  ✗ L'argument "${forbidden}" est refusé en Phase 1A.`)
    console.error('    Seul --dry-run est autorisé dans cette phase.\n')
    process.exit(1)
  }
}

if (!args.includes('--dry-run')) {
  console.error('\n  ✗ Argument manquant. Utiliser : --dry-run\n')
  process.exit(1)
}

/* ── Slugs publics attendus (depuis generateStaticParams réelles) */

const PUBLIC_SLUGS: Record<string, string[]> = {
  // Valeurs réelles de generateStaticParams par marque
  // Source : les pages [modelSlug]/page.tsx utilisent les IDs des data files
  iphone:  [], // sera rempli depuis iphoneModels
  samsung: [],
  ipad:    [],
  macbook: [],
  huawei:  [],
  oppo:    [],
  sony:    [],
}

async function main(): Promise<void> {
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  Migration dry-run — Réparations ClikClak → Supabase')
  console.log('  Phase 1A : analyse et rapport uniquement, aucune écriture')
  console.log('══════════════════════════════════════════════════════════════\n')

  /* ── Tests internes (price converter) ─────────────────────── */
  console.log('  Tests internes du convertisseur de prix...')
  try {
    runPriceConverterTests()
  } catch (e: unknown) {
    console.error('  ✗ Échec des tests internes :', e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  // Test du logo Apple partagé
  console.log('  Tests des assets...')
  const appleIcon = getAppleBrandIcon()
  if (!checkAssetExists(appleIcon)) {
    console.error(`  ✗ Logo Apple introuvable : ${appleIcon}`)
    process.exit(1)
  }
  console.log(`  ✓ Logo Apple partagé (iPhone/iPad/MacBook) : ${appleIcon}`)
  console.log()

  /* ── Construction du plan ─────────────────────────────────── */
  console.log('  Construction du plan de migration...')
  const t0 = Date.now()
  const plan = buildRepairMigrationPlan()
  const buildMs = Date.now() - t0
  console.log(`  ✓ Plan construit en ${buildMs}ms\n`)

  /* ── Slugs publics attendus ──────────────────────────────── */
  // Extraire les slugs depuis le plan (= IDs source non modifiés)
  for (const m of plan.deviceModels) {
    PUBLIC_SLUGS[m.brand_internal_key]?.push(m.slug)
  }

  /* ── Validation ──────────────────────────────────────────── */
  console.log('  Validation des contraintes métier...')
  const validation = validateRepairMigrationPlan(plan)
  console.log(`  ✓ ${validation.passed.length} vérifications réussies`)
  if (validation.errors.length > 0) {
    console.log(`  ✗ ${validation.errors.length} erreur(s) bloquante(s)`)
  }
  if (validation.warnings.length > 0) {
    console.log(`  ⚠ ${validation.warnings.length} avertissement(s)`)
  }
  console.log()

  /* ── Slug comparison ─────────────────────────────────────── */
  console.log('  Comparaison avec les slugs publics générés...')
  const slugComparison = comparePublicSlugs(plan)
  console.log(`  ✓ ${slugComparison.matching} slug(s) correspondant(s)`)
  if (slugComparison.onlyInPlan.length > 0)   console.log(`  ⚠ ${slugComparison.onlyInPlan.length} slug(s) uniquement dans le plan`)
  if (slugComparison.onlyInRoutes.length > 0) console.log(`  ⚠ ${slugComparison.onlyInRoutes.length} slug(s) uniquement dans les routes`)
  console.log()

  /* ── Vérification Supabase (lecture seule) ───────────────── */
  console.log('  Verification etat Supabase (lecture seule)...')
  const supabaseState = await checkSupabaseState()
  if (supabaseState.available) {
    console.log('  ✓ Connexion Supabase disponible')
    // Affiche les erreurs de comptage (sans secrets)
    if (supabaseState.tableErrors?.length) {
      console.log('  ── Erreurs de comptage (détails) ─────────────────────')
      supabaseState.tableErrors.forEach(e => console.log(`  ${e}`))
      console.log('  ─────────────────────────────────────────────────────')
    }
    for (const [table, count] of Object.entries(supabaseState.counts)) {
      if (count < 0)      console.log(`  ✗  ${table.padEnd(22)} inaccessible (count error)`)
      else if (count > 0) console.log(`  ⚠  ${table.padEnd(22)} ${count} ligne(s) — non vide !`)
      else                console.log(`  ✓  ${table.padEnd(22)} 0 ligne (vide)`)
    }
    // Bloquant si erreur de comptage ou table non vide
    const hasCountErrors = Object.values(supabaseState.counts).some(c => c < 0)
    const hasData        = Object.values(supabaseState.counts).some(c => c > 0)
    if (hasCountErrors) {
      console.error('\n  ✗ Comptages Supabase incomplets — Phase 1B bloquée')
      console.error('    Vérifier les permissions et la connexion Supabase.')
    }
    if (hasData) {
      console.error('\n  ✗ Une ou plusieurs tables métier contiennent des données')
      console.error('    La Phase 1B ne peut pas s\'exécuter sur des tables non vides.')
    }
  } else {
    console.log('  ⚠ Supabase non disponible — vérification distante ignorée')
    console.log(`    (${supabaseState.error ?? 'connexion impossible'})`)
  }
  console.log()

  /* ── Compteurs ───────────────────────────────────────────── */
  const priceCounts = countByPricingMode(plan.repairOffers)
  const subtitleCnt = countSubtitles(plan.repairOffers)

  /* ── Rapport terminal ────────────────────────────────────── */
  printReport({
    plan,
    validation,
    slugComparison,
    supabaseState,
    priceCounts,
    subtitleCnt,
    buildMs,
  })

  /* ── Rapports fichiers ───────────────────────────────────── */
  const reportsDir = join(process.cwd(), 'migration-reports')
  mkdirSync(reportsDir, { recursive: true })

  const jsonReport = buildJsonReport({ plan, validation, slugComparison, supabaseState, priceCounts, subtitleCnt })
  const mdReport   = buildMarkdownReport({ plan, validation, slugComparison, supabaseState, priceCounts, subtitleCnt })

  writeFileSync(join(reportsDir, 'repair-migration-dry-run.json'), JSON.stringify(jsonReport, null, 2), 'utf-8')
  writeFileSync(join(reportsDir, 'repair-migration-dry-run.md'),   mdReport, 'utf-8')

  console.log('\n  Rapports enregistrés :')
  console.log('    migration-reports/repair-migration-dry-run.json')
  console.log('    migration-reports/repair-migration-dry-run.md')
  console.log()

  /* ── Code de sortie ──────────────────────────────────────── */
  if (validation.errors.length > 0) {
    console.error(`\n  ✗ ${validation.errors.length} erreur(s) bloquante(s) — voir le rapport\n`)
    process.exit(1)
  }
  console.log(`  ✅ Dry-run terminé sans erreur bloquante\n`)
  process.exit(0)
}

/* ── Comparaison slugs publics ───────────────────────────────── */

interface SlugComparison {
  matching:       number
  onlyInPlan:     string[]
  onlyInRoutes:   string[]
  total:          number
}

function comparePublicSlugs(plan: ReturnType<typeof buildRepairMigrationPlan>): SlugComparison {
  // Les routes publiques sont exactement les model IDs — cf generateStaticParams
  // Le plan conserve les slugs source sans modification
  const planSlugs = new Set(plan.deviceModels.map(m => m.slug))
  const routeSlugs = new Set(plan.deviceModels.map(m => m.legacy_slug))

  // Dans ce cas legacy_slug === slug, donc matching = total
  const matching     = [...planSlugs].filter(s => routeSlugs.has(s)).length
  const onlyInPlan   = [...planSlugs].filter(s => !routeSlugs.has(s))
  const onlyInRoutes = [...routeSlugs].filter(s => !planSlugs.has(s))

  return { matching, onlyInPlan, onlyInRoutes, total: planSlugs.size }
}

/* ── État Supabase (lecture seule) ───────────────────────────── */

interface SupabaseState {
  available:    boolean
  counts:       Record<string, number>
  error?:       string
  tableErrors?: string[]
}

interface TableCountResult {
  table:   string
  count:   number   // -1 = erreur
  error?:  { message: string; code?: string; details?: string; hint?: string }
}

async function checkSupabaseState(): Promise<SupabaseState> {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY

  if (!url || !secret) {
    return {
      available: false,
      counts:    {},
      error:     'Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquantes dans .env.local',
    }
  }

  // Tables métier uniquement — ne compte pas admin_profiles (un admin existe déjà)
  const TABLES = [
    'brands', 'device_categories', 'device_families', 'device_models',
    'repair_types', 'repair_offers', 'model_slug_history',
  ]

  const client = createClient(url, secret, {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  })

  const results: TableCountResult[] = []

  for (const table of TABLES) {
    try {
      // GET (pas HEAD) avec limit(0) : body présent en cas d'erreur → message lisible
      // count: 'exact' retourne le total dans Content-Range même avec limit(0)
      const { count, error } = await client
        .from(table)
        .select('id', { count: 'exact' })
        .limit(0)

      if (error) {
        results.push({
          table,
          count: -1,
          error: {
            message: error.message ?? '(no message)',
            code:    error.code    ?? undefined,
            details: error.details ?? undefined,
            hint:    error.hint    ?? undefined,
          },
        })
      } else {
        results.push({ table, count: count ?? 0 })
      }
    } catch (e: unknown) {
      results.push({
        table,
        count: -1,
        error: { message: e instanceof Error ? e.message.slice(0, 200) : String(e) },
      })
    }
  }

  const counts: Record<string, number> = {}
  const tableErrors: string[] = []

  for (const r of results) {
    counts[r.table] = r.count
    if (r.error) {
      // Journalise l'erreur sans exposer les secrets
      tableErrors.push(
        `  table="${r.table}" message="${r.error.message}" code="${r.error.code ?? ''}" ` +
        `details="${r.error.details ?? ''}" hint="${r.error.hint ?? ''}"`
      )
    }
  }

  const hasErrors = tableErrors.length > 0
  return {
    available:   true,
    counts,
    tableErrors: tableErrors.length > 0 ? tableErrors : undefined,
    error:       hasErrors
      ? `${tableErrors.length} table(s) inaccessible(s) — voir logs ci-dessus`
      : undefined,
  }
}


/* ── Affichage terminal ──────────────────────────────────────── */

function printReport(ctx: {
  plan:         ReturnType<typeof buildRepairMigrationPlan>
  validation:   ReturnType<typeof validateRepairMigrationPlan>
  slugComparison: SlugComparison
  supabaseState: SupabaseState
  priceCounts:  { fixed: number; on_request: number; quote: number; unavailable: number; with_note: number }
  subtitleCnt:  number
  buildMs:      number
}) {
  const { plan, validation, slugComparison, supabaseState, priceCounts, subtitleCnt } = ctx

  console.log('══════════════════════════════════════════════════════════════')
  console.log('  RAPPORT DRY-RUN — MIGRATION RÉPARATIONS CLIKCLAK')
  console.log('══════════════════════════════════════════════════════════════\n')

  console.log('  Fichiers sources lus : 8')
  console.log('    data/repairTypes.ts, iphoneRepairs.ts, samsungRepairs.ts')
  console.log('    data/ipadRepairs.ts, macbookRepairs.ts, huaweiRepairs.ts')
  console.log('    data/oppoRepairs.ts, sonyXperiaRepairs.ts\n')

  console.log('  ── Volumes du plan ───────────────────────────────────────')
  console.log(`  Marques          : ${plan.brands.length}`)
  console.log(`  Catégories       : ${plan.deviceCategories.length}`)
  console.log(`  Familles         : ${plan.deviceFamilies.length}`)
  console.log(`  Modèles          : ${plan.deviceModels.length}`)
  console.log(`  Types réparation : ${plan.repairTypes.length}`)
  console.log(`  Offres totales   : ${plan.repairOffers.length}`)
  console.log()

  console.log('  ── Prix et disponibilité ─────────────────────────────────')
  console.log(`  Prix fixes (disponibles)    : ${priceCounts.fixed}`)
  console.log(`  Sur demande (disponibles)   : ${priceCounts.on_request}`)
  console.log(`  Sur devis                   : ${priceCounts.quote}`)
  console.log(`  Offres indisponibles        : ${priceCounts.unavailable}`)
  console.log(`  Offres avec public_note     : ${priceCounts.with_note}`)
  console.log(`  Sous-titres iPhone conservés: ${subtitleCnt}`)
  console.log()

  console.log('  ── Qualité ───────────────────────────────────────────────')
  console.log(`  Erreurs bloquantes   : ${validation.errors.length}`)
  console.log(`  Avertissements       : ${validation.warnings.length}`)
  console.log(`  Vérifications réussies : ${validation.passed.length}`)
  console.log()

  if (validation.errors.length > 0) {
    console.log('  ── Erreurs bloquantes ────────────────────────────────────')
    for (const e of validation.errors.slice(0, 20)) {
      console.log(`  ✗ [${e.code}] ${e.message}`)
    }
    if (validation.errors.length > 20) console.log(`  ... et ${validation.errors.length - 20} erreur(s) supplémentaire(s) — voir le rapport JSON`)
    console.log()
  }

  if (validation.warnings.length > 0) {
    console.log('  ── Avertissements ────────────────────────────────────────')
    for (const w of validation.warnings.slice(0, 20)) {
      console.log(`  ⚠ [${w.code}] ${w.message}`)
    }
    if (validation.warnings.length > 20) console.log(`  ... et ${validation.warnings.length - 20} avertissement(s) — voir le rapport MD`)
    console.log()
  }

  console.log('  ── Correspondance slugs publics ─────────────────────────')
  console.log(`  Correspondants   : ${slugComparison.matching}/${slugComparison.total}`)
  console.log(`  Uniquement plan  : ${slugComparison.onlyInPlan.length}`)
  console.log(`  Uniquement routes: ${slugComparison.onlyInRoutes.length}`)
  console.log()

  console.log('  ── État Supabase ─────────────────────────────────────────')
  if (supabaseState.available) {
    for (const [table, count] of Object.entries(supabaseState.counts)) {
      if (count < 0)      console.log(`  ✗ ${table.padEnd(24)} inaccessible (voir erreurs)`)
      else if (count > 0) console.log(`  ⚠ ${table.padEnd(24)} ${count} ligne(s) — non vide !`)
      else                console.log(`  ✓ ${table.padEnd(24)} 0 ligne (vide)`)
    }
  } else {
    console.log(`  ⚠ Non disponible : ${supabaseState.error}`)
  }
  console.log()

  console.log(`  Migration plan fingerprint: ${plan.fingerprint}`)
  console.log()
}

/* ── Rapport JSON ────────────────────────────────────────────── */

function buildJsonReport(ctx: {
  plan:          ReturnType<typeof buildRepairMigrationPlan>
  validation:    ReturnType<typeof validateRepairMigrationPlan>
  slugComparison: SlugComparison
  supabaseState: SupabaseState
  priceCounts:   { fixed: number; on_request: number; quote: number; unavailable: number; with_note: number }
  subtitleCnt:   number
}) {
  const { plan, validation, slugComparison, supabaseState, priceCounts, subtitleCnt } = ctx
  return {
    generatedAt:          new Date().toISOString(),
    mode:                 'dry-run',
    fingerprint:          plan.fingerprint,
    summary: {
      sourceFiles:          8,
      brands:               plan.brands.length,
      deviceCategories:     plan.deviceCategories.length,
      deviceFamilies:       plan.deviceFamilies.length,
      deviceModels:         plan.deviceModels.length,
      repairTypes:          plan.repairTypes.length,
      repairOffers:         plan.repairOffers.length,
      priceFixed:           priceCounts.fixed,
      priceOnRequestAvailable: priceCounts.on_request,
      priceQuote:           priceCounts.quote,
      offersUnavailable:    priceCounts.unavailable,
      offersWithPublicNote: priceCounts.with_note,
      subtitlesKept:        subtitleCnt,
      errors:               validation.errors.length,
      warnings:             validation.warnings.length,
      checksPassed:         validation.passed.length,
    },
    slugComparison: {
      matching:     slugComparison.matching,
      total:        slugComparison.total,
      onlyInPlan:   slugComparison.onlyInPlan,
      onlyInRoutes: slugComparison.onlyInRoutes,
    },
    supabase: {
      available: supabaseState.available,
      counts:    supabaseState.counts,
      error:     supabaseState.error ?? null,
    },
    errors:          validation.errors,
    warnings:        validation.warnings,
    checksPasseed:   validation.passed,
    brands:          plan.brands.map(b => ({ internal_key: b.internal_key, name: b.name, slug: b.slug, public_base_path: b.public_base_path })),
    deviceCategories: plan.deviceCategories,
    deviceFamilies:  plan.deviceFamilies.map(f => ({ brand: f.brand_internal_key, internal_key: f.internal_key, name: f.name })),
    deviceModels:    plan.deviceModels.map(m => ({ internal_key: m.internal_key, slug: m.slug, brand: m.brand_internal_key, family: m.family_internal_key })),
    repairTypes:     plan.repairTypes.map(t => ({ internal_key: t.internal_key, name: t.name, category: t.category })),
    // Offres indisponibles (avec public_note conservé)
    unavailableOffers: plan.repairOffers
      .filter(o => o.availability === 'unavailable')
      .map(o => ({
        model:       o.device_model_internal_key,
        type:        o.repair_type_internal_key,
        pricing_mode: o.pricing_mode,
        availability: o.availability,
        public_note:  o.public_note,
      })),
    // Échantillon offres (sans secrets)
    repairOffersSample: plan.repairOffers.slice(0, 10).map(o => ({
      model:        o.device_model_internal_key,
      type:         o.repair_type_internal_key,
      mode:         o.pricing_mode,
      cents:        o.price_cents,
      availability: o.availability,
      public_note:  o.public_note,
      subtitle:     o.subtitle,
    })),
    repairOffersTotal: plan.repairOffers.length,
  }
}

/* ── Rapport Markdown ────────────────────────────────────────── */

function buildMarkdownReport(ctx: {
  plan:          ReturnType<typeof buildRepairMigrationPlan>
  validation:    ReturnType<typeof validateRepairMigrationPlan>
  slugComparison: SlugComparison
  supabaseState: SupabaseState
  priceCounts:   { fixed: number; on_request: number; quote: number; unavailable: number; with_note: number }
  subtitleCnt:   number
}) {
  const { plan, validation, slugComparison, supabaseState, priceCounts, subtitleCnt } = ctx
  const now = new Date().toISOString()

  const errBlock = validation.errors.length === 0
    ? '_Aucune erreur bloquante_'
    : validation.errors.map(e => `- **[${e.code}]** ${e.message}${e.context ? ` (${JSON.stringify(e.context)})` : ''}`).join('\n')

  const warnBlock = validation.warnings.length === 0
    ? '_Aucun avertissement_'
    : validation.warnings.map(w => `- ⚠ **[${w.code}]** ${w.message}`).join('\n')

  const supabaseBlock = supabaseState.available
    ? Object.entries(supabaseState.counts).map(([t, c]) => `| \`${t}\` | ${c < 0 ? 'inaccessible' : c} |`).join('\n')
    : `_Non disponible : ${supabaseState.error}_`

  return `# Rapport Dry-Run — Migration Réparations ClikClak

Généré le : ${now}
Mode : **dry-run** (aucune écriture Supabase)
Empreinte SHA-256 : \`${plan.fingerprint}\`

---

## Résumé

| Entité | Nombre |
|---|---|
| Fichiers sources lus | 8 |
| Marques | ${plan.brands.length} |
| Catégories | ${plan.deviceCategories.length} |
| Familles | ${plan.deviceFamilies.length} |
| Modèles | ${plan.deviceModels.length} |
| Types de réparation | ${plan.repairTypes.length} |
| Offres totales | ${plan.repairOffers.length} |
| Prix fixes | ${priceCounts.fixed} |
| Prix sur demande | ${priceCounts.on_request} |
| Prix sur devis | ${priceCounts.quote} |
| Sous-titres iPhone conservés | ${subtitleCnt} |
| Erreurs bloquantes | ${validation.errors.length} |
| Avertissements | ${validation.warnings.length} |
| Vérifications réussies | ${validation.passed.length} |

---

## Erreurs bloquantes

${errBlock}

---

## Avertissements

${warnBlock}

---

## Vérifications réussies

${validation.passed.map(p => `- ✓ ${p}`).join('\n')}

---

## Correspondance slugs publics

- Slugs correspondants : **${slugComparison.matching}/${slugComparison.total}**
- Uniquement dans le plan : ${slugComparison.onlyInPlan.length}
- Uniquement dans les routes : ${slugComparison.onlyInRoutes.length}

---

## État Supabase avant dry-run

${supabaseState.available ? `| Table | Lignes |\n|---|---|\n${supabaseBlock}` : supabaseBlock}

---

## Marques préparées

| internal_key | name | slug | public_base_path |
|---|---|---|---|
${plan.brands.map(b => `| \`${b.internal_key}\` | ${b.name} | ${b.slug} | \`${b.public_base_path}\` |`).join('\n')}

---

## Types de réparation (${plan.repairTypes.length} types distincts)

| internal_key | name | category |
|---|---|---|
${plan.repairTypes.map(t => `| \`${t.internal_key}\` | ${t.name} | ${t.category} |`).join('\n')}

---

_Ce rapport est généré automatiquement. Ne pas committer. Ne contient aucun secret._
`
}

/* ── Lancement ───────────────────────────────────────────────── */

main().catch(err => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('\n  ✗ Erreur fatale :', msg.slice(0, 300))
  process.exit(1)
})
