import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/en/services/macbook-repair'

export async function generateStaticParams() {
  const brand = await getPublicRepairBrand('macbook')

  if (!brand) return []

  return brand.families.flatMap(family =>
    family.models.map(model => ({
      modelSlug: model.slug,
    })),
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params

  const brand = await getPublicRepairBrand('macbook')
  if (!brand) return {}

  const data = adaptPublicRepairBrand(brand, { locale: 'en' })

  const model = data.families
    .flatMap(f => f.models)
    .find(m => m.id === modelSlug)

  if (!model) return {}

  return {
    title: `${model.label} Repair Lausanne | ClikClak`,
    description: `Professional ${model.label} repair in Lausanne.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF}/${model.id}`,
      languages: {
        'fr-CH': `${SITE_URL}/services/reparation-macbook/${model.id}`,
        'en-CH': `${SITE_URL}${BASE_HREF}/${model.id}`,
        'x-default': `${SITE_URL}/services/reparation-macbook/${model.id}`,
      },
    },
    openGraph: {
      title: `${model.label} Repair Lausanne — ClikClak`,
      description: `Professional ${model.label} repair in Lausanne.`,
      url: `${SITE_URL}${BASE_HREF}/${model.id}`,
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

  const brand = await getPublicRepairBrand('macbook')
  if (!brand) notFound()

  const data = adaptPublicRepairBrand(brand, { locale: 'en' })

  const model = data.families
    .flatMap(f => f.models)
    .find(m => m.id === modelSlug)

  if (!model) notFound()

  return (
    <RepairModelPage
      data={data}
      modelId={model.id}
      deviceType="laptop"
      baseHref={BASE_HREF}
      locale="en"
    />
  )
}
