import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Smartphone, Tablet & Computer Diagnostic Lausanne | ClikClak',
  description:
    'ClikClak performs diagnostics on smartphones, tablets, iPads, computers and MacBooks in Lausanne to identify the cause of a fault before repair.',
  alternates: {
    canonical: `${SITE_URL}/en/services/diagnostics/`,
    languages: {
      'fr-CH':     `${SITE_URL}/services/diagnostic/`,
      'en-CH':     `${SITE_URL}/en/services/diagnostics/`,
      'x-default': `${SITE_URL}/services/diagnostic/`,
    },
  },
  openGraph: {
    title: 'Diagnostic Lausanne — ClikClak',
    url: `${SITE_URL}/en/services/diagnostics/`,
    locale: 'en_CH',
    type: 'website',
  },
}

const FAQ = [
  {
    q: 'When should I request a diagnostic?',
    a: 'When the cause of the fault is unclear, when the device no longer turns on or when multiple symptoms appear simultaneously.',
  },
  {
    q: 'Is the diagnostic always free?',
    a: 'No. Depending on the case, a diagnostic fee may apply, particularly if the quote is declined or if the device is beyond repair.',
  },
  {
    q: 'How long does a diagnostic take?',
    a: 'It depends on the fault, the model and the condition of the device.',
  },
  {
    q: 'Am I obliged to repair after the diagnostic?',
    a: 'No. You can accept or decline the repair after receiving the estimate.',
  },
  {
    q: 'What happens if the device is beyond repair?',
    a: 'We inform you of the result and the available options, including data recovery if relevant.',
  },
]

export default function EnDiagnosticsPage() {
  return (
    <InterventionPageLayout
      locale="en"
      pill="Diagnostic"
      h1="Diagnostic smartphone, tablet and computer in Lausanne"
      intro="Your device has a fault, unstable behaviour or a problem that is hard to identify? ClikClak analyses smartphones, tablets and computers to determine the cause of the issue before any intervention."
      interventionItems={[
        'Visual check',
        'Charge / battery test',
        'Screen / touchscreen test',
        'Connector test',
        'Camera, mic, speaker test if needed',
        'Oxidation check',
        'Estimate before repair',
      ]}
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/diagnostic.webp',
        mobileSrc: '/assets/images/homepage/service-sections/diagnostic-mobile.webp',
        alt:       'Smartphone diagnostic at ClikClak Lausanne',
      }}
    />
  )
}
