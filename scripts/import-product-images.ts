#!/usr/bin/env tsx
/**
 * scripts/import-product-images.ts
 *
 * Import automatique d'images pour le shop ClikClak.
 * Gère deux modes :
 *
 *   Mode produit  — images propres à un SKU
 *     Déposer dans : imports/product-images/[slug].jpg
 *     Sortie      : public/assets/images/shop/products/[slug]/01.webp
 *     Met à jour  : data/shopProducts.ts (champ images)
 *
 *   Mode groupe   — images mutualisées par modèle/famille
 *     Déposer dans : imports/product-images/groups/[type]/[groupKey].jpg
 *     Sortie      : public/assets/images/shop/groups/[type]/[groupKey]/01.webp
 *     Met à jour  : lib/products/imageGroups.generated.ts (manifest)
 *
 * Après import groupe, le manifest est régénéré automatiquement.
 * Aucune modification de data/shopProducts.ts pour les groupes.
 *
 * Nommage accepté :
 *   [slug].jpg / [slug]-01.jpg / [slug]-02.png
 *   groups/smartphones/iphone-13.jpg / groups/smartphones/iphone-13-02.jpg
 *   groups/parts/ecran-iphone-13.jpg
 *   groups/families/smartphone.jpg
 *
 * Conversion : WebP 1200×1200 qualité 85, fond blanc pour images non carrées.
 * Ne supprime jamais une image existante.
 */

import fs   from 'fs'
import path from 'path'
import sharp from 'sharp'
import { SHOP_PRODUCTS } from '../data/shopProducts'

// ── Configuration ─────────────────────────────────────────────────────────────

const ROOT          = process.cwd()
const INPUT_DIR     = path.join(ROOT, 'imports/product-images')
const INPUT_GROUPS  = path.join(INPUT_DIR, 'groups')
const PROCESSED_DIR = path.join(INPUT_DIR, 'processed')
const OUTPUT_PRODS  = path.join(ROOT, 'public/assets/images/shop/products')
const OUTPUT_GROUPS = path.join(ROOT, 'public/assets/images/shop/groups')
const DATA_FILE     = path.join(ROOT, 'data/shopProducts.ts')
const MANIFEST_FILE = path.join(ROOT, 'lib/products/imageGroups.generated.ts')

const OUTPUT_SIZE    = 1200
const OUTPUT_QUALITY = 85

const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif', '.tiff', '.gif'])

// ── Rapport ───────────────────────────────────────────────────────────────────

const report = {
  products:  { processed: [] as string[], matched: [] as string[], notFound: [] as string[], errors: [] as string[] },
  groups:    { processed: [] as string[], found: [] as string[], unknown: [] as string[], errors: [] as string[] },
  ignored:   [] as string[],
}

// ── Index slug produits ───────────────────────────────────────────────────────

function buildSlugIndex(): Map<string, string> {
  const index = new Map<string, string>()
  for (const p of SHOP_PRODUCTS) {
    index.set(p.slug, p.slug)
    index.set(p.id,   p.slug)
  }
  return index
}

function matchToSlug(filename: string, index: Map<string, string>): string | null {
  const ext     = path.extname(filename).toLowerCase()
  const base    = path.basename(filename, ext)
  if (index.has(base)) return index.get(base)!
  const stripped = base.replace(/-\d{1,2}$/, '')
  if (index.has(stripped)) return index.get(stripped)!
  return null
}

// ── Helpers dossier ───────────────────────────────────────────────────────────

function getWebpFilesOnDisk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => /^\d+\.webp$/.test(f))
    .sort()
}

function getNextIndex(dir: string): number {
  const files = getWebpFilesOnDisk(dir)
  if (files.length === 0) return 1
  return Math.max(...files.map(f => parseInt(f, 10))) + 1
}

function pad(n: number): string { return String(n).padStart(2, '0') }

// ── Déplacement vers processed/ ──────────────────────────────────────────────

