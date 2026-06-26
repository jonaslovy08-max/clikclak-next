import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { ipadBrandData } from '@/data/ipadRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation iPad Lausanne | Prix vitre, écran, batterie | ClikClak',
  description:
    'Consultez les tarifs de réparation iPad à Lausanne : vitre, écran, batterie, connecteur de charge et diagnostic chez ClikClak.',
  alternates: { canonical: `${SITE_URL}/services/reparation-ipad/` },
  openGraph: {
    title: 'Réparation iPad Lausanne — ClikClak',
    url: `${SITE_URL}/services/reparation-ipad/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationIpadPage() {
  return <RepairPricingPage data={ipadBrandData} />
}
