/*
  lib/admin/queries.ts

  Requêtes de lecture seule pour l'interface admin.
  Aucune mutation (insert, update, delete, upsert).

  Toutes les fonctions nécessitent un client Supabase authentifié
  (session RLS) créé via createSupabaseServerClient().
*/

import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DashboardStats,
  BrandRow,
  ModelRow,
  RepairTypeRow,
  OfferRow,
  PaginatedResult,
} from './types'

/* ── Comptage utilitaire ──────────────────────────────────── */

async function countTable(
  client: SupabaseClient,
  table: string,
  filters?: Record<string, string>,
): Promise<number> {
  let q = client.from(table).select('id', { count: 'exact' }).limit(0)
  if (filters) {
    for (const [col, val] of Object.entries(filters)) {
      q = q.eq(col, val)
    }
  }
  const { count, error } = await q
  if (error) {
    console.error(`[admin/queries] countTable ${table}:`, error.message)
    return -1
  }
  return count ?? 0
}

/* ── Tableau de bord ─────────────────────────────────────── */

export async function getDashboardStats(client: SupabaseClient): Promise<DashboardStats> {
  const [
    brands, families, models, types, offers,
    fixed, on_request, quote, unavailable,
  ] = await Promise.all([
    countTable(client, 'brands',            { status: 'active' }),
    countTable(client, 'device_families',   { status: 'active' }),
    countTable(client, 'device_models',     { status: 'active' }),
    countTable(client, 'repair_types',      { status: 'active' }),
    countTable(client, 'repair_offers',     { status: 'active' }),
    // Compteurs prix
    (async () => {
      const { count } = await client
        .from('repair_offers')
        .select('id', { count: 'exact' })
        .limit(0)
        .eq('pricing_mode', 'fixed')
        .eq('availability', 'available')
        .eq('status', 'active')
      return count ?? 0
    })(),
    (async () => {
      const { count } = await client
        .from('repair_offers')
        .select('id', { count: 'exact' })
        .limit(0)
        .eq('pricing_mode', 'on_request')
        .eq('availability', 'available')
        .eq('status', 'active')
      return count ?? 0
    })(),
    (async () => {
      const { count } = await client
        .from('repair_offers')
        .select('id', { count: 'exact' })
        .limit(0)
        .eq('pricing_mode', 'quote')
        .eq('status', 'active')
      return count ?? 0
    })(),
    (async () => {
      const { count } = await client
        .from('repair_offers')
        .select('id', { count: 'exact' })
        .limit(0)
        .eq('availability', 'unavailable')
        .eq('status', 'active')
      return count ?? 0
    })(),
  ])

  return { brands, families, models, types, offers, fixed, on_request, quote, unavailable }
}

/* ── Marques ─────────────────────────────────────────────── */

export async function getBrands(client: SupabaseClient): Promise<BrandRow[]> {
  const { data, error } = await client
    .from('brands')
    .select('id, internal_key, name, slug, h1_prefix, h1_brand, brand_icon, breadcrumb_label, public_base_path, status, sort_order')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[admin/queries] getBrands:', error.message)
    return []
  }

  // Compteurs par marque
  const { data: familyCounts } = await client
    .from('device_families')
    .select('id, brand_id')

  const { data: modelData } = await client
    .from('device_models')
    .select('id, family_id')

  // Résoudre family_id → brand_id via familyCounts
  const familyById: Record<string, string> = {}
  for (const f of familyCounts ?? []) {
    familyById[f.id as string] = f.brand_id as string
  }

  const familyByBrand: Record<string, number> = {}
  const modelByBrand:  Record<string, number> = {}

  for (const f of familyCounts ?? []) {
    familyByBrand[f.brand_id as string] = (familyByBrand[f.brand_id as string] ?? 0) + 1
  }

  for (const m of modelData ?? []) {
    const brandId = familyById[m.family_id as string]
    if (brandId) {
      modelByBrand[brandId] = (modelByBrand[brandId] ?? 0) + 1
    }
  }

  return (data ?? []).map(b => ({
    ...(b as BrandRow),
    familyCount: familyByBrand[b.id] ?? 0,
    modelCount:  modelByBrand[b.id]  ?? 0,
  }))
}

/* ── Modèles ─────────────────────────────────────────────── */

export interface ModelFilters {
  brand?:  string   // brand internal_key
  status?: string
  search?: string
}

