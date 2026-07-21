import type { Metadata } from 'next'

import OppoRepairPage from '@/components/repair/OppoRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'OPPO Repair Lausanne | Screen & Battery Replacement | ClikClak',
  description:
    'Check OPPO repair prices in Lausanne for screen, battery, charging port and camera. Fast service with warranty.',
  alternates: {
    canonical: `${SITE_URL}/en/services/oppo-repair`,
  },
  openGraph: {
    title: 'OPPO Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/oppo-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function OppoRepairPageEN() {
  return <OppoRepairPage locale="en" />
}
