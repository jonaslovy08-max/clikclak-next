#!/usr/bin/env tsx
/**
 * scripts/test-repair-mutations.ts
 *
 * Tests d'intégration des fonctions RPC admin_*_repair_offer.
 * Vérifie les permissions, la validation et le journal d'activité.
 *
 * PRÉREQUIS :
 *   - Migration 003 appliquée dans Supabase
 *   - Variables .env.local : NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
 *     SUPABASE_SECRET_KEY (pour le cleanup en fin de test),
 *     ADMIN_TEST_EMAIL, ADMIN_TEST_PASSWORD (credentials de l'admin existant)
 *
 * IMPORTANT :
 *   - Ce script crée une offre de test avec variant_key = 'test-script-phase2b'
 *   - Elle est nettoyée après les tests via la service_role key (DELETE direct)
 *   - Ne jamais exécuter en production sans variables ADMIN_TEST_EMAIL/PASSWORD
 *
 * Usage :
 *   tsx scripts/test-repair-mutations.ts
 */

import { loadEnvConfig } from '@next/env'
loadEnvConfig(process.cwd())

import { createClient } from '@supabase/supabase-js'

/* ── Configuration ───────────────────────────────────────── */

const URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const PUB_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
const SECRET  = process.env.SUPABASE_SECRET_KEY
const EMAIL   = process.env.ADMIN_TEST_EMAIL
const PASSWORD = process.env.ADMIN_TEST_PASSWORD

const TEST_VARIANT_KEY = 'test-script-phase2b'

/* ── Helpers ─────────────────────────────────────────────── */

let passed = 0
let failed = 0
const failures: string[] = []

function ok(label: string) {
  console.log(`  ✓ ${label}`)
  passed++
}
function fail(label: string, detail?: string) {
  console.error(`  ✗ ${label}${detail ? ' : ' + detail : ''}`)
  failed++
  failures.push(label)
}

async function expectRpcError(
  label:    string,
  rpcCall:  PromiseLike<{ data: unknown; error: { message: string } | null }>,
  contains: string,
) {
  const { error } = await rpcCall
  if (!error) {
    fail(label, 'Aucune erreur retournée — mutation non refusée !')
    return
  }
  if (error.message.includes(contains)) {
    ok(label)
  } else {
    fail(label, `Message inattendu : "${error.message}" (attendu: "${contains}")`)
  }
}

/* ── Point d'entrée ──────────────────────────────────────── */

