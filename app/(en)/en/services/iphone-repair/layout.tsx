import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'iPhone Repair Lausanne — Clik Clak Repair',
  description:
    'Cracked screen, dead battery? Clik Clak Repair in Lausanne fixes your iPhone. Original parts, 2-year warranty. From CHF 29.',
  alternates: {
    canonical: `${SITE_URL}/en/services/iphone-repair`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/reparation-iphone`,
      'en-CH':    `${SITE_URL}/en/services/iphone-repair`,
      'x-default': `${SITE_URL}/services/reparation-iphone`,
    },
  },
  openGraph: {
    title: 'iPhone Repair Lausanne — Clik Clak Repair',
    description: 'Cracked screen, dead battery? We fix your iPhone with original parts and a 2-year warranty.',
    url: `${SITE_URL}/en/services/iphone-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnIphoneLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
