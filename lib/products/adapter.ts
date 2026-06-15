/*
  lib/products/adapter.ts

  Convertit un ShopProduct (source TypeScript temporaire) en Product (type cible backend).

  Ce fichier est transitoire — il disparaît lors de la migration Supabase :
  les données viennent alors directement de la DB sous le format Product.

  Migration : supprimer cet adaptateur et remplacer les appels dans index.ts
  par des requêtes Supabase (voir commentaires dans index.ts).
*/

import type { ShopProduct }  from '@/data/shopProducts'
import { isProductPurchasable } from '@/data/shopProducts'
import type { Product, PartType } from './types'

function inferPartType(sub?: string): PartType | null {
  if (!sub) return null
  const s = sub.toLowerCase()
  if (s.includes('écran') || s.includes('ecran')) return 'Écran'
  if (s.includes('batt'))  return 'Batterie'
  if (s.includes('connect')) return 'Connecteur'
  return 'Autre'
}

function inferStatus(p: ShopProduct): 'draft' | 'active' | 'archived' {
  if (p.availability === 'rupture') return 'archived'
  return 'active'
}

export function adaptShopProduct(p: ShopProduct): Product {
  const isPartCateg = p.mainCategory === 'pieces-detachees'
  const purchasable = isProductPurchasable(p)

  return {
    id:           p.id,
    slug:         p.slug,
    name:         p.name,
    brand:        p.brand ?? null,
    category:     p.mainCategory,
    subCategory:  p.subCategory ?? null,
    status:       inferStatus(p),
    purchasable,
    priceChfCents: typeof p.price === 'number' ? Math.round(p.price * 100) : null,
    stock:        typeof p.stock === 'number' ? p.stock : (p.availability === 'en-stock' ? 1 : 0),
    images:       p.images,
    description:  p.description ?? null,
    conditionNote: p.comment ?? null,

    /* smartphones */
    storage:       p.specs?.storage ?? null,
    color:         p.specs?.color   ?? null,
    batteryHealth: p.specs?.batteryHealth ?? null,
    grade:         p.grade ?? null,

    /* pièces détachées */
    partType:      isPartCateg ? inferPartType(p.subCategory) : null,
    compatibleWith: p.compatibleModels ?? null,
    quality:       isPartCateg ? (p.specs?.grade ?? null) : null,
  }
}
