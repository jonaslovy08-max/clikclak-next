import type { Metadata } from 'next'

import SonyXperiaRepairPage from '@/components/repair/SonyXperiaRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sony Xperia Repair Lausanne | Screen & Battery | ClikClak',
  description:
    'Sony Xperia repair in Lausanne: screen, battery, charging port and diagnostics. Fast service with warranty.',
  alternates: {
    canonical: `${SITE_URL}/en/services/sony-xperia-repair`,
  },
  openGraph: {
    title: 'Sony Xperia Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/sony-xperia-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function SonyXperiaRepairPageEN() {
  return <SonyXperiaRepairPage locale="en" />
}
