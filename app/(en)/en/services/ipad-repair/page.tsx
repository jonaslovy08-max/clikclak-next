import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { ipadBrandData } from '@/data/ipadRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'iPad Repair Lausanne | Screen, Battery Prices | ClikClak',
  description:
    'Check iPad repair prices in Lausanne: glass, screen, battery, charging port and diagnostic at ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/en/services/ipad-repair`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-ipad`,
      'en-CH':     `${SITE_URL}/en/services/ipad-repair`,
      'x-default': `${SITE_URL}/services/reparation-ipad`,
    },
  },
  openGraph: {
    title: 'iPad Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/ipad-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

const ipadDataEn = {
  ...ipadBrandData,
  breadcrumbLabel:   'iPad Repair Lausanne',
  breadcrumbHref:    '/en/express-tablet-repair',
  repairNote:        'Prices are indicative and may vary depending on the device condition and parts availability. A diagnostic is carried out before any intervention.',
  searchPlaceholder: 'Search my iPad…',
}

export default function EnIpadRepairPage() {
  return <RepairPricingPage data={ipadDataEn} locale="en" />
}
