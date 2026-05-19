/**
 * test-icecat-final.mjs — Dernière série de sondes pour identifier l'API active
 * Teste l'ancienne auth par query param et les URL icecat.us spécifiques
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

async function probe(label, url, headers = {}) {
  const displayUrl = url
    .replace(new RegExp(encodeURIComponent(USER), 'g'), '***')
    .replace(new RegExp(USER, 'g'), '***')
    .replace(new RegExp(encodeURIComponent(PASS), 'g'), '***')
    .replace(new RegExp(PASS, 'g'), '***')
  process.stdout.write(`  [${label}] ${displayUrl.slice(0, 90)}... `)
  try {
    const res = await fetch(url, { headers: { Authorization: AUTH, Accept: '*/*', ...headers } })
    const text = await res.text()
    const isJson = text.trim().startsWith('{') || text.trim().startsWith('[')
    const isXml  = text.trim().startsWith('<?xml') || text.trim().startsWith('<icecat')
    const ct = res.headers.get('content-type') ?? ''
    console.log(`HTTP ${res.status} | ${isJson ? 'JSON' : isXml ? 'XML' : `text (${ct.split(';')[0]})`}`)
    if (isJson || isXml) console.log(`    ${text.slice(0, 200).replace(/\n/g, ' ')}`)
    return { status: res.status, isJson, isXml, text }
  } catch (err) {
    console.log(`Erreur: ${err.message.replace(USER,'***').replace(PASS,'***')}`)
    return { status: null }
  }
}

console.log('══ TEST FINAL — API ICECAT ══\n')

// Auth query param (ancien format Icecat)
const EAN_I14 = '0194252791769'

await probe('index.cgi XML query auth',
  `https://icecat.biz/index.cgi?shopname=${USER}&password=${PASS}&lang=EN&prod_id=MGKQ3LL%2FA&vendorname=Apple&output=productxml`)

await probe('index.cgi JSON query auth',
  `https://icecat.biz/index.cgi?shopname=${USER}&password=${PASS}&lang=EN&prod_id=MGKQ3LL%2FA&vendorname=Apple&output=product_json`)

// Accès direct par EAN avec auth query
await probe('EAN query-auth biz',
  `https://icecat.biz/index.cgi?shopname=${USER}&password=${PASS}&lang=EN&ean=${EAN_I14}&output=product_json`)

// icecat.us avec différents paths
await probe('icecat.us root',    `https://icecat.us/api/`)
await probe('icecat.us v2',      `https://icecat.us/api/v2/products?Brand=Apple&Name=iPhone+15+Pro&lang=EN`)
await probe('icecat.us export',  `https://icecat.us/export/freexml.gz/EN/`)
await probe('icecat.us catalog', `https://icecat.us/api/catalog/1/Apple/iPhone15Pro/`)
await probe('icecat.us search',  `https://icecat.us/search/Apple-iPhone15Pro?lang=EN`)

// Format catalog download (Open Icecat feed)
await probe('catalog feed brands', `https://icecat.biz/export/freexml.gz/EN/brands.xml`)
await probe('catalog feed cats',   `https://icecat.biz/export/freexml.gz/EN/categories.xml`)

// Portal login
await probe('portal',  `https://portal.icecat.biz/api/products?Brand=Apple&Name=iPhone+15+Pro`)
await probe('api2',    `https://api2.icecat.biz/products?Brand=Apple&Name=iPhone+15+Pro&lang=EN`)

console.log('\nTest final terminé.')
