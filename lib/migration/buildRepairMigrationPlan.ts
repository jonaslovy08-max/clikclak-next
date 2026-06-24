/*
  lib/migration/buildRepairMigrationPlan.ts

  Construit le plan de migration complet depuis les fichiers data/*.ts.
  Pur : aucune écriture Supabase, aucun effet de bord.
  Déterministe : deux exécutions sur les mêmes fichiers produisent le même résultat.

  Deux patterns de source :
    - iPhone legacy (IphoneModel avec mainRepairs + otherRepairs + generations)
    - RepairBrandData (families → models → repairs)
*/

import { createHash } from 'node:crypto'
import { existsSync }  from 'node:fs'
import { join }        from 'node:path'

import { iphoneModels, generations }  from '@/data/iphoneRepairs'
import { samsungBrandData }            from '@/data/samsungRepairs'
import { ipadBrandData }               from '@/data/ipadRepairs'
import { macbookBrandData }            from '@/data/macbookRepairs'
import { huaweiBrandData }             from '@/data/huaweiRepairs'
import { oppoBrandData }               from '@/data/oppoRepairs'
import { sonyXperiaBrandData }         from '@/data/sonyXperiaRepairs'
import type { RepairBrandData, RepairItem } from '@/data/repairTypes'

import type {
  PlannedBrand,
  PlannedDeviceCategory,
  PlannedDeviceFamily,
  PlannedDeviceModel,
  PlannedRepairType,
  PlannedRepairOffer,
  MigrationIssue,
  RepairMigrationPlan,
  RepairCat,
} from './repairMigrationTypes'
import { convertPrice } from './priceConverter'

/* ── Helpers ─────────────────────────────────────────────────── */

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function repairTypeKey(label: string): string {
  return slugify(label)
}

/* ── Logo Apple partagé ──────────────────────────────────────── */
// icon-iphone.svg représente réellement la pomme Apple (logo générique).
// Il est déjà utilisé par ipadBrandData et macbookBrandData dans les données sources.
// iPhone l'utilise aussi pour cohérence — ce chemin est validé plus bas.
const APPLE_BRAND_ICON = '/assets/icons/icon-iphone.svg'

/* ── Validation des assets ───────────────────────────────────── */

const PUBLIC_DIR = join(process.cwd(), 'public')

/**
 * Vérifie qu'un chemin d'asset public existe réellement dans public/.
 * Retourne true si l'asset existe.
 */
function assetExists(publicPath: string): boolean {
  if (!publicPath) return false
  // Convertit "/assets/icons/icon-samsung.svg" → "public/assets/icons/icon-samsung.svg"
  const localPath = join(PUBLIC_DIR, publicPath)
  return existsSync(localPath)
}

/* ── Mapping statique des marques ─────────────────────────────── */

type BrandMeta = {
  internal_key:          string
  name:                  string
  slug:                  string
  public_base_path:      string
  category_internal_key: string
  sort_order:            number
  h1_prefix?:            string
  h1_brand?:             string
  brand_icon?:           string | null
  breadcrumb_label?:     string
  breadcrumb_href?:      string
  default_model_slug?:   string | null
  initial_family_count?: number | null
  repair_note?:          string | null
  search_placeholder?:   string | null
}

