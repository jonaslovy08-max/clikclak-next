import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { iphoneModels } from '@/data/iphoneRepairs'
import IphoneModelPage from '@/components/repair/IphoneModelPage'
import { SITE_URL } from '@/lib/seo'

export function generateStaticParams() {
  return iphoneModels.map(m => ({ modelSlug: m.id }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params
  const model = iphoneModels.find(m => m.id === modelSlug)
  if (!model) return {}
  return {
    title: `${model.label} Repair Lausanne | Screen, Battery | ClikClak`,
    description: `Check ${model.label} repair prices in Lausanne: screen, battery, camera, charging port and diagnostic at ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}/en/services/iphone-repair/${modelSlug}`,
      languages: {
        'fr-CH':     `${SITE_URL}/services/reparation-iphone/${modelSlug}`,
        'en-CH':     `${SITE_URL}/en/services/iphone-repair/${modelSlug}`,
        'x-default': `${SITE_URL}/services/reparation-iphone/${modelSlug}`,
      },
    },
    openGraph: {
      title: `${model.label} Repair Lausanne — ClikClak`,
      description: `${model.label} repair prices in Lausanne. Screen, battery, camera and more. Quality parts, warranty included.`,
      url: `${SITE_URL}/en/services/iphone-repair/${modelSlug}`,
      locale: 'en_CH',
      type: 'website',
    },
  }
}

export default async function EnIphoneModelPage({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params
  const model = iphoneModels.find(m => m.id === modelSlug)
  if (!model) notFound()
  return <IphoneModelPage modelSlug={modelSlug} locale="en" />
}
