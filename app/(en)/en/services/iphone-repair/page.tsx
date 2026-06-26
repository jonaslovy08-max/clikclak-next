import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import RepairEngagements from '@/components/repair/RepairEngagements'
import SiteFooter from '@/components/home/SiteFooter'
import { iphoneModels, generations } from '@/data/iphoneRepairs'
import { stripCents } from '@/data/repairTypes'

export const metadata: Metadata = {
  title: 'iPhone Repair Lausanne — Clik Clak Repair',
  description:
    'Cracked screen, dead battery? Clik Clak Repair in Lausanne fixes your iPhone. Original parts, 2-year warranty. From CHF 29.',
  alternates: {
    canonical: `${SITE_URL}/en/services/iphone-repair/`,
    languages: {
      'fr-CH':    `${SITE_URL}/services/reparation-iphone/`,
      'en-CH':    `${SITE_URL}/en/services/iphone-repair/`,
      'x-default': `${SITE_URL}/services/reparation-iphone/`,
    },
  },
  openGraph: {
    title: 'iPhone Repair Lausanne — Clik Clak Repair',
    description: 'Cracked screen, dead battery? We fix your iPhone with original parts and a 2-year warranty.',
    url: `${SITE_URL}/en/services/iphone-repair/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnIphoneRepairPage() {
  // Group models by generation
  const byGen = new Map<string, typeof iphoneModels>()
  for (const m of iphoneModels) {
    const list = byGen.get(m.generation) ?? []
    list.push(m)
    byGen.set(m.generation, list)
  }

  return (
    <>
      <Header locale="en" />
      <main>
        {/* Hero */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label="iPhone repair"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-4">
              <span
                className="inline-flex self-start items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
              >
                iPhone Repair — Lausanne
              </span>
              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight max-w-3xl">
                iPhone{' '}
                <span className="text-accent">Repair</span>
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Select your model to view pricing instantly. Original parts, 2-year warranty, express service.
              </p>
            </div>

            {/* Models by generation */}
            <div className="flex flex-col gap-8">
              {generations.map(gen => {
                const models = byGen.get(gen.id)
                if (!models?.length) return null
                return (
                  <div key={gen.id} className="flex flex-col gap-4">
                    <h2 className="text-foreground/50 text-sm font-medium uppercase tracking-wider">
                      {gen.label}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {models.map(model => {
                        const mainRepair = model.mainRepairs[0]
                        const priceDisplay = mainRepair
                          ? `From ${stripCents(mainRepair.price)}`
                          : 'Get a quote'
                        return (
                          <Link
                            key={model.id}
                            href={`/services/reparation-iphone/${model.id}`}
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
                )
              })}
            </div>

            <p className="text-foreground/40 font-light text-sm">
              Model not listed?{' '}
              <Link href="/en/contact" className="text-accent hover:underline">
                Contact us
              </Link>{' '}
              for a personalised quote.
            </p>
          </div>
        </section>

        <RepairEngagements locale="en" />
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
