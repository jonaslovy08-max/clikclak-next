import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { samsungBrandData } from '@/data/samsungRepairs'
import RepairModelPage from '@/components/repair/RepairModelPage'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF_EN = '/en/services/samsung-repair'
const BASE_HREF_FR = '/services/reparation-samsung-lausanne'

const allModels = samsungBrandData.families.flatMap(f => f.models)

export function generateStaticParams() {
  return allModels.map(m => ({ modelSlug: m.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params
  const model = allModels.find(m => m.id === modelSlug)
  if (!model) return {}
  return {
    title:       `${model.label} Repair Lausanne | Screen, Battery | ClikClak`,
    description: `Check ${model.label} repair prices in Lausanne: screen, battery, camera, charging port and diagnostic at ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF_EN}/${modelSlug}/`,
      languages: {
        'fr-CH':     `${SITE_URL}${BASE_HREF_FR}/${modelSlug}/`,
        'en-CH':     `${SITE_URL}${BASE_HREF_EN}/${modelSlug}/`,
        'x-default': `${SITE_URL}${BASE_HREF_FR}/${modelSlug}/`,
      },
    },
    openGraph: {
      title:       `${model.label} Repair Lausanne — ClikClak`,
      description: `${model.label} repair prices in Lausanne. Screen, battery, camera and more. Quality parts, warranty included.`,
      url:         `${SITE_URL}${BASE_HREF_EN}/${modelSlug}/`,
      locale:      'en_CH',
      type:        'website',
    },
  }
}

export default async function EnSamsungModelPage({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params
  if (!allModels.find(m => m.id === modelSlug)) notFound()
  return (
    <RepairModelPage
      data={samsungBrandData}
      modelId={modelSlug}
      deviceType="smartphone"
      baseHref={BASE_HREF_EN}
      locale="en"
    />
  )
}
