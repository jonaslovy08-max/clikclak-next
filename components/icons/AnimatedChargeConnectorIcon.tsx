'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/*
  AnimatedChargeConnectorIcon — copie inline exacte de icon-charging-port.svg
  avec animation "se dessine" séquentielle :

  Étape 1 : éclair gradient (polyline cls-1, bas de l'icône) se dessine
  Étape 2 : deux lignes diagonales en X (cls-2) se dessinent à leur tour

  Technique : fromTo strokeDashoffset (len→0) + opacity (0→1) par GSAP.
  fromTo garantit un état de départ propre à chaque répétition.

  Éléments statiques : corps blanc de l'appareil (paths + lignes d'en-tête).
  Éléments animés  : boltRef (polyline gradient), line1Ref, line2Ref.

  prefers-reduced-motion : icône statique, tous éléments visibles.
*/

export default function AnimatedChargeConnectorIcon({ className }: { className?: string }) {
  const boltRef  = useRef<SVGPolylineElement>(null)
  const line1Ref = useRef<SVGLineElement>(null)
  const line2Ref = useRef<SVGLineElement>(null)

  useEffect(() => {
    const bolt  = boltRef.current
    const line1 = line1Ref.current
    const line2 = line2Ref.current
    if (!bolt || !line1 || !line2) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const boltLen  = bolt.getTotalLength()
    const lineLen1 = line1.getTotalLength()
    const lineLen2 = line2.getTotalLength()

    /* État initial : éléments animés invisibles */
    gsap.set(bolt,  { strokeDasharray: boltLen,  strokeDashoffset: boltLen,  opacity: 0 })
    gsap.set(line1, { strokeDasharray: lineLen1, strokeDashoffset: lineLen1, opacity: 0 })
    gsap.set(line2, { strokeDasharray: lineLen2, strokeDashoffset: lineLen2, opacity: 0 })

    /*
      Timeline séquentielle :
        1. Dessin de l'éclair gradient (0.8s, power2.out)
        2. Dessin des deux diagonales (0.35s chacune, léger stagger)
        3. Maintien 0.5s puis fondu sortant
        4. Reset (strokeDashoffset revient à len sous opacity 0)
        → repeat: -1, repeatDelay: 1.4s
    */
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })

    /* Étape 1 — éclair bas */
    tl.fromTo(bolt,
      { strokeDashoffset: boltLen,  opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
    )
    /* Étape 2 — diagonale 1 (légère avance sur diagonale 2) */
    .fromTo(line1,
      { strokeDashoffset: lineLen1, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.35, ease: 'power2.out' }
    )
    /* Étape 2 — diagonale 2 (décalée de -0.2s pour croiser proprement) */
    .fromTo(line2,
      { strokeDashoffset: lineLen2, opacity: 0 },
      { strokeDashoffset: 0, opacity: 1, duration: 0.35, ease: 'power2.out' },
      '-=0.2',
    )
    /* Maintien visible 0.5s puis fondu sortant simultané */
    .to([bolt, line1, line2], { opacity: 0, duration: 0.28, ease: 'power2.in', delay: 0.5 })
    /* Reset sous opacity 0 — fromTo repart de ces valeurs au cycle suivant */
    .set(bolt,  { strokeDashoffset: boltLen  })
    .set(line1, { strokeDashoffset: lineLen1 })
    .set(line2, { strokeDashoffset: lineLen2 })

    return () => {
      tl.kill()
      gsap.killTweensOf([bolt, line1, line2])
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
          id="charge-connector-gradient"
          x1="131.01" y1="165.56" x2="131.01" y2="210.42"
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

      {/* ── Corps statique de l'appareil ────────────────────────── */}
      <g>
        <path
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M118.81,187.99h-16.43c-2.76,0-5-2.24-5-5v-55.48"
        />
        <path
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M97.39,127.52v-53.11c0-2.76,2.24-5,5-5h57.25c2.76,0,5,2.24,5,5v108.59c0,2.76-2.24,5-5,5h-11.74"
        />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="122.03" y1="79.41" x2="129.98" y2="79.41" />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="139.99" y1="79.41" x2="139.99" y2="79.41" />
      </g>

      {/* ── Diagonales en X — animées (étape 2) ─────────────────── */}
      <line
        ref={line1Ref}
        fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="123.39" y1="145.25" x2="138.63" y2="160.49"
      />
      <line
        ref={line2Ref}
        fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        x1="138.63" y1="145.25" x2="123.39" y2="160.49"
      />

      {/* ── Éclair gradient — animé en premier (étape 1) ─────────── */}
      <polyline
        ref={boltRef}
        fill="none" stroke="url(#charge-connector-gradient)"
        strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
        points="127.82 209.42 140.34 180.67 131.01 187.99 121.68 195.31 134.2 166.56"
      />
    </svg>
  )
}
