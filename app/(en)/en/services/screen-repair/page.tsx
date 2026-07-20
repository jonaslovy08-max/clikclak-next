import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Screen Repair Lausanne | iPhone, Samsung & Android | ClikClak',
  description:
    'Cracked screen, faulty touch or black display? ClikClak repairs smartphone screens in Lausanne: iPhone, Samsung, OPPO, Huawei, Sony Xperia and other models.',
  alternates: {
    canonical: `${SITE_URL}/en/services/screen-repair`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/reparation-ecran`,
      'en-CH':     `${SITE_URL}/en/services/screen-repair`,
      'x-default': `${SITE_URL}/services/reparation-ecran`,
    },
  },
  openGraph: {
    title: 'Screen Repair Lausanne — ClikClak',
    description: 'Screen repair in Lausanne: iPhone, Samsung, OPPO, Huawei, Sony Xperia. Price varies by model.',
    url: `${SITE_URL}/en/services/screen-repair`,
    locale: 'en_CH',
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'When should the screen be replaced?',
    a: 'When the glass is cracked, the touchscreen does not respond correctly, or the display shows lines, black spots or persistent black screen.',
  },
  {
    q: 'Is a black screen always covered by warranty?',
    a: 'No. If the black screen appears after a shock, fall or external pressure, it is generally physical damage not covered by warranty.',
  },
  {
    q: 'Will my data be deleted?',
    a: 'Normally no, but a backup is recommended before any technical intervention.',
  },
  {
    q: 'How long does a screen repair take?',
    a: 'It depends on the model, parts availability and the condition of the device. Some repairs can be done quickly, others require more time.',
  },
  {
    q: 'Is water resistance guaranteed after repair?',
    a: 'No. After opening a device, the original water resistance cannot be guaranteed.',
  },
]

export default function EnScreenRepairPage() {
  return (
    <InterventionPageLayout
      locale="en"
      pill="Screen repair"
      h1="Screen repair smartphone in Lausanne"
      intro="A cracked screen, unresponsive touch or black display can make your smartphone difficult to use. ClikClak helps you identify your model and find the right price for screen replacement."
      interventionItems={[
        'Display check',
        'Touchscreen check',
        'Frame verification',
        'Screen / glass replacement by model',
        'Full test after repair',
      ]}
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/screen-change.webp',
        mobileSrc: '/assets/images/homepage/service-sections/screen-change-mobile.webp',
        alt:       'Screen repair at ClikClak Lausanne',
      }}
    />
  )
}
