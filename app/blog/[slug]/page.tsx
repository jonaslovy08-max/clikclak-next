import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import { getPublishedPosts, getPostBySlug } from '@/lib/blog'

/* ── generateStaticParams ─────────────────────────────────────────────── */
export function generateStaticParams() {
  return getPublishedPosts().map(({ meta }) => ({ slug: meta.slug }))
}

/* ── Metadata ─────────────────────────────────────────────────────────── */
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) return {}

  const { meta } = post
  return {
    title:       `${meta.title} — ClikClak Lausanne`,
    description: meta.description,
    alternates:  { canonical: `${SITE_URL}/blog/${meta.slug}/` },
    openGraph: {
      title:       meta.title,
      description: meta.description,
      url:         `${SITE_URL}/blog/${meta.slug}/`,
      locale:      'fr_CH',
      type:        'article',
      ...(meta.image ? { images: [{ url: `${SITE_URL}${meta.image}` }] } : {}),
    },
  }
}

/* ── Page ─────────────────────────────────────────────────────────────── */
export default async function BlogArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = getPostBySlug(slug)
  if (!post) notFound()

  const { meta, Component } = post

  const dateFormatted = new Date(meta.date).toLocaleDateString('fr-CH', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })

  /* JSON-LD Article */
  const jsonLd = {
    '@context':        'https://schema.org',
    '@type':           'Article',
    headline:          meta.title,
    description:       meta.description,
    datePublished:     meta.date,
    dateModified:      meta.updatedAt,
    author:            { '@type': 'Organization', name: meta.author },
    publisher:         { '@type': 'Organization', name: 'ClikClak', url: SITE_URL },
    mainEntityOfPage:  { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${meta.slug}/` },
    ...(meta.image ? { image: `${SITE_URL}${meta.image}` } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />
      <main>
        <article
          className="px-6 md:px-14 lg:px-20 py-16 md:py-24 border-t border-white/10"
          aria-label={meta.title}
        >
          <div className="w-full max-w-3xl mx-auto flex flex-col gap-10">

            {/* Retour + catégorie */}
            <div className="flex items-center gap-4">
              <Link
                href="/blog"
                className="text-sm font-light focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                style={{ color: 'rgba(242,242,242,0.4)' }}
              >
                ← Conseils
              </Link>
              <span
                className="text-xs font-light px-2.5 py-1 rounded-full"
                style={{ color: '#ccff33', backgroundColor: 'rgba(204,255,51,0.08)', border: '1px solid rgba(204,255,51,0.2)' }}
              >
                {meta.category}
              </span>
            </div>

            {/* En-tête article */}
            <header className="flex flex-col gap-4">
              <h1 className="text-[1.6rem] md:text-[2rem] font-light leading-tight">
                {meta.title}
              </h1>
              <p className="text-base font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
                {meta.description}
              </p>
              <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)' }}>
                {meta.author} — {dateFormatted}
              </p>
            </header>

            {/* Image article */}
            {meta.image && (
              <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
                <Image
                  src={meta.image}
                  alt={meta.imageAlt ?? meta.title}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-cover"
                />
              </div>
            )}

            {/* Contenu article */}
            <div className="prose-blog">
              <Component />
            </div>

            {/* Retour en bas */}
            <div className="pt-8 border-t border-white/10">
              <Link
                href="/blog"
                className="text-sm font-light hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                style={{ color: 'rgba(242,242,242,0.4)' }}
              >
                ← Retour aux conseils
              </Link>
            </div>

          </div>
        </article>
      </main>
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
