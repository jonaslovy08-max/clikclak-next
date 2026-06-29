import { Button } from '@/components/ui/Button'

const STRINGS = {
  fr: {
    h2:    'Autres services',
    sub:   'Accédez rapidement aux services complémentaires ClikClak.',
    links: [
      { label: 'Réparer & revendre', href: '#reparer-revendre'                   },
      { label: 'Données & urgences', href: '#donnees-urgences'                   },
      { label: 'Services mobiles',   href: '#services-mobiles'                   },
      { label: 'Shop',               href: '/shop-reparation-smartphone-lausanne' },
    ],
  },
  en: {
    h2:    'Other services',
    sub:   'Quick access to ClikClak complementary services.',
    links: [
      { label: 'Repair & sell',       href: '#reparer-revendre'                   },
      { label: 'Data & emergencies',  href: '#donnees-urgences'                   },
      { label: 'Mobile services',     href: '#services-mobiles'                   },
      { label: 'Shop',                href: '/shop-reparation-smartphone-lausanne' },
    ],
  },
} as const

export default function OtherServicesSection({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T = STRINGS[locale]
  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label={locale === 'en' ? 'Other ClikClak services' : 'Autres services ClikClak'}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-5 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            {T.h2}
          </h2>
          <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
            {T.sub}
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4">
          {T.links.map(({ label, href }) => (
            <Button key={href} href={href} size="lg">
              {label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
