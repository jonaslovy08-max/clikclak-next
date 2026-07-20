import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { oppoBrandData } from '@/data/oppoRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'OPPO Repair Lausanne | Screen, Battery Prices | ClikClak',
  description:
    'Check OPPO repair prices in Lausanne: screen, battery, charging port and diagnostic at ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/en/services/oppo-repair`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-oppo`,
      'en-CH':     `${SITE_URL}/en/services/oppo-repair`,
      'x-default': `${SITE_URL}/services/reparation-oppo`,
    },
  },
  openGraph: {
    title: 'OPPO Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/oppo-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

const oppoDataEn = {
  ...oppoBrandData,
  breadcrumbLabel:   'OPPO Repair Lausanne',
  breadcrumbHref:    '/en/services/smartphone-repair',
  repairNote:        'OPPO repair in Lausanne. Contact us for any unlisted model or for a diagnostic.',
  searchPlaceholder: 'Search my OPPO…',
}

export default function EnOppoRepairPage() {
  return <RepairPricingPage data={oppoDataEn} locale="en" />
}
