'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { getActiveSection, getSectionNavHref } from '@/lib/navUtils'
import { useCart } from '@/components/shop/CartContext'

/*
  DesktopNav — barre indicatrice lime + dropdown "Réparation" avec GSAP.

  Animation dropdown (port fidèle de gsap-easereverseui-examples / script.js) :
    Init   : gsap.set(panel,  { autoAlpha:0, yPercent:-30, scale:0.7, xPercent:-50 })
             gsap.set(arrow,  { rotation:0 })
             gsap.set(items,  { opacity:1, x:0 })
    Open   : timeline.timeScale(1).play()
               → arrow  rotation 0→180°,   elastic.out(1.2, 0.3), 0.9s
               → panel  autoAlpha/scale/y,  elastic.out(1.2, 0.3), 1s
               → items  from x:-20 opacity:0, back.out(3), stagger:0.07, offset:0.1
    Close  : timeline.timeScale(2.5).reverse()

  Indicateur underline :
    - Quand le dropdown est ouvert, la barre reste sous "Réparation".
    - Au survol des autres liens (dropdown ouvert), la barre ne bouge pas.
    - À la fermeture du dropdown, la barre revient au lien actif.

  Ouverture : clic uniquement — reste ouvert après le clic.
  Fermeture : second clic · clic extérieur · Escape.

  Active link :
    - Résolu via getActiveSection(pathname) — aucun fallback sur "Accueil".
    - Si aucune section ne correspond, la barre est masquée.
    - rightLinks (Contact, Shop) ne déclenchent pas la barre (hors portée nav).
*/

type NavLink = { label: string; href: string; accent?: boolean; hasDropdown?: boolean }

const BAR_TRANSITION =
  'transform 300ms cubic-bezier(0.25,1,0.5,1), width 300ms cubic-bezier(0.25,1,0.5,1)'

const REPARATION_DROPDOWN_ITEMS = [
  { label: 'Smartphone',  href: '/reparation-smartphone-express'  },
  { label: 'Tablette',    href: '/reparation-tablette-express'    },
  { label: 'Ordinateur',  href: '/reparation-ordinateur-express'  },
  { label: 'Dépannage',   href: '/services/depannage-reparation-domicile' },
  { label: 'Voir tous…',  href: '/reparation/'                    },
]

