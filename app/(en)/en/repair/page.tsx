import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import RepairEngagements from '@/components/repair/RepairEngagements'
import ServiceSelector from '@/components/home/ServiceSelector'

export const metadata: Metadata = {
  title: 'Smartphone Repair Lausanne — Clik Clak Repair',
  description: 'Smartphone repair in Lausanne, all brands. Express service in 20 minutes. Quality parts and warranty included.',
  alternates: {
    canonical: `${SITE_URL}/en/repair/`,
    languages: {
      'fr-CH':     `${SITE_URL}/reparation/`,
      'en-CH':     `${SITE_URL}/en/repair/`,
      'x-default': `${SITE_URL}/reparation/`,
    },
  },
  openGraph: {
    title: 'Smartphone Repair Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/en/repair/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnRepairPage() {
  return (
    <>
      <Header locale="en" />
      <main>
        <ServiceSelector locale="en" />
      </main>
      <RepairEngagements locale="en" />
      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
