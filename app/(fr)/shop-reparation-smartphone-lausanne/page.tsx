import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ShopProductBrowser from '@/components/shop/ShopProductBrowser'
import { Button } from '@/components/ui/Button'
import { SHOP_PRODUCTS, GRADE_LABELS, GRADE_DESCRIPTIONS, type ShopGrade } from '@/data/shopProducts'
import { SHOP_ENABLED } from '@/lib/config/features'
/*
  TODO migration Supabase : remplacer SHOP_PRODUCTS par getProducts() depuis lib/products
  et adapter ShopProductBrowser pour recevoir Product[] à la place de ShopProduct[].
*/

export const metadata: Metadata = SHOP_ENABLED ? {
  title: 'Shop ClikClak Lausanne | Smartphones, accessoires et pièces détachées',
  description:
    "Découvrez le shop ClikClak à Lausanne : smartphones neufs ou d'occasion, accessoires et pièces détachées pour réparation selon disponibilité.",
  alternates: {
    canonical: `${SITE_URL}/shop-reparation-smartphone-lausanne`,
  },
  openGraph: {
    title: 'Shop ClikClak Lausanne | Smartphones, accessoires et pièces détachées',
    description:
      "Smartphones, tablettes, ordinateurs, pièces détachées et accessoires sélectionnés selon disponibilité. Boutique ClikClak à Lausanne.",
    url:    `${SITE_URL}/shop-reparation-smartphone-lausanne`,
    locale: 'fr_CH',
    type:   'website',
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Shop ClikClak Lausanne | Smartphones, accessoires et pièces détachées',
    description: 'Smartphones, tablettes, ordinateurs, pièces détachées et accessoires disponibles selon stock.',
    images:      [DEFAULT_OG_IMAGE],
  },
} : {
  title: 'Boutique en construction | ClikClak Lausanne',
  robots: { index: false, follow: true },
}

const REPAIR_LINKS = [
  { label: 'Réparation écran',       href: '/services/reparation-ecran' },
  { label: 'Changement de batterie', href: '/services/changement-batterie' },
  { label: 'Connecteur de charge',   href: '/services/connecteur-de-charge' },
  { label: 'Diagnostic',             href: '/services/diagnostic' },
  { label: 'Réparation smartphone',  href: '/reparation-smartphone-express' },
]

const REASSURANCE = [
  { title: 'Conseil local',        text: 'Nous vous aidons à identifier la bonne pièce ou le bon accessoire pour votre appareil.' },
  { title: 'Compatibilité',        text: 'Vérification possible selon le modèle exact avant achat.' },
  { title: 'Réparation en atelier',text: 'ClikClak peut installer la pièce directement en boutique si besoin.' },
  { title: 'Disponibilité claire', text: 'Les produits sont proposés selon stock ou sur commande, sans promesse non vérifiée.' },
  { title: 'Boutique à Lausanne',  text: 'Passage en magasin possible pour conseil, vérification ou retrait.' },
]

/* ── Section grades ─────────────────────────────────────────────── */

const GRADES_ORDER: ShopGrade[] = ['NEUF', 'A+', 'A', 'B', 'C']

const DEVICES_CHECKLIST = [
  {
    title: 'Smartphone',
    items: ['Écran', 'Coque', 'Boutons', 'Connecteur de charge', 'Lentille caméra'],
  },
  {
    title: 'MacBook / PC',
    items: ['Écran', 'Clavier', 'Trackpad', 'Webcam', 'Coque et châssis'],
  },
  {
    title: 'iPad / tablette',
    items: ['Écran', 'Face arrière', 'Boutons', 'Connecteur Lightning ou USB-C'],
  },
]

