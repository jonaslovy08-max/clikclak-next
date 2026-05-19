/* eslint-disable @next/next/no-img-element */
'use client'

import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import Header from '@/components/layout/Header'
import RepairEngagements from '@/components/repair/RepairEngagements'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import RepairFAQ from '@/components/repair/RepairFAQ'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import { iphoneModels, generations, type IphoneModel } from '@/data/iphoneRepairs'
import RepairModelSearch from '@/components/RepairModelSearch'
import { MaskedIcon, MainRepairCard } from '@/components/repair/MainRepairCard'
import { stripCents } from '@/data/repairTypes'

/*
  Page /services/reparation-iphone/
  Container : max-w-6xl mx-auto px-6 md:px-14 lg:px-20 — identique aux autres sections.
  Icônes    : exclusivement depuis /assets/icons/ et /assets/ui/ (aucune icône créée).
              icon-fast-repair.svg   → stroke lime — icône phone+wrench du bloc progression
              icon-chevron-left.svg  → stroke lime
              icon-chevron-down.svg  → stroke lime
              icon-search.svg        → stroke lime
              icon-arrow-up-right.svg → stroke lime
              icon-screen-repair.svg → stroke blanc → CSS mask-image pour carte Écran
              icon-battery.svg       → stroke lime
              icon-repair-action.svg → lime
              icon-diagnostic-action.svg → lime
*/

const DEFAULT_MODEL_ID    = 'iphone-16-pro'
const INITIAL_GEN_COUNT   = 5        /* générations visibles par défaut */


/* MaskedIcon + MainRepairCard importés depuis components/repair/MainRepairCard.tsx */

/* ── Dropdown génération — animation GSAP identique à DesktopNav / ContactPopover
   Correctif bug : pas d'opacity/visibility dans le style JSX (React écrase GSAP au re-render).
   useLayoutEffect pour initialiser avant le premier paint (zéro flash).
   fromTo frais à chaque ouverture : pas de dépendance à l'état d'une timeline précédente. ── */
function GenDropdown({
  models,
  open,
  selectedId,
  onSelect,
}: {
  models: IphoneModel[]
  open: boolean
  selectedId: string
  onSelect: (id: string) => void
}) {
  const panelRef = useRef<HTMLDivElement>(null)
  const animRef  = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)
  const prevOpen = useRef(false)
  const reduced  = useRef(false)

  /* Initialisation avant paint — GSAP seul contrôle opacity/visibility */
  useLayoutEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const panel = panelRef.current
    if (!panel) return
    gsap.set(panel, { autoAlpha: 0, yPercent: -20, scale: 0.85, transformOrigin: 'top left' })
    return () => { animRef.current?.kill(); animRef.current = null }
  }, [])

  /* Ouverture / fermeture — fromTo frais à chaque cycle */
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
            { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.45, ease: 'elastic.out(0.9, 0.4)', transformOrigin: 'top left' },
            0
          )
          .fromTo(items,
            { opacity: 0, y: -6, immediateRender: false },
            { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)', stagger: 0.04 },
            0.08
          )
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
    /* Pas de opacity/visibility dans le style React — GSAP seul les gère */
    <div
      ref={panelRef}
      className="absolute top-full left-0 mt-2 z-20 min-w-full"
      style={{
        backgroundColor: '#1c1c1c',
        border:          '1px solid rgba(242,242,242,0.18)',
        borderRadius:    8,
        overflow:        'hidden',
      }}
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
            <img src="/assets/ui/icon-check.svg" alt="" aria-hidden style={{ height: 14, width: 14, objectFit: 'contain' }} />
          )}
        </button>
      ))}
    </div>
  )
}