/*
  Déplace le fichier source dans imports/product-images/processed/ après import.
  Évite qu'un même fichier crée 02.webp, 03.webp… à chaque relance du script.
  destSubDir : sous-dossier relatif à PROCESSED_DIR (ex: '' ou 'groups/smartphones')
*/
function moveToProcessed(srcPath: string, destSubDir: string): void {
  try {
    const destDir = destSubDir ? path.join(PROCESSED_DIR, destSubDir) : PROCESSED_DIR
    fs.mkdirSync(destDir, { recursive: true })
    const destPath = path.join(destDir, path.basename(srcPath))
    /* Si un fichier portant le même nom existe déjà dans processed/, on le renomme */
    if (fs.existsSync(destPath)) {
      const ts   = Date.now()
      const ext  = path.extname(destPath)
      const base = path.basename(destPath, ext)
      fs.renameSync(srcPath, path.join(destDir, `${base}-${ts}${ext}`))
    } else {
      fs.renameSync(srcPath, destPath)
    }
  } catch {
    /* Non-bloquant : si le déplacement échoue, on continue sans planter */
  }
}

// ── Conversion ────────────────────────────────────────────────────────────────

async function convertImage(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit:        'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: OUTPUT_QUALITY })
    .toFile(outputPath)
}

// ── Lecture images existantes dans shopProducts.ts ────────────────────────────

function findSlugLine(lines: string[], slug: string): number {
  return lines.findIndex(l => l.includes('slug:') && l.includes(`"${slug}",`))
}

function readExistingImagesFromData(slug: string): string[] {
  const lines    = fs.readFileSync(DATA_FILE, 'utf-8').split('\n')
  const slugLine = findSlugLine(lines, slug)
  if (slugLine === -1) return []
  const limit = Math.min(slugLine + 40, lines.length)
  for (let i = slugLine; i < limit; i++) {
    const m = lines[i].match(/images:\s*\[([^\]]*)\]/)
    if (!m) continue
    if (!m[1].trim()) return []
    return m[1].split(',').map(s => s.trim().replace(/^"|"$/g, '')).filter(Boolean)
  }
  return []
}

// ── Mise à jour shopProducts.ts ───────────────────────────────────────────────

