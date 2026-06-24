/*
  lib/migration/compareRepairDatabaseWithPlan.ts

  Lit toutes les données importées depuis Supabase et les compare
  champ par champ avec le plan de migration local.

  Strictement en lecture seule. Gère la pagination pour les repair_offers
  (1 308 lignes > limite PostgREST de 1 000).

  Réutilise computeFingerprint() pour recalculer l'empreinte depuis
  les données de la base de données distante.
*/

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { computeFingerprint } from './buildRepairMigrationPlan'
import type {
  RepairMigrationPlan,
  PlannedBrand,
  PlannedDeviceCategory,
  PlannedDeviceFamily,
  PlannedDeviceModel,
  PlannedRepairType,
  PlannedRepairOffer,
} from './repairMigrationTypes'
import { EXPECTED_VOLUMES } from './generateRepairImportSql'

/* ── Types publics ───────────────────────────────────────────── */

export interface FieldDiff {
  entity:     string
  naturalKey: string
  field:      string
  expected:   unknown
  actual:     unknown
}

export interface ComparisonResult {
  success:             boolean
  dbFingerprint:       string
  planFingerprint:     string
  fingerprintMatch:    boolean
  diffs:               FieldDiff[]
  counts:              Record<string, number>
  priceCounts: {
    fixed:       number
    on_request:  number
    quote:       number
    unavailable: number
    with_note:   number
    with_subtitle: number
  }
  adminProfile: { exists: boolean; role?: string; active?: boolean }
  errors:       string[]
}

/* ── Types internes (lignes brutes Supabase) ─────────────────── */

interface RawBrand {
  id: string; internal_key: string; name: string; slug: string
  h1_prefix: string; h1_brand: string; brand_icon: string | null
  breadcrumb_label: string; breadcrumb_href: string; public_base_path: string
  default_model_slug: string | null; initial_family_count: number | null
  repair_note: string | null; search_placeholder: string | null
  status: string; sort_order: number
}

interface RawCategory {
  id: string; internal_key: string; name: string; slug: string
  status: string; sort_order: number
}

interface RawFamily {
  id: string; brand_id: string; internal_key: string; name: string
  short_label: string; button_prefix: string | null
  status: string; sort_order: number
}

interface RawModel {
  id: string; family_id: string; category_id: string; internal_key: string
  name: string; slug: string; legacy_slug: string | null
  status: string; sort_order: number
}

interface RawRepairType {
  id: string; internal_key: string; name: string; short_name: string | null
  slug: string; category: string; description: string | null
  status: string; sort_order: number
}

interface RawOffer {
  id: string; device_model_id: string; repair_type_id: string
  variant_key: string; variant_name: string | null; subtitle: string | null
  pricing_mode: string; price_cents: number | null; currency: string
  availability: string; duration_minutes: number | null; warranty_months: number | null
  public_note: string | null; internal_note: string | null
  status: string; sort_order: number
}

interface RawAdminProfile {
  id: string; role: string; active: boolean
}

/* ── Pagination générique ────────────────────────────────────── */

async function fetchAllRows<T>(
  client: SupabaseClient,
  table: string,
  selectFields: string,
): Promise<T[]> {
  const PAGE_SIZE = 1000
  const rows: T[] = []
  let page = 0

  while (true) {
    const from = page * PAGE_SIZE
    const to   = from + PAGE_SIZE - 1

    const { data, error } = await client
      .from(table)
      .select(selectFields)
      .range(from, to)

    if (error) {
      throw new Error(`Lecture Supabase (${table}) : ${error.message} [${error.code ?? ''}]`)
    }

    if (!data || data.length === 0) break
    rows.push(...(data as T[]))
    if (data.length < PAGE_SIZE) break
    page++
  }

  return rows
}

/* ── Comparaison d'un champ ──────────────────────────────────── */