const BRAND_META: BrandMeta[] = [
  {
    internal_key:         'iphone',
    name:                 'iPhone',
    slug:                 'iphone',
    public_base_path:     '/services/reparation-iphone',
    category_internal_key: 'smartphone',
    sort_order:            0,
    h1_prefix:             'Réparation',
    h1_brand:              'iPhone',
    // logo Apple partagé — même asset que iPad et MacBook (pomme générique)
    brand_icon:            APPLE_BRAND_ICON,
    breadcrumb_label:      'Réparation iPhone Lausanne',
    breadcrumb_href:       '/reparation-smartphone-express',
    default_model_slug:    null,
    initial_family_count:  null,
    repair_note:           null,
    search_placeholder:    null,
  },
  {
    internal_key:         'samsung',
    name:                 'Samsung',
    slug:                 'samsung',
    public_base_path:     '/services/reparation-samsung-lausanne',
    category_internal_key: 'smartphone',
    sort_order:            1,
  },
  {
    internal_key:         'ipad',
    name:                 'iPad',
    slug:                 'ipad',
    public_base_path:     '/services/reparation-ipad',
    category_internal_key: 'tablette',
    sort_order:            2,
  },
  {
    internal_key:         'macbook',
    name:                 'MacBook',
    slug:                 'macbook',
    public_base_path:     '/services/reparation-macbook',
    category_internal_key: 'ordinateur',
    sort_order:            3,
  },
  {
    internal_key:         'huawei',
    name:                 'Huawei',
    slug:                 'huawei',
    public_base_path:     '/services/reparation-huawei-lausanne',
    category_internal_key: 'smartphone',
    sort_order:            4,
  },
  {
    internal_key:         'oppo',
    name:                 'OPPO',
    slug:                 'oppo',
    public_base_path:     '/services/reparation-oppo',
    category_internal_key: 'smartphone',
    sort_order:            5,
  },
  {
    internal_key:         'sony',
    name:                 'Sony Xperia',
    slug:                 'sony-xperia',
    public_base_path:     '/services/reparation-sony-xperia',
    category_internal_key: 'smartphone',
    sort_order:            6,
  },
]

const BRAND_DATA_MAP: Record<string, RepairBrandData> = {
  samsung: samsungBrandData,
  ipad:    ipadBrandData,
  macbook: macbookBrandData,
  huawei:  huaweiBrandData,
  oppo:    oppoBrandData,
  sony:    sonyXperiaBrandData,
}

/* ── Catégories ──────────────────────────────────────────────── */

const CATEGORIES: PlannedDeviceCategory[] = [
  { internal_key: 'smartphone', name: 'Smartphone', slug: 'smartphone', status: 'active', sort_order: 0 },
  { internal_key: 'tablette',   name: 'Tablette',   slug: 'tablette',   status: 'active', sort_order: 1 },
  { internal_key: 'ordinateur', name: 'Ordinateur', slug: 'ordinateur', status: 'active', sort_order: 2 },
]

/* ── Construction du plan ────────────────────────────────────── */

