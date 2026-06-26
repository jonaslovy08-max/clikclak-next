'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { getActiveSection } from '@/lib/navUtils'
import { useCart } from '@/components/shop/CartContext'

type NavLink = {
  label:        string
  href:         string
  accent?:      boolean
  hasDropdown?: boolean
  subLinks?:    { label: string; href: string }[]
}

/* ============================================================
   Port TypeScript du moteur d'animation Codrops AnimatedMenuIcon
   Référence : docs/references/codrops-animated-menu-icon/

   Icône : stroke-dasharray / stroke-dashoffset, 3 paths SVG complexes.
   Overlay : adaptation de demo.css — slide depuis la gauche avec
             overshoot cubic-bezier(0.56, 1.19, 0.2, 1.05) et stagger.
   ============================================================ */

/* ── Easings (port ease.js Codrops) ── */

function elasticOut(t: number, amplitude = 1, period = 0.3): number {
  if (t === 0 || t === 1) return t
  const s = (period / (2 * Math.PI)) * Math.asin(1 / amplitude)
  return amplitude * Math.pow(2, -10 * t) *
    Math.sin((t - s) * (2 * Math.PI) / period) + 1
}

function elasticIn(t: number, amplitude = 1, period = 0.3): number {
  return 1 - elasticOut(1 - t, amplitude, period)
}

function bounceOut(t: number): number {
  const n = 7.5625, d = 2.75
  if (t < 1 / d)       return n * t * t
  if (t < 2 / d)       return n * (t -= 1.5  / d) * t + 0.75
  if (t < 2.5 / d)     return n * (t -= 2.25 / d) * t + 0.9375
  return n * (t -= 2.625 / d) * t + 0.984375
}

/* ── Moteur d'animation de segment ── */

interface AnimHandle { cancel(): void }

function animateDash(
  el: SVGPathElement,
  from: [number, number],
  to:   [number, number],
  duration: number,
  ease: (t: number) => number,
  delay    = 0,
  onDone?: () => void,
): AnimHandle {
  const L = el.getTotalLength()
  let raf = 0, tid = 0, cancelled = false

  function setSegment(s: number, e: number) {
    el.style.strokeDasharray  = `${Math.max(0, e - s)} ${L + 1}`
    el.style.strokeDashoffset = `${-s}`
  }

  function run(origin: number, now: number) {
    if (cancelled) return
    const t = Math.min((now - origin) / (duration * 1000), 1)
    const et = ease(t)
    setSegment(from[0] + (to[0] - from[0]) * et, from[1] + (to[1] - from[1]) * et)
    if (t < 1) raf = requestAnimationFrame(ts => run(origin, ts))
    else onDone?.()
  }

  tid = window.setTimeout(() => {
    if (!cancelled) raf = requestAnimationFrame(ts => run(ts, ts))
  }, delay * 1000)

  return { cancel() { cancelled = true; clearTimeout(tid); cancelAnimationFrame(raf) } }
}

/* ── Séquences Codrops (main.js) ── */

function inAC(el: SVGPathElement, handles: AnimHandle[]): void {
  const L = el.getTotalLength()
  handles.push(animateDash(el, [80, 320], [L * 0.8 - 240, L * 0.8], 0.3, t => t, 0.1,
    () => handles.push(animateDash(el, [L * 0.8 - 240, L * 0.8], [L - 545, L - 305],
      0.6, t => elasticOut(t, 1, 0.3))),
  ))
}

function inB(el: SVGPathElement, handles: AnimHandle[]): void {
  handles.push(animateDash(el, [80, 320], [20, 380], 0.1, t => t, 0,
    () => handles.push(animateDash(el, [20, 380], [200, 200], 0.3, bounceOut)),
  ))
}

function outAC(el: SVGPathElement, handles: AnimHandle[]): void {
  const L = el.getTotalLength()
  handles.push(animateDash(el, [L - 545, L - 305], [L * 0.9 - 240, L * 0.9],
    0.1, t => elasticIn(t, 1, 0.3), 0,
    () => handles.push(animateDash(el, [L * 0.9 - 240, L * 0.9], [L * 0.2 - 240, L * 0.2],
      0.3, t => t, 0,
      () => handles.push(animateDash(el, [L * 0.2 - 240, L * 0.2], [80, 320],
        0.7, t => elasticOut(t, 1, 0.3))),
    )),
  ))
}

function outB(el: SVGPathElement, handles: AnimHandle[]): void {
  handles.push(animateDash(el, [200, 200], [80, 320], 0.7, t => elasticOut(t, 2, 0.4), 0.1))
}

/* ── Helpers état direct (prefers-reduced-motion) ── */

function jumpToX(el: SVGPathElement): void {
  const L = el.getTotalLength()
  el.style.strokeDasharray  = `240 ${L + 1}`
  el.style.strokeDashoffset = `${-(L - 545)}`
}

function jumpToHamburger(el: SVGPathElement): void {
  const L = el.getTotalLength()
  el.style.strokeDasharray  = `240 ${L + 1}`
  el.style.strokeDashoffset = '-80'
}

