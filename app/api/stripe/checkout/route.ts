import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getProductById, productIsPurchasable } from '@/lib/products'

/*
  POST /api/stripe/checkout

  Body : { items: { productId: string; quantity: number }[] }

  Cycle de vie commande :
    pending   → session Stripe créée, utilisateur redirigé vers Stripe Checkout
    paid      → webhook checkout.session.completed reçu et signature vérifiée
    cancelled → abandon panier ou timeout Stripe (cancel_url)

  Règles sécurité :
    - Prix recalculés côté serveur depuis data/shopProducts.ts — jamais depuis le client
    - STRIPE_SECRET_KEY uniquement côté serveur (jamais exposé au client)
    - Le webhook est la source de vérité du paiement, pas la page success
*/

const DEV = process.env.NODE_ENV === 'development'

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
    if (DEV) console.warn('[stripe/checkout] STRIPE_SECRET_KEY absent — paiement désactivé en dev')
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
  const baseUrl   = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clikclak.ch'

  for (const item of items) {
    if (typeof item.productId !== 'string' || typeof item.quantity !== 'number') {
      return NextResponse.json({ error: 'Format panier invalide.' }, { status: 400 })
    }

    const product = getProductById(item.productId)
    if (!product || !productIsPurchasable(product)) {
      return NextResponse.json(
        { error: `Produit non disponible à l'achat en ligne : ${item.productId}` },
        { status: 400 }
      )
    }

    /* productIsPurchasable garantit priceChfCents > 0 */
    const priceChfCents = product.priceChfCents as number

    if (!Number.isInteger(item.quantity) || item.quantity <= 0 || item.quantity > 99) {
      return NextResponse.json({ error: 'Quantité invalide.' }, { status: 400 })
    }

    const imgUrl = product.images[0] ? `${baseUrl}${product.images[0]}` : undefined

    lineItems.push({
      price_data: {
        currency:     'chf',
        product_data: {
          name:   product.name,
          ...(imgUrl ? { images: [imgUrl] } : {}),
        },
        unit_amount: priceChfCents,  // déjà en centimes
      },
      quantity: item.quantity,
    })
  }

  const orderRef = generateOrderRef()

  if (DEV) {
    console.log(`[stripe/checkout] Création session — ref: ${orderRef}, ${items.length} produit(s)`, {
      productIds: items.map(i => i.productId),
    })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types:    ['card', 'twint'],
      mode:                    'payment',
      line_items:              lineItems,
      phone_number_collection: { enabled: true },
      /* {CHECKOUT_SESSION_ID} est un template Stripe remplacé automatiquement à la redirection */
      success_url: `${baseUrl}/shop-reparation-smartphone-lausanne/success?session_id={CHECKOUT_SESSION_ID}&ref=${orderRef}`,
      cancel_url:  `${baseUrl}/shop-reparation-smartphone-lausanne/cancel`,
      metadata: {
        orderReference: orderRef,
        productIds:     JSON.stringify(items.map(i => i.productId)),
        source:         'clikclak-shop',
      },
    })

    if (DEV) console.log(`[stripe/checkout] Session créée — id: ${session.id}, url: ${session.url}`)

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[stripe/checkout]', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Erreur lors de la création du paiement.' }, { status: 502 })
  }
}
