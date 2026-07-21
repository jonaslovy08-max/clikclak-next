import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'

import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/en/services/huawei-repair'

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
    title: `Huawei ${model.name} Repair Lausanne | ClikClak`,
    description: `Huawei ${model.name} repair prices in Lausanne. Screen, battery, camera, charging port and more.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF}/${model.slug}`,
      languages: {
        'fr-CH': `${SITE_URL}/services/reparation-huawei-lausanne/${model.slug}`,
        'en-CH': `${SITE_URL}${BASE_HREF}/${model.slug}`,
        'x-default': `${SITE_URL}/services/reparation-huawei-lausanne/${model.slug}`,
      },
    },
    openGraph: {
      title: `Huawei ${model.name} Repair Lausanne — ClikClak`,
      description: `Huawei ${model.name} repair in Lausanne. Quality parts and warranty included.`,
      url: `${SITE_URL}${BASE_HREF}/${model.slug}`,
      locale: 'en_CH',
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
      data={adaptPublicRepairBrand(brand, { locale: 'en' })}
      modelId={model.slug}
      deviceType="smartphone"
      baseHref={BASE_HREF}
    />
  )
}