function updateProductImagesInData(slug: string, images: string[]): boolean {
  const src      = fs.readFileSync(DATA_FILE, 'utf-8')
  const lines    = src.split('\n')
  const slugLine = findSlugLine(lines, slug)
  if (slugLine === -1) return false
  const limit = Math.min(slugLine + 40, lines.length)
  for (let i = slugLine; i < limit; i++) {
    if (!lines[i].match(/images:\s*\[/)) continue
    const prefix    = lines[i].match(/^(\s*images:\s*)/)?.[1] ?? '    images:           '
    const imagesStr = images.map(p => `"${p}"`).join(', ')
    lines[i] = `${prefix}[${imagesStr}],`
    fs.writeFileSync(DATA_FILE, lines.join('\n'), 'utf-8')
    return true
  }
  return false
}

// ── Manifest imageGroups.generated.ts ─────────────────────────────────────────

function regenerateManifest(): void {
  const manifest: Record<string, string[]> = {}

  if (fs.existsSync(OUTPUT_GROUPS)) {
    for (const type of fs.readdirSync(OUTPUT_GROUPS).sort()) {
      const typeDir = path.join(OUTPUT_GROUPS, type)
      if (!fs.statSync(typeDir).isDirectory()) continue
      for (const group of fs.readdirSync(typeDir).sort()) {
        const groupDir = path.join(typeDir, group)
        if (!fs.statSync(groupDir).isDirectory()) continue
        const files = getWebpFilesOnDisk(groupDir)
          .map(f => `/assets/images/shop/groups/${type}/${group}/${f}`)
        if (files.length > 0) manifest[`${type}/${group}`] = files
      }
    }
  }

  const entries = Object.entries(manifest)
  const lines = entries.map(([k, v]) => {
    const urls = v.map(u => `    "${u}"`).join(',\n')
    return `  "${k}": [\n${urls}\n  ]`
  })

  const content = [
    '// Auto-généré par scripts/import-product-images.ts — ne pas modifier manuellement',
    '// Clés : "[groupType]/[groupKey]" → tableau d\'URLs publiques WebP',
    `export const PRODUCT_IMAGE_GROUPS: Record<string, string[]> = {`,
    lines.join(',\n'),
    '}',
    '',
  ].join('\n')

  fs.writeFileSync(MANIFEST_FILE, content, 'utf-8')
  console.log(`  → Manifest régénéré : ${entries.length} groupe(s)`)
}

// ── Mode produit ──────────────────────────────────────────────────────────────

async function importProductImages(): Promise<void> {
  const allFiles = fs.existsSync(INPUT_DIR)
    ? fs.readdirSync(INPUT_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase()
        if (f.startsWith('.') || !VALID_EXT.has(ext)) {
          if (!f.startsWith('.') && f !== 'groups') report.ignored.push(f)
          return false
        }
        return true
      })
    : []

  if (allFiles.length === 0) {
    console.log('  Aucune image produit dans imports/product-images/')
    return
  }

  console.log(`  ${allFiles.length} fichier(s) produit détecté(s).`)

  const slugIndex = buildSlugIndex()

  /* Grouper par slug cible */
  const groups = new Map<string, string[]>()
  for (const file of allFiles) {
    const slug = matchToSlug(file, slugIndex)
    if (!slug) { report.products.notFound.push(file); console.log(`  ✗ Produit introuvable : ${file}`); continue }
    if (!groups.has(slug)) groups.set(slug, [])
    groups.get(slug)!.push(file)
  }

  /* Trier chaque groupe (sans suffixe en premier, puis -01, -02…) */
  for (const [, files] of groups) {
    files.sort((a, b) => {
      const na = parseInt(/\-(\d{1,2})$/.exec(path.basename(a, path.extname(a)))?.[1] ?? '0', 10)
      const nb = parseInt(/\-(\d{1,2})$/.exec(path.basename(b, path.extname(b)))?.[1] ?? '0', 10)
      return na - nb
    })
  }

  for (const [slug, files] of groups) {
    console.log(`\n  Produit : ${slug}`)
    const outputDir = path.join(OUTPUT_PRODS, slug)
    fs.mkdirSync(outputDir, { recursive: true })

    let nextIdx        = getNextIndex(outputDir)
    const newPaths: string[] = []

    for (const file of files) {
      const outputName = `${pad(nextIdx)}.webp`
      const outputPath = path.join(outputDir, outputName)
      try {
        await convertImage(path.join(INPUT_DIR, file), outputPath)
        const pub = `/assets/images/shop/products/${slug}/${outputName}`
        newPaths.push(pub)
        report.products.processed.push(file)
        console.log(`    ✓ ${file} → ${outputName}`)
        moveToProcessed(path.join(INPUT_DIR, file), '')
        nextIdx++
      } catch (err) {
        const msg = `${file}: ${String(err)}`
        report.products.errors.push(msg)
        console.error(`    ✗ ${msg}`)
      }
    }

    if (newPaths.length === 0) continue

    const existing = readExistingImagesFromData(slug)
    const merged   = [...new Set([...existing, ...newPaths])]
    const updated  = updateProductImagesInData(slug, merged)
    if (updated) {
      report.products.matched.push(slug)
      console.log(`    → data/shopProducts.ts mis à jour (${merged.length} image(s))`)
    } else {
      report.products.errors.push(`Slug "${slug}" introuvable dans shopProducts.ts`)
    }
  }
}

// ── Mode groupe ───────────────────────────────────────────────────────────────

