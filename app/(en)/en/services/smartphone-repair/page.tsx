
import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import RepairBrandSelector from '@/components/repair/RepairBrandSelector'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import SiteFooter from '@/components/home/SiteFooter'

export const metadata: Metadata = {
  title: 'Express Smartphone Repair Lausanne — Clik Clak Repair',
  description:
    'Express smartphone repair at the best price in Lausanne. On-call service 7 days a week. iPhone, Samsung, Huawei repair in Lausanne.',
  alternates: {
    canonical: `${SITE_URL}/en/services/smartphone-repair/`,
    languages: {
      'fr-CH':    `${SITE_URL}/reparation-smartphone-express/`,
      'en-CH':    `${SITE_URL}/en/services/smartphone-repair/`,
      'x-default': `${SITE_URL}/reparation-smartphone-express/`,
    },
  },
  openGraph: {
    title: 'Express Smartphone Repair Lausanne — Clik Clak Repair',
    url: `${SITE_URL}/en/services/smartphone-repair/`,
    locale: 'en_CH',
    type: 'website',
  },
}

export default function EnSmartphoneRepairPage() {
  return (
    <>
      <Header locale="en" />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Brand selection"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
            <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight text-center">
              Select your{' '}
              <span className="text-accent">brand</span>
            </h1>
            <p className="text-center text-foreground/60 font-light max-w-xl mx-auto">
              Choose your smartphone brand to view pricing and available repairs.
            </p>
            <RepairBrandSelector />
          </div>
        </section>

        <RepairEngagements locale="en" />
        <RecentShopProducts />

        <section className="px-6 md:px-14 lg:px-20 py-12 border-t border-white/10">
          <div className="w-full max-w-6xl mx-auto">
            <p className="text-foreground/50 font-light text-sm">
              Can&apos;t find your brand?{' '}
              <Link href="/en/contact" className="text-accent hover:underline">
                Contact us
              </Link>{' '}
              for a personalised quote.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter locale="en" />
    </>
  )
}