export async function getModels(
  client: SupabaseClient,
  page: number,
  pageSize: number,
  filters: ModelFilters = {},
): Promise<PaginatedResult<ModelRow>> {
  const from = (page - 1) * pageSize
  const to   = from + pageSize - 1

  let q = client
    .from('device_models')
    .select(`
      id, internal_key, name, slug, status, sort_order,
      device_families!inner(
        id, internal_key, name,
        brands!inner(id, internal_key, name)
      ),
      device_categories!inner(internal_key, name)
    `, { count: 'exact' })
    .range(from, to)
    .order('sort_order', { ascending: true })

  if (filters.status) q = q.eq('status', filters.status)
  if (filters.search) q = q.ilike('name', `%${filters.search}%`)
  if (filters.brand)  q = q.eq('device_families.brands.internal_key', filters.brand)

  const { data, count, error } = await q

  if (error) {
    console.error('[admin/queries] getModels:', error.message)
    return { data: [], count: 0, page, pageSize }
  }

  const rows: ModelRow[] = (data ?? []).map((m) => {
    const fam = (Array.isArray(m.device_families) ? m.device_families[0] : m.device_families) as {
      id: string; internal_key: string; name: string;
      brands: { id: string; internal_key: string; name: string } | { id: string; internal_key: string; name: string }[]
    } | null
    const brandsRaw = fam?.brands
    const brand = (Array.isArray(brandsRaw) ? brandsRaw[0] : brandsRaw) as { id: string; internal_key: string; name: string } | null
    const cat = (Array.isArray(m.device_categories) ? m.device_categories[0] : m.device_categories) as { internal_key: string; name: string } | null

    return {
      id:                 m.id as string,
      internal_key:       m.internal_key as string,
      name:               m.name as string,
      slug:               m.slug as string,
      status:             m.status as string,
      sort_order:         m.sort_order as number,
      family_name:        fam?.name ?? '',
      brand_name:         brand?.name ?? '',
      brand_internal_key: brand?.internal_key ?? '',
      category_name:      cat?.name ?? '',
    }
  })

  return { data: rows, count: count ?? 0, page, pageSize }
}

/* ── Types de réparation ─────────────────────────────────── */

export interface TypeFilters {
  category?: string
  status?:   string
  search?:   string
}

export async function getRepairTypes(
  client: SupabaseClient,
  filters: TypeFilters = {},
): Promise<RepairTypeRow[]> {
  let q = client
    .from('repair_types')
    .select('id, internal_key, name, short_name, slug, category, status, sort_order')
    .order('sort_order', { ascending: true })

  if (filters.category) q = q.eq('category', filters.category)
  if (filters.status)   q = q.eq('status', filters.status)
  if (filters.search)   q = q.ilike('name', `%${filters.search}%`)

  const { data, error } = await q

  if (error) {
    console.error('[admin/queries] getRepairTypes:', error.message)
    return []
  }

  // Compteurs d'offres par type
  const { data: offerCounts } = await client
    .from('repair_offers')
    .select('repair_type_id')

  const byType: Record<string, number> = {}
  for (const o of offerCounts ?? []) {
    byType[o.repair_type_id] = (byType[o.repair_type_id] ?? 0) + 1
  }

  return (data ?? []).map(t => ({
    ...(t as RepairTypeRow),
    offerCount: byType[t.id] ?? 0,
  }))
}

/* ── Offres de réparation ────────────────────────────────── */

export interface OfferFilters {
  brand?:        string   // brand internal_key
  type?:         string   // repair_type internal_key
  availability?: string
  status?:       string
  search?:       string   // model name search
}

