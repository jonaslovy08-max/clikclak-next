/* eslint-disable @next/next/no-img-element */
/*
  RepairModelPage — page dédiée à un modèle de réparation.
  Server Component — pas de hooks.

  Utilisé par Samsung, iPad, MacBook, OPPO, Huawei, Sony Xperia.
  Port exact de la structure /services/reparation-iphone/[modelSlug].

  Props :
    data       → RepairBrandData (source de vérité des prix)
    modelId    → slug du modèle (ex: 'galaxy-s25-ultra')
    deviceType → 'smartphone' | 'tablet' | 'laptop'
    baseHref   → URL de base des pages modèles (ex: '/services/reparation-samsung-lausanne')
    locale     → 'fr' | 'en'
*/

import Link from 'next/link'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RepairFAQGeneric from '@/components/repair/RepairFAQGeneric'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { MainRepairCard } from '@/components/repair/MainRepairCard'
import { formatPrice, type RepairBrandData } from '@/data/repairTypes'
import { getRepairLabel, getRepairPrice, normalizeModelLabel } from '@/i18n/repairLabels'

export type DeviceType = 'smartphone' | 'tablet' | 'laptop'

interface Props {
  data:       RepairBrandData
  modelId:    string
  deviceType: DeviceType
  baseHref:   string  /* ex: '/services/reparation-samsung-lausanne' */
  locale?:    'fr' | 'en'
}

/* ── Texte d'intro selon le type d'appareil ────────────────────────────────── */
function introText(modelLabel: string, deviceType: DeviceType, locale: 'fr' | 'en'): string {
  if (locale === 'en') {
    switch (deviceType) {
      case 'smartphone':
        return `Your ${modelLabel} is in good hands at ClikClak in Lausanne. Cracked screen, failing battery, damaged charging port, camera or other hardware issue — check the pricing below and contact us for a diagnosis.`
      case 'tablet':
        return `Your ${modelLabel} is in good hands at ClikClak in Lausanne. Cracked screen, damaged display, worn battery, charging port or faulty button — check the available pricing below.`
      case 'laptop':
        return `Your ${modelLabel} is in good hands at ClikClak in Lausanne. Damaged screen, worn battery, charging issues, overheating, keyboard, trackpad or data recovery — check the available pricing below or contact us for a diagnosis.`
    }
  }
  switch (deviceType) {
    case 'smartphone':
      return `Votre ${modelLabel} est entre de bonnes mains chez ClikClak à Lausanne. Écran fissuré, batterie défaillante, connecteur de charge endommagé, caméra ou autre panne matérielle — consultez les tarifs ci-dessous et contactez-nous pour un diagnostic.`
    case 'tablet':
      return `Votre ${modelLabel} est entre de bonnes mains chez ClikClak à Lausanne. Vitre fissurée, écran endommagé, batterie fatiguée, connecteur de charge ou bouton défectueux — consultez les tarifs disponibles ci-dessous.`
    case 'laptop':
      return `Votre ${modelLabel} est entre de bonnes mains chez ClikClak à Lausanne. Écran endommagé, batterie fatiguée, problème de charge, surchauffe, clavier, trackpad ou récupération de données — consultez les tarifs disponibles ci-dessous ou contactez-nous pour un diagnostic.`
  }
}

/* ── Label du lien retour ──────────────────────────────────────────────────── */
function backLabel(data: RepairBrandData, locale: 'fr' | 'en'): string {
  if (locale === 'en') {
    if (data.h1Brand === 'MacBook') return 'All MacBook and iMac models'
    return `All ${data.h1Brand} models`
  }
  if (data.h1Brand === 'MacBook') return 'Tous les modèles MacBook et iMac'
  return `Tous les modèles ${data.h1Brand}`
}

/* ── Couleur prix ──────────────────────────────────────────────────────────── */
function priceColor(price: string): string {
  return price.startsWith('CHF') ? '#ccff33' : 'rgba(242,242,242,0.45)'
}

/* ── Strings localisées ────────────────────────────────────────────────────── */
const STRINGS = {
  fr: {
    repairPricing:        'Tarifs de réparation',
    otherRepairs:         'Autres interventions disponibles',
    changeModel:          'Changer de modèle',
    priceNote:            "Les prix sont indicatifs et peuvent varier selon l'état de l'appareil et les pièces disponibles. Un diagnostic complet est effectué avant toute intervention. Pensez à sauvegarder vos données avant de déposer votre appareil.",
    otherModelsPrefix:    'Autres modèles',
    ariaLabelSuffix:      '— tarifs et informations',
    h1Prefix:             'Réparation',
    h1Suffix:             'à Lausanne',
    screenSubtitle:       'Remplacement écran',
    batterySubtitle:      'Remplacement batterie',
  },
  en: {
    repairPricing:        'Repair pricing',
    otherRepairs:         'Other available repairs',
    changeModel:          'Change model',
    priceNote:            'Prices are indicative and may vary depending on the device condition and parts availability. A full diagnostic is carried out before any intervention. Please back up your data before dropping off your device.',
    otherModelsPrefix:    'Other',
    ariaLabelSuffix:      '— pricing and information',
    h1Prefix:             '',
    h1Suffix:             'Repair in Lausanne',
    screenSubtitle:       'Screen replacement',
    batterySubtitle:      'Battery replacement',
  },
} as const

