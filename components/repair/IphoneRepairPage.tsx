import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'

import IphoneRepairPageClient from '@/components/repair/IphoneRepairPageClient'
import CrawlableModelIndex from '@/components/repair/CrawlableModelIndex'
import RepairBreadcrumbJsonLd from '@/components/seo/RepairBreadcrumbJsonLd'
import { adaptIphonePublicCatalog } from '@/lib/repair/iphonePublicAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'

type Props = {
  locale?: 'fr' | 'en'
}

export default async function IphoneRepairPage({
  locale = 'fr',
}: Props) {
  noStore()

  const brand = await getPublicRepairBrand('iphone')

  if (!brand) {
    notFound()
  }

  const {
    iphoneModels,
    generations,
  } = adaptIphonePublicCatalog(brand)

  if (
    iphoneModels.length === 0 ||
    generations.length === 0
  ) {
    notFound()
  }

  return (
    <>
      <RepairBreadcrumbJsonLd
        locale={locale}
        brandName={brand.name}
        brandPath={brand.public_base_path ?? ''}
      />
      <IphoneRepairPageClient
        locale={locale}
        iphoneModels={iphoneModels}
        generations={generations}
        bottomSlot={
          <CrawlableModelIndex
            brandName={brand.name}
            families={brand.families}
            basePath={brand.public_base_path ?? ''}
            locale={locale}
          />
        }
      />
    </>
  )
}
