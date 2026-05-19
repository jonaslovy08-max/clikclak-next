/*
  lib/repairSearch.ts — index de recherche réparations multi-marques.

  Sources de vérité :
    data/iphoneRepairs.ts      — iPhone (format legacy)
    data/ipadRepairs.ts        — iPad (RepairBrandData, 4 familles)
    data/samsungRepairs.ts     — Samsung (RepairBrandData, 16 familles)
    data/oppoRepairs.ts        — OPPO (RepairBrandData)
    data/huaweiRepairs.ts      — Huawei (RepairBrandData, 3 familles)
    data/macbookRepairs.ts     — MacBook (RepairBrandData, 3 familles)
    data/sonyXperiaRepairs.ts  — Sony Xperia (RepairBrandData, 2 familles)
*/

import { iphoneModels, generations }   from '@/data/iphoneRepairs'
import { ipadBrandData }               from '@/data/ipadRepairs'
import { samsungBrandData }            from '@/data/samsungRepairs'
import { oppoBrandData }               from '@/data/oppoRepairs'
import { huaweiBrandData }             from '@/data/huaweiRepairs'
import { macbookBrandData }            from '@/data/macbookRepairs'
import { sonyXperiaBrandData }         from '@/data/sonyXperiaRepairs'
import type { RepairBrandData }        from '@/data/repairTypes'

/* ── Type unifié ───────────────────────────────────────────────────────────── */
export type SearchableModel = {
  brand:       string
  modelId:     string
  modelLabel:  string
  familyId:    string
  familyLabel: string
  href:        string
  corpus:      string
}

/* ── Normalisation unicode ─────────────────────────────────────────────────── */
function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/* ── Aliases iPhone SE ─────────────────────────────────────────────────────── */
const IPHONE_SE_ALIASES: Record<string, string> = {
  'iphone-se-1': 'se 2016 se1 1ere premiere generation original',
  'iphone-se-2': 'se 2020 se2 2eme deuxieme generation',
  'iphone-se-3': 'se 2022 se3 3eme troisieme generation',
}

/* ── Index iPhone (format legacy) ─────────────────────────────────────────── */
function buildIphoneIndex(): SearchableModel[] {
  const familyMap = new Map(generations.map(g => [g.id, g.label]))
  return iphoneModels.map(model => {
    const familyLabel = familyMap.get(model.generation) ?? model.generation
    const base        = normalize(model.label)
    const alias       = IPHONE_SE_ALIASES[model.id] ?? ''
    return {
      brand:       'iPhone',
      modelId:     model.id,
      modelLabel:  model.label,
      familyId:    model.generation,
      familyLabel,
      href:        `/services/reparation-iphone/${model.id}`,
      corpus:      (base + ' ' + alias).trimEnd(),
    }
  })
}

/* ── Index générique depuis RepairBrandData ────────────────────────────────── */
function buildBrandIndex(data: RepairBrandData, pageHref: string, extraKeywords = ''): SearchableModel[] {
  const brand = data.h1Brand
  return data.families.flatMap(family =>
    family.models.map(model => ({
      brand,
      modelId:     model.id,
      modelLabel:  model.label,
      familyId:    family.id,
      familyLabel: family.label,
      href:        `${pageHref}/${model.id}`,
      corpus:      normalize([model.label, family.label, brand, extraKeywords].join(' ')),
    }))
  )
}

/* ── Index global ──────────────────────────────────────────────────────────── */
export function buildRepairSearchIndex(): SearchableModel[] {
  return [
    ...buildIphoneIndex(),
    ...buildBrandIndex(ipadBrandData,        '/services/reparation-ipad',             'tablette apple ipad'),
    ...buildBrandIndex(samsungBrandData,     '/services/reparation-samsung-lausanne', 'galaxy samsung'),
    ...buildBrandIndex(oppoBrandData,        '/services/reparation-oppo',             'oppo'),
    ...buildBrandIndex(huaweiBrandData,      '/services/reparation-huawei-lausanne',  'huawei honor'),
    ...buildBrandIndex(macbookBrandData,     '/services/reparation-macbook',          'macbook apple mac ordinateur'),
    ...buildBrandIndex(sonyXperiaBrandData,  '/services/reparation-sony-xperia',     'sony xperia'),
  ]
}

/* ── Recherche ─────────────────────────────────────────────────────────────── */
export function searchRepairs(query: string, index: SearchableModel[]): SearchableModel[] {
  const q = normalize(query)
  if (q.length < 2) return []
  const words = q.split(' ').filter(Boolean)
  return index.filter(entry => words.every(w => entry.corpus.includes(w)))
}

/* ── Singleton ─────────────────────────────────────────────────────────────── */
export const repairSearchIndex: SearchableModel[] = buildRepairSearchIndex()
