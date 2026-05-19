import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Clik Clak Repair Lausanne — À propos',
  description: 'Clik Clak Repair, votre spécialiste réparation smartphone à Lausanne, Petit-Chêne 9b. Techniciens certifiés, garantie 2 ans.',
  alternates: {
    canonical: `${SITE_URL}/clik-clak-repair-lausanne/`,
  },
  openGraph: {
    title: 'Clik Clak Repair Lausanne — À propos',
    url: `${SITE_URL}/clik-clak-repair-lausanne/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function AProposPage() {
  return (
    <main>
      <h1>Clik Clak Repair Lausanne</h1>
      <p>Page en cours de construction. <Link href="/">Retour à l&apos;accueil</Link></p>
    </main>
  )
}
