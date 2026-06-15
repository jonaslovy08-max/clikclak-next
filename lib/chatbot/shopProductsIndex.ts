import { SHOP_PRODUCTS } from '@/data/shopProducts'
import { normalizeText } from './normalizeSearch'

export interface ShopProductResult {
  name:         string
  price:        string
  brand:        string
  availability: string
  grade?:       string
  href:         string
  shortDescription: string
}

export function searchShopProducts(query: string, limit = 3): ShopProductResult[] {
  const q    = normalizeText(query)
  const words = q.split(' ').filter(w => w.length > 1)

  const matches = SHOP_PRODUCTS.filter(p => {
    if (p.availability === 'sur-commande' && q.includes('stock')) return false
    const text = normalizeText(
      [p.name, p.brand ?? '', p.shortDescription, ...(p.tags ?? [])].join(' ')
    )
    return text.includes(q) || words.some(w => text.includes(w))
  })

  return matches.slice(0, limit).map(p => ({
    name:         p.name,
    price:        p.price != null && p.price > 0 ? `CHF ${p.price.toFixed(0)}` : 'Prix sur demande',
    brand:        p.brand ?? '',
    availability: p.availability === 'en-stock' ? 'En stock' : p.availability === 'sur-commande' ? 'Sur commande' : 'Indisponible',
    grade:        p.grade ?? undefined,
    href:         `/shop-reparation-smartphone-lausanne/${p.slug}`,
    shortDescription: p.shortDescription,
  }))
}
