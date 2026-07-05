/*
  RootProviders — logique partagée entre les root layouts FR et EN.
  Ne contient pas <html> ni <body> — ces balises restent dans chaque layout.
  Utilisé par app/(fr)/layout.tsx et app/(en)/layout.tsx.
  GoogleTags + GaNavTracker : chargés une seule fois ici, partagés FR/EN.
*/

import GoogleTags from '@/components/GoogleTags'
import GaNavTracker from '@/components/GaNavTracker'
import CookieConsent from '@/components/CookieConsent'
import Preloader from '@/components/Preloader'
import PageTransitionWrapper from '@/components/PageTransitionWrapper'
import SmoothAnchorLinks from '@/components/ui/SmoothAnchorLinks'
import GlobalFloatingActions from '@/components/layout/GlobalFloatingActions'
import AppHeight from '@/components/ui/AppHeight'
import CustomCursor from '@/components/ui/CustomCursor'
import { CartProvider } from '@/components/shop/CartContext'
import { ChatbotProvider } from '@/components/chatbot/ChatbotContext'
import ChatbotWrapper from '@/components/chatbot/ChatbotWrapper'

interface Props {
  children:      React.ReactNode
  /** Active le chatbot ClikClak (bilingue FR/EN — locale dérivée du pathname par ChatbotWrapper) */
  showChatbot?:  boolean
  locale?:       'fr' | 'en'
}

export default function RootProviders({ children, showChatbot = true, locale = 'fr' }: Props) {
  return (
    <CartProvider>
      <ChatbotProvider>
        <GoogleTags />
        <GaNavTracker />
        <Preloader />
        <SmoothAnchorLinks />
        <AppHeight />
        <CustomCursor />
        <PageTransitionWrapper>
          {children}
        </PageTransitionWrapper>
        <CookieConsent locale={locale} />
        <GlobalFloatingActions />
        {showChatbot && <ChatbotWrapper />}
      </ChatbotProvider>
    </CartProvider>
  )
}
