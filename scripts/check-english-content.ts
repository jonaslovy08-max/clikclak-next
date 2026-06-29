/**
 * scripts/check-english-content.ts  — v2
 *
 * Crawls all /en/ URLs from sitemap, extracts visible text,
 * and detects French fragments that should have been translated.
 *
 * Usage: npm run check:english-content  (server must run on :3000)
 */

import * as http from 'http'

const BASE_URL = 'http://localhost:3000'

/* ── French patterns — only actual visible UI French, not model/brand names ── */
const FR_PATTERNS: Array<{ re: RegExp; label: string }> = [
  { re: /\bPartager\b/,               label: 'Partager (Share button)' },
  { re: /\bÉcran\b/i,                 label: 'Écran (Screen)' },
  { re: /\bBatterie\b/i,              label: 'Batterie (Battery)' },
  { re: /À partir de/i,               label: 'À partir de (From:)' },
  { re: /Sur devis/i,                 label: 'Sur devis (Quote required)' },
  { re: /Sur demande/i,               label: 'Sur demande (On request)' },
  { re: /Connecteur de charge/i,      label: 'Connecteur de charge (Charging port)' },
  { re: /\bDiagnostic\b(?!s)/,        label: 'Diagnostic (not Diagnostics)' },
  { re: /\bClavier\b/i,               label: 'Clavier (Keyboard)' },
  { re: /Haut-parleurs/i,             label: 'Haut-parleurs (Speakers)' },
  { re: /\bSurchauffe\b/i,            label: 'Surchauffe (Overheating)' },
  { re: /Problème logiciel/i,         label: 'Problème logiciel (Software issue)' },
  { re: /Récupération de données/i,   label: 'Récupération de données' },
  { re: /Dégâts d.eau/i,              label: 'Dégâts d\'eau (Water damage)' },
  { re: /Ventilateur/i,               label: 'Ventilateur (Fan)' },
  { re: /\bNettoyage\b/i,             label: 'Nettoyage (Cleaning)' },
  { re: /Sélectionnez\b/i,            label: 'Sélectionnez (Select)' },
  { re: /et supérieur\b/i,            label: 'et supérieur (and later)' },
  { re: /politique de confidentialité/i, label: 'politique de confidentialité' },
  { re: /\bVoir les tarifs\b/i,       label: 'Voir les tarifs (View pricing)' },
  { re: /Aucun modèle trouvé/i,       label: 'Aucun modèle trouvé (No model found)' },
  { re: /Remplacement d.écran/i,      label: 'Remplacement d\'écran (Screen replacement)' },
  { re: /Caméra principale/i,         label: 'Caméra principale (Main camera)' },
  { re: /Caméra frontale/i,           label: 'Caméra frontale (Front camera)' },
  { re: /Lentille caméra/i,           label: 'Lentille caméra (Camera lens)' },
  { re: /Face arrière/i,              label: 'Face arrière (Back glass)' },
  { re: /Dos en verre/i,              label: 'Dos en verre (Back glass)' },
  { re: /\bVitre\b/i,                 label: 'Vitre (Glass)' },
  { re: /Lien copié/i,                label: 'Lien copié (Link copied)' },
  { re: /Copier le lien/i,            label: 'Copier le lien (Copy link)' },
  { re: /Options de partage/i,        label: 'Options de partage (Share options)' },
  { re: /\bAppeler\b/i,               label: 'Appeler (Call)' },
]

/* Text chunks that are allowed to be in French even on EN pages */
const ALLOWED_FR_CHUNKS = [
  'FR',  // LanguageSwitcher button
  'FR  |  EN',
  'clikclak-next',
]

