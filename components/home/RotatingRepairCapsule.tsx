'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/*
  RotatingRepairCapsule — capsule de réassurance à messages rotatifs.
  Supporte locale FR et EN.
*/

const PHRASES_FR = [
  'Réparation express en 20 min dans la majorité des cas.',
  'Vos données restent conservées lors de la plupart des réparations.',
  'Écran, batterie, charge : diagnostic rapide en boutique.',
  'Pièces sélectionnées selon votre modèle et la disponibilité.',
  'Réparation smartphone, tablette et ordinateur à Lausanne.',
  "Un doute sur le modèle ? ClikClak vous aide à l'identifier.",
]

const PHRASES_EN = [
  'Express repair in 20 min in most cases.',
  'Your data stays safe during most repairs.',
  'Screen, battery, charging port: quick in-store diagnostic.',
  'Parts selected according to your model and availability.',
  'Smartphone, tablet and computer repair in Lausanne.',
  "Not sure of your model? ClikClak helps you identify it.",
]

export default function RotatingRepairCapsule({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const PHRASES = locale === 'en' ? PHRASES_EN : PHRASES_FR
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
  }, [PHRASES])

  return (
    <div className="flex justify-center">
      <p
        className="text-xs rounded-full px-6 py-2.5 text-center min-h-[2.25rem] flex items-center justify-center"
        style={{ border: '1px solid #ccff33', background: 'rgba(255, 255, 255, 0.10)', color: '#ccff33' }}
      >
        <span ref={textRef}>{PHRASES[0]}</span>
      </p>
    </div>
  )
}
