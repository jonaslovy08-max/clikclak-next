import Stripe from 'stripe'

/*
  Singleton Stripe — côté serveur uniquement.
  Retourne null si STRIPE_SECRET_KEY est absent (mode dev sans Stripe).
*/

let _instance: Stripe | null = null

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  if (!_instance) {
    _instance = new Stripe(key, {
      apiVersion: '2026-04-22.dahlia',
    })
  }
  return _instance
}
