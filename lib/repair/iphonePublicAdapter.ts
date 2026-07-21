
import type {
  PublicRepairBrand,
  PublicRepairOffer,
} from '@/lib/repair/publicCatalog'

import type {
  IphoneGeneration,
  IphoneMainRepair,
  IphoneModel,
  IphoneOtherRepair,
  IphonePublicPageData,
} from '@/lib/repair/iphonePublicTypes'

function formatPrice(offer: PublicRepairOffer): string {
  if (
    offer.pricing_mode !== 'fixed' ||
    offer.price_cents === null
  ) {
    return 'Sur devis'
  }

  return `CHF ${(offer.price_cents / 100).toFixed(2)}`
}

function normalizeKey(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
}

function isScreenOffer(offer: PublicRepairOffer): boolean {
  const values = [
    offer.repair_type.category,
    offer.repair_type.internal_key,
    offer.repair_type.slug,
    offer.repair_type.name,
  ].map(normalizeKey)

  return values.some((value) =>
    value === 'screen' ||
    value === 'ecran' ||
    value.includes('ecran') ||
    value.includes('screen')
  )
}

function isBatteryOffer(offer: PublicRepairOffer): boolean {
  const values = [
    offer.repair_type.category,
    offer.repair_type.internal_key,
    offer.repair_type.slug,
    offer.repair_type.name,
  ].map(normalizeKey)

  return values.some((value) =>
    value === 'battery' ||
    value === 'batterie' ||
    value.includes('batterie') ||
    value.includes('battery')
  )
}

function toMainRepair(
  offer: PublicRepairOffer,
  fallbackSubtitle: string
): IphoneMainRepair {
  return {
    name: offer.repair_type.name,
    subtitle:
      offer.subtitle ??
      offer.repair_type.short_name ??
      fallbackSubtitle,
    price: formatPrice(offer),
  }
}

function toOtherRepair(
  offer: PublicRepairOffer
): IphoneOtherRepair {
  return {
    name: offer.repair_type.name,
    price: formatPrice(offer),
  }
}

export function adaptIphonePublicCatalog(
  brand: PublicRepairBrand
): IphonePublicPageData {
  const generations: IphoneGeneration[] = brand.families.map(
    (family) => ({
      id: family.internal_key,
      label: family.name,
    })
  )

  const iphoneModels: IphoneModel[] = brand.families.flatMap(
    (family) =>
      family.models.map((model) => {
        const sortedOffers = [...model.offers].sort(
          (a, b) =>
            a.sort_order - b.sort_order ||
            a.repair_type.sort_order -
              b.repair_type.sort_order
        )

        const screenOffer = sortedOffers.find(isScreenOffer)
        const batteryOffer = sortedOffers.find(isBatteryOffer)

        const mainOfferIds = new Set(
          [screenOffer?.id, batteryOffer?.id].filter(
            (id): id is string => Boolean(id)
          )
        )

        const mainRepairs: IphoneMainRepair[] = []

        if (screenOffer) {
          mainRepairs.push(
            toMainRepair(
              screenOffer,
              "Changement d'écran"
            )
          )
        }

        if (batteryOffer) {
          mainRepairs.push(
            toMainRepair(
              batteryOffer,
              'Remplacement de batterie'
            )
          )
        }

        const otherRepairs = sortedOffers
          .filter((offer) => !mainOfferIds.has(offer.id))
          .map(toOtherRepair)

        return {
          id: model.slug,
          label: model.name,
          generation: family.internal_key,
          image: '',
          mainRepairs,
          otherRepairs,
        }
      })
  )

  return {
    generations,
    iphoneModels,
  }
}
