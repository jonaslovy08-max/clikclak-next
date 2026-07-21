import { unstable_noStore as noStore } from 'next/cache'

import RecentShopProducts from '@/components/shop/RecentShopProducts'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import CrawlableModelIndex from '@/components/repair/CrawlableModelIndex'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'

type Props = {
  locale?: 'fr' | 'en'
}

export default async function MacbookRepairPage({
  locale = 'fr',
}: Props) {
  noStore()

  const brand = await getPublicRepairBrand('macbook')

  if (!brand) {
    return null
  }

  const data = adaptPublicRepairBrand(brand, { locale })

  return (
    <>
      <RepairPricingPage
        data={data}
        locale={locale}
        bottomSlot={
          <CrawlableModelIndex
            brandName={brand.name}
            families={brand.families}
            basePath={brand.public_base_path ?? ''}
            locale={locale}
          />
        }
      />
      <RecentShopProducts />
    </>
  )
}
