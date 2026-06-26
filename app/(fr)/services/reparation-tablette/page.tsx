import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation tablette iPad Surface Pro Lausanne — Clik Clak',
  description: 'Réparation tablette à Lausanne : iPad, Surface Pro, Samsung Tab. Service express, pièces originales.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/services/reparation-tablette/`,
  },
  openGraph: {
    title: 'Réparation tablette iPad Surface Pro Lausanne — Clik Clak',
    url: `${SITE_URL}/services/reparation-tablette/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationTablPage() {
  return (
    <main>
      <h1>Réparation tablette</h1>
      <p>Page en cours de construction. <Link href="/">Retour à l&apos;accueil</Link></p>
    </main>
  )
}
