/*
  lib/products/images.ts

  Gestion centralisée des images produits.

  Règles :
  - Ne jamais accéder à product.images[0] directement dans les composants.
  - Toujours passer par getProductMainImage() ou getProductImages().
  - Les placeholders existent dans /public/assets/images/shop/placeholders/.
  - Aucun placeholder générique ne doit être inventé ici.
*/

const PLACEHOLDER_BASE = '/assets/images/shop/placeholders'

const PLACEHOLDERS = {
  smartphone: `${PLACEHOLDER_BASE}/smartphone-placeholder.webp`,
  tablet:     `${PLACEHOLDER_BASE}/tablet-placeholder.webp`,
  computer:   `${PLACEHOLDER_BASE}/computer-placeholder.webp`,
  part:       `${PLACEHOLDER_BASE}/part-placeholder.webp`,
  accessory:  `${PLACEHOLDER_BASE}/accessory-placeholder.webp`,
} as const

/* Interface minimale compatible ShopProduct et Product */
interface ProductLike {
  name:          string
  images:        string[]
  mainCategory?: string        // ShopProduct
  category?:     string        // Product
  subCategory?:  string | null
}

function getCategory(p: ProductLike): string {
  return (p.mainCategory ?? p.category ?? '').toLowerCase()
}

/**
 * Retourne l'URL du placeholder adapté à la catégorie et au type de produit.
 * Ne crée pas de nouvel asset — utilise uniquement les fichiers existants.
 */
export function getProductPlaceholder(p: ProductLike): string {
  const cat  = getCategory(p)
  const name = p.name.toLowerCase()
  const sub  = (p.subCategory ?? '').toLowerCase()

  if (cat === 'pieces-detachees') return PLACEHOLDERS.part

  if (cat === 'accessoires-autres') return PLACEHOLDERS.accessory

  /* Tablettes */
  if (
    sub.includes('tablette') || sub.includes('tablet') || sub.includes('ipad') ||
    name.includes('ipad') || name.includes('tablette')
  ) return PLACEHOLDERS.tablet

  /* Ordinateurs */
  if (
    sub.includes('ordinateur') || sub.includes('macbook') || sub.includes('laptop') ||
    name.includes('macbook') || name.includes('ordinateur') || name.includes('laptop')
  ) return PLACEHOLDERS.computer

  return PLACEHOLDERS.smartphone
}

/**
 * Retourne la première image réelle du produit, ou le placeholder adapté si aucune.
 * Utiliser cette fonction à la place de product.images[0].
 */
export function getProductMainImage(p: ProductLike): string {
  return p.images[0] ?? getProductPlaceholder(p)
}

/**
 * Retourne le tableau d'images complet, avec le placeholder en fallback si vide.
 * Utiliser pour passer à ProductImageGallery.
 */
export function getProductImages(p: ProductLike): string[] {
  return p.images.length > 0 ? p.images : [getProductPlaceholder(p)]
}

/**
 * Vrai si l'image affichée est un placeholder (non une image réelle).
 */
export function productHasRealImage(p: ProductLike): boolean {
  return p.images.length > 0
}
