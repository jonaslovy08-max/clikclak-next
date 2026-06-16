#!/usr/bin/env tsx
/**
 * scripts/import-product-images.ts
 *
 * Import automatique d'images produits pour le shop ClikClak.
 *
 * Usage :
 *   npm run import:images
 *
 * Déposer les images dans : imports/product-images/
 * Nommage accepté :
 *   [slug-produit].jpg
 *   [slug-produit]-01.jpg
 *   [slug-produit]-02.png
 *
 * Le script :
 *   1. Lit les fichiers depuis imports/product-images/
 *   2. Identifie le produit via le slug ou l'id
 *   3. Convertit en WebP 1200×1200 qualité 85
 *   4. Crée public/assets/images/shop/products/[slug]/01.webp etc.
 *   5. Met à jour le champ images dans data/shopProducts.ts
 *   6. Ne supprime jamais une image existante
 *   7. Affiche un rapport complet
 */

import fs   from 'fs'
import path from 'path'
import sharp from 'sharp'
import { SHOP_PRODUCTS } from '../data/shopProducts'

// ── Configuration ─────────────────────────────────────────────────────────────

const ROOT        = process.cwd()
const INPUT_DIR   = path.join(ROOT, 'imports/product-images')
const OUTPUT_BASE = path.join(ROOT, 'public/assets/images/shop/products')
const DATA_FILE   = path.join(ROOT, 'data/shopProducts.ts')

const OUTPUT_SIZE    = 1200
const OUTPUT_QUALITY = 85

const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif', '.tiff', '.gif'])

// ── Rapport ───────────────────────────────────────────────────────────────────

const report = {
  processed:  [] as string[],
  matched:    [] as string[],
  notFound:   [] as string[],
  ignored:    [] as string[],
  errors:     [] as string[],
}

// ── Index slug ────────────────────────────────────────────────────────────────

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
  // Tente sans suffixe numérique : "iphone-se-64go-bleu-02" → "iphone-se-64go-bleu"
  const stripped = base.replace(/-\d+$/, '')
  if (index.has(stripped)) return index.get(stripped)!
  return null
}

// ── Dossier de sortie ─────────────────────────────────────────────────────────

function getWebpFilesOnDisk(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir)
    .filter(f => /^\d+\.webp$/.test(f))
    .sort()
}

function getNextIndex(dir: string): number {
  const files = getWebpFilesOnDisk(dir)
  if (files.length === 0) return 1
  const nums = files.map(f => parseInt(f, 10))
  return Math.max(...nums) + 1
}

function webpPublicPath(slug: string, n: number): string {
  return `/assets/images/shop/products/${slug}/${String(n).padStart(2, '0')}.webp`
}

// ── Lecture images existantes dans le fichier data ────────────────────────────

function readExistingImagesFromData(slug: string): string[] {
  const lines    = fs.readFileSync(DATA_FILE, 'utf-8').split('\n')
  const slugLine = findSlugLine(lines, slug)
  if (slugLine === -1) return []

  const limit = Math.min(slugLine + 40, lines.length)
  for (let i = slugLine; i < limit; i++) {
    const m = lines[i].match(/images:\s*\[([^\]]*)\]/)
    if (!m) continue
    if (!m[1].trim()) return []
    return m[1]
      .split(',')
      .map(s => s.trim().replace(/^"|"$/g, ''))
      .filter(Boolean)
  }
  return []
}

// ── Mise à jour du champ images dans shopProducts.ts ─────────────────────────

function findSlugLine(lines: string[], slug: string): number {
  return lines.findIndex(
    l => l.includes('slug:') && l.includes(`"${slug}",`)
  )
}

