/*
  RepairBreadcrumbJsonLd — BreadcrumbList JSON-LD pour les pages réparation.

  Server Component (pas de 'use client') : aucune requête réseau/Supabase,
  aucun état, aucun JavaScript client. Réutilise l'infrastructure existante
  (breadcrumbSchema, jsonLdDoc, JsonLd) et les routes centralisées (i18n/routes).

  Hiérarchie :
    Landing FR : Accueil → Réparation → Réparation {marque}
    Landing EN : Home → Repair → {marque} repair
    Modèle  FR : … → Réparation {marque} → Réparation {model.name}
    Modèle  EN : … → {marque} repair → {model.name} repair

  Les noms de modèles proviennent de la base (valeur unique), utilisés tels
  quels même en EN (décision produit).
*/

import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/seo'
import { ROUTES, getAlternatePath } from '@/i18n/routes'
import {
  breadcrumbSchema,
  jsonLdDoc,
  type BreadcrumbItem,
} from '@/lib/structured-data'

interface Props {
  locale: 'fr' | 'en'
  brandName: string
  /** Chemin de base FR de la marque (brand.public_base_path / baseHref) */
  brandPath: string
  model?: {
    name: string
    slug: string
  }
}

/** Retire les slash finaux, garantit un slash initial, évite les doubles slash. */
function normalizePath(path: string): string {
  const trimmed = `/${path.replace(/^\/+/, '').replace(/\/+$/, '')}`
  return trimmed.replace(/\/{2,}/g, '/')
}

/** URL absolue HTTPS ; la racine conserve son slash, les autres non. */
function abs(path: string): string {
  if (path === '/') return `${SITE_URL}/`
  return `${SITE_URL}${normalizePath(path)}`
}

export default function RepairBreadcrumbJsonLd({
  locale,
  brandName,
  brandPath,
  model,
}: Props) {
  const name = brandName?.trim()
  if (!name || !brandPath?.trim()) return null

  const inputPath = normalizePath(brandPath)
  if (inputPath === '/') return null

  // Exclusion temporaire : la landing Sony renvoie actuellement 404.
  // Sur une page MODÈLE Sony, le niveau 3 pointerait vers cette landing 404
  // (URL intermédiaire non valide) → on n'émet aucun BreadcrumbList.
  // Détection par route centralisée (FR ou EN, pas de recherche de texte libre).
  // À RETIRER une fois la landing Sony rétablie.
  const isSony =
    inputPath === ROUTES.sonyRepair.fr || inputPath === ROUTES.sonyRepair.en
  if (isSony && model) return null

  // Chemin de marque dans la locale courante. L'appelant peut fournir un chemin
  // FR (landings, brand.public_base_path) OU déjà localisé EN (RepairModelPage
  // baseHref). On convertit via les routes centralisées uniquement si nécessaire.
  const inputIsEn = inputPath === '/en' || inputPath.startsWith('/en/')
  const brandPathLocalized = normalizePath(
    locale === 'en'
      ? (inputIsEn ? inputPath : getAlternatePath(inputPath, 'en'))
      : (inputIsEn ? getAlternatePath(inputPath, 'fr') : inputPath),
  )
  if (brandPathLocalized === '/' || brandPathLocalized === '/en') return null

  const homePath   = locale === 'en' ? ROUTES.home.en   : ROUTES.home.fr
  const repairPath = locale === 'en' ? ROUTES.repair.en : ROUTES.repair.fr
  if (!homePath || !repairPath) return null

  const t = locale === 'en'
    ? { home: 'Home',    repair: 'Repair',     brand: `${name} repair`,     model: (m: string) => `${m} repair` }
    : { home: 'Accueil', repair: 'Réparation', brand: `Réparation ${name}`, model: (m: string) => `Réparation ${m}` }

  const items: BreadcrumbItem[] = [
    { name: t.home,   url: abs(homePath) },
    { name: t.repair, url: abs(repairPath) },
    { name: t.brand,  url: abs(brandPathLocalized) },
  ]

  const modelName = model?.name?.trim()
  const modelSlug = model?.slug?.trim()
  if (modelName && modelSlug) {
    items.push({
      name: t.model(modelName),
      url:  abs(`${brandPathLocalized}/${modelSlug}`),
    })
  }

  const schema = breadcrumbSchema(items)
  if (!schema) return null

  return <JsonLd data={jsonLdDoc(schema)} />
}
