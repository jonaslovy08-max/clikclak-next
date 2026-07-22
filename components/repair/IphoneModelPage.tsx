/* eslint-disable @next/next/no-img-element */
/*
  IphoneModelPage — composant partagé FR + EN pour les pages modèle iPhone.
  Server Component.

  Utilisé par :
    app/(fr)/services/reparation-iphone/[modelSlug]/page.tsx  (locale="fr")
    app/(en)/en/services/iphone-repair/[modelSlug]/page.tsx   (locale="en")
*/

import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import RepairBreadcrumbJsonLd from '@/components/seo/RepairBreadcrumbJsonLd'
import SiteFooter from '@/components/home/SiteFooter'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RepairFAQ from '@/components/repair/RepairFAQ'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { MainRepairCard } from '@/components/repair/MainRepairCard'
import { getRepairLabel } from '@/i18n/repairLabels'
import {
  getPublicRepairBrand,
  type PublicRepairOffer,
} from '@/lib/repair/publicCatalog'
import { SITE_URL } from '@/lib/seo'
import ShareButton from '@/components/share/ShareButton'

interface Props {
  modelSlug: string
  locale?:   'fr' | 'en'
}

const STRINGS = {
  fr: {
    backHref:          '/services/reparation-iphone',
    backText:          'Tous les modèles iPhone',
    h1Prefix:          'Réparation iPhone',
    h1Suffix:          'à Lausanne',
    introPart:         (label: string) =>
      `Votre ${label} entre de bonnes mains chez ClikClak à Lausanne. Écran fissuré, batterie défaillante, connecteur de charge endommagé ou autre panne matérielle — consultez les tarifs ci-dessous et contactez-nous pour un diagnostic rapide.`,
    repairPricing:     'Tarifs de réparation',
    shareTitle:        (label: string) => `Tarifs de réparation ${label} | ClikClak`,
    shareText:         (label: string) => `Consultez les tarifs de réparation pour ${label} chez ClikClak Lausanne.`,
    shareUrlBase:      (id: string)    => `${SITE_URL}/services/reparation-iphone/${id}`,
    otherRepairs:      'Autres interventions disponibles',
    ctaBackHref:       '/services/reparation-iphone',
    changeModel:       'Changer de modèle',
    priceNote:         "Les prix sont indicatifs et peuvent varier selon l'état de l'appareil et les pièces disponibles. Un diagnostic complet est effectué avant toute intervention. Pensez à sauvegarder vos données avant de déposer votre appareil.",
    otherModels:       (label: string) => `Autres modèles ${label}`,
    siblingHref:       (id: string)    => `/services/reparation-iphone/${id}`,
    ariaLabel:         (label: string) => `Réparation ${label} — tarifs et informations`,
    screenSubtitle:    'Remplacement écran',
    batterySubtitle:   'Remplacement batterie',
  },
  en: {
    backHref:          '/en/services/iphone-repair',
    backText:          'All iPhone models',
    h1Prefix:          'iPhone',
    h1Suffix:          'Repair in Lausanne',
    introPart:         (label: string) =>
      `Your ${label} is in good hands at ClikClak in Lausanne. Cracked screen, failing battery, damaged charging port or other hardware issue — check the pricing below and contact us for a quick diagnosis.`,
    repairPricing:     'Repair pricing',
    shareTitle:        (label: string) => `${label} Repair Pricing | ClikClak`,
    shareText:         (label: string) => `Check repair pricing for ${label} at ClikClak Lausanne.`,
    shareUrlBase:      (id: string)    => `${SITE_URL}/en/services/iphone-repair/${id}`,
    otherRepairs:      'Other available repairs',
    ctaBackHref:       '/en/services/iphone-repair',
    changeModel:       'Change model',
    priceNote:         'Prices are indicative and may vary depending on the device condition and parts availability. A full diagnostic is carried out before any intervention. Please back up your data before dropping off your device.',
    otherModels:       (label: string) => `Other ${label} models`,
    siblingHref:       (id: string)    => `/en/services/iphone-repair/${id}`,
    ariaLabel:         (label: string) => `${label} Repair — pricing and information`,
    screenSubtitle:    'Screen replacement',
    batterySubtitle:   'Battery replacement',
  },
} as const

function formatOfferPrice(
  offer: PublicRepairOffer,
  locale: 'fr' | 'en'
): string {
  if (
    offer.pricing_mode !== 'fixed' ||
    offer.price_cents === null
  ) {
    return locale === 'fr' ? 'Sur devis' : 'On request'
  }

  return `CHF ${Math.trunc(offer.price_cents / 100)}`
}

