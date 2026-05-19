import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import HomeHero from '@/components/home/HomeHero'
import ServiceSelector from '@/components/home/ServiceSelector'
import ServiceDetail from '@/components/home/ServiceDetail'
import DataRecoverySection from '@/components/home/DataRecoverySection'
import RebuySection from '@/components/home/RebuySection'
import WaterDamageSection from '@/components/home/WaterDamageSection'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import HorizontalScrollingGallery from '@/components/home/HorizontalScrollingGallery'
import DepannageSection from '@/components/home/DepannageSection'
import CourrierSection from '@/components/home/CourrierSection'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import OtherServicesSection from '@/components/home/OtherServicesSection'
import ScrollReveal from '@/components/animations/ScrollReveal'

export const metadata: Metadata = {
  title: 'Réparation smartphone Lausanne, réparation iPhone, Samsung',
  description:
    'Votre smartphone est tombé, écran cassé ? Clik Clak Repair à Lausanne le répare, garantie 2 ans sur les pièces originales dès 29 CHF.',
  alternates: {
    canonical: `${SITE_URL}/`,
  },
  openGraph: {
    title: 'Réparation smartphone Lausanne, réparation iPhone, Samsung',
    url: `${SITE_URL}/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <>
      {/* ── Premier écran : Header + Hero ───────────────────────── */}
      {/*  relative isolate → stacking context pour la couche bg.        */}
      {/*  La couche (z:-1) couvre tout le div fullscreen, y compris     */}
      {/*  la zone du header. Elle reste derrière header (z:50) et main. */}
      <div className="hero-main-wrap relative isolate z-[1] flex flex-col min-h-[100svh]">

        {/* ── Couche 1 — image fullscreen DÉSACTIVÉE temporairement ────
            Réactiver en décommentant ce bloc.
            Fichier : public/assets/hero/hero-bg-slide-01.webp
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{ zIndex: -1 }}
        >
          <Image
            src="/assets/hero/hero-bg-slide-01.webp"
            alt=""
            fill
            priority
            className="object-cover object-center"
            style={{ opacity: 0.14 }}
            sizes="100vw"
          />
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(25,25,25,0.45)' }}
          />
        </div>
        */}

        <Header />
        <main className="flex-1 flex flex-col" id="main-content">
          <HomeHero />
        </main>
      </div>

      {/* ── Section 1 : sélection appareil — sans grille SVG ──────── */}
      <ScrollReveal><ServiceSelector /></ScrollReveal>

      {/* ── Section : Autres services — raccourcis ancres ─────────── */}
      <ScrollReveal><OtherServicesSection /></ScrollReveal>

      {/* ── Section 2 : détail service smartphone — sans grille ────── */}
      <ScrollReveal><ServiceDetail /></ScrollReveal>

      {/* ── Produits récents shop ── */}
      <ScrollReveal><RecentShopProducts /></ScrollReveal>

      {/* ── Section 3 : Récupération de données ── */}
      <ScrollReveal><DataRecoverySection /></ScrollReveal>

      {/* ── Section 4 : Dégâts d'eau ── */}
      <ScrollReveal><WaterDamageSection /></ScrollReveal>

      {/* ── Section 4 : Rachat de vos anciens smartphones ── */}
      <ScrollReveal><RebuySection /></ScrollReveal>

      {/* ── Section 5 : Dépannage à domicile ── */}
      <ScrollReveal><DepannageSection /></ScrollReveal>

      {/* ── Section 6 : Service de coursier ── */}
      <ScrollReveal><CourrierSection /></ScrollReveal>

      {/* ── Galerie horizontale — GSAP interne, pas de ScrollReveal ── */}
      <HorizontalScrollingGallery />

      {/* ── Footer / Contact ── */}
      <SiteFooter />

      {/* SectionPinning — actif uniquement sur footer Contact (single-panel mode) */}
      <SectionPinning />
    </>
  )
}
