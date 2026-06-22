#!/usr/bin/env tsx
/**
 * scripts/report-product-images.ts
 *
 * Rapport complet des images manquantes pour le shop ClikClak.
 *
 * Génère :
 *   reports/shop-image-report.json    — statistiques globales
 *   reports/shop-image-groups.csv     — groupes à traiter (triés par priorité)
 *   reports/shop-image-missing.txt    — liste des groupes sans image
 *
 * Usage : npm run report:images
 */

import fs   from 'fs'
import path from 'path'
import { SHOP_PRODUCTS } from '../data/shopProducts'
import { adaptShopProduct } from '../lib/products/adapter'
import {
  productHasRealImage,
  productHasInheritedImage,
  productUsesPlaceholder,
  getProductImageGroup,
  getProductImageGroupType,
  getProductFamilyKey,
} from '../lib/products/images'
import { PRODUCT_IMAGE_GROUPS } from '../lib/products/imageGroups.generated'

const ROOT        = process.cwd()
const REPORTS_DIR = path.join(ROOT, 'reports')

/* ── Helpers ─────────────────────────────────────────────────────── */

function humanLabel(groupType: string, groupKey: string): string {
  /* Reconstruit un label lisible depuis la clé kebab-case */
  const words = groupKey.split('-').map(w => {
    if (/^\d+$/.test(w)) return w  // garder les chiffres
    return w.charAt(0).toUpperCase() + w.slice(1)
  })
  return words.join(' ')
}

function suggestedSearchQuery(groupType: string, groupKey: string): string {
  const label = humanLabel(groupType, groupKey)
  if (groupType === 'smartphones') {
    return `${label} smartphone product photo front white background`
  }
  if (groupType === 'parts') {
    if (groupKey.startsWith('ecran-'))    return `${label} phone screen replacement part product photo white background`
    if (groupKey.startsWith('batterie-')) return `${label} phone battery replacement part product photo white background`
    return `${label} phone part product photo white background`
  }
  if (groupType === 'accessories') {
    return `${label} phone accessory product photo white background`
  }
  if (groupType === 'families') {
    return `${label} product photo white background`
  }
  return `${label} product photo white background`
}

