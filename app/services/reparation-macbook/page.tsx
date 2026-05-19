import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { macbookBrandData } from '@/data/macbookRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation MacBook Lausanne | Prix écran, batterie, clavier | ClikClak',
  description:
    "Consultez les tarifs indicatifs de réparation MacBook à Lausanne : écran, batterie, clavier, trackpad, charge, surchauffe, récupération de données et dégâts d'eau chez ClikClak.",
  alternates: { canonical: `${SITE_URL}/services/reparation-macbook/` },
  openGraph: {
    title: 'Réparation MacBook Lausanne — ClikClak',
    url: `${SITE_URL}/services/reparation-macbook/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationMacbookPage() {
  return <RepairPricingPage data={macbookBrandData} />
}
