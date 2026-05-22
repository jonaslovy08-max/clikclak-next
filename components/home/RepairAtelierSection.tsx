import Link  from 'next/link'
import Image from 'next/image'

/*
  RepairAtelierSection — Section homepage "Réparer & revendre".
  2 cards : Réparation smartphone + Rachat d'appareils.
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

export default function RepairAtelierSection() {
  return (
    <section
      id="reparer-revendre"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Réparer et revendre — ClikClak Lausanne"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8 md:gap-10">

        {/* ── En-tête ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Réparer <span className="text-accent">&amp; revendre</span>
          </h2>
          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60 max-w-2xl">
            Faites réparer votre appareil chez ClikClak ou proposez-le à la reprise.
          </p>
        </div>

        {/* ── 2 cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">

          {/* Card 1 — Réparation smartphone Lausanne */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/reparation-smartphone-mobile.webp"
                alt="Réparation smartphone Lausanne chez ClikClak"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/reparation-smartphone.webp"
                alt="Réparation smartphone Lausanne chez ClikClak"
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                Réparation <span className="text-accent">smartphone</span> Lausanne
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                Écran cassé, batterie faible, connecteur instable ou diagnostic&nbsp;: trouvez rapidement votre modèle et consultez les options de réparation ClikClak.
              </p>
              <Link href="/reparation-smartphone-express" className={btnClass}>
                Voir plus…
              </Link>
            </div>
          </div>

          {/* Card 2 — Rachat de vos anciens appareils */}
          <div className="flex flex-col rounded-2xl overflow-hidden" style={cardStyle}>
            <div className="relative w-full shrink-0" style={imgWrapStyle}>
              <Image
                src="/assets/images/homepage/service-sections/smartphone-buyback-mobile.webp"
                alt="Rachat de smartphone et appareils chez ClikClak Lausanne"
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover md:hidden"
              />
              <Image
                src="/assets/images/homepage/service-sections/smartphone-buyback.webp"
                alt="Rachat de smartphone et appareils chez ClikClak Lausanne"
                fill
                sizes="50vw"
                className="object-cover hidden md:block"
              />
            </div>
            <div className="flex flex-col gap-4 p-6">
              <h3 className="text-xl font-light leading-tight">
                Rachat de vos <span className="text-accent">anciens appareils</span>
              </h3>
              <p className="text-sm font-light leading-relaxed text-foreground/60">
                Smartphone, tablette, ordinateur, montre ou écouteurs&nbsp;: proposez votre appareil et recevez une estimation selon son état réel.
              </p>
              <Link href="/services/rachat-de-votre-smartphone" className={btnClass}>
                Voir plus…
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
