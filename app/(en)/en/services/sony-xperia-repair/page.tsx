import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { sonyXperiaBrandData } from '@/data/sonyXperiaRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sony Xperia Repair Lausanne | Screen, Battery Prices | ClikClak',
  description:
    'Check Sony Xperia repair prices in Lausanne: screen, battery, charging port and diagnostic at ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/en/services/sony-xperia-repair`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-sony-xperia`,
      'en-CH':     `${SITE_URL}/en/services/sony-xperia-repair`,
      'x-default': `${SITE_URL}/services/reparation-sony-xperia`,
    },
  },
  openGraph: {
    title: 'Sony Xperia Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/sony-xperia-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

const sonyDataEn = {
  ...sonyXperiaBrandData,
  breadcrumbLabel:   'Sony Xperia Repair Lausanne',
  breadcrumbHref:    '/en/services/smartphone-repair',
  repairNote:        'Sony Xperia prices are indicative and may vary depending on parts availability and the condition of the device.',
  searchPlaceholder: 'Search my Sony Xperia…',
}

export default function EnSonyXperiaRepairPage() {
  return <RepairPricingPage data={sonyDataEn} locale="en" />
}
