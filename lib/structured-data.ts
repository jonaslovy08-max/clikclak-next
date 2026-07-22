/*
  lib/structured-data.ts — Builders JSON-LD (schema.org) purs et typés.

  - Objets purs, aucun effet de bord, aucune lecture Supabase, aucune dépendance.
  - Aucune donnée inventée : toutes les valeurs proviennent de sources existantes
    du projet (lib/seo.ts, footer, carte de contact).
  - Liens, logo et image OG absolus. sameAs = Instagram + Facebook.
  - Nom canonique unique : « Clik Clak Repair ».
  - Les nœuds sont retournés SANS '@context' pour être composables dans un @graph.
    Utiliser jsonLdDoc() / jsonLdGraph() pour produire un document complet.
  - @id stables → référencement croisé sans duplication :
      provider des services      → { '@id': LOCALBUSINESS_ID }
      publisher des articles     → { '@id': ORG_ID }
*/

import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from '@/lib/seo'

/* ── Types JSON-LD génériques (sans any) ─────────────────────────── */

export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue }

export type JsonLdObject = { [key: string]: JsonLdValue }

/* ── Types d'entrée des builders ─────────────────────────────────── */

export interface BreadcrumbItem {
  name: string
  url: string
}

export interface ServiceSchemaInput {
  name: string
  description: string
  url: string
  serviceType?: string
  /** Remplace l'areaServed par défaut (Lausanne / Suisse) si fourni */
  areaServed?: JsonLdObject
  /** offers optionnel — non utilisé par défaut */
  offers?: JsonLdObject | JsonLdObject[]
  locale?: 'fr' | 'en'
}

export interface FaqItem {
  question: string
  answer: string
}

export interface ArticleSchemaInput {
  headline: string
  description: string
  url: string
  /** URL absolue de l'image (le composant appelant fournit l'URL complète) */
  image?: string
  datePublished: string
  dateModified?: string
  /** Nom d'auteur libre ; par défaut, l'organisation (via @id) */
  authorName?: string
}

/* ── @id stables ─────────────────────────────────────────────────── */

export const ORG_ID           = `${SITE_URL}/#organization`
export const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`
export const WEBSITE_ID       = `${SITE_URL}/#website`

/* ── Constantes d'entreprise (sources existantes, non inventées) ─── */

const CANONICAL_NAME = SITE_NAME // « Clik Clak Repair »
const LOGO_URL       = `${SITE_URL}/assets/logo/clikclak-logo.svg`
const OG_IMAGE_URL   = `${SITE_URL}${DEFAULT_OG_IMAGE}`
const TELEPHONE      = '+41213204477'
const EMAIL          = 'info@clikclak.ch'

const SAME_AS: string[] = [
  'https://www.instagram.com/clikclak_repair/',
  'https://www.facebook.com/clikclakrepair/',
]

const POSTAL_ADDRESS: JsonLdObject = {
  '@type':          'PostalAddress',
  streetAddress:    'Rue du Petit-Chêne 9b',
  postalCode:       '1003',
  addressLocality:  'Lausanne',
  addressCountry:   'CH',
}

const GEO: JsonLdObject = {
  '@type':    'GeoCoordinates',
  latitude:   46.51860333,
  longitude:  6.63104974,
}

// Horaires déclarés : lundi à vendredi uniquement, 10:00–18:30.
const OPENING_HOURS: JsonLdObject = {
  '@type':    'OpeningHoursSpecification',
  dayOfWeek:  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  opens:      '10:00',
  closes:     '18:30',
}

function areaServed(locale: 'fr' | 'en' = 'fr'): JsonLdObject {
  return {
    '@type':          'City',
    name:             'Lausanne',
    containedInPlace: {
      '@type': 'Country',
      name:    locale === 'en' ? 'Switzerland' : 'Suisse',
    },
  }
}

/* ── Builders ────────────────────────────────────────────────────── */

