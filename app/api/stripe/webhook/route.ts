import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { getProductById } from '@/lib/products'

/*
  POST /api/stripe/webhook

  Source de vérité du paiement — ne pas marquer une commande payée
  sans avoir vérifié la signature Stripe.

  Événements traités :
    checkout.session.completed → handlePaidOrder()
*/

/* ── Email admin ─────────────────────────────────────────────────── */

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

interface LineItemSummary {
  name:     string
  quantity: number
  price:    number  // CHF unitaire
}

function buildAdminEmail(
  session: Stripe.Checkout.Session,
  items:   LineItemSummary[],
): string {
  const ref      = esc(session.metadata?.orderReference ?? '—')
  const total    = session.amount_total ? (session.amount_total / 100).toFixed(2) : '—'
  const cName    = esc(session.customer_details?.name  ?? '—')
  const cEmail   = esc(session.customer_details?.email ?? '—')
  const cPhone   = esc(session.customer_details?.phone ?? '—')
  const payment  = esc((session.payment_method_types ?? []).join(', ') || '—')

  const rows = items.map(i =>
    `<tr>
      <td style="padding:6px 12px;font-size:13px">${esc(i.name)}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:center">${i.quantity}</td>
      <td style="padding:6px 12px;font-size:13px;text-align:right">CHF ${(i.price * i.quantity).toFixed(2)}</td>
    </tr>`
  ).join('')

  return `
    <div style="font-family:system-ui,sans-serif;max-width:660px;margin:0 auto;background:#111;color:#f2f2f2;border-radius:10px;padding:28px 24px">
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:400;color:#ccff33">[${ref}] Nouvelle commande shop</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#888">Paiement confirmé via Stripe Webhook</p>
      <table style="border-collapse:collapse;width:100%;background:rgba(255,255,255,0.04);border-radius:8px;margin-bottom:16px">
        <tr><td colspan="3" style="padding:14px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Client</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px;width:160px">Nom</td><td colspan="2" style="padding:6px 12px;font-size:13px">${cName}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px">Email</td><td colspan="2" style="padding:6px 12px;font-size:13px">${cEmail}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px">Téléphone</td><td colspan="2" style="padding:6px 12px;font-size:13px">${cPhone}</td></tr>
        <tr><td style="padding:6px 12px;color:#888;font-size:13px">Paiement</td><td colspan="2" style="padding:6px 12px;font-size:13px">${payment}</td></tr>
      </table>
      <table style="border-collapse:collapse;width:100%;background:rgba(255,255,255,0.04);border-radius:8px">
        <tr><td colspan="3" style="padding:14px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Commande</td></tr>
        <tr style="background:rgba(255,255,255,0.02)">
          <th style="padding:6px 12px;font-size:12px;font-weight:400;color:#888;text-align:left">Produit</th>
          <th style="padding:6px 12px;font-size:12px;font-weight:400;color:#888;text-align:center">Qté</th>
          <th style="padding:6px 12px;font-size:12px;font-weight:400;color:#888;text-align:right">Montant</th>
        </tr>
        ${rows}
        <tr style="border-top:1px solid rgba(255,255,255,0.1)">
          <td colspan="2" style="padding:8px 12px;font-size:13px;color:#888">Total</td>
          <td style="padding:8px 12px;font-size:14px;color:#ccff33;text-align:right;font-weight:400">CHF ${total}</td>
        </tr>
      </table>
      <p style="margin:24px 0 0;font-size:11px;color:#555">clikclak.ch — commande reçue via Stripe Webhook</p>
    </div>`
}

function buildClientEmail(
  session: Stripe.Checkout.Session,
  items:   LineItemSummary[],
  ref:     string,
): string {
  const name  = esc(session.customer_details?.name ?? 'Madame, Monsieur')
  const total = session.amount_total ? (session.amount_total / 100).toFixed(2) : '—'

  const rows = items.map(i =>
    `<p style="margin:0 0 6px;font-size:13px">
      <span style="color:#888">${esc(i.name)} × ${i.quantity}</span> — CHF ${(i.price * i.quantity).toFixed(2)}
    </p>`
  ).join('')

  return `
    <div style="font-family:system-ui,sans-serif;max-width:620px;margin:0 auto;background:#111;color:#f2f2f2;border-radius:10px;padding:28px 24px">
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:400;color:#ccff33">Confirmation de votre commande ClikClak</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#888">Référence : <strong style="color:#ccff33;font-weight:400">${esc(ref)}</strong></p>
      <p style="font-size:14px;line-height:1.7;margin:0 0 16px">Bonjour ${name},</p>
      <p style="font-size:14px;line-height:1.7;margin:0 0 16px">Votre paiement a été reçu. Voici le récapitulatif :</p>
      <div style="margin:16px 0;padding:16px;background:rgba(255,255,255,0.04);border-radius:8px">
        ${rows}
        <p style="margin:12px 0 0;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08);font-size:14px">
          <span style="color:#888">Total payé :</span> <strong style="color:#ccff33;font-weight:400">CHF ${total}</strong>
        </p>
      </div>
      <p style="font-size:14px;line-height:1.7;margin:16px 0">
        ClikClak vous contactera prochainement pour organiser la suite de votre commande.
      </p>
      <div style="margin:24px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#555;line-height:1.8">
        <strong style="color:#888">ClikClak</strong><br />
        Rue du Petit-Chêne 9b, 1003 Lausanne<br />
        info@clikclak.ch — 021 320 44 77
      </div>
    </div>`
}

