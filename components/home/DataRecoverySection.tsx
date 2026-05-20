import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import ContactPopover from '@/components/home/ContactPopover'

/*
  DataRecoverySection — Récupération de données à Lausanne.

  Placée après ServiceDetail (Réparation smartphone Lausanne).
  Layout desktop : texte à gauche | image à droite
  Même structure / espacements / titre que les autres sections homepage.
  Pas de data-pin-section.
*/

const bullets = [
  'Smartphones, ordinateurs, SSD et disques durs',
  'Diagnostic sérieux et approche sécurisée',
  'Confidentialité des données personnelles et professionnelles',
]

export default function DataRecoverySection() {
  return (
    <section
      id="recuperation-donnees"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Récupération de données à Lausanne"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-5">

        {/* ── Titre ── */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          <span className="text-accent">Récupération</span>{' '}de données à Lausanne
        </h2>

        {/* ── Séparateur ── */}


        {/* ── Contenu : texte gauche / image droite ── */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center">

          {/* Colonne gauche : texte + CTAs */}
          <div className="flex-1 flex flex-col gap-4 md:pt-2">

            {/* Label */}
            <span className="text-[11px] text-foreground/35 uppercase tracking-[0.22em]">
              Sauvegarde &amp; récupération
            </span>

            {/* Sous-titre */}
            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Vos fichiers ne sont pas forcément perdus.</span>
            </p>

            {/* Corps de texte */}
            <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              Photos, contacts, messages ou fichiers importants&nbsp;: nous analysons votre appareil et cherchons la solution la plus sûre pour récupérer vos données.
            </p>

            {/* Points clés */}
            <ul className="flex flex-col gap-2">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-2 text-base font-light text-foreground/70">
                  <span className="text-accent mt-0.5 shrink-0" aria-hidden>–</span>
                  {b}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mt-2">
              <Button href="/services/recuperation-donnees" size="lg">
                Demander une analyse
              </Button>
              <ContactPopover />
            </div>
          </div>

          {/* Colonne droite : image */}
          <div className="w-full md:w-[48%] shrink-0 rounded-xl overflow-hidden">
            <Image
              src="/assets/images/homepage/service-sections/data-recovery.webp"
              alt="Récupération de données chez Clik Clak Repair à Lausanne"
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
