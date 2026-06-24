#!/usr/bin/env tsx
/**
 * scripts/prepare-repair-import.ts
 *
 * Prépare l'import initial des réparations vers Supabase (Phase 1B).
 * NE fait aucune écriture distante. Génère uniquement les fichiers locaux.
 *
 * Étapes :
 *  1. Charger .env.local
 *  2. Tests internes
 *  3. Construire et valider le plan
 *  4. Vérifier l'empreinte (doit être exactement EXPECTED_FINGERPRINT)
 *  5. Compter les tables Supabase (toutes doivent être vides)
 *  6. Générer le SQL transactionnel
 *  7. Générer le SQL de rollback
 *  8. Générer le manifest (avec hash SHA-256 du SQL)
 *  9. Générer le rapport Markdown
 * 10. Afficher les instructions manuelles
 *
 * Usage :
 *   npm run supabase:import:prepare
 */

import { loadEnvConfig }   from '@next/env'
import { createHash }      from 'node:crypto'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join }            from 'node:path'
import { createClient }    from '@supabase/supabase-js'

loadEnvConfig(process.cwd())

import { runPriceConverterTests }      from '../lib/migration/priceConverter'
import {
  buildRepairMigrationPlan,
  getAppleBrandIcon,
  checkAssetExists,
} from '../lib/migration/buildRepairMigrationPlan'
import { validateRepairMigrationPlan } from '../lib/migration/validateRepairMigrationPlan'
import {
  generateRepairImportSql,
  generateRollbackSql,
  runGeneratorTests,
  EXPECTED_FINGERPRINT,
  EXPECTED_VOLUMES,
} from '../lib/migration/generateRepairImportSql'

const REPORTS_DIR = join(process.cwd(), 'migration-reports')

/* ── Comptage Supabase ───────────────────────────────────────── */

interface TableCount { table: string; count: number; error?: string }

async function countSupabaseTables(): Promise<{ available: boolean; results: TableCount[]; error?: string }> {
  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY

  if (!url || !secret) {
    return { available: false, results: [], error: 'Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquantes' }
  }

  const client = createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  const TABLES = [
    'brands', 'device_categories', 'device_families', 'device_models',
    'repair_types', 'repair_offers', 'model_slug_history',
  ]

  const results: TableCount[] = []
  for (const table of TABLES) {
    try {
      const { count, error } = await client
        .from(table)
        .select('id', { count: 'exact' })
        .limit(0)

      if (error) {
        results.push({ table, count: -1, error: `${error.message} [${error.code ?? ''}]` })
      } else {
        results.push({ table, count: count ?? 0 })
      }
    } catch (e: unknown) {
      results.push({ table, count: -1, error: e instanceof Error ? e.message : String(e) })
    }
  }

  return { available: true, results }
}

/* ── Rapport Markdown ────────────────────────────────────────── */

function buildMarkdownReport(ctx: {
  fingerprint:   string
  sqlHash:       string
  tableCounts:   TableCount[]
  generatedAt:   string
  planStats:     { brands: number; categories: number; families: number; models: number; types: number; offers: number }
  validationOk:  boolean
  errors:        number
  warnings:      number
}): string {
  const { fingerprint, sqlHash, tableCounts, generatedAt, planStats, validationOk, errors, warnings } = ctx
  const supabaseOk = tableCounts.every(r => r.count === 0)

  return `# Rapport Phase 1B — Préparation import réparations

**Généré le** : ${generatedAt}

## État de préparation

| Contrôle | Résultat |
|---|---|
| Fingerprint du plan | \`${fingerprint}\` |
| Hash SHA-256 du SQL | \`${sqlHash}\` |
| Validation plan | ${validationOk ? '✅ OK' : '❌ Erreurs'} |
| Erreurs bloquantes | ${errors} |
| Avertissements | ${warnings} |
| Tables Supabase vides | ${supabaseOk ? '✅ Toutes vides' : '❌ Tables non vides'} |

## Volumes du plan

| Entité | Attendu |
|---|---|
| Marques | ${planStats.brands} |
| Catégories | ${planStats.categories} |
| Familles | ${planStats.families} |
| Modèles | ${planStats.models} |
| Types de réparation | ${planStats.types} |
| Offres | ${planStats.offers} |

## État Supabase (avant import)

| Table | Lignes |
|---|---|
${tableCounts.map(r => `| ${r.table} | ${r.count < 0 ? `❌ erreur: ${r.error}` : r.count} |`).join('\n')}

## Fichiers générés

| Fichier | Rôle |
|---|---|
| \`repair-import.sql\` | Import transactionnel à exécuter dans le SQL Editor Supabase |
| \`repair-import-rollback.sql\` | Rollback d'urgence (usage exceptionnel uniquement) |
| \`repair-import-manifest.json\` | Hash du SQL + métadonnées |

## Action manuelle suivante

1. Ouvrir \`migration-reports/repair-import.sql\`
2. Vérifier son hash SHA-256 avec le manifest (\`shasum -a 256 migration-reports/repair-import.sql\`)
3. Copier le contenu du fichier SQL
4. Ouvrir Supabase Dashboard → SQL Editor
5. Créer une nouvelle requête (bouton **+** ou **New query**)
6. Coller le SQL
7. Cliquer **une seule fois** sur **Run**
8. **Ne pas relancer** si une erreur apparaît
9. Si succès → lancer \`npm run supabase:import:validate\`
`
}

