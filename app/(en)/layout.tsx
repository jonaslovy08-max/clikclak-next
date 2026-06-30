import type { Metadata } from 'next'
import { Rubik } from 'next/font/google'
import '../globals.css'
import RootProviders from '@/components/layout/RootProviders'

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-rubik',
  display: 'swap',
})

/*
  Favicon metadata — identical to app/(fr)/layout.tsx.
  Absolute paths from /public ensure consistent resolution
  regardless of route depth (/en vs /).
*/
export const metadata: Metadata = {
  metadataBase: new URL('https://clikclak.ch'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

/*
  Root layout ANGLAIS — route group (en).
  Produit nativement <html lang="en">.
  Aucun script client, aucun workaround.
  Le chatbot ClikClak est bilingue (FR/EN) — ChatbotWrapper détermine la
  locale depuis le pathname et l'affiche en anglais sur les routes /en.
*/
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={rubik.variable}>
        <RootProviders showChatbot locale="en">
          {children}
        </RootProviders>
      </body>
    </html>
  )
}
