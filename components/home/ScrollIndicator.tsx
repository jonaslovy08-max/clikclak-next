'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'

/*
  ScrollIndicator — chevron "défiler vers les services".

  Hover : BUTTON HOVER spirit (cohérent avec FloatingContactActions).
    scale 1 → 1.14, elastic.out(0.9, 0.4), easeReverse:'power2.out'
    mouseenter → timeScale(1).play()
    mouseleave → timeScale(2.5).reverse()
  prefers-reduced-motion : pas de timeline GSAP, fallback CSS opacity.
*/

export default function ScrollIndicator() {
  const iconRef = useRef<HTMLImageElement>(null)
  const tlRef   = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const icon = iconRef.current
    if (!icon) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.set(icon, { scale: 1, transformOrigin: 'center center' })
    if (!reduced) {
      tlRef.current = gsap.timeline({ paused: true })
        .to(icon, {
          scale:       1.14,
          duration:    0.45,
          ease:        'elastic.out(0.9, 0.4)',
          easeReverse: 'power2.out',
        } as gsap.TweenVars)
    }
    return () => { tlRef.current?.kill(); tlRef.current = null }
  }, [])

  const show = useCallback(() => { tlRef.current?.timeScale(1).play()    }, [])
  const hide = useCallback(() => { tlRef.current?.timeScale(2.5).reverse() }, [])

  return (
    <a
      href="#selection-service"
      aria-label="Défiler vers les services"
      className="flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm p-1"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={iconRef}
        src="/assets/ui/icon-chevron-down.svg"
        alt=""
        aria-hidden
        width={38}
        height={38}
      />
    </a>
  )
}
