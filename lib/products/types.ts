/*
  lib/products/types.ts

  Type Product cible — compatible avec une migration future vers Supabase.

  Règles de mapping Supabase :
    - table : products
    - price  stocké en centimes (integer) pour éviter les flottants
    - status : draft / active / sold / archived → contrôle la visibilité et l'indexation
    - purchasable : false = jamais envoyé à Stripe, pas de bouton Acheter
    - stock : 0 à n
    - images : tableau d'URLs publiques (Supabase Storage ou CDN)

  Statuts :
    active   → visible, indexable, achetable si purchasable + prix + stock
    sold     → visible, non indexable, non achetable, page accessible avec badge "Vendu"
    draft    → jamais public, notFound() sur la page directe
    archived → jamais public, redirect si redirectTo, sinon notFound()

  Aujourd'hui : peuplé depuis data/shopProducts.ts via l'adaptateur.
  À terme : lu depuis Supabase via lib/products/db.ts.
*/

export type ProductCategory =
  | 'occasion-neuf'
  | 'pieces-detachees'
  | 'accessoires-autres'

export type ProductStatus = 'draft' | 'active' | 'sold' | 'archived'

export type PartType = 'Écran' | 'Batterie' | 'Connecteur' | 'Autre'

export interface Product {
  /* ── Identité ─────────────────────────────────────────────── */
  id:           string
  slug:         string
  name:         string
  brand?:       string | null

  /* ── Catalogue ─────────────────────────────────────────────── */
  category:     ProductCategory
  subCategory?: string | null
  status:       ProductStatus
  purchasable:  boolean            // false = pas de Stripe, pas de bouton Acheter

  /* ── Tarif ─────────────────────────────────────────────────── */
  priceChfCents?: number | null    // null = prix non disponible

  /* ── Stock ─────────────────────────────────────────────────── */
  stock:        number

  /* ── Visuels ─────────────────────────────────────────────── */
  images:       string[]
  model?:       string | null

  /* ── Descriptions ─────────────────────────────────────────── */
  description?:   string | null
  conditionNote?: string | null

  /* ── Smartphones ──────────────────────────────────────────── */
  storage?:       string | null
  color?:         string | null
  batteryHealth?: string | null
  grade?:         string | null

  /* ── Pièces détachées ─────────────────────────────────────── */
  partType?:       PartType | null
  compatibleWith?: string[] | null
  quality?:        string | null

  /* ── SEO / lifecycle ──────────────────────────────────────── */
  seoNoIndex?: boolean             // force noindex indépendamment du status
  redirectTo?: string | null       // URL cible si archived avec redirection
  soldAt?:     string | null       // ISO 8601 — date de vente
  archivedAt?: string | null       // ISO 8601 — date d'archivage

  /* ── Métadonnées (Supabase) ───────────────────────────────── */
  createdAt?: string
  updatedAt?: string
}

/* ── Helpers ──────────────────────────────────────────────────── */

/**
 * Visible publiquement : active (en vente) ou sold (vendu, page encore accessible).
 * draft et archived : jamais publics.
 */
export function productIsPublic(p: Product): boolean {
  return p.status === 'active' || p.status === 'sold'
}

/**
 * Achetable via Stripe : uniquement active, purchasable, avec prix positif et stock > 0.
 * Un produit sold, draft ou archived n'est jamais achetable.
 */
export function productIsPurchasable(p: Product): boolean {
  return (
    p.status        === 'active' &&
    p.purchasable   === true     &&
    typeof p.priceChfCents === 'number' &&
    p.priceChfCents > 0          &&
    p.stock > 0
  )
}

/**
 * Indexable par les moteurs de recherche : uniquement active.
 * sold → noindex (page accessible mais non indexée).
 * draft / archived → jamais atteints publiquement.
 */
export function productIsIndexable(p: Product): boolean {
  return p.status === 'active' && p.seoNoIndex !== true
}

/**
 * Vrai si le produit archivé doit faire l'objet d'une redirection 301.
 */
export function productShouldRedirect(p: Product): boolean {
  return p.status === 'archived' && typeof p.redirectTo === 'string' && p.redirectTo.length > 0
}

/**
 * URL cible de redirection pour les produits archivés.
 * Retourne null si pas de redirectTo.
 */
export function productRedirectTarget(p: Product): string | null {
  return productShouldRedirect(p) ? (p.redirectTo as string) : null
}

/** Prix en CHF (décimal) depuis les centimes — null si pas de prix */
export function productPriceChf(p: Product): number | null {
  if (p.priceChfCents == null) return null
  return p.priceChfCents / 100
}