function jumpToInvisible(el: SVGPathElement): void {
  const L = el.getTotalLength()
  el.style.strokeDasharray  = `0 ${L + 1}`
  el.style.strokeDashoffset = '-200'
}

/* ── Paths SVG Codrops (identiques à l'original) ── */

const PATH_A = 'M 300 400 L 700 400 C 900 400 900 750 600 850 A 400 400 0 0 1 200 200 L 800 800'
const PATH_B = 'M 300 500 L 700 500'
const PATH_C = 'M 700 600 L 300 600 C 100 600 100 200 400 150 A 400 380 0 1 1 200 800 L 800 200'

/* ── Composant principal ── */

export default function MobileMenu({ links, shopEnabled = false, locale = 'fr' }: { links: NavLink[]; shopEnabled?: boolean; locale?: 'fr' | 'en' }) {
  const pathname      = usePathname()
  const activeSection = getActiveSection(pathname)
  const { totalItems } = useCart()
  const [cartCount, setCartCount] = useState(0)
  useEffect(() => { setCartCount(totalItems) }, [totalItems])

  const [isOpen,       setIsOpen]       = useState(false)
  const [expandedLabel, setExpandedLabel] = useState<string | null>(null)
  const toClose   = useRef(true)
  const svgRef    = useRef<SVGSVGElement>(null)
  const pathARef  = useRef<SVGPathElement>(null)
  const pathBRef  = useRef<SVGPathElement>(null)
  const pathCRef  = useRef<SVGPathElement>(null)
  const handles   = useRef<AnimHandle[]>([])

  /* Init segments hamburger + rendre visible */
  useEffect(() => {
    const init = (el: SVGPathElement | null) => {
      if (!el) return
      const L = el.getTotalLength()
      el.style.strokeDasharray  = `240 ${L + 1}`
      el.style.strokeDashoffset = '-80'
    }
    init(pathARef.current)
    init(pathBRef.current)
    init(pathCRef.current)
    svgRef.current?.setAttribute('data-ready', '')
  }, [])

  function cancelAll() {
    handles.current.forEach(h => h.cancel())
    handles.current = []
  }

  const trigger = useCallback(() => {
    cancelAll()
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (toClose.current) {
      setIsOpen(true)
      document.body.classList.add('mobile-menu-open')
      if (rm) {
        if (pathARef.current) jumpToX(pathARef.current)
        if (pathBRef.current) jumpToInvisible(pathBRef.current)
        if (pathCRef.current) jumpToX(pathCRef.current)
      } else {
        if (pathARef.current) inAC(pathARef.current, handles.current)
        if (pathBRef.current) inB(pathBRef.current,  handles.current)
        if (pathCRef.current) inAC(pathCRef.current, handles.current)
      }
    } else {
      setIsOpen(false)
      document.body.classList.remove('mobile-menu-open')
      if (rm) {
        if (pathARef.current) jumpToHamburger(pathARef.current)
        if (pathBRef.current) jumpToHamburger(pathBRef.current)
        if (pathCRef.current) jumpToHamburger(pathCRef.current)
      } else {
        if (pathARef.current) outAC(pathARef.current, handles.current)
        if (pathBRef.current) outB(pathBRef.current,  handles.current)
        if (pathCRef.current) outAC(pathCRef.current, handles.current)
      }
    }
    toClose.current = !toClose.current
  }, [])

  const closeMenu = useCallback(() => {
    if (!isOpen) return
    cancelAll()
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (rm) {
      if (pathARef.current) jumpToHamburger(pathARef.current)
      if (pathBRef.current) jumpToHamburger(pathBRef.current)
      if (pathCRef.current) jumpToHamburger(pathCRef.current)
    } else {
      if (pathARef.current) outAC(pathARef.current, handles.current)
      if (pathBRef.current) outB(pathBRef.current,  handles.current)
      if (pathCRef.current) outAC(pathCRef.current, handles.current)
    }
    document.body.classList.remove('mobile-menu-open')
    setIsOpen(false)
    toClose.current = true
  }, [isOpen])

  /* Cleanup body class on unmount */
  useEffect(() => () => { document.body.classList.remove('mobile-menu-open') }, [])

  /* ESC */
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeMenu() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen, closeMenu])

  return (
    <>
      {/* Bouton hamburger — header z-50, toujours au-dessus de l'overlay z-40 */}
      <button
        type="button"
        aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
        aria-expanded={isOpen}
        aria-controls="mobile-nav"
        onClick={trigger}
        className="relative z-50 p-2 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <svg
          ref={svgRef}
          width="80"
          height="80"
          viewBox="100 100 800 800"
          className="hamburger-icon-svg"
          aria-hidden="true"
        >
          <path ref={pathARef} d={PATH_A} className="hamburger-icon-path" />
          <path ref={pathBRef} d={PATH_B} className="hamburger-icon-path" />
          <path ref={pathCRef} d={PATH_C} className="hamburger-icon-path" />
        </svg>
      </button>

      {/*
        Overlay — toujours dans le DOM (pour l'animation de fermeture CSS).
        Fermé   : visibility:hidden + opacity:0 + pointer-events:none
        Ouvert  : class .is-open active la transition CSS
        z-40 < header z-50 → icône toujours visible au-dessus
      */}
      <div
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Menu principal"
        aria-hidden={isOpen ? undefined : true}
        className={cn(
          'mobile-nav-overlay',
          'fixed inset-0 z-40 flex flex-col items-center justify-center',
          isOpen && 'is-open',
        )}
      >
        <nav aria-label="Navigation principale" className="flex flex-col items-center">
          {links.map((link) => {
            const isShop     = link.href.startsWith('/shop-reparation-smartphone-lausanne')
            const isContact  = link.href.startsWith('/contact-clik-clak-lausanne')
            const isRepair   = link.href === '/reparation'
            const isHome     = link.href === '/'
            const isServices = link.href === '/services-nav'

            const isActive =
              (isHome     && activeSection === 'home')     ||
              (isRepair   && activeSection === 'repair')   ||
              (isServices && activeSection === 'services') ||
              (isContact  && activeSection === 'contact')  ||
              (isShop     && activeSection === 'shop')

            /* Item avec dropdown → accordéon */
            if (link.hasDropdown && link.subLinks && link.subLinks.length > 0) {
              const isExpanded = expandedLabel === link.label
              return (
                <div key={link.href} className="flex flex-col items-center w-full">
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => setExpandedLabel(prev => prev === link.label ? null : link.label)}
                    className={cn(
                      'mobile-nav-item',
                      'inline-flex items-center justify-center gap-2 text-[2rem] leading-none py-5 px-6 font-light',
                      'hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
                      isActive || isExpanded ? 'text-accent' : 'text-foreground',
                    )}
                  >
                    {link.label}
                    {/* Chevron */}
                    <svg
                      aria-hidden="true"
                      width="14" height="14"
                      viewBox="0 0 10 10"
                      fill="none"
                      style={{
                        display:    'block',
                        flexShrink: 0,
                        transform:  isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 220ms ease',
                      }}
                    >
                      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Sous-liens */}
                  {isExpanded && (
                    <div className="flex flex-col items-center gap-1 pb-3">
                      {link.subLinks.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={closeMenu}
                          className="text-xl font-light text-foreground/65 hover:text-accent transition-colors py-2 px-6 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            /* Lien direct */
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className={cn(
                  'mobile-nav-item',
                  'relative inline-flex items-center justify-center gap-2 text-[2rem] leading-none py-5 px-6 font-light',
                  'hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
                  isActive
                    ? 'text-accent'
                    : link.accent ? 'text-accent' : 'text-foreground',
                )}
              >
                {link.label}
              </Link>
            )
          })}

          {/* Ligne Panier — visible uniquement si shop actif et panier non vide */}
          {shopEnabled && cartCount > 0 && (
            <Link
              href="/shop-reparation-smartphone-lausanne/panier"
              onClick={closeMenu}
              className={cn(
                'mobile-nav-item',
                'relative inline-flex items-center justify-center gap-3 text-[2rem] leading-none py-5 px-6 font-light',
                'text-foreground hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/ui/icon-shop.svg" alt="" aria-hidden
                width={22} height={22} style={{ display: 'block', flexShrink: 0 }} />
              Panier
              <span
                className="flex items-center justify-center rounded-full text-[11px] font-medium leading-none self-start mt-1"
                style={{ minWidth: 18, height: 18, padding: '0 4px', background: '#ccff33', color: '#191919' }}
                aria-label={`${cartCount} article${cartCount > 1 ? 's' : ''} dans le panier`}
              >
                {cartCount}
              </span>
            </Link>
          )}
        </nav>

        {/* Sélecteur de langue */}
        <div className="absolute bottom-20 left-0 right-0 flex justify-center">
          <div className="flex items-center gap-2 text-sm font-medium">
            {locale === 'fr' ? (
              <span className="text-accent" aria-current="true">FR</span>
            ) : (
              <Link href="/" onClick={closeMenu} className="text-foreground/50 hover:text-foreground transition-colors">FR</Link>
            )}
            <span className="text-foreground/25" aria-hidden>|</span>
            {locale === 'en' ? (
              <span className="text-accent" aria-current="true">EN</span>
            ) : (
              <Link href="/en" onClick={closeMenu} className="text-foreground/50 hover:text-foreground transition-colors">EN</Link>
            )}
          </div>
        </div>

        {/* Liens sociaux — bas de l'overlay mobile. Mêmes assets que SocialLinks.tsx */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-5">
          <a
            href="https://www.instagram.com/clikclak_repair/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ClikClak sur Instagram"
            onClick={closeMenu}
            className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/icon-instagram.svg" alt="" aria-hidden width={18} height={18} />
            <span>Instagram</span>
          </a>
          <a
            href="https://www.facebook.com/clikclakrepair/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="ClikClak sur Facebook"
            onClick={closeMenu}
            className="flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/icons/icon-facebook.svg" alt="" aria-hidden width={18} height={18} />
            <span>Facebook</span>
          </a>
        </div>
      </div>
    </>
  )
}
