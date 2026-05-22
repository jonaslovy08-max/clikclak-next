import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import BlogCard from '@/components/blog/BlogCard'
import { getPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Conseils & guides smartphone — ClikClak Lausanne',
  description:
    "Guides pratiques et conseils de ClikClak Lausanne : dégâts d'eau, batterie, identification de modèle et entretien de votre smartphone.",
  alternates: { canonical: `${SITE_URL}/blog/` },
  openGraph: {
    title: 'Conseils & guides — ClikClak Lausanne',
    description: "Guides pratiques pour smartphones : dégâts d'eau, batterie, modèle iPhone et plus.",
    url: `${SITE_URL}/blog/`,
    locale: 'fr_CH',
    type: 'website',
  },
}

export default function BlogPage() {
  const posts = getPublishedPosts()

  return (
    <>
      <Header />
      <main>
        <section
          className="px-6 md:px-14 lg:px-20 py-20 md:py-28 border-t border-white/10"
          aria-label="Conseils et guides"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">

            {/* En-tête */}
            <div className="flex flex-col gap-4 max-w-2xl">
              <h1 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
                Conseils <span className="text-accent">&amp; guides</span>
              </h1>
              <p className="text-base font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
                Conseils pratiques et guides utiles pour prendre soin de votre smartphone et préparer votre visite en boutique.
              </p>
            </div>

            {/* Grille articles */}
            {posts.length === 0 ? (
              <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                Aucun article disponible pour le moment.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(({ meta }) => (
                  <BlogCard key={meta.slug} meta={meta} />
                ))}
              </div>
            )}

          </div>
        </section>
      </main>
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
