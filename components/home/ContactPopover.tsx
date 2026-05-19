'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'

/*
  ContactPopover — menu d'action Contact, ouverture vers le HAUT.

  Port du pattern GSAP dropdown Réparation (DesktopNav.tsx), adapté :
    Init   : gsap.set(panel, { autoAlpha:0, yPercent:30, scale:0.7, xPercent:-50,
                               transformOrigin:'bottom center' })
    Open   : tlRef.timeScale(1).play()
    Close  : tlRef.timeScale(2.5).reverse()

  closeSignal : prop mirroir du slide `current` — ferme automatiquement
                le menu au changement de slide.
*/

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Clik%20Clak%20Repair%20Rue%20du%20Petit%20Ch%C3%AAne%209b%201003%20Lausanne'

export default function ContactPopover({ closeSignal }: { closeSignal?: number }) {
  const [open, setOpen]  = useState(false)
  const wrapperRef       = useRef<HTMLDivElement>(null)
  const panelRef         = useRef<HTMLDivElement>(null)
  const tlRef            = useRef<gsap.core.Timeline | null>(null)
  const prevOpenRef      = useRef(false)

  /* Fermeture automatique au changement de slide */
  useEffect(() => { setOpen(false) }, [closeSignal])

  /* ── GSAP setup ───────────────────────────────────────────── */
  useEffect(() => {
    const panel = panelRef.current
    if (!panel) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set(panel, {
      autoAlpha:       0,
      yPercent:        30,
      scale:           0.7,
      xPercent:        -50,
      transformOrigin: 'bottom center',
    })

    if (!reduced) {
      const items = panel.querySelectorAll('.contact-action-item')
      gsap.set(items, { clearProps: 'all' })

      tlRef.current = gsap.timeline({ paused: true })
        .to(panel, {
          autoAlpha:   1,
          yPercent:    0,
          scale:       1,
          duration:    0.75,
          ease:        'elastic.out(0.9, 0.4)',
          easeReverse: 'power3.out',
        } as gsap.TweenVars, 0)
        .fromTo(
          items,
          { opacity: 0, y: 8, immediateRender: false },
          {
            opacity:     1,
            y:           0,
            duration:    0.42,
            ease:        'back.out(2)',
            easeReverse: 'power2.out',
            stagger:     0.055,
          } as gsap.TweenVars,
          0.08,
        )
    }
    return () => { tlRef.current?.kill(); tlRef.current = null }
  }, [])

  /* ── Sync animation open/close ────────────────────────────── */
  useEffect(() => {
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = open
    const panel = panelRef.current
    if (!panel) return

    if (open && !wasOpen) {
      if (tlRef.current) tlRef.current.timeScale(1).play()
      else gsap.set(panel, { autoAlpha: 1, yPercent: 0, scale: 1, xPercent: -50 })
    } else if (!open && wasOpen) {
      if (tlRef.current) tlRef.current.timeScale(2.5).reverse()
      else gsap.set(panel, { autoAlpha: 0 })
    }
  }, [open])

  /* ── Clic extérieur ───────────────────────────────────────── */
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  /* ── Escape ───────────────────────────────────────────────── */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const close = useCallback(() => setOpen(false), [])

  return (
    <div ref={wrapperRef} className="relative inline-flex">
      {/* Trigger — stylé identique au Button secondary lg */}
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="contact-action-menu"
        onClick={() => setOpen(prev => !prev)}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-rubik font-medium leading-none whitespace-nowrap',
          'rounded-btn',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'shiny-cta shiny-cta-secondary text-accent',
          'h-14 px-8 text-lg min-w-[180px]',
        )}
      >
        <span className="inline-flex items-center gap-2">Contact</span>
      </button>

      {/* Panel — au-dessus du trigger, GSAP gère opacity/visibility/transform */}
      <div
        ref={panelRef}
        id="contact-action-menu"
        role="menu"
        aria-label="Options de contact"
        className={cn('contact-action-panel', open && 'is-open')}
      >
        {/* Appeler */}
        <a
          href="tel:+41213204477"
          role="menuitem"
          className="contact-action-item"
          onClick={close}
        >
          <span className="block text-[17px] md:text-sm font-normal" style={{ color: '#ccff33' }}>Appeler</span>
          <span className="block text-[14px] md:text-xs mt-1" style={{ color: '#f2f2f2' }}>021 320 44 77</span>
        </a>

        {/* Itinéraire */}
        <a
          href={MAPS_URL}
          role="menuitem"
          className="contact-action-item"
          target="_blank"
          rel="noopener noreferrer"
          onClick={close}
        >
          <span className="block text-[17px] md:text-sm font-normal" style={{ color: '#ccff33' }}>Itinéraire</span>
          <span className="block text-[14px] md:text-xs mt-1" style={{ color: '#f2f2f2' }}>Google Maps</span>
        </a>

        {/* Email */}
        <a
          href="mailto:info@clikclak.ch"
          role="menuitem"
          className="contact-action-item"
          onClick={close}
        >
          <span className="block text-[17px] md:text-sm font-normal" style={{ color: '#ccff33' }}>Email</span>
          <span className="block text-[14px] md:text-xs mt-1" style={{ color: '#f2f2f2' }}>info@clikclak.ch</span>
        </a>

        {/* Adresse — pas de lien, curseur défaut */}
        <span
          role="menuitem"
          className="contact-action-item"
          style={{ cursor: 'default' }}
        >
          <span className="block text-[17px] md:text-sm font-normal" style={{ color: '#ccff33' }}>Adresse</span>
          <span className="block text-[14px] md:text-xs mt-1 leading-snug" style={{ color: '#f2f2f2' }}>
            Rue du Petit Chêne 9b<br />1003 Lausanne
          </span>
        </span>
      </div>
    </div>
  )
}
