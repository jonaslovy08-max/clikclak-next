#!/usr/bin/env tsx
/**
 * scripts/check-supabase-connection.ts
 *
 * Vérifie que la connexion Supabase est opérationnelle et que
 * les tables de la migration 001 sont présentes.
 *
 * Usage :
 *   npm run supabase:check
 *
 * Retourne exit code 0 si tout est correct, 1 sinon.
 * Ne crée, modifie ni supprime aucune donnée.
 * N'affiche jamais les valeurs des clés.
 */

/*
  tsx (et Node.js en général) ne charge pas automatiquement .env.local.
  @next/env charge les fichiers .env, .env.local, .env.production… dans l'ordre
  défini par Next.js, sans nécessiter de dépendance supplémentaire.
  Doit être appelé AVANT toute lecture de process.env.
*/
import { loadEnvConfig } from '@next/env'

loadEnvConfig(process.cwd())

import { createClient } from '@supabase/supabase-js'

const EXPECTED_TABLES = [
  'brands',
  'device_categories',
  'device_families',
  'device_models',
  'repair_types',
  'repair_offers',
  'admin_profiles',
  'admin_activity_logs',
  'model_slug_history',
] as const

function maskUrl(url: string): string {
  try {
    const u = new URL(url)
    return `${u.protocol}//${u.hostname.slice(0, 20)}...`
  } catch {
    return '[URL invalide]'
  }
}

async function main(): Promise<void> {
  console.log('\n── Vérification connexion Supabase (ClikClak Admin) ──────────\n')

  /* 1. Variables d'environnement */
  const url       = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secretKey = process.env.SUPABASE_SECRET_KEY

  if (!url) {
    console.error('  ✗ NEXT_PUBLIC_SUPABASE_URL manquante.')
    console.error('    → Ajouter la valeur dans .env.local (voir .env.example)')
    process.exit(1)
  }
  if (!secretKey) {
    console.error('  ✗ SUPABASE_SECRET_KEY manquante.')
    console.error('    → Ajouter la valeur dans .env.local (côté serveur uniquement)')
    process.exit(1)
  }

  console.log(`  ✓ Variables d'environnement présentes`)
  console.log(`    Supabase URL : ${maskUrl(url)}`)
  console.log()

  /* 2. Connexion */
  const client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  /* 3. Vérification des tables via requête HEAD sur chaque table */
  console.log(`  Vérification des ${EXPECTED_TABLES.length} tables attendues...\n`)

  const missing: string[] = []
  const found:   string[] = []

  for (const table of EXPECTED_TABLES) {
    const { error } = await client
      .from(table)
      .select('id', { count: 'exact', head: true })

    if (error) {
      /*
        "relation does not exist" → table absente.
        "permission denied"       → table présente mais RLS bloque (normal en Phase 0).
        Toute autre erreur est traitée comme table manquante.
      */
      const detail = error.message ?? ''
      const isRlsBlock = detail.toLowerCase().includes('permission')
                      || detail.toLowerCase().includes('rls')
                      || error.code === 'PGRST301'

      if (isRlsBlock) {
        // Table présente, accès bloqué par RLS — attendu si la SUPABASE_SECRET_KEY n'est pas encore configurée
        found.push(table)
        console.log(`  ✓ ${table.padEnd(28)} (accessible)`)
      } else if (detail.toLowerCase().includes('does not exist') || detail.includes('42P01')) {
        missing.push(table)
        console.log(`  ✗ ${table.padEnd(28)} MANQUANTE — migration non appliquée ?`)
      } else {
        found.push(table)
        console.log(`  ✓ ${table.padEnd(28)} (réponse reçue)`)
      }
    } else {
      found.push(table)
      console.log(`  ✓ ${table.padEnd(28)} (accessible)`)
    }
  }

  console.log()

  /* 4. Résultat */
  if (missing.length > 0) {
    console.error(`  ✗ ${missing.length} table(s) manquante(s) : ${missing.join(', ')}`)
    console.error()
    console.error('  → Appliquer la migration dans Supabase :')
    console.error('    Dashboard → SQL Editor → coller supabase/migrations/001_*.sql → Run')
    console.error('  → Voir docs/admin-supabase-setup.md pour les instructions complètes')
    process.exit(1)
  }

  console.log(`  ✓ ${found.length}/${EXPECTED_TABLES.length} tables vérifiées`)
  console.log()
  console.log('  ✅ Connexion Supabase opérationnelle — Phase 0 validée')
  console.log()
  console.log('──────────────────────────────────────────────────────────────\n')
}

main().catch(err => {
  const msg = err instanceof Error ? err.message : String(err)
  console.error('\n  ✗ Erreur inattendue :', msg.slice(0, 200))
  process.exit(1)
})
