'use client'

import { useEffect, useRef, useState } from 'react'

/*
  CustomCursor — curseur SVG personnalisé, desktop uniquement.

  Activation : (pointer: fine) and (hover: hover) — jamais sur mobile/tablette.

  Positionnement : direct sur mousemove, sans lerp — maniabilité native.
  État normal    : SVG cursor-clikclak.svg, 32px.
  État hover     : SVG disparaît, cercle ⌀18px fond #191919 + bordure #ccff33.

  prefers-reduced-motion :
    - transitions CSS désactivées sur le changement hover (instantané)
*/

const INTERACTIVE =
  'a, button, [role="button"], input[type="submit"], ' +
  '.interactive-card, .interactive-button, [data-cursor="interactive"]'

export default function CustomCursor() {
  const containerRef                    = useRef<HTMLDivElement>(null)
  const [mounted, setMounted]           = useState(false)
  const [hover, setHover]               = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const hoverRef                        = useRef(false)

  useEffect(() => {
    /* ── Vérification device ─────────────────────────────────── */
    const isDesktop = window.matchMedia('(pointer: fine) and (hover: hover)').matches
    if (!isDesktop) return

    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReducedMotion(isReduced)
    setMounted(true)

    /* ── Injection cursor:none ───────────────────────────────── */
    const styleEl = document.createElement('style')
    styleEl.id = 'cc-cursor-none'
    styleEl.textContent =
      'body,a,button,[role="button"],input[type="submit"],' +
      '.interactive-card,.interactive-button,[data-cursor="interactive"]' +
      '{cursor:none!important;}'
    document.head.appendChild(styleEl)

    /* ── Positionnement direct — aucun lerp ─────────────────── */
    const onMouseMove = (e: MouseEvent) => {
      containerRef.current?.style.setProperty(
        'transform',
        `translate3d(${e.clientX}px,${e.clientY}px,0)`,
      )
    }

    /* ── Détection hover ─────────────────────────────────────── */
    const onMouseOver = (e: MouseEvent) => {
      const el = e.target as Element | null
      if (!el) return
      const isInteractive = !!el.closest(INTERACTIVE)
      if (isInteractive !== hoverRef.current) {
        hoverRef.current = isInteractive
        setHover(isInteractive)
      }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true })
    document.addEventListener('mouseover', onMouseOver, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseover', onMouseOver)
      styleEl.remove()
    }
  }, [])

  if (!mounted) return null

  const transition = reducedMotion ? 'none' : 'opacity 200ms ease, transform 200ms ease'

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform',
        transform: 'translate3d(-200px,-200px,0)',
      }}
    >
      {/* ── SVG cursor — état normal ─────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 32,
          height: 32,
          opacity: hover ? 0 : 1,
          transform: hover ? 'scale(0.55)' : 'scale(1)',
          transition,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/ui/cursor-clikclak.svg"
          alt=""
          width={32}
          height={32}
          draggable={false}
        />
      </div>

      {/* ── Cercle hover contrasté ───────────────────────────── */}
      {/* ⌀54px centré sur souris : top/left = -27px             */}
      <div
        style={{
          position: 'absolute',
          top: -27,
          left: -27,
          width: 54,
          height: 54,
          borderRadius: '50%',
          backgroundColor: 'rgba(25,25,25,0.75)',
          border: '1.5px solid #ccff33',
          boxShadow: '0 0 18px rgba(204,255,51,0.28)',
          opacity: hover ? 1 : 0,
          transform: hover ? 'scale(1)' : 'scale(0)',
          transition,
        }}
      />
    </div>
  )
}
