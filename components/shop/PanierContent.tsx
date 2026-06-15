'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useCart } from './CartContext'
import { SHOP_PRODUCTS } from '@/data/shopProducts'

const QTY_BTN: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  width:          32,
  height:         32,
  borderRadius:   8,
  border:         '1px solid rgba(242,242,242,0.15)',
  color:          'rgba(242,242,242,0.6)',
  background:     'rgba(242,242,242,0.04)',
  cursor:         'pointer',
  fontSize:       16,
}

export default function PanierContent() {
  const { items, totalPrice, removeItem, updateQty, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const entries = items
    .map(i => ({ product: SHOP_PRODUCTS.find(p => p.id === i.productId), quantity: i.quantity }))
    .filter((e): e is { product: NonNullable<typeof e['product']>; quantity: number } => !!e.product)

  const handleCheckout = async () => {
    if (items.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res  = await fetch('/api/stripe/checkout', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items: items.map(i => ({ productId: i.productId, quantity: i.quantity })) }),
      })
      const data = await res.json() as { url?: string; error?: string; devMode?: boolean }

      if (data.devMode) {
        setError('Paiement non disponible en mode développement (STRIPE_SECRET_KEY manquant).')
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

  if (entries.length === 0) {
    return (
      <section className="px-6 md:px-14 lg:px-20 py-24 border-t border-white/10">
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 items-start">
          <h1 className="text-[2rem] md:text-[2.5rem] font-light leading-tight">Votre panier</h1>
          <div
            className="w-full flex flex-col gap-5 items-start p-8 rounded-xl"
            style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
          >
            <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.6)' }}>
              Votre panier est vide.
            </p>
            <Button href="/shop-reparation-smartphone-lausanne" variant="secondary">
              ← Retour au shop
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10">
      <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-light" aria-label="Fil d'Ariane">
          <Link href="/shop-reparation-smartphone-lausanne" className="underline underline-offset-4 focus-visible:outline-none" style={{ color: 'rgba(204,255,51,0.6)' }}>
            Shop
          </Link>
          <span style={{ color: 'rgba(242,242,242,0.25)' }}>/</span>
          <span style={{ color: 'rgba(242,242,242,0.6)' }}>Panier</span>
        </nav>

        <h1 className="text-[2rem] md:text-[2.5rem] font-light leading-tight">Votre panier</h1>

        {/* Liste produits */}
        <div className="flex flex-col gap-3">
          {entries.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="flex gap-4 p-4 rounded-xl"
              style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
            >
              {product.images[0] && (
                <div className="relative rounded-lg overflow-hidden shrink-0" style={{ width: 80, height: 80 }}>
                  <Image fill src={product.images[0]} alt={product.name} style={{ objectFit: 'cover' }} sizes="80px" />
                </div>
              )}
              <div className="flex-1 flex flex-col gap-2 min-w-0">
                <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>{product.name}</p>
                <p className="text-base font-light" style={{ color: '#ccff33' }}>CHF {product.price.toFixed(0)}</p>
                <div className="flex items-center gap-2">
                  <button type="button" style={QTY_BTN} onClick={() => updateQty(product.id, quantity - 1)} className="focus-visible:outline-none" aria-label="Diminuer">−</button>
                  <span className="text-sm font-light w-8 text-center" style={{ color: 'rgba(242,242,242,0.8)' }}>{quantity}</span>
                  <button type="button" style={QTY_BTN} onClick={() => updateQty(product.id, quantity + 1)} className="focus-visible:outline-none" aria-label="Augmenter">+</button>
                  <span className="text-xs font-light ml-2" style={{ color: 'rgba(242,242,242,0.4)' }}>
                    Sous-total : CHF {(product.price * quantity).toFixed(0)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeItem(product.id)}
                className="self-start text-xs font-light rounded px-2 py-1 focus-visible:outline-none"
                style={{ color: 'rgba(242,242,242,0.3)', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.08)' }}
                aria-label="Retirer"
              >
                Retirer
              </button>
            </div>
          ))}
        </div>

        {/* Total + paiement */}
        <div
          className="flex flex-col gap-4 p-6 rounded-xl"
          style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.55)' }}>Total</span>
            <span className="text-2xl font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>
              CHF {totalPrice.toFixed(0)}
            </span>
          </div>
          <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.35)' }}>
            Prix en CHF. Paiement sécurisé via Stripe. TWINT et carte bancaire acceptés.
          </p>
          {error && (
            <p className="text-sm font-light" style={{ color: 'rgba(255,100,100,0.8)' }}>{error}</p>
          )}
          <Button variant="primary" size="lg" disabled={loading} className="w-full" onClick={handleCheckout}>
            {loading ? 'Redirection vers le paiement…' : 'Passer au paiement'}
          </Button>
        </div>

        {/* Actions secondaires */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/shop-reparation-smartphone-lausanne"
            className="text-sm font-light underline underline-offset-4 focus-visible:outline-none"
            style={{ color: 'rgba(242,242,242,0.4)' }}
          >
            ← Continuer mes achats
          </Link>
          <button
            type="button"
            onClick={clearCart}
            className="text-xs font-light rounded px-3 py-2 focus-visible:outline-none"
            style={{ color: 'rgba(242,242,242,0.3)', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.08)' }}
          >
            Vider le panier
          </button>
        </div>
      </div>
    </section>
  )
}
