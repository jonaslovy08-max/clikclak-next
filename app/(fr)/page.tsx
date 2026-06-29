import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import HomePageContent from '@/components/home/HomePageContent'

export const metadata: Metadata = {
  title: 'Réparation smartphone Lausanne, réparation iPhone, Samsung',
  description:
    'Votre smartphone est tombé, écran cassé ? Clik Clak Repair à Lausanne le répare, garantie 2 ans sur les pièces originales dès 29 CHF.',
  alternates: {
    canonical: `${SITE_URL}/`,
    languages: {
      'fr-CH':    `${SITE_URL}/`,
      'en-CH':    `${SITE_URL}/en/`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    title: 'Réparation smartphone Lausanne, réparation iPhone, Samsung',
    url: `${SITE_URL}/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function HomePage() {
  return <HomePageContent locale="fr" />
}
