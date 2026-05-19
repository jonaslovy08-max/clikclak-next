/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RepairFAQ from '@/components/repair/RepairFAQ'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { MainRepairCard } from '@/components/repair/MainRepairCard'
import { iphoneModels, generations } from '@/data/iphoneRepairs'
import { stripCents } from '@/data/repairTypes'
import { SITE_URL } from '@/lib/seo'

/* ── Génération statique de toutes les pages modèle ──────────────────────── */
export function generateStaticParams() {
  return iphoneModels.map(m => ({ modelSlug: m.id }))
}

/* ── Metadata dynamique ───────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params
  const model = iphoneModels.find(m => m.id === modelSlug)
  if (!model) return {}

  return {
    title: `Réparation ${model.label} Lausanne | Prix écran, batterie | ClikClak`,
    description: `Consultez les prix de réparation pour ${model.label} à Lausanne : écran, batterie, caméra, connecteur de charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}/services/reparation-iphone/${modelSlug}/`,
    },
    openGraph: {
      title: `Réparation ${model.label} Lausanne — ClikClak`,
      description: `Prix de réparation ${model.label} à Lausanne. Écran, batterie, caméra et plus. Pièces de qualité, garantie incluse.`,
      url: `${SITE_URL}/services/reparation-iphone/${modelSlug}/`,
      locale: 'fr_CH',
      type: 'website',
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   Page dédiée — /services/reparation-iphone/[modelSlug]
══════════════════════════════════════════════════════════════════════════ */
export default async function IphoneModelPage({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params
  const model = iphoneModels.find(m => m.id === modelSlug)
  if (!model) notFound()

  const family       = generations.find(g => g.id === model.generation)
  const familyModels = iphoneModels.filter(
    m => m.generation === model.generation && m.id !== model.id
  )

  /* Label court (sans "iPhone") pour les accents visuels */
  const shortLabel = model.label.replace('iPhone ', '')

  return (
    <>
      <Header />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={`Réparation ${model.label} — tarifs et informations`}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">

            {/* ══ 1. NAVIGATION ═════════════════════════════════════════ */}
            <div className="flex items-center gap-2">
              <Link
                href="/services/reparation-iphone"
                className="inline-flex items-center gap-1.5 text-sm font-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                style={{ color: '#909090' }}
              >
                <img
                  src="/assets/ui/icon-chevron-left.svg"
                  alt=""
                  aria-hidden
                  style={{ height: 14, width: 14, objectFit: 'contain' }}
                />
                Tous les modèles iPhone
              </Link>
            </div>

            {/* ══ 2. H1 + INTRO ══════════════════════════════════════════ */}
            <div className="flex flex-col gap-5">
              <h1 className="text-[1.75rem] md:text-[2.5rem] font-light leading-tight">
                Réparation{' '}
                <span className="text-accent">iPhone {shortLabel}</span>{' '}
                à Lausanne
              </h1>
              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
              >
                Votre {model.label} entre de bonnes mains chez ClikClak à Lausanne.
                Écran fissuré, batterie défaillante, connecteur de charge endommagé ou autre
                panne matérielle — consultez les tarifs ci-dessous et contactez-nous pour
                un diagnostic rapide.
              </p>
            </div>

            {/* ══ 3. TARIFS PRINCIPAUX ═══════════════════════════════════ */}
            <div className="flex flex-col gap-6">
              <h2
                className="font-light"
                style={{ fontSize: 'clamp(18px, 2vw, 26px)', color: 'rgba(242,242,242,0.9)' }}
              >
                Tarifs de réparation
              </h2>

              {/* Écran + Batterie */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {model.mainRepairs.map((repair, i) => (
                  <MainRepairCard
                    key={repair.name}
                    repair={repair}
                    modelLabel={model.label}
                    variant={i === 0 ? 'screen' : 'battery'}
                  />
                ))}
              </div>

              {/* Autres réparations */}
              {model.otherRepairs.length > 0 && (
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
                    {model.otherRepairs.map((repair, idx) => (
                      <div
                        key={repair.name}
                        className="flex items-center justify-between px-5 py-3.5"
                        style={{
                          borderTop: idx > 0 ? '1px solid rgba(242,242,242,0.07)' : undefined,
                        }}
                      >
                        <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>
                          {repair.name}
                        </span>
                        <span className="text-sm font-light text-accent whitespace-nowrap ml-4">
                          {stripCents(repair.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* ══ 4. CTA ═════════════════════════════════════════════════ */}
            <div className="flex flex-wrap items-center gap-4">
              <ContactPopover />
              <Link
                href="/services/reparation-iphone"
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

            {/* ══ 5. NOTE ════════════════════════════════════════════════ */}
            <p
              className="text-sm font-light"
              style={{ color: '#a5a5a5', lineHeight: 1.7 }}
            >
              Les prix sont indicatifs et peuvent varier selon l&apos;état de l&apos;appareil et les
              pièces disponibles. Un diagnostic complet est effectué avant toute intervention.
              Pensez à sauvegarder vos données avant de déposer votre appareil.
            </p>

            {/* ══ 6. AUTRES MODÈLES DE LA FAMILLE ═══════════════════════ */}
            {familyModels.length > 0 && (
              <div className="flex flex-col gap-5">
                <h2
                  className="font-light"
                  style={{ fontSize: 'clamp(16px, 1.6vw, 22px)', color: 'rgba(242,242,242,0.85)' }}
                >
                  Autres modèles{family ? ` ${family.label}` : ''}
                </h2>
                <div className="flex flex-wrap gap-3">
                  {familyModels.map(m => (
                    <Link
                      key={m.id}
                      href={`/services/reparation-iphone/${m.id}`}
                      className="text-sm font-light px-4 py-2 rounded-lg transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                      style={{
                        border:          '1px solid rgba(242,242,242,0.12)',
                        color:           'rgba(242,242,242,0.65)',
                        backgroundColor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>
      </main>

      <RepairFAQ />
      <RepairEngagements />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
