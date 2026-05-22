'use client'

import { useState, useEffect, useRef } from 'react'

/*
  PriceInfoTooltip — bouton information sur les cartes prix réparation.
  Utilisé par MainRepairCard (Écran + Batterie).

  Desktop  : tooltip au survol (mouseenter/leave) + focus clavier (onFocus/onBlur).
  Mobile   : tooltip au tap (click toggle), détection via matchMedia(hover:none).
             onFocus/onBlur sont désactivés sur touch pour éviter le conflit :
             sans cette garde, onFocus(open) + onClick(toggle=close) produit
             un double-tap avant d'afficher le tooltip.
  Fermeture : tap/clic hors tooltip via document listener (mobile uniquement).
*/

type Props = { isScreen: boolean }

const isTouch = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches

export default function PriceInfoTooltip({ isScreen }: Props) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  /* Fermeture sur clic/tap extérieur — actif uniquement quand le tooltip est ouvert */
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent | TouchEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('touchstart', close)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('touchstart', close)
    }
  }, [open])

  const borderColor = isScreen ? 'rgba(0,0,0,0.18)' : 'rgba(204,255,51,0.2)'

  return (
    <div ref={wrapRef} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        aria-label="Informations sur le prix affiché"
        aria-expanded={open}
        onMouseEnter={() => { if (!isTouch()) setOpen(true)  }}
        onMouseLeave={() => { if (!isTouch()) setOpen(false) }}
        onFocus={()     => { if (!isTouch()) setOpen(true)  }}
        onBlur={()      => { if (!isTouch()) setOpen(false) }}
        onClick={()     => { if  (isTouch()) setOpen(o => !o) }}
        style={{
          background:     'transparent',
          border:         'none',
          padding:        0,
          cursor:         'pointer',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          opacity:        1,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/icons/icon-informations.svg"
          alt=""
          aria-hidden
          style={{ height: 20, width: 20, objectFit: 'contain' }}
        />
      </button>

      {open && (
        <div
          role="tooltip"
          style={{
            position:      'absolute',
            bottom:        'calc(100% + 8px)',
            right:         0,
            width:         248,
            background:    '#141414',
            border:        `1px solid ${borderColor}`,
            borderRadius:  8,
            padding:       '10px 12px',
            zIndex:        50,
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              margin:     0,
              fontSize:   14,
              fontWeight: 300,
              lineHeight: '1.55',
              color:      'rgba(242,242,242,0.72)',
            }}
          >
            Plusieurs qualités de pièces de rechange existent selon le modèle.
            {' '}Le choix est à confirmer en magasin.
          </p>
        </div>
      )}
    </div>
  )
}
