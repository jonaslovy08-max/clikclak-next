import type {
  RepairBrandData,
  RepairCategory,
  RepairItem,
} from '@/data/repairTypes'

import {
  formatPublicRepairPrice,
  type PublicRepairBrand,
  type PublicRepairOffer,
} from '@/lib/repair/publicCatalog'

export type PublicBrandAdapterOverrides = Partial<
  Omit<RepairBrandData, 'families'>
>

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

function getRepairCategory(
  offer: PublicRepairOffer
): RepairCategory {
  const values = [
    offer.repair_type.category,
    offer.repair_type.internal_key,
    offer.repair_type.slug,
    offer.repair_type.name,
  ].map(normalizeKey)

  const isScreen = values.some(
    (value) =>
      value === 'screen' ||
      value === 'ecran' ||
      value.includes('screen') ||
      value.includes('ecran')
  )

  if (isScreen) {
    return 'screen'
  }

  const isBattery = values.some(
    (value) =>
      value === 'battery' ||
      value === 'batterie' ||
      value.includes('battery') ||
      value.includes('batterie')
  )

  if (isBattery) {
    return 'battery'
  }

  return 'other'
}

function adaptOffer(
  offer: PublicRepairOffer,
  locale: 'fr' | 'en'
): RepairItem {
  return {
    label: offer.repair_type.name,
    price: formatPublicRepairPrice(offer, locale),
    category: getRepairCategory(offer),
  }
}

export function adaptPublicRepairBrand(
  brand: PublicRepairBrand,
  {
    locale = 'fr',
    overrides = {},
  }: {
    locale?: 'fr' | 'en'
    overrides?: PublicBrandAdapterOverrides
  } = {}
): RepairBrandData {
  const families = [...brand.families]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((family) => ({
      id: family.internal_key,
      label: family.name,
      shortLabel: family.short_label ?? family.name,
      buttonPrefix: family.button_prefix ?? undefined,
      models: [...family.models]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((model) => ({
          id: model.slug,
          label: model.name,
          repairs: [...model.offers]
            .sort(
              (a, b) =>
                a.sort_order - b.sort_order ||
                a.repair_type.sort_order -
                  b.repair_type.sort_order
            )
            .map((offer) => adaptOffer(offer, locale)),
        })),
    }))

  return {
    h1Prefix:
      overrides.h1Prefix ??
      brand.h1_prefix ??
      (locale === 'fr' ? 'Réparation' : 'Repair'),

    h1Brand:
      overrides.h1Brand ??
      brand.h1_brand ??
      brand.name,

    brandIcon:
      overrides.brandIcon ??
      brand.brand_icon ??
      undefined,

    breadcrumbLabel:
      overrides.breadcrumbLabel ??
      brand.breadcrumb_label ??
      brand.name,

    breadcrumbHref:
      overrides.breadcrumbHref ??
      brand.breadcrumb_href ??
      '/reparation-smartphone-express',

    families,

    defaultModelId:
      overrides.defaultModelId ??
      brand.default_model_slug ??
      undefined,

    initialFamilyCount:
      overrides.initialFamilyCount ??
      brand.initial_family_count ??
      undefined,

    repairNote:
      overrides.repairNote ??
      brand.repair_note ??
      undefined,

    searchPlaceholder:
      overrides.searchPlaceholder ??
      brand.search_placeholder ??
      undefined,
  }
}
