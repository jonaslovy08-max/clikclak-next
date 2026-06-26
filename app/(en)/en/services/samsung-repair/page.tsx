import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import { samsungBrandData } from '@/data/samsungRepairs'

export const metadata: Metadata = {
  title: 'Samsung Repair Lausanne — Clik Clak Repair',
  description:
    'Screen, battery, charging port — Clik Clak Repair in Lausanne fixes your Samsung Galaxy. Original parts, 2-year warranty. Express service.',
  alternates: {
    canonical: `${SITE_URL}/en/services/samsung-repair/`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/reparation-samsung-lausanne/`,
      'en-CH':    `${SITE_URL}/en/services/samsung-repair/`,
      'x-default': `${SITE_URL}/services/reparation-samsung-lausanne/`,
    },
  },
  openGraph: {
    title: 'Samsung Repair Lausanne — Clik Clak Repair',
    description: 'Screen, battery, charging port — we fix your Samsung Galaxy with original parts.',
    url: `${SITE_URL}/en/services/samsung-repair/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnSamsungRepairPage() {
  const { families } = samsungBrandData

  return (
    <>
      <Header locale="en" />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="Samsung repair"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            {/* Hero */}
            <div className="flex flex-col gap-4">
              <Link
                href="/en/services/smartphone-repair"
                className="inline-flex self-start items-center gap-2 text-sm font-light text-foreground/40 hover:text-foreground/70 transition-colors"
              >
                ← Smartphone repair
              </Link>
              <span
                className="inline-flex self-start items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
              >
                Samsung Repair — Lausanne
              </span>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight max-w-3xl">
                Samsung{' '}
                <span className="text-accent">Repair</span>
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Select your Samsung model to view pricing instantly. Original parts, express service.
              </p>
            </div>

            {/* Models by family */}
            <div className="flex flex-col gap-8">
              {families.map(family => (
                <div key={family.id} className="flex flex-col gap-4">
                  <h2 className="text-foreground/50 text-sm font-medium uppercase tracking-wider">
                    {family.label}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {family.models.map(model => {
                      const screenRepair = model.repairs.find(r =>
                        r.label.toLowerCase().includes('ecran') ||
                        r.label.toLowerCase().includes('écran')
                      ) || model.repairs[0]
                      const p = screenRepair?.price
                      const priceDisplay = typeof p === 'number'
                        ? `From CHF ${Math.floor(p)}.–`
                        : p === 'Sur demande'
                          ? 'On request'
                          : p === 'Sur devis'
                            ? 'Quote required'
                            : 'Get a quote'

                      return (
                        <Link
                          key={model.id}
                          href={`/services/reparation-samsung-lausanne/${model.id}`}
                          className="flex items-center justify-between gap-3 px-4 py-3 rounded-lg border border-white/10 bg-white/[0.03] hover:border-accent/40 hover:bg-accent/[0.05] transition-all group"
                        >
                          <span className="font-light text-foreground group-hover:text-foreground">
                            {model.label}
                          </span>
                          <span className="text-sm text-foreground/50 group-hover:text-accent transition-colors whitespace-nowrap">
                            {priceDisplay}
                          </span>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-white/8">
              <p className="text-foreground/40 font-light text-sm">
                Model not listed?{' '}
                <Link href="/en/contact" className="text-accent hover:underline">
                  Contact us
                </Link>{' '}
                for a personalised quote.
              </p>
              <p className="text-foreground/30 font-light text-xs">
                Most Samsung repairs are done in-store in Lausanne. Turnaround depends on parts availability.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
