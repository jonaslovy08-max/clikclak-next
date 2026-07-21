import type { Metadata } from 'next'

import GooglePixelRepairPage from '@/components/repair/GooglePixelRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation Google Pixel Lausanne | Clik Clak Repair',
  description:
    'Réparation Google Pixel à Lausanne avec pièces de qualité, diagnostic et intervention rapide.',
  alternates: {
    canonical: `${SITE_URL}/services/reparation-google-pixel`,
  },
  openGraph: {
    title: 'Réparation Google Pixel Lausanne | Clik Clak Repair',
    description:
      'Réparation Google Pixel à Lausanne avec pièces de qualité, diagnostic et intervention rapide.',
    url: `${SITE_URL}/services/reparation-google-pixel`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function Page() {
  return <GooglePixelRepairPage locale="fr" />
}
