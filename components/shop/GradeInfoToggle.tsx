'use client'

import { useState, useId } from 'react'
import Image from 'next/image'
import { GRADE_LABELS, GRADE_DESCRIPTIONS, type ShopGrade } from '@/data/shopProducts'

/*
  Toggle d'information sur le grade esthétique.
  Bouton "i" → affiche / cache la définition du grade.
  Le grade décrit l'état visuel, pas les specs techniques.
*/

interface Props {
  grade: ShopGrade
}

function gradeIsPositive(g: ShopGrade): boolean {
  return g === 'NEUF' || g === 'A+' || g === 'A'
}

export default function GradeInfoToggle({ grade }: Props) {
  const [open, setOpen] = useState(false)
  const descId = useId()

  return (
    <div className="flex flex-col gap-2">
      {/* Ligne principal : libellé + pastille + bouton "i" */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
          État esthétique
        </span>
        <span
          className="text-xs font-light tracking-wide"
          style={{
            color:        gradeIsPositive(grade) ? '#ccff33' : 'rgba(242,242,242,0.75)',
            background:   gradeIsPositive(grade) ? 'rgba(204,255,51,0.07)' : 'rgba(242,242,242,0.04)',
            border:       gradeIsPositive(grade) ? '1px solid rgba(204,255,51,0.22)' : '1px solid rgba(242,242,242,0.12)',
            padding:      '2px 10px',
            borderRadius: 5,
          }}
        >
          {GRADE_LABELS[grade]}
        </span>
        <button
          type="button"
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls={descId}
          aria-label={`Informations sur le grade ${GRADE_LABELS[grade]}`}
          className="flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-full"
          style={{
            width:      20,
            height:     20,
            background: 'transparent',
            border:     'none',
            padding:    0,
            flexShrink: 0,
            cursor:     'pointer',
            opacity:    open ? 1 : 0.55,
            transition: 'opacity 0.15s',
          }}
        >
          <Image
            src="/assets/icons/icon-informations.svg"
            alt=""
            aria-hidden
            width={18}
            height={18}
            unoptimized
          />
        </button>
      </div>

      {/* Panneau descriptif */}
      {open && (
        <div
          id={descId}
          role="region"
          aria-label={`Description grade ${GRADE_LABELS[grade]}`}
          className="flex flex-col gap-2 p-3 rounded-lg"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border:     '1px solid rgba(242,242,242,0.08)',
          }}
        >
          <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
            {GRADE_DESCRIPTIONS[grade]}
          </p>
          <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.35)' }}>
            Le grade décrit l&apos;état esthétique. La batterie, le stockage, les tests, la garantie et les réparations sont indiqués séparément.
          </p>
        </div>
      )}
    </div>
  )
}
