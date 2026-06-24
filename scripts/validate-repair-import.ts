#!/usr/bin/env tsx
/**
 * scripts/validate-repair-import.ts
 *
 * Validateur post-import : lit toutes les données importées dans Supabase
 * et les compare champ par champ avec le plan local.
 *
 * Strictement en lecture seule. Génère un rapport JSON + Markdown.
 *
 * Usage :
 *   npm run supabase:import:validate
 *   (à exécuter APRÈS l'import manuel dans le SQL Editor Supabase)
 */

import { loadEnvConfig }  from '@next/env'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join }           from 'node:path'

loadEnvConfig(process.cwd())

import { buildRepairMigrationPlan } from '../lib/migration/buildRepairMigrationPlan'
import { validateRepairMigrationPlan } from '../lib/migration/validateRepairMigrationPlan'
import {
  EXPECTED_FINGERPRINT,
  EXPECTED_VOLUMES,
} from '../lib/migration/generateRepairImportSql'
import { compareRepairDatabaseWithPlan, type FieldDiff } from '../lib/migration/compareRepairDatabaseWithPlan'

const REPORTS_DIR = join(process.cwd(), 'migration-reports')

/* ── Affichage condensé des différences ──────────────────────── */

function printDiffs(diffs: FieldDiff[], max = 30): void {
  const shown = diffs.slice(0, max)
  for (const d of shown) {
    console.log(`  ✗ [${d.entity}] ${d.naturalKey}`)
    console.log(`      champ    : ${d.field}`)
    console.log(`      attendu  : ${JSON.stringify(d.expected)}`)
    console.log(`      obtenu   : ${JSON.stringify(d.actual)}`)
  }
  if (diffs.length > max) {
    console.log(`  ... et ${diffs.length - max} différence(s) supplémentaire(s) — voir le rapport JSON`)
  }
}

/* ── Rapport Markdown ────────────────────────────────────────── */

function buildMarkdownReport(ctx: {
  success:         boolean
  fingerprintMatch: boolean
  dbFingerprint:   string
  planFingerprint: string
  counts:          Record<string, number>
  priceCounts:     { fixed: number; on_request: number; quote: number; unavailable: number; with_note: number; with_subtitle: number }
  diffs:           FieldDiff[]
  adminProfile:    { exists: boolean; role?: string; active?: boolean }
  errors:          string[]
  generatedAt:     string
}): string {
  const { success, fingerprintMatch, dbFingerprint, planFingerprint, counts, priceCounts, diffs, adminProfile, errors, generatedAt } = ctx
  const icon = success ? '✅' : '❌'

  return `# Rapport Phase 1B — Validation post-import

**Généré le** : ${generatedAt}
**Résultat global** : ${icon} ${success ? 'SUCCÈS' : 'ÉCHOUÉ'}

## Empreintes

| | Valeur |
|---|---|
| Plan local | \`${planFingerprint}\` |
| Données Supabase | \`${dbFingerprint || '(non calculée)'}\` |
| Correspondance | ${fingerprintMatch ? '✅ Identiques' : '❌ DIFFÉRENTES'} |

## Volumes importés

| Table | Importé | Attendu | OK |
|---|---|---|---|
${Object.entries(EXPECTED_VOLUMES)
  .filter(([k]) => !k.startsWith('price_') && !k.startsWith('with_'))
  .map(([k, expected]) => {
    const actual = counts[k] ?? '?'
    return `| ${k} | ${actual} | ${expected} | ${actual === expected ? '✅' : '❌'} |`
  }).join('\n')}

## Prix et disponibilités

| Mode | Importé | Attendu | OK |
|---|---|---|---|
| fixed (disponibles) | ${priceCounts.fixed} | ${EXPECTED_VOLUMES.price_fixed} | ${priceCounts.fixed === EXPECTED_VOLUMES.price_fixed ? '✅' : '❌'} |
| on_request (disponibles) | ${priceCounts.on_request} | ${EXPECTED_VOLUMES.price_on_request} | ${priceCounts.on_request === EXPECTED_VOLUMES.price_on_request ? '✅' : '❌'} |
| quote | ${priceCounts.quote} | ${EXPECTED_VOLUMES.price_quote} | ${priceCounts.quote === EXPECTED_VOLUMES.price_quote ? '✅' : '❌'} |
| unavailable | ${priceCounts.unavailable} | ${EXPECTED_VOLUMES.price_unavailable} | ${priceCounts.unavailable === EXPECTED_VOLUMES.price_unavailable ? '✅' : '❌'} |
| avec public_note | ${priceCounts.with_note} | ${EXPECTED_VOLUMES.with_public_note} | ${priceCounts.with_note === EXPECTED_VOLUMES.with_public_note ? '✅' : '❌'} |
| avec subtitle | ${priceCounts.with_subtitle} | ${EXPECTED_VOLUMES.with_subtitle} | ${priceCounts.with_subtitle === EXPECTED_VOLUMES.with_subtitle ? '✅' : '❌'} |

## Profil administrateur

| Champ | Valeur |
|---|---|
| Existe | ${adminProfile.exists ? '✅ Oui' : '❌ Non'} |
| Rôle | ${adminProfile.role ?? 'N/A'} |
| Actif | ${adminProfile.active === true ? '✅ Oui' : adminProfile.active === false ? '❌ Non' : 'N/A'} |

## Différences champ par champ

${diffs.length === 0 ? '_Aucune différence — données identiques au plan._' : `**${diffs.length} différence(s) détectée(s)** — voir le rapport JSON pour la liste complète.`}

## Erreurs

${errors.length === 0 ? '_Aucune erreur._' : errors.map(e => `- ${e}`).join('\n')}
`
}