/* ── Main ─────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })

  console.log('\n── ClikClak — Rapport images shop ────────────────────────────\n')
  console.log('  Analyse des produits...')

  const products = SHOP_PRODUCTS.map(adaptShopProduct)
    .filter(p => p.status !== 'draft' && p.status !== 'archived')

  let withReal        = 0
  let withInherited   = 0
  let withPlaceholder = 0

  interface GroupEntry {
    type:         string
    key:          string
    category:     string
    products:     string[]          // slugs
    withoutReal:  number
    hasGroupImg:  boolean
  }

  const groupMap = new Map<string, GroupEntry>()

  for (const p of products) {
    const hasReal   = productHasRealImage(p)
    const inherited = productHasInheritedImage(p)
    const pholder   = productUsesPlaceholder(p)

    if (hasReal)   withReal++
    else if (inherited) withInherited++
    else           withPlaceholder++

    const type  = getProductImageGroupType(p)
    const group = getProductImageGroup(p)
    if (!group) continue

    const gKey = `${type}/${group}`
    if (!groupMap.has(gKey)) {
      groupMap.set(gKey, {
        type,
        key:        group,
        category:   p.category,
        products:   [],
        withoutReal: 0,
        /* Un groupe est "couvert" si au moins un produit du groupe hérite d'une image
           via n'importe quel candidat (couleur-spécifique, modèle générique ou famille). */
        hasGroupImg: productHasInheritedImage(p),
      })
    }
    const entry = groupMap.get(gKey)!
    entry.products.push(p.slug)
    if (!hasReal) entry.withoutReal++
    if (!entry.hasGroupImg && productHasInheritedImage(p)) entry.hasGroupImg = true
  }

  /* Trier les groupes : sans image ET plus de produits sans réel en premier */
  const groupList = [...groupMap.values()].sort((a, b) => {
    if (a.hasGroupImg !== b.hasGroupImg) return a.hasGroupImg ? 1 : -1
    return b.withoutReal - a.withoutReal
  })

  const groupsTotal    = groupList.length
  const groupsCovered  = groupList.filter(g => g.hasGroupImg).length
  const groupsMissing  = groupList.filter(g => !g.hasGroupImg && g.withoutReal > 0).length

  /* ── JSON ──────────────────────────────────────────────────────── */

  const jsonReport = {
    generatedAt:         new Date().toISOString(),
    totalPublicProducts: products.length,
    withRealImage:       withReal,
    withGroupImage:      withInherited,
    withPlaceholder,
    groups: {
      total:    groupsTotal,
      covered:  groupsCovered,
      missing:  groupsMissing,
    },
    groupCoverage: `${Math.round((groupsCovered / Math.max(groupsTotal, 1)) * 100)}%`,
  }

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'shop-image-report.json'),
    JSON.stringify(jsonReport, null, 2),
    'utf-8'
  )

  /* ── CSV ───────────────────────────────────────────────────────── */

  const CSV_HEADERS = [
    'groupType',
    'groupKey',
    'label',
    'category',
    'productCount',
    'productsWithoutRealImage',
    'hasGroupImage',
    'suggestedFolder',
    'suggestedFileName',
    'suggestedSearchQuery',
  ]

  const csvRows = groupList.map(g => {
    const label   = humanLabel(g.type, g.key)
    const folder  = `public/assets/images/shop/groups/${g.type}/${g.key}/`
    const query   = suggestedSearchQuery(g.type, g.key)
    return [
      g.type,
      g.key,
      `"${label}"`,
      g.category,
      g.products.length,
      g.withoutReal,
      g.hasGroupImg ? 'oui' : 'non',
      folder,
      `${g.key}-01.jpg`,
      `"${query}"`,
    ].join(',')
  })

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'shop-image-groups.csv'),
    [CSV_HEADERS.join(','), ...csvRows].join('\n') + '\n',
    'utf-8'
  )

  /* ── Missing ───────────────────────────────────────────────────── */

  const missingLines = groupList
    .filter(g => !g.hasGroupImg && g.withoutReal > 0)
    .map(g => {
      const label = humanLabel(g.type, g.key)
      return [
        `[${g.type}/${g.key}]`,
        label.padEnd(40),
        `${g.withoutReal} produit(s) sans image`,
        `→ imports/product-images/groups/${g.type}/${g.key}.jpg`,
      ].join('  ')
    })

  fs.writeFileSync(
    path.join(REPORTS_DIR, 'shop-image-missing.txt'),
    missingLines.join('\n') + '\n',
    'utf-8'
  )

  /* ── Console ───────────────────────────────────────────────────── */

  console.log(`\n  Produits publics       : ${products.length}`)
  console.log(`  Avec image propre      : ${withReal}`)
  console.log(`  Avec image de groupe   : ${withInherited}`)
  console.log(`  Sur placeholder        : ${withPlaceholder}`)
  console.log(`\n  Groupes détectés       : ${groupsTotal}`)
  console.log(`  Groupes avec image     : ${groupsCovered}`)
  console.log(`  Groupes sans image     : ${groupsMissing}`)

  if (groupsMissing > 0) {
    console.log(`\n  Top 15 priorités (produits sans image) :`)
    groupList
      .filter(g => !g.hasGroupImg && g.withoutReal > 0)
      .slice(0, 15)
      .forEach(g => {
        const n = String(g.withoutReal).padStart(3)
        console.log(`    ${n}  imports/product-images/groups/${g.type}/${g.key}.jpg`)
      })
  }

  console.log('\n  Rapports générés dans reports/ :')
  console.log('    shop-image-report.json')
  console.log('    shop-image-groups.csv')
  console.log('    shop-image-missing.txt')
  console.log('\n──────────────────────────────────────────────────────────────\n')
}

main().catch(err => {
  console.error('\n  ERREUR FATALE :', err)
  process.exit(1)
})
