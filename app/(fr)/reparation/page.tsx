import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import RepairPageLayout from '@/components/repair/RepairPageLayout'
import ServiceSelector   from '@/components/home/ServiceSelector'

export const metadata: Metadata = {
  title: 'Réparation smartphone Lausanne — Clik Clak Repair',
  description: 'Réparation smartphone Lausanne, toutes marques, garantie 2 ans sur les pièces originales. Service express en 20 min. Petit-Chêne 9b.',
  alternates: {
    canonical: `${SITE_URL}/reparation/`,
  },
  openGraph: {
    title: 'Réparation smartphone Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/reparation/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationPage() {
  return (
    <RepairPageLayout>
      <ServiceSelector />
    </RepairPageLayout>
  )
}
