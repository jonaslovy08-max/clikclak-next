/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import RepairEngagements from '@/components/repair/RepairEngagements'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { MaskedIcon } from '@/components/repair/MainRepairCard'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation tablette Lausanne | ClikClak',
  description:
    'Réparation de tablettes à Lausanne : iPad, écran, vitre, batterie, connecteur de charge et diagnostic chez ClikClak.',
  alternates: {
    canonical: `${SITE_URL}/reparation-tablette-express`,
  },
  openGraph: {
    title: 'Réparation tablette Lausanne — ClikClak',
    url: `${SITE_URL}/reparation-tablette-express`,
    locale: 'fr_CH',
    type: 'website',
  },
}

/* ── Tunnel : Réparation → Tablette → [ici : choix type/marque] → Modèle → Tarifs ── */

const TABLET_TYPES = [
  {
    id:        'ipad',
    label:     'iPad',
    sublabel:  'Apple',
    desc:      'Vitre, écran, batterie, connecteur de charge et boutons.',
    href:      '/services/reparation-ipad',
    available: true,
  },
  {
    id:        'samsung-tab',
    label:     'Samsung Galaxy Tab',
    sublabel:  'Samsung',
    desc:      'Diagnostic et devis sur demande.',
    href:      null,
    available: false,
  },
  {
    id:        'autres',
    label:     'Autres tablettes',
    sublabel:  'Surface Pro, Lenovo, Xiaomi…',
    desc:      'Diagnostic et devis sur demande.',
    href:      null,
    available: false,
  },
] as const

export default function ReparationTabletteExpressPage() {
  return (
    <>
      <Header />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Sélection du type de tablette"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            {/* ── H1 ── */}
            <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight text-center">
              Réparation{' '}
              <span className="text-accent">tablette</span>{' '}
              à Lausanne
            </h1>

            {/* ── Progression ── */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center justify-center py-1">
                <Link
                  href="/reparation/"
                  className="absolute left-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  style={{ fontSize: 14, color: '#909090' }}
                >
                  <img src="/assets/ui/icon-chevron-left.svg" alt="" aria-hidden style={{ height: 14, width: 14, objectFit: 'contain' }} />
                  <span>Retour</span>
                </Link>
                <span className="font-light" style={{ fontSize: 'clamp(14px, 1.5vw, 22px)', color: '#a8a8a8' }}>
                  Réparation Tablettes
                </span>
              </div>
              <img src="/assets/ui/icon-chevron-down.svg" alt="" aria-hidden style={{ height: 'clamp(20px, 2.5vw, 32px)', width: 'auto', objectFit: 'contain' }} />
            </div>

            {/* ── Choix du type ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {TABLET_TYPES.map(type => (
                type.available ? (
                  <Link
                    key={type.id}
                    href={type.href!}
                    className="flex flex-col gap-3 p-6 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent group"
                    style={{ border: '1px solid rgba(242,242,242,0.12)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      {type.id === 'ipad' && (
                        <MaskedIcon
                          src="/assets/icons/icon-apple.svg"
                          w="clamp(24px, 3vw, 36px)"
                          h="clamp(24px, 3vw, 36px)"
                          color="white"
                        />
                      )}
                      <p className="text-base font-light group-hover:text-accent transition-colors duration-200" style={{ color: 'rgba(242,242,242,0.9)' }}>
                        {type.label}
                      </p>
                    </div>
                    <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>{type.desc}</p>
                    <span className="text-2xl font-light" style={{ color: '#ccff33' }}>Prix réparations →</span>
                  </Link>
                ) : (
                  <div
                    key={type.id}
                    className="flex flex-col gap-3 p-6 rounded-xl"
                    style={{ border: '1px solid rgba(242,242,242,0.07)', backgroundColor: 'rgba(255,255,255,0.015)' }}
                  >
                    <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.55)' }}>{type.label}</p>
                    <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)' }}>{type.sublabel}</p>
                    <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.4)' }}>{type.desc}</p>
                    <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)' }}>Diagnostic sur demande</span>
                  </div>
                )
              ))}
            </div>

            {/* ── CTA contact pour types non encore structurés ── */}
            <div className="flex flex-col gap-3">
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Pour Samsung Galaxy Tab, Surface Pro ou autre tablette non listée — contactez-nous pour un diagnostic.
              </p>
              <ContactPopover />
            </div>

          </div>
        </section>
      </main>
      <RepairEngagements />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
