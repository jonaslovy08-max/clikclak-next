'use client'

import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/*
  ScrollReveal — wrapper léger pour les animations d'entrée au scroll.

  - opacity 0 → 1, y offset → 0 sur entrée viewport
  - once: true → se déclenche une seule fois
  - prefers-reduced-motion → aucune animation, contenu directement visible
  - useLayoutEffect + gsap.context → cleanup propre sans risque de fuite
  - aucun pin, aucun scrub, aucun layout thrashing
*/

type Props = {
  children:   React.ReactNode
  className?: string
  delay?:     number
  y?:         number
}

export default function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 42,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 1.05,
          delay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start:   'top 62%',
            once:    true,
          },
        },
      )
    }, el)

    return () => ctx.revert()
  }, [delay, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
