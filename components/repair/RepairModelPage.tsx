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

export type DeviceType = 'smartphone' | 'tablet' | 'laptop'

interface Props {
  data:       RepairBrandData
  modelId:    string
  deviceType: DeviceType
  baseHref:   string  /* ex: '/services/reparation-samsung-lausanne' */
}

/* ── Texte d'intro selon le type d'appareil ────────────────────────────────── */
function introText(modelLabel: string, deviceType: DeviceType): string {
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
function backLabel(data: RepairBrandData): string {
  if (data.h1Brand === 'MacBook') return 'Tous les modèles MacBook et iMac'
  return `Tous les modèles ${data.h1Brand}`
}

/* ── Couleur prix ──────────────────────────────────────────────────────────── */
function priceColor(price: string): string {
  return price.startsWith('CHF') ? '#ccff33' : 'rgba(242,242,242,0.45)'
}

/* ══════════════════════════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════════════════════════ */
export default function RepairModelPage({ data, modelId, deviceType, baseHref }: Props) {
  const allModels   = data.families.flatMap(f => f.models)
  const model       = allModels.find(m => m.id === modelId)
  if (!model) return null

  const family      = data.families.find(f => f.models.some(m => m.id === modelId))
  const siblings    = family ? family.models.filter(m => m.id !== modelId) : []

  const screenRepair  = model.repairs.find(r => r.category === 'screen')
  const batteryRepair = model.repairs.find(r => r.category === 'battery')
  const otherRepairs  = model.repairs.filter(r => r.category === 'other')

  const hasMainCards = !!(screenRepair || batteryRepair)

  return (
    <>
      <Header />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={`Réparation ${model.label} — tarifs et informations`}
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
                {backLabel(data)}
              </Link>
            </div>

            {/* ══ 2. H1 + INTRO ══════════════════════════════════════════ */}
            <div className="flex flex-col gap-5">
              <h1 className="text-[1.75rem] md:text-[2.5rem] font-light leading-tight">
                Réparation{' '}
                <span className="text-accent">{model.label}</span>{' '}
                à Lausanne
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
              >
                {introText(model.label, deviceType)}
              </p>
            </div>

            {/* ══ 3. TARIFS ══════════════════════════════════════════════ */}
            <div className="flex flex-col gap-6">
              <h2
                className="font-light"
                style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: 'rgba(242,242,242,0.9)' }}
              >
                Tarifs de réparation
              </h2>

              {/* Cards principales Écran + Batterie */}
              {hasMainCards && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {screenRepair && (
                    <MainRepairCard
                      repair={{
                        name:     screenRepair.label,
                        subtitle: 'Remplacement écran',
                        price:    formatPrice(screenRepair.price),
                      }}
                      modelLabel={model.label}
                      variant="screen"
                    />
                  )}
                  {batteryRepair && (
                    <MainRepairCard
                      repair={{
                        name:     batteryRepair.label,
                        subtitle: 'Remplacement batterie',
                        price:    formatPrice(batteryRepair.price),
                      }}
                      modelLabel={model.label}
                      variant="battery"
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
                      Autres interventions disponibles
                    </p>
                  </div>
                  <div className="flex flex-col">
                    {otherRepairs.map((repair, idx) => {
                      const priceStr = formatPrice(repair.price)
                      return (
                        <div
                          key={repair.label}
                          className="flex items-center justify-between px-5 py-3.5"
                          style={{ borderTop: idx > 0 ? '1px solid rgba(242,242,242,0.07)' : undefined }}
                        >
                          <span className="font-light" style={{ fontSize: 'clamp(15px, 1.3vw, 16px)', color: 'rgba(242,242,242,0.75)' }}>
                            {repair.label}
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
                Changer de modèle
              </Link>
            </div>

            {/* ══ 5. NOTE PRIX ═══════════════════════════════════════════ */}
            <p
              className="text-sm font-light"
              style={{ color: '#a5a5a5', lineHeight: 1.7 }}
            >
              {data.repairNote ??
                "Les prix sont indicatifs et peuvent varier selon l'état de l'appareil et les pièces disponibles. Un diagnostic complet est effectué avant toute intervention."}
            </p>

            {/* ══ 6. AUTRES MODÈLES DE LA FAMILLE ═══════════════════════ */}
            {siblings.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2
                  className="font-light"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', color: 'rgba(242,242,242,0.85)' }}
                >
                  Autres modèles{family ? ` ${family.label}` : ''}
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
                      {sibling.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <RepairFAQGeneric deviceType={deviceType} />
      {deviceType !== 'laptop' && <RepairEngagements />}
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
