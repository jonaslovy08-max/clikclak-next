'use client'

/*
  RepairModelSearch — champ de recherche réparations réutilisable.

  Source : lib/repairSearch.ts (repairSearchIndex + searchRepairs).
  Aucune donnée en double — tous les modèles viennent de data/iphoneRepairs.ts
  (et futurs data/samsungRepairs.ts, etc.).

  Props :
    placeholder  — texte placeholder (défaut : "Trouver mon appareil et tarifs...")
    inputId      — id du <input> pour le <label> (défaut : "repair-model-search")
    onSelect     — callback optionnel. Si fourni, appelé au lieu de router.push.
                   Usage : page /reparation-iphone passe onSelect pour sélectionner
                   le modèle directement sans redirection.
    className    — classe CSS appliquée au wrapper (ex: "w-full md:max-w-[520px]")

  Comportement par défaut (sans onSelect) :
    Clic résultat → router.push(result.href)
    result.href est déjà la URL complète : /services/reparation-iphone?model=iphone-16-pro

  États visuels de l'input :
    normal  → border rgba(255,255,255,0.12), bg rgba(255,255,255,0.04)
    focused → border rgba(204,255,51,0.55), bg rgba(255,255,255,0.06), halo extérieur
    active  → (has text) + border rgba(204,255,51,0.65), bg rgba(255,255,255,0.08)
    Transition CSS 250ms ease — pas de conflit GSAP (GSAP anime uniquement le panel dropdown)
*/

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { searchRepairs, repairSearchIndex, type SearchableModel } from '@/lib/repairSearch'
import { getAlternatePath } from '@/i18n/routes'
import { getNoModelFoundText, getViewPricingText, getSearchAriaLabel } from '@/i18n/repairLabels'

