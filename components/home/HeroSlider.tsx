'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { Button } from '@/components/ui/Button'
import HeroPagination from './HeroPagination'
import ContactPopover from './ContactPopover'
import type { HeroSlide } from '@/data/heroSlides'

/*
  HeroSlider — GSAP crossfade images + stagger text reveal + auto-slide 3s.

  Auto-slide:
    Interval  : 3000ms, boucle infinie (0→1→2→3→0).
    Pause     : hover ou focus clavier dans le slider (pausedRef).
    Reset     : timer redémarre proprement après clic manuel (chevron / dot).
    Guard     : ticks ignorés si une transition est déjà active (transitioningRef).
    Reduced   : désactivé si prefers-reduced-motion: reduce.
    Cleanup   : clearInterval au unmount.

  Stale closure évité :
    goToRef        ← mis à jour à chaque render, lu par le callback setInterval.
    currentRef     ← miroir de current state, mis à jour via useEffect.
    transitioningRef ← miroir + set immédiat dans goTo pour sync sans attendre render.

  Image transition (durée globale 1.2s) :
    Outgoing : autoAlpha 1→0, x 0→40, scale 1→0.985,  0.9s,  power2.out
    Incoming  : autoAlpha 0→1, x -90→0, scale 1.025→1, 1.2s,  expo.out
    Le overflow:hidden du container clip le mouvement x — effet slide propre.

  Text reveal (entrant, synchronisé avec l'image) :
    title : start 0.10s, y:14→0, opacity:0→1, 0.75s, power3.out → fin 0.85s
    desc  : start 0.25s, y:10→0, opacity:0→1, 0.75s, power3.out → fin 1.00s
    ctas  : start 0.40s, y:7→0,  opacity:0→1, 0.75s, power3.out → fin 1.15s ≈ image

  Single H1 rule: slide.isH1 → <h1 id="hero-title">, else <p> styled identically.
*/

const INTERVAL_MS = 4500

type Props = {
  slides: HeroSlide[]
}

