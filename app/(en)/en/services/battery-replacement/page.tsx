import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import { SITE_URL } from '@/lib/seo'

const DESCRIPTION =
  'Battery draining fast or phone shutting down? ClikClak replaces smartphone batteries in Lausanne based on your model and parts availability.'
const CANONICAL = `${SITE_URL}/en/services/battery-replacement`

export const metadata: Metadata = {
  title: 'Battery Replacement Lausanne | iPhone, Samsung & Android | ClikClak',
  description: DESCRIPTION,
  alternates: {
    canonical: CANONICAL,
    languages: {
      'fr-CH':     `${SITE_URL}/services/changement-batterie`,
      'en-CH':     CANONICAL,
      'x-default': `${SITE_URL}/services/changement-batterie`,
    },
  },
  openGraph: {
    title: 'Battery Replacement Lausanne — ClikClak',
    description: 'Battery replacement in Lausanne: iPhone, Samsung, OPPO, Huawei, Sony Xperia. Price varies by model.',
    url: CANONICAL,
    locale: 'en_CH',
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'How do I know if my battery is worn out?',
    a: 'Very low battery life, unexpected shutdowns, unstable charging, overheating or a swollen battery are common signs.',
  },
  {
    q: 'Is a swollen battery dangerous?',
    a: 'Yes. Avoid continuing to use the device and have it checked quickly.',
  },
  {
    q: 'Does the replacement erase my data?',
    a: 'Not in principle, but a backup is always recommended before any intervention.',
  },
  {
    q: 'Is the battery covered by a warranty?',
    a: 'Batteries are generally considered consumables. Warranty duration depends on the applicable conditions and the type of part used.',
  },
  {
    q: 'Should I also replace the charging port?',
    a: 'Not necessarily. If the issue is charging-related, a diagnostic helps distinguish between the battery, port or charger.',
  },
]

export default function EnBatteryReplacementPage() {
  return (
    <InterventionPageLayout
      locale="en"
      pill="Battery replacement"
      h1="Battery replacement smartphone in Lausanne"
      intro="A worn battery can cause low battery life, sudden shutdowns, slow charging or an overheating device. ClikClak checks your smartphone and provides the right price for your model."
      interventionItems={[
        'Charge state check',
        'Battery verification',
        'Charging port check if needed',
        'Battery replacement by model',
        'Charge test after intervention',
      ]}
      faqItems={FAQ}
      structuredData={{
        description: DESCRIPTION,
        url:         CANONICAL,
        serviceType: 'Battery replacement',
      }}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/replace-battery.webp',
        mobileSrc: '/assets/images/homepage/service-sections/replace-battery-mobile.webp',
        alt:       'Battery replacement at ClikClak Lausanne',
      }}
    />
  )
}
