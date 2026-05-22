import { Button } from '@/components/ui/Button'

const LINKS = [
  { label: 'Réparer & revendre',   href: '#reparer-revendre'      },
  { label: 'Données & urgences',   href: '#donnees-urgences'      },
  { label: 'Services mobiles',     href: '#services-mobiles'      },
  { label: 'Shop',                 href: '/shop-reparation-smartphone-lausanne' },
] as const

export default function OtherServicesSection() {
  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Autres services ClikClak"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-5 text-center">
        <div className="flex flex-col gap-2">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Autres services
          </h2>
          <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
            Accédez rapidement aux services complémentaires ClikClak.
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4">
          {LINKS.map(({ label, href }) => (
            <Button key={href} href={href} size="lg">
              {label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  )
}