export default function RepairModelSearch({
  placeholder = 'Trouver mon appareil et tarifs...',
  inputId     = 'repair-model-search',
  onSelect,
  className,
  locale      = 'fr',
}: {
  placeholder?: string
  inputId?:     string
  onSelect?:    (result: SearchableModel) => void
  className?:   string
  locale?:      'fr' | 'en'
}) {
  const [query,   setQuery]   = useState('')
  const [focused, setFocused] = useState(false)
  const router                = useRouter()
  const wrapRef               = useRef<HTMLDivElement>(null)
  const panelRef              = useRef<HTMLDivElement>(null)
  const animRef               = useRef<gsap.core.Tween | gsap.core.Timeline | null>(null)
  const prevOpen              = useRef(false)
  const reduced               = useRef(false)
  /* Ref SVG pour l'animation draw en boucle (tracé unique) */
  const pathRef   = useRef<SVGPathElement>(null)
  const drawTlRef = useRef<gsap.core.Timeline | null>(null)

  const results  = searchRepairs(query, repairSearchIndex)
  const open     = query.trim().length >= 2
  const hasText  = query.length > 0
  const isActive = focused || hasText

  /* ── Styles dynamiques de l'input ─────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    height:          'clamp(56px, 5.5vw, 64px)',
    borderRadius:    12,
    border:          '1px solid #ccff33',
    backgroundColor: hasText  ? 'rgba(255,255,255,0.08)' :
                     focused  ? 'rgba(255,255,255,0.06)' :
                                'rgba(255,255,255,0.04)',
    boxShadow:       isActive
      ? '0 0 0 3px rgba(204,255,51,0.07), inset 0 1px 0 rgba(255,255,255,0.04)'
      : 'none',
    transition: 'border-color 250ms ease, background-color 250ms ease, box-shadow 280ms ease',
  }

  /* Init GSAP avant premier paint — panel invisible, GSAP seul gère autoAlpha */
  useLayoutEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const panel = panelRef.current
    if (!panel) return
    gsap.set(panel, { autoAlpha: 0, yPercent: -8, scale: 0.97, transformOrigin: 'top center' })
    return () => { animRef.current?.kill(); animRef.current = null }
  }, [])

  /* Animation draw en boucle sur l'icône SVG (tracé unique) */
  useLayoutEffect(() => {
    const path = pathRef.current
    if (!path) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const len = path.getTotalLength()
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len })

    drawTlRef.current = gsap.timeline({ repeat: -1, repeatDelay: 1.5 })
      .to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power3.out' })

    return () => { drawTlRef.current?.kill(); drawTlRef.current = null }
  }, [])

  /* Ouverture / fermeture du dropdown */
  useEffect(() => {
    const wasOpen = prevOpen.current
    prevOpen.current = open
    const panel = panelRef.current
    if (!panel) return

    if (open && !wasOpen) {
      animRef.current?.kill()
      if (!reduced.current) {
        const items = panel.querySelectorAll<HTMLElement>('.rms-item')
        gsap.set(items, { clearProps: 'all' })
        animRef.current = gsap.timeline()
          .fromTo(panel,
            { autoAlpha: 0, yPercent: -8, scale: 0.97 },
            { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.28, ease: 'power3.out', transformOrigin: 'top center' },
            0
          )
          .fromTo(items,
            { opacity: 0, y: -4, immediateRender: false },
            { opacity: 1, y: 0, duration: 0.2, ease: 'power2.out', stagger: 0.03 },
            0.05
          )
      } else {
        gsap.set(panel, { autoAlpha: 1, yPercent: 0, scale: 1 })
      }
    } else if (!open && wasOpen) {
      animRef.current?.kill()
      if (!reduced.current) {
        animRef.current = gsap.to(panel, {
          autoAlpha: 0, yPercent: -5, scale: 0.97,
          duration: 0.15, ease: 'power2.in', transformOrigin: 'top center',
          onComplete: () => { animRef.current = null },
        })
      } else {
        gsap.set(panel, { autoAlpha: 0 })
      }
    }
  }, [open])

  /* Fermeture clic extérieur */
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function handleSelect(result: SearchableModel) {
    setQuery('')
    if (onSelect) {
      onSelect(result)
    } else {
      /* When locale="en", convert the FR model href to its EN equivalent */
      const href = locale === 'en' ? getAlternatePath(result.href, 'en') : result.href
      router.push(href)
    }
  }

  return (
    <div ref={wrapRef} className={`relative${className ? ` ${className}` : ''}`}>
      <label className="sr-only" htmlFor={inputId}>{getSearchAriaLabel(locale)}</label>
      <input
        id={inputId}
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={e => { if (e.key === 'Escape') setQuery('') }}
        autoComplete="off"
        placeholder={placeholder}
        className={cn(
          'w-full px-5 focus:outline-none text-foreground text-base pr-14',
          hasText ? 'placeholder:text-foreground/20' : 'placeholder:text-foreground/35',
        )}
        style={inputStyle}
      />
      {hasText ? (
        /* Bouton clear lime — remplace l'icône loupe quand du texte est saisi */
        <button
          type="button"
          onClick={() => setQuery('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff33]"
          aria-label="Effacer la recherche"
        >
          <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden focusable="false">
            <line x1="1" y1="1" x2="13" y2="13" stroke="#ccff33" strokeWidth="2" strokeLinecap="round" />
            <line x1="13" y1="1" x2="1" y2="13" stroke="#ccff33" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          {/* SVG inline — tracé unique, draw animation GSAP en boucle */}
          <svg
            viewBox="0 0 42.3 47"
            width="22"
            height="22"
            fill="none"
            aria-hidden
            focusable="false"
          >
            <path
              ref={pathRef}
              d="M5.3,19.1C5.3,9.3,13.2,1.3,23.1,1.3s17.8,8,17.8,17.8-8,17.8-17.8,17.8-8-1.4-11-3.8L1.1,44.1"
              stroke="#ccff33"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      )}

      {/* Dropdown — GSAP contrôle autoAlpha, pas de style React opacity/visibility */}
      <div
        ref={panelRef}
        className="absolute top-full left-0 right-0 mt-1.5 z-30"
        style={{
          backgroundColor: '#1c1c1c',
          border:          '1px solid rgba(204,255,51,0.28)',
          borderRadius:    12,
          overflow:        'hidden',
          maxHeight:       340,
          overflowY:       'auto',
          boxShadow:       '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        {results.length === 0 ? (
          <div
            className="rms-item px-5 py-4 text-base font-light"
            style={{ color: 'rgba(242,242,242,0.35)' }}
          >
            {getNoModelFoundText(query.trim(), locale)}
          </div>
        ) : results.map((result, idx) => (
          <button
            key={result.modelId}
            type="button"
            onClick={() => handleSelect(result)}
            className="rms-item w-full flex items-center gap-4 px-5 py-4 text-base font-light text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            style={{
              borderTop:       idx > 0 ? '1px solid rgba(242,242,242,0.07)' : undefined,
              backgroundColor: 'transparent',
            }}
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span style={{ color: 'rgba(242,242,242,0.92)', fontSize: 14 }}>{result.modelLabel}</span>
              <span style={{ fontSize: 11, color: 'rgba(242,242,242,0.35)' }}>
                {result.familyLabel}&nbsp;·&nbsp;{result.brand}
              </span>
            </div>
            <span style={{ fontSize: 11, color: '#ccff33', flexShrink: 0, whiteSpace: 'nowrap' }}>
              {getViewPricingText(locale)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
