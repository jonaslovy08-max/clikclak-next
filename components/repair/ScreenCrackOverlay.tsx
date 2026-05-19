'use client'

/*
  ScreenCrackOverlay — animation de fissure d'écran, /services/reparation-ecran.

  Deux SVG dans le DOM :
    - desktopSvgRef  : affiché sur ≥ 768 px (classes scr1/scr2/scr3)
    - mobileSvgRef   : affiché sur < 768 px  (classes mscr1/mscr2/mscr3/mscr4)
  GSAP anime uniquement le SVG actif détecté par window.matchMedia.

  Déclenchement : window.scrollY >= 80 (scroll listener passif)
    Rejoue après que scrollY repasse sous 40 px (canReplayRef).

  Séquence (par play) :
    reset → overlay 0→0.8 → fills stagger (~2s, gauche→droite)
    → strokes strokeDashoffset+opacity (overlap) → hold 3s → fade 0.65s

  - isAnimatingRef : bloque le double-déclenchement
  - canReplayRef   : réarmé quand scrollY < 40
  - pointer-events: none, scroll non bloqué
  - useLayoutEffect → cleanup synchrone avant unmount
  - prefers-reduced-motion : désactivé
*/

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'

const TRIGGER_Y = 80
const RESET_Y   = 40

export default function ScreenCrackOverlay() {
  const overlayRef     = useRef<HTMLDivElement>(null)
  const desktopSvgRef  = useRef<SVGSVGElement>(null)
  const mobileSvgRef   = useRef<SVGSVGElement>(null)
  const tlRef          = useRef<gsap.core.Timeline | null>(null)
  const isAnimatingRef = useRef(false)
  const canReplayRef   = useRef(true)

  useLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const overlay  = overlayRef.current
    if (!overlay) return

    const isMobile = window.matchMedia('(max-width: 767px)').matches
    const svg      = (isMobile ? mobileSvgRef : desktopSvgRef).current
    if (!svg) return

    const fillEls   = Array.from(svg.querySelectorAll<SVGElement>('polygon, path'))
    const strokeEls = Array.from(svg.querySelectorAll<SVGGeometryElement>('polyline, line'))
    const strokeLengths = strokeEls.map(el => el.getTotalLength())

    const playCrack = () => {
      if (isAnimatingRef.current) return
      isAnimatingRef.current = true
      canReplayRef.current   = false

      tlRef.current?.kill()

      gsap.set(fillEls,  { opacity: 0 })
      strokeEls.forEach((el, i) => {
        gsap.set(el, {
          opacity:          0,
          strokeDasharray:  strokeLengths[i],
          strokeDashoffset: strokeLengths[i],
        })
      })
      gsap.set(overlay, { opacity: 0 })

      const tl = gsap.timeline({
        onComplete: () => { isAnimatingRef.current = false },
      })
        .to(overlay, { opacity: 0.8, duration: 0.25, ease: 'none' })
        .to(fillEls, {
          opacity:  1,
          duration: 0.08,
          stagger:  { each: 0.22, from: 'start' },
          ease:     'none',
        }, '<0.05')
        .to(strokeEls, {
          opacity:          1,
          strokeDashoffset: 0,
          duration:         0.45,
          stagger:          { each: 0.18, from: 'start' },
          ease:             'power1.inOut',
        }, 0.55)
        .to({}, { duration: 3 })
        .to(overlay, { opacity: 0, duration: 0.65, ease: 'power2.in' })

      tlRef.current = tl
    }

    const onScroll = () => {
      const y = window.scrollY
      if (y < RESET_Y) { canReplayRef.current = true; return }
      if (y >= TRIGGER_Y && canReplayRef.current) playCrack()
    }

    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      tlRef.current?.kill()
      tlRef.current = null
    }
  }, [])

  /* ── SVG partagé : attributs communs ───────────────────────── */
  const svgProps = {
    xmlns:               'http://www.w3.org/2000/svg',
    'aria-hidden':       true as const,
    preserveAspectRatio: 'xMidYMid meet' as const,
    style:               { position: 'absolute' as const, inset: 0, width: '100%', height: '100%' },
  }

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         90,
        pointerEvents:  'none',
        opacity:        0,
      }}
    >

      {/* ══ SVG DESKTOP (≥ 768 px) ══════════════════════════════════
          Caché sur mobile via CSS. GSAP anime uniquement si isMobile=false.
      ════════════════════════════════════════════════════════════ */}
      <svg
        ref={desktopSvgRef}
        viewBox="0 0 2558.93 1526.69"
        className="hidden md:block"
        {...svgProps}
      >
        <defs>
          <style>{`
            .scr1,.scr2{fill:none;stroke:#fff;stroke-miterlimit:10}
            .scr3{fill:#fff}
            .scr2{stroke-width:2px}
          `}</style>
        </defs>

        {/* Fills gauche → droite */}
        <path className="scr3" d="M0,809.86c.43-.4,129.26-122.28,129.65-122.65,0,0,.54.22.54.22l49.69,20.66c-4,2.04,168.32-142.41,166.26-140.43,0,0-24.54-270.52-24.54-270.52.07.12,25.44,270.54,25.49,270.68.09,0-167,141.59-166.99,141.65,0,0-.38.32-.38.32,0,0-.46-.19-.46-.19,0,0-49.76-20.5-49.76-20.5,4.14-1.92-129.03,122.44-128.12,122.23,0,0-1.38-1.45-1.38-1.45h0Z" />
        <path className="scr3" d="M1.39,870.19c-.1.22,215.55,63.51,211.88,63.52,0,0,57.36-45,57.36-45,0,0,.54-.43.54-.43,0,0,.56.39.56.39,0,0,103.64,72.16,103.64,72.16-3.51-.25,1098.39-100.08,1097.37-100.17.2-.07,1085.98,415.4,1086.18,415.43.07,0-1086.98-414.74-1086.1-414.53-.1.01-1098.07,100.89-1098.2,100.9-.25-.17-103.69-72.08-103.96-72.26,0,0,1.11-.03,1.11-.03l-57.33,45.05s-.39.31-.39.31c-.44-.13-212.77-63.28-213.24-63.42,0,0,.57-1.92.57-1.92h0Z" />
        <path className="scr3" d="M30.52,784.26c.47.21,102.62,45.75,103.05,45.94-.06.39,24.61,222.73,23.75,220.8.02.1,211.9,135.26,211.93,135.35.04.09,66.07,172.67,66.11,172.77,0,0-66.68-172.44-66.68-172.44.72.68-212.25-134.66-212.12-134.5-1.01-.12-24.22-220.81-24.7-221.29,0,0,.52.71.52.71,0,0-102.67-45.52-102.67-45.52,0,0,.81-1.83.81-1.83h0Z" />
        <path className="scr3" d="M214.48,933.68c-.09.07,349.13,276.2,348.24,275.92,0,0,118.75-52.52,118.75-52.52-.06.06-118.62,52.9-118.69,52.95,0,.02-349.5-274.78-349.54-274.79,0,0,1.24-1.57,1.24-1.57h0Z" />
        <polygon className="scr3" points="243.03 654.66 593.98 830.8 242.14 656.45 243.03 654.66 243.03 654.66" />
        <path className="scr3" d="M446.1,756.39c.07-.06,336.57-362.58,336.92-362.24-.01.06,1260.68-60.82,1260.07-60.64,0,0,360.35-333.51,360.35-333.51-.02.02-360.1,333.97-360.19,333.89.04-.2-1262,62.32-1259.62,61.57-.41-1.25-336.82,367.68-337.53,360.93h0Z" />
        <path className="scr3" d="M751.4,925.84c.21.24,214.18,105.28,214.19,105.67,0,0,181.03,495.18,181.03,495.18.1,0-182.37-495.77-181.61-494.66,0,0-214.48-104.4-214.48-104.4l.88-1.8h0Z" />
        <path className="scr3" d="M963.8,1030.89c-.05-.01,64.84-131.89,64.15-129.06,0,0-433.97-896.84-433.97-896.84,0,0,435.42,896.14,435.42,896.14l.17.35-.17.35s-63.81,129.93-63.81,129.93l-1.79-.88h0Z" />

        {/* Strokes gauche → droite */}
        <polyline className="scr2" points=".69 857.87 132.74 830.8 177.58 806.63 212.03 798.97" />
        <polyline className="scr1" points="1.1 1007.48 146.65 979.21 212.03 798.97 111.35 708.83 1.1 643.47" />
        <polyline className="scr1" points="15.97 796.12 48.53 848.5 51.06 886.02 .69 968.74" />
        <line className="scr1" x1="1792.09" y1="982.62" x2="2043.24" y2="333.67" />
      </svg>

      {/* ══ SVG MOBILE (< 768 px) ════════════════════════════════════
          Version plus épaisse (traits vectorisés plus larges dans Illustrator).
          Caché sur desktop via CSS. GSAP anime uniquement si isMobile=true.
      ════════════════════════════════════════════════════════════ */}
      <svg
        ref={mobileSvgRef}
        viewBox="0 0 2559.96 1526.69"
        className="block md:hidden"
        {...svgProps}
      >
        <defs>
          <style>{`
            .mscr1{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:5px}
            .mscr2{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:4px}
            .mscr3{fill:none;stroke:#fff;stroke-miterlimit:10;stroke-width:2px}
            .mscr4{fill:#fff}
          `}</style>
        </defs>

        {/* Fills gauche → droite */}
        <path className="mscr4" d="M0,808.77s129.33-122.14,129.33-122.14l1.06-1,1.34.56,49.64,20.77-2.09.33,167.59-140.56c-.67,5.03-24.09-270.57-24.26-269.59,0,0,26.17,270.37,26.17,270.37,0,0,.06.6.06.6,0,0-.47.4-.47.4,0,0-166.47,141.89-166.47,141.89,0,0-.94.8-.94.8,0,0-1.15-.47-1.15-.47l-49.81-20.38,2.4-.44L3.44,812.4S0,808.77,0,808.77h0Z" />
        <path className="mscr4" d="M2.84,868.75s212.73,63.41,212.73,63.41c0,0-2.17.41-2.17.41,0,0,57.39-44.97,57.39-44.97,0,0,1.36-1.06,1.36-1.06,0,0,1.41.98,1.41.98,0,0,103.6,72.22,103.6,72.22-7.96-.75,1098.51-99.45,1096.56-99.76.5-.17,1085.73,416.04,1086.25,416.11,0,0-1086.55-413.92-1086.55-413.92,1.95.17-1098.07,101.53-1098.11,101.66,0,0-.67-.46-.67-.46,0,0-103.74-72.02-103.74-72.02l2.77-.08s-57.3,45.08-57.3,45.08c0,0-.97.77-.97.77l-1.19-.35S1.42,873.54,1.42,873.54l1.43-4.79h0Z" />
        <path className="mscr4" d="M32.16,782.89s102.51,45.89,102.51,45.89c0,0,1.16.52,1.16.52l.14,1.26,23.74,220.84s-.8-1.29-.8-1.29c.17.19,211.6,135.74,211.77,135.91.09.23,65.61,172.85,65.71,173.1,0,0-67.13-172.26-67.13-172.26,1.61,1.78-213-134.61-212.93-134.23-.46-.52-24.39-220.92-24.75-221.59,0,0,1.3,1.78,1.3,1.78,0,0-102.75-45.36-102.75-45.36,0,0,2.03-4.57,2.03-4.57h0Z" />
        <path className="mscr4" d="M216.44,932.5c-.17.2,349.36,277.5,347.19,276.81,0,0,118.87-52.23,118.87-52.23,0,0-118.45,53.19-118.45,53.19,0,0-.29.13-.29.13,0,0-.25-.2-.25-.2,0,0-350.17-273.78-350.17-273.78,0,0,3.1-3.93,3.1-3.93h0Z" />
        <polygon className="mscr4" points="244.73 653.31 595.02 830.8 242.5 657.79 244.73 653.31 244.73 653.31" />
        <path className="mscr4" d="M446.03,755.37c1.34-.63,336.23-362.9,337.96-362.39-.07.15,1261.47-60.17,1259.91-59.71C2043.9,333.27,2404.46,0,2404.46,0c-.03.03-359.98,334.42-360.17,334.22-.11-.49-1264.63,63.9-1258.78,62.04,0,0-335.82,362.52-335.82,362.52l-3.66-3.4h0Z" />
        <path className="mscr4" d="M753.09,924.49c.53.59,214.1,105.84,214.12,106.8,0,0,180.43,495.4,180.43,495.4.22-.06-183.76-496.83-181.89-494.09,0,0-214.86-103.62-214.86-103.62,0,0,2.2-4.49,2.2-4.49h0Z" />
        <polygon className="mscr4" points="963.48 1030.23 1027.9 900.59 1027.89 902.37 595.02 4.99 1031.52 900.61 1031.95 901.49 1031.52 902.38 967.97 1032.44 963.48 1030.23 963.48 1030.23" />

        {/* Strokes gauche → droite */}
        <polyline className="mscr1" points="1.72 857.87 133.77 830.8 178.61 806.63 213.07 798.97" />
        <polyline className="mscr2" points="2.13 1007.48 147.68 979.21 213.07 798.97 112.38 708.83 2.13 643.47" />
        <polyline className="mscr2" points="17 796.12 49.56 848.5 52.09 886.02 1.72 968.74" />
        <line className="mscr3" x1="1793.12" y1="982.62" x2="2044.27" y2="333.67" />
      </svg>

    </div>
  )
}
