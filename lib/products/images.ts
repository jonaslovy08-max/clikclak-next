/*
  lib/products/images.ts

  Logique centralisée des images produits — priorité à 4 niveaux :

    1. product.images        — image propre au produit (SKU)
    2. groupe couleur+modèle — ex : iphone-se-3-2022-bleu-nuit (smartphones uniquement)
    3. groupe modèle         — ex : iphone-se-3-2022, ecran-iphone-13
    4. famille/type          — ex : families/smartphone, families/screen
    5. placeholder           — fallback garanti (fichiers dans /shop/placeholders/)

  Règles :
  - Ne jamais accéder à product.images[0] directement dans les composants.
  - Toujours passer par getProductMainImage() ou getProductImages().
  - Les groupes sont déclarés dans lib/products/imageGroups.generated.ts.
  - Un groupe couleur (iphone-se-3-2022-bleu-nuit) est toujours prioritaire sur
    le groupe modèle générique (iphone-se-3-2022) pour les smartphones.
*/

import { PRODUCT_IMAGE_GROUPS } from './imageGroups.generated'

/* ── Placeholders ───────────────────────────────────────────────── */

const PLACEHOLDER_BASE = '/assets/images/shop/placeholders'

const PLACEHOLDERS = {
  smartphone: `${PLACEHOLDER_BASE}/smartphone-placeholder.webp`,
  tablet:     `${PLACEHOLDER_BASE}/tablet-placeholder.webp`,
  computer:   `${PLACEHOLDER_BASE}/computer-placeholder.webp`,
  part:       `${PLACEHOLDER_BASE}/part-placeholder.webp`,
  accessory:  `${PLACEHOLDER_BASE}/accessory-placeholder.webp`,
} as const

/* ── Interface commune ──────────────────────────────────────────── */

/*
  Compatible ShopProduct (data/shopProducts.ts) et Product (lib/products/types.ts).
  - color  : champ direct sur Product
  - specs  : champ imbriqué sur ShopProduct (specs.color)
*/
interface ProductLike {
  name:          string
  images:        string[]
  mainCategory?: string         // ShopProduct
  category?:     string         // Product
  subCategory?:  string | null
  model?:        string | null
  color?:        string | null  // Product — accès direct
  specs?:        { color?: string } | null  // ShopProduct — specs.color
}

function getCategory(p: ProductLike): string {
  return (p.mainCategory ?? p.category ?? '').toLowerCase()
}

function getColor(p: ProductLike): string | null {
  const c = p.color ?? p.specs?.color ?? null
  return c && c.trim() ? c.trim() : null
}

/* ── Slugification ──────────────────────────────────────────────── */

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // supprime les diacritiques (é→e, è→e…)
    .replace(/[()[\]]/g, ' ')         // parenthèses → espaces
    .replace(/[^\w\s-]/g, '')         // supprime caractères spéciaux
    .trim()
    .replace(/\s+/g, '-')             // espaces → tirets
    .replace(/-+/g, '-')              // dédoublonne les tirets
    .replace(/^-|-$/g, '')            // trim tirets en bord
}

/* ── Type de groupe ─────────────────────────────────────────────── */

export type ImageGroupType = 'smartphones' | 'parts' | 'accessories'

export function getProductImageGroupType(p: ProductLike): ImageGroupType {
  const cat = getCategory(p)
  if (cat === 'pieces-detachees')   return 'parts'
  if (cat === 'accessoires-autres') return 'accessories'
  return 'smartphones'
}

/* ── Préfixe pièce détachée ─────────────────────────────────────── */

function partPrefixFromSubCategory(sub: string): string {
  const s = sub.toLowerCase()
  if (s.includes('écran') || s.includes('ecran') || s.includes('screen')) return 'ecran'
  if (s.includes('batt'))                                                   return 'batterie'
  if (s.includes('connect'))                                                return 'connecteur'
  if (s.includes('vitre') || s.includes('verre'))                          return 'vitre'
  if (s.includes('haut-parleur') || s.includes('speaker'))                 return 'haut-parleur'
  if (s.includes('micro'))                                                  return 'micro'
  if (s.includes('bouton') || s.includes('button'))                        return 'bouton'
  if (s.includes('chassis') || s.includes('châssis'))                      return 'chassis'
  return slugify(sub)
}

/* ── Clé de groupe modèle (sans couleur) ────────────────────────── */

function modelGroupKey(p: ProductLike): string | null {
  const cat   = getCategory(p)
  const model = (p.model ?? '').trim()
  const sub   = (p.subCategory ?? '').trim()

  if (!model) return null

  if (cat === 'pieces-detachees') {
    const prefix = sub ? partPrefixFromSubCategory(sub) : 'piece'
    return `${prefix}-${slugify(model)}`
  }

  return slugify(model)
}

/* ── Clé de groupe principale (avec couleur pour smartphones) ────── */

/**
 * Retourne la clé de groupe principale du produit.
 *
 * Smartphones avec couleur : slugify(model) + "-" + slugify(color)
 *   model "iPhone SE 3 (2022)", color "Bleu nuit" → "iphone-se-3-2022-bleu-nuit"
 *   model "Samsung Galaxy S7",  color "Noire"     → "samsung-galaxy-s7-noire"
 *
 * Smartphones sans couleur : slugify(model)
 *   model "Motorola Moto G Power" (pas de couleur) → "motorola-moto-g-power"
 *
 * Pièces détachées : partPrefix + "-" + slugify(model)  (pas de couleur)
 *   subCat "Écrans" + model "iPhone 13" → "ecran-iphone-13"
 *
 * null si aucun modèle disponible.
 */
