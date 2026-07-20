import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import PanierContent from '@/components/shop/PanierContent'
import { Button } from '@/components/ui/Button'
import { SITE_URL } from '@/lib/seo'
import { SHOP_ENABLED } from '@/lib/config/features'

export const metadata: Metadata = SHOP_ENABLED ? {
  title: 'Panier — Shop ClikClak Lausanne',
  robots: { index: false },
  alternates: { canonical: `${SITE_URL}/shop-reparation-smartphone-lausanne/panier` },
} : {
  title: 'Boutique en construction | ClikClak',
  robots: { index: false, follow: true },
}

export default function PanierPage() {
  if (!SHOP_ENABLED) {
    return (
      <>
        <Header />
        <main>
          <section className="px-6 md:px-14 lg:px-20 py-24 border-t border-white/10">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Boutique en construction
              </h1>
              <p className="font-light" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.65)' }}>
                La boutique ClikClak sera bientôt disponible.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button href="/shop-reparation-smartphone-lausanne" variant="secondary">
                  ← Retour
                </Button>
                <Button href="/contact-clik-clak-lausanne" variant="ghost">
                  Nous contacter
                </Button>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
        <SectionPinning />
      </>
    )
  }

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
