import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Transfert de données Lausanne — Clik Clak Repair',
  description: 'Transfert de données à Lausanne, smartphone, tablette, ordinateur. Service rapide et sécurisé.',
  alternates: {
    canonical: `${SITE_URL}/services/transfert-donnees/`,
  },
  openGraph: {
    title: 'Transfert de données Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/services/transfert-donnees/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function TransfertDonneesPage() {
  return (
    <main>
      <h1>Transfert de données</h1>
      <p>Page en cours de construction. <Link href="/">Retour à l&apos;accueil</Link></p>
    </main>
  )
}