/* ── HTTP helper ──────────────────────────────────────────────────────── */
function fetchUrl(url: string): Promise<{ status: number; body: string }> {
  return new Promise(resolve => {
    const req = http.get(url, { headers: { Accept: 'text/html', 'Accept-Language': 'en' } }, res => {
      const status = res.statusCode ?? 0
      if ([301, 302, 307, 308].includes(status) && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${BASE_URL}${res.headers.location}`
        res.resume()
        fetchUrl(loc).then(resolve)
        return
      }
      let body = ''
      res.on('data', (c: Buffer) => { body += c.toString() })
      res.on('end', () => resolve({ status, body }))
    })
    req.on('error', () => resolve({ status: 0, body: '' }))
    req.setTimeout(20000, () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT' }) })
  })
}

/* ── Extract visible text chunks from HTML ────────────────────────────── */
function extractTextChunks(html: string): string[] {
  let text = html
  // Remove entire <head> block
  text = text.replace(/<head\b[\s\S]*?<\/head>/gi, '')
  // Remove all script/style/noscript blocks
  text = text.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  text = text.replace(/<style\b[\s\S]*?<\/style>/gi, '')
  text = text.replace(/<noscript\b[\s\S]*?<\/noscript>/gi, '')
  // Remove SVG blocks (icon labels etc.)
  text = text.replace(/<svg\b[\s\S]*?<\/svg>/gi, '')
  // Remove HTML attributes (remove everything inside tags except text content)
  text = text.replace(/<[^>]+>/g, ' ')
  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")

  // Split into non-trivial chunks
  return text
    .split(/[\n\r\t]+/)
    .map(s => s.trim())
    .filter(s => s.length >= 3)
    .filter(s => !/^[\d\s.,+\-:()[\]{}\/]+$/.test(s))      // skip numbers only
    .filter(s => !/^[A-Z]{2,}(\s*\|?\s*[A-Z]{2,})*$/.test(s))  // skip "FR | EN" etc.
    .filter(s => !s.startsWith('/'))                          // skip URL paths
    .filter(s => !s.startsWith('http'))                       // skip URLs
    .filter(s => ALLOWED_FR_CHUNKS.every(a => !s.includes(a)))
}

/* ── Check a page for French fragments ───────────────────────────────── */
interface Finding {
  url:   string
  label: string
  chunk: string
}

function checkPage(url: string, html: string): Finding[] {
  const findings: Finding[] = []
  const chunks = extractTextChunks(html)

  for (const chunk of chunks) {
    for (const { re, label } of FR_PATTERNS) {
      if (re.test(chunk)) {
        // Skip if it's a French word inside a known English phrase
        // e.g. "Diagnostics" matches /Diagnostic/ but we excluded with (?!s)
        findings.push({ url, label, chunk: chunk.substring(0, 120) })
        break
      }
    }
  }

  return findings
}

/* ── Main ─────────────────────────────────────────────────────────────── */
async function main() {
  console.log('check:english-content — fetching sitemap…')

  const { body: sitemapBody } = await fetchUrl(`${BASE_URL}/sitemap.xml`)
  if (!sitemapBody || sitemapBody === 'TIMEOUT') {
    console.error('❌ Cannot fetch sitemap. Is the server running on port 3000?')
    process.exit(1)
  }

  // Extract all /en/ URLs from sitemap
  const locRe = /<loc>([^<]+)<\/loc>/g
  const allUrls: string[] = []
  let lm: RegExpExecArray | null
  while ((lm = locRe.exec(sitemapBody)) !== null) {
    const loc = lm[1].trim()
    try {
      const u = new URL(loc)
      if (u.pathname.startsWith('/en') || u.pathname.startsWith('/en/')) {
        allUrls.push(u.pathname)
      }
    } catch { /* skip */ }
  }

  console.log(`English URLs in sitemap: ${allUrls.length}`)

  if (allUrls.length === 0) {
    console.error('❌ No /en URLs found in sitemap.')
    process.exit(1)
  }

  const allFindings: Finding[] = []
  let crawled = 0
  const BATCH = 8

  for (let i = 0; i < allUrls.length; i += BATCH) {
    const batch = allUrls.slice(i, i + BATCH)
    const results = await Promise.all(batch.map(async p => {
      const { status, body } = await fetchUrl(`${BASE_URL}${p}`)
      crawled++
      if (status !== 200 || !body || body === 'TIMEOUT') return []
      return checkPage(p, body)
    }))
    for (const r of results) allFindings.push(...r)
  }

  console.log(`URLs crawled: ${crawled}`)
  console.log(`French fragments found: ${allFindings.length}`)
  console.log()

  if (allFindings.length === 0) {
    console.log('✅ No French content detected on EN pages.\n')
    process.exit(0)
  }

  // Group by URL
  const byUrl = new Map<string, Finding[]>()
  for (const f of allFindings) {
    if (!byUrl.has(f.url)) byUrl.set(f.url, [])
    byUrl.get(f.url)!.push(f)
  }

  let totalIssues = 0
  for (const [url, findings] of byUrl) {
    // Deduplicate by label
    const seen = new Set<string>()
    const uniq = findings.filter(f => { if (seen.has(f.label)) return false; seen.add(f.label); return true })
    totalIssues += uniq.length
    console.log(`[FAIL] ${url}`)
    for (const f of uniq) {
      console.log(`  Pattern: ${f.label}`)
      console.log(`  Context: "${f.chunk}"`)
    }
    console.log()
  }

  console.log(`❌ Total: ${totalIssues} French fragments across ${byUrl.size} pages.\n`)
  process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
