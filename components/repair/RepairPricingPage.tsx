'use client'

/*
  RepairPricingPage — composant générique, architecture IDENTIQUE à /services/reparation-iphone.
  Utilisé par Samsung, iPad, OPPO, Huawei, MacBook, Sony et futurs appareils.

  Familles → Dropdown modèles → Panneau tarifs (GSAP)
    - card Écran   (category 'screen')
    - card Batterie (category 'battery')
    - liste autres réparations (category 'other')
    - cards absentes si non disponibles pour ce modèle

  Affichage bouton famille — port exact iPhone :
    [buttonPrefix gris] + [shortLabel lime]
    Ex : "Galaxy " (gris) + "S25" (lime) → "Galaxy S25"
*/

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import Header from '@/components/layout/Header'
import RepairEngagements from '@/components/repair/RepairEngagements'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import RepairModelSearch from '@/components/RepairModelSearch'
import ShareButton       from '@/components/share/ShareButton'
import { MainRepairCard, MaskedIcon } from '@/components/repair/MainRepairCard'
import { formatPrice, type RepairBrandData, type RepairFamily, type RepairModel } from '@/data/repairTypes'
import { getRepairLabel, getRepairPrice, normalizeModelLabel } from '@/i18n/repairLabels'
import type { SearchableModel } from '@/lib/repairSearch'

/* ── Dropdown modèles — port exact du pattern iPhone ───────────────────────── */
function GenDropdown({
  models, open, selectedId, onSelect,
}: {
  models:     RepairModel[]
  open:       boolean
  selectedId: string
  onSelect:   (id: string) => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const animRef  = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)
  const prevOpen = useRef(false)
  const reduced  = useRef(false)

  useLayoutEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const panel = panelRef.current
    if (!panel) return
    gsap.set(panel, { autoAlpha: 0, yPercent: -20, scale: 0.85, transformOrigin: 'top left' })
    return () => { animRef.current?.kill(); animRef.current = null }
  }, [])

  useEffect(() => {
    const wasOpen = prevOpen.current
    prevOpen.current = open
    const panel = panelRef.current
    if (!panel) return

    if (open && !wasOpen) {
      animRef.current?.kill()
      if (!reduced.current) {
        const items = panel.querySelectorAll<HTMLElement>('.gen-dd-item')
        gsap.set(items, { clearProps: 'all' })
        animRef.current = gsap.timeline()
          .fromTo(panel,
            { autoAlpha: 0, yPercent: -20, scale: 0.85 },
            { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.45, ease: 'elastic.out(0.9, 0.4)', transformOrigin: 'top left' }, 0)
          .fromTo(items,
            { opacity: 0, y: -6, immediateRender: false },
            { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)', stagger: 0.04 }, 0.08)
      } else {
        gsap.set(panel, { autoAlpha: 1, yPercent: 0, scale: 1 })
      }
    } else if (!open && wasOpen) {
      animRef.current?.kill()
      if (!reduced.current) {
        animRef.current = gsap.to(panel, {
          autoAlpha: 0, yPercent: -12, scale: 0.9,
          duration: 0.18, ease: 'power2.in', transformOrigin: 'top left',
          onComplete: () => { animRef.current = null },
        })
      } else {
        gsap.set(panel, { autoAlpha: 0 })
      }
    }
  }, [open])

  return (
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-2 z-20 min-w-full"
      style={{ backgroundColor: '#1c1c1c', border: '1px solid rgba(242,242,242,0.18)', borderRadius: 8, overflow: 'hidden' }}
    >
      {models.map((model, idx) => (
        <button
          key={model.id}
          type="button"
          onClick={() => onSelect(model.id)}
          className="gen-dd-item repair-dd-item focus-visible:outline-none"
          style={{
            borderTop:       idx > 0 ? '1px solid rgba(242,242,242,0.08)' : undefined,
            backgroundColor: model.id === selectedId ? 'rgba(255,255,255,0.07)' : 'transparent',
            color:           model.id === selectedId ? '#ededed' : 'rgba(242,242,242,0.5)',
          }}
        >
          <span>{model.label}</span>
          {model.id === selectedId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/assets/ui/icon-check.svg" alt="" aria-hidden style={{ height: 14, width: 14, objectFit: 'contain' }} />
          )}
        </button>
      ))}
    </div>
  )
}