/* ── Point d'entrée principal ────────────────────────────────── */

async function main(): Promise<void> {
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  Phase 1B — Préparation de l\'import réparations ClikClak')
  console.log('  Aucune écriture distante — génération locale uniquement')
  console.log('══════════════════════════════════════════════════════════════\n')

  let exitCode = 0

  /* 1. Tests internes ──────────────────────────────────────────── */
  console.log('  [1/9] Tests internes...')
  try {
    runPriceConverterTests()
    runGeneratorTests()
    const appleIcon = getAppleBrandIcon()
    if (!checkAssetExists(appleIcon)) throw new Error(`Logo Apple introuvable : ${appleIcon}`)
    console.log('  ✓ Tests internes réussis\n')
  } catch (e: unknown) {
    console.error('  ✗ Échec tests internes :', e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  /* 2. Construction du plan ───────────────────────────────────── */
  console.log('  [2/9] Construction du plan de migration...')
  const plan = buildRepairMigrationPlan()
  console.log(`  ✓ Plan construit : ${plan.brands.length} marques, ${plan.deviceModels.length} modèles, ${plan.repairOffers.length} offres\n`)

  /* 3. Validation du plan ─────────────────────────────────────── */
  console.log('  [3/9] Validation des contraintes métier...')
  const validation = validateRepairMigrationPlan(plan)
  if (validation.errors.length > 0) {
    console.error(`  ✗ ${validation.errors.length} erreur(s) bloquante(s) — import impossible`)
    for (const e of validation.errors.slice(0, 10)) {
      console.error(`    [${e.code}] ${e.message}`)
    }
    process.exit(1)
  }
  console.log(`  ✓ Validation OK : ${validation.passed.length} vérifications, ${validation.warnings.length} avertissement(s)\n`)

  /* 4. Vérification de l'empreinte ───────────────────────────── */
  console.log('  [4/9] Vérification de l\'empreinte du plan...')
  if (plan.fingerprint !== EXPECTED_FINGERPRINT) {
    console.error('  ✗ Empreinte du plan différente de celle attendue !')
    console.error(`    Attendu : ${EXPECTED_FINGERPRINT}`)
    console.error(`    Obtenu  : ${plan.fingerprint}`)
    console.error('    → Les fichiers data/ ont peut-être changé. Valider avant de continuer.')
    process.exit(1)
  }
  console.log(`  ✓ Empreinte validée : ${plan.fingerprint}\n`)

  /* 5. Vérification Supabase (tables vides) ───────────────────── */
  console.log('  [5/9] Vérification des tables Supabase (lecture seule)...')
  const supabase = await countSupabaseTables()

  if (!supabase.available) {
    console.error(`  ✗ Supabase non disponible : ${supabase.error}`)
    process.exit(1)
  }

  let supabaseBlocking = false
  for (const r of supabase.results) {
    if (r.count < 0) {
      console.error(`  ✗ ${r.table.padEnd(22)} erreur : ${r.error}`)
      supabaseBlocking = true
    } else if (r.count > 0) {
      console.error(`  ✗ ${r.table.padEnd(22)} ${r.count} ligne(s) — non vide !`)
      supabaseBlocking = true
    } else {
      console.log(`  ✓ ${r.table.padEnd(22)} vide`)
    }
  }

  if (supabaseBlocking) {
    console.error('\n  ✗ Préparation bloquée — tables non vides ou inaccessibles.')
    console.error('    Appliquer d\'abord les grants (002_grant_table_roles.sql) si nécessaire.')
    exitCode = 1
  } else {
    console.log('  ✓ 7 tables métier confirmées vides\n')
  }

  /* 6. Génération SQL ─────────────────────────────────────────── */
  console.log('  [6/9] Génération du SQL transactionnel...')
  const sqlContent = generateRepairImportSql(plan)
  const sqlHash    = createHash('sha256').update(sqlContent).digest('hex')
  console.log(`  ✓ SQL généré : ${sqlContent.length.toLocaleString('fr-CH')} caractères`)
  console.log(`  ✓ Hash SHA-256 : ${sqlHash}\n`)

  /* 7. Génération rollback ────────────────────────────────────── */
  console.log('  [7/9] Génération du rollback SQL...')
  const rollbackContent = generateRollbackSql(plan)
  console.log(`  ✓ Rollback généré : ${rollbackContent.length.toLocaleString('fr-CH')} caractères\n`)

  /* 8. Génération manifest ────────────────────────────────────── */
  console.log('  [8/9] Génération du manifest...')
  const generatedAt = new Date().toISOString()
  const manifest = {
    project:          'ClikClak',
    phase:            '1B — Import initial des réparations',
    generatedAt,
    fingerprint:      plan.fingerprint,
    sqlFile:          'repair-import.sql',
    sqlHash:          `sha256:${sqlHash}`,
    rollbackFile:     'repair-import-rollback.sql',
    schemaVersion:    '001',
    sourceFiles: [
      'data/repairTypes.ts', 'data/iphoneRepairs.ts', 'data/samsungRepairs.ts',
      'data/ipadRepairs.ts', 'data/macbookRepairs.ts', 'data/huaweiRepairs.ts',
      'data/oppoRepairs.ts', 'data/sonyXperiaRepairs.ts',
    ],
    expectedVolumes: EXPECTED_VOLUMES,
    supabaseTablesBeforeImport: Object.fromEntries(
      supabase.results.map(r => [r.table, r.count])
    ),
    validationErrors:   validation.errors.length,
    validationWarnings: validation.warnings.length,
  }
  console.log('  ✓ Manifest prêt\n')

  /* 9. Écriture des fichiers ──────────────────────────────────── */
  console.log('  [9/9] Écriture des fichiers...')
  mkdirSync(REPORTS_DIR, { recursive: true })

  writeFileSync(join(REPORTS_DIR, 'repair-import.sql'),           sqlContent,    'utf-8')
  writeFileSync(join(REPORTS_DIR, 'repair-import-rollback.sql'),  rollbackContent, 'utf-8')
  writeFileSync(join(REPORTS_DIR, 'repair-import-manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8')

  const mdReport = buildMarkdownReport({
    fingerprint:   plan.fingerprint,
    sqlHash:       `sha256:${sqlHash}`,
    tableCounts:   supabase.results,
    generatedAt,
    planStats: {
      brands:     plan.brands.length,
      categories: plan.deviceCategories.length,
      families:   plan.deviceFamilies.length,
      models:     plan.deviceModels.length,
      types:      plan.repairTypes.length,
      offers:     plan.repairOffers.length,
    },
    validationOk: validation.errors.length === 0,
    errors:       validation.errors.length,
    warnings:     validation.warnings.length,
  })
  writeFileSync(join(REPORTS_DIR, 'repair-import-preparation.md'), mdReport, 'utf-8')

  console.log('  Fichiers générés dans migration-reports/ :')
  console.log('    repair-import.sql             (import transactionnel)')
  console.log('    repair-import-rollback.sql    (rollback d\'urgence)')
  console.log('    repair-import-manifest.json   (métadonnées + hash)')
  console.log('    repair-import-preparation.md  (rapport)')

  /* ── Rapport terminal ────────────────────────────────────────── */

  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  RAPPORT PHASE 1B — PRÉPARATION')
  console.log('══════════════════════════════════════════════════════════════\n')

  console.log('  Empreinte du plan       :', plan.fingerprint)
  console.log('  Hash SHA-256 du SQL     :', `sha256:${sqlHash}`)
  console.log(`  Volumes SQL             : ${plan.brands.length} marques, ${plan.deviceCategories.length} cat., ${plan.deviceFamilies.length} fam., ${plan.deviceModels.length} mod., ${plan.repairTypes.length} types, ${plan.repairOffers.length} offres`)
  console.log('  Écriture Supabase       : AUCUNE — lecture seule')
  console.log()

  if (exitCode !== 0) {
    console.error('  ✗ Préparation incomplète — voir les erreurs ci-dessus.')
    console.error('    Corriger avant de lancer l\'import.\n')
    process.exit(exitCode)
  }

  /* ── Instructions manuelles ──────────────────────────────────── */

  console.log('══════════════════════════════════════════════════════════════')
  console.log('  ACTION MANUELLE SUIVANTE')
  console.log('══════════════════════════════════════════════════════════════\n')
  console.log('  1. Vérifier le hash du fichier SQL :')
  console.log('     shasum -a 256 migration-reports/repair-import.sql')
  console.log(`     → Attendu : sha256:${sqlHash}`)
  console.log()
  console.log('  2. Copier le contenu de migration-reports/repair-import.sql')
  console.log()
  console.log('  3. Ouvrir Supabase Dashboard → SQL Editor')
  console.log('     Créer une nouvelle requête (bouton + ou New query)')
  console.log()
  console.log('  4. Coller le SQL et cliquer UNE SEULE FOIS sur Run')
  console.log('     NE PAS relancer en cas d\'erreur')
  console.log()
  console.log('  5. Si succès → lancer :')
  console.log('     npm run supabase:import:validate')
  console.log()
  console.log('  ✅ Phase 1B — préparation : VALIDÉE')
  console.log('  Écriture distante effectuée : NON')
  console.log('  Tables métier avant import  : VIDES')
  console.log(`  Fingerprint du plan         : ${plan.fingerprint}`)
  console.log(`  Hash SQL                    : sha256:${sqlHash}`)
  console.log()
}

main().catch(err => {
  console.error('\n  ✗ Erreur inattendue :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
