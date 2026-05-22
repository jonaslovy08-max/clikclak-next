import Link  from 'next/link'
import Image from 'next/image'

/*
  MobileServicesSection — Regroupe Dépannage 7/7 et Service de coursier
  en deux cards côte-à-côte (desktop) ou empilées (mobile).
*/

const cardStyle: React.CSSProperties = {
  border:          '1px solid rgba(242,242,242,0.1)',
  backgroundColor: 'rgba(255,255,255,0.02)',
}


const btnClass =
  'self-start inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-11 px-6 text-base'

export default function MobileServicesSection() {
  return (
    <section
      id="services-mobiles"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Services mobiles Clik Clak"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-10">

        {/* ── En-tête ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Services <span className="text-accent">mobiles</span>
          </h2>
          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60 max-w-2xl">
            ClikClak vous accompagne aussi lorsque vous ne pouvez pas vous déplacer ou que vous avez besoin d&apos;une assistance à distance ou sur site.
          </p>
        </div>

        {/* ── 2 cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {/* Card 1 — Dépannage 7/7 */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div
              className="relative w-full shrink-0"
              style={{ aspectRatio: '16/10', borderBottom: '1px solid rgba(242,242,242,0.08)' }}
            >
              <Image
                src="/assets/images/homepage/service-sections/depannage-7-7-mobile.webp"
                alt="Dépannage 7/7 ClikClak pour smartphone, tablette et ordinateur"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/depannage-7-7.webp"
                alt="Dépannage 7/7 ClikClak pour smartphone, tablette et ordinateur"
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                Dépannage <span className="text-accent">7/7</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                Un appareil bloqué, impossible à configurer ou une urgence technique&nbsp;?
                ClikClak vous aide selon disponibilité, à Lausanne et en Suisse romande.
              </p>
              <Link href="/services/depannage-reparation-domicile" className={btnClass}>
                Voir plus…
              </Link>
            </div>
          </div>

          {/* Card 2 — Service de coursier */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div
              className="relative w-full shrink-0"
              style={{ aspectRatio: '16/10', borderBottom: '1px solid rgba(242,242,242,0.08)' }}
            >
              <Image
                src="/assets/images/homepage/service-sections/coursier-mobile.webp"
                alt="Service de coursier ClikClak Lausanne"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/coursier.webp"
                alt="Service de coursier ClikClak Lausanne"
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                Service de <span className="text-accent">coursier</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                Vous ne pouvez pas vous déplacer&nbsp;? Nous organisons la collecte de votre
                appareil, son passage en atelier et son retour après réparation, selon disponibilité.
              </p>
              <Link href="/service-de-coursier" className={btnClass}>
                Voir plus…
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
