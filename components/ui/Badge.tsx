import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'accent' | 'muted' | 'success' | 'danger' | 'outline'

type BadgeProps = {
  variant?:   BadgeVariant
  className?: string
  children:   React.ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-white/10  text-foreground',
  accent:   'bg-primary   text-primary-foreground',
  muted:    'bg-muted     text-muted-foreground',
  success:  'bg-success/20 text-success',
  danger:   'bg-danger/20  text-danger',
  outline:  'bg-transparent border border-border text-foreground/70',
}

/**
 * Badge — étiquette de statut ou de catégorie.
 * Angles légèrement arrondis (radius-badge = 4px), compact.
 */
export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1',
        'rounded-badge px-2 py-0.5',
        'text-xs font-medium leading-none whitespace-nowrap',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

/**
 * PriceBadge — version spécialisée pour l'affichage de prix.
 * Accent lime, texte anthracite.
 */
export function PriceBadge({
  price,
  currency = 'CHF',
  className,
}: {
  price: number | string
  currency?: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-baseline gap-1',
        'rounded-badge px-3 py-1',
        'bg-primary text-primary-foreground',
        'text-sm font-semibold tabular-nums',
        className
      )}
    >
      <span>dès</span>
      <span className="text-base font-bold">{price}</span>
      <span className="text-xs">{currency}</span>
    </span>
  )
}
