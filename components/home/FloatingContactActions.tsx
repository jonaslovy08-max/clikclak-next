'use client'

import { useRef, useEffect, useCallback } from 'react'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { useChatbot } from '@/components/chatbot/ChatbotContext'

/*
  FloatingContactActions — pictos flottants avec effet GSAP BUTTON HOVER.

  Layout stack :
    Mobile  : ligne fixe centrée en bas — flex-row, bottom-4, left-1/2 -translate-x-1/2
    Desktop : colonne fixe bas-droite   — flex-col, right-5, bottom-16

  Tooltip :
    Mobile  : s'ouvre vers le HAUT (bottom-full, centré horizontalement)
    Desktop : s'ouvre vers la GAUCHE (right-full, centré verticalement)
    GSAP initial state adapté à chaque direction via matchMedia au mount.

  prefers-reduced-motion : gsap.set() instantané, pas de timeline.
*/

type ContactItem = {
  label:     string
  tooltip:   string
  href?:     string
  icon:      string
  isChatbot?: boolean
}

const allItemsFr: ContactItem[] = [
  { label: 'Appeler',  tooltip: 'Appeler',   href: 'tel:+41213204477',          icon: '/assets/ui/icon-phone.svg'          },
  { label: 'WhatsApp', tooltip: 'WhatsApp',  href: 'https://wa.me/41782573242', icon: '/assets/ui/icon-whatsapp.svg'       },
  { label: 'Chatbot',  tooltip: 'Assistant', isChatbot: true,                   icon: '/assets/chatbot/icon_chatbot.svg'   },
]
const allItemsEn: ContactItem[] = [
  { label: 'Call',     tooltip: 'Call',      href: 'tel:+41213204477',          icon: '/assets/ui/icon-phone.svg'          },
  { label: 'WhatsApp', tooltip: 'WhatsApp',  href: 'https://wa.me/41782573242', icon: '/assets/ui/icon-whatsapp.svg'       },
  { label: 'Chatbot',  tooltip: 'Assistant', isChatbot: true,                   icon: '/assets/chatbot/icon_chatbot.svg'   },
]

/* ── Item avec BUTTON HOVER + tooltip GSAP ──────────────────────── */
function FloatingItem({ item, onChatbot }: { item: ContactItem; onChatbot?: () => void }) {
  const tipRef      = useRef<HTMLSpanElement>(null)
  const iconRef     = useRef<HTMLImageElement>(null)
  const tlRef       = useRef<gsap.core.Timeline | null>(null)
  const reducedRef  = useRef(false)
  const isMobileRef = useRef(false)

  useEffect(() => {
    const tip  = tipRef.current
    const icon = iconRef.current
    if (!tip || !icon) return

    reducedRef.current  = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    isMobileRef.current = !window.matchMedia('(min-width: 768px)').matches

    gsap.set(icon, { scale: 1, transformOrigin: 'center center' })

    if (isMobileRef.current) {
      /* Mobile — tooltip au-dessus : part de y:-6, arrive à y:0, x centré */
      gsap.set(tip, { autoAlpha: 0, y: -6, x: '-50%', scale: 0.88, transformOrigin: 'bottom center' })
      if (!reducedRef.current) {
        tlRef.current = gsap.timeline({ paused: true })
          .to(icon, { scale: 1.12, duration: 0.45, ease: 'elastic.out(0.9, 0.4)', easeReverse: 'power2.out' } as gsap.TweenVars, 0)
          .to(tip,  { autoAlpha: 1, y: 0, x: '-50%', scale: 1, duration: 0.4, ease: 'back.out(2)', easeReverse: 'power2.out' } as gsap.TweenVars, 0.04)
      }
    } else {
      /* Desktop — tooltip à gauche : part de x:10, arrive à x:0, y centré */
      gsap.set(tip, { autoAlpha: 0, x: 10, y: '-50%', scale: 0.82, transformOrigin: 'right center' })
      if (!reducedRef.current) {
        tlRef.current = gsap.timeline({ paused: true })
          .to(icon, { scale: 1.15, duration: 0.45, ease: 'elastic.out(0.9, 0.4)', easeReverse: 'power2.out' } as gsap.TweenVars, 0)
          .to(tip,  { autoAlpha: 1, x: 0, y: '-50%', scale: 1, duration: 0.4, ease: 'back.out(2)', easeReverse: 'power2.out' } as gsap.TweenVars, 0.04)
      }
    }

    return () => { tlRef.current?.kill(); tlRef.current = null }
  }, [])

  const show = useCallback(() => {
    if (tlRef.current) {
      tlRef.current.timeScale(1).play()
    } else {
      const vals = isMobileRef.current
        ? { autoAlpha: 1, y: 0, x: '-50%', scale: 1 }
        : { autoAlpha: 1, x: 0, y: '-50%', scale: 1 }
      if (tipRef.current)  gsap.set(tipRef.current, vals)
      if (iconRef.current) gsap.set(iconRef.current, { scale: 1 })
    }
  }, [])

  const hide = useCallback(() => {
    if (tlRef.current) {
      tlRef.current.timeScale(2.5).reverse()
    } else {
      if (tipRef.current)  gsap.set(tipRef.current,  { autoAlpha: 0 })
      if (iconRef.current) gsap.set(iconRef.current, { scale: 1 })
    }
  }, [])

  return (
    <div className="relative flex items-center">
      {/*
        Tooltip :
          Mobile  : bottom-full mb-3 left-1/2  → au-dessus de l'icône, centré (GSAP gère x:'-50%')
          Desktop : md:top-1/2 md:right-full md:mr-3 → à gauche, centré verticalement (GSAP gère y:'-50%')
      */}
      <span
        ref={tipRef}
        role="tooltip"
        aria-hidden="true"
        className="
          absolute pointer-events-none select-none
          whitespace-nowrap
          text-[12px] font-medium leading-none tracking-wide
          px-3 py-[5px] rounded-[5px]
          bottom-full mb-3 left-1/2
          md:bottom-auto md:mb-0 md:top-1/2 md:left-auto md:right-full md:mr-3
        "
        style={{
          background: 'rgba(25,25,25,0.85)',
          color:      '#f2f2f2',
          border:     '1px solid #f2f2f2',
        }}
      >
        {item.tooltip}
      </span>

      {/* Chatbot → <button> ; autres → <a> */}
      {item.isChatbot ? (
        <button
          type="button"
          aria-label={item.label}
          className="block w-[72px] h-[72px] md:w-14 md:h-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          onClick={onChatbot}
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={iconRef} src={item.icon} alt="" aria-hidden className="block w-full h-full" />
        </button>
      ) : (
        <a
          href={item.href}
          aria-label={item.label}
          className="block w-[72px] h-[72px] md:w-14 md:h-14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
          onMouseEnter={show}
          onMouseLeave={hide}
          onFocus={show}
          onBlur={hide}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={iconRef} src={item.icon} alt="" aria-hidden className="block w-full h-full" />
        </a>
      )}
    </div>
  )
}

