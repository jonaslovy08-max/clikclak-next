import Link  from 'next/link'
import Image from 'next/image'

const cardStyle: React.CSSProperties = {
  border:          '1px solid rgba(242,242,242,0.1)',
  backgroundColor: 'rgba(255,255,255,0.02)',
}

const imgWrapStyle: React.CSSProperties = {
  aspectRatio:  '16/10',
  borderBottom: '1px solid rgba(242,242,242,0.08)',
}

const btnClass =
  'self-start inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-11 px-6 text-base'

const STRINGS = {
  fr: {
    sectionLabel: 'Récupération de données et dégâts d\'eau — ClikClak Lausanne',
    h2a: 'Données',
    h2b: '& urgences',
    sub: 'Récupération de données ou dégâts d\'eau : agissez vite, ClikClak intervient avec méthode.',
    card1: {
      altMobile: 'Récupération de données chez ClikClak Lausanne',
      altDesktop: 'Récupération de données chez ClikClak Lausanne',
      h3a: 'Récupération',
      h3b: 'de données',
      p: 'Photos, contacts, messages ou fichiers importants : ClikClak analyse votre appareil ou support avec une approche méthodique et sécurisée.',
      cta: 'Voir plus…',
      href: '/services/recuperation-donnees',
    },
    card2: {
      altMobile: 'Réparation dégâts d\'eau chez ClikClak Lausanne',
      altDesktop: 'Réparation dégâts d\'eau chez ClikClak Lausanne',
      h3a: 'Dégâts',
      h3b: 'd\'eau',
      p: 'Après une chute dans l\'eau ou une oxydation, une analyse rapide permet d\'évaluer les possibilités avant que les dommages ne s\'aggravent.',
      cta: 'Voir plus…',
      href: '/reparation-degat-eau-lausanne',
    },
  },
  en: {
    sectionLabel: 'Data recovery and water damage — ClikClak Lausanne',
    h2a: 'Data',
    h2b: '& emergencies',
    sub: 'Data recovery or water damage: act fast, ClikClak intervenes with method.',
    card1: {
      altMobile: 'Data recovery at ClikClak Lausanne',
      altDesktop: 'Data recovery at ClikClak Lausanne',
      h3a: 'Data',
      h3b: 'recovery',
      p: 'Photos, contacts, messages or important files: ClikClak analyses your device or media with a methodical and secure approach.',
      cta: 'Learn more…',
      href: '/en/services/data-recovery',
    },
    card2: {
      altMobile: 'Water damage repair at ClikClak Lausanne',
      altDesktop: 'Water damage repair at ClikClak Lausanne',
      h3a: 'Water',
      h3b: 'damage',
      p: 'After a drop in water or oxidation, a quick analysis evaluates the options before the damage worsens.',
      cta: 'Learn more…',
      href: '/en/water-damage-repair-lausanne',
    },
  },
} as const

export default function DataUrgencesSection({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T = STRINGS[locale]
  return (
    <section
      id="donnees-urgences"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label={T.sectionLabel}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-10">

        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            {T.h2a} <span className="text-accent">{T.h2b}</span>
          </h2>
          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60 max-w-2xl">
            {T.sub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {/* Card 1 */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/data-recovery-mobile.webp"
                alt={T.card1.altMobile}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/data-recovery.webp"
                alt={T.card1.altDesktop}
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                {T.card1.h3a} <span className="text-accent">{T.card1.h3b}</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                {T.card1.p}
              </p>
              <Link href={T.card1.href} className={btnClass}>
                {T.card1.cta}
              </Link>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/water-damage-mobile.webp"
                alt={T.card2.altMobile}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/water-damage.webp"
                alt={T.card2.altDesktop}
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                {T.card2.h3a} <span className="text-accent">{T.card2.h3b}</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                {T.card2.p}
              </p>
              <Link href={T.card2.href} className={btnClass}>
                {T.card2.cta}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
