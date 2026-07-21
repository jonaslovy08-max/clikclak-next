import type { Metadata } from 'next'

import GooglePixelRepairPage from '@/components/repair/GooglePixelRepairPage'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Google Pixel Repair Lausanne | Clik Clak Repair',
  description:
    'Fast Google Pixel repair in Lausanne with quality parts and professional service.',
  alternates: {
    canonical: `${SITE_URL}/en/services/google-pixel-repair`,
  },
  openGraph: {
    title: 'Google Pixel Repair Lausanne | Clik Clak Repair',
    description:
      'Fast Google Pixel repair in Lausanne with quality parts and professional service.',
    url: `${SITE_URL}/en/services/google-pixel-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function Page() {
  return <GooglePixelRepairPage locale="en" />
}
