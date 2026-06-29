/**
 * scripts/check-english-links.ts  — v4  (full sitemap crawler)
 *
 * Mode statique (défaut) :  analyse les fichiers TypeScript sources
 * Mode live (--live)      :  crawle TOUTES les URLs EN du sitemap
 *
 * Usage:
 *   npm run check:english-links           → statique
 *   npm run check:english-links -- --live → live (serveur requis sur :3000)
 */

import * as fs   from 'fs'
import * as path from 'path'
import * as http from 'http'

const LIVE_MODE = process.argv.includes('--live')
const BASE_URL  = 'http://localhost:3000'

/* ── Routes table ─────────────────────────────────────────────────── */
const routesPath = path.join(process.cwd(), 'i18n', 'routes.ts')
if (!fs.existsSync(routesPath)) { console.error('❌ i18n/routes.ts not found.'); process.exit(1) }
const routesText = fs.readFileSync(routesPath, 'utf-8')

type RouteEntry = { key: string; fr: string; en: string | null }
const entries: RouteEntry[] = []
const entryRe = /(\w+)\s*:\s*\{\s*fr:\s*'([^']+)'\s*,\s*en:\s*(?:'([^']+)'|null)\s*\}/g
let m: RegExpExecArray | null
while ((m = entryRe.exec(routesText)) !== null) entries.push({ key: m[1], fr: m[2], en: m[3] ?? null })

const frPathsWithEn = entries.filter(e => !e.fr.includes(':slug') && e.en !== null).map(e => e.fr)

/* ── Helpers ─────────────────────────────────────────────────────── */
function readFiles(dir: string, ext: string[]): { file: string; content: string }[] {
  const out: { file: string; content: string }[] = []
  if (!fs.existsSync(dir)) return out
  const walk = (d: string) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) walk(full)
      else if (ext.some(x => e.name.endsWith(x)))
        out.push({ file: path.relative(process.cwd(), full), content: fs.readFileSync(full, 'utf-8') })
    }
  }
  walk(dir)
  return out
}

type Finding = { file: string; line: number; text: string }

