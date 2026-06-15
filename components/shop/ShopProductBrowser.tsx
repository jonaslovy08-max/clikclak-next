'use client'

/*
  ShopProductBrowser — catalogue interactif du shop ClikClak.

  Structure :
    1. Section "Que recherchez-vous ?" → 3 grandes cards de catégorie cliquables
    2. Section "Catalogue" → champ de recherche + filtres + grille produits

  État :
    - activeCategory : ShopMainCategory | 'all'
    - searchQuery    : string

  Cliquer une card de catégorie →
    setActiveCategory + scroll doux vers #produits

  La recherche normalise les accents (ex: "écran" → "ecran")
  et cherche dans : name, mainCategory, subCategory, brand,
                    compatibleModels, condition, shortDescription, tags
*/

import { useState, useMemo, useId } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  type ShopProduct,
  type ShopMainCategory,
  AVAILABILITY_STYLES,
  GRADE_LABELS,
  getProductBadge,
  isProductPurchasable,
} from '@/data/shopProducts'
import AddToCartButton from './AddToCartButton'
import { Button }       from '@/components/ui/Button'
import { getProductMainImage, getProductImages } from '@/lib/products/images'

/* ── Styles partagés ──────────────────────────────────────────── */
const IS: React.CSSProperties = {
  width:            '100%',
  background:       'rgba(255,255,255,0.04)',
  border:           '1px solid #ccff33',
  borderRadius:     12,
  padding:          '14px 48px 14px 16px',
  fontSize:         16,
  fontWeight:       300,
  color:            'rgba(242,242,242,0.9)',
  outline:          'none',
  appearance:       'none',
  WebkitAppearance: 'none',
}

/* ── Normalisation ────────────────────────────────────────────── */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

function matchesSearch(p: ShopProduct, query: string): boolean {
  if (!query) return true
  const q = normalize(query)
  const hay = normalize(
    [
      p.name,
      p.mainCategory,
      p.subCategory ?? '',
      p.brand ?? '',
      p.model ?? '',
      ...(p.compatibleModels ?? []),
      p.condition ?? '',
      p.shortDescription,
      ...(p.tags ?? []),
    ].join(' ')
  )
  return hay.includes(q)
}

const ALL = 'all'
type ActiveCategory = ShopMainCategory | typeof ALL

const FILTER_TABS: { id: ActiveCategory; label: string }[] = [
  { id: ALL,                  label: 'Tous' },
  { id: 'occasion-neuf',      label: 'Occasion et neuf' },
  { id: 'pieces-detachees',   label: 'Pièces détachées' },
  { id: 'accessoires-autres', label: 'Accessoires / autres' },
]

/* ── Style chevron ────────────────────────────────────────────── */
const CHEVRON_BTN: React.CSSProperties = {
  position:       'absolute',
  top:            '50%',
  transform:      'translateY(-50%)',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          28,
  height:         28,
  borderRadius:   '50%',
  background:     'rgba(25,25,25,0.72)',
  border:         '1px solid rgba(255,255,255,0.14)',
  color:          'rgba(255,255,255,0.75)',
  fontSize:       15,
  lineHeight:     1,
  backdropFilter: 'blur(4px)',
  cursor:         'pointer',
  zIndex:         2,
}

