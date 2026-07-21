import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'

import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/services/reparation-huawei-lausanne'

export async function generateStaticParams() {
  const brand = await getPublicRepairBrand('huawei')

  if (!brand) {
    return []
  }

  return brand.families.flatMap(family =>
    family.models.map(model => ({
      modelSlug: model.slug,
    }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params

  const brand = await getPublicRepairBrand('huawei')

  if (!brand) return {}

  const model = brand.families
    .flatMap(f => f.models)
    .find(m => m.slug === modelSlug || m.legacy_slug === modelSlug)

  if (!model) return {}

  return {
    title: `Réparation ${model.name} Lausanne | Prix écran, batterie | ClikClak`,
    description: `Consultez les prix de réparation ${model.name} à Lausanne : écran, batterie, caméra, connecteur de charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF}/${model.slug}`,
      languages: {
        'fr-CH': `${SITE_URL}${BASE_HREF}/${model.slug}`,
        'en-CH': `${SITE_URL}/en/services/huawei-repair/${model.slug}`,
        'x-default': `${SITE_URL}${BASE_HREF}/${model.slug}`,
      },
    },
    openGraph: {
      title: `Réparation ${model.name} Lausanne — ClikClak`,
      description: `Prix de réparation ${model.name} à Lausanne. Écran, batterie, caméra et plus. Pièces de qualité, garantie incluse.`,
      url: `${SITE_URL}${BASE_HREF}/${model.slug}`,
      locale: 'fr_CH',
      type: 'website',
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params

  const brand = await getPublicRepairBrand('huawei')

  if (!brand) {
    notFound()
  }

  const model = brand.families
    .flatMap(f => f.models)
    .find(m => m.slug === modelSlug || m.legacy_slug === modelSlug)

  if (!model) {
    notFound()
  }

  return (
    <RepairModelPage
      data={adaptPublicRepairBrand(brand, { locale: 'fr' })}
      modelId={model.slug}
      deviceType="smartphone"
      baseHref={BASE_HREF}
    />
  )
}
