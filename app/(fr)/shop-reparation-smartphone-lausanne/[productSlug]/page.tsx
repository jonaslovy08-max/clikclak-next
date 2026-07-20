import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import { SITE_URL, DEFAULT_OG_IMAGE } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import { Button } from '@/components/ui/Button'
import ProductImageGallery from '@/components/shop/ProductImageGallery'
import AddToCartButton from '@/components/shop/AddToCartButton'
import ShareButton     from '@/components/share/ShareButton'
import GradeInfoToggle from '@/components/shop/GradeInfoToggle'
import {
  SHOP_PRODUCTS,
  MAIN_CATEGORY_LABELS,
  AVAILABILITY_STYLES,
  getProductBadge,
  isProductPurchasable,
} from '@/data/shopProducts'
import {
  getProductBySlugAny,
  productRedirectTarget,
} from '@/lib/products'
import { getProductImages } from '@/lib/products/images'
import { SHOP_ENABLED } from '@/lib/config/features'

/* ── Génération statique de toutes les pages produit ─────────── */
export async function generateStaticParams() {
  if (!SHOP_ENABLED) return []
  return SHOP_PRODUCTS.map(p => ({ productSlug: p.slug }))
}

/* ── Metadata dynamique ───────────────────────────────────────── */
export async function generateMetadata(
  { params }: { params: Promise<{ productSlug: string }> }
): Promise<Metadata> {
  if (!SHOP_ENABLED) {
    return {
      title: 'Boutique indisponible | ClikClak',
      robots: { index: false, follow: false },
    }
  }

  const { productSlug } = await params
  const product = SHOP_PRODUCTS.find(p => p.slug === productSlug)
  if (!product) return {}

  /* Produit vendu → noindex, description adaptée */
  const pMeta = getProductBySlugAny(productSlug)
  if (pMeta?.status === 'sold') {
    return {
      title: `${product.name} — Vendu — Shop ClikClak Lausanne`,
      description: `Ce produit n'est plus disponible. Découvrez d'autres appareils sur le shop ClikClak à Lausanne.`,
      robots: { index: false, follow: true },
    }
  }

  const title       = `${product.name} — Shop ClikClak Lausanne`
  const description = product.shortDescription
  const ogDesc      = product.price != null ? `CHF ${product.price.toFixed(0)} — ${product.shortDescription}` : product.shortDescription
  const ogImage     = product.images[0] ? product.images[0] : DEFAULT_OG_IMAGE

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/shop-reparation-smartphone-lausanne/${product.slug}`,
    },
    openGraph: {
      title,
      description: ogDesc,
      url:    `${SITE_URL}/shop-reparation-smartphone-lausanne/${product.slug}`,
      locale: 'fr_CH',
      type:   'website',
      images: [{ url: ogImage }],
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description: ogDesc,
      images:      [ogImage],
    },
  }
}

/* ── Page ─────────────────────────────────────────────────────── */
export default async function ProductPage(
  { params }: { params: Promise<{ productSlug: string }> }
) {
  /* Contrôle shop désactivé — avant toute lecture de données */
  if (!SHOP_ENABLED) notFound()

  const { productSlug } = await params

  /* ── Routing statut ─────────────────────────────────────────── */
  const pStatus = getProductBySlugAny(productSlug)
  if (!pStatus)                      notFound()
  if (pStatus.status === 'draft')    notFound()
  if (pStatus.status === 'archived') {
    const target = productRedirectTarget(pStatus)
    if (target) permanentRedirect(target)
    notFound()
  }
  const isSold = pStatus.status === 'sold'

  /* ── Données affichage (source ShopProduct) ─────────────────── */
  const product = SHOP_PRODUCTS.find(p => p.slug === productSlug)
  if (!product) notFound()

  const avail    = AVAILABILITY_STYLES[product.availability]
  const catLabel = MAIN_CATEGORY_LABELS[product.mainCategory]
  const badge    = getProductBadge(product)
  const isPart   = product.mainCategory === 'pieces-detachees'

  return (
    <>
      <Header />

      <main>
        <div className="px-6 md:px-14 lg:px-20 border-t border-white/10">
          <div className="w-full max-w-6xl mx-auto py-6">
            <nav className="flex items-center gap-2 text-xs font-light" aria-label="Fil d'Ariane">
              <Link href="/shop-reparation-smartphone-lausanne" className="underline underline-offset-4 focus-visible:outline-none" style={{ color: 'rgba(204,255,51,0.6)' }}>
                Shop
              </Link>
              <span style={{ color: 'rgba(242,242,242,0.25)' }}>/</span>
              <span style={{ color: 'rgba(242,242,242,0.45)' }}>{catLabel}</span>
              <span style={{ color: 'rgba(242,242,242,0.25)' }}>/</span>
              <span style={{ color: 'rgba(242,242,242,0.6)' }}>{product.name}</span>
            </nav>
          </div>
        </div>

        {/* ══ BANNIÈRE VENDU ════════════════════════════════════════ */}
        {isSold && (
          <div
            className="px-6 md:px-14 lg:px-20 py-4"
            style={{ background: 'rgba(242,242,242,0.03)', borderBottom: '1px solid rgba(242,242,242,0.1)' }}
          >
            <div className="w-full max-w-6xl mx-auto flex flex-wrap items-center gap-3">
              <span
                className="text-xs font-light px-3 py-1.5 rounded-lg"
                style={{ color: 'rgba(242,242,242,0.7)', background: 'rgba(242,242,242,0.06)', border: '1px solid rgba(242,242,242,0.18)' }}
              >
                Vendu
              </span>
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
                Ce produit n&apos;est plus disponible.{' '}
                <Link href="/shop-reparation-smartphone-lausanne" className="underline underline-offset-4" style={{ color: 'rgba(204,255,51,0.7)' }}>
                  Voir les produits disponibles →
                </Link>
              </p>
            </div>
          </div>
        )}

        {/* ══ PRODUIT ═══════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-10"
          aria-label={product.name}
          style={isSold ? { opacity: 0.85 } : undefined}
        >
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">

            {/* ── Galerie images ── */}
            <ProductImageGallery
              images={getProductImages(product)}
              productName={product.name}
              isIllustrative={product.isIllustrative}
            />

            {/* ── Informations produit ── */}
            <div className="flex flex-col gap-6">

              {/* Badge produit */}
              <div className="flex flex-wrap gap-2">
                <span
                  className="text-xs font-light"
                  style={badge.isAccent
                    ? { color: 'rgba(204,255,51,0.85)', background: 'rgba(204,255,51,0.07)', border: '1px solid rgba(204,255,51,0.22)', padding: '3px 10px', borderRadius: 5 }
                    : { color: 'rgba(242,242,242,0.6)', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.12)', padding: '3px 10px', borderRadius: 5 }
                  }
                >
                  {badge.label}
                </span>
                {product.subCategory && (
                  <span
                    className="text-xs font-light"
                    style={{ color: 'rgba(242,242,242,0.5)', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.1)', padding: '3px 10px', borderRadius: 5 }}
                  >
                    {product.subCategory}
                  </span>
                )}
              </div>

              {/* Bloc Reconditionné */}
              {product.condition === 'reconditionné' && (
                <div
                  className="flex items-center gap-2.5 p-3 rounded-xl"
                  style={{ border: '1px solid rgba(204,255,51,0.18)', background: 'rgba(204,255,51,0.03)' }}
                >
                  <Image
                    src="/assets/ui/icon-refurbished.svg"
                    alt=""
                    aria-hidden
                    width={20}
                    height={24}
                    unoptimized
                  />
                  <div className="flex flex-col gap-0">
                    <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>
                      Reconditionné
                    </span>
                    <span className="text-[10px] font-light tracking-widest uppercase" style={{ color: '#ccff33', letterSpacing: '0.12em' }}>
                      Refurbished
                    </span>
                  </div>
                </div>
              )}

              {/* Grade esthétique */}
              {product.grade && (
                <GradeInfoToggle grade={product.grade} />
              )}

              {/* Titre */}
              <div className="flex flex-col gap-1">
                <h1 className="text-[1.75rem] md:text-[2rem] font-light leading-tight">
                  {product.name}
                </h1>
                {product.brand && (
                  <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                    {product.brand}
                  </p>
                )}
              </div>

              {/* Description courte */}
              <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                {product.shortDescription}
              </p>

              {/* Prix + disponibilité */}
              <div
                className="flex flex-col gap-3 p-4 rounded-xl"
                style={{ border: '1px solid rgba(242,242,242,0.1)', background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <span
                    className="text-sm font-light"
                    style={{ color: avail.color, background: avail.bg, border: `1px solid ${avail.border}`, padding: '4px 12px', borderRadius: 5 }}
                  >
                    {avail.label}
                    {product.stock != null && !isProductPurchasable(product) && ` — ${product.stock} en stock`}
                  </span>
                  {product.price != null ? (
                    <span className="text-2xl font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>
                      CHF {product.price.toFixed(0)}
                    </span>
                  ) : (
                    <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                      Prix sur demande
                    </span>
                  )}
                </div>
                {product.price != null && (
                  <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.35)' }}>
                    Prix en CHF. Paiement sécurisé via Stripe. TWINT et carte bancaire acceptés.
                  </p>
                )}
              </div>

              {/* Specs */}
              {product.specs && Object.values(product.specs).some(Boolean) && (
                <div className="flex flex-col gap-3">
                  <p className="text-xs font-light uppercase tracking-[0.1em]" style={{ color: 'rgba(242,242,242,0.35)' }}>
                    Caractéristiques
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.specs.storage && (
                      <SpecRow label="Capacité" value={product.specs.storage} />
                    )}
                    {product.specs.batteryHealth && (
                      <SpecRow label="Batterie" value={product.specs.batteryHealth} />
                    )}
                    {product.specs.color && (
                      <SpecRow label="Couleur" value={product.specs.color} />
                    )}
                    {product.specs.grade && (
                      <SpecRow label="État" value={product.specs.grade} />
                    )}
                    {product.specs.warranty && (
                      <SpecRow label="Garantie" value={product.specs.warranty} />
                    )}
                  </div>
                </div>
              )}

              {/* Modèles compatibles */}
              {product.compatibleModels && product.compatibleModels.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-light uppercase tracking-[0.1em]" style={{ color: 'rgba(242,242,242,0.35)' }}>
                    Compatible avec
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.compatibleModels.map(m => (
                      <span
                        key={m}
                        className="text-xs font-light"
                        style={{ color: 'rgba(242,242,242,0.6)', background: 'rgba(242,242,242,0.04)', border: '1px solid rgba(242,242,242,0.1)', padding: '3px 8px', borderRadius: 4 }}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Avertissement compatibilité pièces */}
              {isPart && (
                <div
                  className="flex flex-col gap-2 p-4 rounded-lg"
                  style={{ background: 'rgba(204,255,51,0.04)', border: '1px solid rgba(204,255,51,0.15)' }}
                >
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                    Vérifiez la compatibilité avec votre modèle exact avant achat.
                    Si vous n&apos;êtes pas sûr de l&apos;installation, ClikClak peut effectuer
                    la réparation en atelier.
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="flex flex-wrap gap-3 pt-2">
                {isSold ? (
                  /* Produit vendu — pas d'achat, CTA contact uniquement */
                  <Button href="/contact-clik-clak-lausanne" variant="primary" size="lg">
                    Demander un modèle similaire
                  </Button>
                ) : isProductPurchasable(product) ? (
                  <AddToCartButton productId={product.id} size="lg" />
                ) : (
                  <Button href="/contact-clik-clak-lausanne" variant="primary" size="lg">
                    Demander le prix
                  </Button>
                )}
                <Button href="/shop-reparation-smartphone-lausanne" variant="secondary" size="lg">
                  ← Retour au shop
                </Button>
              </div>

              {/* Partager */}
              <div className="flex justify-end pt-1">
                <ShareButton
                  title={`${product.name} — ClikClak Lausanne`}
                  text={`${product.name}${product.grade ? ` — Grade ${product.grade}` : ''}${product.price != null ? `. CHF ${product.price.toFixed(0)}` : ''}. Disponible chez ClikClak Lausanne.`}
                  url={`${SITE_URL}/shop-reparation-smartphone-lausanne/${product.slug}`}
                />
              </div>
            </div>
          </div>
        </section>

        {/* ══ DESCRIPTION LONGUE + COMMENTAIRE ══════════════════════ */}
        {(product.description || product.comment) && (
          <section
            className="px-6 md:px-14 lg:px-20 py-12 border-t border-white/10"
            aria-label="Description du produit"
          >
            <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
              {product.description && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>
                    Description
                  </h2>
                  <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                    {product.description}
                  </p>
                </div>
              )}
              {product.comment && (
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>
                    Commentaire
                  </h2>
                  <p
                    className="text-sm font-light leading-relaxed pl-4"
                    style={{ color: 'rgba(242,242,242,0.55)', borderLeft: '2px solid rgba(204,255,51,0.35)' }}
                  >
                    {product.comment}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ══ RETOUR SHOP ═══════════════════════════════════════════ */}
        <section className="px-6 md:px-14 lg:px-20 py-12 border-t border-white/10">
          <div className="w-full max-w-6xl mx-auto">
            <Link
              href="/shop-reparation-smartphone-lausanne"
              className="inline-flex items-center gap-2 text-sm font-light underline underline-offset-4 focus-visible:outline-none"
              style={{ color: 'rgba(204,255,51,0.6)' }}
            >
              ← Retour au shop
            </Link>
          </div>
        </section>

      </main>

      <SiteFooter />
      <SectionPinning />
    </>
  )
}

/* ── Sous-composant spec row ──────────────────────────────────── */
function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col gap-1 p-3 rounded-lg"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(242,242,242,0.07)' }}
    >
      <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.35)' }}>{label}</span>
      <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.8)' }}>{value}</span>
    </div>
  )
}
