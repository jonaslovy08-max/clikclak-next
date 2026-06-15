'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useCart } from './CartContext'
import { SHOP_PRODUCTS } from '@/data/shopProducts'

const ICON: React.CSSProperties = {
  display:          'flex',
  alignItems:       'center',
  justifyContent:   'center',
  width:            32,
  height:           32,
  borderRadius:     8,
  background:       'rgba(242,242,242,0.06)',
  color:            'rgba(242,242,242,0.5)',
  fontSize:         18,
  cursor:           'pointer',
  border:           '1px solid rgba(242,242,242,0.08)',
  flexShrink:       0,
}

const QTY_BTN: React.CSSProperties = {
  display:    'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width:      26,
  height:     26,
  borderRadius: 6,
  border:     '1px solid rgba(242,242,242,0.15)',
  color:      'rgba(242,242,242,0.6)',
  background: 'rgba(242,242,242,0.04)',
  cursor:     'pointer',
  fontSize:   14,
}

async function startCheckout(
  items: { productId: string; quantity: number }[],
  setLoading: (v: boolean) => void,
  setError:   (v: string | null) => void,
) {
  setLoading(true)
  setError(null)
  try {
    const res  = await fetch('/api/stripe/checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ items }),
    })
    const data = await res.json() as { url?: string; error?: string; devMode?: boolean }

    if (data.devMode) {
      setError('Paiement non disponible en mode développement.')
      return
    }
    if (!res.ok || !data.url) {
      setError(data.error ?? 'Erreur lors du paiement. Réessayez.')
      return
    }
    window.location.href = data.url
  } catch {
    setError('Erreur réseau. Veuillez réessayer.')
  } finally {
    setLoading(false)
  }
}

export default function CartDrawer() {
  const { items, totalItems, totalPrice, isOpen, removeItem, updateQty, closeCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const entries = items
    .map(i => ({ product: SHOP_PRODUCTS.find(p => p.id === i.productId), quantity: i.quantity }))
    .filter((e): e is { product: NonNullable<typeof e['product']>; quantity: number } => !!e.product)

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden
        />
      )}

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal
        aria-label="Panier"
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col w-full max-w-sm"
        style={{
          background:  '#111',
          borderLeft:  '1px solid rgba(242,242,242,0.1)',
          transform:   isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition:  'transform 0.28s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(242,242,242,0.08)' }}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-light">Panier</span>
            {totalItems > 0 && (
              <span
                className="text-xs font-light px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(204,255,51,0.1)', color: '#ccff33', border: '1px solid rgba(204,255,51,0.28)' }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeCart}
            style={ICON}
            aria-label="Fermer le panier"
            className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
          >
            ×
          </button>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {entries.length === 0 ? (
            <div className="flex flex-col gap-4 items-center justify-center h-full text-center">
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Votre panier est vide.
              </p>
              <Link
                href="/shop-reparation-smartphone-lausanne"
                onClick={closeCart}
                className="text-sm font-light underline underline-offset-4 focus-visible:outline-none"
                style={{ color: 'rgba(204,255,51,0.7)' }}
              >
                Retour au shop →
              </Link>
            </div>
          ) : (
            entries.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="flex gap-3"
                style={{ paddingBottom: '1rem', borderBottom: '1px solid rgba(242,242,242,0.07)' }}
              >
                {product.images[0] && (
                  <div className="relative rounded-lg overflow-hidden shrink-0" style={{ width: 60, height: 60 }}>
                    <Image
                      fill
                      src={product.images[0]}
                      alt={product.name}
                      style={{ objectFit: 'cover' }}
                      sizes="60px"
                    />
                  </div>
                )}
                <div className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <p className="text-xs font-light leading-snug" style={{ color: 'rgba(242,242,242,0.85)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {product.name}
                  </p>
                  {product.price != null && (
                    <p className="text-sm font-light" style={{ color: '#ccff33' }}>
                      CHF {product.price.toFixed(0)}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <button type="button" style={QTY_BTN} onClick={() => updateQty(product.id, quantity - 1)} className="focus-visible:outline-none" aria-label="Diminuer">−</button>
                    <span className="text-xs font-light w-5 text-center" style={{ color: 'rgba(242,242,242,0.8)' }}>{quantity}</span>
                    <button type="button" style={QTY_BTN} onClick={() => updateQty(product.id, quantity + 1)} className="focus-visible:outline-none" aria-label="Augmenter">+</button>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="ml-auto text-xs font-light rounded px-2 py-1 focus-visible:outline-none"
                      style={{ color: 'rgba(242,242,242,0.3)', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.08)' }}
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pied de panier */}
        {entries.length > 0 && (
          <div
            className="px-5 py-5 flex flex-col gap-4"
            style={{ borderTop: '1px solid rgba(242,242,242,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>Total</span>
              <span className="text-base font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>
                CHF {totalPrice.toFixed(0)}
              </span>
            </div>
            <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)' }}>
              Paiement sécurisé. TWINT et carte bancaire acceptés.
            </p>
            {error && (
              <p className="text-xs font-light" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
            )}
            <Button
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full"
              onClick={() => startCheckout(
                items.map(i => ({ productId: i.productId, quantity: i.quantity })),
                setLoading,
                setError,
              )}
            >
              {loading ? 'Redirection…' : 'Passer au paiement'}
            </Button>
            <Link
              href="/shop-reparation-smartphone-lausanne/panier"
              onClick={closeCart}
              className="text-center text-xs font-light underline underline-offset-4 focus-visible:outline-none"
              style={{ color: 'rgba(242,242,242,0.4)' }}
            >
              Voir le panier complet
            </Link>
          </div>
        )}
      </aside>

    </>
  )
}