/* ── Point d'entrée ──────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  Phase 1B — Validation post-import')
  console.log('  Lecture seule : compare Supabase avec le plan local')
  console.log('══════════════════════════════════════════════════════════════\n')

  /* 1. Plan local ─────────────────────────────────────────────── */
  console.log('  [1/4] Construction du plan local...')
  const plan = buildRepairMigrationPlan()
  const validation = validateRepairMigrationPlan(plan)

  if (validation.errors.length > 0) {
    console.error(`  ✗ Plan local invalide : ${validation.errors.length} erreur(s)`)
    process.exit(1)
  }

  /* 2. Vérification fingerprint local ─────────────────────────── */
  console.log('  [2/4] Vérification empreinte locale...')
  if (plan.fingerprint !== EXPECTED_FINGERPRINT) {
    console.error('  ✗ Empreinte locale incorrecte !')
    console.error(`    Attendu : ${EXPECTED_FINGERPRINT}`)
    console.error(`    Obtenu  : ${plan.fingerprint}`)
    process.exit(1)
  }
  console.log(`  ✓ Empreinte locale : ${plan.fingerprint}\n`)

  /* 3. Lecture et comparaison Supabase ────────────────────────── */
  console.log('  [3/4] Lecture Supabase et comparaison (avec pagination)...')

  const url    = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) {
    console.error('  ✗ Variables NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY manquantes')
    process.exit(1)
  }

  let result
  try {
    result = await compareRepairDatabaseWithPlan(plan, url, secret)
  } catch (e: unknown) {
    console.error('  ✗ Erreur lors de la comparaison :', e instanceof Error ? e.message : String(e))
    process.exit(1)
  }

  /* 4. Affichage des résultats ─────────────────────────────────── */
  console.log('  [4/4] Résultats...\n')

  // Fingerprint
  console.log('  ── Empreintes ────────────────────────────────────────────')
  console.log(`  Plan local      : ${result.planFingerprint}`)
  console.log(`  Données Supabase: ${result.dbFingerprint || '(non calculée)'}`)
  console.log(`  Correspondance  : ${result.fingerprintMatch ? '✓ IDENTIQUES' : '✗ DIFFÉRENTES'}`)
  console.log()

  // Volumes
  console.log('  ── Volumes importés ──────────────────────────────────────')
  const volumeKeys = Object.entries(EXPECTED_VOLUMES).filter(([k]) => !k.startsWith('price_') && !k.startsWith('with_'))
  for (const [key, expected] of volumeKeys) {
    const actual = result.counts[key] ?? -1
    const ok = actual === expected
    console.log(`  ${ok ? '✓' : '✗'} ${key.padEnd(22)} ${String(actual).padStart(4)} / ${expected}`)
  }
  console.log()

  // Prix
  console.log('  ── Prix et disponibilités ────────────────────────────────')
  const pchecks: Array<[string, number, number]> = [
    ['fixed (disponibles)',   result.priceCounts.fixed,        EXPECTED_VOLUMES.price_fixed],
    ['on_request (dispo)',    result.priceCounts.on_request,   EXPECTED_VOLUMES.price_on_request],
    ['quote',                 result.priceCounts.quote,        EXPECTED_VOLUMES.price_quote],
    ['unavailable',           result.priceCounts.unavailable,  EXPECTED_VOLUMES.price_unavailable],
    ['avec public_note',      result.priceCounts.with_note,    EXPECTED_VOLUMES.with_public_note],
    ['avec subtitle',         result.priceCounts.with_subtitle, EXPECTED_VOLUMES.with_subtitle],
  ]
  for (const [label, actual, expected] of pchecks) {
    const ok = actual === expected
    console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(22)} ${String(actual).padStart(4)} / ${expected}`)
  }
  console.log()

  // Profil admin
  console.log('  ── Profil administrateur ─────────────────────────────────')
  if (result.adminProfile.exists) {
    console.log(`  ✓ Profil admin présent : role=${result.adminProfile.role}, active=${result.adminProfile.active}`)
    if (result.adminProfile.role !== 'admin') console.log('  ⚠ Rôle inattendu (attendu : admin)')
    if (!result.adminProfile.active) console.log('  ⚠ Profil admin inactif')
  } else {
    console.log('  ✗ Aucun profil admin trouvé')
  }
  console.log()

  // Différences
  if (result.diffs.length > 0) {
    console.log('  ── Différences champ par champ ───────────────────────────')
    printDiffs(result.diffs)
    console.log()
  }

  // Erreurs
  if (result.errors.length > 0) {
    console.log('  ── Erreurs ───────────────────────────────────────────────')
    for (const e of result.errors.slice(0, 20)) console.log(`  ✗ ${e}`)
    console.log()
  }

  /* ── Rapports fichiers ────────────────────────────────────────── */
  const generatedAt = new Date().toISOString()
  mkdirSync(REPORTS_DIR, { recursive: true })

  const jsonReport = {
    generatedAt,
    success:         result.success,
    fingerprintMatch: result.fingerprintMatch,
    planFingerprint:  result.planFingerprint,
    dbFingerprint:    result.dbFingerprint,
    counts:           result.counts,
    priceCounts:      result.priceCounts,
    adminProfile:     result.adminProfile,
    diffs:            result.diffs,
    errors:           result.errors,
  }
  writeFileSync(join(REPORTS_DIR, 'repair-import-validation.json'), JSON.stringify(jsonReport, null, 2), 'utf-8')

  const mdReport = buildMarkdownReport({
    success:          result.success,
    fingerprintMatch: result.fingerprintMatch,
    dbFingerprint:    result.dbFingerprint,
    planFingerprint:  result.planFingerprint,
    counts:           result.counts,
    priceCounts:      result.priceCounts,
    diffs:            result.diffs,
    adminProfile:     result.adminProfile,
    errors:           result.errors,
    generatedAt,
  })
  writeFileSync(join(REPORTS_DIR, 'repair-import-validation.md'), mdReport, 'utf-8')

  console.log('  Rapports enregistrés :')
  console.log('    migration-reports/repair-import-validation.json')
  console.log('    migration-reports/repair-import-validation.md')
  console.log()

  /* ── Résultat final ───────────────────────────────────────────── */
  if (result.success) {
    console.log('  ✅ Phase 1B — validation post-import : RÉUSSIE')
    console.log('  Toutes les données correspondent au plan local.')
    console.log('  Empreinte Supabase = Empreinte plan.')
    console.log()
    process.exit(0)
  } else {
    console.error('  ✗ Phase 1B — validation post-import : ÉCHOUÉE')
    if (!result.fingerprintMatch) console.error('  → Empreintes différentes')
    if (result.diffs.length > 0)  console.error(`  → ${result.diffs.length} différence(s) de champ`)
    if (result.errors.length > 0) console.error(`  → ${result.errors.length} erreur(s)`)
    console.error('  Voir migration-reports/repair-import-validation.json pour le détail.\n')
    process.exit(1)
  }
}

main().catch(err => {
  console.error('\n  ✗ Erreur inattendue :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
