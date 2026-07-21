import type { Metadata } from 'next'

import SamsungRepairPage from '@/components/repair/SamsungRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Samsung Repair Lausanne — Clik Clak Repair',
  description:
    'Screen, battery, charging port — Clik Clak Repair in Lausanne fixes your Samsung Galaxy. Quality parts, 2-year warranty, express service.',
  alternates: {
    canonical: `${SITE_URL}/en/services/samsung-repair`,
    languages: {
      'fr-CH': `${SITE_URL}/services/reparation-samsung-lausanne`,
      'en-CH': `${SITE_URL}/en/services/samsung-repair`,
      'x-default': `${SITE_URL}/services/reparation-samsung-lausanne`,
    },
  },
  openGraph: {
    title: 'Samsung Repair Lausanne — Clik Clak Repair',
    description:
      'Screen, battery, charging port — we repair your Samsung Galaxy in Lausanne.',
    url: `${SITE_URL}/en/services/samsung-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnSamsungRepairPage() {
  return <SamsungRepairPage locale="en" />
}