function diff(
  diffs: FieldDiff[],
  entity: string,
  naturalKey: string,
  field: string,
  expected: unknown,
  actual: unknown,
): void {
  // Normalise null/undefined pour comparaison
  const exp = expected ?? null
  const act = actual   ?? null
  if (JSON.stringify(exp) !== JSON.stringify(act)) {
    diffs.push({ entity, naturalKey, field, expected: exp, actual: act })
  }
}

/* ── Comparaison principale ──────────────────────────────────── */

export async function compareRepairDatabaseWithPlan(
  plan: RepairMigrationPlan,
  supabaseUrl: string,
  supabaseKey: string,
): Promise<ComparisonResult> {
  const errors: string[]   = []
  const diffs:  FieldDiff[] = []

  const client = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  /* ── Lecture de toutes les entités ──────────────────────────── */

  let rawBrands:      RawBrand[]      = []
  let rawCategories:  RawCategory[]   = []
  let rawFamilies:    RawFamily[]      = []
  let rawModels:      RawModel[]       = []
  let rawTypes:       RawRepairType[]  = []
  let rawOffers:      RawOffer[]       = []
  let rawAdmin:       RawAdminProfile[] = []

  try {
    rawBrands = await fetchAllRows<RawBrand>(client, 'brands',
      'id,internal_key,name,slug,h1_prefix,h1_brand,brand_icon,breadcrumb_label,breadcrumb_href,public_base_path,default_model_slug,initial_family_count,repair_note,search_placeholder,status,sort_order')
    rawCategories = await fetchAllRows<RawCategory>(client, 'device_categories',
      'id,internal_key,name,slug,status,sort_order')
    rawFamilies = await fetchAllRows<RawFamily>(client, 'device_families',
      'id,brand_id,internal_key,name,short_label,button_prefix,status,sort_order')
    rawModels = await fetchAllRows<RawModel>(client, 'device_models',
      'id,family_id,category_id,internal_key,name,slug,legacy_slug,status,sort_order')
    rawTypes = await fetchAllRows<RawRepairType>(client, 'repair_types',
      'id,internal_key,name,short_name,slug,category,description,status,sort_order')
    rawOffers = await fetchAllRows<RawOffer>(client, 'repair_offers',
      'id,device_model_id,repair_type_id,variant_key,variant_name,subtitle,pricing_mode,price_cents,currency,availability,duration_minutes,warranty_months,public_note,internal_note,status,sort_order')
    rawAdmin = await fetchAllRows<RawAdminProfile>(client, 'admin_profiles',
      'id,role,active')
  } catch (e: unknown) {
    errors.push(e instanceof Error ? e.message : String(e))
    return {
      success: false,
      dbFingerprint: '',
      planFingerprint: plan.fingerprint,
      fingerprintMatch: false,
      diffs: [],
      counts: {},
      priceCounts: { fixed: 0, on_request: 0, quote: 0, unavailable: 0, with_note: 0, with_subtitle: 0 },
      adminProfile: { exists: false },
      errors,
    }
  }

  /* ── Cartes de résolution FK ─────────────────────────────────── */

  const brandById    = new Map<string, RawBrand>(rawBrands.map(b => [b.id, b]))
  const catById      = new Map<string, RawCategory>(rawCategories.map(c => [c.id, c]))
  const familyById   = new Map<string, RawFamily>(rawFamilies.map(f => [f.id, f]))
  const modelById    = new Map<string, RawModel>(rawModels.map(m => [m.id, m]))
  const typeById     = new Map<string, RawRepairType>(rawTypes.map(t => [t.id, t]))

  /* ── Reconstruction des structures de plan ────────────────────── */

  // Marques
  const dbBrands: PlannedBrand[] = rawBrands.map(b => ({
    internal_key:         b.internal_key,
    name:                 b.name,
    slug:                 b.slug,
    h1_prefix:            b.h1_prefix,
    h1_brand:             b.h1_brand,
    brand_icon:           b.brand_icon,
    breadcrumb_label:     b.breadcrumb_label,
    breadcrumb_href:      b.breadcrumb_href,
    public_base_path:     b.public_base_path,
    default_model_slug:   b.default_model_slug,
    initial_family_count: b.initial_family_count,
    repair_note:          b.repair_note,
    search_placeholder:   b.search_placeholder,
    status:               b.status as PlannedBrand['status'],
    sort_order:           b.sort_order,
  }))

  // Catégories
  const dbCategories: PlannedDeviceCategory[] = rawCategories.map(c => ({
    internal_key: c.internal_key,
    name:         c.name,
    slug:         c.slug,
    status:       c.status as PlannedDeviceCategory['status'],
    sort_order:   c.sort_order,
  }))

  // Familles (résolution brand_id → brand_internal_key)
  const dbFamilies: PlannedDeviceFamily[] = []
  for (const f of rawFamilies) {
    const brand = brandById.get(f.brand_id)
    if (!brand) { errors.push(`Famille ${f.internal_key} : brand_id ${f.brand_id} introuvable`); continue }
    dbFamilies.push({
      brand_internal_key: brand.internal_key,
      internal_key:       f.internal_key,
      name:               f.name,
      short_label:        f.short_label,
      button_prefix:      f.button_prefix,
      status:             f.status as PlannedDeviceFamily['status'],
      sort_order:         f.sort_order,
    })
  }

  // Modèles (résolution family_id → family+brand internal_key, category_id → category_internal_key)
  const dbModels: PlannedDeviceModel[] = []
  for (const m of rawModels) {
    const family   = familyById.get(m.family_id)
    const category = catById.get(m.category_id)
    if (!family)   { errors.push(`Modèle ${m.internal_key} : family_id ${m.family_id} introuvable`); continue }
    if (!category) { errors.push(`Modèle ${m.internal_key} : category_id ${m.category_id} introuvable`); continue }
    const brand = brandById.get(family.brand_id)
    if (!brand) { errors.push(`Modèle ${m.internal_key} : brand introuvable via famille`); continue }
    dbModels.push({
      family_internal_key:   family.internal_key,
      brand_internal_key:    brand.internal_key,
      category_internal_key: category.internal_key,
      internal_key:          m.internal_key,
      name:                  m.name,
      slug:                  m.slug,
      legacy_slug:           m.legacy_slug ?? m.slug,
      status:                m.status as PlannedDeviceModel['status'],
      sort_order:            m.sort_order,
    })
  }

  // Types de réparation
  const dbTypes: PlannedRepairType[] = rawTypes.map(t => ({
    internal_key: t.internal_key,
    name:         t.name,
    short_name:   t.short_name,
    slug:         t.slug,
    category:     t.category as PlannedRepairType['category'],
    description:  t.description,
    status:       t.status as PlannedRepairType['status'],
    sort_order:   t.sort_order,
  }))

  // Offres (résolution device_model_id et repair_type_id → internal_key)
  const dbOffers: PlannedRepairOffer[] = []
  for (const o of rawOffers) {
    const model = modelById.get(o.device_model_id)
    const type  = typeById.get(o.repair_type_id)
    if (!model) { errors.push(`Offre ${o.id} : device_model_id ${o.device_model_id} introuvable`); continue }
    if (!type)  { errors.push(`Offre ${o.id} : repair_type_id ${o.repair_type_id} introuvable`); continue }
    dbOffers.push({
      device_model_internal_key: model.internal_key,
      repair_type_internal_key:  type.internal_key,
      variant_key:               o.variant_key,
      variant_name:              o.variant_name,
      subtitle:                  o.subtitle,
      pricing_mode:              o.pricing_mode as PlannedRepairOffer['pricing_mode'],
      price_cents:               o.price_cents,
      currency:                  o.currency as 'CHF',
      availability:              o.availability as PlannedRepairOffer['availability'],
      duration_minutes:          o.duration_minutes,
      warranty_months:           o.warranty_months,
      public_note:               o.public_note,
      internal_note:             o.internal_note,
      status:                    o.status as PlannedRepairOffer['status'],
      sort_order:                o.sort_order,
    })
  }

  /* ── Fingerprint distant ─────────────────────────────────────── */

  const dbFingerprint = computeFingerprint({
    brands:           dbBrands,
    deviceCategories: dbCategories,
    deviceFamilies:   dbFamilies,
    deviceModels:     dbModels,
    repairTypes:      dbTypes,
    repairOffers:     dbOffers,
  })
  const fingerprintMatch = dbFingerprint === plan.fingerprint

  /* ── Comparaison champ par champ ─────────────────────────────── */

  // Marques
  const planBrandMap = new Map(plan.brands.map(b => [b.internal_key, b]))
  const dbBrandMap   = new Map(dbBrands.map(b => [b.internal_key, b]))
  for (const [key, pb] of planBrandMap) {
    const db = dbBrandMap.get(key)
    if (!db) { diffs.push({ entity: 'brand', naturalKey: key, field: '(existence)', expected: 'présent', actual: 'absent' }); continue }
    const fields: (keyof PlannedBrand)[] = [
      'name', 'slug', 'h1_prefix', 'h1_brand', 'brand_icon', 'breadcrumb_label',
      'breadcrumb_href', 'public_base_path', 'default_model_slug',
      'initial_family_count', 'repair_note', 'search_placeholder', 'status', 'sort_order',
    ]
    for (const f of fields) diff(diffs, 'brand', key, f, pb[f], db[f])
  }
  for (const key of dbBrandMap.keys()) {
    if (!planBrandMap.has(key)) diffs.push({ entity: 'brand', naturalKey: key, field: '(existence)', expected: 'absent', actual: 'présent en base' })
  }

  // Catégories
  const planCatMap = new Map(plan.deviceCategories.map(c => [c.internal_key, c]))
  const dbCatMap   = new Map(dbCategories.map(c => [c.internal_key, c]))
  for (const [key, pc] of planCatMap) {
    const db = dbCatMap.get(key)
    if (!db) { diffs.push({ entity: 'category', naturalKey: key, field: '(existence)', expected: 'présent', actual: 'absent' }); continue }
    for (const f of ['name', 'slug', 'status', 'sort_order'] as const) diff(diffs, 'category', key, f, pc[f], db[f])
  }

  // Familles
  const planFamMap = new Map(plan.deviceFamilies.map(f => [`${f.brand_internal_key}:${f.internal_key}`, f]))
  const dbFamMap   = new Map(dbFamilies.map(f => [`${f.brand_internal_key}:${f.internal_key}`, f]))
  for (const [key, pf] of planFamMap) {
    const db = dbFamMap.get(key)
    if (!db) { diffs.push({ entity: 'family', naturalKey: key, field: '(existence)', expected: 'présent', actual: 'absent' }); continue }
    for (const f of ['name', 'short_label', 'button_prefix', 'status', 'sort_order'] as const) {
      diff(diffs, 'family', key, f, pf[f], db[f])
    }
  }

  // Modèles
  const planModelMap = new Map(plan.deviceModels.map(m => [m.internal_key, m]))
  const dbModelMap   = new Map(dbModels.map(m => [m.internal_key, m]))
  for (const [key, pm] of planModelMap) {
    const db = dbModelMap.get(key)
    if (!db) { diffs.push({ entity: 'model', naturalKey: key, field: '(existence)', expected: 'présent', actual: 'absent' }); continue }
    for (const f of ['family_internal_key', 'brand_internal_key', 'category_internal_key', 'name', 'slug', 'legacy_slug', 'status', 'sort_order'] as const) {
      diff(diffs, 'model', key, f, pm[f], db[f])
    }
  }

  // Types de réparation
  const planTypeMap = new Map(plan.repairTypes.map(t => [t.internal_key, t]))
  const dbTypeMap   = new Map(dbTypes.map(t => [t.internal_key, t]))
  for (const [key, pt] of planTypeMap) {
    const db = dbTypeMap.get(key)
    if (!db) { diffs.push({ entity: 'repair_type', naturalKey: key, field: '(existence)', expected: 'présent', actual: 'absent' }); continue }
    for (const f of ['name', 'short_name', 'slug', 'category', 'description', 'status', 'sort_order'] as const) {
      diff(diffs, 'repair_type', key, f, pt[f], db[f])
    }
  }

  // Offres
  const planOfferMap = new Map(plan.repairOffers.map(o => [
    `${o.device_model_internal_key}||${o.repair_type_internal_key}||${o.variant_key}`, o,
  ]))
  const dbOfferMap = new Map(dbOffers.map(o => [
    `${o.device_model_internal_key}||${o.repair_type_internal_key}||${o.variant_key}`, o,
  ]))
  for (const [key, po] of planOfferMap) {
    const db = dbOfferMap.get(key)
    if (!db) { diffs.push({ entity: 'offer', naturalKey: key, field: '(existence)', expected: 'présent', actual: 'absent' }); continue }
    for (const f of [
      'variant_name', 'subtitle', 'pricing_mode', 'price_cents', 'currency',
      'availability', 'duration_minutes', 'warranty_months',
      'public_note', 'internal_note', 'status', 'sort_order',
    ] as const) {
      diff(diffs, 'offer', key, f, po[f], db[f])
    }
  }
  for (const key of dbOfferMap.keys()) {
    if (!planOfferMap.has(key)) diffs.push({ entity: 'offer', naturalKey: key, field: '(existence)', expected: 'absent', actual: 'présent en base' })
  }

  /* ── Compteurs ───────────────────────────────────────────────── */

  const counts = {
    brands:             rawBrands.length,
    device_categories:  rawCategories.length,
    device_families:    rawFamilies.length,
    device_models:      rawModels.length,
    repair_types:       rawTypes.length,
    repair_offers:      rawOffers.length,
    model_slug_history: 0,
  }

  // Compter model_slug_history séparément
  try {
    const { count } = await client.from('model_slug_history').select('id', { count: 'exact' }).limit(0)
    counts.model_slug_history = count ?? 0
  } catch { /* ignore */ }

  const priceCounts = {
    fixed:        rawOffers.filter(o => o.pricing_mode === 'fixed' && o.availability === 'available').length,
    on_request:   rawOffers.filter(o => o.pricing_mode === 'on_request' && o.availability === 'available').length,
    quote:        rawOffers.filter(o => o.pricing_mode === 'quote').length,
    unavailable:  rawOffers.filter(o => o.availability === 'unavailable').length,
    with_note:    rawOffers.filter(o => o.public_note !== null).length,
    with_subtitle: rawOffers.filter(o => o.subtitle !== null).length,
  }

  /* ── Volume check ───────────────────────────────────────────── */

  const volumeEntries = Object.entries(EXPECTED_VOLUMES).filter(
    ([k]) => !k.startsWith('price_') && !k.startsWith('with_')
  )
  for (const [key, expected] of volumeEntries) {
    const actual = counts[key as keyof typeof counts] ?? -1
    if (actual !== expected) {
      errors.push(`Volume ${key} : attendu ${expected}, obtenu ${actual}`)
    }
  }

  /* ── Profil admin ───────────────────────────────────────────── */

  const adminProfile: ComparisonResult['adminProfile'] = { exists: rawAdmin.length > 0 }
  if (rawAdmin.length > 0) {
    const a = rawAdmin[0]
    adminProfile.role   = a.role
    adminProfile.active = a.active
  }

  return {
    success:          errors.length === 0 && diffs.length === 0 && fingerprintMatch,
    dbFingerprint,
    planFingerprint:  plan.fingerprint,
    fingerprintMatch,
    diffs,
    counts,
    priceCounts,
    adminProfile,
    errors,
  }
}
