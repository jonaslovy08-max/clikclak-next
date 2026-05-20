import Link from 'next/link'

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

          {/* Colonne gauche : card visuelle */}
          <div
            className="w-full md:w-[44%] shrink-0 flex flex-col gap-4 p-5 rounded-2xl"
            style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-light" style={{ color: '#ccff33' }}>Collecte + retour</p>
              <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
                CHF 40 l&apos;aller-retour — hors réparation
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid rgba(242,242,242,0.08)' }}>
              <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.45)' }}>
                Le service de coursier couvre la collecte et la livraison retour. Le prix de la réparation s&apos;ajoute selon le modèle et la panne.
              </p>
            </div>
          </div>

          {/* Colonne droite : texte + bullets + CTA */}
          <div className="flex-1 flex flex-col gap-4">

            <span className="text-[11px] text-foreground/35 uppercase tracking-[0.22em]">
              Collecte et livraison
            </span>

            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Vous ne pouvez pas vous déplacer ?</span>
              {' '}Nous venons chercher votre appareil.
            </p>

            <div className="flex flex-col gap-3 text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              <p>
                Nous organisons la collecte de votre appareil, son dépôt en atelier et son retour après réparation selon disponibilité.
              </p>
            </div>

            <ul className="flex flex-col gap-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-base font-light text-foreground/70">
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>
                  {b}
                </li>
              ))}
            </ul>

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
