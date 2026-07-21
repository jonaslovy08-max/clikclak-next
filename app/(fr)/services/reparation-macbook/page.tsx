import type { Metadata } from 'next'

import MacbookRepairPage from '@/components/repair/MacbookRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation MacBook Lausanne | ClikClak',
  description:
    'Réparation MacBook à Lausanne : écran, batterie, clavier, connecteur de charge et diagnostic.',
  alternates: {
    canonical: `${SITE_URL}/services/reparation-macbook`,
  },
  openGraph: {
    title: 'Réparation MacBook Lausanne — ClikClak',
    description:
      'Réparation MacBook à Lausanne avec pièces de qualité et intervention rapide.',
    url: `${SITE_URL}/services/reparation-macbook`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function Page() {
  return <MacbookRepairPage locale="fr" />
}
