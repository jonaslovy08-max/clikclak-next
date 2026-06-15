'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { getActiveSection, getSectionNavHref } from '@/lib/navUtils'
import { useCart } from '@/components/shop/CartContext'
import type { NavLink } from '@/components/layout/Header'

/*
  DesktopNav — barre indicatrice lime + deux dropdowns GSAP (Réparation + Services).

  Chaque dropdown a ses propres refs (wrapRef, menuRef, arrowRef, tlRef).
  openDropdownId : null | 'reparation' | 'services' — un seul ouvert à la fois.
  Quand l'un s'ouvre, l'autre se ferme via le sync useEffect.

  Animation dropdown (port fidèle gsap-easereverseui) :
    Init   : gsap.set(panel, { autoAlpha:0, yPercent:-30, scale:0.7, xPercent:-50 })
    Open   : timeline.timeScale(1).play()
    Close  : timeline.timeScale(2.5).reverse()

  Ouverture : clic uniquement.
  Fermeture : second clic · clic extérieur · Escape · changement de route.
*/

type DropdownId = 'reparation' | 'services'

const BAR_TRANSITION =
  'transform 300ms cubic-bezier(0.25,1,0.5,1), width 300ms cubic-bezier(0.25,1,0.5,1)'

/* ── Helper GSAP init ──────────────────────────────────────────────────── */
function initDropdownAnim(
  menuEl: HTMLDivElement | null,
  arrowEl: SVGSVGElement | null,
  tlRef: React.MutableRefObject<gsap.core.Timeline | null>,
  reduced: boolean,
) {
  if (!menuEl) return
  gsap.set(menuEl, { autoAlpha: 0, yPercent: -30, scale: 0.7, xPercent: -50, transformOrigin: 'top center' })
  if (arrowEl) gsap.set(arrowEl, { rotation: 0 })
  if (!reduced) {
    const items = menuEl.querySelectorAll('.nav-dropdown-item')
    gsap.set(items, { clearProps: 'all' })
    tlRef.current = gsap.timeline({ paused: true })
      .to(arrowEl ?? [], {
        rotation: 180, duration: 0.65, ease: 'elastic.out(0.9, 0.4)', easeReverse: 'power2.inOut',
      } as gsap.TweenVars, 0)
      .to(menuEl, {
        autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.75, ease: 'elastic.out(0.9, 0.4)', easeReverse: 'power3.out',
      } as gsap.TweenVars, 0)
      .fromTo(items,
        { opacity: 0, x: -16, immediateRender: false },
        { opacity: 1, x: 0, duration: 0.42, ease: 'back.out(2)', easeReverse: 'power2.out', stagger: 0.055 } as gsap.TweenVars,
        0.08,
      )
  }
}

