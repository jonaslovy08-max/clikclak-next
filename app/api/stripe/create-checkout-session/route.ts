import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { SHOP_PRODUCTS, isProductPurchasable } from '@/data/shopProducts'

/*
  POST /api/stripe/create-checkout-session

  Body : { items: { productId: string; quantity: number }[] }

  Règles :
  - Prix lu côté serveur depuis data/shopProducts.ts (jamais depuis le client)
  - Chaque produit doit être achetable (en-stock, price > 0)
  - Référence commande générée côté serveur
  - Moyens de paiement : card + twint (évolutif via Stripe dashboard)
*/

interface CheckoutItem {
  productId: string
  quantity:  number
}

function generateOrderRef(): string {
  const d   = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `CC-SHOP-${ymd}-${rnd}`
}

export async function POST(req: NextRequest) {
  const stripe = getStripe()

  if (!stripe) {
    return NextResponse.json(
      { error: 'Paiement non disponible — STRIPE_SECRET_KEY manquant.', devMode: true },
      { status: 503 }
    )
  }

  let items: CheckoutItem[]
  try {
    const body = await req.json() as { items?: unknown }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Panier vide ou invalide.' }, { status: 400 })
    }
    items = body.items as CheckoutItem[]
  } catch {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
  }

  /* Validation et construction des line_items côté serveur */
  const lineItems = []
  for (const item of items) {
    if (typeof item.productId !== 'string' || typeof item.quantity !== 'number') {
      return NextResponse.json({ error: 'Format panier invalide.' }, { status: 400 })
    }

    const product = SHOP_PRODUCTS.find(p => p.id === item.productId)
    if (!product || !isProductPurchasable(product)) {
      return NextResponse.json(
        { error: `Produit non disponible : ${item.productId}` },
        { status: 400 }
      )
    }

    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
      return NextResponse.json({ error: 'Quantité invalide.' }, { status: 400 })
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clikclak.ch'
    const imgUrl  = product.images[0] ? `${baseUrl}${product.images[0]}` : undefined

    lineItems.push({
      price_data: {
        currency:     'chf',
        product_data: {
          name:   product.name,
          ...(imgUrl ? { images: [imgUrl] } : {}),
        },
        unit_amount: Math.round(product.price * 100),  // CHF → centimes Stripe
      },
      quantity: item.quantity,
    })
  }

  const orderRef = generateOrderRef()
  const baseUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clikclak.ch'

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'twint'],
      mode:                 'payment',
      line_items:           lineItems,
      success_url:          `${baseUrl}/shop-reparation-smartphone-lausanne/success?ref=${orderRef}`,
      cancel_url:           `${baseUrl}/shop-reparation-smartphone-lausanne/cancel`,
      metadata: {
        orderReference: orderRef,
        productIds:     JSON.stringify(items.map(i => i.productId)),
        source:         'clikclak-shop',
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement.' }, { status: 502 })
  }
}
