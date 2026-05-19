'use client'

/*
  BrandPricingClient — composant générique pour les pages de prix de réparation.
  Utilisé par Samsung, OPPO, Huawei, MacBook, iPad.
  Architecture identique à /services/reparation-iphone :
    - Familles (boutons grille) → Dropdown modèles → Panneau tarifs animé (GSAP)

  Mode "sélection directe" (iPad) :
    Si un family a un seul model dont model.id === family.id, le clic sur le bouton
    sélectionne directement sans ouvrir un dropdown.
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
import type { SearchableModel } from '@/lib/repairSearch'

/* ── Types ─────────────────────────────────────────────────────────────────── */
export type GenericRepair = { name: string; price: string }
export type GenericModel  = { id: string; label: string; familyId: string; repairs: GenericRepair[] }
export type GenericFamily = { id: string; label: string; shortLabel: string }

export interface BrandPricingClientProps {
  brand:              string       /* 'Samsung', 'OPPO', 'Huawei', 'MacBook', 'iPad' */
  h1Prefix:           string       /* texte gris avant la marque dans le H1 */
  h1Brand:            string       /* texte lime du H1 (nom de la marque) */
  breadcrumbLabel:    string       /* centre du breadcrumb */
  breadcrumbHref:     string       /* lien Retour */
  families:           GenericFamily[]
  models:             GenericModel[]
  defaultModelId:     string
  initialFamilyCount?: number      /* familles visibles sans "Voir plus" (défaut : toutes) */
  repairNote?:        string       /* note sous le panneau tarifs */
  searchPlaceholder?: string
}

/* ── Dropdown modèles — animation GSAP identique au pattern iPhone ─────────── */
function GenDropdown({
  models, open, selectedId, onSelect,
}: {
  models: GenericModel[]
  open: boolean
  selectedId: string
  onSelect: (id: string) => void
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
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src="/assets/ui/icon-check.svg" alt="" aria-hidden style={{ height: 14, width: 14, objectFit: 'contain' }} />
          )}
        </button>
      ))}
    </div>
  )
}

/* ── Couleur prix ────────────────────────────────────────────────────────────  */
function priceColor(price: string): string {
  if (price.startsWith('CHF')) return '#ccff33'
  return 'rgba(242,242,242,0.45)'
}

