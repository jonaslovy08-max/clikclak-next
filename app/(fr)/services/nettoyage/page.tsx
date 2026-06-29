import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Nettoyage smartphone et ordinateur Lausanne — Clik Clak',
  description: 'Nettoyage complet de vos appareils à Lausanne. Garantit le bon fonctionnement de votre smartphone ou ordinateur portable.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/services/nettoyage/`,
  },
  openGraph: {
    title: 'Nettoyage smartphone et ordinateur Lausanne — Clik Clak',
    url: `${SITE_URL}/services/nettoyage/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function NettoyagePage() {
  return (
    <main>
      <h1>Nettoyage</h1>
      <p>Page en cours de construction. <Link href="/">Retour à l&apos;accueil</Link></p>
    </main>
  )
}
