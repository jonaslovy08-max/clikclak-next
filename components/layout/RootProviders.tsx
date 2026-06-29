/*
  RootProviders — logique partagée entre les root layouts FR et EN.
  Ne contient pas <html> ni <body> — ces balises restent dans chaque layout.
  Utilisé par app/(fr)/layout.tsx et app/(en)/layout.tsx.
*/

import GoogleTags from '@/components/GoogleTags'
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
  /** Masquer le chatbot FR sur les pages anglaises (Phase 2 : traduire le chatbot) */
  showChatbot?:  boolean
}

export default function RootProviders({ children, showChatbot = true }: Props) {
  return (
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
        {showChatbot && <ChatbotWrapper />}
      </ChatbotProvider>
    </CartProvider>
  )
}
