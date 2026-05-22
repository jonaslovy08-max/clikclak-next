import type { Metadata } from 'next'
import { DEFAULT_OG_IMAGE } from '@/lib/seo'
import { Rubik } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/ui/CustomCursor'
import AppHeight from '@/components/ui/AppHeight'
import GoogleTags from '@/components/GoogleTags'
import CookieConsent from '@/components/CookieConsent'
import Preloader from '@/components/Preloader'
import PageTransitionWrapper from '@/components/PageTransitionWrapper'
import SmoothAnchorLinks from '@/components/ui/SmoothAnchorLinks'
import GlobalFloatingActions from '@/components/layout/GlobalFloatingActions'
import { CartProvider } from '@/components/shop/CartContext'
import { ChatbotProvider } from '@/components/chatbot/ChatbotContext'
import ClikClakAssistant from '@/components/chatbot/ClikClakAssistant'

// Rubik chargée via next/font/google — jamais via <link> manuel (CLAUDE.md)
// Poids complets pour tous les usages du design system
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={rubik.variable}>
        <CartProvider>
          <ChatbotProvider>
            <GoogleTags />
            <Preloader />
            <SmoothAnchorLinks />
            <AppHeight />
            <CustomCursor />
            <PageTransitionWrapper>
              {children}
            </PageTransitionWrapper>
            <CookieConsent />
            <GlobalFloatingActions />
            <ClikClakAssistant />
          </ChatbotProvider>
        </CartProvider>
      </body>
    </html>
  )
}
