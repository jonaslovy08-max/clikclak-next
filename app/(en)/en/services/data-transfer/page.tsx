import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Data Transfer Lausanne — ClikClak',
  description: 'Data transfer in Lausanne: smartphone, tablet, computer. Fast and secure service.',
  alternates: {
    canonical: `${SITE_URL}/en/services/data-transfer/`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/transfert-donnees/`,
      'en-CH':     `${SITE_URL}/en/services/data-transfer/`,
      'x-default': `${SITE_URL}/services/transfert-donnees/`,
    },
  },
  openGraph: {
    title: 'Data Transfer Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/data-transfer/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnDataTransferPage() {
  return (
    <main>
      <h1>Data Transfer</h1>
      <p>Page coming soon. <Link href="/en/services/data-recovery">See data recovery & transfer</Link></p>
    </main>
  )
}
