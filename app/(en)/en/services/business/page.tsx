import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import B2BPage from '@/components/b2b/B2BPage'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

const TITLE       = 'Business Device Repair & IT Services in Lausanne | ClikClak'
const DESCRIPTION =
  'ClikClak offers smartphone, tablet, and laptop repair services to businesses and SMEs in the Lausanne area. Fast turnaround, full confidentiality, available 7 days a week.'
const PATH        = '/en/services/business/'
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
    locale: 'en_US',
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
      name: 'ClikClak Business Device Services',
      description: DESCRIPTION,
      serviceType: 'Business device repair and maintenance',
      areaServed: {
        '@type': 'City',
        name: 'Lausanne',
        containedInPlace: { '@type': 'Country', name: 'Switzerland' },
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
          name: 'Which devices do you repair for businesses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Smartphones (all brands), tablets, MacBooks, and Windows PCs. For network equipment or servers, contact us to assess feasibility.',
          },
        },
        {
          '@type': 'Question',
          name: 'Do you offer special rates for businesses?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'We assess each request individually. Contact us to discuss your situation.',
          },
        },
        {
          '@type': 'Question',
          name: 'Is data confidentiality guaranteed?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Yes. We only access data when strictly necessary for the repair. A secure wipe can be performed on request.',
          },
        },
      ],
    },
  ],
}

export default function BusinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header locale="en" />
      <B2BPage locale="en" />
      <SiteFooter locale="en" />
    </>
  )
}
