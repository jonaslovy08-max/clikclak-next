import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import { SITE_URL } from '@/lib/seo'

const DESCRIPTION =
  'Phone not charging or cable not holding? ClikClak repairs charging ports in Lausanne by model: iPhone, Samsung, OPPO, Huawei and other devices.'
const CANONICAL = `${SITE_URL}/en/services/charging-port-repair`

export const metadata: Metadata = {
  title: 'Charging Port Repair Lausanne | iPhone, Samsung & Android | ClikClak',
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL,
    languages: {
      'fr-CH':     `${SITE_URL}/services/connecteur-de-charge`,
      'en-CH':     CANONICAL,
      'x-default': `${SITE_URL}/services/connecteur-de-charge`,
    },
  },
  openGraph: {
    title: 'Charging Port Repair Lausanne — ClikClak',
    description: 'Charging port repair in Lausanne: iPhone, Samsung, OPPO, Huawei. Price varies by model.',
    url: CANONICAL,
    locale: 'en_CH',
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'Why is my phone not charging?',
    a: 'The issue could come from the cable, adapter, charging port, battery or motherboard. A diagnostic identifies the cause.',
  },
  {
    q: 'Can the port be cleaned without replacing it?',
    a: 'Sometimes yes, if the issue is caused by dust or debris in the port. A diagnostic confirms this before any intervention.',
  },
  {
    q: 'Can the charging port always be replaced?',
    a: 'Depending on the model, it can be replaced separately or may be linked to other components. The price depends on the model.',
  },
  {
    q: 'Does wireless charging still work?',
    a: 'It depends on the model and the issue. The diagnostic checks both charging systems.',
  },
  {
    q: 'How long does the intervention take?',
    a: 'It depends on the model, the condition of the device and parts availability.',
  },
]

export default function EnChargingPortRepairPage() {
  return (
    <InterventionPageLayout
      locale="en"
      pill="Charging port repair"
      h1="Charging port repair smartphone in Lausanne"
      intro="A faulty charging port can prevent charging, cause unstable charging or make connection to a computer impossible. ClikClak checks the cause of the issue before any replacement."
      interventionItems={[
        'Cable and charging check',
        'Visual cleaning if needed',
        'Charging port verification',
        'Port replacement by model',
        'Charge and connection test',
      ]}
      faqItems={FAQ}
      structuredData={{
        description: DESCRIPTION,
        url:         CANONICAL,
        serviceType: 'Charging port repair',
      }}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/conn-charge.webp',
        mobileSrc: '/assets/images/homepage/service-sections/conn-charge-mobile.webp',
        alt:       'Charging port repair at ClikClak Lausanne',
      }}
    />
  )
}
