import type { Metadata } from 'next'

import HuaweiRepairPage from '@/components/repair/HuaweiRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Huawei Repair Lausanne | Screen & Battery Replacement | ClikClak',
  description:
    'Check Huawei repair prices in Lausanne for screen, battery, charging port and more. Fast service with warranty.',
  alternates: {
    canonical: `${SITE_URL}/en/services/huawei-repair`,
  },
  openGraph: {
    title: 'Huawei Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/huawei-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function HuaweiRepairPageEN() {
  return <HuaweiRepairPage locale="en" />
}
