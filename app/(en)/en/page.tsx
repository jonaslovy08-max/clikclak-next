import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import RepairEngagements from '@/components/repair/RepairEngagements'

export const metadata: Metadata = {
  title: 'Smartphone Repair Lausanne — Clik Clak Repair',
  description:
    'Screen cracked? Clik Clak Repair in Lausanne fixes your smartphone, iPhone, Samsung, MacBook. 2-year warranty on original parts from CHF 29.',
  alternates: {
    canonical: `${SITE_URL}/en/`,
    languages: {
      'fr-CH':    `${SITE_URL}/`,
      'en-CH':    `${SITE_URL}/en/`,
      'x-default': `${SITE_URL}/`,
    },
  },
  openGraph: {
    title: 'Smartphone Repair Lausanne — Clik Clak Repair',
    description: 'Screen cracked? We fix your smartphone with a 2-year warranty from CHF 29.',
    url: `${SITE_URL}/en/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const SERVICES = [
  {
    title: 'iPhone Repair',
    desc:  'Screen, battery, charging port and more. From CHF 29.',
    href:  '/en/services/iphone-repair',
    icon:  '/assets/icons/icon-iphone.svg',
  },
  {
    title: 'Samsung Repair',
    desc:  'Galaxy S, Note, A series. Express in-store service.',
    href:  '/en/services/samsung-repair',
    icon:  '/assets/icons/icon-samsung.svg',
  },
  {
    title: 'All smartphones',
    desc:  'Huawei, OPPO, Sony Xperia and more.',
    href:  '/en/services/smartphone-repair',
    icon:  '/assets/icons/icon-smartphone.svg',
  },
  {
    title: 'Sell your device',
    desc:  'Sell your old smartphone. Instant quote.',
    href:  '/en/services/sell-your-device',
    icon:  '/assets/icons/icon-data-recovery.svg',
  },
] as const

export default function EnHomePage() {
  return (
    <>
      <Header locale="en" />
      <main>

        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="px-6 md:px-14 lg:px-20 py-24 border-t border-white/10"
          aria-label="Smartphone repair in Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <div className="flex flex-col gap-6 max-w-3xl">
              <span
                className="inline-flex self-start items-center px-4 py-2 rounded-lg text-sm font-light"
                style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
              >
                Lausanne, Switzerland
              </span>
              <h1 className="text-[2.5rem] md:text-[3.5rem] font-light leading-tight">
                Smartphone repair<br />
                <span className="text-accent">in Lausanne</span>
              </h1>
              <p
                className="font-light leading-relaxed max-w-xl"
                style={{ fontSize: 'clamp(16px, 1.6vw, 20px)', color: 'rgba(242,242,242,0.65)' }}
              >
                Cracked screen, dead battery or water damage? ClikClak fixes your device fast — most repairs in 20 minutes with a 2-year warranty on original parts.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/en/contact"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-accent text-[#191919] font-medium hover:bg-accent/90 transition-colors"
                >
                  Get a quote
                </Link>
                <Link
                  href="/en/services/iphone-repair"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/15 text-foreground/60 font-light hover:border-white/30 hover:text-foreground transition-colors"
                >
                  iPhone pricing →
                </Link>
              </div>
            </div>

            {/* Address / hours */}
            <div className="flex flex-wrap gap-6 text-sm font-light text-foreground/40 pt-4 border-t border-white/8">
              <span>📍 Rue du Petit-Chêne 9b, 1003 Lausanne</span>
              <span>🕐 Mon–Sat 10am–6:30pm</span>
              <a href="tel:+41216527110" className="hover:text-accent transition-colors">📞 +41 21 652 71 10</a>
            </div>
          </div>
        </section>

        {/* ── Services ─────────────────────────────────────────── */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Our repair services"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Our{' '}<span className="text-accent">services</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SERVICES.map(s => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="flex flex-col gap-4 p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-accent/30 hover:bg-accent/[0.04] transition-all group"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.icon}
                    alt=""
                    aria-hidden
                    width={28}
                    height={28}
                    style={{ opacity: 0.7 }}
                  />
                  <div className="flex flex-col gap-2">
                    <h3 className="font-medium text-foreground group-hover:text-accent transition-colors">
                      {s.title}
                    </h3>
                    <p className="text-sm font-light text-foreground/55">{s.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why ClikClak ─────────────────────────────────────── */}
        <RepairEngagements locale="en" />

        {/* ── Contact CTA ──────────────────────────────────────── */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Contact"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.5rem] md:text-[2rem] font-light">
                Need a repair?{' '}
                <span className="text-accent">Contact us.</span>
              </h2>
              <p className="font-light text-foreground/55">
                Describe your device and the issue — we reply quickly.
              </p>
            </div>
            <Link
              href="/en/contact"
              className="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-accent text-[#191919] font-semibold hover:bg-accent/90 transition-colors text-lg"
            >
              Contact us
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter locale="en" />
    </>
  )
}
