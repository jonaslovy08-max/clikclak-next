import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { oppoBrandData } from '@/data/oppoRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation OPPO Lausanne | Prix écran, batterie | ClikClak',
  description:
    "Consultez les tarifs de réparation OPPO à Lausanne : écran, batterie, connecteur de charge et caméra pour Find X2, Find X3 et Reno chez ClikClak.",
  alternates: { canonical: `${SITE_URL}/services/reparation-oppo` },
  openGraph: {
    title: 'Réparation OPPO Lausanne — ClikClak',
    url: `${SITE_URL}/services/reparation-oppo`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationOppoPage() {
  return <RepairPricingPage data={oppoBrandData} />
}
