import { cn } from '@/lib/utils'

type CardProps = {
  interactive?: boolean
  className?:   string
  children:     React.ReactNode
} & React.HTMLAttributes<HTMLDivElement>

/**
 * Card — fond sombre, bordure fine grise.
 * Avec interactive=true : applique l'effet hover lime centralisé (.interactive-card).
 * Utiliser ServiceCard pour les cartes navigables (liens).
 */
export function Card({
  interactive = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card bg-card text-card-foreground',
        'border border-[rgba(255,255,255,0.22)]',
        'p-6',
        interactive && 'interactive-card cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/** Sous-composant header optionnel */
export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

/** Sous-composant body optionnel */
export function CardBody({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-foreground/80 text-sm leading-relaxed', className)} {...props}>
      {children}
    </div>
  )
}
