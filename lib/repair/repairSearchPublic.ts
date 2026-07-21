import type {
  PublicRepairBrand,
  PublicRepairModel,
} from '@/lib/repair/publicCatalog'

export type SearchableModel = {
  brand: string
  modelId: string
  modelLabel: string
  familyId: string
  familyLabel: string
  href: string
  corpus: string
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const IPHONE_SE_ALIASES: Record<string, string> = {
  'iphone-se-1':
    'se 2016 se1 1ere premiere generation original',
  'iphone-se-2':
    'se 2020 se2 2eme deuxieme generation',
  'iphone-se-3':
    'se 2022 se3 3eme troisieme generation',
}

function getModelAliases(
  brandSlug: string,
  model: PublicRepairModel
): string {
  if (brandSlug !== 'iphone') {
    return ''
  }

  return IPHONE_SE_ALIASES[model.slug] ?? ''
}

export function buildPublicRepairSearchIndex(
  brand: PublicRepairBrand,
  pageHref: string,
  extraKeywords = ''
): SearchableModel[] {
  return brand.families.flatMap((family) =>
    family.models.map((model) => {
      const aliases = getModelAliases(brand.slug, model)

      return {
        brand: brand.name,
        modelId: model.slug,
        modelLabel: model.name,
        familyId: family.internal_key,
        familyLabel: family.name,
        href: `${pageHref}/${model.slug}`,
        corpus: normalize(
          [
            model.name,
            model.slug,
            model.legacy_slug ?? '',
            family.name,
            brand.name,
            extraKeywords,
            aliases,
          ].join(' ')
        ),
      }
    })
  )
}

export function searchPublicRepairs(
  query: string,
  index: SearchableModel[]
): SearchableModel[] {
  const normalizedQuery = normalize(query)

  if (normalizedQuery.length < 2) {
    return []
  }

  const words = normalizedQuery.split(' ').filter(Boolean)

  return index.filter((entry) =>
    words.every((word) => entry.corpus.includes(word))
  )
}
