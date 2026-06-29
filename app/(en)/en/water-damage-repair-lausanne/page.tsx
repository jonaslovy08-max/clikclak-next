import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Water Damage Smartphone Repair Lausanne | Oxidation & Diagnostic | ClikClak',
  description:
    'Dropped your phone in water or exposed to humidity? ClikClak performs oxidation diagnostics in Lausanne and intervenes based on the device condition.',
  alternates: {
    canonical: `${SITE_URL}/en/water-damage-repair-lausanne/`,
    languages: {
      'fr-CH':     `${SITE_URL}/reparation-degat-eau-lausanne/`,
      'en-CH':     `${SITE_URL}/en/water-damage-repair-lausanne/`,
      'x-default': `${SITE_URL}/reparation-degat-eau-lausanne/`,
    },
  },
  openGraph: {
    title: 'Water Damage Smartphone Repair Lausanne — ClikClak',
    description: 'Oxidation diagnostic and intervention based on the device condition. iPhone, Samsung and other smartphones.',
    url: `${SITE_URL}/en/water-damage-repair-lausanne/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'What should I do if my phone fell in water?',
    a: 'Turn it off if possible, do not charge it and avoid turning it back on. Contact us quickly.',
  },
  {
    q: 'Is rice a good solution?',
    a: 'No. Rice does not remove internal oxidation and can delay proper intervention. It is better to bring the device in promptly.',
  },
  {
    q: 'Can the repair be guaranteed after water damage?',
    a: 'No. An oxidised device may fail again even after a successful intervention. The goal may be to restore function or recover data, with no lifespan guarantee.',
  },
  {
    q: 'Can data be recovered?',
    a: 'In some cases, yes. It depends on the condition of the motherboard, storage and level of oxidation.',
  },
  {
    q: 'How quickly should you act after liquid contact?',
    a: 'As soon as possible. Oxidation can continue to progress after apparent drying, even if the device seems to be working.',
  },
]

export default function EnWaterDamageRepairPage() {
  return (
    <InterventionPageLayout
      locale="en"
      pill="Water damage"
      h1="Water damage smartphone repair in Lausanne"
      intro="A smartphone exposed to water, humidity or liquid may suffer invisible damage. Even if it still works, oxidation can progress and cause a more serious failure."
      interventionItems={[
        'Oxidation diagnostic',
        'Internal inspection',
        'Cleaning or de-oxidation as needed',
        'Motherboard and connector check',
        'Data recovery if possible',
      ]}
      note="The goal may be to restore function or recover data, but no lifespan can be guaranteed after liquid contact."
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/water-damage.webp',
        mobileSrc: '/assets/images/homepage/service-sections/water-damage-mobile.webp',
        alt:       'Water damage repair at ClikClak Lausanne',
      }}
    />
  )
}
