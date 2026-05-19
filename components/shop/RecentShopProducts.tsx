import Image from 'next/image'
import Link from 'next/link'
import {
  SHOP_PRODUCTS,
  GRADE_LABELS,
  getProductBadge,
  AVAILABILITY_STYLES,
} from '@/data/shopProducts'

/*
  Affiche jusqu'à 3 produits réels "occasion-neuf".
  Ne s'affiche pas si aucun produit éligible.
  Server component — pas de 'use client'.
*/

const PRODUCTS = SHOP_PRODUCTS.filter(
  p =>
    p.mainCategory  === 'occasion-neuf' &&
    p.imageSource   === 'real'          &&
    p.isIllustrative === false
).slice(0, 3)

export default function RecentShopProducts() {
  if (PRODUCTS.length === 0) return null

  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-40 md:py-48 lg:py-56 border-t border-white/10"
      aria-labelledby="recent-shop-title"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">

        {/* En-tête */}
        <div className="flex flex-col gap-3">
          <h2
            id="recent-shop-title"
            className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight"
          >
            Produits{' '}
            <span className="text-accent">récents</span>
          </h2>
          <p className="text-sm font-light max-w-xl leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
            Découvrez une sélection d&apos;appareils disponibles en occasion, neuf ou reconditionné chez ClikClak.
          </p>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map(product => {
            const href  = `/shop-reparation-smartphone-lausanne/${product.slug}`
            const badge = getProductBadge(product)
            const avail = AVAILABILITY_STYLES[product.availability]
            const img   = product.images[0] ?? null

            /* Specs prioritaires pour l'aperçu */
            const specLines = [
              product.specs?.storage        ? `Capacité : ${product.specs.storage}`        : null,
              product.specs?.batteryHealth  ? `Batterie : ${product.specs.batteryHealth}`  : null,
              product.specs?.color          ? `Couleur : ${product.specs.color}`            : null,
            ].filter(Boolean) as string[]

            return (
              <Link
                key={product.id}
                href={href}
                className="flex flex-col rounded-xl overflow-hidden h-full transition-[border-color,background] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:border-[rgba(204,255,51,0.22)] hover:bg-[rgba(204,255,51,0.02)]"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                {/* Image */}
                {img && (
                  <div className="relative overflow-hidden w-full" style={{ aspectRatio: '4/3' }}>
                    <Image
                      fill
                      src={img}
                      alt={product.name}
                      style={{ objectFit: 'cover', objectPosition: 'center' }}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                  </div>
                )}

                {/* Contenu */}
                <div className="flex flex-col gap-3 p-4 flex-1">

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-xs font-light"
                      style={{
                        color:        badge.isAccent ? '#ccff33' : 'rgba(242,242,242,0.55)',
                        background:   badge.isAccent ? 'rgba(204,255,51,0.07)' : 'rgba(242,242,242,0.04)',
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

                  {/* Nom */}
                  <p className="text-sm font-light leading-snug" style={{ color: 'rgba(242,242,242,0.9)' }}>
                    {product.name}
                  </p>

                  {/* Specs aperçu */}
                  {specLines.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      {specLines.map(spec => (
                        <p key={spec} className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                          {spec}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Prix + dispo */}
                  <div className="flex items-center justify-between gap-2 mt-auto pt-2" style={{ borderTop: '1px solid rgba(242,242,242,0.07)' }}>
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
                    </span>
                    {product.price > 0 && (
                      <span className="text-base font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>
                        CHF {product.price.toFixed(0)}
                      </span>
                    )}
                  </div>

                  {/* CTA */}
                  <span
                    className="text-xs font-light"
                    style={{ color: 'rgba(204,255,51,0.65)' }}
                    aria-hidden
                  >
                    Voir le produit →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {/* CTA global */}
        <div>
          <Link
            href="/shop-reparation-smartphone-lausanne"
            className="inline-flex items-center gap-2 text-sm font-light underline underline-offset-4 focus-visible:outline-none"
            style={{ color: 'rgba(204,255,51,0.7)' }}
          >
            Voir tout le shop →
          </Link>
        </div>
      </div>
    </section>
  )
}
