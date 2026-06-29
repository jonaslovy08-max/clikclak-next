import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import SellYourDevicePage from '@/components/pages/SellYourDevicePage'

export const metadata: Metadata = {
  title: 'Vendre smartphone, tablette, Mac et ordinateur Lausanne | ClikClak',
  description:
    'Vendez votre ancien smartphone, iPhone, Samsung, iPad, MacBook, iMac, ordinateur, Apple Watch ou AirPods à ClikClak Lausanne. Sélectionnez votre appareil, indiquez son état et recevez une offre rapide.',
  alternates: {
    canonical: `${SITE_URL}/services/rachat-de-votre-smartphone/`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/rachat-de-votre-smartphone/`,
      'en-CH':    `${SITE_URL}/en/services/sell-your-device/`,
      'x-default': `${SITE_URL}/services/rachat-de-votre-smartphone/`,
    },
  },
  openGraph: {
    title: 'Vendre smartphone, tablette, Mac et ordinateur Lausanne — ClikClak',
    description: 'Vendez votre ancien appareil à ClikClak Lausanne. Offre rapide selon modèle, état et potentiel de reconditionnement.',
    url: `${SITE_URL}/services/rachat-de-votre-smartphone/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function RachatSmartphonePage() {
  return <SellYourDevicePage locale="fr" />
}
