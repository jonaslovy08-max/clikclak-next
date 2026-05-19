'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

/*
  AnimatedScreenRepairIcon — copie inline exacte de icon-screen-repair.svg
  avec animation GSAP de la fissure (polyline) au hover du .service-card parent.

  Pourquoi inline :
    L'icône originale est chargée via <img>. GSAP ne peut pas cibler les paths
    internes d'un <img>. L'inlining est la seule solution qui permet d'animer
    les sous-éléments SVG.

  Éléments animés :
    Uniquement la polyline existante points="79.39 40.52 53.91 66 67.83 79.92 58.33 89.41 62.45 93.54"
    — la fissure à droite de l'écran. Aucun autre tracé n'est touché.

  Technique :
    strokeDasharray = getTotalLength(), strokeDashoffset 0↔len + opacity 0↔1.

  Cleanup :
    removeEventListener + gsap.killTweensOf au démontage.

  prefers-reduced-motion :
    Désactive l'animation — fissure affichée en statique avec opacity 1.
*/

export default function AnimatedScreenRepairIcon({ className }: { className?: string }) {
  const crackRef = useRef<SVGPolylineElement>(null)

  useEffect(() => {
    const crack = crackRef.current
    if (!crack) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const len = crack.getTotalLength()

    if (reduced) {
      gsap.set(crack, { strokeDasharray: len, strokeDashoffset: 0, opacity: 1 })
      return
    }

    /* Animation en boucle : dessine la fissure → pause → efface → pause → répète */
    gsap.set(crack, { strokeDasharray: len, strokeDashoffset: len, opacity: 0 })

    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.2 })
    tl.to(crack, { opacity: 1, duration: 0.25, ease: 'none' })
      .to(crack, { strokeDashoffset: 0, duration: 0.85, ease: 'power2.out' })
      .to(crack, { opacity: 0, duration: 0.4, ease: 'power2.in', delay: 0.8 })
      .set(crack, { strokeDashoffset: len })

    return () => {
      tl.kill()
      gsap.killTweensOf(crack)
    }
  }, [])

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="-87.75 -68.37 262.02 262.02"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient
          id="sr-repair-gradient"
          x1="2.73" y1="39.81" x2="35.44" y2="96.45"
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

      {/* ── Groupe arrière — cadre second plan ─────────────────── */}
      <g>
        <path
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M79.09,58.84v55.75c0,2.76-2.24,5-5,5H16.84c-2.76,0-5-2.24-5-5v-45.73"
        />
        <line
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="36.49" y1="109.59" x2="54.45" y2="109.59"
        />
      </g>

      {/* ── Groupe avant — outil de réparation + cadre + fissure ─ */}
      <g>
        {/* Outil de réparation — dégradé lime */}
        <path
          fill="none" stroke="url(#sr-repair-gradient)"
          strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M25.24,69.1c6.79-2.55,11.61-9.11,11.61-16.79,0-7.06-4.08-13.18-10.03-16.1-.75-.37-1.62.19-1.62,1.02v13.4c0,1.11-.74,2.09-1.81,2.4l-8.53,2.47c-1.1.32-2.21-.51-2.21-1.66v-16c0-1.14-1.23-1.86-2.23-1.32-5.61,3.03-9.43,8.97-9.43,15.79,0,7.69,4.85,14.26,11.66,16.8h0l.03,39.32"
        />
        {/* Cadre de l'écran */}
        <path
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          d="M12.69,24.87V6c0-2.76,2.24-5,5-5h57.25c2.76,0,5,2.24,5,5v108.59c0,2.76-2.24,5-5,5H17.69c-2.76,0-5-2.24-5-5v-6.15"
        />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="37.33" y1="109.59" x2="55.29" y2="109.59" />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="37.33" y1="11" x2="45.28" y2="11" />
        <line fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          x1="55.29" y1="11" x2="55.29" y2="11" />

        {/* ── FISSURE — seul élément animé ───────────────────────
            Tracé original identique à icon-screen-repair.svg.
            GSAP anime uniquement strokeDashoffset + opacity. */}
        <polyline
          ref={crackRef}
          fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
          points="79.39 40.52 53.91 66 67.83 79.92 58.33 89.41 62.45 93.54"
        />
      </g>
    </svg>
  )
}
