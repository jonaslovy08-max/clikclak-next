import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Xiaomi Repair Lausanne — ClikClak',
  description: 'Xiaomi smartphone repair in Lausanne: diagnostic and quote on request at ClikClak.',
  robots: { index: false, follow: true },
  alternates: {
    canonical: `${SITE_URL}/en/services/xiaomi-repair/`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-xiaomi/`,
      'en-CH':     `${SITE_URL}/en/services/xiaomi-repair/`,
      'x-default': `${SITE_URL}/services/reparation-xiaomi/`,
    },
  },
}

export default function EnXiaomiRepairPage() {
  return (
    <>
      <Header locale="en" />
      <main>
        <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Xiaomi{' '}
              <span className="text-accent">repair</span>
            </h1>
            <p className="font-light" style={{ color: 'rgba(242,242,242,0.65)', fontSize: 'clamp(15px, 1.5vw, 19px)' }}>
              Pricing data for Xiaomi is not yet available. Contact us for a diagnostic and quote.
            </p>
            <div className="flex flex-wrap gap-4">
              <ContactPopover locale="en" />
              <Link href="/en/services/smartphone-repair" className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                ← All smartphone repairs
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
