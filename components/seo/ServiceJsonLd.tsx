/*
  ServiceJsonLd — Service (+ FAQPage optionnelle) pour les pages de prestation
  qui n'utilisent pas InterventionPageLayout (pages personnalisées).

  Server Component (pas de 'use client') : aucune requête réseau/Supabase,
  aucun état, aucun JavaScript client. Réutilise l'infrastructure existante
  (serviceSchema, faqSchema, jsonLdGraph, JsonLd).

  - provider implicite via { '@id': …/#localbusiness' } (aucun LocalBusiness imbriqué)
  - areaServed fourni par le builder, localisé
  - aucun offers / prix / AggregateRating / Product
  - faqItems doit être EXACTEMENT la liste affichée sur la page ;
    si elle est absente ou vide, faqSchema retourne null et le graph
    ne contient que le Service.
*/

import JsonLd from '@/components/seo/JsonLd'
import { jsonLdGraph, serviceSchema, faqSchema } from '@/lib/structured-data'

/** Même forme que FAQAccordion : { q, a } */
export interface ServiceFaqItem {
  q: string
  a: string
}

interface Props {
  name:        string
  description: string
  /** Doit être strictement égal au canonical de la page */
  url:         string
  serviceType: string
  locale:      'fr' | 'en'
  /** Questions/réponses réellement visibles sur la page */
  faqItems?:   readonly ServiceFaqItem[]
}

export default function ServiceJsonLd({
  name,
  description,
  url,
  serviceType,
  locale,
  faqItems,
}: Props) {
  const jsonLd = jsonLdGraph(
    serviceSchema({ name, description, url, serviceType, locale }),
    faqSchema((faqItems ?? []).map(item => ({ question: item.q, answer: item.a }))),
  )

  return <JsonLd data={jsonLd} />
}
