import type { Metadata } from 'next'
import { SITE_URL, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo'
import HomePageContent from '@/components/home/HomePageContent'

const TITLE = 'Smartphone Repair Lausanne — Clik Clak Repair'
const DESCRIPTION = 'Screen cracked? We fix your smartphone with a 2-year warranty from CHF 29.'

export const metadata: Metadata = {
  title: TITLE,
  description:
    'Screen cracked? Clik Clak Repair in Lausanne fixes your smartphone, iPhone, Samsung, MacBook. 2-year warranty on original parts from CHF 29.',
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      'fr-CH':    `${SITE_URL}/`,
      'en-CH':    `${SITE_URL}/en`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    url: `${SITE_URL}/en`,
    locale: 'en_CH',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: TITLE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function EnHomePage() {
  return <HomePageContent locale="en" />
}
