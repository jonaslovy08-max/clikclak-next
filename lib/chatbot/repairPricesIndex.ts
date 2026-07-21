/*
  repairPricesIndex.ts — index complet des tarifs de réparation.

  Source unique : catalogue public Supabase.
  Couvre iPhone, Samsung, iPad, MacBook, Huawei et OPPO.
  Module réservé au serveur.
*/

import 'server-only'

import {
  formatPublicRepairPrice,
  type PublicRepairBrand,
  type PublicRepairOffer,
} from '@/lib/repair/publicCatalog'
import {
  getRepairCatalog,
  type ChatbotRepairBrandSlug,
} from './repairCatalogCache'
import { normalizeText } from './normalizeSearch'

export type RepairBrand = ChatbotRepairBrandSlug

export const REPAIR_BRAND_LABELS: Record<RepairBrand, string> = {
  iphone:  'iPhone',
  samsung: 'Samsung',
  ipad:    'iPad',
  macbook: 'MacBook',
  huawei:  'Huawei',
  oppo:    'OPPO',
}

export const REPAIR_BRAND_HREFS: Record<RepairBrand, string> = {
  iphone:  '/services/reparation-iphone',
  samsung: '/services/reparation-samsung-lausanne',
  ipad:    '/services/reparation-ipad',
  macbook: '/services/reparation-macbook',
  huawei:  '/services/reparation-huawei-lausanne',
  oppo:    '/services/reparation-oppo',
}

export interface RepairEntry {
  brand: RepairBrand
  brandLabel: string
  modelId: string
  modelLabel: string
  repairLabel: string
  repairCategory: string
  price: string
  href: string
}

function isRepairBrand(value: string): value is RepairBrand {
  return Object.prototype.hasOwnProperty.call(
    REPAIR_BRAND_LABELS,
    value
  )
}

function getBrandLabel(brand: PublicRepairBrand): string {
  if (isRepairBrand(brand.slug)) {
    return REPAIR_BRAND_LABELS[brand.slug]
  }

  return brand.name
}

function getBrandBasePath(brand: PublicRepairBrand): string {
  if (brand.public_base_path) {
    return brand.public_base_path.replace(/\/+$/, '')
  }

  if (isRepairBrand(brand.slug)) {
    return REPAIR_BRAND_HREFS[brand.slug]
  }

  return '/'
}

function getOfferLabel(offer: PublicRepairOffer): string {
  const baseLabel =
    offer.variant_name?.trim() ||
    offer.repair_type.short_name?.trim() ||
    offer.repair_type.name.trim()

  if (!offer.subtitle?.trim()) {
    return baseLabel
  }

  return `${baseLabel} — ${offer.subtitle.trim()}`
}

function getOfferPrice(offer: PublicRepairOffer): string {
  if (offer.availability === 'unavailable') {
    return offer.public_note?.trim() || 'Indisponible'
  }

  return formatPublicRepairPrice(offer, 'fr')
}

/* ── Construction de l'index ───────────────────────────────── */

let indexPromise: Promise<RepairEntry[]> | null = null

async function buildIndex(): Promise<RepairEntry[]> {
  const catalog = await getRepairCatalog()
  const entries: RepairEntry[] = []

  for (const brand of catalog) {
    if (!isRepairBrand(brand.slug)) {
      continue
    }

    const brandLabel = getBrandLabel(brand)
    const basePath = getBrandBasePath(brand)

    for (const family of brand.families) {
      for (const model of family.models) {
        const href = `${basePath}/${model.slug}`

        for (const offer of model.offers) {
          entries.push({
            brand: brand.slug,
            brandLabel,
            modelId: model.slug,
            modelLabel: model.name,
            repairLabel: getOfferLabel(offer),
            repairCategory: offer.repair_type.category,
            price: getOfferPrice(offer),
            href,
          })
        }
      }
    }
  }

  return entries
}

export function getRepairIndex(): Promise<RepairEntry[]> {
  if (!indexPromise) {
    indexPromise = buildIndex().catch((error: unknown) => {
      indexPromise = null
      throw error
    })
  }

  return indexPromise
}

export function clearRepairIndexCache(): void {
  indexPromise = null
}

/* ── Recherche ──────────────────────────────────────────────── */

export interface RepairSearchParams {
  brand?: string
  modelQuery?: string
  repairType?: string
}

export interface RepairSearchResult {
  modelLabel: string
  brandLabel: string
  repairLabel: string
  price: string
  href: string
}

function matchesBrand(
  entry: RepairEntry,
  brand: string
): boolean {
  const query = normalizeText(brand)

  return (
    normalizeText(entry.brand).includes(query) ||
    normalizeText(entry.brandLabel).includes(query)
  )
}

function matchesModel(
  entry: RepairEntry,
  modelQuery: string
): boolean {
  return normalizeText(entry.modelLabel).includes(
    normalizeText(modelQuery)
  )
}

function matchesRepair(
  entry: RepairEntry,
  repairType: string
): boolean {
  const query = normalizeText(repairType)
  const category = normalizeText(entry.repairCategory)
  const label = normalizeText(entry.repairLabel)

  if (
    query.includes('ecran') ||
    query.includes('vitre') ||
    query.includes('screen')
  ) {
    return (
      category === 'screen' ||
      category.includes('ecran') ||
      label.includes('ecran') ||
      label.includes('vitre')
    )
  }

  if (query.includes('batt')) {
    return (
      category === 'battery' ||
      category.includes('batterie') ||
      label.includes('batt')
    )
  }

  if (
    query.includes('connect') ||
    query.includes('charge') ||
    query.includes('usb')
  ) {
    return (
      category.includes('charge') ||
      category.includes('connector') ||
      label.includes('connect') ||
      label.includes('charge') ||
      label.includes('usb')
    )
  }

  if (query.includes('diagn')) {
    return (
      category.includes('diagn') ||
      label.includes('diagn')
    )
  }

  if (
    query.includes('camera') ||
    query.includes('camero') ||
    query.includes('photo')
  ) {
    return (
      category.includes('camera') ||
      label.includes('camera') ||
      label.includes('photo')
    )
  }

  return label.includes(query) || category.includes(query)
}

export async function searchRepairPrices(
  params: RepairSearchParams
): Promise<RepairSearchResult[]> {
  let entries = await getRepairIndex()

  if (params.brand) {
    entries = entries.filter((entry) =>
      matchesBrand(entry, params.brand as string)
    )
  }

  if (params.modelQuery) {
    entries = entries.filter((entry) =>
      matchesModel(entry, params.modelQuery as string)
    )
  }

  if (params.repairType) {
    entries = entries.filter((entry) =>
      matchesRepair(entry, params.repairType as string)
    )
  }

  const seen = new Set<string>()
  const results: RepairSearchResult[] = []

  for (const entry of entries) {
    const key = [
      entry.brand,
      entry.modelId,
      entry.repairLabel,
    ].join('|')

    if (seen.has(key)) {
      continue
    }

    seen.add(key)

    results.push({
      modelLabel: entry.modelLabel,
      brandLabel: entry.brandLabel,
      repairLabel: entry.repairLabel,
      price: entry.price,
      href: entry.href,
    })

    if (results.length >= 8) {
      break
    }
  }

  return results
}
