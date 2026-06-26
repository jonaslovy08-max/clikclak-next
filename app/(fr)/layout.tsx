import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import { Rubik } from 'next/font/google'
import '../globals.css'
import RootProviders from '@/components/layout/RootProviders'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-rubik',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Réparation smartphone Lausanne — Clik Clak Repair',
    template: '%s — Clik Clak Repair',
  },
  description:
    'Réparation smartphone, iPhone, Samsung, MacBook à Lausanne. Pièces originales, garantie 2 ans, service express en 20 min.',
  metadataBase: new URL('https://clikclak.ch'),
  openGraph: {
    siteName: 'Clik Clak Repair',
    locale: 'fr_CH',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE],
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
}

/*
  Root layout FRANÇAIS — route group (fr).
  Produit nativement <html lang="fr">.
  Pas de headers(), pas de script client, pas de workaround.
  Routes publiques et admin sous ce groupe.
*/
export default function FrLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={rubik.variable}>
        <RootProviders showChatbot>
          {children}
        </RootProviders>
      </body>
    </html>
  )
}
