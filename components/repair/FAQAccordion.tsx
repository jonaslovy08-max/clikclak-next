'use client'

/*
  FAQAccordion — accordéon FAQ générique (items passés en props).
  Même structure GSAP que RepairFAQ / RepairFAQGeneric.
*/

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'

export type FaqItem = { q: string; a: string }

export default function FAQAccordion({ items }: { items: FaqItem[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const panelRefs  = useRef<(HTMLDivElement | null)[]>([])
  const prevActive = useRef<number | null>(null)
  const reduced    = useRef(false)

  useLayoutEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRefs.current.forEach(p => {
      if (p) gsap.set(p, { height: 0, opacity: 0, overflow: 'hidden' })
    })
  }, [])

  useEffect(() => {
    const prev = prevActive.current
    prevActive.current = activeIndex

    if (prev !== null && prev !== activeIndex) {
      const panel = panelRefs.current[prev]
      if (panel) {
        gsap.killTweensOf(panel)
        gsap.set(panel, { overflow: 'hidden' })
        if (reduced.current) {
          gsap.set(panel, { height: 0, opacity: 0 })
        } else {
          gsap.to(panel, { height: 0, opacity: 0, duration: 0.22, ease: 'power2.in' })
        }
      }
    }

    if (activeIndex !== null) {
      const panel = panelRefs.current[activeIndex]
      if (panel) {
        gsap.killTweensOf(panel)
        gsap.set(panel, { overflow: 'hidden' })
        if (reduced.current) {
          gsap.set(panel, { height: 'auto', opacity: 1, overflow: 'visible' })
        } else {
          gsap.to(panel, {
            height: 'auto', opacity: 1, duration: 0.32, ease: 'power2.out',
            onComplete: () => gsap.set(panel, { overflow: 'visible' }),
          })
        }
      }
    }
  }, [activeIndex])

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const isOpen = activeIndex === i
        return (
          <div
            key={i}
            style={{
              borderRadius:    10,
              border:          `1px solid ${isOpen ? 'rgba(204,255,51,0.28)' : 'rgba(242,242,242,0.09)'}`,
              backgroundColor: isOpen ? 'rgba(204,255,51,0.025)' : 'rgba(255,255,255,0.025)',
              transition:      'border-color 220ms ease, background-color 220ms ease',
            }}
          >
            <button
              type="button"
              onClick={() => setActiveIndex(prev => prev === i ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`faq-accordion-panel-${i}`}
              className="w-full flex items-center justify-between gap-4 px-5 py-4 md:py-5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[10px]"
            >
              <span
                className="text-sm md:text-base font-light leading-snug"
                style={{ color: isOpen ? 'rgba(242,242,242,0.95)' : 'rgba(242,242,242,0.75)' }}
              >
                {item.q}
              </span>
              <span
                aria-hidden
                style={{
                  flexShrink: 0, width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, fontWeight: 300, lineHeight: 1,
                  color:     isOpen ? '#ccff33' : 'rgba(242,242,242,0.35)',
                  transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                  transition: 'transform 250ms ease, color 220ms ease',
                }}
              >
                +
              </span>
            </button>
            <div
              id={`faq-accordion-panel-${i}`}
              ref={el => { panelRefs.current[i] = el }}
              role="region"
            >
              <p
                className="px-5 pb-5 text-sm font-light leading-relaxed"
                style={{ color: 'rgba(242,242,242,0.55)' }}
              >
                {item.a}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
