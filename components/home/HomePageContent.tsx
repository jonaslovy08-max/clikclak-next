import Header from '@/components/layout/Header'
import HomeHero from '@/components/home/HomeHero'
import ServiceSelector from '@/components/home/ServiceSelector'
import ServiceDetail from '@/components/home/ServiceDetail'
import RepairAtelierSection from '@/components/home/RepairAtelierSection'
import DataUrgencesSection from '@/components/home/DataUrgencesSection'
import InsuranceSection    from '@/components/home/InsuranceSection'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import HorizontalScrollingGallery from '@/components/home/HorizontalScrollingGallery'
import MobileServicesSection from '@/components/home/MobileServicesSection'
import OtherServicesSection from '@/components/home/OtherServicesSection'
import RecentShopProducts from '@/components/shop/RecentShopProducts'
import ScrollReveal from '@/components/animations/ScrollReveal'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'

export default function HomePageContent({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const blogTitle = locale === 'en' ? 'Useful tips' : 'Conseils utiles'
  return (
    <>
      {/* ── Premier écran : Header + Hero ───────────────────────── */}
      <div className="hero-main-wrap relative isolate z-[1] flex flex-col min-h-[100svh]">
        <Header locale={locale} />
        <main className="flex-1 flex flex-col" id="main-content">
          <HomeHero locale={locale} />
        </main>
      </div>

      {/* ── Section 1 : sélection appareil ──────────────────────── */}
      <ScrollReveal><ServiceSelector locale={locale} /></ScrollReveal>

      {/* ── Autres services — raccourcis ancres ──────────────────── */}
      <ScrollReveal><OtherServicesSection locale={locale} /></ScrollReveal>

      {/* ── Réparer & revendre ─────────────────────────────────── */}
      <ScrollReveal><RepairAtelierSection locale={locale} /></ScrollReveal>

      {/* ── Réparations courantes ─────────────────────────────────── */}
      <ScrollReveal><ServiceDetail locale={locale} /></ScrollReveal>

      {/* ── Données & urgences ────────────────────────────────────── */}
      <ScrollReveal><DataUrgencesSection locale={locale} /></ScrollReveal>

      {/* ── Assurance & devis ─────────────────────────────────────── */}
      <ScrollReveal><InsuranceSection locale={locale} /></ScrollReveal>

      {/* ── Produits récents shop ── */}
      <ScrollReveal><RecentShopProducts /></ScrollReveal>

      {/* ── Services mobiles ─────────────────────────────────────── */}
      <ScrollReveal><MobileServicesSection locale={locale} /></ScrollReveal>

      {/* ── Conseils utiles — blog ── */}
      <RelatedBlogPosts
        title={blogTitle}
        postSlugs={['telephone-tombe-dans-l-eau', 'connaitre-modele-iphone', 'batterie-smartphone-fatiguee']}
        locale={locale}
      />

      {/* ── Galerie horizontale — GSAP interne, pas de ScrollReveal ── */}
      <HorizontalScrollingGallery locale={locale} />

      {/* ── Footer / Contact ── */}
      <SiteFooter locale={locale} />

      {/* SectionPinning — actif uniquement sur footer Contact */}
      <SectionPinning />
    </>
  )
}
