import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import PanierContent from '@/components/shop/PanierContent'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Panier — Shop ClikClak Lausanne',
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/shop-reparation-smartphone-lausanne/panier/` },
}

export default function PanierPage() {
  return (
    <>
      <Header />
      <main>
        <PanierContent />
      </main>
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
