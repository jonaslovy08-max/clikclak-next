import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Page introuvable</h1>
      <p>La page que vous recherchez n&apos;existe pas ou a été déplacée.</p>
      <Link href="/">← Retour à l&apos;accueil</Link>
    </main>
  )
}
