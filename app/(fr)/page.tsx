import type { Metadata } from 'next'
import { SITE_URL, DEFAULT_OG_IMAGE, SITE_NAME } from '@/lib/seo'
import HomePageContent from '@/components/home/HomePageContent'

const TITLE = 'Réparation smartphone Lausanne, réparation iPhone, Samsung'
const DESCRIPTION =
  'Votre smartphone est tombé, écran cassé ? Clik Clak Repair à Lausanne le répare, garantie 2 ans sur les pièces originales dès 29 CHF.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      'fr-CH':    `${SITE_URL}/`,
      'en-CH':    `${SITE_URL}/en/`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    url: `${SITE_URL}/`,
    locale: 'fr_CH',
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

export default function HomePage() {
  return <HomePageContent locale="fr" />
}
