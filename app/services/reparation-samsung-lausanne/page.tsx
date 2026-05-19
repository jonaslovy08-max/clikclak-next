import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { samsungBrandData } from '@/data/samsungRepairs'
import { SITE_URL } from '@/lib/seo'
import RecentShopProducts from '@/components/shop/RecentShopProducts'

export const metadata: Metadata = {
  title: 'Réparation Samsung Lausanne | Prix écran, batterie, caméra | ClikClak',
  description:
    'Consultez les prix de réparation Samsung à Lausanne : écran, batterie, face arrière, caméra, connecteur de charge et diagnostic chez ClikClak.',
  alternates: { canonical: `${SITE_URL}/services/reparation-samsung-lausanne/` },
  openGraph: {
    title: 'Réparation Samsung Lausanne — ClikClak',
    url: `${SITE_URL}/services/reparation-samsung-lausanne/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationSamsungPage() {
  return <RepairPricingPage data={samsungBrandData} bottomSlot={<RecentShopProducts />} />
}
