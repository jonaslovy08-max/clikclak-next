
import { cache } from 'react'
import { publicSupabase } from '@/lib/supabase/public'

export type PublicRepairType = {
  id: string
  internal_key: string
  name: string
  short_name: string | null
  slug: string
  category: string
  description: string | null
  sort_order: number
}

export type PublicRepairOffer = {
  id: string
  variant_key: string
  variant_name: string | null
  subtitle: string | null
  pricing_mode: string
  price_cents: number | null
  currency: string
  availability: string
  duration_minutes: number | null
  warranty_months: number | null
  public_note: string | null
  sort_order: number
  repair_type: PublicRepairType
}

export type PublicRepairModel = {
  id: string
  internal_key: string
  name: string
  slug: string
  legacy_slug: string | null
  sort_order: number
  offers: PublicRepairOffer[]
}

export type PublicRepairFamily = {
  id: string
  internal_key: string
  name: string
  short_label: string | null
  button_prefix: string | null
  sort_order: number
  models: PublicRepairModel[]
}

export type PublicRepairBrand = {
  id: string
  slug: string
  name: string
  h1_prefix: string | null
  h1_brand: string | null
  brand_icon: string | null
  breadcrumb_label: string | null
  breadcrumb_href: string | null
  public_base_path: string | null
  default_model_slug: string | null
  initial_family_count: number | null
  repair_note: string | null
  search_placeholder: string | null
  families: PublicRepairFamily[]
}

function isPublicRepairBrand(
  value: unknown
): value is PublicRepairBrand {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<PublicRepairBrand>

  return (
    typeof candidate.id === 'string' &&
    typeof candidate.slug === 'string' &&
    typeof candidate.name === 'string' &&
    Array.isArray(candidate.families)
  )
}

export const getPublicRepairBrand = cache(async function getPublicRepairBrand(
  brandSlug: string
): Promise<PublicRepairBrand | null> {
  const m = process.memoryUsage()

  process.stderr.write(
    `[gen][pid=${process.pid}][${new Date().toISOString()}] brand=${brandSlug} rss=${Math.round(m.rss / 1024 / 1024)}MB heap=${Math.round(m.heapUsed / 1024 / 1024)}MB\n`
  )

  const normalizedSlug = brandSlug.trim().toLowerCase()

  if (!normalizedSlug) {
    return null
  }

  const supabase = publicSupabase

  const { data, error } = await supabase.rpc(
    'get_public_repair_brand',
    {
      p_brand_slug: normalizedSlug,
    }
  )

  if (error) {
    console.error(
      `[repair catalog] Unable to load brand "${normalizedSlug}"`,
      error
    )

    throw new Error(
      `Unable to load public repair catalog for "${normalizedSlug}"`
    )
  }

  if (data === null) {
    return null
  }

  if (!isPublicRepairBrand(data)) {
    console.error(
      `[repair catalog] Invalid payload for brand "${normalizedSlug}"`,
      data
    )

    throw new Error(
      `Invalid public repair catalog payload for "${normalizedSlug}"`
    )
  }

  return data
})

export async function getPublicRepairModels(
  brandSlug: string
): Promise<PublicRepairModel[]> {
  const brand = await getPublicRepairBrand(brandSlug)

  if (!brand) {
    return []
  }

  return brand.families.flatMap((family) => family.models)
}

export async function getPublicRepairModel(
  brandSlug: string,
  modelSlug: string
): Promise<PublicRepairModel | null> {
  const normalizedModelSlug = modelSlug.trim().toLowerCase()

  if (!normalizedModelSlug) {
    return null
  }

  const models = await getPublicRepairModels(brandSlug)

  return (
    models.find(
      (model) =>
        model.slug === normalizedModelSlug ||
        model.legacy_slug === normalizedModelSlug
    ) ?? null
  )
}

export async function getPublicRepairFamilyForModel(
  brandSlug: string,
  modelSlug: string
): Promise<PublicRepairFamily | null> {
  const normalizedModelSlug = modelSlug.trim().toLowerCase()
  const brand = await getPublicRepairBrand(brandSlug)

  if (!brand) {
    return null
  }

  return (
    brand.families.find((family) =>
      family.models.some(
        (model) =>
          model.slug === normalizedModelSlug ||
          model.legacy_slug === normalizedModelSlug
      )
    ) ?? null
  )
}

export function formatPublicRepairPrice(
  offer: Pick<
    PublicRepairOffer,
    'pricing_mode' | 'price_cents' | 'currency'
  >,
  locale: 'fr' | 'en' = 'fr'
): string {
  if (
    offer.pricing_mode !== 'fixed' ||
    offer.price_cents === null
  ) {
    return locale === 'fr' ? 'Sur devis' : 'On request'
  }

  // Les anciens catalogues utilisaient souvent .99 comme marqueur
  // technique pour un prix public en francs entiers.
  // Exemple : 9'999 centimes doit être affiché comme CHF 99.
  const normalizedPriceCents =
    offer.price_cents % 100 === 99
      ? offer.price_cents - 99
      : offer.price_cents

  return new Intl.NumberFormat(
    locale === 'fr' ? 'fr-CH' : 'en-CH',
    {
      style: 'currency',
      currency: offer.currency || 'CHF',
      minimumFractionDigits:
        normalizedPriceCents % 100 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }
  ).format(normalizedPriceCents / 100)
}
