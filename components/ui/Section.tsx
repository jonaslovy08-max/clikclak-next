import { cn } from '@/lib/utils'

type SectionVariant = 'dark' | 'light' | 'surface'

type SectionProps = {
  variant?:   SectionVariant
  grid?:      boolean
  className?: string
  children:   React.ReactNode
  as?:        'section' | 'div' | 'article' | 'aside'
  id?:        string
}

const variantClasses: Record<SectionVariant, string> = {
  dark:    'bg-background text-foreground',
  light:   'bg-white text-background',
  surface: 'bg-surface text-surface-foreground',
}

/**
 * Section — wrapper de section avec espacement vertical mobile-first.
 * grid=true ajoute la grille technique subtile en arrière-plan.
 */
export function Section({
  variant = 'dark',
  grid = false,
  className,
  children,
  as: Tag = 'section',
  id,
}: SectionProps) {
  return (
    <Tag
      id={id}
      className={cn(
        'py-12 md:py-20',
        variantClasses[variant],
        grid && 'grid-bg',
        className
      )}
    >
      {children}
    </Tag>
  )
}

/** Titre de section avec hiérarchie visuelle cohérente */
export function SectionTitle({
  children,
  className,
  as: Tag = 'h2',
}: {
  children: React.ReactNode
  className?: string
  as?: 'h2' | 'h3'
}) {
  return (
    <Tag
      className={cn(
        'font-rubik font-bold text-foreground',
        Tag === 'h2' ? 'text-2xl md:text-3xl lg:text-4xl mb-4' : 'text-xl md:text-2xl mb-3',
        className
      )}
    >
      {children}
    </Tag>
  )
}
