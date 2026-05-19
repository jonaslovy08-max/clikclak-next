/**
 * test-icecat-diag.mjs — Diagnostic endpoints Open Icecat (v2 — sans expose credentials)
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dir = fileURLToPath(new URL('.', import.meta.url))
const ROOT  = join(__dir, '..')

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
  } catch { /* absent */ }
}

loadEnv('.env.local')
loadEnv('.env')

const USER = process.env.ICECAT_USERNAME
const PASS = process.env.ICECAT_PASSWORD
if (!USER || !PASS) { console.error('Credentials manquants.'); process.exit(1) }

const AUTH = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64')

async function probe(label, url, extraHeaders = {}) {
  const displayUrl = url.replace(/shopname=[^&]+/, 'shopname=***')
  process.stdout.write(`  [${label}] ${displayUrl.slice(0, 80)}... `)
  try {
    const res = await fetch(url, {
      headers: { Authorization: AUTH, Accept: 'application/json', ...extraHeaders },
    })
    const body = await res.text()
    const isJson = body.trim().startsWith('{') || body.trim().startsWith('[')
    const preview = body.slice(0, 150).replace(/\n/g, ' ')
    console.log(`HTTP ${res.status} | ${isJson ? 'JSON' : 'HTML/text'}`)
    if (isJson) console.log(`    JSON: ${preview}`)
    else console.log(`    HTML: (omis — ${body.length} chars)`)
    return { status: res.status, isJson, body }
  } catch (err) {
    console.log(`Erreur: ${err.message.replace(USER, '***').replace(PASS, '***')}`)
    return { status: null }
  }
}

console.log('══ DIAGNOSTIC ENDPOINTS ICECAT (v2) ══\n')

// 1. API icecat.biz — différentes structures
await probe('BO API', `https://bo.icecat.biz/api/products?lang=EN&Brand=Apple&Name=iPhone+15+Pro`)
await probe('US REST',  `https://icecat.us/api/products?lang=EN&Brand=Apple&Name=iPhone+15+Pro`)
await probe('BIZ REST v3', `https://icecat.biz/api/v3/products?lang=EN&Brand=Apple&Name=iPhone+15+Pro`)

// 2. Open Icecat XML feed historique avec shopname dans query
await probe('index.cgi shopname', `https://icecat.biz/index.cgi?shopname=${USER}&lang=EN&prod_id=MGKQ3LL%2FA&vendorname=Apple`)

// 3. Endpoint login pour récupérer un token
await probe('Login endpoint', `https://icecat.biz/api/login`, { 'Content-Type': 'application/json' })
await probe('BO Login', `https://bo.icecat.biz/api/login`)

// 4. Catalogue / accès direct par EAN (iPhone 14 EAN public)
await probe('EAN direct biz',    `https://icecat.biz/api/products/0194252791769?lang=EN`)
await probe('EAN direct US',     `https://icecat.us/api/products/0194252791769?lang=EN`)

// 5. Open Icecat utilise parfois /catalog/ ou /download/
await probe('catalog US', `https://icecat.us/catalog/brands/Apple.json`)
await probe('DL product',  `https://icecat.biz/xml_s3/xml_vendor_leaf/Apple/0194252791769_Apple.xml`)

console.log('\nDiagnostic v2 terminé.')
