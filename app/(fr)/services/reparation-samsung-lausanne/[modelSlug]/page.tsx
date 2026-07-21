import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/services/reparation-samsung-lausanne'

type PageProps = {
  params: Promise<{ modelSlug: string }>
}

export async function generateStaticParams() {
  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    return []
  }

  return brand.families.flatMap((family) =>
    family.models.map((model) => ({
      modelSlug: model.slug,
    }))
  )
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { modelSlug } = await params
  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    return {}
  }

  const model = brand.families
    .flatMap((family) => family.models)
    .find(
      (candidate) =>
        candidate.slug === modelSlug ||
        candidate.legacy_slug === modelSlug
    )

  if (!model) {
    return {}
  }

  const canonicalPath = `${BASE_HREF}/${model.slug}`

  return {
    title: `Réparation ${model.name} Lausanne | Prix écran, batterie | ClikClak`,
    description: `Consultez les prix de réparation ${model.name} à Lausanne : écran, batterie, caméra, connecteur de charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages: {
        'fr-CH': `${SITE_URL}${canonicalPath}`,
        'en-CH': `${SITE_URL}/en/services/samsung-repair/${model.slug}`,
        'x-default': `${SITE_URL}${canonicalPath}`,
      },
    },
    openGraph: {
      title: `Réparation ${model.name} Lausanne — ClikClak`,
      description: `Prix de réparation ${model.name} à Lausanne. Écran, batterie, caméra et plus. Pièces de qualité, garantie incluse.`,
      url: `${SITE_URL}${canonicalPath}`,
      locale: 'fr_CH',
      type: 'website',
    },
  }
}

export default async function SamsungModelPage({
  params,
}: PageProps) {
  const { modelSlug } = await params
  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    notFound()
  }

  const model = brand.families
    .flatMap((family) => family.models)
    .find(
      (candidate) =>
        candidate.slug === modelSlug ||
        candidate.legacy_slug === modelSlug
    )

  if (!model) {
    notFound()
  }

  const data = adaptPublicRepairBrand(brand, {
    locale: 'fr',
  })

  return (
    <RepairModelPage
      data={data}
      modelId={model.slug}
      deviceType="smartphone"
      baseHref={BASE_HREF}
      locale="fr"
    />
  )
}
