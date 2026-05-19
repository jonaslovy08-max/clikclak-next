'use client'

/*
  HorizontalScrollingGallery — galerie horizontale animée GSAP.
  Placée en fin de homepage, juste avant SiteFooter.

  Desktop (≥ 768px) :
    - Section épinglée (pin: true) pendant la durée du scroll horizontal
    - Strip traduit de x=0 → x=-totalScroll via ScrollTrigger scrub
    - pinSpacing: true → le footer reste accessible immédiatement après
    - Nettoyage : gsap.context().revert() + restauration height/overflow

  Mobile (< 768px) :
    - Aucun GSAP, aucun ScrollTrigger, aucun pin
    - overflow-x auto → swipe natif Safari iOS
    - scroll vertical normal, aucun blocage

  prefers-reduced-motion → désactivé, galerie statique scrollable.
*/

import { useLayoutEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ── Images ─────────────────────────────────────────────────────────── */
const IMAGES = [
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_01.webp', alt: 'Réparation smartphone' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_02.webp', alt: '' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_04.webp', alt: '' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_05.webp', alt: '' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_06.webp', alt: '' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_07.webp', alt: '' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_08.webp', alt: '' },
  { src: '/assets/images/horizontal-scrolling-gallery/clikclak-gallery_09.webp', alt: '' },
]

/* ── Constantes layout ──────────────────────────────────────────────── */
const HEADER_H  = 148
const IMG_H_CSS = 'clamp(280px, 46vh, 540px)'
const IMG_W_CSS = 'clamp(220px, 28vw, 400px)'
const GAP       = 20

/* ════════════════════════════════════════════════════════════════════
   Composant
════════════════════════════════════════════════════════════════════ */
export default function HorizontalScrollingGallery() {
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef   = useRef<HTMLDivElement>(null)
  const ctxRef     = useRef<gsap.Context | null>(null)

  useLayoutEffect(() => {
    const reduced   = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const isDesktop = window.matchMedia('(min-width: 768px)').matches

    /* Mobile : aucune animation GSAP — swipe natif uniquement */
    if (reduced || !isDesktop) return

    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const strip   = stripRef.current
    if (!section || !strip) return

    /* ── Desktop : pin + scroll horizontal ── */
    const prevHeight   = section.style.height
    const prevOverflow = section.style.overflow
    section.style.height   = '100svh'
    section.style.overflow = 'hidden'

    ctxRef.current = gsap.context(() => {
      const getTotalScroll = () => strip.scrollWidth - section.offsetWidth

      gsap.to(strip, {
        x:    () => -getTotalScroll(),
        ease: 'none',
        scrollTrigger: {
          trigger:             section,
          start:               'top top',
          end:                 () => `+=${getTotalScroll()}`,
          pin:                 true,
          scrub:               1.2,
          anticipatePin:       1,
          invalidateOnRefresh: true,
          pinSpacing:          true,
        },
      })
    }, section)

    return () => {
      ctxRef.current?.revert()
      section.style.height   = prevHeight
      section.style.overflow = prevOverflow
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative border-t border-white/10 overflow-hidden"
      aria-label="Galerie ClikClak"
    >
      {/* ── Titre + sous-texte ── */}
      <div
        className="px-6 md:px-14 lg:px-20 pt-12 pb-8 flex flex-col gap-3"
        style={{ minHeight: HEADER_H }}
      >
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          Un service{' '}
          <span className="text-accent">complet</span>
        </h2>
        <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
          Réparation, diagnostic, récupération de données et accompagnement technique à Lausanne.
        </p>
      </div>

      {/* ── Strip images ──
          Mobile  : overflow-x auto → swipe natif
          Desktop : overflow-x visible → GSAP contrôle la translation
      ── */}
      <div
        ref={stripRef}
        className="flex items-center overflow-x-auto md:overflow-x-visible pb-10 md:pb-0"
        style={{
          gap:          GAP,
          paddingLeft:  'clamp(24px, 5.5vw, 80px)',
          paddingRight: 'clamp(24px, 5.5vw, 80px)',
          willChange:   'transform',
          height:       IMG_H_CSS,
        }}
      >
        {IMAGES.map((img, i) => (
          <div
            key={i}
            className="relative flex-shrink-0"
            style={{ width: IMG_W_CSS, height: '100%' }}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain"
              sizes="(max-width: 767px) 80vw, 28vw"
              priority={false}
            />
          </div>
        ))}
      </div>
    </section>
  )
}
