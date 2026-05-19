/*
  repairPricesIndex.ts — index complet des tarifs réparation, server-side uniquement.
  Lit depuis les fichiers data existants — ne pas dupliquer les prix ici.
  Couvre iPhone, Samsung, iPad, MacBook, Huawei, OPPO.
*/

import { iphoneModels }    from '@/data/iphoneRepairs'
import { samsungBrandData } from '@/data/samsungRepairs'
import { ipadBrandData }   from '@/data/ipadRepairs'
import { macbookBrandData } from '@/data/macbookRepairs'
import { huaweiBrandData } from '@/data/huaweiRepairs'
import { oppoBrandData }   from '@/data/oppoRepairs'
import { normalizeText }   from './normalizeSearch'

export type RepairBrand =
  | 'iphone' | 'samsung' | 'ipad' | 'macbook' | 'huawei' | 'oppo'

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
  brand:       RepairBrand
  brandLabel:  string
  modelId:     string
  modelLabel:  string
  repairLabel: string
  repairCategory: string
  price:       string   // always a formatted string: "CHF X.XX" or "Sur demande"
  href:        string
}

function formatPrice(p: number | string): string {
  if (typeof p === 'number') return p > 0 ? `CHF ${p.toFixed(2)}` : 'Prix sur demande'
  return p || 'Prix sur demande'
}

/* ── Build index ─────────────────────────────────────────────── */

let _index: RepairEntry[] | null = null

function buildIndex(): RepairEntry[] {
  const entries: RepairEntry[] = []

  /* iPhone — model pages exist */
  for (const m of iphoneModels) {
    const href = `/services/reparation-iphone/${m.id}`
    for (const r of m.mainRepairs) {
      entries.push({ brand: 'iphone', brandLabel: 'iPhone', modelId: m.id, modelLabel: m.label, repairLabel: r.name, repairCategory: r.name.toLowerCase().includes('batterie') ? 'battery' : 'screen', price: r.price, href })
    }
    for (const r of m.otherRepairs) {
      entries.push({ brand: 'iphone', brandLabel: 'iPhone', modelId: m.id, modelLabel: m.label, repairLabel: r.name, repairCategory: 'other', price: r.price, href })
    }
  }

  /* Generic brands using RepairBrandData */
  const brandSources: Array<{ brand: RepairBrand; data: typeof samsungBrandData }> = [
    { brand: 'samsung', data: samsungBrandData },
    { brand: 'ipad',    data: ipadBrandData    },
    { brand: 'macbook', data: macbookBrandData  },
    { brand: 'huawei',  data: huaweiBrandData   },
    { brand: 'oppo',    data: oppoBrandData     },
  ]

  for (const { brand, data } of brandSources) {
    const href = REPAIR_BRAND_HREFS[brand]
    for (const family of data.families) {
      for (const model of family.models) {
        for (const r of model.repairs) {
          entries.push({
            brand,
            brandLabel:     REPAIR_BRAND_LABELS[brand],
            modelId:        model.id,
            modelLabel:     model.label,
            repairLabel:    r.label,
            repairCategory: r.category,
            price:          formatPrice(r.price),
            href,
          })
        }
      }
    }
  }

  return entries
}

export function getRepairIndex(): RepairEntry[] {
  if (!_index) _index = buildIndex()
  return _index
}

/* ── Search helpers ──────────────────────────────────────────── */

export interface RepairSearchParams {
  brand?:      string   // brand name or key (case-insensitive)
  modelQuery?: string   // partial model name
  repairType?: string   // "ecran" | "batterie" | "connecteur" | "diagnostic" | etc.
}

export interface RepairSearchResult {
  modelLabel:  string
  brandLabel:  string
  repairLabel: string
  price:       string
  href:        string
}

function matchesBrand(entry: RepairEntry, brand: string): boolean {
  const q = normalizeText(brand)
  return normalizeText(entry.brand).includes(q) || normalizeText(entry.brandLabel).includes(q)
}

function matchesModel(entry: RepairEntry, modelQuery: string): boolean {
  return normalizeText(entry.modelLabel).includes(normalizeText(modelQuery))
}

function matchesRepair(entry: RepairEntry, repairType: string): boolean {
  const q = normalizeText(repairType)
  const cat = entry.repairCategory
  const label = normalizeText(entry.repairLabel)
  if (q.includes('ecran') || q.includes('vitre') || q.includes('screen'))   return cat === 'screen' || label.includes('ecran')
  if (q.includes('batt'))                                                    return cat === 'battery' || label.includes('batt')
  if (q.includes('connect') || q.includes('charge') || q.includes('usb'))   return label.includes('connect') || label.includes('charge')
  if (q.includes('diagn'))                                                   return label.includes('diagn')
  if (q.includes('camera') || q.includes('camero') || q.includes('photo'))  return label.includes('camér') || label.includes('camera')
  return label.includes(q)
}

export function searchRepairPrices(params: RepairSearchParams): RepairSearchResult[] {
  let entries = getRepairIndex()

  if (params.brand)      entries = entries.filter(e => matchesBrand(e, params.brand!))
  if (params.modelQuery) entries = entries.filter(e => matchesModel(e, params.modelQuery!))
  if (params.repairType) entries = entries.filter(e => matchesRepair(e, params.repairType!))

  /* Deduplicate by modelId + repairLabel, keep up to 8 results */
  const seen = new Set<string>()
  const results: RepairSearchResult[] = []
  for (const e of entries) {
    const key = `${e.modelId}|${e.repairLabel}`
    if (seen.has(key)) continue
    seen.add(key)
    results.push({ modelLabel: e.modelLabel, brandLabel: e.brandLabel, repairLabel: e.repairLabel, price: e.price, href: e.href })
    if (results.length >= 8) break
  }
  return results
}
