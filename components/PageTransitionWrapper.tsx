'use client'

/*
  PageTransitionWrapper — animation d'entrée sur chaque changement de route.

  Déclencheur : usePathname() change → useLayoutEffect joue l'animation.
  useLayoutEffect (pas useEffect) : la propriété opacity:0 est appliquée avant
  le premier paint du navigateur → zéro flash visible.

  Premier rendu ignoré :
    Le Preloader couvre la page pendant le chargement initial.
    Rejouer l'animation au montage est inutile et crée un conflit de timing.
    isFirstRender.current = true → skipped → reset à false.

  Animations :
    opacity 0 → 1 + y 8px → 0  (400ms, power2.out)
    clearProps 'transform,opacity' : retire les inline styles GSAP après
    l'animation pour éviter tout effet parasite sur le scroll/layout.

  prefers-reduced-motion : skip complet.
*/

import { useRef, useLayoutEffect } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

export default function PageTransitionWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname      = usePathname()
  const wrapRef       = useRef<HTMLDivElement>(null)
  const isFirstRender = useRef(true)

  useLayoutEffect(() => {
    /* Ignore le premier rendu — le preloader gère l'arrivée initiale */
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const el = wrapRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    gsap.fromTo(
      el,
      { opacity: 0, y: 8 },
      {
        opacity:     1,
        y:           0,
        duration:    0.4,
        ease:        'power2.out',
        clearProps:  'transform,opacity',
      },
    )
  }, [pathname])

  return <div ref={wrapRef}>{children}</div>
}
