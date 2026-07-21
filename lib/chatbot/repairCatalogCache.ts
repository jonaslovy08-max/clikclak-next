import 'server-only'

import {
  getPublicRepairBrand,
  type PublicRepairBrand,
} from '@/lib/repair/publicCatalog'

const CHATBOT_BRAND_SLUGS = [
  'iphone',
  'samsung',
  'ipad',
  'macbook',
  'huawei',
  'oppo',
] as const

export type ChatbotRepairBrandSlug =
  typeof CHATBOT_BRAND_SLUGS[number]

let catalogPromise: Promise<PublicRepairBrand[]> | null = null

async function loadRepairCatalog(): Promise<PublicRepairBrand[]> {
  const brands = await Promise.all(
    CHATBOT_BRAND_SLUGS.map(async (brandSlug) => {
      const brand = await getPublicRepairBrand(brandSlug)

      if (!brand) {
        throw new Error(
          `[chatbot repair catalog] Brand not found: "${brandSlug}"`
        )
      }

      return brand
    })
  )

  return brands
}

/**
 * Charge le catalogue tarifaire public depuis Supabase.
 *
 * La promesse est mémorisée afin que plusieurs appels simultanés ne
 * déclenchent pas plusieurs chargements du même catalogue.
 */
export function getRepairCatalog(): Promise<PublicRepairBrand[]> {
  if (!catalogPromise) {
    catalogPromise = loadRepairCatalog().catch((error: unknown) => {
      // Autorise une nouvelle tentative après un échec temporaire.
      catalogPromise = null
      throw error
    })
  }

  return catalogPromise
}

/**
 * Invalidation explicite, principalement utile pour les tests.
 */
export function clearRepairCatalogCache(): void {
  catalogPromise = null
}
