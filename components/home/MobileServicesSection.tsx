import Link  from 'next/link'
import Image from 'next/image'

const cardStyle: React.CSSProperties = {
  border:          '1px solid rgba(242,242,242,0.1)',
  backgroundColor: 'rgba(255,255,255,0.02)',
}

const btnClass =
  'self-start inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-11 px-6 text-base'

const STRINGS = {
  fr: {
    sectionLabel: 'Services mobiles Clik Clak',
    h2a: 'Services',
    h2b: 'mobiles',
    sub: 'ClikClak vous accompagne aussi lorsque vous ne pouvez pas vous déplacer ou que vous avez besoin d\'une assistance à distance ou sur site.',
    card1: {
      altMobile: 'Dépannage 7/7 ClikClak pour smartphone, tablette et ordinateur',
      altDesktop: 'Dépannage 7/7 ClikClak pour smartphone, tablette et ordinateur',
      h3a: 'Dépannage',
      h3b: '7/7',
      p: 'Un appareil bloqué, impossible à configurer ou une urgence technique ? ClikClak vous aide selon disponibilité, à Lausanne et en Suisse romande.',
      cta: 'Voir plus…',
      href: '/services/depannage-reparation-domicile',
    },
    card2: {
      altMobile: 'Service de coursier ClikClak Lausanne',
      altDesktop: 'Service de coursier ClikClak Lausanne',
      h3a: 'Service de',
      h3b: 'coursier',
      p: 'Vous ne pouvez pas vous déplacer ? Nous organisons la collecte de votre appareil, son passage en atelier et son retour après réparation, selon disponibilité.',
      cta: 'Voir plus…',
      href: '/service-de-coursier',
    },
  },
  en: {
    sectionLabel: 'Mobile services — Clik Clak',
    h2a: 'Mobile',
    h2b: 'services',
    sub: 'ClikClak also assists when you can\'t come to us or need remote or on-site support.',
    card1: {
      altMobile: 'ClikClak 7/7 support for smartphones, tablets and computers',
      altDesktop: 'ClikClak 7/7 support for smartphones, tablets and computers',
      h3a: '7/7',
      h3b: 'support',
      p: 'Device locked, impossible to configure or a technical emergency? ClikClak helps based on availability, in Lausanne and French-speaking Switzerland.',
      cta: 'Learn more…',
      href: '/en/services/home-repair-service',
    },
    card2: {
      altMobile: 'ClikClak courier service Lausanne',
      altDesktop: 'ClikClak courier service Lausanne',
      h3a: 'Courier',
      h3b: 'service',
      p: 'Can\'t come to us? We arrange pickup of your device, workshop service and return after repair, subject to availability.',
      cta: 'Learn more…',
      href: '/en/courier-service',
    },
  },
} as const

export default function MobileServicesSection({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T = STRINGS[locale]
  return (
    <section
      id="services-mobiles"
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
            <div
              className="relative w-full shrink-0"
              style={{ aspectRatio: '16/10', borderBottom: '1px solid rgba(242,242,242,0.08)' }}
            >
              <Image
                src="/assets/images/homepage/service-sections/depannage-7-7-mobile.webp"
                alt={T.card1.altMobile}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/depannage-7-7.webp"
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
            <div
              className="relative w-full shrink-0"
              style={{ aspectRatio: '16/10', borderBottom: '1px solid rgba(242,242,242,0.08)' }}
            >
              <Image
                src="/assets/images/homepage/service-sections/coursier-mobile.webp"
                alt={T.card2.altMobile}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/coursier.webp"
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