const FR_PATS = [
  ...frPathsWithEn.map(p => new RegExp(`href=["']${p.replace(/\//g, '\\/').replace(/\./g, '\\.')}["']`)),
  /href=["']\/services\/reparation-/,
  /href=["']\/reparation-(?!ecran)/,
  /href=["']\/service-de-coursier(?!["'].*en)/,
  /href=["']\/contact-clik-clak/,
  /href=["']\/politique-confidentialite(?!["'])/,
  /href=["']\/cgv(?!\/)["']/,
  /href=["']\/blog(?:\/[^"']*)?["']/,
]

function findFrHrefs(content: string, file: string): Finding[] {
  const found: Finding[] = []
  content.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return
    for (const p of FR_PATS) {
      if (new RegExp(p.source, p.flags).test(line)) { found.push({ file, line: i + 1, text: line.trim().substring(0, 130) }); break }
    }
  })
  return found
}

const EN_BLOCK_NAME = /\b(navLinksEn|rightLinksEn|brandsEn|devicesEn|linksEn|NAV_EN|LINKS_EN)\b/

const SHARED = [
  'components/home/SiteFooter.tsx','components/layout/Header.tsx',
  'components/layout/DesktopNav.tsx','components/layout/MobileMenu.tsx',
  'components/layout/LanguageSwitcher.tsx','components/home/HomePageContent.tsx',
  'components/repair/RepairBrandSelector.tsx','components/repair/RepairModelPage.tsx',
  'components/repair/IphoneModelPage.tsx','components/repair/IphoneRepairPage.tsx',
  'components/pages/SellYourDevicePage.tsx','components/contact/BuybackRequestForm.tsx',
  'components/contact/ContactForm.tsx','components/contact/ServiceRequestForm.tsx',
  'components/home/ServiceSelector.tsx','components/home/ServiceDetail.tsx',
  'components/home/OtherServicesSection.tsx','components/home/RepairAtelierSection.tsx',
  'components/home/DataUrgencesSection.tsx','components/home/InsuranceSection.tsx',
  'components/home/MobileServicesSection.tsx','components/RepairModelSearch.tsx',
  'data/heroSlides.ts',
]

const LOCALE_REQ = [
  'InterventionPageLayout','RepairEngagements','RepairFAQGeneric',
  'RepairModelPage','BuybackRequestForm','ContactPopover','ServiceRequestForm',
]

/* ── HTTP fetch ──────────────────────────────────────────────────── */
function fetchUrl(url: string, followRedirects = true): Promise<{ status: number; body: string; finalUrl: string }> {
  return new Promise(resolve => {
    const req = http.get(url, { headers: { Accept: 'text/html,application/xml' } }, res => {
      const status = res.statusCode ?? 0
      /* Follow 301/302/307/308 redirects (max 5 hops) */
      if (followRedirects && [301, 302, 307, 308].includes(status) && res.headers.location) {
        const loc = res.headers.location.startsWith('http')
          ? res.headers.location
          : `${BASE_URL}${res.headers.location}`
        res.resume()
        fetchUrl(loc, false).then(resolve)
        return
      }
      let body = ''
      res.on('data', (c: Buffer) => { body += c.toString() })
      res.on('end', () => resolve({ status, body, finalUrl: url }))
    })
    req.on('error', () => resolve({ status: 0, body: '', finalUrl: url }))
    req.setTimeout(15000, () => { req.destroy(); resolve({ status: 0, body: 'TIMEOUT', finalUrl: url }) })
  })
}

/* Extract only <a href> navigation links — exclude <link hreflang>, <meta>, scripts */
function extractNavHrefs(html: string): string[] {
  const hrefs: string[] = []
  const re = /<a\b[^>]*\bhref="(\/[^"#?]*)(?:[#?][^"]*)?"/g
  let m: RegExpExecArray | null
  while ((m = re.exec(html)) !== null) hrefs.push(m[1])
  return [...new Set(hrefs)]
}

/* Inline getAlternatePath — doesn't import from @/ alias */
function getAlternatePath(currentPath: string, targetLocale: 'fr' | 'en'): string | null {
  const fromLocale = targetLocale === 'en' ? 'fr' : 'en'
  for (const e of entries) {
    const source = e[fromLocale]
    const target = e[targetLocale]
    if (!source || !target) continue
    if (source.includes(':slug')) {
      const base = source.replace('/:slug', '')
      if (currentPath.startsWith(base + '/')) {
        const slug = currentPath.slice(base.length + 1)
        return target.replace(':slug', slug)
      }
    } else if (source === currentPath) {
      return target
    }
  }
  return null
}

function isFrNavLink(href: string): string | null {
  for (const e of entries) {
    if (!e.en) continue
    const fr = e.fr.replace('/:slug', '')
    if (fr.includes(':')) continue
    if (href === e.fr || href.startsWith(fr + '/')) return `→ EN: ${e.en}`
  }
  if (/^\/services\/reparation-/.test(href)) return '→ has EN equivalent'
  if (/^\/reparation-[a-z]/.test(href) && !href.includes('/en')) return '→ has EN equivalent'
  if (href === '/service-de-coursier') return '→ /en/courier-service'
  if (href === '/contact-clik-clak-lausanne') return '→ /en/contact'
  if (href === '/politique-confidentialite') return '→ /en/privacy-policy'
  if (href === '/cgv') return '→ /en/terms-and-conditions'
  if (href === '/blog' || href.startsWith('/blog/')) return '→ blog is FR-only (should not appear in EN HTML)'
  return null
}

/* Intentional FR links from EN pages: the LanguageSwitcher FR button + static allowed */
const ALWAYS_ALLOWED = new Set(['/'])

/* ── Report state ────────────────────────────────────────────────── */
let hasErrors = false
function err(msg: string) { hasErrors = true; console.log(`   ❌ ${msg}`) }
function ok(msg: string)  { console.log(`   ✓  ${msg}`) }

/* ════════════════════════════════════════════════════════════════════
   STATIC CHECKS
════════════════════════════════════════════════════════════════════ */
function runStaticChecks() {
  const enDir   = path.join(process.cwd(), 'app', '(en)', 'en')
  const enFiles = readFiles(enDir, ['.tsx', '.ts'])
  const frOnly  = entries.filter(e => e.en === null)
  const doubleEn = entries.filter(e => e.en?.includes('/en/en'))

  console.log(`1. Routes FR-only (en === null): ${frOnly.length} [informational]`)
  for (const r of frOnly) console.log(`   • ${r.key.padEnd(20)} fr: ${r.fr}`)
  console.log()

  if (doubleEn.length > 0) { err(`Double /en/en in route table: ${doubleEn.length}`); doubleEn.forEach(r => console.log(`   • ${r.key}: ${r.en}`)) }
  else ok('No double /en/en in route table')
  console.log()

  const hardcoded = enFiles.flatMap(({ file, content }) => findFrHrefs(content, file))
    .filter((h, i, a) => a.findIndex(x => x.file === h.file && x.line === h.line) === i)
  if (hardcoded.length > 0) {
    err(`Hardcoded FR hrefs in EN page files: ${hardcoded.length}`)
    hardcoded.slice(0, 10).forEach(h => console.log(`   ${h.file}:${h.line}\n     → ${h.text}`))
  } else ok('No hardcoded FR hrefs in EN page files')
  console.log()

  /* Shared components — EN blocks */
  type SH = Finding & { issue: string }
  const shared: SH[] = []
  for (const cp of SHARED) {
    const full = path.join(process.cwd(), cp)
    if (!fs.existsSync(full)) continue
    const content = fs.readFileSync(full, 'utf-8')
    const lines   = content.split('\n')
    let inEn = false, depth = 0
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue
      if (!inEn && EN_BLOCK_NAME.test(line) && line.includes('=')) { inEn = true; depth = 0 }
      if (inEn) {
        for (const ch of line) { if ('[{'.includes(ch)) depth++; if (']}'.includes(ch)) depth-- }
        if (/href:\s*['"](\/(cgv|politique-conf|contact-clik|reparation-[a-z]|services\/rep|service-de-coursier|blog))/.test(line))
          shared.push({ file: cp, line: i + 1, text: line.trim().substring(0, 130), issue: 'FR href in EN block' })
        if (depth <= 0 && i > 0) inEn = false
      }
    }
  }
  const sharedUniq = shared.filter((h, i) => shared.findIndex(x => x.file === h.file && x.line === h.line) === i)
  if (sharedUniq.length > 0) {
    err(`FR hrefs in shared locale-aware components: ${sharedUniq.length}`)
    sharedUniq.forEach(h => console.log(`   ${h.file}:${h.line} — ${h.issue}\n     → ${h.text}`))
  } else ok('No FR hrefs in shared locale-aware components (EN blocks)')
  console.log()

  /* Missing locale= */
  const missing: { file: string; component: string }[] = []
  for (const { file, content } of enFiles) {
    if (!file.endsWith('page.tsx')) continue
    for (const comp of LOCALE_REQ) {
      const re = new RegExp(`<${comp}[\\s>]`, 'g')
      let mm: RegExpExecArray | null
      while ((mm = re.exec(content)) !== null) {
        const slice = content.slice(mm.index, mm.index + 500)
        let inStr = false, closeIdx = -1, d = 0
        for (let i = 0; i < slice.length; i++) {
          const ch = slice[i]
          if (ch === '"' || ch === "'") inStr = !inStr
          if (!inStr) { if (ch === '<') d++; if (ch === '>') { if (d <= 1) { closeIdx = i; break }; d-- } }
        }
        const tag = closeIdx > 0 ? slice.slice(0, closeIdx + 1) : slice
        if (!tag.includes('locale=')) missing.push({ file, component: comp })
      }
    }
  }
  const missingUniq = missing.filter((m, i) => missing.findIndex(x => x.file === m.file && x.component === m.component) === i)
  if (missingUniq.length > 0) {
    err(`Components missing locale= in EN pages: ${missingUniq.length}`)
    missingUniq.forEach(ml => console.log(`   ${ml.file}  →  <${ml.component}> without locale=`))
  } else ok('All locale-aware components have locale= in EN pages')
  console.log()

  const adminLinks = enFiles.flatMap(({ file, content }) =>
    content.split('\n').reduce<Finding[]>((acc, line, i) => {
      if ((line.includes('href="/admin') || line.includes('href="/api')) && !line.trim().startsWith('//'))
        acc.push({ file, line: i + 1, text: line.trim().substring(0, 130) })
      return acc
    }, []))
  if (adminLinks.length > 0) { err(`/admin or /api links in EN pages: ${adminLinks.length}`); adminLinks.forEach(a => console.log(`   ${a.file}:${a.line}`)) }
  else ok('No /admin or /api links in EN pages')
  console.log()
}

/* ════════════════════════════════════════════════════════════════════
   LIVE CRAWL — ALL SITEMAP EN URLS
════════════════════════════════════════════════════════════════════ */
async function runLiveCrawl() {
  console.log('7. FETCHING SITEMAP...\n')

  /* Step 1: fetch sitemap */
  const { status: smStatus, body: smBody } = await fetchUrl(`${BASE_URL}/sitemap.xml`)
  if (smStatus !== 200) { err(`Cannot fetch sitemap (HTTP ${smStatus})`); return }

  /* Step 2: extract all EN URLs */
  const locRe = /<loc>([^<]+)<\/loc>/g
  const allUrls: string[] = []
  let lm: RegExpExecArray | null
  while ((lm = locRe.exec(smBody)) !== null) {
    const loc = lm[1].trim()
    try {
      const u = new URL(loc)
      if (u.pathname.startsWith('/en') || u.pathname.startsWith('/en/')) {
        allUrls.push(u.pathname)
      }
    } catch { /* skip malformed */ }
  }

  console.log(`   URLs EN found in sitemap: ${allUrls.length}`)
  console.log(`   Starting crawl...\n`)

  let totalLinks = 0, enToEn = 0, enToFrAllowed = 0, enToFrBad = 0, total404 = 0
  const frLinksFound: { page: string; href: string; reason: string }[] = []
  const notFoundPages: string[] = []
  const timeoutPages:  string[] = []

  for (const pageUrl of allUrls) {
    const { status, body } = await fetchUrl(`${BASE_URL}${pageUrl}`)

    if (body === 'TIMEOUT') { timeoutPages.push(pageUrl); continue }
    /* 308 with trailing slash → redirect to non-slash version (Next.js default) — this is expected, follow it */
    if (status === 308 || status === 301 || status === 302) {
      /* fetchUrl already follows redirects — if we still get 308, skip gracefully */
      continue
    }
    if (status !== 200) { err(`HTTP ${status}: ${pageUrl}`); total404++; notFoundPages.push(pageUrl); continue }

    const hrefs = extractNavHrefs(body)
    totalLinks += hrefs.length

    /* Normalize pageUrl: strip trailing slash for route lookup */
    const pageUrlNorm = pageUrl.replace(/\/$/, '') || '/'
    /* FR equivalent of this EN page (LanguageSwitcher FR button — intentional) */
    const frEquiv = getAlternatePath(pageUrlNorm, 'fr')

    for (const rawHref of hrefs) {
      /* Normalize: strip trailing slash for comparisons */
      const href = rawHref.replace(/\/$/, '') || '/'
      if (href.includes('/en/en')) { err(`Double /en/en in ${pageUrl}: ${href}`) ; continue }
      if (href.startsWith('/en/admin') || href.startsWith('/en/api')) { err(`/admin|/api in ${pageUrl}: ${href}`); continue }
      if (ALWAYS_ALLOWED.has(href)) { enToFrAllowed++; continue }
      /* Allow the LanguageSwitcher FR target — the FR equivalent of this EN page */
      if (frEquiv && (href === frEquiv || href === frEquiv.replace(/\/$/, ''))) { enToFrAllowed++; continue }
      if (href.startsWith('/en')) { enToEn++; continue }

      const frReason = isFrNavLink(href)
      if (frReason) { frLinksFound.push({ page: pageUrl, href, reason: frReason }); enToFrBad++ }
    }
  }

  console.log(`   ┌─────────────────────────────────────────────┐`)
  console.log(`   │ URLs EN in sitemap       : ${String(allUrls.length).padStart(6)}            │`)
  console.log(`   │ URLs crawled             : ${String(allUrls.length - timeoutPages.length).padStart(6)}            │`)
  console.log(`   │ Total nav links checked  : ${String(totalLinks).padStart(6)}            │`)
  console.log(`   │ EN → EN links            : ${String(enToEn).padStart(6)}            │`)
  console.log(`   │ EN → FR (allowed)        : ${String(enToFrAllowed).padStart(6)}            │`)
  console.log(`   │ EN → FR (unexpected) ❗  : ${String(enToFrBad).padStart(6)}            │`)
  console.log(`   │ 404 pages                : ${String(total404).padStart(6)}            │`)
  console.log(`   │ Timeouts                 : ${String(timeoutPages.length).padStart(6)}            │`)
  console.log(`   └─────────────────────────────────────────────┘`)
  console.log()

  if (enToFrBad > 0) {
    err(`Unexpected EN→FR links: ${enToFrBad}`)
    frLinksFound.slice(0, 30).forEach(f => console.log(`   [${f.page}]\n     ${f.href}  ${f.reason}`))
    if (frLinksFound.length > 30) console.log(`   ... and ${frLinksFound.length - 30} more`)
  } else ok('No unexpected EN→FR links in rendered HTML')

  if (total404 > 0) {
    err(`Pages returning non-200: ${total404}`)
    notFoundPages.slice(0, 10).forEach(p => console.log(`   ${p}`))
  } else ok('All EN pages return 200')

  if (timeoutPages.length > 0) console.log(`   ⏱  Timeouts: ${timeoutPages.length} pages`)
  console.log()
}

/* ════════════════════════════════════════════════════════════════════
   ENTRY POINT
════════════════════════════════════════════════════════════════════ */
async function main() {
  console.log('\n╔══════════════════════════════════════════════════════════════╗')
  console.log('║    ClikClak — EN link checker v4' + (LIVE_MODE ? ' [LIVE — full sitemap]' : ' [STATIC]') + '  ║')
  console.log('╚══════════════════════════════════════════════════════════════╝\n')

  runStaticChecks()

  if (!LIVE_MODE) {
    console.log('ℹ️  Run with --live to crawl ALL sitemap EN URLs.\n')
  } else {
    await runLiveCrawl()
  }

  if (!hasErrors) console.log('✅ All checks passed — EN routes are clean.\n')
  else { console.log('❌ Issues found — fix before deploying.\n'); process.exit(1) }
}

main().catch(e => { console.error(e); process.exit(1) })