/* ── Handler commande payée ──────────────────────────────────────── */

/*
  FUTURE — Supabase orders table (à brancher ici quand Supabase sera configuré)

  Schéma recommandé :
    id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
    order_ref           text NOT NULL UNIQUE          -- ex: CC-SHOP-20260616-XY3Z
    stripe_session_id   text NOT NULL UNIQUE
    stripe_payment_intent_id text
    customer_email      text
    customer_name       text
    customer_phone      text
    items               jsonb NOT NULL               -- snapshot [{id, name, qty, price}]
    total_chf_cents     integer NOT NULL
    status              text NOT NULL DEFAULT 'paid' -- paid | refunded | cancelled
    created_at          timestamptz DEFAULT now()
    updated_at          timestamptz DEFAULT now()

  Insertion à placer dans handlePaidOrder() après vérification de la signature :
    await supabase.from('orders').insert({ ... })

  Ligne client (auth optionnelle) :
    customer_id         uuid REFERENCES auth.users(id) -- NULL pour les achats invité
*/

async function handlePaidOrder(session: Stripe.Checkout.Session): Promise<void> {
  const ref        = session.metadata?.orderReference ?? 'UNKNOWN'
  const toEmail    = process.env.CONTACT_TO_EMAIL
  const fromEmail  = process.env.CONTACT_FROM_EMAIL
  const apiKey     = process.env.RESEND_API_KEY
  const clientEmail = session.customer_details?.email

  /* Récupération des line_items depuis Stripe pour fiabilité */
  const stripe    = getStripe()
  const lineItems: LineItemSummary[] = []

  if (stripe) {
    try {
      const result = await stripe.checkout.sessions.listLineItems(session.id)
      for (const item of result.data) {
        lineItems.push({
          name:     item.description ?? '—',
          quantity: item.quantity    ?? 1,
          price:    item.price?.unit_amount ? item.price.unit_amount / 100 : 0,
        })
      }
    } catch {
      /* Fallback sur les IDs produits en metadata */
      const ids = session.metadata?.productIds
        ? (JSON.parse(session.metadata.productIds) as string[])
        : []
      for (const id of ids) {
        const p = getProductById(id)
        if (p && p.priceChfCents != null) lineItems.push({ name: p.name, quantity: 1, price: p.priceChfCents / 100 })
      }
    }
  }

  if (!toEmail || !fromEmail || !apiKey) return  /* mode dev sans config email */

  /* Email admin (blocking) */
  try {
    await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    `ClikClak Shop <${fromEmail}>`,
        to:      [toEmail],
        subject: `[${ref}] Nouvelle commande shop — ClikClak`,
        html:    buildAdminEmail(session, lineItems),
      }),
    })
  } catch {
    console.error('[webhook] admin email failed')
  }

  /* Email client (non-blocking) */
  if (clientEmail) {
    fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    `ClikClak <${fromEmail}>`,
        to:      [clientEmail],
        subject: `[${ref}] Confirmation de votre commande ClikClak`,
        html:    buildClientEmail(session, lineItems, ref),
      }),
    }).catch(() => {})
  }
}

/* ── Route POST ─────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripe || !secret) {
    return NextResponse.json({ error: 'Webhook non configuré.' }, { status: 503 })
  }

  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return NextResponse.json({ error: 'Impossible de lire le body.' }, { status: 400 })
  }

  const sig = req.headers.get('stripe-signature')
  if (!sig) {
    return NextResponse.json({ error: 'Signature manquante.' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, secret)
  } catch (err) {
    console.error('[stripe/webhook] Signature invalide:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'Signature invalide.' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    await handlePaidOrder(event.data.object as Stripe.Checkout.Session)
  }

  return NextResponse.json({ received: true })
}
