import type { Metadata } from 'next'

import IpadRepairPage from '@/components/repair/IpadRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation iPad Lausanne | Prix vitre, écran, batterie | ClikClak',
  description:
    'Consultez les tarifs de réparation iPad à Lausanne : vitre, écran, batterie, connecteur de charge et diagnostic chez ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/services/reparation-ipad`,
  },
  openGraph: {
    title: 'Réparation iPad Lausanne — ClikClak',
    description:
      'Réparation iPad à Lausanne avec pièces de qualité et intervention rapide.',
    url: `${SITE_URL}/services/reparation-ipad`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function Page() {
  return <IpadRepairPage locale="fr" />
}