export function organizationSchema(): JsonLdObject {
  return {
    '@type':     'Organization',
    '@id':       ORG_ID,
    name:        CANONICAL_NAME,
    url:         SITE_URL,
    logo:        { '@type': 'ImageObject', url: LOGO_URL },
    image:       OG_IMAGE_URL,
    email:       EMAIL,
    telephone:   TELEPHONE,
    sameAs:      SAME_AS,
  }
}

export function localBusinessSchema(locale: 'fr' | 'en' = 'fr'): JsonLdObject {
  return {
    '@type':                    'LocalBusiness',
    '@id':                      LOCALBUSINESS_ID,
    name:                       CANONICAL_NAME,
    url:                        SITE_URL,
    image:                      OG_IMAGE_URL,
    logo:                       LOGO_URL,
    telephone:                  TELEPHONE,
    email:                      EMAIL,
    address:                    POSTAL_ADDRESS,
    geo:                        GEO,
    openingHoursSpecification:  [OPENING_HOURS],
    areaServed:                 areaServed(locale),
    sameAs:                     SAME_AS,
    parentOrganization:         { '@id': ORG_ID },
  }
}

export function webSiteSchema(locale: 'fr' | 'en' = 'fr'): JsonLdObject {
  // Pas de potentialAction/SearchAction : aucune route de recherche interne
  // avec paramètre de requête n'existe (la recherche navigue directement vers
  // la page modèle). On n'invente pas de SearchAction.
  return {
    '@type':      'WebSite',
    '@id':        WEBSITE_ID,
    name:         CANONICAL_NAME,
    url:          SITE_URL,
    inLanguage:   locale === 'en' ? 'en-CH' : 'fr-CH',
    publisher:    { '@id': ORG_ID },
  }
}

export function breadcrumbSchema(items: BreadcrumbItem[]): JsonLdObject | null {
  if (!items || items.length === 0) return null
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type':   'ListItem',
      position:  i + 1,
      name:      it.name,
      item:      it.url,
    })),
  }
}

export function serviceSchema(input: ServiceSchemaInput): JsonLdObject {
  const node: JsonLdObject = {
    '@type':      'Service',
    name:         input.name,
    description:  input.description,
    url:          input.url,
    areaServed:   input.areaServed ?? areaServed(input.locale ?? 'fr'),
    provider:     { '@id': LOCALBUSINESS_ID },
  }
  if (input.serviceType) node.serviceType = input.serviceType
  if (input.offers)      node.offers      = input.offers
  return node
}

export function faqSchema(qas: FaqItem[]): JsonLdObject | null {
  // Approche la plus sûre : ne rien émettre si la liste est vide
  // (un FAQPage sans mainEntity est invalide).
  if (!qas || qas.length === 0) return null
  return {
    '@type': 'FAQPage',
    mainEntity: qas.map(q => ({
      '@type':          'Question',
      name:             q.question,
      acceptedAnswer:   { '@type': 'Answer', text: q.answer },
    })),
  }
}

export function articleSchema(input: ArticleSchemaInput): JsonLdObject {
  const node: JsonLdObject = {
    '@type':            'BlogPosting',
    headline:           input.headline,
    description:        input.description,
    url:                input.url,
    datePublished:      input.datePublished,
    dateModified:       input.dateModified ?? input.datePublished,
    author:             input.authorName
      ? { '@type': 'Organization', name: input.authorName }
      : { '@id': ORG_ID },
    publisher:          { '@id': ORG_ID },
    mainEntityOfPage:   { '@type': 'WebPage', '@id': input.url },
  }
  if (input.image) node.image = input.image
  return node
}

/* ── Enveloppes de document ──────────────────────────────────────── */

/** Enveloppe un nœud unique en document JSON-LD complet (@context + nœud). */
export function jsonLdDoc(node: JsonLdObject): JsonLdObject {
  return { '@context': 'https://schema.org', ...node }
}

/** Combine plusieurs nœuds (les null/undefined sont ignorés) dans un @graph. */
export function jsonLdGraph(
  ...nodes: Array<JsonLdObject | null | undefined>
): JsonLdObject {
  return {
    '@context': 'https://schema.org',
    '@graph':   nodes.filter((n): n is JsonLdObject => n != null),
  }
}
