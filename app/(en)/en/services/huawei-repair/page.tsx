import type { Metadata } from 'next'
import RepairPricingPage from '@/components/repair/RepairPricingPage'
import { huaweiBrandData } from '@/data/huaweiRepairs'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Huawei Repair Lausanne | Screen, Battery Prices | ClikClak',
  description:
    'Check Huawei repair prices in Lausanne: screen, battery, charging port for P30, P20, Mate 20, Honor and more at ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/en/services/huawei-repair`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-huawei-lausanne`,
      'en-CH':     `${SITE_URL}/en/services/huawei-repair`,
      'x-default': `${SITE_URL}/services/reparation-huawei-lausanne`,
    },
  },
  openGraph: {
    title: 'Huawei Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/huawei-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

const huaweiDataEn = {
  ...huaweiBrandData,
  breadcrumbLabel:   'Huawei Repair Lausanne',
  breadcrumbHref:    '/en/services/smartphone-repair',
  repairNote:        'Huawei repair in Lausanne. Contact us for any unlisted model or for a diagnostic.',
  searchPlaceholder: 'Search my Huawei…',
}

export default function EnHuaweiRepairPage() {
  return <RepairPricingPage data={huaweiDataEn} locale="en" />
}