/* ── Card produit ─────────────────────────────────────────────── */
function ProductCard({ product }: { product: ShopProduct }) {
  const router      = useRouter()
  const avail       = AVAILABILITY_STYLES[product.availability]
  const badge       = getProductBadge(product)
  const href        = `/shop-reparation-smartphone-lausanne/${product.slug}`
  const purchasable  = isProductPurchasable(product)
  const displayImages = getProductImages(product)
  const multiImg     = displayImages.length > 1
  const [imgIdx, setImgIdx] = useState(0)
  const currentImg   = displayImages[imgIdx] ?? getProductMainImage(product)

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => e.stopPropagation()

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIdx(i => (i - 1 + displayImages.length) % displayImages.length)
  }
  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation()
    setImgIdx(i => (i + 1) % displayImages.length)
  }

  return (
    <div
      role="article"
      onClick={() => router.push(href)}
      className="flex flex-col rounded-xl overflow-hidden h-full cursor-pointer transition-[border-color,background] duration-200"
      style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(204,255,51,0.2)'
        ;(e.currentTarget as HTMLElement).style.background  = 'rgba(204,255,51,0.02)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(242,242,242,0.1)'
        ;(e.currentTarget as HTMLElement).style.background  = 'rgba(255,255,255,0.02)'
      }}
    >
      {/* Image + slider */}
      {currentImg && (
        <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <Image
            key={currentImg}
            fill
            src={currentImg}
            alt={`${product.name}${multiImg ? ` — ${imgIdx + 1}/${displayImages.length}` : ''}`}
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />

          {/* Chevrons */}
          {multiImg && (
            <>
              <button
                type="button"
                aria-label="Image précédente"
                onClick={prevImg}
                style={{ ...CHEVRON_BTN, left: 8 }}
                className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label="Image suivante"
                onClick={nextImg}
                style={{ ...CHEVRON_BTN, right: 8 }}
                className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              >
                ›
              </button>
              {/* Compteur dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-none">
                {displayImages.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width:        5,
                      height:       5,
                      borderRadius: '50%',
                      background:   i === imgIdx ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.3)',
                      display:      'inline-block',
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {/* Badge "Visuel indicatif" */}
          {product.isIllustrative && (
            <div className="absolute bottom-3 right-3">
              <span
                aria-label="Visuel indicatif — ne représente pas le produit exact"
                style={{
                  fontSize:       10,
                  fontWeight:     300,
                  letterSpacing:  '0.06em',
                  color:          'rgba(242,242,242,0.45)',
                  background:     'rgba(25,25,25,0.65)',
                  border:         '1px solid rgba(242,242,242,0.12)',
                  padding:        '2px 7px',
                  borderRadius:   4,
                  backdropFilter: 'blur(4px)',
                  display:        'inline-block',
                }}
              >
                Visuel indicatif
              </span>
            </div>
          )}
        </div>
      )}

      {/* Contenu */}
      <div className="flex flex-col gap-4 p-5 flex-1">

        {/* Badge produit + pastille grade */}
        <div className="self-start flex items-center gap-1.5 flex-wrap">
          <span
            className="text-xs font-light"
            style={{
              color:        badge.isAccent ? '#ccff33'                  : 'rgba(242,242,242,0.55)',
              background:   badge.isAccent ? 'rgba(204,255,51,0.07)'    : 'rgba(242,242,242,0.04)',
              border:       badge.isAccent ? '1px solid rgba(204,255,51,0.25)' : '1px solid rgba(242,242,242,0.1)',
              padding:      '2px 8px',
              borderRadius: 4,
            }}
          >
            {badge.label}
          </span>
          {product.grade && (
            <span
              className="text-[10px] font-light tracking-wider"
              style={{
                color:        (product.grade === 'NEUF' || product.grade === 'A+') ? '#ccff33' : 'rgba(242,242,242,0.55)',
                background:   'rgba(242,242,242,0.03)',
                border:       (product.grade === 'NEUF' || product.grade === 'A+')
                  ? '1px solid rgba(204,255,51,0.2)'
                  : '1px solid rgba(242,242,242,0.1)',
                padding:      '1px 6px',
                borderRadius: 3,
              }}
              aria-label={`Grade esthétique : ${GRADE_LABELS[product.grade]}`}
            >
              {GRADE_LABELS[product.grade]}
            </span>
          )}
        </div>

        {/* Nom + description */}
        <div className="flex flex-col gap-1.5 flex-1">
          <p className="text-lg font-light leading-snug" style={{ color: 'rgba(242,242,242,0.92)' }}>
            {product.name}
          </p>
          {product.brand && (
            <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
              {product.brand}
            </p>
          )}
          <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
            {product.shortDescription}
          </p>
          {product.compatibleModels && product.compatibleModels.length > 0 && (
            <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.35)' }}>
              Compatible&nbsp;: {product.compatibleModels.join(', ')}
            </p>
          )}
        </div>

        {/* Pied */}
        <div className="flex flex-col gap-4 pt-4" style={{ borderTop: '1px solid rgba(242,242,242,0.07)' }}>
          {/* Prix + disponibilité */}
          <div className="flex items-center justify-between gap-2">
            <span
              className="text-xs font-light"
              style={{
                color:        avail.color,
                background:   avail.bg,
                border:       `1px solid ${avail.border}`,
                padding:      '2px 8px',
                borderRadius: 4,
              }}
            >
              {avail.label}
              {!purchasable && product.stock != null && ` (${product.stock})`}
            </span>
            {purchasable && product.price != null ? (
              <span className="text-2xl font-medium" style={{ color: 'rgba(242,242,242,0.92)' }}>
                CHF {product.price.toFixed(0)}
              </span>
            ) : (
              <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                Prix sur demande
              </span>
            )}
          </div>
          {/* CTA */}
          <div className="flex gap-2" onClick={stop} onKeyDown={stop} role="none">
            {purchasable ? (
              <>
                <AddToCartButton productId={product.id} size="lg" className="flex-1 !min-w-0" />
                <Button href={href} variant="secondary" size="lg" className="flex-1 !min-w-0">
                  Détail
                </Button>
              </>
            ) : (
              <Button href={href} variant="secondary" size="lg" className="w-full justify-center">
                Voir le détail
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Composant principal ──────────────────────────────────────── */
export default function ShopProductBrowser({ products }: { products: ShopProduct[] }) {
  const uid                                   = useId()
  const [search, setSearch]                   = useState('')
  const [activeCategory, setActiveCategory]   = useState<ActiveCategory>(ALL)

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchCat = activeCategory === ALL || p.mainCategory === activeCategory
      return matchCat && matchesSearch(p, search)
    })
  }, [products, search, activeCategory])

  const hasSearch = search.length > 0

  return (
    <>
      <div
        id="produits"
        className="flex flex-col gap-4"
        style={{ scrollMarginTop: '80px' }}
      >
        {/* Champ recherche */}
        <div className="relative">
          <label htmlFor={`${uid}-search`} className="sr-only">
            Rechercher dans le catalogue
          </label>
          <input
            id={`${uid}-search`}
            type="search"
            autoComplete="off"
            spellCheck={false}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un produit…"
            aria-label="Rechercher dans le catalogue shop"
            style={{
              ...IS,
              borderColor: undefined,
              boxShadow:   hasSearch ? '0 0 0 2px rgba(204,255,51,0.08)' : undefined,
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = '#ccff33'
              e.currentTarget.style.boxShadow   = '0 0 0 2px rgba(204,255,51,0.1)'
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = '#ccff33'
              e.currentTarget.style.boxShadow   = hasSearch ? '0 0 0 2px rgba(204,255,51,0.08)' : 'none'
            }}
          />
          {hasSearch && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff33]"
              aria-label="Effacer la recherche"
            >
              <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden focusable="false">
                <line x1="1" y1="1" x2="13" y2="13" stroke="#ccff33" strokeWidth="2" strokeLinecap="round" />
                <line x1="13" y1="1" x2="1" y2="13" stroke="#ccff33" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Filtres catégorie */}
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrer par catégorie">
          {FILTER_TABS.map(tab => {
            const active = activeCategory === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategory(tab.id)}
                aria-pressed={active}
                className="text-sm font-light rounded-lg px-3 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent transition-[border-color,background,color] duration-150"
                style={{
                  border:     active ? '1px solid rgba(204,255,51,0.35)' : '1px solid rgba(242,242,242,0.1)',
                  background: active ? 'rgba(204,255,51,0.07)' : 'rgba(255,255,255,0.02)',
                  color:      active ? '#ccff33'                : 'rgba(242,242,242,0.55)',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Compteur */}
        <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)' }} aria-live="polite">
          {filtered.length === products.length
            ? `${products.length} produit${products.length > 1 ? 's' : ''}`
            : `${filtered.length} résultat${filtered.length > 1 ? 's' : ''} sur ${products.length}`
          }
        </p>

        {/* Grille */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div
            className="flex flex-col gap-4 items-start p-8 rounded-xl"
            style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
            role="status"
          >
            <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
              Aucun produit disponible pour le moment.
            </p>
            <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.4)' }}>
              Contactez ClikClak pour vérifier une disponibilité.
            </p>
            <Link
              href="/contact-clik-clak-lausanne"
              className="text-sm font-light underline underline-offset-4 focus-visible:outline-none"
              style={{ color: 'rgba(204,255,51,0.7)' }}
            >
              Demander disponibilité →
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
