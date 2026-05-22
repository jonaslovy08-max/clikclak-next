import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import ContactPopover from '@/components/home/ContactPopover'
import BulletToggle  from '@/components/ui/BulletToggle'

const bullets = [
  'Diagnostic complet',
  'Nettoyage interne anti-corrosion',
  'Remplacement des pièces si nécessaire',
  'Tests complets avant remise',
]

export default function WaterDamageSection() {
  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Réparation dégâts d'eau Lausanne"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-5">

        {/* ── Titre ── */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          <span className="text-accent">Dégâts</span>{' '}d&apos;eau
        </h2>

        {/* ── Séparateur ── */}


        {/* ── Contenu : image gauche / texte droite ── */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-center">

          {/* Colonne gauche : image */}
          <div className="-mx-6 w-screen md:mx-0 md:w-[48%] shrink-0 rounded-none md:rounded-xl overflow-hidden">
            <Image
              src="/assets/images/homepage/service-sections/water-damage-mobile.webp"
              alt="Réparation dégâts d'eau smartphone chez Clik Clak Repair Lausanne"
              width={0}
              height={0}
              sizes="100vw"
              className="block md:hidden w-full h-auto"
            />
            <Image
              src="/assets/images/homepage/service-sections/water-damage.webp"
              alt="Réparation dégâts d'eau smartphone chez Clik Clak Repair Lausanne"
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 48vw"
              className="hidden md:block w-full h-auto"
            />
          </div>

          {/* Colonne droite : texte + CTA */}
          <div className="flex-1 flex flex-col gap-4 md:pt-2">

            {/* Sous-titre */}
            <p className="text-base md:text-lg font-light leading-snug">
              <span className="text-accent">Un smartphone mouillé peut encore être sauvé.</span>
            </p>

            {/* Corps de texte */}
            <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              Éteignez-le, ne le rechargez pas et faites contrôler l&apos;appareil rapidement. Une intervention dans les premières heures limite les dommages.
            </p>

            <BulletToggle
              bullets={bullets}
              labelClosed="Que faire rapidement ?"
              labelOpen="Masquer les conseils"
            />

            {/* CTAs */}
            <div className="flex flex-col gap-3 mt-2">
              <Button href="/reparation-degat-eau-lausanne" size="lg">
                Faire contrôler mon appareil
              </Button>
              <ContactPopover />
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
