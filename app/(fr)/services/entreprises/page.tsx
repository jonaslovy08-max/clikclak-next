import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import B2BPage from '@/components/b2b/B2BPage'
import JsonLd from '@/components/seo/JsonLd'
import { jsonLdGraph, serviceSchema, faqSchema } from '@/lib/structured-data'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

const TITLE       = 'Services aux entreprises — Réparation & maintenance IT à Lausanne | ClikClak'
const DESCRIPTION =
  'ClikClak propose ses services de réparation de smartphones, tablettes et ordinateurs aux entreprises et PME de la région lausannoise. Prise en charge rapide, confidentialité assurée, disponible 7j/7.'
const PATH        = '/services/entreprises'
const CANONICAL   = `${SITE_URL}${PATH}`

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL,
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: CANONICAL,
    siteName: SITE_NAME,
    locale: 'fr_CH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

/* FAQ — reprend mot pour mot les 3 questions/réponses affichées par B2BPage */
const FAQ = [
  {
    question: "Quels types d'appareils prenez-vous en charge pour les entreprises ?",
    answer:   'Smartphones (toutes marques), tablettes, MacBook et PC Windows. Pour les équipements réseau ou serveurs, contactez-nous pour évaluer la faisabilité.',
  },
  {
    question: 'Proposez-vous des tarifs particuliers pour les entreprises ?',
    answer:   'Nous étudions chaque demande individuellement. Contactez-nous pour discuter de votre situation.',
  },
  {
    question: 'La confidentialité des données est-elle assurée ?',
    answer:   "Oui. Nous n'accédons aux données qu'en cas de nécessité stricte liée à l'intervention. Un effacement sécurisé peut être réalisé sur demande.",
  },
]

/* Service + FAQPage — provider référencé par @id (#localbusiness), pas d'objet imbriqué */
const jsonLd = jsonLdGraph(
  serviceSchema({
    name:        'Services ClikClak pour les entreprises',
    description: DESCRIPTION,
    url:         CANONICAL,
    serviceType: "Réparation et maintenance d'appareils électroniques pour entreprises",
    locale:      'fr',
  }),
  faqSchema(FAQ),
)

export default function EntreprisesPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Header locale="fr" />
      <B2BPage locale="fr" />
      <SiteFooter locale="fr" />
    </>
  )
}
