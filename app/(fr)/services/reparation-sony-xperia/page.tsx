import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { sonyXperiaBrandData } from '@/data/sonyXperiaRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation Sony Xperia Lausanne | Écran, batterie | ClikClak',
  description:
    'Réparation Sony Xperia à Lausanne : écran, batterie, connecteur de charge. Contactez ClikClak pour un devis selon votre modèle.',
  alternates: { canonical: `${SITE_URL}/services/reparation-sony-xperia/` },
  openGraph: {
    title: 'Réparation Sony Xperia Lausanne — ClikClak',
    url: `${SITE_URL}/services/reparation-sony-xperia/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationSonyXperiaPage() {
  return <RepairPricingPage data={sonyXperiaBrandData} />
}