/* ── Bouton famille — port exact iPhone (stable, hors composant principal) ─── */
function FamilyButton({
  fam, isOpen, onClick,
}: {
  fam:     RepairFamily
  isOpen:  boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="gen-family-btn repair-tab-btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
      style={{
        border: isOpen
          ? '1px solid rgba(242,242,242,0.35)'
          : '1px solid rgba(242,242,242,0.06)',
      }}
    >
      {fam.buttonPrefix
        ? <>
            <span style={{ color: '#c8c8c8' }}>{fam.buttonPrefix}</span>
            <span style={{ color: '#ccff33' }}>{fam.shortLabel}</span>
          </>
        : <span style={{ color: '#ccff33' }}>{fam.shortLabel}</span>
      }
    </button>
  )
}

/* ── Couleur prix ────────────────────────────────────────────────────────────  */
function priceColor(price: string): string {
  return price.startsWith('CHF') ? '#ccff33' : 'rgba(242,242,242,0.45)'
}

/* ══════════════════════════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════════════════════════ */
export default function RepairPricingPage({ data, bottomSlot, locale = 'fr' }: { data: RepairBrandData; bottomSlot?: React.ReactNode; locale?: 'fr' | 'en' }) {
  const {
    h1Prefix, h1Brand, brandIcon,
    breadcrumbLabel, breadcrumbHref,
    families,
    defaultModelId,
    initialFamilyCount,
    repairNote,
    searchPlaceholder = 'Rechercher mon appareil...',
  } = data

  const UI = locale === 'en'
    ? {
        backLabel:     'Back',
        selectModel:   'Select your model',
        orSelect:      'Or select your device here',
        seeMore:       (n: number) => `See more models… (${n} families)`,
        seeLess:       'See less…',
        repairTitle:   (label: string) => `${label} Repair`,
        repairNote_:   repairNote ? `Note: ${repairNote}` : undefined,
        screenSub:     'Screen replacement',
        batterySub:    'Battery replacement',
      }
    : {
        backLabel:     'Retour',
        selectModel:   'Sélectionnez votre modèle',
        orSelect:      'Ou sélectionnez votre appareil ici',
        seeMore:       (n: number) => `Voir plus de modèles... (${n} familles)`,
        seeLess:       'Voir moins...',
        repairTitle:   (label: string) => `Réparation ${label}`,
        repairNote_:   repairNote,
        screenSub:     'Remplacement écran',
        batterySub:    'Remplacement batterie',
      }
  const router  = useRouter()
  const INITIAL = Math.min(initialFamilyCount ?? families.length, 5)
  const hasMore = families.length > INITIAL

  const allModels: RepairModel[] = families.flatMap(f => f.models)

  const [openFamilyId,    setOpenFamilyId]    = useState<string | null>(null)
  // Les modèles sont triés du plus récent au plus ancien.
  // Le modèle par défaut est donc le premier élément de la liste.
  const [selectedModelId, setSelectedModelId] = useState(defaultModelId ?? allModels[0]?.id ?? '')
  const [showAll,         setShowAll]         = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const tariffRef   = useRef<HTMLDivElement>(null)
  const extraRef    = useRef<HTMLDivElement>(null)

  const selectedModel = allModels.find(m => m.id === selectedModelId)
  const screenRepair  = selectedModel?.repairs.find(r => r.category === 'screen')
  const batteryRepair = selectedModel?.repairs.find(r => r.category === 'battery')
  const otherRepairs  = selectedModel?.repairs.filter(r => r.category === 'other') ?? []

  /* ── Animation panneau tarifs ── */
  useLayoutEffect(() => {
    const el = tariffRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const kids = Array.from(el.children) as Element[]
    gsap.killTweensOf([el, ...kids])
    gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: 'power2.out' })
    gsap.fromTo(kids,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.055, delay: 0.06 })
    return () => { gsap.killTweensOf([el, ...kids]) }
  }, [selectedModelId])

  /* ── Masquage initial "Voir plus" ── */
  useLayoutEffect(() => {
    if (!hasMore) return
    const el = extraRef.current
    if (!el) return
    gsap.set(el, { height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' })
  }, [hasMore])

  /* ── Animation "Voir plus / moins" ── */
  useEffect(() => {
    if (!hasMore) return
    const el = extraRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (showAll) {
      gsap.killTweensOf(el)
      if (reduced) {
        gsap.set(el, { height: 'auto', opacity: 1, overflow: 'visible', pointerEvents: 'auto' })
        return
      }
      gsap.set(el, { pointerEvents: 'auto' })
      gsap.to(el, {
        height: 'auto', opacity: 1, duration: 0.45, ease: 'power2.out',
        onComplete: () => gsap.set(el, { overflow: 'visible' }),
      })
      gsap.fromTo(el.querySelectorAll('.gen-family-btn'),
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.035, delay: 0.06 })
    } else {
      gsap.killTweensOf(el)
      if (reduced) {
        gsap.set(el, { height: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none' })
        return
      }
      gsap.set(el, { overflow: 'hidden', pointerEvents: 'none' })
      gsap.to(el.querySelectorAll('.gen-family-btn'), { y: 8, opacity: 0, duration: 0.18, ease: 'power2.in', stagger: 0.02 })
      gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.06 })
    }
  }, [showAll, hasMore])

  /* ── Sélection centralisée ── */
  function selectModelAndScroll(modelId: string) {
    const model = allModels.find(m => m.id === modelId)
    if (!model) return
    const famIdx = families.findIndex(f => f.models.some(mm => mm.id === modelId))
    if (famIdx >= INITIAL) setShowAll(true)
    setSelectedModelId(modelId)
    requestAnimationFrame(() => {
      const el = tariffRef.current
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY - 24
      window.scrollTo({ top: y, behavior: 'smooth' })
    })
  }

  function handleFamilyClick(familyId: string) {
    setOpenFamilyId(prev => prev === familyId ? null : familyId)
  }

  function handleSelectModel(modelId: string) {
    setOpenFamilyId(null)
    selectModelAndScroll(modelId)
  }

  const closeDropdown = useCallback(() => setOpenFamilyId(null), [])

  useEffect(() => {
    if (!openFamilyId) return
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openFamilyId, closeDropdown])

  useEffect(() => {
    if (!openFamilyId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openFamilyId, closeDropdown])

  /* ── URL param ?model= ── */
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('model')
    if (!param) return
    const timer = setTimeout(() => selectModelAndScroll(param), 450)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount uniquement — selectModelAndScroll intentionnellement exclu

  /* ── Recherche ── */
  function handleSearchSelect(result: SearchableModel) {
    if (allModels.some(m => m.id === result.modelId)) {
      selectModelAndScroll(result.modelId)
    } else {
      router.push(result.href)
    }
  }


  /* ── Rendu d'une famille (fonction helper, pas de composant React imbriqué) ── */
  const renderFamily = (fam: RepairFamily) => {
    const isOpen = fam.id === openFamilyId
    return (
      <div key={fam.id} className="relative">
        <FamilyButton fam={fam} isOpen={isOpen} onClick={() => handleFamilyClick(fam.id)} />
        <GenDropdown
          models={fam.models}
          open={isOpen}
          selectedId={selectedModelId}
          onSelect={handleSelectModel}
        />
      </div>
    )
  }

  return (
    <>
      <Header locale={locale} />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={locale === 'en' ? `${h1Brand} Repair — model selection and pricing` : `Réparation ${h1Brand} — sélection du modèle et tarifs`}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            {/* ══ 1. TITRE ══ */}
            <div className="flex flex-col items-center gap-2">
              {brandIcon && (
                <MaskedIcon
                  src={brandIcon}
                  w="clamp(48px, 6vw, 88px)"
                  h="clamp(48px, 6vw, 88px)"
                  color="white"
                />
              )}
              <h1 className="text-[1.75rem] md:text-[2.25rem] text-center font-light leading-tight">
                {h1Prefix && <>{h1Prefix}{' '}</>}
                <span className="text-accent">{h1Brand}</span>
                {locale === 'en' ? ' pricing' : ' prix'}
              </h1>
            </div>

            {/* ══ 2. PROGRESSION ══ */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-full flex items-center justify-center py-1">
                <Link
                  href={breadcrumbHref}
                  className="absolute left-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  style={{ fontSize: 13, color: '#909090' }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/ui/icon-chevron-left.svg" alt="" aria-hidden style={{ height: 14, width: 14, objectFit: 'contain' }} />
                  <span>{UI.backLabel}</span>
                </Link>
                <span className="font-light" style={{ fontSize: 'clamp(13px, 1.4vw, 22px)', color: '#a8a8a8' }}>
                  {breadcrumbLabel}
                </span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/ui/icon-chevron-down.svg" alt="" aria-hidden style={{ height: 'clamp(20px, 2.5vw, 32px)', width: 'auto', objectFit: 'contain' }} />
            </div>

            {/* ══ 3. SÉLECTION + RECHERCHE ══ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
              <p className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight shrink-0">
                {UI.selectModel}
              </p>
              <RepairModelSearch
                inputId={`${h1Brand.toLowerCase().replace(/\s+/g, '-')}-search`}
                placeholder={searchPlaceholder}
                className="w-full md:max-w-[520px]"
                locale={locale}
                onSelect={handleSearchSelect}
              />
            </div>

            {/* ══ 4. SOUS-TEXTE ══ */}
            <p className="text-center font-light text-sm -mt-4" style={{ color: '#909090' }}>
              {UI.orSelect}
            </p>

            {/* ══ 5. BOUTONS FAMILLES — identique iPhone ══ */}
            <div className="flex flex-col gap-5">
              <div ref={dropdownRef} className="flex flex-col gap-4">

                {/* Premières familles — toujours visibles */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {families.slice(0, INITIAL).map(fam => renderFamily(fam))}
                </div>

                {/* Familles supplémentaires — GSAP contrôle hauteur + opacité */}
                {hasMore && (
                  <div ref={extraRef} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {families.slice(INITIAL).map(fam => renderFamily(fam))}
                  </div>
                )}

              </div>

              {hasMore && (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setShowAll(prev => !prev)}
                    className="flex items-center gap-1.5 text-sm font-light focus-visible:outline-none"
                    style={{ color: '#909090' }}
                  >
                    <span>
                      {showAll
                        ? UI.seeLess
                        : UI.seeMore(families.length - INITIAL)}
                    </span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/ui/icon-chevron-down.svg" alt="" aria-hidden
                      style={{ height: 12, width: 12, objectFit: 'contain', transform: showAll ? 'rotate(180deg)' : undefined, transition: 'transform 200ms ease' }}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* ══ 6. PANNEAU TARIFS — identique iPhone ══ */}
            {selectedModel && (
              <div ref={tariffRef} className="flex flex-col gap-10">

                <div className="flex justify-end">
                  <ShareButton
                    title={locale === 'en' ? `${normalizeModelLabel(selectedModel.label, locale)} Repair — ClikClak Lausanne` : `Réparation ${selectedModel.label} — ClikClak Lausanne`}
                    text={locale === 'en' ? `Repair pricing for ${normalizeModelLabel(selectedModel.label, locale)} at ClikClak in Lausanne.` : `Tarifs de réparation pour ${selectedModel.label} chez ClikClak à Lausanne.`}
                    url={`?model=${selectedModelId}`}
                    locale={locale}
                  />
                </div>

                <div style={{ border: '1px solid #5a5a5a', borderRadius: 4 }}>
                  <div className="flex flex-col items-center gap-6 px-8 pt-8 pb-6">
                    <h2 className="text-[1.5rem] md:text-[2rem] text-center font-light leading-tight">
                      {UI.repairTitle(normalizeModelLabel(selectedModel.label, locale)).split(normalizeModelLabel(selectedModel.label, locale)).map((part, i, arr) =>
                        i < arr.length - 1
                          ? <span key={i}>{part}<span className="text-accent">{normalizeModelLabel(selectedModel.label, locale)}</span></span>
                          : <span key={i}>{part}</span>
                      )}
                    </h2>
                    <hr className="w-full" style={{ borderColor: 'rgba(242,242,242,0.15)' }} />
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-6 md:px-10 pb-8">

                    {(screenRepair || batteryRepair) && (
                      <div className="flex-1 flex flex-col gap-5 min-w-0">
                        {screenRepair && (
                          <MainRepairCard
                            repair={{ name: screenRepair.label, subtitle: UI.screenSub, price: formatPrice(screenRepair.price) }}
                            modelLabel={normalizeModelLabel(selectedModel.label, locale)}
                            variant="screen"
                            locale={locale}
                          />
                        )}
                        {batteryRepair && (
                          <MainRepairCard
                            repair={{ name: batteryRepair.label, subtitle: UI.batterySub, price: formatPrice(batteryRepair.price) }}
                            modelLabel={normalizeModelLabel(selectedModel.label, locale)}
                            variant="battery"
                            locale={locale}
                          />
                        )}
                      </div>
                    )}

                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex flex-col">
                        {otherRepairs.map(repair => (
                          <div
                            key={repair.label}
                            className="flex items-center justify-between py-2.5"
                            style={{ borderBottom: '1px solid rgba(242,242,242,0.07)' }}
                          >
                            <span className="font-light" style={{ fontSize: 'clamp(15px, 1.3vw, 16px)', color: '#b0b0b0' }}>
                              {getRepairLabel(repair.label, locale)}
                            </span>
                            <span className="font-light whitespace-nowrap ml-4" style={{ fontSize: 'clamp(15px, 1.3vw, 16px)', color: priceColor(getRepairPrice(repair.price, locale)) }}>
                              {getRepairPrice(repair.price, locale)}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex">
                        <ContactPopover locale={locale} />
                      </div>
                    </div>

                  </div>
                </div>

                {UI.repairNote_ && (
                  <p className="text-center mx-auto" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)', color: '#a5a5a5', maxWidth: 640, lineHeight: 1.6 }}>
                    {UI.repairNote_}
                  </p>
                )}
              </div>
            )}

          </div>
        </section>
      </main>

      {bottomSlot}
      <RepairEngagements locale={locale} />
      <SiteFooter locale={locale} />
      <SectionPinning />
    </>
  )
}
