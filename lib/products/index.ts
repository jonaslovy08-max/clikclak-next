/*
  lib/products/index.ts

  Couche d'accès produits — point d'entrée unique pour toute lecture de catalogue.

  Source actuelle : data/shopProducts.ts (fichier TypeScript statique).

  ┌─────────────────────────────────────────────────────────────┐
  │  MIGRATION SUPABASE — instructions                           │
  │                                                             │
  │  1. Installer le client : npm install @supabase/supabase-js │
  │  2. Créer lib/products/db.ts avec le client Supabase        │
  │  3. Remplacer chaque fonction ci-dessous par une requête DB  │
  │     ex: getProducts() → supabase.from('products').select()  │
  │  4. Supprimer les imports de data/shopProducts et adapter.ts │
  │  5. Le reste du code (pages, routes API) n'a pas à changer  │
  └─────────────────────────────────────────────────────────────┘

  Composants client (CartContext, CartDrawer, PanierContent, ClikClakAssistant)
  importent encore data/shopProducts directement — ils seront migrés vers
  fetch('/api/products/[id]') lors de l'intégration DB.
*/

import { SHOP_PRODUCTS } from '@/data/shopProducts'
import { adaptShopProduct }   from './adapter'
import { productIsPublic }    from './types'
import type { Product, ProductCategory } from './types'

/* ── Source de données ────────────────────────────────────────── */
/*
  Actuellement : data/shopProducts.ts (fichier TS statique)
  À terme : requête Supabase
    const { data } = await supabase.from('products').select('*').eq('status', 'active')
*/
function _source(): Product[] {
  return SHOP_PRODUCTS.map(adaptShopProduct)
}

/* ── API publique ─────────────────────────────────────────────── */

/**
 * Tous les produits actifs du catalogue public.
 * Migration : .from('products').select('*').eq('status','active').order('created_at', { ascending: false })
 */
export function getProducts(): Product[] {
  return _source().filter(productIsPublic)
}

/**
 * Produits d'une catégorie donnée (actifs uniquement).
 * Migration : .eq('category', category)
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return getProducts().filter(p => p.category === category)
}

/**
 * Un produit par slug (actif uniquement).
 * Migration : .eq('slug', slug).single()
 */
export function getProductBySlug(slug: string): Product | null {
  return getProducts().find(p => p.slug === slug) ?? null
}

/**
 * Un produit par ID (actif uniquement).
 * Migration : .eq('id', id).single()
 * Utilisé côté serveur uniquement (Stripe checkout).
 */
export function getProductById(id: string): Product | null {
  return getProducts().find(p => p.id === id) ?? null
}

/**
 * Produits achetables (actifs, purchasable, avec prix, stock > 0).
 * Migration : .eq('purchasable', true).gt('price_chf_cents', 0).gt('stock', 0)
 */
export function getPurchasableProducts(): Product[] {
  return getProducts().filter(p => p.purchasable && (p.priceChfCents ?? 0) > 0 && p.stock > 0)
}

/* ── Re-exports utiles ────────────────────────────────────────── */
export type { Product, ProductCategory, ProductStatus, PartType } from './types'
export { productIsPurchasable, productPriceChf, productIsPublic }  from './types'
