import type { Metadata } from 'next'

import SamsungRepairPage from '@/components/repair/SamsungRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation Samsung Lausanne — Clik Clak Repair',
  description:
    'Écran, batterie, connecteur de charge — Clik Clak Repair à Lausanne répare votre Samsung Galaxy. Pièces de qualité, garantie 2 ans, service express.',
  alternates: {
    canonical: `${SITE_URL}/services/reparation-samsung-lausanne`,
    languages: {
      'fr-CH': `${SITE_URL}/services/reparation-samsung-lausanne`,
      'en-CH': `${SITE_URL}/en/services/samsung-repair`,
      'x-default': `${SITE_URL}/services/reparation-samsung-lausanne`,
    },
  },
  openGraph: {
    title: 'Réparation Samsung Lausanne — Clik Clak Repair',
    description:
      'Écran, batterie, connecteur de charge — nous réparons votre Samsung Galaxy à Lausanne.',
    url: `${SITE_URL}/services/reparation-samsung-lausanne`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationSamsungPage() {
  return <SamsungRepairPage locale="fr" />
}
