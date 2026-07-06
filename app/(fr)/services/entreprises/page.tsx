import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import B2BPage from '@/components/b2b/B2BPage'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

const TITLE       = 'Services aux entreprises — Réparation & maintenance IT à Lausanne | ClikClak'
const DESCRIPTION =
  'ClikClak propose ses services de réparation de smartphones, tablettes et ordinateurs aux entreprises et PME de la région lausannoise. Prise en charge rapide, confidentialité assurée, disponible 7j/7.'
const PATH        = '/services/entreprises/'
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Service',
      '@id': CANONICAL,
      name: 'Services ClikClak pour les entreprises',
      description: DESCRIPTION,
      serviceType: "Réparation et maintenance d'appareils électroniques pour entreprises",
      areaServed: {
        '@type': 'City',
        name: 'Lausanne',
        containedInPlace: { '@type': 'Country', name: 'Suisse' },
      },
      provider: {
        '@type': 'LocalBusiness',
        name: 'Clik Clak Repair',
        url: SITE_URL,
        telephone: '+41213204477',
        email: 'info@clikclak.ch',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Rue du Petit-Chêne 9b',
          postalCode: '1003',
          addressLocality: 'Lausanne',
          addressCountry: 'CH',
        },
      },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        {
          '@type': 'Question',
          name: "Quels types d'appareils prenez-vous en charge pour les entreprises ?",
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Smartphones (toutes marques), tablettes, MacBook et PC Windows. Pour les équipements réseau ou serveurs, contactez-nous pour évaluer la faisabilité.',
          },
        },
        {
          '@type': 'Question',
          name: 'Proposez-vous des tarifs particuliers pour les entreprises ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Nous étudions chaque demande individuellement. Contactez-nous pour discuter de votre situation.',
          },
        },
        {
          '@type': 'Question',
          name: 'La confidentialité des données est-elle assurée ?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: "Oui. Nous n'accédons aux données qu'en cas de nécessité stricte liée à l'intervention. Un effacement sécurisé peut être réalisé sur demande.",
          },
        },
      ],
    },
  ],
}

export default function EntreprisesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header locale="fr" />
      <B2BPage locale="fr" />
      <SiteFooter locale="fr" />
    </>
  )
}
