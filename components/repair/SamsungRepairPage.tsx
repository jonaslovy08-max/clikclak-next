import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'

import RepairPricingPage from '@/components/repair/RepairPricingPage'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import CrawlableModelIndex from '@/components/repair/CrawlableModelIndex'
import RepairBreadcrumbJsonLd from '@/components/seo/RepairBreadcrumbJsonLd'

import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'

type Props = {
  locale?: 'fr' | 'en'
}

export default async function SamsungRepairPage({
  locale = 'fr',
}: Props) {
  noStore()

  const brand = await getPublicRepairBrand('samsung')

  if (!brand) {
    notFound()
  }

  const data = adaptPublicRepairBrand(brand, { locale })

  if (data.families.length === 0) {
    notFound()
  }

  return (
    <RepairPricingPage
      data={data}
      locale={locale}
      bottomSlot={
        <>
          <RepairBreadcrumbJsonLd
            locale={locale}
            brandName={brand.name}
            brandPath={brand.public_base_path ?? ''}
          />
          <RecentShopProducts />
          <CrawlableModelIndex
            brandName={brand.name}
            families={brand.families}
            basePath={brand.public_base_path ?? ''}
            locale={locale}
          />
        </>
      }
    />
  )
}
