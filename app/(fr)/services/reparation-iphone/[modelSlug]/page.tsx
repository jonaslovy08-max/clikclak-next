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
  const canonicalUrl =
    `${SITE_URL}/services/reparation-iphone/${canonicalSlug}`
  const englishUrl =
    `${SITE_URL}/en/services/iphone-repair/${canonicalSlug}`

  return {
    title:
      `Réparation ${model.name} Lausanne | Prix écran, batterie | ClikClak`,
    description:
      `Consultez les prix de réparation pour ${model.name} à Lausanne : écran, batterie, caméra, connecteur de charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        'fr-CH': canonicalUrl,
        'en-CH': englishUrl,
        'x-default': canonicalUrl,
      },
    },
    openGraph: {
      title: `Réparation ${model.name} Lausanne — ClikClak`,
      description:
        `Prix de réparation ${model.name} à Lausanne. Écran, batterie, caméra et plus. Pièces de qualité, garantie incluse.`,
      url: canonicalUrl,
      locale: 'fr_CH',
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
      locale="fr"
    />
  )
}
