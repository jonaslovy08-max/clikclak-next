'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/*
  AnimatedDiagnosticIcon — copie inline exacte de icon-diagnostic.svg
  avec animation "se dessine" sur les deux éléments lime (cls-1) :

    1. Le segment horizontal d'entrée (line) se dessine en premier
    2. La courbe ECG / heartbeat (polyline) se dessine ensuite

  Rendu : effet scan / analyse progressive — sobre, net, premium.

  Technique : fromTo strokeDashoffset (len→0) + opacity (0→1).
  fromTo garantit un état de départ propre à chaque répétition.

  Éléments statiques : corps blanc de l'appareil + loupe magnify.
  Éléments animés : lineRef (segment), waveRef (polyline ECG).

  prefers-reduced-motion : icône statique, tous éléments visibles.
*/

export default function AnimatedDiagnosticIcon({ className }: { className?: string }) {
  const lineRef = useRef<SVGLineElement>(null)
  const waveRef = useRef<SVGPolylineElement>(null)

  useEffect(() => {
    const line = lineRef.current
    const wave = waveRef.current
    if (!line || !wave) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const lineLen = line.getTotalLength()
    const waveLen = wave.getTotalLength()

    /* État initial : éléments animés invisibles */
    gsap.set(line, { strokeDasharray: lineLen, strokeDashoffset: lineLen, opacity: 0 })
    gsap.set(wave, { strokeDasharray: waveLen, strokeDashoffset: waveLen, opacity: 0 })

    /*
      Timeline séquentielle :
        1. Segment d'entrée (line) : 0.25s — rapide, donne le départ
        2. Courbe ECG (wave)       : 0.9s  — se dessine sur toute sa longueur
        3. Maintien 0.8s puis fondu sortant
        4. Reset sous opacity 0 → fromTo repart proprement au cycle suivant
        → repeat: -1, repeatDelay: 1.5s
    */
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })

    /* Étape 1 — segment d'entrée */
    tl.fromTo(line,
      { strokeDashoffset: lineLen, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.25, ease: 'power2.out' }
    )
    /* Étape 2 — courbe ECG (démarre juste après le segment) */
    .fromTo(wave,
      { strokeDashoffset: waveLen, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.9, ease: 'power2.out' }
    )
    /* Maintien 0.8s puis fondu sortant simultané */
    .to([line, wave], { opacity: 0, duration: 0.3, ease: 'power2.in', delay: 0.8 })
    /* Reset sous opacity 0 */
    .set(line, { strokeDashoffset: lineLen })
    .set(wave, { strokeDashoffset: waveLen })

    return () => {
      tl.kill()
      gsap.killTweensOf([line, wave])
    }
  }, [])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 262.02 262.02"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {/* ── Corps statique blanc ─────────────────────────────────── */}
      <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="99.79" y1="127.9" x2="99.79" y2="97.13" />
      <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M102.24,89.99v-15.62c0-2.76,2.24-5,5-5h57.25c2.76,0,5,2.24,5,5v108.59c0,2.76-2.24,5-5,5h-57.25c-2.76,0-5-2.24-5-5v-53.59"
      />
      <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="126.88" y1="177.96" x2="144.85" y2="177.96" />
      <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="126.88" y1="79.37" x2="134.84" y2="79.37" />
      <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="144.85" y1="79.37" x2="144.85" y2="79.37" />

      {/* Loupe — cercle + poignée */}
      <g>
        <path fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M91.04,112.62c0-9.9,8.02-17.92,17.92-17.92s17.92,8.02,17.92,17.92-8.02,17.92-17.92,17.92c-5.19,0-9.87-2.21-13.14-5.73"
        />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="95.82" y1="124.81" x2="81.06" y2="139.57" />
      </g>

      {/* ── Segment d'entrée — animé en premier (étape 1) ────────── */}
      <line
        ref={lineRef}
        fill="none" stroke="#ccff26" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="118.11" y1="111.8" x2="126.33" y2="111.8"
      />

      {/* ── Courbe ECG / diagnostic — animée ensuite (étape 2) ───── */}
      <polyline
        ref={waveRef}
        fill="none" stroke="#ccff26" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        points="126.85 113.86 132.8 113.86 135.74 108.31 141.51 125.08 147.61 94.26 152.29 114.04 180.96 114.04"
      />
    </svg>
  )
}
