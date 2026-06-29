/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import RepairBrandSelector from '@/components/repair/RepairBrandSelector'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'

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

            {/* Title */}
            <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight text-center">
              Select your{' '}
              <span className="text-accent">brand</span>
            </h1>

            {/* Progress breadcrumb — same layout as FR page */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center justify-center py-1">
                <a
                  href="/en"
                  className="absolute left-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  style={{ fontSize: 14, color: '#909090' }}
                >
                  <img
                    src="/assets/ui/icon-chevron-left.svg"
                    alt=""
                    aria-hidden
                    style={{ height: 14, width: 14, objectFit: 'contain' }}
                  />
                  <span>Back</span>
                </a>
                <span
                  className="font-light"
                  style={{ fontSize: 'clamp(14px, 1.5vw, 22px)', color: '#a8a8a8' }}
                >
                  Smartphone Repairs
                </span>
              </div>

              <img
                src="/assets/ui/icon-chevron-down.svg"
                alt=""
                aria-hidden
                style={{ height: 'clamp(20px, 2.5vw, 32px)', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* Brand grid */}
            <RepairBrandSelector locale="en" />

          </div>
        </section>
      </main>
      <RecentShopProducts />
      <RepairEngagements locale="en" />
      <SiteFooter locale="en" />
      <SectionPinning />
    </>
  )
}
