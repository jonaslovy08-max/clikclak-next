/*
  lib/products/types.ts

  Type Product cible — compatible avec une migration future vers Supabase.

  Règles de mapping Supabase :
    - table : products
    - price  stocké en centimes (integer) pour éviter les flottants
    - status : draft / active / archived → contrôle la visibilité publique
    - purchasable : false = jamais envoyé à Stripe, pas de bouton Acheter
    - stock : 0 à n (peut être affiché ou masqué selon le contexte)
    - images : tableau d'URLs publiques (Supabase Storage ou CDN)

  Aujourd'hui : cette structure est peuplée depuis data/shopProducts.ts via l'adaptateur.
  À terme : lue depuis Supabase via lib/products/db.ts (à créer lors de la migration).
*/

export type ProductCategory =
  | 'occasion-neuf'
  | 'pieces-detachees'
  | 'accessoires-autres'

export type ProductStatus = 'draft' | 'active' | 'archived'

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
  status:       ProductStatus      // draft = non publié, archived = retiré
  purchasable:  boolean            // false = pas de Stripe, pas de bouton Acheter

  /* ── Tarif ─────────────────────────────────────────────────── */
  priceChfCents?: number | null    // null = prix non disponible (pièces sans tarif)

  /* ── Stock ─────────────────────────────────────────────────── */
  stock:        number             // 0 = indisponible

  /* ── Visuels ─────────────────────────────────────────────── */
  images:       string[]           // URLs absolues ou chemins /public

  /* ── Descriptions ─────────────────────────────────────────── */
  description?:   string | null
  conditionNote?: string | null    // ex: "Stock faible", "aaa", "Grade A"

  /* ── Smartphones ──────────────────────────────────────────── */
  storage?:       string | null    // "128 Go", "256 Go"
  color?:         string | null    // "Noir", "Bleu nuit"
  batteryHealth?: string | null    // "87%"
  grade?:         string | null    // "A+", "A", "B", "NEUF"

  /* ── Pièces détachées ─────────────────────────────────────── */
  partType?:      PartType | null
  compatibleWith?: string[] | null
  quality?:       string | null    // "OLED", "Incell", "Original", "Originale"

  /* ── Métadonnées (Supabase) ───────────────────────────────── */
  createdAt?: string               // ISO 8601
  updatedAt?: string               // ISO 8601
}

/* ── Helpers ──────────────────────────────────────────────────── */

/** Retourne true si le produit peut être acheté en ligne via Stripe */
export function productIsPurchasable(p: Product): boolean {
  return (
    p.status      === 'active' &&
    p.purchasable === true     &&
    typeof p.priceChfCents === 'number' &&
    p.priceChfCents > 0        &&
    p.stock > 0
  )
}

/** Prix en CHF (décimal) depuis les centimes — null si pas de prix */
export function productPriceChf(p: Product): number | null {
  if (p.priceChfCents == null) return null
  return p.priceChfCents / 100
}

/** Vérifie qu'un produit est visible publiquement */
export function productIsPublic(p: Product): boolean {
  return p.status === 'active'
}