async function importGroupImages(): Promise<boolean> {
  if (!fs.existsSync(INPUT_GROUPS)) return false

  /* Lister les types disponibles (smartphones, parts, accessories, families…) */
  const types = fs.readdirSync(INPUT_GROUPS)
    .filter(f => !f.startsWith('.') && fs.statSync(path.join(INPUT_GROUPS, f)).isDirectory())

  if (types.length === 0) return false

  let anyProcessed = false

  for (const type of types) {
    const typeInputDir = path.join(INPUT_GROUPS, type)
    const files = fs.readdirSync(typeInputDir).filter(f => {
      const ext = path.extname(f).toLowerCase()
      return !f.startsWith('.') && VALID_EXT.has(ext)
    })

    if (files.length === 0) continue

    console.log(`\n  Type groupe : ${type} (${files.length} fichier(s))`)

    /* Regrouper par clé de groupe (nom de fichier sans suffixe numérique) */
    const groups = new Map<string, string[]>()
    for (const file of files) {
      const ext  = path.extname(file).toLowerCase()
      const base = path.basename(file, ext)
      const key  = base.replace(/-\d{1,2}$/, '')  // strip "-01"…"-99" suffix, pas les années (-2022)
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(file)
    }

    /* Trier par suffixe numérique */
    for (const [, gFiles] of groups) {
      gFiles.sort((a, b) => {
        const na = parseInt(/\-(\d{1,2})$/.exec(path.basename(a, path.extname(a)))?.[1] ?? '0', 10)
        const nb = parseInt(/\-(\d{1,2})$/.exec(path.basename(b, path.extname(b)))?.[1] ?? '0', 10)
        return na - nb
      })
    }

    for (const [groupKey, gFiles] of groups) {
      const outputDir = path.join(OUTPUT_GROUPS, type, groupKey)
      fs.mkdirSync(outputDir, { recursive: true })

      let nextIdx = getNextIndex(outputDir)

      for (const file of gFiles) {
        const outputName = `${pad(nextIdx)}.webp`
        const outputPath = path.join(outputDir, outputName)
        try {
          await convertImage(path.join(typeInputDir, file), outputPath)
          report.groups.processed.push(`${type}/${groupKey}/${outputName}`)
          report.groups.found.push(`${type}/${groupKey}`)
          console.log(`    ✓ ${file} → groups/${type}/${groupKey}/${outputName}`)
          moveToProcessed(path.join(typeInputDir, file), `groups/${type}`)
          nextIdx++
          anyProcessed = true
        } catch (err) {
          const msg = `groups/${type}/${groupKey}/${file}: ${String(err)}`
          report.groups.errors.push(msg)
          console.error(`    ✗ ${msg}`)
        }
      }
    }
  }

  return anyProcessed
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n── ClikClak — Import images shop ─────────────────────────────\n')

  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true })
    fs.mkdirSync(path.join(INPUT_DIR, 'groups'), { recursive: true })
    console.log(`Dossiers créés :`)
    console.log(`  imports/product-images/          ← images produit (slug.jpg)`)
    console.log(`  imports/product-images/groups/   ← images groupe (type/key.jpg)`)
    console.log('\nDéposez vos images puis relancez npm run import:images\n')
    return
  }

  console.log('Mode produit :')
  await importProductImages()

  console.log('\nMode groupe :')
  const groupsProcessed = await importGroupImages()

  if (groupsProcessed) {
    console.log('\n  Régénération du manifest...')
    regenerateManifest()
  } else {
    console.log('  Aucune image groupe dans imports/product-images/groups/')
  }

  /* ── Rapport final ──────────────────────────────────────────────────────── */
  console.log('\n── Rapport ────────────────────────────────────────────────────\n')

  console.log(`  Images produit traitées   : ${report.products.processed.length}`)
  console.log(`  Produits mis à jour       : ${report.products.matched.length}`)
  console.log(`  Images groupe traitées    : ${report.groups.processed.length}`)
  console.log(`  Groupes couverts          : ${[...new Set(report.groups.found)].length}`)

  if (report.products.notFound.length > 0) {
    console.log(`\n  Produits NON TROUVÉS (${report.products.notFound.length}) :`)
    for (const f of report.products.notFound) console.log(`    - ${f}`)
    console.log('  → Le nom de fichier doit correspondre exactement au slug produit.')
  }

  if (report.ignored.length > 0) {
    console.log(`\n  Fichiers ignorés (${report.ignored.length}) :`)
    for (const f of report.ignored) console.log(`    - ${f}`)
  }

  const allErrors = [...report.products.errors, ...report.groups.errors]
  if (allErrors.length > 0) {
    console.log(`\n  Erreurs (${allErrors.length}) :`)
    for (const e of allErrors) console.log(`    - ${e}`)
  }

  const total = report.products.processed.length + report.groups.processed.length
  if (total > 0 && allErrors.length === 0) {
    console.log('\n  ✓ Import terminé sans erreur.')
  } else if (total === 0) {
    console.log('\n  Aucune image traitée.')
  }

  console.log('\n──────────────────────────────────────────────────────────────\n')
}

main().catch(err => {
  console.error('\n  ERREUR FATALE :', err)
  process.exit(1)
})
