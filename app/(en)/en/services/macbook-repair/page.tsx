import type { Metadata } from 'next'

import MacbookRepairPage from '@/components/repair/MacbookRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'MacBook Repair Lausanne | ClikClak',
  description:
    'Professional MacBook repair in Lausanne. Screen, battery, keyboard, charging port and diagnostics.',
  alternates: {
    canonical: `${SITE_URL}/en/services/macbook-repair`,
    languages: {
      'fr-CH': `${SITE_URL}/services/reparation-macbook`,
      'en-CH': `${SITE_URL}/en/services/macbook-repair`,
      'x-default': `${SITE_URL}/services/reparation-macbook`,
    },
  },
  openGraph: {
    title: 'MacBook Repair Lausanne — ClikClak',
    description:
      'Professional MacBook repair in Lausanne with quality parts and fast turnaround.',
    url: `${SITE_URL}/en/services/macbook-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function Page() {
  return <MacbookRepairPage locale="en" />
}
