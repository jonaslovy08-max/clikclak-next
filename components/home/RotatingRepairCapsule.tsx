'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/*
  RotatingRepairCapsule — capsule de réassurance à messages rotatifs.

  Comportement :
    - change de phrase toutes les 2 secondes
    - transition sortante : opacity 1→0, y 0→-8, 0.35s power2.in
    - transition entrante : opacity 0→1, y 8→0, 0.4s power3.out
    - changement de textContent pendant que opacity = 0 (invisible)

  Stabilité layout :
    - min-h sur le <p> pour éviter les sauts de hauteur
    - y ±8px reste dans la zone py-2.5 (10px) — pas de débordement

  Cleanup :
    - clearInterval au démontage
    - ctx.revert() pour tuer les tweens GSAP actifs

  prefers-reduced-motion :
    - désactive toute animation — affichage statique de la première phrase
*/

const PHRASES = [
  'Réparation express en 20 min dans la majorité des cas.',
  'Vos données restent conservées lors de la plupart des réparations.',
  'Écran, batterie, charge : diagnostic rapide en boutique.',
  'Pièces sélectionnées selon votre modèle et la disponibilité.',
  'Réparation smartphone, tablette et ordinateur à Lausanne.',
  'Un doute sur le modèle ? ClikClak vous aide à l’identifier.',
]

export default function RotatingRepairCapsule() {
  const textRef  = useRef<HTMLSpanElement>(null)
  const indexRef = useRef(0)

  useEffect(() => {
    const el = textRef.current
    if (!el) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    let intervalId = 0

    const ctx = gsap.context(() => {
      intervalId = window.setInterval(() => {
        const next = (indexRef.current + 1) % PHRASES.length

        gsap.to(el, {
          opacity:  0,
          y:        -8,
          duration: 0.35,
          ease:     'power2.in',
          onComplete: () => {
            indexRef.current = next
            el.textContent   = PHRASES[next]
            gsap.fromTo(
              el,
              { opacity: 0, y: 8 },
              { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
            )
          },
        })
      }, 4000)
    })

    return () => {
      clearInterval(intervalId)
      ctx.revert()
    }
  }, [])

  return (
    <div className="flex justify-center">
      <p className="text-xs rounded-full px-6 py-2.5 text-center min-h-[2.25rem] flex items-center justify-center" style={{ border: '1px solid #ccff33', background: 'rgba(255, 255, 255, 0.10)', color: '#ccff33' }}>
        <span ref={textRef}>{PHRASES[0]}</span>
      </p>
    </div>
  )
}
