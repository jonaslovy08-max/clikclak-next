import type { Metadata } from 'next'

import IpadRepairPage from '@/components/repair/IpadRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'iPad Repair Lausanne | Screen, Battery Prices | ClikClak',
  description:
    'Professional iPad repair in Lausanne. Screen, glass, battery, charging port and diagnostic.',
  alternates: {
    canonical: `${SITE_URL}/en/services/ipad-repair`,
    languages: {
      'fr-CH': `${SITE_URL}/services/reparation-ipad`,
      'en-CH': `${SITE_URL}/en/services/ipad-repair`,
      'x-default': `${SITE_URL}/services/reparation-ipad`,
    },
  },
  openGraph: {
    title: 'iPad Repair Lausanne — ClikClak',
    description:
      'Professional iPad repair in Lausanne with quality parts and fast turnaround.',
    url: `${SITE_URL}/en/services/ipad-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function Page() {
  return <IpadRepairPage locale="en" />
}
