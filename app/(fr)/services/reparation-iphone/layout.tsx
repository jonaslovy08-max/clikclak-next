import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation iPhone rapide à Lausanne — Clik Clak Repair',
  description: "Découvrez la réparation iPhone rapide et efficace à Lausanne. La plupart des réparations s'effectuent en environ 20 minutes.",
  alternates: {
    canonical: `${SITE_URL}/services/reparation-iphone/`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/reparation-iphone/`,
      'en-CH':    `${SITE_URL}/en/services/iphone-repair/`,
      'x-default': `${SITE_URL}/services/reparation-iphone/`,
    },
  },
  openGraph: {
    title: 'Réparation iPhone rapide à Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/services/reparation-iphone/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationIphoneLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