export function getProductImageGroup(p: ProductLike): string | null {
  const type  = getProductImageGroupType(p)
  const model = modelGroupKey(p)

  if (!model) return null

  if (type === 'smartphones') {
    const color = getColor(p)
    if (color) return `${model}-${slugify(color)}`
  }

  return model
}

/* ── Candidats dans l'ordre de priorité ─────────────────────────── */

/**
 * Retourne les clés manifest à tester dans l'ordre, pour ce produit.
 *
 * Smartphones avec couleur :
 *   1. smartphones/iphone-se-3-2022-bleu-nuit   ← couleur-spécifique
 *   2. smartphones/iphone-se-3-2022             ← modèle générique (image neutre uniquement)
 *   3. families/smartphone
 *
 * Smartphones sans couleur :
 *   1. smartphones/motorola-moto-g-power
 *   2. families/smartphone
 *
 * Pièces / Accessoires : pas de couleur dans la clé
 *   1. parts/ecran-iphone-13
 *   2. families/screen
 */
export function getProductImageGroupCandidates(p: ProductLike): string[] {
  const type    = getProductImageGroupType(p)
  const model   = modelGroupKey(p)
  const family  = `families/${getProductFamilyKey(p)}`
  const result: string[] = []

  if (model) {
    if (type === 'smartphones') {
      const color = getColor(p)
      if (color) {
        result.push(`${type}/${model}-${slugify(color)}`)  // 1. couleur-spécifique
      }
      result.push(`${type}/${model}`)  // 2. modèle générique (neutre si disponible)
    } else {
      result.push(`${type}/${model}`)  // 1. pièces / accessoires
    }
  }

  result.push(family)  // dernier recours avant placeholder
  return result
}

/* ── Clé de famille (fallback niveau 4) ─────────────────────────── */

export function getProductFamilyKey(p: ProductLike): string {
  const cat  = getCategory(p)
  const sub  = (p.subCategory ?? '').toLowerCase()
  const name = p.name.toLowerCase()

  if (cat === 'pieces-detachees') {
    if (sub.includes('écran') || sub.includes('ecran') || sub.includes('screen')) return 'screen'
    if (sub.includes('batt'))                                                       return 'battery'
    if (sub.includes('connect'))                                                    return 'connector'
    return 'part'
  }

  if (cat === 'accessoires-autres') return 'accessory'

  if (
    sub.includes('tablette') || sub.includes('tablet') || sub.includes('ipad') ||
    name.includes('ipad') || name.includes('tablette')
  ) return 'tablet'

  if (
    sub.includes('ordinateur') || sub.includes('macbook') || sub.includes('laptop') ||
    name.includes('macbook') || name.includes('ordinateur')
  ) return 'computer'

  return 'smartphone'
}

/* ── Lookup manifest ────────────────────────────────────────────── */

function manifestLookup(key: string): string[] {
  return PRODUCT_IMAGE_GROUPS[key] ?? []
}

/**
 * Retourne les URLs publiques des images héritées (groupe ou famille).
 * Teste les candidats dans l'ordre de priorité et retourne le premier trouvé.
 */
export function getProductImageGroupPaths(p: ProductLike): string[] {
  for (const key of getProductImageGroupCandidates(p)) {
    const paths = manifestLookup(key)
    if (paths.length > 0) return paths
  }
  return []
}

/* ── Placeholder ────────────────────────────────────────────────── */

/**
 * Retourne le placeholder adapté à la catégorie.
 * N'invente aucun asset — utilise uniquement les fichiers existants.
 */
export function getProductPlaceholder(p: ProductLike): string {
  const cat  = getCategory(p)
  const name = p.name.toLowerCase()
  const sub  = (p.subCategory ?? '').toLowerCase()

  if (cat === 'pieces-detachees')   return PLACEHOLDERS.part
  if (cat === 'accessoires-autres') return PLACEHOLDERS.accessory

  if (
    sub.includes('tablette') || sub.includes('tablet') || sub.includes('ipad') ||
    name.includes('ipad') || name.includes('tablette')
  ) return PLACEHOLDERS.tablet

  if (
    sub.includes('ordinateur') || sub.includes('macbook') || sub.includes('laptop') ||
    name.includes('macbook') || name.includes('ordinateur')
  ) return PLACEHOLDERS.computer

  return PLACEHOLDERS.smartphone
}

/* ── Fonctions principales ──────────────────────────────────────── */

/**
 * Image principale du produit — priorité :
 *   product.images[0] → groupe couleur → groupe modèle → famille → placeholder
 */
export function getProductMainImage(p: ProductLike): string {
  if (p.images.length > 0) return p.images[0]
  const groupPaths = getProductImageGroupPaths(p)
  if (groupPaths.length > 0) return groupPaths[0]
  return getProductPlaceholder(p)
}

/**
 * Tableau complet d'images — même priorité que getProductMainImage.
 */
export function getProductImages(p: ProductLike): string[] {
  if (p.images.length > 0) return p.images
  const groupPaths = getProductImageGroupPaths(p)
  if (groupPaths.length > 0) return groupPaths
  return [getProductPlaceholder(p)]
}

/* ── Prédicats ──────────────────────────────────────────────────── */

/**
 * Vrai uniquement si le produit a au moins une image propre (product.images).
 * Une image héritée de groupe n'est PAS une image réelle propre au produit.
 */
export function productHasRealImage(p: ProductLike): boolean {
  return p.images.length > 0
}

/**
 * Vrai si le produit hérite d'une image de groupe ou de famille.
 */
export function productHasInheritedImage(p: ProductLike): boolean {
  if (p.images.length > 0) return false
  return getProductImageGroupPaths(p).length > 0
}

/**
 * Vrai si le produit affiche un placeholder (aucune image propre ni héritée).
 */
export function productUsesPlaceholder(p: ProductLike): boolean {
  return p.images.length === 0 && getProductImageGroupPaths(p).length === 0
}
