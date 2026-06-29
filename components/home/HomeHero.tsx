import SocialLinks from './SocialLinks'
import ScrollIndicator from './ScrollIndicator'
import HeroSlider from './HeroSlider'
import { heroSlides, heroSlidesEn } from '@/data/heroSlides'

export default function HomeHero({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const slides = locale === 'en' ? heroSlidesEn : heroSlides
  return (
    <section
      aria-labelledby="hero-title"
      className="flex-1 relative flex flex-col"
    >
      {/* Bloc slider centré verticalement dans l'espace disponible.
          flex-1 absorbe la hauteur restante ; md:justify-center centre
          le slider sur desktop sans risquer de débordement mobile.     */}
      <div className="flex-1 flex flex-col md:justify-center">
        <HeroSlider slides={slides} />
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