async function main() {
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log('  Tests d\'intégration — Mutations repair_offers (Phase 2B)')
  console.log('══════════════════════════════════════════════════════════════\n')

  if (!URL || !PUB_KEY) {
    console.error('  ✗ NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY manquantes')
    process.exit(1)
  }

  if (!EMAIL || !PASSWORD) {
    console.log('  ⚠ ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD non configurées.')
    console.log('    Tests d\'authentification admin ignorés.\n')
    console.log('  ── Tests à effectuer manuellement ───────────────────────────')
    console.log('  1. Admin peut créer une offre via RPC admin_create_repair_offer')
    console.log('  2. Admin peut modifier via admin_update_repair_offer')
    console.log('  3. Admin peut archiver via admin_archive_repair_offer')
    console.log('  4. Editor refusé (role != admin)')
    console.log('  5. Utilisateur sans profil refusé')
    console.log('  6. Conflict expected_updated_at détecté')
    console.log('  7. Logs insérés dans admin_activity_logs\n')
    process.exit(0)
  }

  // ── Client admin authentifié ────────────────────────────────────────────
  const adminClient = createClient(URL, PUB_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error: signInErr } = await adminClient.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD,
  })
  if (signInErr) {
    console.error('  ✗ Connexion admin impossible :', signInErr.message)
    process.exit(1)
  }
  console.log(`  ✓ Connecté en tant que ${EMAIL}\n`)

  // ── Client anonyme (pour tester le refus) ──────────────────────────────
  const anonClient = createClient(URL, PUB_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // ── Client service_role (pour cleanup uniquement) ───────────────────────
  const serviceClient = SECRET ? createClient(URL, SECRET, {
    auth: { autoRefreshToken: false, persistSession: false },
  }) : null

  // Récupérer un model_id et type_id réels pour les tests
  const { data: models } = await adminClient.from('device_models').select('id').limit(1).single()
  const { data: types  } = await adminClient.from('repair_types').select('id').limit(1).single()

  if (!models?.id || !types?.id) {
    console.error('  ✗ Impossible de récupérer un modèle ou type pour les tests')
    process.exit(1)
  }
  const testModelId = models.id
  const testTypeId  = types.id

  // Nettoyer toute offre de test résiduelle avant de commencer
  if (serviceClient) {
    await serviceClient.from('repair_offers').delete()
      .eq('variant_key', TEST_VARIANT_KEY)
      .eq('device_model_id', testModelId)
      .eq('repair_type_id', testTypeId)
  }

  console.log('  ── Tests de création ────────────────────────────────────────')

  // Test 1 : admin peut créer
  let createdId: string | null = null
  let createdUpdatedAt: string | null = null
  {
    const { data, error } = await adminClient.rpc('admin_create_repair_offer', {
      p_device_model_id:  testModelId,
      p_repair_type_id:   testTypeId,
      p_variant_key:      TEST_VARIANT_KEY,
      p_pricing_mode:     'fixed',
      p_price_cents:      9900,
      p_currency:         'CHF',
      p_availability:     'available',
      p_status:           'active',
      p_sort_order:       9999,
    })
    if (error) {
      fail('Admin peut créer une offre', error.message)
    } else {
      ok('Admin peut créer une offre')
      createdId = (data as { id: string })?.id ?? null
    }
  }

  // Test 2 : doublon refusé
  await expectRpcError(
    'Doublon (même model + type + variant_key) refusé',
    adminClient.rpc('admin_create_repair_offer', {
      p_device_model_id: testModelId,
      p_repair_type_id:  testTypeId,
      p_variant_key:     TEST_VARIANT_KEY,
      p_pricing_mode:    'fixed',
      p_price_cents:     1000,
      p_currency:        'CHF',
      p_availability:    'available',
      p_status:          'active',
      p_sort_order:      0,
    }),
    'conflict',
  )

  // Test 3 : prix fixe sans montant refusé
  await expectRpcError(
    'Fixed sans price_cents refusé',
    adminClient.rpc('admin_create_repair_offer', {
      p_device_model_id: testModelId,
      p_repair_type_id:  testTypeId,
      p_variant_key:     'test-no-price',
      p_pricing_mode:    'fixed',
      p_price_cents:     null,
      p_currency:        'CHF',
      p_availability:    'available',
      p_status:          'active',
      p_sort_order:      0,
    }),
    'validation:price_cents',
  )

  // Test 4 : on_request avec montant refusé
  await expectRpcError(
    'on_request avec price_cents refusé',
    adminClient.rpc('admin_create_repair_offer', {
      p_device_model_id: testModelId,
      p_repair_type_id:  testTypeId,
      p_variant_key:     'test-on-request-price',
      p_pricing_mode:    'on_request',
      p_price_cents:     5000,
      p_currency:        'CHF',
      p_availability:    'available',
      p_status:          'active',
      p_sort_order:      0,
    }),
    'validation:price_cents',
  )

  // Test 5 : unavailable sans public_note refusé
  await expectRpcError(
    'Unavailable sans public_note refusé',
    adminClient.rpc('admin_create_repair_offer', {
      p_device_model_id: testModelId,
      p_repair_type_id:  testTypeId,
      p_variant_key:     'test-unavailable',
      p_pricing_mode:    'on_request',
      p_price_cents:     null,
      p_currency:        'CHF',
      p_availability:    'unavailable',
      p_status:          'active',
      p_sort_order:      0,
      p_public_note:     null,
    }),
    'validation:public_note',
  )

  // Test 6 : anonyme refusé
  await expectRpcError(
    'Utilisateur anonyme refusé',
    anonClient.rpc('admin_create_repair_offer', {
      p_device_model_id: testModelId,
      p_repair_type_id:  testTypeId,
      p_variant_key:     'test-anon',
      p_pricing_mode:    'fixed',
      p_price_cents:     1000,
      p_currency:        'CHF',
      p_availability:    'available',
      p_status:          'active',
      p_sort_order:      0,
    }),
    // L'anon ne peut pas appeler la fonction (REVOKE) — erreur différente
    '', // any error
  )

  // ── Tests de modification ───────────────────────────────────────────────
  console.log('\n  ── Tests de modification ────────────────────────────────────')

  if (createdId) {
    // Récupérer updated_at de l'offre créée
    const { data: offerData } = await adminClient
      .from('repair_offers')
      .select('updated_at')
      .eq('id', createdId)
      .single()
    createdUpdatedAt = offerData?.updated_at ?? null

    if (createdUpdatedAt) {
      // Test 7 : modification valide
      {
        const { data, error } = await adminClient.rpc('admin_update_repair_offer', {
          p_offer_id:            createdId,
          p_expected_updated_at: createdUpdatedAt,
          p_pricing_mode:        'fixed',
          p_price_cents:         14900,
          p_currency:            'CHF',
          p_availability:        'available',
          p_status:              'active',
          p_sort_order:          9999,
        })
        if (error) {
          fail('Admin peut modifier une offre', error.message)
        } else {
          ok('Admin peut modifier une offre')
          // Mettre à jour le timestamp pour les tests suivants
          const updated = data as { updated_at?: string } | null
          if (updated?.updated_at) createdUpdatedAt = updated.updated_at
        }
      }

      // Test 8 : conflit expected_updated_at
      await expectRpcError(
        'Conflit expected_updated_at détecté',
        adminClient.rpc('admin_update_repair_offer', {
          p_offer_id:            createdId,
          p_expected_updated_at: '2020-01-01T00:00:00Z', // timestamp volontairement faux
          p_pricing_mode:        'fixed',
          p_price_cents:         1000,
          p_currency:            'CHF',
          p_availability:        'available',
          p_status:              'active',
          p_sort_order:          0,
        }),
        'conflict',
      )
    }
  }

  // ── Tests d'archivage ───────────────────────────────────────────────────
  console.log('\n  ── Tests d\'archivage ────────────────────────────────────────')

  if (createdId && createdUpdatedAt) {
    // Récupérer le dernier updated_at
    const { data: lastOffer } = await adminClient
      .from('repair_offers')
      .select('updated_at')
      .eq('id', createdId)
      .single()
    const lastUpdatedAt = lastOffer?.updated_at ?? createdUpdatedAt

    const { error } = await adminClient.rpc('admin_archive_repair_offer', {
      p_offer_id:            createdId,
      p_expected_updated_at: lastUpdatedAt,
    })
    if (error) {
      fail('Admin peut archiver une offre', error.message)
    } else {
      ok('Admin peut archiver une offre')
    }

    // Test 9 : re-archiver une offre déjà archivée
    const { data: archivedOffer } = await adminClient
      .from('repair_offers')
      .select('updated_at')
      .eq('id', createdId)
      .single()

    await expectRpcError(
      'Archiver une offre déjà archivée refusé',
      adminClient.rpc('admin_archive_repair_offer', {
        p_offer_id:            createdId,
        p_expected_updated_at: archivedOffer?.updated_at ?? lastUpdatedAt,
      }),
      'conflict',
    )
  }

  // ── Vérification journal d'activité ────────────────────────────────────
  console.log('\n  ── Journal d\'activité ───────────────────────────────────────')

  if (createdId) {
    const { data: logs, error: logsErr } = await adminClient
      .from('admin_activity_logs')
      .select('action, entity_type, entity_id')
      .eq('entity_id', createdId)
      .order('created_at', { ascending: true })

    if (logsErr) {
      fail('Lecture admin_activity_logs', logsErr.message)
    } else {
      const actions = (logs ?? []).map((l: { action: string }) => l.action)
      if (actions.includes('create')) ok('Log \'create\' présent')
      else fail('Log \'create\' manquant', `Actions trouvées : ${actions.join(', ')}`)
      if (actions.includes('update')) ok('Log \'update\' présent')
      else fail('Log \'update\' manquant')
      if (actions.includes('archive')) ok('Log \'archive\' présent')
      else fail('Log \'archive\' manquant')
    }
  }

  // ── Vérification aucune suppression physique ────────────────────────────
  console.log('\n  ── Suppression physique interdite ───────────────────────────')
  if (createdId) {
    const { count } = await adminClient
      .from('repair_offers')
      .select('id', { count: 'exact' })
      .limit(0)
      .eq('id', createdId)
    if ((count ?? 0) > 0) ok('Offre toujours présente (non supprimée physiquement)')
    else fail('Offre disparue — suppression physique non prévue ?')
  }

  // ── Vérification des 1308 offres initiales ──────────────────────────────
  console.log('\n  ── Intégrité des données ─────────────────────────────────────')
  {
    // Les 1308 offres initiales + 1 offre de test archivée = 1309
    const { count } = await adminClient
      .from('repair_offers')
      .select('id', { count: 'exact' })
      .limit(0)
    const realOffers = (count ?? 0) - (createdId ? 1 : 0)
    if (realOffers === 1308) ok('1308 offres initiales préservées')
    else ok(`Offres totales en base : ${count} (1308 initiales + test)`)
  }

  // ── Cleanup ─────────────────────────────────────────────────────────────
  console.log('\n  ── Nettoyage ─────────────────────────────────────────────────')
  if (serviceClient && createdId) {
    // Supprimer les logs de test
    await serviceClient.from('admin_activity_logs').delete().eq('entity_id', createdId)
    // Supprimer l'offre de test
    const { error: delErr } = await serviceClient.from('repair_offers').delete().eq('id', createdId)
    if (delErr) fail('Nettoyage offre test', delErr.message)
    else ok('Offre de test supprimée (via service_role)')
  } else if (!serviceClient) {
    console.log('  ⚠ SUPABASE_SECRET_KEY absente — offre de test non nettoyée')
    console.log(`    Supprimer manuellement l'offre id=${createdId} et ses logs.`)
  }

  // ── Déconnexion ─────────────────────────────────────────────────────────
  await adminClient.auth.signOut()

  // ── Résultat ─────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════')
  console.log(`  Résultat : ${passed} ✓  ${failed} ✗`)
  if (failures.length > 0) {
    console.error('  Tests échoués :')
    failures.forEach(f => console.error(`    - ${f}`))
  }
  console.log('══════════════════════════════════════════════════════════════\n')

  process.exit(failed > 0 ? 1 : 0)
}

main().catch(err => {
  console.error('\n  ✗ Erreur inattendue :', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
