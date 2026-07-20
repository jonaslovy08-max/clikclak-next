import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Tablet Repair Lausanne — ClikClak',
  description: 'Tablet repair in Lausanne. Diagnostic and quote on request.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/en/services/tablet-repair`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-tablette`,
      'en-CH':     `${SITE_URL}/en/services/tablet-repair`,
      'x-default': `${SITE_URL}/services/reparation-tablette`,
    },
  },
}

export default function EnTabletRepairPage() {
  return (
    <main>
      <h1>Tablet Repair</h1>
      <p>Page coming soon. <Link href="/en/express-tablet-repair">View tablet repair options</Link></p>
    </main>
  )
}
