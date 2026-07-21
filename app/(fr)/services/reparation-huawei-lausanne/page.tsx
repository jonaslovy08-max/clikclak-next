import type { Metadata } from 'next'

import HuaweiRepairPage from '@/components/repair/HuaweiRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation Huawei Lausanne | Prix écran, batterie | ClikClak',
  description:
    "Consultez les tarifs de réparation Huawei à Lausanne : écran, batterie, connecteur de charge pour P30, P20, Mate 20, Honor et plus chez ClikClak.",
  alternates: {
    canonical: `${SITE_URL}/services/reparation-huawei-lausanne`,
  },
  openGraph: {
    title: 'Réparation Huawei Lausanne — ClikClak',
    url: `${SITE_URL}/services/reparation-huawei-lausanne`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationHuaweiPage() {
  return <HuaweiRepairPage locale="fr" />
}
