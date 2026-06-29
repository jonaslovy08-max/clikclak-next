import Link from 'next/link'
import { getPublishedPosts, getPostBySlug } from '@/lib/blog'
import type { BlogMeta } from '@/lib/blog'
import BlogCard from '@/components/blog/BlogCard'

interface RelatedBlogPostsProps {
  title?:     string
  postSlugs?: string[]
  limit?:     number
  locale?:    'fr' | 'en'
}

export default function RelatedBlogPosts({
  title     = 'Conseils utiles',
  postSlugs,
  limit     = 3,
  locale    = 'fr',
}: RelatedBlogPostsProps) {
  /* Blog is FR-only — never render on EN pages */
  if (locale === 'en') return null
  let posts: BlogMeta[]

  if (postSlugs && postSlugs.length > 0) {
    posts = postSlugs
      .map(slug => getPostBySlug(slug)?.meta)
      .filter((m): m is BlogMeta => m !== undefined)
      .slice(0, limit)
  } else {
    posts = getPublishedPosts()
      .map(p => p.meta)
      .slice(0, limit)
  }

  if (posts.length === 0) return null

  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-16 md:py-20 border-t border-white/10"
      aria-label={title}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

        <div className="flex flex-col gap-2">
          <h2 className="text-lg md:text-xl font-light">
            {title}
          </h2>
          <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.45)' }}>
            Quelques guides pratiques pour mieux comprendre une panne, préparer une réparation ou éviter d&apos;aggraver un dommage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map(meta => (
            <BlogCard key={meta.slug} meta={meta} />
          ))}
        </div>

        <Link
          href="/blog"
          className="self-start text-sm font-light hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
          style={{ color: 'rgba(242,242,242,0.35)' }}
        >
          Voir tous les conseils →
        </Link>

      </div>
    </section>
  )
}
