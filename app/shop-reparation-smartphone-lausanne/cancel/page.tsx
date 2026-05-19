import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Paiement annulé — Shop ClikClak',
  robots: { index: false },
}

export default function CancelPage() {
  return (
    <>
      <Header />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-24 border-t border-white/10">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

            {/* Badge */}
            <div>
              <span
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(242,242,242,0.2)', background: 'rgba(242,242,242,0.04)', color: 'rgba(242,242,242,0.6)' }}
              >
                Paiement non finalisé
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Paiement annulé
              </h1>
              <p className="font-light leading-relaxed" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.65)' }}>
                Votre paiement n&apos;a pas été finalisé. Vous pouvez retourner au panier ou reprendre votre commande.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/shop-reparation-smartphone-lausanne/panier">
                Retour au panier
              </Button>
              <Button href="/shop-reparation-smartphone-lausanne" variant="secondary">
                Retour au shop
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
