import Link  from 'next/link'
import Image from 'next/image'

/*
  DataUrgencesSection — Section homepage "Données & urgences".
  2 cards : Récupération de données + Dégâts d'eau.
  Style identique à MobileServicesSection.
*/

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

export default function DataUrgencesSection() {
  return (
    <section
      id="donnees-urgences"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Récupération de données et dégâts d'eau — ClikClak Lausanne"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-10">

        {/* ── En-tête ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Données <span className="text-accent">&amp; urgences</span>
          </h2>
          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60 max-w-2xl">
            Récupération de données ou dégâts d&apos;eau&nbsp;: agissez vite, ClikClak intervient avec méthode.
          </p>
        </div>

        {/* ── 2 cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {/* Card 1 — Récupération de données */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/data-recovery-mobile.webp"
                alt="Récupération de données chez ClikClak Lausanne"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/data-recovery.webp"
                alt="Récupération de données chez ClikClak Lausanne"
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                Récupération <span className="text-accent">de données</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                Photos, contacts, messages ou fichiers importants&nbsp;: ClikClak analyse votre appareil ou support avec une approche méthodique et sécurisée.
              </p>
              <Link href="/services/recuperation-donnees" className={btnClass}>
                Voir plus…
              </Link>
            </div>
          </div>

          {/* Card 2 — Dégâts d'eau */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/water-damage-mobile.webp"
                alt="Réparation dégâts d'eau chez ClikClak Lausanne"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/water-damage.webp"
                alt="Réparation dégâts d'eau chez ClikClak Lausanne"
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                Dégâts <span className="text-accent">d&apos;eau</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                Après une chute dans l&apos;eau ou une oxydation, une analyse rapide permet d&apos;évaluer les possibilités avant que les dommages ne s&apos;aggravent.
              </p>
              <Link href="/reparation-degat-eau-lausanne" className={btnClass}>
                Voir plus…
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
