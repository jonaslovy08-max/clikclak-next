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
    sectionLabel: 'Réparer et revendre — ClikClak Lausanne',
    h2a: 'Réparer',
    h2b: '& revendre',
    sub: 'Faites réparer votre appareil chez ClikClak ou proposez-le à la reprise.',
    card1: {
      altMobile: 'Réparation smartphone Lausanne chez ClikClak',
      altDesktop: 'Réparation smartphone Lausanne chez ClikClak',
      h3a: 'Réparation',
      h3b: 'smartphone',
      h3c: ' Lausanne',
      p: 'Écran cassé, batterie faible, connecteur instable ou diagnostic : trouvez rapidement votre modèle et consultez les options de réparation ClikClak.',
      cta: 'Voir plus…',
      href: '/reparation-smartphone-express',
    },
    card2: {
      altMobile: 'Rachat de smartphone et appareils chez ClikClak Lausanne',
      altDesktop: 'Rachat de smartphone et appareils chez ClikClak Lausanne',
      h3a: 'Rachat de vos',
      h3b: 'anciens appareils',
      p: 'Smartphone, tablette, ordinateur, montre ou écouteurs : proposez votre appareil et recevez une estimation selon son état réel.',
      cta: 'Voir plus…',
      href: '/services/rachat-de-votre-smartphone',
    },
  },
  en: {
    sectionLabel: 'Repair & sell — ClikClak Lausanne',
    h2a: 'Repair',
    h2b: '& sell',
    sub: 'Have your device repaired at ClikClak or trade it in.',
    card1: {
      altMobile: 'Smartphone repair in Lausanne at ClikClak',
      altDesktop: 'Smartphone repair in Lausanne at ClikClak',
      h3a: 'Smartphone',
      h3b: 'repair',
      h3c: ' Lausanne',
      p: 'Cracked screen, weak battery, unstable connector or diagnostic: find your model quickly and check ClikClak repair options.',
      cta: 'Learn more…',
      href: '/en/services/smartphone-repair',
    },
    card2: {
      altMobile: 'Device buyback at ClikClak Lausanne',
      altDesktop: 'Device buyback at ClikClak Lausanne',
      h3a: 'Sell your',
      h3b: 'old devices',
      p: 'Smartphone, tablet, computer, smartwatch or earphones: submit your device and receive an estimate based on its real condition.',
      cta: 'Learn more…',
      href: '/en/services/sell-your-device',
    },
  },
} as const

export default function RepairAtelierSection({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T = STRINGS[locale]
  return (
    <section
      id="reparer-revendre"
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

          {/* Card 1 — Réparation smartphone */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/reparation-smartphone-mobile.webp"
                alt={T.card1.altMobile}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/reparation-smartphone.webp"
                alt={T.card1.altDesktop}
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                {T.card1.h3a} <span className="text-accent">{T.card1.h3b}</span>{T.card1.h3c}
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                {T.card1.p}
              </p>
              <Link href={T.card1.href} className={btnClass}>
                {T.card1.cta}
              </Link>
            </div>
          </div>

          {/* Card 2 — Rachat */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/smartphone-buyback-mobile.webp"
                alt={T.card2.altMobile}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/smartphone-buyback.webp"
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