/* ── Export principal ─────────────────────────────────────────────── */
type Props = {
  layout?:    'inline' | 'stack' | 'section'
  className?: string
  locale?:    'fr' | 'en'
}

export default function FloatingContactActions({ layout = 'stack', className, locale = 'fr' }: Props) {
  const { open: openChatbot } = useChatbot()
  const allItems = locale === 'en' ? allItemsEn : allItemsFr

  const cardStyle: React.CSSProperties = {
    border:     '1px solid rgba(242,242,242,0.1)',
    background: 'rgba(255,255,255,0.02)',
    transition: 'border-color 200ms ease, background 200ms ease',
  }
  const cardHover = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = 'rgba(204,255,51,0.25)'
    e.currentTarget.style.background  = 'rgba(204,255,51,0.03)'
  }
  const cardLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.borderColor = 'rgba(242,242,242,0.1)'
    e.currentTarget.style.background  = 'rgba(255,255,255,0.02)'
  }
  const cardClass = "flex flex-col items-center gap-4 p-6 rounded-xl group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
  const cardLabel = (item: ContactItem) => (
    <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>{item.label}</span>
  )

  /* Section — 3 cards non-fixes, pour la page contact */
  if (layout === 'section') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-3 gap-4', className)}>
        {allItems.map((item) =>
          item.isChatbot ? (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              onClick={openChatbot}
              className={cardClass}
              style={cardStyle}
              onMouseEnter={cardHover}
              onMouseLeave={cardLeave}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" aria-hidden width={56} height={56} />
              {cardLabel(item)}
            </button>
          ) : (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={cardClass}
              style={cardStyle}
              onMouseEnter={cardHover}
              onMouseLeave={cardLeave}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" aria-hidden width={56} height={56} />
              {cardLabel(item)}
            </a>
          )
        )}
      </div>
    )
  }

  if (layout === 'inline') {
    return (
      <div className={cn('flex items-center justify-center gap-6', className)}>
        {allItems.map((item) =>
          item.isChatbot ? (
            <button
              key={item.label}
              type="button"
              aria-label={item.label}
              onClick={openChatbot}
              className="transition duration-200 ease-out hover:opacity-90 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" aria-hidden width={54} height={54} />
            </button>
          ) : (
            <a
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className="transition duration-200 ease-out hover:opacity-90 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.icon} alt="" aria-hidden width={54} height={54} />
            </a>
          )
        )}
      </div>
    )
  }

  /* Stack — BUTTON HOVER + tooltip GSAP */
  return (
    <>
      {/* Dégradé fixe mobile — derrière les boutons, au-dessus du contenu */}
      <div
        id="floating-contact-gradient"
        aria-hidden
        className="fixed inset-x-0 bottom-0 h-[150px] pointer-events-none md:hidden z-[29]"
        style={{
          background: 'linear-gradient(to top, #191919 0%, #191919 28%, rgba(25,25,25,0.75) 55%, rgba(25,25,25,0) 100%)',
        }}
      />

      <div
        id="floating-contact-actions"
        className={cn(
          'fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-row items-center gap-6',
          'md:left-auto md:translate-x-0 md:right-5 md:bottom-16 md:z-40 md:flex-col md:gap-3',
          className,
        )}
      >
        {allItems.map((item) => (
          <FloatingItem key={item.label} item={item} onChatbot={openChatbot} />
        ))}
      </div>
    </>
  )
}
