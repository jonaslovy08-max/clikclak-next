/*
  lib/products/index.ts

  Couche d'accès produits — point d'entrée unique pour toute lecture de catalogue.

  Source actuelle : data/shopProducts.ts (fichier TypeScript statique).

  ┌─────────────────────────────────────────────────────────────┐
  │  MIGRATION SUPABASE — instructions                           │
  │                                                             │
  │  1. npm install @supabase/supabase-js                       │
  │  2. Créer lib/products/db.ts avec le client Supabase        │
  │  3. Remplacer _source() par requêtes Supabase               │
  │  4. Supprimer imports de data/shopProducts + adapter.ts     │
  │  5. Pages et routes API restent inchangées                  │
  └─────────────────────────────────────────────────────────────┘

  Statuts :
    active   → catalogue public + sitemap + achetable si purchasable
    sold     → page accessible (badge Vendu), non achetable, non indexé
    draft    → jamais public → notFound()
    archived → jamais public → redirect ou notFound()

  Composants client (CartContext, CartDrawer, PanierContent, ClikClakAssistant)
  importent encore data/shopProducts directement — migrés vers
  fetch('/api/products/[id]') lors de l'intégration DB.
*/

import { SHOP_PRODUCTS } from '@/data/shopProducts'
import { adaptShopProduct }     from './adapter'
import {
  productIsPublic,
  productIsIndexable,
  productIsPurchasable,
} from './types'
import type { Product, ProductCategory } from './types'

/* ── Source de données ────────────────────────────────────────── */
function _source(): Product[] {
  return SHOP_PRODUCTS.map(adaptShopProduct)
}

/* ── Catalogue public (active + sold) ────────────────────────── */

/**
 * Produits visibles : active ET sold.
 * Utilisé pour la page produit et les pages générées statiquement.
 * Migration : .in('status', ['active', 'sold'])
 */
export function getPublicProducts(): Product[] {
  return _source().filter(productIsPublic)
}

/**
 * Produits du catalogue principal : active uniquement.
 * Utilisé pour le shop listing, les cards, les sections homepage.
 * Migration : .eq('status', 'active')
 */
export function getProducts(): Product[] {
  return _source().filter(p => p.status === 'active')
}

/**
 * Produits d'une catégorie donnée (active uniquement).
 * Migration : .eq('status', 'active').eq('category', category)
 */
export function getProductsByCategory(category: ProductCategory): Product[] {
  return getProducts().filter(p => p.category === category)
}

/**
 * Produit par slug pour la page produit publique (active + sold).
 * Retourne null si draft, archived ou inexistant.
 * Migration : .in('status', ['active','sold']).eq('slug', slug).single()
 */
export function getProductBySlugPublic(slug: string): Product | null {
  return getPublicProducts().find(p => p.slug === slug) ?? null
}

/**
 * Produit par slug ou ID quel que soit le statut (admin, redirects).
 * Retourne null si inexistant.
 * Migration : .eq('slug', slug).single()
 */
export function getProductBySlugAny(slug: string): Product | null {
  return _source().find(p => p.slug === slug) ?? null
}

/**
 * Produit par ID — actif uniquement — pour Stripe checkout (serveur).
 * Migration : .eq('status', 'active').eq('id', id).single()
 */
export function getProductById(id: string): Product | null {
  return getProducts().find(p => p.id === id) ?? null
}

/**
 * Produits indexables pour le sitemap : active + seoNoIndex !== true.
 * Migration : .eq('status', 'active').eq('seo_no_index', false)
 */
export function getIndexableProducts(): Product[] {
  return _source().filter(productIsIndexable)
}

/**
 * Produits achetables : active, purchasable, prix valide, stock > 0.
 */
export function getPurchasableProducts(): Product[] {
  return getProducts().filter(productIsPurchasable)
}

/* ── Re-exports ───────────────────────────────────────────────── */
export type { Product, ProductCategory, ProductStatus, PartType } from './types'
export {
  productIsPurchasable,
  productIsPublic,
  productIsIndexable,
  productShouldRedirect,
  productRedirectTarget,
  productPriceChf,
} from './types'
