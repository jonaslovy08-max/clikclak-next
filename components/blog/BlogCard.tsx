import Link from 'next/link'
import Image from 'next/image'
import type { BlogMeta } from '@/lib/blog'

export default function BlogCard({ meta }: { meta: BlogMeta }) {
  const dateFormatted = new Date(meta.date).toLocaleDateString('fr-CH', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  })

  return (
    <Link
      href={`/blog/${meta.slug}`}
      className="group flex flex-col overflow-hidden transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* Image */}
      {meta.image && (
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <Image
            src={meta.image}
            alt={meta.imageAlt ?? meta.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        </div>
      )}

      {/* Contenu */}
      <div className="flex flex-col gap-4 p-5 flex-1">

        {/* Catégorie + date */}
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-light tracking-wide px-2.5 py-1 rounded-full"
            style={{ color: '#ccff33', backgroundColor: 'rgba(204,255,51,0.08)', border: '1px solid rgba(204,255,51,0.2)' }}
          >
            {meta.category}
          </span>
          <span className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.35)' }}>
            {dateFormatted}
          </span>
        </div>

        {/* Titre */}
        <h2 className="text-base md:text-lg font-light leading-snug text-foreground group-hover:text-accent transition-colors duration-200">
          {meta.title}
        </h2>

        {/* Description */}
        <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
          {meta.description}
        </p>

        {/* Lire l'article */}
        <span
          className="mt-auto text-sm font-light"
          style={{ color: 'rgba(204,255,51,0.7)' }}
        >
          Lire l&apos;article →
        </span>
      </div>
    </Link>
  )
}
