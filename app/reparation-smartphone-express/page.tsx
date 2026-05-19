/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import RepairBrandSelector from '@/components/repair/RepairBrandSelector'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'

export const metadata: Metadata = {
  title: 'Réparation smartphone express Lausanne — Clik Clak Repair',
  description: 'Clik Clak Repair — Réparation smartphone express et au meilleur prix. Dépannage 7/7 sur rendez-vous. Réparation Natel à Lausanne.',
  alternates: {
    canonical: `${SITE_URL}/reparation-smartphone-express/`,
  },
  openGraph: {
    title: 'Réparation smartphone express Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/reparation-smartphone-express/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function ReparationExpressPage() {
  return (
    <>
      <Header />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Sélection de la marque"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            {/* Titre */}
            <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight text-center">
              Sélectionnez{' '}
              <span className="text-accent">la marque</span>
            </h1>

            {/* Bloc progression */}
            <div className="flex flex-col items-center gap-4">

              {/* Retour absolu gauche + Label centré — même pattern que /services/reparation-iphone/ */}
              <div className="relative w-full flex items-center justify-center py-1">
                <Link
                  href="/reparation/"
                  className="absolute left-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  style={{ fontSize: 13, color: '#909090' }}
                >
                  <img
                    src="/assets/ui/icon-chevron-left.svg"
                    alt=""
                    aria-hidden
                    style={{ height: 14, width: 14, objectFit: 'contain' }}
                  />
                  <span>Retour</span>
                </Link>
                <span
                  className="font-light"
                  style={{ fontSize: 'clamp(13px, 1.4vw, 22px)', color: '#a8a8a8' }}
                >
                  Réparation Smartphones
                </span>
              </div>

              {/* Chevron lime centré */}
              <img
                src="/assets/ui/icon-chevron-down.svg"
                alt=""
                aria-hidden
                style={{ height: 'clamp(20px, 2.5vw, 32px)', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Grille des marques */}
            <RepairBrandSelector />

          </div>
        </section>
      </main>
      <RecentShopProducts />
      <RepairEngagements />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