export async function getOffers(
  client: SupabaseClient,
  page: number,
  pageSize: number,
  filters: OfferFilters = {},
): Promise<PaginatedResult<OfferRow>> {
  const from = (page - 1) * pageSize
  const to   = from + pageSize - 1

  let q = client
    .from('repair_offers')
    .select(`
      id, variant_key, variant_name, subtitle,
      pricing_mode, price_cents, currency,
      availability, public_note, internal_note,
      duration_minutes, warranty_months,
      status, sort_order,
      device_models!inner(
        internal_key, name, slug,
        device_families!inner(
          internal_key, name,
          brands!inner(internal_key, name)
        )
      ),
      repair_types!inner(internal_key, name, category)
    `, { count: 'exact' })
    .range(from, to)
    .order('sort_order', { ascending: true })

  if (filters.availability) q = q.eq('availability', filters.availability)
  if (filters.status)       q = q.eq('status', filters.status)
  if (filters.search)       q = q.ilike('device_models.name', `%${filters.search}%`)
  if (filters.brand)        q = q.eq('device_models.device_families.brands.internal_key', filters.brand)
  if (filters.type)         q = q.eq('repair_types.internal_key', filters.type)

  const { data, count, error } = await q

  if (error) {
    console.error('[admin/queries] getOffers:', error.message)
    return { data: [], count: 0, page, pageSize }
  }

  const rows: OfferRow[] = (data ?? []).map((o) => {
    const modelRaw = (Array.isArray(o.device_models) ? o.device_models[0] : o.device_models) as {
      internal_key: string; name: string; slug: string;
      device_families: unknown
    } | null
    const famRaw  = modelRaw
      ? (Array.isArray((modelRaw as { device_families: unknown }).device_families)
          ? ((modelRaw as { device_families: unknown[] }).device_families)[0]
          : (modelRaw as { device_families: unknown }).device_families)
      : null
    const fam = famRaw as { internal_key: string; name: string; brands: unknown } | null
    const brandRaw = fam ? (Array.isArray(fam.brands) ? (fam.brands as unknown[])[0] : fam.brands) : null
    const brand = brandRaw as { internal_key: string; name: string } | null
    const typeRaw = (Array.isArray(o.repair_types) ? o.repair_types[0] : o.repair_types) as {
      internal_key: string; name: string; category: string
    } | null

    return {
      id:                  o.id as string,
      variant_key:         o.variant_key as string,
      variant_name:        (o as Record<string, unknown>).variant_name as string | null,
      subtitle:            o.subtitle as string | null,
      pricing_mode:        o.pricing_mode as string,
      price_cents:         o.price_cents as number | null,
      currency:            o.currency as string,
      availability:        o.availability as string,
      public_note:         o.public_note as string | null,
      internal_note:       (o as Record<string, unknown>).internal_note as string | null,
      duration_minutes:    (o as Record<string, unknown>).duration_minutes as number | null,
      warranty_months:     (o as Record<string, unknown>).warranty_months as number | null,
      status:              o.status as string,
      sort_order:          o.sort_order as number,
      model_name:          modelRaw?.name ?? '',
      model_internal_key:  modelRaw?.internal_key ?? '',
      model_slug:          modelRaw?.slug ?? '',
      family_name:         fam?.name ?? '',
      brand_name:          brand?.name ?? '',
      brand_internal_key:  brand?.internal_key ?? '',
      type_name:           typeRaw?.name ?? '',
      type_internal_key:   typeRaw?.internal_key ?? '',
      type_category:       typeRaw?.category ?? '',
    }
  })

  return { data: rows, count: count ?? 0, page, pageSize }
}

/* ── Lookups pour les filtres ────────────────────────────── */

export async function getBrandNames(client: SupabaseClient): Promise<{ internal_key: string; name: string }[]> {
  const { data } = await client
    .from('brands')
    .select('internal_key, name')
    .order('sort_order', { ascending: true })
  return data ?? []
}

export async function getRepairTypeNames(client: SupabaseClient): Promise<{ internal_key: string; name: string }[]> {
  const { data } = await client
    .from('repair_types')
    .select('internal_key, name')
    .order('sort_order', { ascending: true })
  return data ?? []
}

/* ── Offre unique (pour le formulaire d'édition) ─────────── */

export interface OfferDetail extends OfferRow {
  updated_at: string
}

