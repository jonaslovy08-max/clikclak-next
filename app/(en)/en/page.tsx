import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import HomePageContent from '@/components/home/HomePageContent'

export const metadata: Metadata = {
  title: 'Smartphone Repair Lausanne — Clik Clak Repair',
  description:
    'Screen cracked? Clik Clak Repair in Lausanne fixes your smartphone, iPhone, Samsung, MacBook. 2-year warranty on original parts from CHF 29.',
  alternates: {
    canonical: `${SITE_URL}/en/`,
    languages: {
      'fr-CH':    `${SITE_URL}/`,
      'en-CH':    `${SITE_URL}/en/`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    title: 'Smartphone Repair Lausanne — Clik Clak Repair',
    description: 'Screen cracked? We fix your smartphone with a 2-year warranty from CHF 29.',
    url: `${SITE_URL}/en/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnHomePage() {
  return <HomePageContent locale="en" />
}