export default async function IphoneModelPage({
  modelSlug,
  locale = 'fr',
}: Props) {
  const T = STRINGS[locale]
  const brand = await getPublicRepairBrand('iphone')

  if (!brand) notFound()

  const family = brand.families.find((candidate) =>
    candidate.models.some(
      (candidateModel) =>
        candidateModel.slug === modelSlug ||
        candidateModel.legacy_slug === modelSlug
    )
  )

  const model = family?.models.find(
    (candidate) =>
      candidate.slug === modelSlug ||
      candidate.legacy_slug === modelSlug
  )

  if (!family || !model) notFound()

  const familyModels = family.models.filter(
    (candidate) => candidate.id !== model.id
  )

  const screenOffer = model.offers.find(
    (offer) =>
      offer.repair_type.category === 'screen' ||
      offer.repair_type.internal_key === 'ecran'
  )

  const batteryOffer = model.offers.find(
    (offer) =>
      offer.repair_type.category === 'battery' ||
      offer.repair_type.internal_key === 'batterie'
  )

  const mainOffers = [screenOffer, batteryOffer].filter(
    (offer): offer is PublicRepairOffer => Boolean(offer)
  )

  const mainRepairs = mainOffers.map((offer) => ({
    name: offer.repair_type.name,
    subtitle:
      offer.subtitle ??
      (offer.repair_type.category === 'screen'
        ? T.screenSubtitle
        : T.batterySubtitle),
    price: formatOfferPrice(offer, locale),
  }))

  const mainOfferIds = new Set(mainOffers.map((offer) => offer.id))

  const otherRepairs = model.offers
    .filter((offer) => !mainOfferIds.has(offer.id))
    .map((offer) => ({
      name: offer.repair_type.name,
      price: formatOfferPrice(offer, locale),
    }))

  /* Label court (sans "iPhone") pour les accents visuels */
  const shortLabel = model.name.replace('iPhone ', '')

  return (
    <>
      <RepairBreadcrumbJsonLd
        locale={locale}
        brandName={brand.name}
        brandPath={brand.public_base_path ?? ''}
        model={{ name: model.name, slug: model.slug }}
      />
      <Header locale={locale} />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={T.ariaLabel(model.name)}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">

            {/* ══ 1. NAVIGATION ═════════════════════════════════════════ */}
            <div className="flex items-center gap-2">
              <Link
                href={T.backHref}
                className="inline-flex items-center gap-1.5 text-sm font-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                style={{ color: '#909090' }}
              >
                <img
                  src="/assets/ui/icon-chevron-left.svg"
                  alt=""
                  aria-hidden
                  style={{ height: 14, width: 14, objectFit: 'contain' }}
                />
                {T.backText}
              </Link>
            </div>

            {/* ══ 2. H1 + INTRO ══════════════════════════════════════════ */}
            <div className="flex flex-col gap-5">
              <h1 className="text-[1.75rem] md:text-[2.5rem] font-light leading-tight">
                {locale === 'en'
                  ? <>{T.h1Prefix} <span className="text-accent">{shortLabel}</span> {T.h1Suffix}</>
                  : <>{T.h1Prefix} <span className="text-accent">{shortLabel}</span> {T.h1Suffix}</>
                }
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
              >
                {T.introPart(model.name)}
              </p>
            </div>

            {/* ══ 3. TARIFS PRINCIPAUX ═══════════════════════════════════ */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <h2
                  className="font-light"
                  style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: 'rgba(242,242,242,0.9)' }}
                >
                  {T.repairPricing}
                </h2>
                <ShareButton
                  title={T.shareTitle(model.name)}
                  text={T.shareText(model.name)}
                  url={T.shareUrlBase(model.slug)}
                  locale={locale}
                />
              </div>

              {/* Écran + Batterie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {mainRepairs.map((repair, i) => (
                  <MainRepairCard
                    key={repair.name}
                    repair={{
                      ...repair,
                      subtitle: i === 0 ? T.screenSubtitle : T.batterySubtitle,
                    }}
                    modelLabel={model.name}
                    variant={i === 0 ? 'screen' : 'battery'}
                    locale={locale}
                  />
                ))}
              </div>

              {/* Autres réparations */}
              {otherRepairs.length > 0 && (
                <div
                  style={{
                    border:       '1px solid rgba(242,242,242,0.1)',
                    borderRadius: 12,
                    overflow:     'hidden',
                  }}
                >
                  <div
                    className="px-5 py-4"
                    style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(242,242,242,0.1)' }}
                  >
                    <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.55)' }}>
                      {T.otherRepairs}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    {otherRepairs.map((repair, idx) => (
                      <div
                        key={repair.name}
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{
                          borderTop: idx > 0 ? '1px solid rgba(242,242,242,0.07)' : undefined,
                        }}
                      >
                        <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>
                          {getRepairLabel(repair.name, locale)}
                        </span>
                        <span className="text-sm font-light text-accent whitespace-nowrap ml-4">
                          {repair.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ══ 4. CTA ═════════════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center gap-4">
              <ContactPopover locale={locale} />
              <Link
                href={T.ctaBackHref}
                className="inline-flex items-center gap-2 text-sm font-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                style={{ color: 'rgba(242,242,242,0.5)' }}
              >
                <img
                  src="/assets/ui/icon-chevron-left.svg"
                  alt=""
                  aria-hidden
                  style={{ height: 13, width: 13, objectFit: 'contain' }}
                />
                {T.changeModel}
              </Link>
            </div>

            {/* ══ 5. NOTE ════════════════════════════════════════════════ */}
            <p
              className="text-sm font-light"
              style={{ color: '#a5a5a5', lineHeight: 1.7 }}
            >
              {T.priceNote}
            </p>

            {/* ══ 6. AUTRES MODÈLES DE LA FAMILLE ═══════════════════════ */}
            {familyModels.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2
                  className="font-light"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', color: 'rgba(242,242,242,0.85)' }}
                >
                  {T.otherModels(family.name)}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {familyModels.map(m => (
                    <Link
                      key={m.id}
                      href={T.siblingHref(m.slug)}
                      className="text-sm font-light px-4 py-2 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      style={{
                        border:          '1px solid rgba(242,242,242,0.12)',
                        color:           'rgba(242,242,242,0.65)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {m.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <RepairFAQ locale={locale} />
      <RepairEngagements locale={locale} />
      <SiteFooter locale={locale} />
      <SectionPinning />
    </>
  )
}
