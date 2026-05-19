'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/*
  AnimatedBatteryRepairIcon — copie inline exacte de icon-battery.svg
  avec effet néon sur les éléments "énergie" de la batterie.

  Éléments animés (groupés dans glowRef) :
    - deux chevrons lime (#ccff26, cls-1)
    - éclair dégradé lime→blanc (cls-3)
  Ces éléments représentent la charge / lumière de la batterie.

  Éléments statiques :
    - corps blanc de la batterie (cls-2) : contour, rectangle, terminal

  Animation en boucle :
    Micro-scintillements rapides → extinction courte → rallumage doux → pause

  prefers-reduced-motion : aucune animation, icône statique opacity 1.
*/

export default function AnimatedBatteryRepairIcon({ className }: { className?: string }) {
  const glowRef = useRef<SVGGElement>(null)

  useEffect(() => {
    const glow = glowRef.current
    if (!glow) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    gsap.set(glow, { opacity: 1 })

    /*
      Séquence néon :
        × 2 micro-scintillements rapides (0.07-0.08s chacun)
        → extinction courte vers 0.15 (0.22s, power2.in)
        → rallumage doux vers 1 (0.42s, power2.out)
        → pause repeatDelay 2.0s → repeat
    */
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 2.0 })
    tl
      .to(glow, { opacity: 0.25, duration: 0.07, ease: 'none' })
      .to(glow, { opacity: 1,    duration: 0.06, ease: 'none' })
      .to(glow, { opacity: 0.45, duration: 0.08, ease: 'none' })
      .to(glow, { opacity: 1,    duration: 0.07, ease: 'none' })
      .to(glow, { opacity: 0.15, duration: 0.22, ease: 'power2.in'  })
      .to(glow, { opacity: 1,    duration: 0.42, ease: 'power2.out' })

    return () => {
      tl.kill()
      gsap.killTweensOf(glow)
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
      <defs>
        <linearGradient
          id="bat-glow-gradient"
          x1="103.67" y1="101.67" x2="103.67" y2="146.53"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0"    stopColor="#ccff26" />
          <stop offset=".32"  stopColor="#ccff28" />
          <stop offset=".47"  stopColor="#ceff2f" />
          <stop offset=".57"  stopColor="#d1ff3b" />
          <stop offset=".66"  stopColor="#d5ff4d" />
          <stop offset=".74"  stopColor="#daff65" />
          <stop offset=".81"  stopColor="#e1ff82" />
          <stop offset=".88"  stopColor="#e9ffa4" />
          <stop offset=".94"  stopColor="#f3ffcc" />
          <stop offset=".99"  stopColor="#fdfff7" />
          <stop offset="1"    stopColor="#fff"    />
        </linearGradient>
      </defs>

      {/* ── Corps blanc statique ─────────────────────────────────── */}
      <g>
        <path
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M100.44,93.24v-18.87c0-2.76,2.24-5,5-5h57.25c2.76,0,5,2.24,5,5v108.59c0,2.76-2.24,5-5,5h-57.25c-2.76,0-5-2.24-5-5v-37.03"
        />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="125.08" y1="177.96" x2="143.05" y2="177.96" />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="125.08" y1="79.37" x2="133.03" y2="79.37" />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="143.05" y1="79.37" x2="143.05" y2="79.37" />
      </g>
      <rect
        fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x="120.07" y="107.52" width="27.99" height="48.13" rx="2.5" ry="2.5"
      />
      <path
        fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        d="M133.38,103.96h1.74c1.38,0,2.5,1.12,2.5,2.5v1.06h-6.74v-1.06c0-1.38,1.12-2.5,2.5-2.5Z"
      />

      {/* ── Éléments énergie animés (néon) ──────────────────────── */}
      <g ref={glowRef}>
        {/* Chevrons lime — indicateurs de charge */}
        <polyline
          fill="none" stroke="#ccff26" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          points="126.81 137.18 134.25 129.74 141.69 137.18"
        />
        <polyline
          fill="none" stroke="#ccff26" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          points="126.81 146.94 134.25 139.49 141.69 146.94"
        />
        {/* Éclair dégradé — symbole de charge */}
        <polyline
          fill="none" stroke="url(#bat-glow-gradient)"
          strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          points="100.48 145.53 113 116.78 103.67 124.1 94.33 131.42 106.85 102.67"
        />
      </g>
    </svg>
  )
}