export function buildRepairMigrationPlan(): RepairMigrationPlan {
  const errors:   MigrationIssue[] = []
  const warnings: MigrationIssue[] = []

  function addError(code: string, message: string, ctx?: MigrationIssue['context']) {
    errors.push({ severity: 'error', code, message, context: ctx })
  }
  function addWarning(code: string, message: string, ctx?: MigrationIssue['context']) {
    warnings.push({ severity: 'warning', code, message, context: ctx })
  }

  /* ── 1. Marques + validation des assets ─────────────────────── */

  const brands: PlannedBrand[] = BRAND_META.map((meta) => {
    const data = BRAND_DATA_MAP[meta.internal_key]

    const brand: PlannedBrand = {
      internal_key:         meta.internal_key,
      name:                 meta.name,
      slug:                 meta.slug,
      h1_prefix:            data?.h1Prefix             ?? meta.h1_prefix             ?? 'Réparation',
      h1_brand:             data?.h1Brand              ?? meta.h1_brand              ?? meta.name,
      brand_icon:           data?.brandIcon            ?? meta.brand_icon            ?? null,
      breadcrumb_label:     data?.breadcrumbLabel       ?? meta.breadcrumb_label       ?? '',
      breadcrumb_href:      data?.breadcrumbHref        ?? meta.breadcrumb_href        ?? '',
      public_base_path:     meta.public_base_path,
      default_model_slug:   data?.defaultModelId        ?? meta.default_model_slug    ?? null,
      initial_family_count: data?.initialFamilyCount    ?? meta.initial_family_count  ?? null,
      repair_note:          data?.repairNote            ?? meta.repair_note           ?? null,
      search_placeholder:   data?.searchPlaceholder     ?? meta.search_placeholder    ?? null,
      status:               'active',
      sort_order:           meta.sort_order,
    }

    if (!brand.breadcrumb_label) {
      addWarning('BRAND_MISSING_BREADCRUMB',
        `breadcrumb_label vide pour la marque "${meta.internal_key}"`,
        { brand: meta.internal_key })
    }
    if (!brand.search_placeholder) {
      addWarning('BRAND_NO_SEARCH_PLACEHOLDER',
        `search_placeholder non défini pour "${meta.internal_key}"`,
        { brand: meta.internal_key })
    }

    // Validation de l'asset brand_icon
    if (brand.brand_icon) {
      if (!assetExists(brand.brand_icon)) {
        addError('BRAND_ICON_NOT_FOUND',
          `brand_icon introuvable : "${brand.brand_icon}" (doit exister dans public/)`,
          { brand: meta.internal_key, value: brand.brand_icon })
      }
    }

    return brand
  })

  /* ── 2. Familles et modèles ─────────────────────────────────── */

  const families: PlannedDeviceFamily[] = []
  const models:   PlannedDeviceModel[]  = []

  // ── iPhone (legacy) ────────────────────────────────────────────
  generations.forEach((gen, genIdx) => {
    families.push({
      brand_internal_key: 'iphone',
      internal_key:       gen.id,
      name:               gen.label,
      short_label:        gen.label.replace('iPhone ', ''),
      button_prefix:      null,
      status:             'active',
      sort_order:         genIdx,
    })
  })

  const iphoneModelsSorted = [...iphoneModels]
  let iphoneModelOrder = 0
  for (const m of iphoneModelsSorted) {
    const familyExists = families.some(
      f => f.brand_internal_key === 'iphone' && f.internal_key === m.generation
    )
    if (!familyExists) {
      addError('IPHONE_FAMILY_NOT_FOUND',
        `Modèle iPhone "${m.id}" référence une génération inconnue : "${m.generation}"`,
        { brand: 'iphone', model: m.id })
    }
    models.push({
      family_internal_key:   m.generation,
      brand_internal_key:    'iphone',
      category_internal_key: 'smartphone',
      internal_key:          `iphone:${m.id}`,
      name:                  m.label,
      slug:                  m.id,
      legacy_slug:           m.id,
      status:                'active',
      sort_order:            iphoneModelOrder++,
    })
  }

  // ── Autres marques (RepairBrandData) ───────────────────────────
  const brandOrder: Record<string, number> = {
    samsung: 0, ipad: 0, macbook: 0, huawei: 0, oppo: 0, sony: 0,
  }

  for (const [brandKey, data] of Object.entries(BRAND_DATA_MAP)) {
    let familyIdx = 0
    for (const fam of data.families) {
      families.push({
        brand_internal_key: brandKey,
        internal_key:       fam.id,
        name:               fam.label,
        short_label:        fam.shortLabel,
        button_prefix:      fam.buttonPrefix ?? null,
        status:             'active',
        sort_order:         familyIdx++,
      })

      for (const mod of fam.models) {
        models.push({
          family_internal_key:   fam.id,
          brand_internal_key:    brandKey,
          category_internal_key: BRAND_META.find(b => b.internal_key === brandKey)?.category_internal_key ?? 'smartphone',
          internal_key:          `${brandKey}:${mod.id}`,
          name:                  mod.label,
          slug:                  mod.id,
          legacy_slug:           mod.id,
          status:                'active',
          sort_order:            brandOrder[brandKey]++,
        })
      }
    }
  }

  /* ── 3. Types de réparation ──────────────────────────────────── */

  const repairTypeMap = new Map<string, { name: string; category: RepairCat; firstBrand: string }>()

  function collectRepairLabel(label: string, cat: RepairCat, brandKey: string): void {
    const key = repairTypeKey(label)
    if (!repairTypeMap.has(key)) {
      repairTypeMap.set(key, { name: label, category: cat, firstBrand: brandKey })
    } else {
      const existing = repairTypeMap.get(key)!
      if (existing.name !== label) {
        addError('REPAIR_TYPE_KEY_COLLISION',
          `Collision d'internal_key "${key}" entre "${existing.name}" et "${label}"`,
          { brand: brandKey, repair: label })
      }
    }
  }

  for (const m of iphoneModels) {
    for (const r of m.mainRepairs) {
      const cat: RepairCat = r.name === 'Batterie' ? 'battery' : 'screen'
      collectRepairLabel(r.name, cat, 'iphone')
    }
    for (const r of m.otherRepairs) {
      collectRepairLabel(r.name, 'other', 'iphone')
    }
  }

  for (const [brandKey, data] of Object.entries(BRAND_DATA_MAP)) {
    for (const fam of data.families) {
      for (const mod of fam.models) {
        for (const r of mod.repairs as RepairItem[]) {
          collectRepairLabel(r.label, r.category, brandKey)
        }
      }
    }
  }

  const sortedKeys = [...repairTypeMap.keys()].sort()
  const repairTypes: PlannedRepairType[] = sortedKeys.map((key, idx) => {
    const { name, category } = repairTypeMap.get(key)!
    return {
      internal_key: key,
      name,
      short_name:   null,
      slug:         key,
      category,
      description:  null,
      status:       'active',
      sort_order:   idx,
    }
  })

  // Avertissements : labels similaires (non fusionnés)
  const labels = [...repairTypeMap.values()].map(v => v.name)
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const a = slugify(labels[i])
      const b = slugify(labels[j])
      if (a !== b && (a.includes(b) || b.includes(a))) {
        addWarning('SIMILAR_REPAIR_LABELS',
          `Labels de réparation très proches (non fusionnés) : "${labels[i]}" / "${labels[j]}"`,
          { repair: `${labels[i]} | ${labels[j]}` })
      }
    }
  }

  /* ── 4. Offres ───────────────────────────────────────────────── */

  const offers:     PlannedRepairOffer[] = []
  const offerKeySet = new Set<string>()
  let subtitleCount    = 0
  let offerGlobalOrder = 0

  function addOffer(
    modelInternalKey:  string,
    repairTypeKey2:    string,
    rawPrice:          number | string,
    subtitle:          string | null,
    brandCtx:          string,
    familyCtx:         string,
    modelCtx:          string,
    repairCtx:         string,
    sortWithinModel:   number,
  ): void {
    const compositeKey = `${modelInternalKey}||${repairTypeKey2}||standard`
    if (offerKeySet.has(compositeKey)) {
      addError('OFFER_DUPLICATE_KEY',
        `Doublon d'offre : modèle "${modelInternalKey}" + type "${repairTypeKey2}" + variante "standard"`,
        { brand: brandCtx, family: familyCtx, model: modelCtx, repair: repairCtx })
      return
    }
    offerKeySet.add(compositeKey)

    const ctx = `${brandCtx} > ${familyCtx} > ${modelCtx} > ${repairCtx}`
    let conv
    try {
      conv = convertPrice(rawPrice, ctx)
    } catch (e: unknown) {
      addError('PRICE_CONVERSION_FAILED',
        e instanceof Error ? e.message : String(e),
        { brand: brandCtx, family: familyCtx, model: modelCtx, repair: repairCtx, value: String(rawPrice) })
      return
    }

    const { result: priceResult, availability, public_note, warning: convWarning } = conv

    // Valeur indisponible détectée → avertissement dédié avec code spécifique
    if (availability === 'unavailable') {
      addWarning('REPAIR_UNAVAILABLE_SOURCE_VALUE',
        `Service indisponible mappé vers unavailable : "${String(rawPrice)}"`,
        { brand: brandCtx, family: familyCtx, model: modelCtx, repair: repairCtx, value: String(rawPrice) })
    } else if (convWarning) {
      // Autre avertissement de conversion non lié à l'indisponibilité
      addWarning('PRICE_SPECIAL_VALUE', convWarning,
        { brand: brandCtx, family: familyCtx, model: modelCtx, repair: repairCtx, value: String(rawPrice) })
    }

    if (priceResult.mode === 'fixed' && priceResult.cents === 0) {
      addWarning('PRICE_ZERO', 'Prix CHF 0.00 — valeur suspecte',
        { brand: brandCtx, family: familyCtx, model: modelCtx, repair: repairCtx })
    }

    if (subtitle) subtitleCount++

    offers.push({
      device_model_internal_key:  modelInternalKey,
      repair_type_internal_key:   repairTypeKey2,
      variant_key:                'standard',
      variant_name:               null,
      subtitle,
      pricing_mode:               priceResult.mode,
      price_cents:                priceResult.cents,
      currency:                   'CHF',
      availability:               availability ?? 'available',
      duration_minutes:           null,
      warranty_months:            null,
      public_note:                public_note ?? null,
      internal_note:              (availability === 'unavailable' ? convWarning : null) ?? null,
      status:                     'active',
      sort_order:                 offerGlobalOrder++,
    })
    void sortWithinModel
  }

  // iPhone offers
  for (const m of iphoneModels) {
    const modelKey = `iphone:${m.id}`
    let repairIdx = 0
    for (const r of m.mainRepairs) {
      const cat: RepairCat = r.name === 'Batterie' ? 'battery' : 'screen'
      void cat
      addOffer(modelKey, repairTypeKey(r.name), r.price, r.subtitle, 'iphone', m.generation, m.id, r.name, repairIdx++)
    }
    for (const r of m.otherRepairs) {
      addOffer(modelKey, repairTypeKey(r.name), r.price, null, 'iphone', m.generation, m.id, r.name, repairIdx++)
    }
  }

  // RepairBrandData offers
  for (const [brandKey, data] of Object.entries(BRAND_DATA_MAP)) {
    for (const fam of data.families) {
      for (const mod of fam.models) {
        const modelKey = `${brandKey}:${mod.id}`
        let repairIdx = 0
        for (const r of mod.repairs as RepairItem[]) {
          addOffer(modelKey, repairTypeKey(r.label), r.price, null, brandKey, fam.id, mod.id, r.label, repairIdx++)
        }
      }
    }
  }

  void subtitleCount

  /* ── 5. Empreinte SHA-256 ────────────────────────────────────── */

  const fingerprint = computeFingerprint({
    brands,
    deviceCategories: CATEGORIES,
    deviceFamilies:   families,
    deviceModels:     models,
    repairTypes,
    repairOffers:     offers,
  })

  return {
    brands,
    deviceCategories: CATEGORIES,
    deviceFamilies:   families,
    deviceModels:     models,
    repairTypes,
    repairOffers:     offers,
    warnings,
    errors,
    fingerprint,
  }
}