export default function DesktopNav({
  navLinks,
  rightLinks,
}: {
  navLinks:   NavLink[]
  rightLinks: NavLink[]
}) {
  const pathname           = usePathname()
  const navRef             = useRef<HTMLElement>(null)
  const barRef             = useRef<HTMLSpanElement>(null)
  const dropdownWrapperRef = useRef<HTMLDivElement>(null)
  const ddMenuRef          = useRef<HTMLDivElement>(null)
  const ddArrowRef         = useRef<SVGSVGElement>(null)
  const ddTlRef            = useRef<gsap.core.Timeline | null>(null)
  const dropdownOpenRef    = useRef(false)
  const prevOpenRef        = useRef(false)

  const [visible,      setVisible]      = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  /* Panier — hydration-safe (0 côté SSR, mis à jour après montage) */
  const { totalItems } = useCart()
  const [cartCount, setCartCount] = useState(0)
  useEffect(() => { setCartCount(totalItems) }, [totalItems])

  /* ── Active link ───────────────────────────────────────────── */
  const activeSection = getActiveSection(pathname)
  /* Href sous lequel positionner la barre (null = bar cachée) */
  const activeHref    = getSectionNavHref(activeSection)

  /* ── Barre indicatrice ──────────────────────────────────────── */
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
    if (dropdownOpenRef.current) return
    if (!activeHref) return
    const el = navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
    if (el) moveTo(el)
  }, [activeHref, moveTo])

  /* Snap initial + repositionnement au changement de route */
  useEffect(() => {
    if (!activeHref) {
      setVisible(false)
      return
    }
    const el = navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
    if (!el) return
    moveTo(el, true)
    setVisible(true)
  }, [activeHref, moveTo])

  /* Fermer le dropdown au changement de route */
  useEffect(() => {
    setDropdownOpen(false)
  }, [pathname])

  /* Recalcul de la barre au resize */
  useEffect(() => {
    const recalc = () => {
      const nav = navRef.current
      if (!nav) return
      const el = dropdownOpenRef.current
        ? nav.querySelector<HTMLElement>('[aria-haspopup="menu"]')
        : activeHref
          ? nav.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
          : null
      if (el) moveTo(el, true)
    }
    window.addEventListener('resize', recalc)
    return () => window.removeEventListener('resize', recalc)
  }, [activeHref, moveTo])

  /* ── GSAP setup ─────────────────────────────────────────────── */
  useEffect(() => {
    const ddMenu  = ddMenuRef.current
    const ddArrow = ddArrowRef.current
    if (!ddMenu) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    gsap.set(ddMenu, {
      autoAlpha:       0,
      yPercent:        -30,
      scale:           0.7,
      xPercent:        -50,
      transformOrigin: 'top center',
    })
    if (ddArrow) gsap.set(ddArrow, { rotation: 0 })
    if (!reduced) {
      const items = ddMenu.querySelectorAll('.nav-dropdown-item')
      gsap.set(items, { clearProps: 'all' })
      ddTlRef.current = gsap.timeline({ paused: true })
        .to(ddArrow ?? [], {
          rotation:    180,
          duration:    0.65,
          ease:        'elastic.out(0.9, 0.4)',
          easeReverse: 'power2.inOut',
        } as gsap.TweenVars, 0)
        .to(ddMenu, {
          autoAlpha:   1,
          yPercent:    0,
          scale:       1,
          duration:    0.75,
          ease:        'elastic.out(0.9, 0.4)',
          easeReverse: 'power3.out',
        } as gsap.TweenVars, 0)
        .fromTo(
          items,
          { opacity: 0, x: -16, immediateRender: false },
          {
            opacity:     1,
            x:           0,
            duration:    0.42,
            ease:        'back.out(2)',
            easeReverse: 'power2.out',
            stagger:     0.055,
          } as gsap.TweenVars,
          0.08,
        )
    }

    return () => { ddTlRef.current?.kill(); ddTlRef.current = null }
  }, [])

  /* ── Sync ref + GSAP play/reverse + retour barre ───────────── */
  useEffect(() => {
    dropdownOpenRef.current = dropdownOpen
    const wasOpen = prevOpenRef.current
    prevOpenRef.current = dropdownOpen

    const ddMenu  = ddMenuRef.current
    if (!ddMenu) return

    if (dropdownOpen && !wasOpen) {
      if (ddTlRef.current) {
        ddTlRef.current.timeScale(1).play()
      } else {
        gsap.set(ddMenu, { autoAlpha: 1, yPercent: 0, scale: 1, xPercent: -50 })
        if (ddArrowRef.current) gsap.set(ddArrowRef.current, { rotation: 180 })
      }
    } else if (!dropdownOpen && wasOpen) {
      if (ddTlRef.current) {
        ddTlRef.current.timeScale(2.5).reverse()
      } else {
        gsap.set(ddMenu, { autoAlpha: 0 })
        if (ddArrowRef.current) gsap.set(ddArrowRef.current, { rotation: 0 })
      }
      const el = activeHref
        ? navRef.current?.querySelector<HTMLElement>(`[data-href="${activeHref}"]`)
        : null
      if (el) moveTo(el)
    }
  }, [dropdownOpen, activeHref, moveTo])

  /* ── Clic extérieur ─────────────────────────────────────────── */
  useEffect(() => {
    if (!dropdownOpen) return
    const onClick = (e: MouseEvent) => {
      if (dropdownWrapperRef.current && !dropdownWrapperRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [dropdownOpen])

  /* ── Escape ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (!dropdownOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dropdownOpen])

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
            setDropdownOpen(false)
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
                onMouseEnter={e => { if (!dropdownOpenRef.current) moveTo(e.currentTarget) }}
                onFocus={e       => { if (!dropdownOpenRef.current) moveTo(e.currentTarget) }}
              >
                {link.label}
              </Link>
            )
          }

          /* Lien avec dropdown */
          const isActive = link.href === activeHref
          return (
            <div key={link.href} ref={dropdownWrapperRef} className="relative">
              <button
                type="button"
                data-href={link.href}
                aria-haspopup="menu"
                aria-expanded={dropdownOpen}
                aria-controls="reparation-dropdown"
                className={cn(
                  'inline-flex items-center gap-1 text-[19px] font-light transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
                  isActive ? 'text-foreground' : 'text-foreground/65 hover:text-foreground',
                )}
                onMouseEnter={e => moveTo(e.currentTarget)}
                onFocus={e       => moveTo(e.currentTarget)}
                onClick={() => setDropdownOpen(prev => !prev)}
              >
                {link.label}
                <svg
                  ref={ddArrowRef}
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
                ref={ddMenuRef}
                id="reparation-dropdown"
                role="menu"
                aria-label="Sous-menu Réparation"
                className={cn('nav-dropdown-panel', dropdownOpen && 'is-open')}
              >
                {REPARATION_DROPDOWN_ITEMS.map((item, idx) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    role="menuitem"
                    className="nav-dropdown-item"
                    style={idx === REPARATION_DROPDOWN_ITEMS.length - 1
                      ? { borderTop: '1px solid rgba(242,242,242,0.1)' }
                      : undefined}
                    onClick={() => setDropdownOpen(false)}
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
                  {/* width/height proportionnels au viewBox 95.33×69.82 (ratio 1.366) */}
                  <Image
                    src="/assets/ui/icon-shop.svg"
                    alt=""
                    aria-hidden
                    width={28}
                    height={20}
                    style={{ display: 'block', opacity: 0.75 }}
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
