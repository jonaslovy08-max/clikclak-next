import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import {
  SHOP_PRODUCTS,
  GRADE_LABELS,
  getProductBadge,
} from '@/data/shopProducts'

/*
  Affiche jusqu'à 3 produits réels "occasion-neuf".
  Ne s'affiche pas si aucun produit éligible.
  Server component — pas de 'use client'.
*/

const PRODUCTS = SHOP_PRODUCTS.filter(
  p =>
    p.mainCategory   === 'occasion-neuf' &&
    p.isIllustrative !== true
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
            Produits récents{' '}
            <span className="text-accent">du shop</span>
          </h2>
          <p className="text-base font-light max-w-xl leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
            Découvrez une sélection d&apos;appareils disponibles en occasion, neuf ou reconditionné chez ClikClak.
          </p>
        </div>

        {/* Grille */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map(product => {
            const href  = `/shop-reparation-smartphone-lausanne/${product.slug}`
            const badge = getProductBadge(product)
            const img   = product.images[0] ?? null

            return (
              <div
                key={product.id}
                className="flex flex-col rounded-xl overflow-hidden h-full transition-[border-color,background] duration-200 hover:border-[rgba(204,255,51,0.22)] hover:bg-[rgba(204,255,51,0.02)]"
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
                <div className="flex flex-col gap-4 p-4 flex-1">

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

                  {/* Nom produit — agrandi */}
                  <p className="text-lg font-light leading-snug" style={{ color: 'rgba(242,242,242,0.9)' }}>
                    {product.name}
                  </p>

                  {/* Prix — fort et visible */}
                  {product.price != null && product.price > 0 && (
                    <div className="mt-auto pt-3" style={{ borderTop: '1px solid rgba(242,242,242,0.07)' }}>
                      <span className="text-2xl font-light" style={{ color: 'rgba(242,242,242,0.95)' }}>
                        CHF {product.price.toFixed(0)}
                      </span>
                    </div>
                  )}

                  {/* Bouton Acheter */}
                  <Button href={href} size="lg" className="w-full justify-center">
                    Acheter
                  </Button>

                </div>
              </div>
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
