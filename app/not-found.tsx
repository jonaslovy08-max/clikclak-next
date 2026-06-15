import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Page introuvable — Clik Clak Repair',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <>
      <Header />

      <main>
        <section className="px-6 md:px-14 lg:px-20 py-24 border-t border-white/10">
          <div className="w-full max-w-2xl mx-auto flex flex-col gap-10">

            {/* Code erreur */}
            <p
              className="text-[5rem] md:text-[7rem] font-light leading-none"
              style={{ color: 'rgba(204,255,51,0.15)' }}
              aria-hidden
            >
              404
            </p>

            {/* Titre + message */}
            <div className="flex flex-col gap-4">
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                Page introuvable
              </h1>
              <p
                className="font-light leading-relaxed"
                style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
              >
                Cette page n&apos;existe plus ou le produit n&apos;est plus disponible.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <Button href="/shop-reparation-smartphone-lausanne" variant="primary">
                Voir le shop
              </Button>
              <Button href="/contact-clik-clak-lausanne" variant="secondary">
                Nous contacter
              </Button>
              <Link
                href="/"
                className="inline-flex items-center text-sm font-light underline underline-offset-4 focus-visible:outline-none self-center"
                style={{ color: 'rgba(242,242,242,0.4)' }}
              >
                ← Accueil
              </Link>
            </div>

          </div>
        </section>
      </main>

      <SiteFooter />
      <SectionPinning />
    </>
  )
}
