import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import RepairModelPage from '@/components/repair/RepairModelPage'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'

const BASE_HREF_EN = '/en/services/samsung-repair'
const BASE_HREF_FR = '/services/reparation-samsung-lausanne'

type PageProps = {
  params: Promise<{ modelSlug: string }>
}

export async function generateStaticParams() {
  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    return []
  }

  return brand.families.flatMap((family) =>
    family.models.map((model) => ({
      modelSlug: model.slug,
    }))
  )
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { modelSlug } = await params
  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    return {}
  }

  const model = brand.families
    .flatMap((family) => family.models)
    .find(
      (candidate) =>
        candidate.slug === modelSlug ||
        candidate.legacy_slug === modelSlug
    )

  if (!model) {
    return {}
  }

  const canonicalPath = `${BASE_HREF_EN}/${model.slug}`

  return {
    title: `${model.name} Repair Lausanne | Screen, Battery | ClikClak`,
    description: `Check ${model.name} repair prices in Lausanne: screen, battery, camera, charging port and diagnostic at ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}${canonicalPath}`,
      languages: {
        'fr-CH': `${SITE_URL}${BASE_HREF_FR}/${model.slug}`,
        'en-CH': `${SITE_URL}${canonicalPath}`,
        'x-default': `${SITE_URL}${BASE_HREF_FR}/${model.slug}`,
      },
    },
    openGraph: {
      title: `${model.name} Repair Lausanne — ClikClak`,
      description: `${model.name} repair prices in Lausanne. Screen, battery, camera and more. Quality parts, warranty included.`,
      url: `${SITE_URL}${canonicalPath}`,
      locale: 'en_CH',
      type: 'website',
    },
  }
}

export default async function EnSamsungModelPage({
  params,
}: PageProps) {
  const { modelSlug } = await params
  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    notFound()
  }

  const model = brand.families
    .flatMap((family) => family.models)
    .find(
      (candidate) =>
        candidate.slug === modelSlug ||
        candidate.legacy_slug === modelSlug
    )

  if (!model) {
    notFound()
  }

  const data = adaptPublicRepairBrand(brand, {
    locale: 'en',
    overrides: {
      h1Prefix: 'Samsung',
      h1Brand: 'Samsung',
      breadcrumbLabel: 'Samsung Repair Lausanne',
      breadcrumbHref: '/en/services/smartphone-repair',
      repairNote:
        'Most Samsung repairs are carried out in-store in Lausanne. Turnaround depends on parts availability.',
      searchPlaceholder: 'Search my Samsung…',
    },
  })

  return (
    <RepairModelPage
      data={data}
      modelId={model.slug}
      deviceType="smartphone"
      baseHref={BASE_HREF_EN}
      locale="en"
    />
  )
}
