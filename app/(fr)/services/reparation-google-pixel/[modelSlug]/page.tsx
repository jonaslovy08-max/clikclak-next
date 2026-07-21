import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/services/reparation-google-pixel'

export async function generateStaticParams() {
  const brand = await getPublicRepairBrand('google')

  if (!brand) return []

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

  const brand = await getPublicRepairBrand('google')
  if (!brand) return {}

  const data = adaptPublicRepairBrand(brand)

  const model = data.families
    .flatMap(f => f.models)
    .find(m => m.id === modelSlug)

  if (!model) return {}

  return {
    title: `Réparation ${model.label} Lausanne | Prix écran, batterie | ClikClak`,
    description: `Consultez les prix de réparation ${model.label} à Lausanne : écran, batterie, caméra, connecteur de charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF}/${model.id}`,
      languages: {
        'fr-CH': `${SITE_URL}${BASE_HREF}/${model.id}`,
        'en-CH': `${SITE_URL}/en/services/google-pixel-repair/${model.id}`,
        'x-default': `${SITE_URL}${BASE_HREF}/${model.id}`,
      },
    },
    openGraph: {
      title: `Réparation ${model.label} Lausanne — ClikClak`,
      description: `Prix de réparation ${model.label} à Lausanne. Écran, batterie, caméra et plus.`,
      url: `${SITE_URL}${BASE_HREF}/${model.id}`,
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

  const brand = await getPublicRepairBrand('google')
  if (!brand) notFound()

  const data = adaptPublicRepairBrand(brand)

  const model = data.families
    .flatMap(f => f.models)
    .find(m => m.id === modelSlug)

  if (!model) notFound()

  return (
    <RepairModelPage
      data={data}
      modelId={model.id}
      deviceType="smartphone"
      baseHref={BASE_HREF}
    />
  )
}
