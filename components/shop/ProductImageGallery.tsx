'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Props {
  images:         string[]
  productName:    string
  isIllustrative?: boolean
}

export default function ProductImageGallery({ images, productName, isIllustrative }: Props) {
  const [idx, setIdx] = useState(0)

  const mainImg    = images[idx] ?? images[0] ?? null
  const hasMultiple = images.length > 1

  return (
    <div className="flex flex-col gap-3">

      {/* Image principale */}
      {mainImg ? (
        <div
          className="relative overflow-hidden rounded-xl w-full"
          style={{ aspectRatio: '4/3' }}
        >
          <Image
            fill
            src={mainImg}
            alt={productName}
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="(min-width: 768px) 50vw, 100vw"
          />
          {isIllustrative && (
            <div className="absolute bottom-3 right-3">
              <span
                aria-label="Visuel indicatif — ne représente pas le produit exact"
                style={{
                  fontSize:       11,
                  fontWeight:     300,
                  letterSpacing:  '0.06em',
                  color:          'rgba(242,242,242,0.5)',
                  background:     'rgba(25,25,25,0.7)',
                  border:         '1px solid rgba(242,242,242,0.15)',
                  padding:        '3px 9px',
                  borderRadius:   4,
                  backdropFilter: 'blur(6px)',
                  display:        'inline-block',
                }}
              >
                Visuel indicatif
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          className="flex items-center justify-center rounded-xl w-full"
          style={{ aspectRatio: '4/3', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(242,242,242,0.08)' }}
        >
          <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.25)' }}>
            Image à venir
          </p>
        </div>
      )}

      {/* Miniatures cliquables */}
      {hasMultiple && (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`${productName} — vue ${i + 1}`}
              aria-pressed={i === idx}
              className="relative overflow-hidden rounded-lg focus-visible:outline-none"
              style={{
                aspectRatio:  '4/3',
                display:      'block',
                padding:      0,
                cursor:       'pointer',
                background:   'transparent',
                border:       i === idx
                  ? '2px solid #ccff33'
                  : '1px solid rgba(242,242,242,0.1)',
                opacity:      i === idx ? 1 : 0.5,
                transition:   'opacity 0.15s ease, border-color 0.15s ease',
                boxSizing:    'border-box',
              }}
            >
              <Image
                fill
                src={img}
                alt={`${productName} — vue ${i + 1}`}
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                sizes="(min-width: 768px) 17vw, 33vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
