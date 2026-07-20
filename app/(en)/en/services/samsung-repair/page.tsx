import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { samsungBrandData } from '@/data/samsungRepairs'
import { SITE_URL } from '@/lib/seo'
import RecentShopProducts from '@/components/shop/RecentShopProducts'

export const metadata: Metadata = {
  title: 'Samsung Repair Lausanne — Clik Clak Repair',
  description:
    'Screen, battery, charging port — Clik Clak Repair in Lausanne fixes your Samsung Galaxy. Original parts, 2-year warranty. Express service.',
  alternates: {
    canonical: `${SITE_URL}/en/services/samsung-repair`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/reparation-samsung-lausanne`,
      'en-CH':    `${SITE_URL}/en/services/samsung-repair`,
      'x-default': `${SITE_URL}/services/reparation-samsung-lausanne`,
    },
  },
  openGraph: {
    title: 'Samsung Repair Lausanne — Clik Clak Repair',
    description: 'Screen, battery, charging port — we fix your Samsung Galaxy with original parts.',
    url: `${SITE_URL}/en/services/samsung-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

const samsungDataEn = {
  ...samsungBrandData,
  h1Prefix:          'Samsung',
  breadcrumbLabel:   'Samsung Repair Lausanne',
  breadcrumbHref:    '/en/services/smartphone-repair',
  repairNote:        'Most Samsung repairs are carried out in-store in Lausanne. Turnaround depends on parts availability.',
  searchPlaceholder: 'Search my Samsung…',
}

export default function EnSamsungRepairPage() {
  return (
    <RepairPricingPage
      data={samsungDataEn}
      bottomSlot={<RecentShopProducts />}
      locale="en"
    />
  )
}
