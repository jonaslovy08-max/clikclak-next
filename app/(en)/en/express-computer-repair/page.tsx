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
  title: 'Computer Repair Lausanne | Diagnostic and Repair | ClikClak',
  description:
    'Diagnostic and repair of computers in Lausanne: MacBook, laptop, charging, battery, screen, overheating, connectivity and data recovery.',
  alternates: {
    canonical: `${SITE_URL}/en/express-computer-repair/`,
    languages: {
      'fr-CH':     `${SITE_URL}/reparation-ordinateur-express/`,
      'en-CH':     `${SITE_URL}/en/express-computer-repair/`,
      'x-default': `${SITE_URL}/reparation-ordinateur-express/`,
    },
  },
  openGraph: {
    title: 'Computer Repair Lausanne — ClikClak',
    url: `${SITE_URL}/en/express-computer-repair/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const COMPUTER_TYPES = [
  {
    id:        'macbook',
    label:     'MacBook and iMac',
    sublabel:  'Apple',
    desc:      'MacBook: battery, screen, keyboard, trackpad, charging and cleaning. iMac: screen, diagnostic and data recovery.',
    href:      '/en/services/macbook-repair',
    available: true,
  },
  {
    id:        'pc-laptop',
    label:     'Laptop PC',
    sublabel:  'Dell, HP, Lenovo, Asus, Acer…',
    desc:      'Diagnostic and quote on request.',
    href:      null,
    available: false,
  },
  {
    id:        'desktop-pc',
    label:     'Desktop computer',
    sublabel:  'PC and other brands',
    desc:      'Diagnostic and quote on request.',
    href:      null,
    available: false,
  },
] as const

export default function EnExpressComputerRepairPage() {
  return (
    <>
      <Header locale="en" />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Computer type selection"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight text-center">
              Computer{' '}
              <span className="text-accent">repair</span>{' '}
              in Lausanne
            </h1>

            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center justify-center py-1">
                <Link
                  href="/en/repair/"
                  className="absolute left-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  style={{ fontSize: 13, color: '#909090' }}
                >
                  <img src="/assets/ui/icon-chevron-left.svg" alt="" aria-hidden style={{ height: 14, width: 14, objectFit: 'contain' }} />
                  <span>Back</span>
                </Link>
                <span className="font-light" style={{ fontSize: 'clamp(13px, 1.4vw, 22px)', color: '#a8a8a8' }}>
                  Computer Repair
                </span>
              </div>
              <img src="/assets/ui/icon-chevron-down.svg" alt="" aria-hidden style={{ height: 'clamp(20px, 2.5vw, 32px)', width: 'auto', objectFit: 'contain' }} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {COMPUTER_TYPES.map(type => (
                type.available ? (
                  <Link
                    key={type.id}
                    href={type.href!}
                    className="flex flex-col gap-3 p-6 rounded-xl transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent group"
                    style={{ border: '1px solid rgba(242,242,242,0.12)', backgroundColor: 'rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                      {type.id === 'macbook' && (
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
                    <span className="text-2xl font-light" style={{ color: '#ccff33' }}>Repair pricing →</span>
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
                    <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)' }}>Diagnostic on request</span>
                  </div>
                )
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                For laptops or desktop PCs — contact us for a diagnostic and a quote.
              </p>
              <ContactPopover locale="en" />
            </div>

          </div>
        </section>
      </main>
      <RepairEngagements locale="en" />
      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
