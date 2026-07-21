import { unstable_noStore as noStore } from 'next/cache'
import { notFound } from 'next/navigation'

import RepairPricingPage from '@/components/repair/RepairPricingPage'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import CrawlableModelIndex from '@/components/repair/CrawlableModelIndex'

import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'

type Props = {
  locale?: 'fr' | 'en'
}

export default async function HuaweiRepairPage({
  locale = 'fr',
}: Props) {
  noStore()

  const brand = await getPublicRepairBrand('huawei')

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
