import SocialLinks from './SocialLinks'
import ScrollIndicator from './ScrollIndicator'
import HeroSlider from './HeroSlider'
import { heroSlides } from '@/data/heroSlides'

/*
  Layout strategy — single H1 in DOM, positioned differently by breakpoint:

  Mobile (grid-cols-1, auto-placement):
    row 1 : Image (full-bleed)
    row 2 : Pagination  ← md:hidden, intercalée entre image et texte
    row 3 : Text (H1/p + desc + CTAs inline)
    row 4 : Bottom bar

  Desktop (grid-cols-2, explicit placement):
    row 1 col 1 : Image      (md:row-start-1 md:col-start-1)
    row 1 col 2 : Text       (md:row-start-1 md:col-start-2)
    row 2 col-span-2 : Pagination desktop séparée (hidden md:block)

  HeroSlider owns the grid + pagination — HomeHero keeps bottom bar + floaters.
*/

export default function HomeHero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="flex-1 relative flex flex-col"
    >
      {/* Bloc slider centré verticalement dans l'espace disponible.
          flex-1 absorbe la hauteur restante ; md:justify-center centre
          le slider sur desktop sans risquer de débordement mobile.     */}
      <div className="flex-1 flex flex-col md:justify-center">
        <HeroSlider slides={heroSlides} />
      </div>

      {/* Bottom bar ─────────────────────────────────────────────── */}
      <div
        className="
          relative flex items-center
          px-4 pb-6 pt-2
          md:px-8 lg:px-12 md:pb-8 md:pt-4
        "
      >
        {/* Masqué sur mobile — réaffiché dans l'overlay MobileMenu */}
        <div className="hidden md:block">
          <SocialLinks />
        </div>
        <div className="hidden md:block absolute left-1/2 -translate-x-1/2">
          <ScrollIndicator />
        </div>
        <div className="ml-auto w-14" aria-hidden="true" />
      </div>

    </section>
  )
}
