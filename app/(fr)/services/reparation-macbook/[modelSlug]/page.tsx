import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { macbookBrandData } from '@/data/macbookRepairs'
import RepairModelPage from '@/components/repair/RepairModelPage'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF = '/services/reparation-macbook'

const allModels = macbookBrandData.families.flatMap(f => f.models)

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
    title:       `Réparation ${model.label} Lausanne | Prix écran, batterie | ClikClak`,
    description: `Consultez les prix de réparation ${model.label} à Lausanne : écran, batterie, clavier, trackpad, charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}${BASE_HREF}/${modelSlug}`,
      languages: {
        'fr-CH':     `${SITE_URL}${BASE_HREF}/${modelSlug}`,
        'en-CH':     `${SITE_URL}/en/services/macbook-repair/${modelSlug}`,
        'x-default': `${SITE_URL}${BASE_HREF}/${modelSlug}`,
      },
    },
    openGraph: {
      title:       `Réparation ${model.label} Lausanne — ClikClak`,
      description: `Prix de réparation ${model.label} à Lausanne. Écran, batterie, clavier, trackpad et plus. Devis clair, garantie incluse.`,
      url:         `${SITE_URL}${BASE_HREF}/${modelSlug}`,
      locale:      'fr_CH',
      type:        'website',
    },
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params
  if (!allModels.find(m => m.id === modelSlug)) notFound()
  return (
    <RepairModelPage
      data={macbookBrandData}
      modelId={modelSlug}
      deviceType="laptop"
      baseHref={BASE_HREF}
    />
  )
}
