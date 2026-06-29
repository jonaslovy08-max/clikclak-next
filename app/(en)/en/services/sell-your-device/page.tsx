import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import SellYourDevicePage from '@/components/pages/SellYourDevicePage'

export const metadata: Metadata = {
  title: 'Sell Your Smartphone — Clik Clak Repair Lausanne',
  description:
    'Sell your iPhone, Samsung or other smartphone to Clik Clak Repair in Lausanne. Instant quote, immediate payment.',
  alternates: {
    canonical: `${SITE_URL}/en/services/sell-your-device/`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/rachat-de-votre-smartphone/`,
      'en-CH':    `${SITE_URL}/en/services/sell-your-device/`,
      'x-default': `${SITE_URL}/services/rachat-de-votre-smartphone/`,
    },
  },
  openGraph: {
    title: 'Sell Your Smartphone — Clik Clak Repair Lausanne',
    description: 'Sell your iPhone or Samsung to Clik Clak Repair. Instant quote and immediate payment.',
    url: `${SITE_URL}/en/services/sell-your-device/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnSellYourDevicePage() {
  return <SellYourDevicePage locale="en" />
}