/* ══════════════════════════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════════════════════════ */
export default function RepairModelPage({ data, modelId, deviceType, baseHref, locale = 'fr' }: Props) {
  const T         = STRINGS[locale]
  const allModels = data.families.flatMap(f => f.models)
  const model     = allModels.find(m => m.id === modelId)
  if (!model) return null

  const family   = data.families.find(f => f.models.some(m => m.id === modelId))
  const siblings = family ? family.models.filter(m => m.id !== modelId) : []

  const screenRepair  = model.repairs.find(r => r.category === 'screen')
  const batteryRepair = model.repairs.find(r => r.category === 'battery')
  const otherRepairs  = model.repairs.filter(r => r.category === 'other')

  const hasMainCards = !!(screenRepair || batteryRepair)

  const displayLabel = normalizeModelLabel(model.label, locale)

  const ariaLabel = locale === 'en'
    ? `${displayLabel} Repair ${T.ariaLabelSuffix}`
    : `Réparation ${displayLabel} ${T.ariaLabelSuffix}`

  const h1 = locale === 'en'
    ? <><span className="text-accent">{displayLabel}</span> {T.h1Suffix}</>
    : <>{T.h1Prefix} <span className="text-accent">{displayLabel}</span> {T.h1Suffix}</>

  const otherModelsLabel = locale === 'en'
    ? `${T.otherModelsPrefix}${family ? ` ${family.label}` : ''} models`
    : `${T.otherModelsPrefix}${family ? ` ${family.label}` : ''}`

  return (
    <>
      <Header locale={locale} />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={ariaLabel}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">

            {/* ══ 1. NAVIGATION ══════════════════════════════════════════ */}
            <div className="flex items-center gap-2">
              <Link
                href={baseHref}
                className="inline-flex items-center gap-1.5 text-sm font-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                style={{ color: '#909090' }}
              >
                <img
                  src="/assets/ui/icon-chevron-left.svg"
                  alt=""
                  aria-hidden
                  style={{ height: 14, width: 14, objectFit: 'contain' }}
                />
                {backLabel(data, locale)}
              </Link>
            </div>

            {/* ══ 2. H1 + INTRO ══════════════════════════════════════════ */}
            <div className="flex flex-col gap-5">
              <h1 className="text-[1.75rem] md:text-[2.5rem] font-light leading-tight">
                {h1}
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
              >
                {introText(displayLabel, deviceType, locale)}
              </p>
            </div>

            {/* ══ 3. TARIFS ══════════════════════════════════════════════ */}
            <div className="flex flex-col gap-6">
              <h2
                className="font-light"
                style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: 'rgba(242,242,242,0.9)' }}
              >
                {T.repairPricing}
              </h2>

              {/* Cards principales Écran + Batterie */}
              {hasMainCards && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {screenRepair && (
                    <MainRepairCard
                      repair={{
                        name:     screenRepair.label,
                        subtitle: T.screenSubtitle,
                        price:    formatPrice(screenRepair.price),
                      }}
                      modelLabel={displayLabel}
                      variant="screen"
                      locale={locale}
                    />
                  )}
                  {batteryRepair && (
                    <MainRepairCard
                      repair={{
                        name:     batteryRepair.label,
                        subtitle: T.batterySubtitle,
                        price:    formatPrice(batteryRepair.price),
                      }}
                      modelLabel={displayLabel}
                      variant="battery"
                      locale={locale}
                    />
                  )}
                </div>
              )}

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
                    {otherRepairs.map((repair, idx) => {
                      const priceStr = getRepairPrice(repair.price, locale)
                      return (
                        <div
                          key={repair.label}
                          className="flex items-center justify-between px-5 py-3.5"
                          style={{ borderTop: idx > 0 ? '1px solid rgba(242,242,242,0.07)' : undefined }}
                        >
                          <span className="font-light" style={{ fontSize: 'clamp(15px, 1.3vw, 16px)', color: 'rgba(242,242,242,0.75)' }}>
                            {getRepairLabel(repair.label, locale)}
                          </span>
                          <span
                            className="font-light whitespace-nowrap ml-4"
                            style={{ fontSize: 'clamp(15px, 1.3vw, 16px)', color: priceColor(priceStr) }}
                          >
                            {priceStr}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ══ 4. CTA ═════════════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center gap-4">
              <ContactPopover />
              <Link
                href={baseHref}
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

            {/* ══ 5. NOTE PRIX ═══════════════════════════════════════════ */}
            <p
              className="text-sm font-light"
              style={{ color: '#a5a5a5', lineHeight: 1.7 }}
            >
              {data.repairNote ?? T.priceNote}
            </p>

            {/* ══ 6. AUTRES MODÈLES DE LA FAMILLE ═══════════════════════ */}
            {siblings.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2
                  className="font-light"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', color: 'rgba(242,242,242,0.85)' }}
                >
                  {otherModelsLabel}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {siblings.map(sibling => (
                    <Link
                      key={sibling.id}
                      href={`${baseHref}/${sibling.id}`}
                      className="text-sm font-light px-4 py-2 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      style={{
                        border:          '1px solid rgba(242,242,242,0.12)',
                        color:           'rgba(242,242,242,0.65)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {normalizeModelLabel(sibling.label, locale)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <RepairFAQGeneric deviceType={deviceType} locale={locale} />
      {deviceType !== 'laptop' && <RepairEngagements locale={locale} />}
      <SiteFooter locale={locale} />
      <SectionPinning />
    </>
  )
}
