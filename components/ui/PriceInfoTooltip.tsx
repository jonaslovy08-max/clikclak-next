'use client'

import { useState } from 'react'

/*
  PriceInfoTooltip — bouton information sur les cartes prix réparation.
  Utilisé par MainRepairCard (Écran + Batterie).

  Desktop : tooltip au survol (mouseenter/leave).
  Mobile  : tooltip au tap (click), détection via matchMedia(hover:none).
  Focus clavier : onFocus/onBlur.

  Le tooltip est positionné en absolu (bottom: 100% + 8px, right: 0)
  par rapport au wrapper relative. Il nécessite que le parent ait
  overflow: visible (MainRepairCard retire overflow:'hidden' en conséquence).
*/

type Props = {
  isScreen: boolean
}

export default function PriceInfoTooltip({ isScreen }: Props) {
  const [open, setOpen] = useState(false)

  const handleClick = () => {
    if (typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches) {
      setOpen(o => !o)
    }
  }

  const borderColor = isScreen ? 'rgba(0,0,0,0.18)' : 'rgba(204,255,51,0.2)'

  return (
    <div style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        aria-label="Information sur le prix à partir de"
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={handleClick}
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
            position:    'absolute',
            bottom:      'calc(100% + 8px)',
            right:       0,
            width:       248,
            background:  '#141414',
            border:      `1px solid ${borderColor}`,
            borderRadius: 8,
            padding:     '10px 12px',
            zIndex:      50,
            pointerEvents: 'none',
          }}
        >
          <p
            style={{
              margin:     0,
              fontSize:   12,
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
