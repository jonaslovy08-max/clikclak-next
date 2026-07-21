import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/en/services/ipad-repair'

export async function generateStaticParams() {
  const brand = await getPublicRepairBrand('ipad')

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

  const brand = await getPublicRepairBrand('ipad')
  if (!brand) return {}

  const data = adaptPublicRepairBrand(brand, { locale: 'en' })

  const model = data.families
    .flatMap(f => f.models)
    .find(m => m.id === modelSlug)

  if (!model) return {}

  return {
    title: `${model.label} Repair Lausanne | Screen, Battery | ClikClak`,
    description: `Professional ${model.label} repair in Lausanne: screen, battery, charging port and more.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF}/${model.id}`,
      languages: {
        'fr-CH': `${SITE_URL}/services/reparation-ipad/${model.id}`,
        'en-CH': `${SITE_URL}${BASE_HREF}/${model.id}`,
        'x-default': `${SITE_URL}/services/reparation-ipad/${model.id}`,
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

  const brand = await getPublicRepairBrand('ipad')
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
      deviceType="tablet"
      baseHref={BASE_HREF}
      locale="en"
    />
  )
}