/* ══════════════════════════════════════════════════════════════════════════════
   Composant principal
══════════════════════════════════════════════════════════════════════════════ */
export default function BrandPricingClient({
  brand, h1Prefix, h1Brand,
  breadcrumbLabel, breadcrumbHref,
  families, models,
  defaultModelId,
  initialFamilyCount,
  repairNote,
  searchPlaceholder = 'Rechercher mon appareil...',
}: BrandPricingClientProps) {
  const router       = useRouter()
  const INITIAL      = initialFamilyCount ?? families.length
  const hasMore      = families.length > INITIAL

  const [openFamilyId,   setOpenFamilyId]   = useState<string | null>(null)
  const [selectedModelId, setSelectedModelId] = useState(defaultModelId)
  const [showAll,        setShowAll]         = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)
  const tariffRef   = useRef<HTMLDivElement>(null)
  const extraRef    = useRef<HTMLDivElement>(null)

  const selectedModel = models.find(m => m.id === selectedModelId)

  /* Animation panneau tarifs */
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

  /* Masquage initial des familles supplémentaires */
  useLayoutEffect(() => {
    if (!hasMore) return
    const el = extraRef.current
    if (!el) return
    gsap.set(el, { height: 0, overflow: 'hidden', opacity: 0, pointerEvents: 'none' })
  }, [hasMore])

  /* Animation "Voir plus / moins" */
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
      const btns = el.querySelectorAll('.gen-family-btn')
      gsap.fromTo(btns,
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.35, ease: 'power2.out', stagger: 0.035, delay: 0.06 })
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
  }, [showAll, hasMore])

  /* Sélection centralisée */
  function selectModelAndScroll(modelId: string) {
    const model = models.find(m => m.id === modelId)
    if (!model) return
    const famIdx = families.findIndex(f => f.id === model.familyId)
    if (famIdx >= INITIAL) setShowAll(true)
    setSelectedModelId(modelId)
    requestAnimationFrame(() => {
      const el = tariffRef.current
      if (!el) return
      const y = el.getBoundingClientRect().top + window.scrollY - 24
      window.scrollTo({ top: y, behavior: 'smooth' })
    })
  }

  /* Clic sur une famille */
  function handleFamilyClick(familyId: string) {
    const familyModels = models.filter(m => m.familyId === familyId)
    if (familyModels.length === 1 && familyModels[0].id === familyId) {
      /* Sélection directe (iPad) */
      setOpenFamilyId(null)
      selectModelAndScroll(familyModels[0].id)
    } else {
      /* Dropdown (Samsung, OPPO, Huawei, MacBook) */
      setOpenFamilyId(prev => prev === familyId ? null : familyId)
    }
  }

  function handleSelectModel(modelId: string) {
    setOpenFamilyId(null)
    selectModelAndScroll(modelId)
  }

  const closeDropdown = useCallback(() => setOpenFamilyId(null), [])

  /* Clic extérieur */
  useEffect(() => {
    if (!openFamilyId) return
    const onDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) closeDropdown()
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [openFamilyId, closeDropdown])

  /* Escape */
  useEffect(() => {
    if (!openFamilyId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeDropdown() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openFamilyId, closeDropdown])

  /* Paramètre URL ?model= */
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get('model')
    if (!param) return
    const timer = setTimeout(() => selectModelAndScroll(param), 450)
    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // mount uniquement — selectModelAndScroll intentionnellement exclu

  /* Recherche — navigation cross-brand si le modèle n'est pas dans cette page */
  function handleSearchSelect(result: SearchableModel) {
    const local = models.find(m => m.id === result.modelId)
    if (local) {
      selectModelAndScroll(result.modelId)
    } else {
      router.push(result.href)
    }
  }


  /* ── Render d'une grille de familles ── */
  function FamilyGrid({ fams }: { fams: GenericFamily[] }) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {fams.map(fam => {
          const isOpen      = fam.id === openFamilyId
          const famModels   = models.filter(m => m.familyId === fam.id)
          const isDirect    = famModels.length === 1 && famModels[0].id === fam.id
          const isSelected  = isDirect && famModels[0].id === selectedModelId
          return (
            <div key={fam.id} className="relative">
              <button
                type="button"
                onClick={() => handleFamilyClick(fam.id)}
                className="gen-family-btn repair-tab-btn focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                style={{
                  border: (isOpen || isSelected)
                    ? '1px solid rgba(242,242,242,0.35)'
                    : '1px solid rgba(242,242,242,0.06)',
                }}
              >
                <span style={{ color: '#ccff33' }}>{fam.shortLabel}</span>
              </button>
              {!isDirect && (
                <GenDropdown
                  models={famModels}
                  open={isOpen}
                  selectedId={selectedModelId}
                  onSelect={handleSelectModel}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <Header />

      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={`Réparation ${brand} — sélection du modèle et tarifs`}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            {/* ══ 1. TITRE ══ */}
            <h1 className="text-[1.75rem] md:text-[2.25rem] text-center font-light leading-tight">
              {h1Prefix && <>{h1Prefix}{' '}</>}
              <span className="text-accent">{h1Brand}</span>
              {' '}prix
            </h1>

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
                  <span>Retour</span>
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
                Sélectionnez votre modèle
              </p>
              <RepairModelSearch
                inputId={`${brand.toLowerCase()}-search`}
                placeholder={searchPlaceholder}
                className="w-full md:max-w-[520px]"
                onSelect={handleSearchSelect}
              />
            </div>

            {/* ══ 4. SOUS-TEXTE ══ */}
            <p className="text-center font-light text-sm -mt-4" style={{ color: '#909090' }}>
              Ou sélectionnez votre appareil ici
            </p>

            {/* ══ 5. FAMILLES ══ */}
            <div className="flex flex-col gap-5">
              <div ref={dropdownRef} className="flex flex-col gap-4">
                <FamilyGrid fams={families.slice(0, INITIAL)} />
                {hasMore && (
                  <div ref={extraRef}>
                    <FamilyGrid fams={families.slice(INITIAL)} />
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
                    <span>{showAll ? 'Voir moins...' : `Voir plus de modèles... (${families.length - INITIAL} familles)`}</span>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/assets/ui/icon-chevron-down.svg" alt="" aria-hidden
                      style={{ height: 12, width: 12, objectFit: 'contain', transform: showAll ? 'rotate(180deg)' : undefined, transition: 'transform 200ms ease' }}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* ══ 6. PANNEAU TARIFS ══ */}
            {selectedModel && (
              <div ref={tariffRef} className="flex flex-col gap-10">

                {/* Partager */}
                <div className="flex justify-end">
                  <ShareButton
                    title={`Réparation ${selectedModel.label} — ClikClak Lausanne`}
                    text={`Tarifs de réparation pour ${selectedModel.label} chez ClikClak à Lausanne.`}
                    url={`?model=${selectedModelId}`}
                  />
                </div>

                {/* Panneau tarif */}
                <div style={{ border: '1px solid #5a5a5a', borderRadius: 4 }}>

                  {/* Titre + séparateur */}
                  <div className="flex flex-col items-center gap-6 px-8 pt-8 pb-6">
                    <h2 className="text-[1.5rem] md:text-[2rem] text-center font-light leading-tight">
                      Réparation <span className="text-accent">{selectedModel.label}</span>
                    </h2>
                    <hr className="w-full" style={{ borderColor: 'rgba(242,242,242,0.15)' }} />
                  </div>

                  {/* Liste des réparations */}
                  <div className="flex flex-col md:flex-row gap-6 px-6 md:px-10 pb-8">
                    <div className="flex-1 flex flex-col min-w-0">
                      <div className="flex flex-col">
                        {selectedModel.repairs.map(repair => (
                          <div
                            key={repair.name}
                            className="flex items-center justify-between py-2.5"
                            style={{ borderBottom: '1px solid rgba(242,242,242,0.07)' }}
                          >
                            <span className="font-light" style={{ fontSize: 'clamp(12px, 1.1vw, 16px)', color: '#b0b0b0' }}>
                              {repair.name}
                            </span>
                            <span className="font-light whitespace-nowrap ml-4" style={{ fontSize: 'clamp(12px, 1.1vw, 16px)', color: priceColor(repair.price) }}>
                              {repair.price}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex">
                        <ContactPopover />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {repairNote && (
                  <p className="text-center mx-auto" style={{ fontSize: 'clamp(12px, 1.2vw, 18px)', color: '#a5a5a5', maxWidth: 640, lineHeight: 1.6 }}>
                    {repairNote}
                  </p>
                )}
              </div>
            )}

          </div>
        </section>
      </main>

      <RepairEngagements />
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
