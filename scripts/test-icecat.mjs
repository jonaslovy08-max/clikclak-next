/**
 * test-icecat.mjs — Script de test Open Icecat pour ClikClak Shop
 *
 * Usage : node scripts/test-icecat.mjs
 *   ou  : npm run icecat:test
 *
 * Lit ICECAT_USERNAME / ICECAT_PASSWORD depuis .env.local
 * Ne jamais logger les valeurs des credentials.
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dir = fileURLToPath(new URL('.', import.meta.url))
const ROOT  = join(__dir, '..')

/* ── Chargement .env.local ────────────────────────────────────── */
function loadEnv(file) {
  try {
    const raw = readFileSync(join(ROOT, file), 'utf8')
    for (const line of raw.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const idx = trimmed.indexOf('=')
      if (idx < 0) continue
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '')
      if (key && val && !process.env[key]) process.env[key] = val
    }
  } catch {
    // .env.local absent : pas bloquant
  }
}

loadEnv('.env.local')
loadEnv('.env')

const USER = process.env.ICECAT_USERNAME
const PASS = process.env.ICECAT_PASSWORD

if (!USER || !PASS) {
  console.error('[icecat] ERREUR : ICECAT_USERNAME ou ICECAT_PASSWORD absent dans .env.local')
  process.exit(1)
}

console.log('[icecat] Credentials chargés. Username length:', USER.length, '— Password length:', PASS.length)
console.log('[icecat] Démarrage des tests…\n')

/* ── Auth ─────────────────────────────────────────────────────── */
const AUTH = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64')

/* ── Produits à tester ────────────────────────────────────────── */
const PRODUCTS = [
  { brand: 'Apple',   name: 'iPhone 15 Pro' },
  { brand: 'Apple',   name: 'iPhone 14' },
  { brand: 'Samsung', name: 'Galaxy S23' },
  { brand: 'Apple',   name: 'MacBook Pro 14' },
  { brand: 'Apple',   name: 'AirPods Pro' },
  { brand: 'Apple',   name: 'USB-C Power Adapter 20W' },
]

/* ── Appel API ────────────────────────────────────────────────── */
async function testProduct(brand, name) {
  const query = new URLSearchParams({ lang: 'FR', Brand: brand, Name: name })
  const url = `https://icecat.biz/api/products?${query.toString()}`

  let status, data, errorMsg

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: AUTH,
        Accept: 'application/json',
      },
    })
    status = res.status
    if (res.ok) {
      data = await res.json()
    } else {
      errorMsg = `HTTP ${res.status} ${res.statusText}`
    }
  } catch (err) {
    errorMsg = err.message
  }

  const result = {
    query: `${brand} — ${name}`,
    httpStatus: status,
    found: false,
    productId: null,
    detectedName: null,
    detectedBrand: null,
    hasImage: false,
    imageCount: 0,
    hasSpecs: false,
    specsGroupCount: 0,
    langAvailable: null,
    exploitable: 'non',
    notes: '',
  }

  if (errorMsg) {
    result.notes = `Erreur réseau : ${errorMsg}`
    return result
  }

  if (!data) {
    result.notes = `Réponse vide ou erreur HTTP ${status}`
    return result
  }

  const products = data.products ?? data.data ?? (Array.isArray(data) ? data : [])

  if (!products.length) {
    result.notes = `Réponse OK mais 0 produit retourné. Keys: ${Object.keys(data).join(', ')}`
    return result
  }

  const p = products[0]
  result.found        = true
  result.productId    = p.product_id ?? p.Prod_id ?? p.id ?? null
  result.detectedName  = p.Name ?? p.name ?? p.Title ?? null
  result.detectedBrand = p.Vendorname ?? p.brand ?? p.Brand ?? null
  result.hasImage      = !!(p.HighImg || p.LowImg || p.img || (p.images && p.images.length))
  result.imageCount    = p.images?.length ?? (result.hasImage ? 1 : 0)
  result.hasSpecs      = !!(p.featuresGroups?.length || p.features?.length)
  result.specsGroupCount = p.featuresGroups?.length ?? 0
  result.langAvailable = p.lang ?? p.Language ?? 'inconnu'
  result.exploitable   = (result.hasImage && result.hasSpecs) ? 'oui' : result.hasImage || result.hasSpecs ? 'partiel' : 'non'
  result.notes = `${products.length} produit(s) retourné(s)`

  return result
}

/* ── Exécution ────────────────────────────────────────────────── */
const results = []

for (const { brand, name } of PRODUCTS) {
  process.stdout.write(`  Recherche : ${brand} — ${name} ... `)
  const r = await testProduct(brand, name)
  results.push(r)
  console.log(r.found ? `✓ Trouvé (${r.exploitable})` : `✗ Non trouvé — ${r.notes}`)
}

/* ── Affichage résultats ──────────────────────────────────────── */
console.log('\n══════════════════════════════════════════════')
console.log('RÉSULTATS OPEN ICECAT — ClikClak Shop')
console.log('══════════════════════════════════════════════\n')

for (const r of results) {
  console.log(`Produit  : ${r.query}`)
  console.log(`  Trouvé     : ${r.found ? 'oui' : 'non'}`)
  if (r.found) {
    console.log(`  ID         : ${r.productId}`)
    console.log(`  Nom detect : ${r.detectedName}`)
    console.log(`  Marque det : ${r.detectedBrand}`)
    console.log(`  Image      : ${r.hasImage ? `oui (${r.imageCount})` : 'non'}`)
    console.log(`  Specs      : ${r.hasSpecs ? `oui (${r.specsGroupCount} groupes)` : 'non'}`)
    console.log(`  Langue     : ${r.langAvailable}`)
    console.log(`  Exploitable: ${r.exploitable}`)
  }
  console.log(`  Notes      : ${r.notes || '-'}`)
  console.log()
}

/* ── Résumé ───────────────────────────────────────────────────── */
const found     = results.filter(r => r.found).length
const withImage = results.filter(r => r.hasImage).length
const withSpecs = results.filter(r => r.hasSpecs).length
const exploitable = results.filter(r => r.exploitable === 'oui').length

console.log('══════════════════════════════════════════════')
console.log(`Produits trouvés   : ${found} / ${results.length}`)
console.log(`Avec image         : ${withImage} / ${results.length}`)
console.log(`Avec specs         : ${withSpecs} / ${results.length}`)
console.log(`Pleinement exploit : ${exploitable} / ${results.length}`)
console.log('══════════════════════════════════════════════\n')

/* Export pour rapport */
export { results }