/* ── Composant ─────────────────────────────────────────────────────────── */
export default function DesktopNav({
  navLinks,
  rightLinks,
}: {
  navLinks:   NavLink[]
  rightLinks: NavLink[]
}) {
  const pathname = usePathname()
  const navRef   = useRef<HTMLElement>(null)
  const barRef   = useRef<HTMLSpanElement>(null)

  /* Dropdown Réparation */
  const repairWrapRef  = useRef<HTMLDivElement>(null)
  const repairMenuRef  = useRef<HTMLDivElement>(null)
  const repairArrowRef = useRef<SVGSVGElement>(null)
  const repairTlRef    = useRef<gsap.core.Timeline | null>(null)

  /* Dropdown Services */
  const servicesWrapRef  = useRef<HTMLDivElement>(null)
  const servicesMenuRef  = useRef<HTMLDivElement>(null)
  const servicesArrowRef = useRef<SVGSVGElement>(null)
  const servicesTlRef    = useRef<gsap.core.Timeline | null>(null)

  /* Open state — null | 'reparation' | 'services' */
  const [openDropdownId, setOpenDropdownId] = useState<DropdownId | null>(null)
  const openDropdownIdRef = useRef<DropdownId | null>(null)
  const prevOpenIdRef     = useRef<DropdownId | null>(null)

  /* Barre visible */
  const [visible, setVisible] = useState(false)

  /* Panier — hydration-safe */
  const { totalItems } = useCart()
  const [cartCount, setCartCount] = useState(0)
  useEffect(() => { setCartCount(totalItems) }, [totalItems])

  /* ── Active link ───────────────────────────────────────────────── */
  const activeSection = getActiveSection(pathname)
  const activeHref    = getSectionNavHref(activeSection)

  /* ── Helpers dropdown refs ──────────────────────────────────────── */
  const refsFor = useCallback((id: DropdownId) => ({
    tl:    id === 'reparation' ? repairTlRef    : servicesTlRef,
    menu:  id === 'reparation' ? repairMenuRef  : servicesMenuRef,
    arrow: id === 'reparation' ? repairArrowRef : servicesArrowRef,
  }), [])

  /* ── Barre indicatrice ──────────────────────────────────────────── */
  const moveTo = useCallback((el: HTMLElement, instant?: boolean) => {
    const bar = barRef.current
    const nav = navRef.current
    if (!bar || !nav) return
    const navLeft         = nav.getBoundingClientRect().left
    const { left, width } = el.getBoundingClientRect()
    if (instant) bar.style.transition = 'none'
    bar.style.transform = `translateX(${left - navLeft}px)`
    bar.style.width     = `${width}px`
    if (instant) requestAnimationFrame(() => {
      if (barRef.current) barRef.current.style.transition = BAR_TRANSITION
    })
  }, [])

  const returnToActive = useCallback(() => {
    if (openDropdownIdRef.current) return
    if (!activeHref) return
    const el = navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
    if (el) moveTo(el)
  }, [activeHref, moveTo])

  /* Snap initial + repositionnement au changement de route */
  useEffect(() => {
    if (!activeHref) { setVisible(false); return }
    const el = navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
    if (!el) return
    moveTo(el, true)
    setVisible(true)
  }, [activeHref, moveTo])

  /* Fermer les dropdowns au changement de route */
  useEffect(() => { setOpenDropdownId(null) }, [pathname])

  /* Recalcul de la barre au resize */
  useEffect(() => {
    const recalc = () => {
      const nav = navRef.current
      if (!nav) return
      const openId = openDropdownIdRef.current
      const openHref = openId === 'reparation' ? '/reparation' : openId === 'services' ? '/services-nav' : null
      const el = openHref
        ? nav.querySelector<HTMLElement>(`[data-href="${openHref}"]`)
        : activeHref
          ? nav.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
          : null
      if (el) moveTo(el, true)
    }
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [activeHref, moveTo])

  /* ── GSAP setup (une fois au mount) ────────────────────────────── */
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    initDropdownAnim(repairMenuRef.current,    repairArrowRef.current,    repairTlRef,    reduced)
    initDropdownAnim(servicesMenuRef.current,  servicesArrowRef.current,  servicesTlRef,  reduced)
    return () => {
      repairTlRef.current?.kill();   repairTlRef.current   = null
      servicesTlRef.current?.kill(); servicesTlRef.current = null
    }
  }, [])

  /* ── Sync GSAP play/reverse lors des changements d'openDropdownId ── */
  useEffect(() => {
    openDropdownIdRef.current = openDropdownId
    const prevId = prevOpenIdRef.current
    prevOpenIdRef.current = openDropdownId

    /* Fermer le dropdown précédent */
    if (prevId && prevId !== openDropdownId) {
      const { tl, menu, arrow } = refsFor(prevId)
      if (tl.current) {
        tl.current.timeScale(2.5).reverse()
      } else {
        if (menu.current)  gsap.set(menu.current,  { autoAlpha: 0 })
        if (arrow.current) gsap.set(arrow.current, { rotation: 0 })
      }
    }

    /* Ouvrir le nouveau dropdown + déplacer la barre */
    if (openDropdownId) {
      const { tl, menu, arrow } = refsFor(openDropdownId)
      if (tl.current) {
        tl.current.timeScale(1).play()
      } else {
        if (menu.current)  gsap.set(menu.current,  { autoAlpha: 1, yPercent: 0, scale: 1, xPercent: -50 })
        if (arrow.current) gsap.set(arrow.current, { rotation: 180 })
      }
      const openHref = openDropdownId === 'reparation' ? '/reparation' : '/services-nav'
      const el = navRef.current?.querySelector<HTMLElement>(`[data-href="${openHref}"]`)
      if (el) moveTo(el)
    } else if (prevId) {
      /* Tout fermé → retour au lien actif */
      if (activeHref) {
        const el = navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
        if (el) moveTo(el)
      }
    }
  }, [openDropdownId, activeHref, moveTo, refsFor])

  /* ── Clic extérieur — ferme les deux dropdowns ─────────────────── */
  useEffect(() => {
    if (!openDropdownId) return
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node
      const insideRepair   = repairWrapRef.current?.contains(t)
      const insideServices = servicesWrapRef.current?.contains(t)
      if (!insideRepair && !insideServices) setOpenDropdownId(null)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [openDropdownId])

  /* ── Escape ─────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!openDropdownId) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenDropdownId(null) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [openDropdownId])

  return (
    <>
      <nav
        ref={navRef}
        className="relative flex items-center justify-center gap-8"
        aria-label="Navigation principale"
        onMouseLeave={returnToActive}
        onBlur={e => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            returnToActive()
            setOpenDropdownId(null)
          }
        }}
      >
        {/* Barre indicatrice lime */}
        <span
          ref={barRef}
          aria-hidden="true"
          style={{
            position:      'absolute',
            bottom:        '-4px',
            left:          0,
            height:        '1.5px',
            width:         0,
            background:    'var(--accent)',
            pointerEvents: 'none',
            opacity:       visible ? 1 : 0,
            transition:    BAR_TRANSITION,
          }}
        />

        {navLinks.map(link => {
          if (!link.hasDropdown) {
            return (
              <Link
                key={link.href}
                href={link.href}
                data-href={link.href}
                className={cn(
                  'text-[19px] font-light transition-colors',
                  link.href === activeHref
                    ? 'text-foreground'
                    : 'text-foreground/65 hover:text-foreground',
                )}
                onMouseEnter={e => { if (!openDropdownIdRef.current) moveTo(e.currentTarget) }}
                onFocus={e       => { if (!openDropdownIdRef.current) moveTo(e.currentTarget) }}
              >
                {link.label}
              </Link>
            )
          }

          /* Lien avec dropdown */
          const ddId: DropdownId = link.href === '/reparation' ? 'reparation' : 'services'
          const isOpen           = openDropdownId === ddId
          const isActive         = link.href === activeHref
          const wrapRef          = ddId === 'reparation' ? repairWrapRef   : servicesWrapRef
          const menuRef          = ddId === 'reparation' ? repairMenuRef   : servicesMenuRef
          const arrowRef         = ddId === 'reparation' ? repairArrowRef  : servicesArrowRef
          const domId            = ddId === 'reparation' ? 'reparation-dropdown' : 'services-dropdown'
          const subLinks         = link.subLinks ?? []

          return (
            <div key={link.href} ref={wrapRef} className="relative">
              <button
                type="button"
                data-href={link.href}
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-controls={domId}
                className={cn(
                  'inline-flex items-center gap-1 text-[19px] font-light transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
                  isActive ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
                )}
                onMouseEnter={e => moveTo(e.currentTarget)}
                onFocus={e       => moveTo(e.currentTarget)}
                onClick={() => setOpenDropdownId(prev => prev === ddId ? null : ddId)}
              >
                {link.label}
                <svg
                  ref={arrowRef}
                  aria-hidden="true"
                  width="10" height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  style={{ display: 'block', flexShrink: 0 }}
                >
                  <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                ref={menuRef}
                id={domId}
                role="menu"
                aria-label={`Sous-menu ${link.label}`}
                className={cn('nav-dropdown-panel', isOpen && 'is-open')}
              >
                {subLinks.map((item, idx) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    role="menuitem"
                    className="nav-dropdown-item"
                    style={idx === subLinks.length - 1
                      ? { borderTop: '1px solid rgba(242,242,242,0.1)' }
                      : undefined}
                    onClick={() => setOpenDropdownId(null)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Liens droite — Contact + Shop */}
      <div className="flex items-center gap-6">
        {rightLinks.map(link => {
          const isShop    = link.href.startsWith('/shop-reparation-smartphone-lausanne')
          const isContact = link.href.startsWith('/contact-clik-clak-lausanne')
          const isActive  = (isShop && activeSection === 'shop') ||
                            (isContact && activeSection === 'contact')

          return (
            <div key={link.href} className="flex items-center gap-2 leading-none">
              <Link
                href={link.href}
                className={cn(
                  'text-[19px] font-light leading-none transition-colors',
                  link.accent
                    ? isActive
                      ? 'text-accent underline underline-offset-4 decoration-accent decoration-[1.5px]'
                      : 'text-accent'
                    : isActive
                      ? 'text-foreground underline underline-offset-4 decoration-accent decoration-[1.5px]'
                      : 'text-foreground/65 hover:text-foreground',
                )}
              >
                {link.label}
              </Link>

              {/* Icône panier à côté de Shop */}
              {isShop && (
                <Link
                  href="/shop-reparation-smartphone-lausanne/panier"
                  aria-label={
                    cartCount > 0
                      ? `Voir le panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`
                      : 'Voir le panier'
                  }
                  className="inline-flex items-center gap-2 leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
                >
                  <Image
                    src="/assets/ui/icon-shop.svg"
                    alt=""
                    aria-hidden
                    width={28}
                    height={20}
                    style={{ display: 'block', opacity: 0.75, height: 'auto' }}
                  />
                  {cartCount > 0 && (
                    <span
                      className="inline-flex items-center justify-center rounded-full text-[11px] font-medium leading-none"
                      style={{
                        minWidth:   18,
                        height:     18,
                        padding:    '0 5px',
                        background: '#ccff33',
                        color:      '#191919',
                      }}
                      aria-hidden
                    >
                      {cartCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