export default function HeroSlider({ slides }: Props) {
  const [current,       setCurrent]       = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [popupOpen,     setPopupOpen]     = useState(false)
  const popupRef = useRef<HTMLDivElement>(null)

  /* Refs — un par slide */
  const imgRefs  = useRef<(HTMLDivElement | null)[]>([])
  const textRefs = useRef<(HTMLDivElement | null)[]>([])

  /* GSAP timeline en vol */
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  /* Refs stables lisibles depuis les closures setInterval */
  const currentRef       = useRef(0)
  const transitioningRef = useRef(false)
  const pausedRef        = useRef(false)
  const reducedRef       = useRef(false)
  const intervalRef      = useRef<ReturnType<typeof setInterval> | null>(null)

  /* goToRef — pointe toujours vers le goTo le plus récent */
  const goToRef = useRef<(n: number) => void>(() => {})

  /* Sync miroirs */
  useEffect(() => { currentRef.current = current },             [current])
  useEffect(() => { transitioningRef.current = transitioning }, [transitioning])

  /* ── Transition cœur ─────────────────────────────────────── */
  const goTo = useCallback((next: number) => {
    if (next === current || transitioning) return
    const prev = current

    const imgOut  = imgRefs.current[prev]
    const imgIn   = imgRefs.current[next]
    const textOut = textRefs.current[prev]
    const textIn  = textRefs.current[next]
    if (!imgOut || !imgIn || !textOut || !textIn) return

    setCurrent(next)                    /* dots synchronisés immédiatement */
    setPopupOpen(false)                 /* ferme le popup au changement de slide */
    setTransitioning(true)
    transitioningRef.current = true   /* sync immédiat — pas d'attente render */
    tlRef.current?.kill()

    if (reducedRef.current) {
      gsap.set(imgOut,  { autoAlpha: 0 })
      gsap.set(imgIn,   { autoAlpha: 1, scale: 1, x: 0 })
      gsap.set(textOut, { autoAlpha: 0 })
      gsap.set(textIn,  { autoAlpha: 1, y: 0 })
      setTransitioning(false)
      transitioningRef.current = false
      return
    }

    gsap.set(imgIn,  { autoAlpha: 0, x: -90, scale: 1.025 })
    gsap.set(textIn, { autoAlpha: 1, y: 0 })   /* reset y wrapper avant reveal individuel */
    const titleIn = textIn.querySelector<HTMLElement>('.slide-title')
    const descIn  = textIn.querySelector<HTMLElement>('.slide-desc')
    const ctasIn  = textIn.querySelector<HTMLElement>('.slide-ctas')
    if (titleIn) gsap.set(titleIn, { y: 10, opacity: 0 })
    if (descIn)  gsap.set(descIn,  { y: 8,  opacity: 0 })
    if (ctasIn)  gsap.set(ctasIn,  { y: 6,  opacity: 0 })

    /*  Durée globale : 1.2s
        Image out : 0s → 0.90s  (power2.out)  — x 0→40, autoAlpha 1→0, scale→0.985
        Image in  : 0s → 1.20s  (expo.out)    — x -90→0, autoAlpha 0→1, scale 1.025→1
        Text out  : 0s → 0.40s  (power2.out)  — autoAlpha 0, y 0→-6
        Title     : 0.08s → 0.93s  (power2.out)  stagger 0.09s
        Desc      : 0.17s → 1.02s  (power2.out)
        CTAs      : 0.26s → 1.11s  (power2.out) ≈ fin image in              */
    const tl = gsap.timeline({
      onComplete: () => {
        setTransitioning(false)
        transitioningRef.current = false
      },
    })

    tl.to(imgOut,  { autoAlpha: 0, x: 40, scale: 0.985, duration: 0.9,  ease: 'power2.out' }, 0)
    tl.to(imgIn,   { autoAlpha: 1, x: 0,  scale: 1,     duration: 1.2,  ease: 'expo.out'   }, 0)
    tl.to(textOut, { autoAlpha: 0, y: -6,              duration: 0.40,  ease: 'power2.out' }, 0)

    if (titleIn) tl.to(titleIn, { y: 0, opacity: 1, duration: 0.85, ease: 'power2.out' }, 0.08)
    if (descIn)  tl.to(descIn,  { y: 0, opacity: 1, duration: 0.85, ease: 'power2.out' }, 0.17)
    if (ctasIn)  tl.to(ctasIn,  { y: 0, opacity: 1, duration: 0.85, ease: 'power2.out' }, 0.26)

    tlRef.current = tl
  }, [current, transitioning])

  /* Garde goToRef à jour */
  useEffect(() => { goToRef.current = goTo }, [goTo])

  /* ── Timer auto-slide ─────────────────────────────────────── */
  const startTimer = useCallback(() => {
    if (reducedRef.current) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (pausedRef.current || transitioningRef.current) return
      goToRef.current((currentRef.current + 1) % slides.length)
    }, INTERVAL_MS)
  }, [slides.length])

  /* ── Init au mount ────────────────────────────────────────── */
  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    /* GSAP — cache tous les slides sauf le 0 */
    slides.forEach((_, i) => {
      const img  = imgRefs.current[i]
      const text = textRefs.current[i]
      if (!img || !text) return
      if (i === 0) {
        gsap.set(img,  { autoAlpha: 1, scale: 1, x: 0 })
        gsap.set(text, { autoAlpha: 1, y: 0 })
        const title = text.querySelector<HTMLElement>('.slide-title')
        const desc  = text.querySelector<HTMLElement>('.slide-desc')
        const ctas  = text.querySelector<HTMLElement>('.slide-ctas')
        if (title) gsap.set(title, { y: 0, opacity: 1 })
        if (desc)  gsap.set(desc,  { y: 0, opacity: 1 })
        if (ctas)  gsap.set(ctas,  { y: 0, opacity: 1 })
      } else {
        gsap.set(img,  { autoAlpha: 0, scale: 1.025, x: 0 })
        gsap.set(text, { autoAlpha: 0, y: 0 })
      }
    })

    /* GSAP init popup — caché, sera animé à l'ouverture */
    if (popupRef.current) {
      gsap.set(popupRef.current, { autoAlpha: 0, y: 8, scale: 0.97, transformOrigin: 'bottom center' })
    }

    startTimer()

    return () => {
      tlRef.current?.kill()
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ── Popup GSAP open / close ──────────────────────────────── */
  useEffect(() => {
    const popup = popupRef.current
    if (!popup) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (popupOpen) {
      if (reduced) gsap.set(popup, { autoAlpha: 1, y: 0, scale: 1 })
      else         gsap.to(popup,  { autoAlpha: 1, y: 0, scale: 1, duration: 0.32, ease: 'power2.out' })
    } else {
      if (reduced) gsap.set(popup, { autoAlpha: 0, y: 8, scale: 0.97 })
      else         gsap.to(popup,  { autoAlpha: 0, y: 6, scale: 0.97, duration: 0.2, ease: 'power2.in' })
    }
  }, [popupOpen])

  /* ── Popup clic extérieur + Escape ───────────────────────── */
  useEffect(() => {
    if (!popupOpen) return
    const onKey  = (e: KeyboardEvent) => { if (e.key === 'Escape') setPopupOpen(false) }
    const onDown = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopupOpen(false)
      }
    }
    document.addEventListener('keydown',    onKey)
    document.addEventListener('mousedown',  onDown)
    return () => {
      document.removeEventListener('keydown',   onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [popupOpen])

  /* ── Navigation manuelle — reset timer après chaque clic ──── */
  const handlePrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length)
    startTimer()
  }, [current, goTo, slides.length, startTimer])

  const handleNext = useCallback(() => {
    goTo((current + 1) % slides.length)
    startTimer()
  }, [current, goTo, slides.length, startTimer])

  const handleDotClick = useCallback((i: number) => {
    goTo(i)
    startTimer()
  }, [goTo, startTimer])

  /* ── Swipe mobile ────────────────────────────────────────── */
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    touchStartRef.current = { x: t.clientX, y: t.clientY }
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return
    const t = e.changedTouches[0]
    const dx = t.clientX - touchStartRef.current.x
    const dy = t.clientY - touchStartRef.current.y
    touchStartRef.current = null
    /* Seuil 50px ; mouvement horizontal dominant (|dx| > |dy|) */
    if (Math.abs(dx) < 50 || Math.abs(dx) <= Math.abs(dy)) return
    if (dx < 0) handleNext()
    else handlePrev()
  }, [handleNext, handlePrev])

  /* ── Pause / reprise hover + focus ───────────────────────── */
  const onEnter    = useCallback(() => { pausedRef.current = true  }, [])
  const onLeave    = useCallback(() => { pausedRef.current = false }, [])
  const onFocusIn  = useCallback(() => { pausedRef.current = true  }, [])
  const onFocusOut = useCallback((e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) pausedRef.current = false
  }, [])

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onFocusIn}
      onBlur={onFocusOut}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Inner grid — image | pagination (mobile) | text ──────── */}
      <div
        className="
          relative
          grid grid-cols-1
          md:grid-cols-2
          md:gap-x-10 lg:gap-x-14
          md:px-8 lg:px-12
        "
      >
        {/* Image stack */}
        <div
          className="
            relative hero-animate
            md:row-start-1 md:col-start-1
            md:self-start
          "
        >
          <div className="relative w-full overflow-hidden aspect-[16/10] md:aspect-[4/3]">
            {slides.map((slide, i) => (
              <div
                key={slide.image}
                ref={el => { imgRefs.current[i] = el }}
                className="absolute inset-0"
                style={{ willChange: 'opacity, transform' }}
              >
                <Image
                  src={slide.image}
                  alt={slide.imageAlt}
                  fill
                  priority={i === 0}
                  className="object-contain object-center md:object-right"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>

          {/* Chevrons mobile */}
          <button
            type="button"
            aria-label="Slide précédent"
            onClick={handlePrev}
            className="md:hidden absolute left-2 top-1/2 -translate-y-1/2 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/ui/icon-chevron_hero-left.svg" alt="" width={42} height={42} />
          </button>
          <button
            type="button"
            aria-label="Slide suivant"
            onClick={handleNext}
            className="md:hidden absolute right-2 top-1/2 -translate-y-1/2 z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/ui/icon-chevron_hero-right.svg" alt="" width={42} height={42} />
          </button>
        </div>

        {/* Pagination mobile */}
        <div className="md:hidden py-2 px-4">
          <HeroPagination current={current} total={slides.length} onDotClick={handleDotClick} />
        </div>

        {/* Text stack — col 2 desktop */}
        <div
          className="
            relative
            md:row-start-1 md:col-start-2
            md:self-center
          "
        >
          {slides.map((slide, i) => {
            const TitleTag = slide.isH1 ? 'h1' : 'p'
            return (
              <div
                key={slide.image}
                ref={el => { textRefs.current[i] = el }}
                className="
                  px-4 pt-1 pb-2 text-center
                  md:px-0 md:pt-0 md:pb-0 md:text-left
                "
                style={{
                  position:   i === 0 ? 'relative' : 'absolute',
                  top:        i === 0 ? undefined : 0,
                  left:       i === 0 ? undefined : 0,
                  right:      i === 0 ? undefined : 0,
                  willChange: 'opacity',
                }}
              >
                <TitleTag
                  {...(slide.isH1 ? { id: 'hero-title' } : {})}
                  className="
                    slide-title
                    text-[1.875rem] leading-tight font-semibold tracking-tight
                    sm:text-[2.125rem]
                    md:text-[2.25rem]
                    lg:text-[2.625rem]
                    xl:text-[2.875rem]
                  "
                >
                  {slide.title}
                </TitleTag>
                {/* slide-desc — animé par GSAP. Desktop : paragraphe. Mobile : bouton "Voir détails". */}
                <div
                  className="
                    slide-desc
                    mt-4 md:mt-5
                  "
                >
                  {/* Desktop */}
                  <p className="hidden md:block text-sm leading-relaxed text-grey-light sm:text-base md:text-base max-w-[38ch] md:mx-0">
                    {slide.desc}
                  </p>
                  {/* Mobile */}
                  <button
                    type="button"
                    aria-expanded={popupOpen && i === current}
                    onClick={() => { if (i === current) setPopupOpen(prev => !prev) }}
                    className="md:hidden text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                    style={{ color: '#ccff33' }}
                  >
                    Voir détails
                  </button>
                </div>
                <div className="slide-ctas flex gap-3 justify-center mt-4 md:mt-6 md:justify-start">
                  <Button href={slide.ctaPrimary.href} size="lg">
                    {slide.ctaPrimary.label}
                  </Button>
                  {/* Contact ouvre un menu d'action (tel, itinéraire, adresse) */}
                  {slide.ctaSecondary.label === 'Contact' ? (
                    <ContactPopover closeSignal={current} />
                  ) : (
                    <Button href={slide.ctaSecondary.href} size="lg" variant="secondary">
                      {slide.ctaSecondary.label}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Chevrons desktop */}
        <button
          type="button"
          aria-label="Slide précédent"
          onClick={handlePrev}
          className="hidden md:block absolute left-[2px] top-1/2 -translate-y-1/2 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ui/icon-chevron_hero-left.svg" alt="" width={36} height={36} />
        </button>
        <button
          type="button"
          aria-label="Slide suivant"
          onClick={handleNext}
          className="hidden md:block absolute right-[2px] top-1/2 -translate-y-1/2 z-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/ui/icon-chevron_hero-right.svg" alt="" width={36} height={36} />
        </button>
      </div>

      {/* Pagination desktop */}
      <div className="hidden md:block pt-12 pb-8 px-8 lg:px-12">
        <HeroPagination current={current} total={slides.length} onDotClick={handleDotClick} />
      </div>

      {/* Popup mobile "Voir détails" — fixed, toujours dans le DOM, GSAP gère autoAlpha.
          Positionné au-dessus de la ligne de pictos (bottom-4 + 56px = 72px).
          Fermeture : clic extérieur, Escape, changement de slide.                    */}
      <div
        ref={popupRef}
        className="md:hidden fixed inset-x-3 z-[60] rounded-xl p-5"
        style={{
          bottom:              '92px',
          background:          'rgba(25,25,25,0.92)',
          border:              '1px solid rgba(242,242,242,0.22)',
          backdropFilter:      'blur(10px)',
          WebkitBackdropFilter:'blur(10px)',
        }}
        role="tooltip"
        aria-live="polite"
      >
        <p style={{ color: '#f2f2f2', fontSize: '15px', lineHeight: 1.55 }}>
          {slides[current].desc}
        </p>
      </div>
    </div>
  )
}
