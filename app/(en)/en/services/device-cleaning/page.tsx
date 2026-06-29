import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Device Cleaning Lausanne — ClikClak',
  description: 'Professional cleaning of your smartphone or computer in Lausanne.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/en/services/device-cleaning/`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/nettoyage/`,
      'en-CH':     `${SITE_URL}/en/services/device-cleaning/`,
      'x-default': `${SITE_URL}/services/nettoyage/`,
    },
  },
  openGraph: {
    title: 'Device Cleaning Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/device-cleaning/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnDeviceCleaningPage() {
  return (
    <main>
      <h1>Device Cleaning</h1>
      <p>Page coming soon. <Link href="/en">Back to home</Link></p>
    </main>
  )
}
