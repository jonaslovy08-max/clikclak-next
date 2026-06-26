import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'


export const metadata: Metadata = {
  title: 'Sell Your Smartphone — Clik Clak Repair Lausanne',
  description:
    'Sell your iPhone, Samsung or other smartphone to Clik Clak Repair in Lausanne. Instant quote, immediate payment.',
  alternates: {
    canonical: `${SITE_URL}/en/services/sell-your-device/`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/rachat-de-votre-smartphone/`,
      'en-CH':    `${SITE_URL}/en/services/sell-your-device/`,
      'x-default': `${SITE_URL}/services/rachat-de-votre-smartphone/`,
    },
  },
  openGraph: {
    title: 'Sell Your Smartphone — Clik Clak Repair Lausanne',
    description: 'Sell your iPhone or Samsung to Clik Clak Repair. Instant quote and immediate payment.',
    url: `${SITE_URL}/en/services/sell-your-device/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnSellYourDevicePage() {
  return (
    <>
      <Header locale="en" />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Sell your smartphone"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span
                className="inline-flex self-start items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
              >
                Sell your device
              </span>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight max-w-3xl">
                Sell your{' '}
                <span className="text-accent">smartphone</span>
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Get an instant quote for your smartphone. We buy iPhones, Samsung, Huawei and other brands in any condition.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex flex-col gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                <h2 className="text-xl font-light text-accent">How it works</h2>
                <ol className="flex flex-col gap-3 list-none">
                  {[
                    'Contact us with your device model and condition.',
                    'Receive an instant quote.',
                    'Bring your device to our Lausanne store.',
                    'Get paid immediately.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 font-light text-foreground/70">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-accent/10 border border-accent/30 text-accent text-xs flex items-center justify-center font-medium">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex flex-col gap-4 p-6 rounded-2xl border border-white/10 bg-white/[0.03]">
                <h2 className="text-xl font-light text-accent">We buy</h2>
                <ul className="flex flex-col gap-2 font-light text-foreground/70">
                  {[
                    'iPhone (all models)',
                    'Samsung Galaxy',
                    'Huawei, Honor',
                    'Other smartphones',
                    'Working or damaged',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="/en/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-[#191919] font-medium hover:bg-accent/90 transition-colors"
              >
                Get a quote
              </Link>
              <Link
                href="/en"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-foreground/60 font-light hover:border-white/30 hover:text-foreground transition-colors"
              >
                ← Home
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
