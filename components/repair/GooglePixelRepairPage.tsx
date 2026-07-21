import { unstable_noStore as noStore } from 'next/cache'

import RecentShopProducts from '@/components/shop/RecentShopProducts'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { adaptPublicRepairBrand } from '@/lib/repair/publicBrandAdapter'
import { getPublicRepairBrand } from '@/lib/repair/publicCatalog'

type Props = {
  locale?: 'fr' | 'en'
}

export default async function GooglePixelRepairPage({
  locale = 'fr',
}: Props) {
  noStore()

  const brand = await getPublicRepairBrand('google')

  if (!brand) {
    return null
  }

  const data = adaptPublicRepairBrand(brand, { locale })

  return (
    <>
      <RepairPricingPage data={data} />
      <RecentShopProducts />
    </>
  )
}
