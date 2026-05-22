import Link         from 'next/link'
import BulletToggle from '@/components/ui/BulletToggle'

/*
  CourrierSection — Section homepage "Service de coursier".
  Placée après DepannageSection, avant HorizontalScrollingGallery.
  Langage visuel identique aux sections WaterDamageSection / RebuySection.
*/

const bullets = [
  'Lausanne et environs proches',
  'Collecte et retour à votre adresse',
  'Smartphone, tablette, ordinateur',
  'CHF 40 l\'aller-retour, hors réparation',
]

export default function CourrierSection() {
  return (
    <section
      id="service-coursier"
      className="px-6 md:px-14 lg:px-20 py-40 md:py-48 lg:py-56 border-t border-white/10"
      aria-label="Service de coursier pour réparation"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-5">

        {/* ── Titre ── */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          Service de{' '}
          <span className="text-accent">coursier</span>
        </h2>

        {/* ── Contenu : bloc gauche / texte droite ── */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">

          {/* TODO: Ajouter l'image finale de la section Service de coursier */}
          <div
            className="w-full md:w-[44%] shrink-0 rounded-xl"
            style={{
              aspectRatio: '4/3',
              border: '1px solid rgba(242,242,242,0.08)',
              background: 'rgba(255,255,255,0.01)',
            }}
          />

          {/* Colonne droite : texte + bullets + CTA */}
          <div className="flex-1 flex flex-col gap-4">

            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Vous ne pouvez pas vous déplacer ?</span>
            </p>

            <div className="flex flex-col gap-3 text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              <p>
                Nous organisons la collecte de votre appareil, son passage en atelier et son retour après réparation, selon disponibilité.
              </p>
            </div>

            <BulletToggle
              bullets={bullets}
              labelClosed="Fonctionnement du service"
              labelOpen="Masquer le fonctionnement"
            />

            <div className="flex flex-col gap-3 mt-2">
              <Link
                href="/service-de-coursier"
                className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-14 px-8 text-lg min-w-[180px]"
              >
                <span className="inline-flex items-center gap-2">Voir le service</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  )
}
