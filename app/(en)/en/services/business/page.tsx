import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import B2BPage from '@/components/b2b/B2BPage'
import JsonLd from '@/components/seo/JsonLd'
import { jsonLdGraph, serviceSchema, faqSchema } from '@/lib/structured-data'
import { SITE_URL, SITE_NAME } from '@/lib/seo'

const TITLE       = 'Business Device Repair & IT Services in Lausanne | ClikClak'
const DESCRIPTION =
  'ClikClak offers smartphone, tablet, and laptop repair services to businesses and SMEs in the Lausanne area. Fast turnaround, full confidentiality, available 7 days a week.'
const PATH        = '/en/services/business'
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

/* FAQ — reprend mot pour mot les 3 questions/réponses affichées par B2BPage */
const FAQ = [
  {
    question: 'Which devices do you repair for businesses?',
    answer:   'Smartphones (all brands), tablets, MacBooks, and Windows PCs. For network equipment or servers, contact us to assess feasibility.',
  },
  {
    question: 'Do you offer special rates for businesses?',
    answer:   'We assess each request individually. Contact us to discuss your situation.',
  },
  {
    question: 'Is data confidentiality guaranteed?',
    answer:   'Yes. We only access data when strictly necessary for the repair. A secure wipe can be performed on request.',
  },
]

/* Service + FAQPage — provider référencé par @id (#localbusiness), pas d'objet imbriqué */
const jsonLd = jsonLdGraph(
  serviceSchema({
    name:        'ClikClak Business Device Services',
    description: DESCRIPTION,
    url:         CANONICAL,
    serviceType: 'Business electronic device repair and maintenance',
    locale:      'en',
  }),
  faqSchema(FAQ),
)

export default function BusinessPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <Header locale="en" />
      <B2BPage locale="en" />
      <SiteFooter locale="en" />
    </>
  )
}