export async function getOfferById(
  client: SupabaseClient,
  id: string,
): Promise<OfferDetail | null> {
  const { data, error } = await client
    .from('repair_offers')
    .select(`
      id, variant_key, variant_name, subtitle,
      pricing_mode, price_cents, currency,
      availability, public_note, internal_note,
      status, sort_order, updated_at,
      device_models!inner(
        id, internal_key, name, slug,
        device_families!inner(
          internal_key, name,
          brands!inner(internal_key, name)
        )
      ),
      repair_types!inner(id, internal_key, name, category)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    console.error('[admin/queries] getOfferById:', error?.message)
    return null
  }

  const modelRaw = (Array.isArray(data.device_models) ? data.device_models[0] : data.device_models) as {
    id: string; internal_key: string; name: string; slug: string;
    device_families: unknown
  } | null
  const famRaw   = modelRaw
    ? (Array.isArray((modelRaw as { device_families: unknown }).device_families)
        ? ((modelRaw as { device_families: unknown[] }).device_families)[0]
        : (modelRaw as { device_families: unknown }).device_families)
    : null
  const fam      = famRaw as { internal_key: string; name: string; brands: unknown } | null
  const brandRaw = fam ? (Array.isArray(fam.brands) ? (fam.brands as unknown[])[0] : fam.brands) : null
  const brand    = brandRaw as { internal_key: string; name: string } | null
  const typeRaw  = (Array.isArray(data.repair_types) ? data.repair_types[0] : data.repair_types) as {
    id: string; internal_key: string; name: string; category: string
  } | null

  return {
    id:                 data.id as string,
    variant_key:        data.variant_key as string,
    variant_name:       (data as { variant_name?: string | null }).variant_name ?? null,
    subtitle:           data.subtitle as string | null,
    pricing_mode:       data.pricing_mode as string,
    price_cents:        data.price_cents as number | null,
    currency:           data.currency as string,
    availability:       data.availability as string,
    public_note:        data.public_note as string | null,
    internal_note:      (data as { internal_note?: string | null }).internal_note ?? null,
    status:             data.status as string,
    sort_order:         data.sort_order as number,
    updated_at:         data.updated_at as string,
    model_name:         modelRaw?.name ?? '',
    model_internal_key: modelRaw?.internal_key ?? '',
    model_slug:         modelRaw?.slug ?? '',
    family_name:        fam?.name ?? '',
    brand_name:         brand?.name ?? '',
    brand_internal_key: brand?.internal_key ?? '',
    type_name:          typeRaw?.name ?? '',
    type_internal_key:  typeRaw?.internal_key ?? '',
    type_category:      typeRaw?.category ?? '',
  }
}

/* ── Listes pour les formulaires ────────────────────────── */

export interface ModelSelectOption {
  id:          string
  internal_key: string
  name:         string
  brand_name:   string
  brand_key:    string
}

export async function getAllModelsForSelect(
  client: SupabaseClient,
): Promise<ModelSelectOption[]> {
  const { data, error } = await client
    .from('device_models')
    .select(`
      id, internal_key, name,
      device_families!inner(
        brands!inner(internal_key, name)
      )
    `)
    .eq('status', 'active')
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[admin/queries] getAllModelsForSelect:', error.message)
    return []
  }

  return (data ?? []).map((m) => {
    const famRaw  = (Array.isArray(m.device_families) ? m.device_families[0] : m.device_families) as {
      brands: unknown
    } | null
    const brandRaw = famRaw ? (Array.isArray(famRaw.brands) ? (famRaw.brands as unknown[])[0] : famRaw.brands) : null
    const brand    = brandRaw as { internal_key: string; name: string } | null
    return {
      id:           m.id as string,
      internal_key: m.internal_key as string,
      name:         m.name as string,
      brand_name:   brand?.name ?? '',
      brand_key:    brand?.internal_key ?? '',
    }
  })
}

export interface TypeSelectOption {
  id:          string
  internal_key: string
  name:         string
  category:     string
}

export async function getAllTypesForSelect(
  client: SupabaseClient,
): Promise<TypeSelectOption[]> {
  const { data } = await client
    .from('repair_types')
    .select('id, internal_key, name, category')
    .eq('status', 'active')
    .order('sort_order', { ascending: true })
  return (data ?? []).map(t => ({
    id:           t.id as string,
    internal_key: t.internal_key as string,
    name:         t.name as string,
    category:     t.category as string,
  }))
}

/* ── Sélecteurs en cascade (Brand → Family → Model) ─────── */

export interface SelectorFamily {
  brand_key:    string   // brand.internal_key
  internal_key: string
  name:         string
}

export interface SelectorModel {
  brand_key:    string   // brand.internal_key
  family_key:   string   // family.internal_key
  internal_key: string
  name:         string
  slug:         string
}

export async function getSelectorFamilies(
  client: SupabaseClient,
): Promise<SelectorFamily[]> {
  const { data, error } = await client
    .from('device_families')
    .select('internal_key, name, brands!inner(internal_key)')
    .order('sort_order', { ascending: true })

  if (error) { console.error('[queries] getSelectorFamilies:', error.message); return [] }

  return (data ?? []).map(f => {
    const b = (Array.isArray(f.brands) ? f.brands[0] : f.brands) as { internal_key: string } | null
    return {
      brand_key:    b?.internal_key ?? '',
      internal_key: f.internal_key as string,
      name:         f.name as string,
    }
  })
}

export async function getSelectorModels(
  client: SupabaseClient,
): Promise<SelectorModel[]> {
  const { data, error } = await client
    .from('device_models')
    .select(`
      internal_key, name, slug,
      device_families!inner(
        internal_key,
        brands!inner(internal_key)
      )
    `)
    .order('sort_order', { ascending: true })

  if (error) { console.error('[queries] getSelectorModels:', error.message); return [] }

  return (data ?? []).map(m => {
    const fam = (Array.isArray(m.device_families) ? m.device_families[0] : m.device_families) as {
      internal_key: string; brands: unknown
    } | null
    const br = fam ? (Array.isArray(fam.brands) ? (fam.brands as unknown[])[0] : fam.brands) : null
    const brand = br as { internal_key: string } | null
    return {
      brand_key:    brand?.internal_key ?? '',
      family_key:   fam?.internal_key ?? '',
      internal_key: m.internal_key as string,
      name:         m.name as string,
      slug:         m.slug as string,
    }
  })
}

/* ── Contexte d'un modèle (header + requêtes d'offres) ───── */

export interface ModelContext {
  id:           string
  internal_key: string
  name:         string
  slug:         string
  family_key:   string
  family_name:  string
  brand_key:    string
  brand_name:   string
}

export async function getModelBySlug(
  client: SupabaseClient,
  slug: string,
): Promise<ModelContext | null> {
  const { data, error } = await client
    .from('device_models')
    .select(`
      id, internal_key, name, slug,
      device_families!inner(
        internal_key, name,
        brands!inner(internal_key, name)
      )
    `)
    .eq('slug', slug)
    .single()

  if (error || !data) return null

  const fam = (Array.isArray(data.device_families) ? data.device_families[0] : data.device_families) as {
    internal_key: string; name: string; brands: unknown
  } | null
  const br = fam ? (Array.isArray(fam.brands) ? (fam.brands as unknown[])[0] : fam.brands) : null
  const brand = br as { internal_key: string; name: string } | null

  return {
    id:           data.id as string,
    internal_key: data.internal_key as string,
    name:         data.name as string,
    slug:         data.slug as string,
    family_key:   fam?.internal_key ?? '',
    family_name:  fam?.name ?? '',
    brand_key:    brand?.internal_key ?? '',
    brand_name:   brand?.name ?? '',
  }
}

/* ── Offres d'un modèle (pas de pagination — max ~15/modèle) */

export async function getOffersByModelId(
  client: SupabaseClient,
  modelId: string,
  ctx: Pick<ModelContext, 'internal_key' | 'name' | 'slug' | 'family_name' | 'brand_name' | 'brand_key'>,
): Promise<OfferDetail[]> {
  const { data, error } = await client
    .from('repair_offers')
    .select(`
      id, variant_key, variant_name, subtitle,
      pricing_mode, price_cents, currency, availability,
      public_note, internal_note, duration_minutes, warranty_months,
      status, sort_order, updated_at,
      repair_types!inner(id, internal_key, name, category)
    `)
    .eq('device_model_id', modelId)
    .order('sort_order', { ascending: true })

  if (error) { console.error('[queries] getOffersByModelId:', error.message); return [] }

  return (data ?? []).map(o => {
    const tr = (Array.isArray(o.repair_types) ? o.repair_types[0] : o.repair_types) as {
      id: string; internal_key: string; name: string; category: string
    } | null
    const row = o as Record<string, unknown>
    return {
      id:                  o.id as string,
      variant_key:         o.variant_key as string,
      variant_name:        row.variant_name as string | null,
      subtitle:            o.subtitle as string | null,
      pricing_mode:        o.pricing_mode as string,
      price_cents:         o.price_cents as number | null,
      currency:            o.currency as string,
      availability:        o.availability as string,
      public_note:         o.public_note as string | null,
      internal_note:       row.internal_note as string | null,
      duration_minutes:    row.duration_minutes as number | null,
      warranty_months:     row.warranty_months as number | null,
      status:              o.status as string,
      sort_order:          o.sort_order as number,
      updated_at:          row.updated_at as string,
      model_name:          ctx.name,
      model_internal_key:  ctx.internal_key,
      model_slug:          ctx.slug,
      family_name:         ctx.family_name,
      brand_name:          ctx.brand_name,
      brand_internal_key:  ctx.brand_key,
      type_name:           tr?.name ?? '',
      type_internal_key:   tr?.internal_key ?? '',
      type_category:       tr?.category ?? '',
    }
  })
}