function updateImagesInDataFile(slug: string, images: string[]): boolean {
  const src      = fs.readFileSync(DATA_FILE, 'utf-8')
  const lines    = src.split('\n')
  const slugLine = findSlugLine(lines, slug)
  if (slugLine === -1) return false

  const limit = Math.min(slugLine + 40, lines.length)
  for (let i = slugLine; i < limit; i++) {
    const line = lines[i]
    if (!line.match(/images:\s*\[/)) continue

    const prefix    = line.match(/^(\s*images:\s*)/)?.[1] ?? '    images:           '
    const imagesStr = images.map(p => `"${p}"`).join(', ')
    lines[i] = `${prefix}[${imagesStr}],`

    fs.writeFileSync(DATA_FILE, lines.join('\n'), 'utf-8')
    return true
  }
  return false
}

// ── Conversion sharp ──────────────────────────────────────────────────────────

async function convertImage(inputPath: string, outputPath: string): Promise<void> {
  await sharp(inputPath)
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit:        'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .webp({ quality: OUTPUT_QUALITY })
    .toFile(outputPath)
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log('\n── ClikClak — Import images produits ─────────────────────────\n')

  if (!fs.existsSync(INPUT_DIR)) {
    fs.mkdirSync(INPUT_DIR, { recursive: true })
    console.log(`Dossier créé : ${INPUT_DIR}`)
    console.log('Déposez vos images dans imports/product-images/ puis relancez.\n')
    return
  }

  const allFiles = fs.readdirSync(INPUT_DIR).filter(f => {
    const ext = path.extname(f).toLowerCase()
    if (!VALID_EXT.has(ext)) {
      if (!f.startsWith('.')) report.ignored.push(f)
      return false
    }
    if (f.startsWith('.')) return false
    return true
  })

  if (allFiles.length === 0) {
    console.log('Aucune image trouvée dans imports/product-images/\n')
    return
  }

  console.log(`${allFiles.length} fichier(s) détecté(s).\n`)

  const slugIndex = buildSlugIndex()

  // Grouper les fichiers par slug cible
  const groups = new Map<string, string[]>()
  for (const file of allFiles) {
    const slug = matchToSlug(file, slugIndex)
    if (!slug) {
      report.notFound.push(file)
      console.log(`  ✗ Produit introuvable : ${file}`)
      continue
    }
    if (!groups.has(slug)) groups.set(slug, [])
    groups.get(slug)!.push(file)
  }

  // Trier les fichiers de chaque groupe (sans suffixe en premier, puis -01, -02 …)
  for (const [, files] of groups) {
    files.sort((a, b) => {
      const numA = parseInt(/\-(\d+)$/.exec(path.basename(a, path.extname(a)))?.[1] ?? '0', 10)
      const numB = parseInt(/\-(\d+)$/.exec(path.basename(b, path.extname(b)))?.[1] ?? '0', 10)
      return numA - numB
    })
  }

  // Traiter chaque groupe
  for (const [slug, files] of groups) {
    console.log(`\n  Produit : ${slug}`)

    const outputDir = path.join(OUTPUT_BASE, slug)
    fs.mkdirSync(outputDir, { recursive: true })

    let nextIdx        = getNextIndex(outputDir)
    const newPaths: string[] = []

    for (const file of files) {
      const inputPath  = path.join(INPUT_DIR, file)
      const outputName = `${String(nextIdx).padStart(2, '0')}.webp`
      const outputPath = path.join(outputDir, outputName)

      try {
        await convertImage(inputPath, outputPath)
        const publicPath = webpPublicPath(slug, nextIdx)
        newPaths.push(publicPath)
        report.processed.push(file)
        console.log(`    ✓ ${file} → ${outputName}`)
        nextIdx++
      } catch (err) {
        const msg = `${file}: ${String(err)}`
        report.errors.push(msg)
        console.error(`    ✗ Erreur : ${msg}`)
      }
    }

    if (newPaths.length === 0) continue

    // Fusionner les images existantes (data) + nouvelles (en préservant tout)
    const existingImages = readExistingImagesFromData(slug)
    const merged         = [...new Set([...existingImages, ...newPaths])]

    const updated = updateImagesInDataFile(slug, merged)
    if (updated) {
      report.matched.push(slug)
      console.log(`    → data/shopProducts.ts mis à jour (${merged.length} image(s))`)
    } else {
      report.errors.push(`Impossible de mettre à jour "${slug}" dans shopProducts.ts`)
      console.error(`    ✗ Mise à jour data impossible pour "${slug}"`)
    }
  }

  // ── Rapport final ─────────────────────────────────────────────────────────────

  console.log('\n── Rapport ────────────────────────────────────────────────────\n')
  console.log(`  Images traitées    : ${report.processed.length}`)
  console.log(`  Produits mis à jour: ${report.matched.length}`)

  if (report.notFound.length > 0) {
    console.log(`\n  Produits NON TROUVÉS (${report.notFound.length}) :`)
    for (const f of report.notFound) console.log(`    - ${f}`)
    console.log('  → Vérifiez que le nom de fichier correspond exactement au slug du produit.')
  }

  if (report.ignored.length > 0) {
    console.log(`\n  Fichiers ignorés (${report.ignored.length}) :`)
    for (const f of report.ignored) console.log(`    - ${f}`)
  }

  if (report.errors.length > 0) {
    console.log(`\n  Erreurs (${report.errors.length}) :`)
    for (const e of report.errors) console.log(`    - ${e}`)
  }

  if (report.processed.length > 0 && report.errors.length === 0) {
    console.log('\n  ✓ Import terminé sans erreur.')
  }

  console.log('\n──────────────────────────────────────────────────────────────\n')
}

main().catch(err => {
  console.error('\n  ERREUR FATALE :', err)
  process.exit(1)
})
