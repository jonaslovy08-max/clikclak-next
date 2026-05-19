'use client'

/*
  Preloader — affiche SignatureLoader sur fond #191919 au chargement initial.

  Cycle de vie :
    SSR / montage : phase = 'visible'  → plein écran, couvre le contenu
    dismiss()     : attend MAX(window.load, MIN_MS) puis phase = 'fading'
    après FADE_MS : phase = 'gone'     → return null, hors DOM

  Le composant est monté une fois dans layout.tsx (root shell).
  Une fois 'gone', il ne réapparaît plus sur les navigations client-side.

  Timing :
    MIN_MS   = 2400ms — permet à l'animation SVG (2.2s) de se terminer
    FADE_MS  =  600ms — fondu de sortie

  prefers-reduced-motion :
    500ms statique puis disparition instantanée.
*/

import { useState, useEffect, useRef } from 'react'
import { SignatureLoader } from '@/components/brand/SignatureLoader'

const MIN_MS  = 2400
const FADE_MS = 600

type Phase = 'visible' | 'fading' | 'gone'

export default function Preloader() {
  const [phase, setPhase] = useState<Phase>('visible')
  const reduced = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start     = Date.now()

    function dismiss() {
      if (reduced.current) {
        setTimeout(() => setPhase('gone'), 500)
        return
      }
      const wait = Math.max(0, MIN_MS - (Date.now() - start))
      setTimeout(() => {
        setPhase('fading')
        setTimeout(() => setPhase('gone'), FADE_MS)
      }, wait)
    }

    if (document.readyState === 'complete') {
      dismiss()
    } else {
      window.addEventListener('load', dismiss, { once: true })
      return () => window.removeEventListener('load', dismiss)
    }
  }, [])

  if (phase === 'gone') return null

  return (
    <div
      role="status"
      aria-label="Chargement"
      aria-live="polite"
      tabIndex={-1}
      style={{
        position:        'fixed',
        inset:           0,
        zIndex:          9999,
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        backgroundColor: '#191919',
        opacity:         phase === 'fading' ? 0 : 1,
        pointerEvents:   phase === 'fading' ? 'none' : 'auto',
        transition:      phase === 'fading'
          ? `opacity ${FADE_MS}ms cubic-bezier(0.4,0,0.2,1)`
          : 'none',
      }}
    >
      <SignatureLoader
        className="h-[clamp(160px,34vw,280px)] w-auto"
        aria-label="Chargement ClikClak"
      />
    </div>
  )
}
