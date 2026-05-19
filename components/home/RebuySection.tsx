import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import ContactPopover from '@/components/home/ContactPopover'

/*
  RebuySection — Section 3 : Rachat de vos anciens smartphones.

  Structure calquée sur sections 1 & 2 :
    - même container max-w-6xl / paddings / gap-10
    - titre text-[1.75rem] md:text-[2.25rem] font-light
    - séparateur identique

  Layout desktop : texte + CTAs à gauche | image à droite
  Pas de data-pin-section — scroll naturel.
*/

const bullets = [
  'Estimation rapide en boutique',
  'Reprise selon l\'état de l\'appareil',
  'Une solution locale et plus durable',
]

export default function RebuySection() {
  return (
    <section
      id="rachat-appareils"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Rachat de vos anciens appareils"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-5">

        {/* ── Titre — mêmes réglages que sections 1 & 2 ── */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          <span className="text-accent">Rachat</span>{' '}de vos anciens appareils
        </h2>

        {/* ── Séparateur — identique sections 1 & 2 ── */}


        {/* ── Contenu : texte gauche / image droite ── */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center">

          {/* Colonne gauche : texte + CTAs */}
          <div className="flex-1 flex flex-col gap-4 md:pt-2">

            {/* Label */}
            <span className="text-[11px] text-foreground/35 uppercase tracking-[0.22em]">
              Achat d&apos;occasion
            </span>

            {/* Sous-titre */}
            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Vous avez un ancien smartphone&nbsp;?</span>
            </p>

            {/* Corps de texte */}
            <p className="text-sm md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              Faites-le estimer simplement, même s&apos;il est abîmé. Reprise claire, rapide et sans engagement.
            </p>

            {/* Points clés */}
            <ul className="flex flex-col gap-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm font-light text-foreground/70">
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mt-2">
              {/* Même style que "Réparer !" du hero */}
              <Button href="/services/rachat-de-votre-smartphone" size="lg">
                Estimer mon smartphone
              </Button>
              {/* Même composant ContactPopover que le hero */}
              <ContactPopover />
            </div>
          </div>

          {/* Colonne droite : image */}
          <div className="w-full md:w-[48%] shrink-0 rounded-xl overflow-hidden">
            <Image
              src="/assets/images/homepage/service-sections/smartphone-buyback.webp"
              alt="Smartphone repris contre paiement chez Clik Clak Repair"
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 48vw"
              className="w-full h-auto"
            />
          </div>
        </div>

      </div>
    </section>
  )
}