/* ══════════════════════════════════════════════════════════════════════════
   Page
══════════════════════════════════════════════════════════════════════════ */
export default function ReparationIphonePage() {
  /* openGenerationId : génération dont le dropdown est ouvert (null = fermé).
     selectedModelId  : modèle affiché dans le panneau tarif.
     Ces deux états sont indépendants — openGenerationId ne modifie jamais selectedModelId. */
  const [openGenerationId, setOpenGenerationId] = useState<string | null>(null)
  const [selectedModelId,  setSelectedModelId]  = useState(DEFAULT_MODEL_ID)
  const [showAllFamilies,  setShowAllFamilies]  = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const tariffRef   = useRef<HTMLDivElement>(null)
  const extraRef    = useRef<HTMLDivElement>(null)

  const selectedModel: IphoneModel | undefined = iphoneModels.find(m => m.id === selectedModelId)

  /* Animation bloc tarifs — se joue uniquement quand selectedModelId change */
  useLayoutEffect(() => {
    const el = tariffRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const kids = Array.from(el.children) as Element[]
    gsap.killTweensOf([el, ...kids])
    /* Même animation que "Voir plus" : container opacity + stagger enfants */
    gsap.fromTo(el,
      { opacity: 0 },
      { opacity: 1, duration: 0.45, ease: 'power2.out' },
    )
    gsap.fromTo(kids,
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.055, delay: 0.06 },
    )
    return () => { gsap.killTweensOf([el, ...kids]) }
  }, [selectedModelId])

  /* Masquage initial des familles supplémentaires avant le premier paint */
  useLayoutEffect(() => {
    const el = extraRef.current
    if (!el) return
    gsap.set(el, { height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' })
  }, [])

  /* Animation apparition / disparition des familles supplémentaires */
  useEffect(() => {
    const el = extraRef.current
    if (!el) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (showAllFamilies) {
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
      const btns = el.querySelectorAll('.gen-family-btn')
      gsap.fromTo(btns,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.035, delay: 0.06 },
      )
    } else {
      gsap.killTweensOf(el)
      if (reduced) {
        gsap.set(el, { height: 0, opacity: 0, overflow: 'hidden', pointerEvents: 'none' })
        return
      }
      gsap.set(el, { overflow: 'hidden', pointerEvents: 'none' })
      const btns = el.querySelectorAll('.gen-family-btn')
      gsap.to(btns, { y: 8, opacity: 0, duration: 0.18, ease: 'power2.in', stagger: 0.02 })
      gsap.to(el, { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.06 })
    }
  }, [showAllFamilies])

  /* Sélection centralisée — même comportement quelle que soit la méthode.
     Expand les familles supplémentaires si besoin, sélectionne le modèle,
     puis scrolle en smooth vers le haut du bloc tarifs (24 px d'offset). */
  function selectModelAndScroll(modelId: string) {
    const model = iphoneModels.find(m => m.id === modelId)
    if (!model) return
    const genIdx = generations.findIndex(g => g.id === model.generation)
    if (genIdx >= INITIAL_GEN_COUNT) setShowAllFamilies(true)
    setSelectedModelId(modelId)
    requestAnimationFrame(() => {
      const el = tariffRef.current
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY - 24
      window.scrollTo({ top: y, behavior: 'smooth' })
    })
  }

  /* Clic génération : toggle dropdown uniquement — pas de scroll */
  function handleGenClick(genId: string) {
    setOpenGenerationId(prev => prev === genId ? null : genId)
  }

  /* Clic modèle depuis dropdown : ferme dropdown + sélection + scroll */
  function handleSelectModel(modelId: string) {
    setOpenGenerationId(null)
    selectModelAndScroll(modelId)
  }

  const closeDropdown = useCallback(() => setOpenGenerationId(null), [])

  useEffect(() => {
    if (!openGenerationId) return
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openGenerationId, closeDropdown])

  useEffect(() => {
    if (!openGenerationId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openGenerationId, closeDropdown])

/* Paramètre URL ?model=iphone-16-pro — sélection automatique au chargement.
     Délai 450 ms : laisse le temps aux animations GSAP d'initialisation de se terminer
     avant de scroller, évitant un conflit avec useLayoutEffect(tariff). */
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('model')
    if (!param) return
    const timer = setTimeout(() => selectModelAndScroll(param), 450)
    return () => clearTimeout(timer)
  }, []) // mount uniquement — selectModelAndScroll est intentionnellement exclu

  return (
    <>
      <Header />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Réparation iPhone — sélection du modèle et tarifs"
        >
          {/* Container identique aux autres sections */}
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            {/* ══ 1. TITRE PRINCIPAL CENTRÉ ══════════════════════════ */}
            <div className="flex flex-col items-center gap-2">
              <MaskedIcon
                src="/assets/icons/icon-iphone.svg"
                w="clamp(48px, 6vw, 88px)"
                h="clamp(48px, 6vw, 88px)"
                color="white"
              />
              <h1 className="text-[1.75rem] md:text-[2.25rem] text-center font-light leading-tight">
                Réparation{' '}
                <span className="text-accent">iPhone</span>{' '}
                prix
              </h1>
            </div>

            {/* ══ 2. BLOC PROGRESSION ════════════════════════════════ */}
            <div className="flex flex-col items-center gap-4">

              {/* Même ligne : Retour (gauche absolu) + Label (centré) */}
              <div className="relative w-full flex items-center justify-center py-1">
                <Link
                  href="/reparation-smartphone-express/"
                  className="absolute left-0 flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                  style={{ fontSize: 13, color: '#909090' }}
                >
                  <img
                    src="/assets/ui/icon-chevron-left.svg"
                    alt=""
                    aria-hidden
                    style={{ height: 14, width: 14, objectFit: 'contain' }}
                  />
                  <span>Retour</span>
                </Link>
                <span
                  className="font-light"
                  style={{ fontSize: 'clamp(13px, 1.4vw, 22px)', color: '#a8a8a8' }}
                >
                  Réparation iPhone Lausanne
                </span>
              </div>

              {/* Chevron lime centré */}
              <img
                src="/assets/ui/icon-chevron-down.svg"
                alt=""
                aria-hidden
                style={{ height: 'clamp(20px, 2.5vw, 32px)', width: 'auto', objectFit: 'contain' }}
              />
            </div>

            {/* ══ 3. SÉLECTIONNEZ + RECHERCHE ════════════════════════ */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-10">
              <p className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight shrink-0">
                Sélectionnez votre modèle
              </p>
              <RepairModelSearch
                inputId="iphone-search"
                placeholder="Rechercher mon appareil..."
                className="w-full md:max-w-[520px]"
                onSelect={result => selectModelAndScroll(result.modelId)}
              />
            </div>

            {/* ══ 4. TEXTE CENTRÉ ════════════════════════════════════ */}
            <p
              className="text-center font-light text-sm -mt-4"
              style={{ color: '#909090' }}
            >
              Ou selectionnez votre appareil ici
            </p>

            {/* ══ 5. BOUTONS GÉNÉRATIONS ═════════════════════════════ */}
            <div className="flex flex-col gap-5">

              {/* dropdownRef englobe les deux grilles pour le clic-extérieur */}
              <div ref={dropdownRef} className="flex flex-col gap-4">

                {/* Premières familles — toujours visibles */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {generations.slice(0, INITIAL_GEN_COUNT).map(gen => {
                    const isOpen    = gen.id === openGenerationId
                    const genNumber = gen.label.replace('iPhone ', '')
                    const genModels = iphoneModels.filter(m => m.generation === gen.id)
                    return (
                      <div key={gen.id} className="relative">
                        <button
                          type="button"
                          onClick={() => handleGenClick(gen.id)}
                          className="gen-family-btn repair-tab-btn gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                          style={{
                            border: isOpen ? '1px solid rgba(242,242,242,0.35)' : '1px solid rgba(242,242,242,0.06)',
                          }}
                        >
                          <span style={{ color: '#c8c8c8' }}>iPhone </span>
                          <span style={{ color: '#ccff33' }}>{genNumber}</span>
                        </button>
                        <GenDropdown models={genModels} open={isOpen} selectedId={selectedModelId} onSelect={handleSelectModel} />
                      </div>
                    )
                  })}
                </div>

                {/* Familles supplémentaires — GSAP contrôle hauteur + opacité */}
                <div ref={extraRef} className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  {generations.slice(INITIAL_GEN_COUNT).map(gen => {
                    const isOpen    = gen.id === openGenerationId
                    const genNumber = gen.label.replace('iPhone ', '')
                    const genModels = iphoneModels.filter(m => m.generation === gen.id)
                    return (
                      <div key={gen.id} className="relative">
                        <button
                          type="button"
                          onClick={() => handleGenClick(gen.id)}
                          className="gen-family-btn repair-tab-btn gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                          style={{
                            border: isOpen ? '1px solid rgba(242,242,242,0.35)' : '1px solid rgba(242,242,242,0.06)',
                          }}
                        >
                          <span style={{ color: '#c8c8c8' }}>iPhone </span>
                          <span style={{ color: '#ccff33' }}>{genNumber}</span>
                        </button>
                        <GenDropdown models={genModels} open={isOpen} selectedId={selectedModelId} onSelect={handleSelectModel} />
                      </div>
                    )
                  })}
                </div>

              </div>

              {/* Voir plus / moins de modèles */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAllFamilies(prev => !prev)}
                  className="flex items-center gap-1.5 text-sm font-light focus-visible:outline-none"
                  style={{ color: '#909090' }}
                >
                  <span>{showAllFamilies ? 'Voir moins...' : `Voir plus de modèles... (${generations.length - INITIAL_GEN_COUNT} familles)`}</span>
                  <img
                    src="/assets/ui/icon-chevron-down.svg"
                    alt=""
                    aria-hidden
                    style={{
                      height: 12, width: 12, objectFit: 'contain',
                      transform: showAllFamilies ? 'rotate(180deg)' : undefined,
                      transition: 'transform 200ms ease',
                    }}
                  />
                </button>
              </div>
            </div>

            {selectedModel && (
              <div ref={tariffRef} className="flex flex-col gap-10">
                {/* ══ 7. PARTAGER (icône PUIS texte, aligné à droite) ═ */}
                <div className="flex justify-end items-center gap-2">
                  <img
                    src="/assets/ui/icon-arrow-up-right.svg"
                    alt=""
                    aria-hidden
                    style={{ height: 18, width: 18, objectFit: 'contain' }}
                  />
                  <button
                    type="button"
                    className="focus-visible:outline-none"
                    style={{ fontSize: 'clamp(13px, 1.5vw, 22px)', color: '#a0a0a0' }}
                  >
                    Partager
                  </button>
                </div>

                {/* ══ 8. PANNEAU TARIF ════════════════════════════════ */}
                <div style={{ border: '1px solid #5a5a5a', borderRadius: 4 }}>

                  {/* Titre centré + séparateur */}
                  <div className="flex flex-col items-center gap-6 px-8 pt-8 pb-6">
                    <h2 className="text-[1.5rem] md:text-[2rem] text-center font-light leading-tight">
                      Réparation iphone{' '}
                      <span className="text-accent">
                        {selectedModel.label.replace('iPhone ', '')}
                      </span>
                    </h2>
                    <hr className="w-full" style={{ borderColor: 'rgba(242,242,242,0.15)' }} />
                  </div>

                  {/* Corps 3 colonnes */}
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8 px-6 md:px-10 pb-8">

                    {/* CENTRE — cartes Écran + Batterie */}
                    <div className="flex-1 flex flex-col gap-5 min-w-0">
                      {selectedModel.mainRepairs.map((repair, i) => (
                        <MainRepairCard
                          key={repair.name}
                          repair={repair}
                          modelLabel={selectedModel.label}
                          variant={i === 0 ? 'screen' : 'battery'}
                        />
                      ))}
                    </div>

                    {/* DROITE — autres réparations + Contact */}
                    <div className="flex-1 flex flex-col min-w-0">
                      {/* Liste réparations avec points */}
                      <div className="flex flex-col">
                        {selectedModel.otherRepairs.map((repair) => (
                          <div
                            key={repair.name}
                            className="flex items-center justify-between py-2.5"
                            style={{
                              borderBottom: '1px solid rgba(242,242,242,0.07)',
                            }}
                          >
                            <span
                              className="font-light"
                              style={{ fontSize: 'clamp(12px, 1.1vw, 16px)', color: '#b0b0b0' }}
                            >
                              {repair.name}
                            </span>
                            <span
                              className="font-light"
                              style={{ fontSize: 'clamp(12px, 1.1vw, 16px)', color: '#c8c8c8' }}
                            >
                              {stripCents(repair.price)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Bouton Contact — ContactPopover existant */}
                      <div className="mt-6 flex">
                        <ContactPopover />
                      </div>
                    </div>

                  </div>
                </div>

                {/* ══ 9. NOTE SOUS LE PANNEAU ══════════════════════════ */}
                <p
                  className="text-center mx-auto"
                  style={{
                    fontSize:   'clamp(12px, 1.2vw, 18px)',
                    color:      '#a5a5a5',
                    maxWidth:   640,
                    lineHeight: 1.6,
                  }}
                >
                  La plupart des réparations sur iPhone sont réalisées en 20 minutes env.
                  sous réserve de disponibilité de pièce en stock.
                </p>
              </div>
            )}

          </div>
        </section>
      </main>

      <RecentShopProducts />
      <RepairEngagements />
      <RepairFAQ />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
