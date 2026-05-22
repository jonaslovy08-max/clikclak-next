import Link         from 'next/link'
import BulletToggle from '@/components/ui/BulletToggle'

/*
  DepannageSection — Section homepage "Dépannage à domicile".
  Placée après RebuySection, avant CourrierSection.
  Langage visuel identique aux sections WaterDamageSection / RebuySection.
*/

const bullets = [
  'Diagnostic sur place',
  'Aide à la configuration',
  'Transfert et sauvegarde de données',
  'Smartphone, tablette, ordinateur',
]

export default function DepannageSection() {
  return (
    <section
      id="depannage-7-7"
      className="px-6 md:px-14 lg:px-20 py-40 md:py-48 lg:py-56 border-t border-white/10"
      aria-label="Dépannage 7/7"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-5">

        {/* ── Titre ── */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          Dépannage{' '}
          <span className="text-accent">7/7</span>
        </h2>

        {/* ── Contenu : texte gauche / bloc droit ── */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start md:items-center">

          {/* Colonne gauche : texte + bullets + CTA */}
          <div className="flex-1 flex flex-col gap-4">

            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Besoin d&apos;aide pour votre appareil ?</span>
            </p>

            <div className="flex flex-col gap-3 text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              <p>
                Smartphone, tablette ou ordinateur&nbsp;: Clik Clak vous accompagne pour le diagnostic, la configuration, le transfert de données ou les pannes urgentes, selon disponibilité.
              </p>
            </div>

            <BulletToggle
              bullets={bullets}
              labelClosed="Prestations incluses"
              labelOpen="Masquer les prestations"
            />

            <div className="flex flex-col gap-3 mt-2">
              <Link
                href="/services/depannage-reparation-domicile"
                className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-14 px-8 text-lg min-w-[180px]"
              >
                <span className="inline-flex items-center gap-2">Voir le service</span>
              </Link>
            </div>

          </div>

          {/* TODO: Ajouter l'image finale de la section Dépannage 7/7 */}
          <div
            className="w-full md:w-[44%] shrink-0 rounded-xl"
            style={{
              aspectRatio: '4/3',
              border: '1px solid rgba(242,242,242,0.08)',
              background: 'rgba(255,255,255,0.01)',
            }}
          />

        </div>

      </div>
    </section>
  )
}
