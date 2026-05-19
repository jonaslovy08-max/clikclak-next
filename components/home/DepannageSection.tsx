import Link from 'next/link'

/*
  DepannageSection — Section homepage "Dépannage à domicile".
  Placée après RebuySection, avant CourrierSection.
  Langage visuel identique aux sections WaterDamageSection / RebuySection.
*/

const bullets = [
  'Diagnostic sur place',
  'Aide configuration',
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

            <span className="text-[11px] text-foreground/35 uppercase tracking-[0.22em]">
              Assistance selon disponibilité
            </span>

            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Besoin d&apos;aide pour votre appareil ?</span>
              {' '}ClikClak vous accompagne 7/7.
            </p>

            <div className="flex flex-col gap-3 text-sm md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              <p>
                Besoin d&apos;aide pour un smartphone, une tablette ou un ordinateur ? ClikClak vous accompagne pour le diagnostic, la configuration, le transfert de données ou les pannes urgentes, selon disponibilité.
              </p>
            </div>

            <ul className="flex flex-col gap-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-sm font-light text-foreground/70">
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>
                  {b}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 mt-2">
              <Link
                href="/services/depannage-reparation-domicile"
                className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-14 px-8 text-lg min-w-[180px]"
              >
                <span className="inline-flex items-center gap-2">Voir le service</span>
              </Link>
            </div>

          </div>

          {/* Colonne droite : card visuelle */}
          <div
            className="w-full md:w-[44%] shrink-0 flex flex-col gap-4 p-5 rounded-2xl"
            style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <div className="flex flex-col gap-2">
              <p className="text-sm font-light" style={{ color: '#ccff33' }}>Dépannage 7/7</p>
              <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Lausanne et Suisse romande selon disponibilité
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2" style={{ borderTop: '1px solid rgba(242,242,242,0.08)' }}>
              {['Smartphone', 'Tablette', 'Ordinateur / MacBook', 'Transfert de données'].map(item => (
                <p key={item} className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.55)' }}>
                  — {item}
                </p>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
