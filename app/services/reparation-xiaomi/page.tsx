import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation Xiaomi Lausanne — Clik Clak Repair',
  description: 'Réparation smartphone Xiaomi à Lausanne. Service express, pièces de qualité, technicien certifié.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/services/reparation-xiaomi/`,
  },
  openGraph: {
    title: 'Réparation Xiaomi Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/services/reparation-xiaomi/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationXiaomiPage() {
  return (
    <main>
      <h1>Réparation Xiaomi</h1>
      <p>Page en cours de construction. <Link href="/">Retour à l&apos;accueil</Link></p>
    </main>
  )
}