/* ── Empreinte déterministe ──────────────────────────────────── */

export function computeFingerprint(
  plan: Omit<RepairMigrationPlan, 'warnings' | 'errors' | 'fingerprint'>
): string {
  const canonical = {
    brands:           [...plan.brands].sort((a, b) => a.internal_key.localeCompare(b.internal_key)),
    deviceCategories: [...plan.deviceCategories].sort((a, b) => a.internal_key.localeCompare(b.internal_key)),
    deviceFamilies:   [...plan.deviceFamilies].sort((a, b) =>
      `${a.brand_internal_key}:${a.internal_key}`.localeCompare(`${b.brand_internal_key}:${b.internal_key}`)
    ),
    deviceModels:   [...plan.deviceModels].sort((a, b) => a.internal_key.localeCompare(b.internal_key)),
    repairTypes:    [...plan.repairTypes].sort((a, b) => a.internal_key.localeCompare(b.internal_key)),
    repairOffers:   [...plan.repairOffers].sort((a, b) => {
      const k = `${a.device_model_internal_key}|${a.repair_type_internal_key}|${a.variant_key}`
      const l = `${b.device_model_internal_key}|${b.repair_type_internal_key}|${b.variant_key}`
      return k.localeCompare(l)
    }),
  }
  return createHash('sha256').update(JSON.stringify(canonical)).digest('hex')
}

/* ── Compteurs utiles pour le rapport ────────────────────────── */

export function countSubtitles(offers: PlannedRepairOffer[]): number {
  return offers.filter(o => o.subtitle !== null).length
}

export function countByPricingMode(offers: PlannedRepairOffer[]) {
  const fixed      = offers.filter(o => o.pricing_mode === 'fixed' && o.availability === 'available').length
  const on_request = offers.filter(o => o.pricing_mode === 'on_request' && o.availability === 'available').length
  const quote      = offers.filter(o => o.pricing_mode === 'quote').length
  const unavailable = offers.filter(o => o.availability === 'unavailable').length
  const with_note  = offers.filter(o => o.public_note !== null).length
  return { fixed, on_request, quote, unavailable, with_note }
}

/* ── Test asset (pour les tests internes du script) ─────────── */

export function getAppleBrandIcon(): string {
  return APPLE_BRAND_ICON
}

export function checkAssetExists(publicPath: string): boolean {
  return assetExists(publicPath)
}
