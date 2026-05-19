import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Paiement reçu — Shop ClikClak',
  robots: { index: false },
}

export default async function SuccessPage(
  { searchParams }: { searchParams: Promise<{ ref?: string }> }
) {
  const { ref } = await searchParams

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
                style={{ border: '1px solid rgba(204,255,51,0.4)', background: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
              >
                Paiement confirmé
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Paiement reçu
              </h1>
              <p className="font-light leading-relaxed" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.65)' }}>
                Votre paiement a été traité. ClikClak vous confirmera la suite de votre commande.
              </p>
            </div>

            {ref && (
              <div
                className="flex flex-col gap-2 p-5 rounded-xl"
                style={{ border: '1px solid rgba(204,255,51,0.2)', background: 'rgba(204,255,51,0.04)' }}
              >
                <p className="text-xs font-light uppercase tracking-widest" style={{ color: 'rgba(242,242,242,0.4)' }}>
                  Référence commande
                </p>
                <p className="text-lg font-light tracking-wider" style={{ color: '#ccff33' }}>
                  {ref}
                </p>
                <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                  Conservez cette référence. Un email de confirmation vous sera envoyé.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              <Button href="/shop-reparation-smartphone-lausanne" variant="secondary">
                Retour au shop
              </Button>
              <Button href="/contact-clik-clak-lausanne" variant="ghost">
                Contacter ClikClak
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
