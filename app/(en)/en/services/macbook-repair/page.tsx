import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { macbookBrandData } from '@/data/macbookRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'MacBook Repair Lausanne | Screen, Battery, Keyboard | ClikClak',
  description:
    'Check MacBook repair prices in Lausanne: screen, battery, keyboard, trackpad, charging and diagnostic at ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/en/services/macbook-repair/`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-macbook/`,
      'en-CH':     `${SITE_URL}/en/services/macbook-repair/`,
      'x-default': `${SITE_URL}/services/reparation-macbook/`,
    },
  },
  openGraph: {
    title: 'MacBook Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/macbook-repair/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const macbookDataEn = {
  ...macbookBrandData,
  breadcrumbLabel:   'MacBook Repair Lausanne',
  breadcrumbHref:    '/en/express-computer-repair',
  repairNote:        'MacBook and iMac prices are indicative and may vary depending on the exact configuration, parts availability and the condition of the device. A diagnostic assessment may be required before the price can be confirmed.',
  searchPlaceholder: 'Search my MacBook…',
}

export default function EnMacBookRepairPage() {
  return <RepairPricingPage data={macbookDataEn} locale="en" />
}