function GradesSection() {
  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
      aria-labelledby="grades-title"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

        {/* En-tête */}
        <div className="flex flex-col gap-4 max-w-2xl">
          <h2 id="grades-title" className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Comprendre les{' '}
            <span className="text-accent">grades</span>
          </h2>
          <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
            Les grades indiquent l&apos;état esthétique d&apos;un appareil neuf, d&apos;occasion ou reconditionné.
            Ils permettent d&apos;évaluer l&apos;aspect visuel&nbsp;: écran, coque, châssis, boutons, connecteurs
            ou traces d&apos;utilisation. Ils ne remplacent pas les informations techniques comme la batterie,
            le stockage, les tests ou la garantie.
          </p>
        </div>

        {/* Cards grades */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {GRADES_ORDER.map(grade => {
            const isPositive = grade === 'NEUF' || grade === 'A+'
            return (
              <div
                key={grade}
                className="flex flex-col gap-3 p-4 rounded-xl"
                style={{
                  border:     isPositive ? '1px solid rgba(204,255,51,0.18)' : '1px solid rgba(242,242,242,0.1)',
                  background: isPositive ? 'rgba(204,255,51,0.03)'           : 'rgba(255,255,255,0.02)',
                }}
              >
                <span
                  className="text-sm font-light tracking-wide"
                  style={{
                    color:        isPositive ? '#ccff33' : 'rgba(242,242,242,0.85)',
                    background:   isPositive ? 'rgba(204,255,51,0.08)' : 'rgba(242,242,242,0.06)',
                    border:       isPositive ? '1px solid rgba(204,255,51,0.22)' : '1px solid rgba(242,242,242,0.12)',
                    padding:      '2px 10px',
                    borderRadius: 5,
                    alignSelf:    'flex-start',
                    display:      'inline-block',
                  }}
                >
                  {GRADE_LABELS[grade]}
                </span>
                <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>
                  {GRADE_DESCRIPTIONS[grade]}
                </p>
              </div>
            )
          })}
        </div>

        {/* Note */}
        <p
          className="text-xs font-light leading-relaxed max-w-2xl pl-4"
          style={{ color: 'rgba(242,242,242,0.4)', borderLeft: '2px solid rgba(204,255,51,0.25)' }}
        >
          Le grade concerne l&apos;aspect visuel. La batterie, la capacité, les tests, les réparations
          et la garantie sont détaillés séparément sur chaque fiche produit.
        </p>

        {/* À vérifier selon l'appareil */}
        <div className="flex flex-col gap-5">
          <h3 className="text-base font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
            À vérifier selon l&apos;appareil
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DEVICES_CHECKLIST.map(dev => (
              <div
                key={dev.title}
                className="flex flex-col gap-3 p-4 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
              >
                <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
                  {dev.title}
                </p>
                <ul className="flex flex-col gap-1">
                  {dev.items.map(item => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs font-light"
                      style={{ color: 'rgba(242,242,242,0.45)' }}
                    >
                      <span style={{ color: 'rgba(204,255,51,0.45)', flexShrink: 0 }}>–</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function ShopPage() {
  /* ── Mode « En construction » ──────────────────────────────────── */
  if (!SHOP_ENABLED) {
    return (
      <>
        <Header />
        <main>
          <section className="px-6 md:px-14 lg:px-20 py-24 border-t border-white/10">
            <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
              <div>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', background: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
                >
                  Bientôt disponible
                </span>
              </div>
              <div className="flex flex-col gap-4">
                <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                  Boutique en construction
                </h1>
                <p className="font-light leading-relaxed" style={{ fontSize: 'clamp(15px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.65)' }}>
                  La boutique ClikClak sera bientôt disponible avec un catalogue complet de smartphones,
                  pièces détachées et accessoires. En attendant, notre équipe reste disponible pour vos réparations.
                </p>
              </div>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button href="/reparation-smartphone-express" variant="primary">
                  Voir les réparations
                </Button>
                <Button href="/contact-clik-clak-lausanne" variant="secondary">
                  Nous contacter
                </Button>
              </div>
            </div>
          </section>
        </main>
        <SiteFooter />
        <SectionPinning />
      </>
    )
  }

  return (
    <>
      <Header />

      <main>

        {/* ══ HERO ══════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 pt-14 pb-4 border-t border-white/10"
          aria-label="Shop ClikClak Lausanne"
        >
          <div className="w-full max-w-6xl mx-auto">
            <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
              Shop <span className="text-accent">ClikClak</span>
            </h1>
          </div>
        </section>

        {/* ══ CATALOGUE (3 catégories + recherche + grille) ════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 pt-6 pb-16"
          aria-label="Catalogue shop"
        >
          <div className="w-full max-w-6xl mx-auto">
            {/* Produits status active uniquement — sold/draft/archived exclus du listing */}
            <ShopProductBrowser products={SHOP_PRODUCTS.filter(p => p.availability !== 'rupture')} />
          </div>
        </section>

        {/* ══ COMPATIBILITÉ ═════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Compatibilité des pièces détachées"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Compatibilité des{' '}
              <span className="text-accent">pièces détachées</span>
            </h2>
            <div
              className="max-w-3xl flex flex-col gap-4 p-6 rounded-xl"
              style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
                Les pièces détachées doivent correspondre au modèle exact de votre appareil.
                En cas de doute, contactez ClikClak avant achat.
              </p>
              <ul className="flex flex-col gap-2">
                {[
                  'Une pièce mal choisie peut ne pas fonctionner ou nécessiter des modifications.',
                  'Certaines réparations nécessitent un diagnostic préalable.',
                  'Les pièces sont proposées selon disponibilité.',
                  'Les garanties peuvent varier selon le type de pièce.',
                ].map(item => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-sm font-light leading-relaxed"
                    style={{ color: 'rgba(242,242,242,0.55)' }}
                  >
                    <span className="text-accent shrink-0 mt-0.5" aria-hidden>–</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p
                className="text-sm font-light leading-relaxed pl-4 mt-2"
                style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.35)' }}
              >
                Si vous n&apos;êtes pas sûr de l&apos;installation, ClikClak peut effectuer
                la réparation en atelier.
              </p>
            </div>
          </div>
        </section>

        {/* ══ RÉASSURANCE ═══════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Pourquoi acheter chez ClikClak"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Pourquoi acheter chez{' '}
              <span className="text-accent">ClikClak&nbsp;?</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {REASSURANCE.map(item => (
                <div
                  key={item.title}
                  className="flex flex-col gap-3 p-5 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
                >
                  <p className="text-sm font-light" style={{ color: '#ccff33' }}>{item.title}</p>
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BESOIN D'UNE INSTALLATION ════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Besoin d'une installation en atelier"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Besoin d&apos;une{' '}
                <span className="text-accent">installation&nbsp;?</span>
              </h2>
              <p className="text-sm font-light leading-relaxed max-w-2xl" style={{ color: 'rgba(242,242,242,0.55)' }}>
                Vous préférez faire poser la pièce par un technicien&nbsp;? ClikClak propose
                la réparation écran, batterie, connecteur, diagnostic et dégâts d&apos;eau.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {REPAIR_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-1 text-sm font-light rounded-lg px-4 py-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent border border-white/10 bg-white/[0.02] hover:border-[rgba(204,255,51,0.2)] hover:bg-[rgba(204,255,51,0.025)] transition-[border-color,background] duration-150"
                  style={{ color: 'rgba(242,242,242,0.7)' }}
                >
                  {link.label} →
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ══ COMPRENDRE LES GRADES ════════════════════════════════ */}
        <GradesSection />

      </main>

      <SiteFooter />
      <SectionPinning />
    </>
  )
}
