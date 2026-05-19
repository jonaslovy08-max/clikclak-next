/**
 * test-icecat-bo.mjs — Exploration API bo.icecat.biz
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'

const __dir = fileURLToPath(new URL('.', import.meta.url))

function loadEnv(file) {
  try {
    const raw = readFileSync(join(__dir, '..', file), 'utf8')
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
const BO   = 'https://bo.icecat.biz'

async function probe(label, url, method = 'GET', body = null) {
  const displayUrl = url.replace(/shopname=[^&]+/, 'shopname=***')
  process.stdout.write(`  [${label}] ${method} ${displayUrl.replace(BO, '')} `)
  try {
    const opts = { method, headers: { Authorization: AUTH, Accept: 'application/json', 'Content-Type': 'application/json' } }
    if (body) opts.body = JSON.stringify(body)
    const res = await fetch(url, opts)
    const text = await res.text()
    const isJson = text.trim().startsWith('{') || text.trim().startsWith('[')
    const preview = text.slice(0, 200).replace(/\n/g, ' ')
    console.log(`→ HTTP ${res.status}`)
    if (isJson) console.log(`    ${preview}`)
    else console.log(`    HTML/text (${text.length} chars)`)
    return { status: res.status, isJson, text }
  } catch (err) {
    console.log(`→ Erreur: ${err.message.replace(USER, '***').replace(PASS, '***')}`)
    return { status: null }
  }
}

console.log('══ EXPLORATION bo.icecat.biz/api/ ══\n')

await probe('root',            `${BO}/api/`)
await probe('status',          `${BO}/api/status`)
await probe('health',          `${BO}/api/health`)
await probe('catalog',         `${BO}/api/catalog`)
await probe('brands',          `${BO}/api/brands`)
await probe('brands/Apple',    `${BO}/api/brands/Apple`)
await probe('categories',      `${BO}/api/categories`)
await probe('products list',   `${BO}/api/products`)
await probe('products search', `${BO}/api/products/search?q=iPhone+15+Pro`)
await probe('product EAN',     `${BO}/api/products?ean=0194252791769`)
await probe('product MPN',     `${BO}/api/products?Brand=Apple&prod_id=MGKQ3LL/A`)
await probe('product by name', `${BO}/api/products?Brand=Apple&Name=iPhone+15+Pro&lang=EN`)
await probe('product by id',   `${BO}/api/products/1`)
await probe('account me',      `${BO}/api/account`)
await probe('user',            `${BO}/api/user`)
await probe('me',              `${BO}/api/me`)

// Essai login POST pour obtenir un token
await probe('POST login', `${BO}/api/auth/login`, 'POST', { username: '***', password: '***' })
await probe('POST token', `${BO}/api/auth/token`,  'POST', { username: '***', password: '***' })

console.log('\nExploration terminée.')
