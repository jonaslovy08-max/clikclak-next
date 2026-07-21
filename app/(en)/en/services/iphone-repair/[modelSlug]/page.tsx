import type { Metadata } from 'next'
import IphoneModelPage from '@/components/repair/IphoneModelPage'
import {
  getPublicRepairModel,
  getPublicRepairModels,
} from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export async function generateStaticParams() {
  const models = await getPublicRepairModels('iphone')

  return models.map((model) => ({
    modelSlug: model.slug,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params
  const model = await getPublicRepairModel('iphone', modelSlug)

  if (!model) {
    return {}
  }

  const canonicalSlug = model.slug
  const frenchUrl =
    `${SITE_URL}/services/reparation-iphone/${canonicalSlug}`
  const canonicalUrl =
    `${SITE_URL}/en/services/iphone-repair/${canonicalSlug}`

  return {
    title:
      `${model.name} Repair Lausanne | Screen and Battery Prices | ClikClak`,
    description:
      `View repair prices for ${model.name} in Lausanne: screen, battery, camera, charging port and diagnostics at ClikClak.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'fr-CH': frenchUrl,
        'en-CH': canonicalUrl,
        'x-default': frenchUrl,
      },
    },
    openGraph: {
      title: `${model.name} Repair Lausanne — ClikClak`,
      description:
        `${model.name} repair prices in Lausanne. Screen, battery, camera and more. Quality parts and warranty included.`,
      url: canonicalUrl,
      locale: 'en_CH',
      type: 'website',
    },
  }
}

export default async function IphoneModelSlugPage({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params

  return (
    <IphoneModelPage
      modelSlug={modelSlug}
      locale="en"
    />
  )
}
