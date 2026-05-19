'use client'

import { useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/*
  SectionPinning — port du pattern GSAP "Slides Pinning Overscroll Solution"
  Source : docs/slides-pinningoverscroll-solution/src/script.js

  Deux modes :

  Mode multi-sections (panels ≥ 2) :
    Cible [data-pin-section]. Le dernier panel est la destination (pas d'effet).
    Chaque panel précédent : pin + scale + fade au scroll.

  Mode single-panel (panels === 1) — utilisé pour le footer Contact :
    Entrance animation scrollée sur le panel unique.
    Le panel lui-même s'anime à l'entrée (autoAlpha 0→1, y 40→0).
    Pas de pinning de section précédente.

  Valeurs multi-panel :
    scale final   : 0.94
    opacity milieu: 0.6
    opacity fin   : 0

  Désactivé sur :
    - mobile (< 768px)
    - prefers-reduced-motion
*/

const SCALE_END   = 0.94
const OPACITY_MID = 0.6

export default function SectionPinning() {
  useLayoutEffect(() => {
    const isMobile = !window.matchMedia('(min-width: 768px)').matches
    const reduced  = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (isMobile || reduced) return

    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      const panels = Array.from(
        document.querySelectorAll<HTMLElement>('[data-pin-section]')
      )

      if (panels.length === 0) return

      /* ── Mode single-panel : entrance animation sur le footer ── */
      if (panels.length === 1) {
        const footer = panels[0]
        gsap.fromTo(
          footer,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y:         0,
            ease:      'none',
            scrollTrigger: {
              trigger: footer,
              start:   'top 92%',
              end:     'top 30%',
              scrub:   1,
            },
          }
        )
        ScrollTrigger.refresh()
        return
      }

      /* ── Mode multi-panels : pin + scale + fade ── */
      const toPin = panels.slice(0, -1)

      toPin.forEach((panel) => {
        const innerPanel  = panel.querySelector<HTMLElement>('[data-pin-inner]')
        const panelHeight = innerPanel ? innerPanel.offsetHeight : panel.offsetHeight
        const winH        = window.innerHeight
        const difference  = panelHeight - winH

        const fakeScrollRatio = difference > 0
          ? difference / (difference + winH)
          : 0

        if (fakeScrollRatio && innerPanel) {
          panel.style.marginBottom = `${panelHeight * fakeScrollRatio}px`
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger:    panel,
            start:      'bottom bottom',
            end:        () =>
              fakeScrollRatio && innerPanel
                ? `+=${innerPanel.offsetHeight}`
                : 'bottom top',
            pinSpacing: false,
            pin:        true,
            scrub:      true,
          },
        })

        if (fakeScrollRatio && innerPanel) {
          tl.to(innerPanel, {
            yPercent: -100,
            y:        winH,
            duration: 1 / (1 - fakeScrollRatio) - 1,
            ease:     'none',
          })
        }

        tl.fromTo(
          panel,
          { scale: 1,         opacity: 1          },
          { scale: SCALE_END, opacity: OPACITY_MID, duration: 0.9 }
        ).to(panel, { opacity: 0, duration: 0.1 })
      })

      ScrollTrigger.refresh()
    })

    return () => ctx.revert()
  }, [])

  return null
}
