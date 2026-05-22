'use client'

import { useState, useId } from 'react'

/*
  BulletToggle — panel de détails animé, masqué par défaut.

  Animation : grid-template-rows 0fr→1fr + opacity 0→1, CSS pur, pas de Framer Motion.
  SEO : contenu toujours dans le DOM (grid collapse ≠ display:none).
  A11y : aria-expanded + aria-controls sur le bouton, id sur le panel animé.

  Props :
    bullets      — liste des points à afficher dans le panel
    labelClosed  — libellé du bouton quand le panel est fermé
    labelOpen    — libellé du bouton quand le panel est ouvert
*/

type Props = {
  bullets:     readonly string[] | string[]
  labelClosed: string
  labelOpen:   string
}

export default function BulletToggle({ bullets, labelClosed, labelOpen }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="flex flex-col">

      {/* Bouton capsule */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className="self-start inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent hover:bg-white/[0.08]"
        style={{
          color:      '#f2f2f2',
          border:     '1px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.04)',
        }}
      >
        <span>{open ? labelOpen : labelClosed}</span>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={open
            ? '/assets/ui/icon-chevron-toggle-up.svg'
            : '/assets/ui/icon-chevron-toggle-down.svg'
          }
          alt=""
          aria-hidden
          style={{ width: 12, height: 12, display: 'block', flexShrink: 0 }}
        />
      </button>

      {/* Panel animé — grid-template-rows collapse, contenu toujours dans le DOM */}
      <div
        id={panelId}
        style={{
          display:          'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          opacity:          open ? 1 : 0,
          transition:       'grid-template-rows 260ms ease, opacity 220ms ease',
        }}
      >
        {/* Enfant overflow-hidden requis pour le collapse grid */}
        <div style={{ overflow: 'hidden' }}>
          <div
            className="mt-3 rounded-2xl px-4 py-4"
            style={{
              border:     '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <ul className="flex flex-col gap-2">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start gap-2 text-sm font-light leading-snug"
                  style={{ color: '#f2f2f2' }}
                >
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    </div>
  )
}
