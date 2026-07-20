import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation Google Pixel Lausanne — Clik Clak Repair',
  description: 'Réparation smartphone Google Pixel à Lausanne, service express. Clik Clak Repair, Petit-Chêne 9b.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/services/reparation-google-pixel`,
  },
  openGraph: {
    title: 'Réparation Google Pixel Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/services/reparation-google-pixel`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationGooglePixelPage() {
  return (
    <main>
      <h1>Réparation Google Pixel</h1>
      <p>Page en cours de construction. <Link href="/">Retour à l&apos;accueil</Link></p>
    </main>
  )
}
