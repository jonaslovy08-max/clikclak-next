/*
  normalizeIcecatProduct.ts — Normalisation des données Open Icecat
  vers le format ShopProduct de ClikClak.

  NOTE : Ce module est prêt pour une future intégration, mais Icecat
  n'est pas encore opérationnel (voir docs/icecat-test-report.md).
  Ne jamais importer ce module côté client ('use client').
*/

import type { ShopProduct, ShopMainCategory, ShopCondition } from '@/data/shopProducts'

/* Forme brute attendue de l'API Icecat (à ajuster selon réponse réelle) */
export interface RawIcecatProduct {
  product_id?:     number
  Name?:           string
  Vendorname?:     string
  ShortDesc?:      string
  LongDesc?:       string
  HighImg?:        string
  LowImg?:         string
  images?:         Array<{ Pic500x500?: string; Pic?: string }>
  featuresGroups?: Array<{
    FeatureGroup: { Name: string }
    Features:     Array<{ Feature: { Name: string }; Value: string }>
  }>
  EANCode?:        string
  GTIN?:           string
  Category?:       { Name?: string }
}

function guessMainCategory(raw: RawIcecatProduct): ShopMainCategory {
  const cat = (raw.Category?.Name ?? '').toLowerCase()
  if (/phone|smartphone|tablet|ordinat|macbook|laptop|notebook|watch|écouteur|airpod/i.test(cat)) return 'occasion-neuf'
  if (/screen|écran|battery|batterie|connector|connecteur|back|arrière|lens|lentille/i.test(cat)) return 'pieces-detachees'
  return 'accessoires-autres'
}

function collectImages(raw: RawIcecatProduct): string[] {
  const imgs: string[] = []
  if (raw.HighImg) imgs.push(raw.HighImg)
  if (raw.LowImg && raw.LowImg !== raw.HighImg) imgs.push(raw.LowImg)
  for (const img of raw.images ?? []) {
    const url = img.Pic500x500 ?? img.Pic
    if (url && !imgs.includes(url)) imgs.push(url)
  }
  return imgs
}

export function normalizeIcecatProduct(raw: RawIcecatProduct): Partial<ShopProduct> {
  const images = collectImages(raw)
  return {
    name:             raw.Name ?? '',
    brand:            raw.Vendorname,
    mainCategory:     guessMainCategory(raw),
    condition:        'neuf' as ShopCondition,
    availability:     'sur-demande',
    price:            0,
    images,
    shortDescription: raw.ShortDesc ?? '',
    description:      raw.LongDesc,
  }
}
