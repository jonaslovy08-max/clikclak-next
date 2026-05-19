import Link from 'next/link'
import { cn } from '@/lib/utils'

type ServiceCardProps = {
  icon?:       React.ReactNode
  label:       string
  href:        string
  description?: string
  badge?:      React.ReactNode
  className?:  string
}

/**
 * ServiceCard — carte de service navigable.
 *
 * Design :
 *   Normal  → fond #191919, bordure rgba(255,255,255,0.22)
 *   Hover   → bordure #ccff33, lueur externe rgba(204,255,51,0.28), translateY(-2px)
 *   Focus   → ring accent #ccff33
 *
 * L'effet hover est centralisé via la classe CSS .interactive-card (globals.css).
 * Ne pas dupliquer cet effet dans d'autres composants — réutiliser .interactive-card.
 */
export function ServiceCard({
  icon,
  label,
  href,
  description,
  badge,
  className,
}: ServiceCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        // Layout
        'group relative flex flex-col items-center justify-center gap-3 p-6',
        // Couleurs
        'bg-card text-card-foreground',
        // Bordure (état normal)
        'border border-[rgba(255,255,255,0.22)]',
        // Angles
        'rounded-card',
        // Hover/focus centralisé (ne pas répliquer ici)
        'interactive-card',
        // Taille minimale tactile (WCAG 2.5.5 — 44px minimum)
        'min-h-[80px]',
        className
      )}
    >
      {/* Pictogramme filaire */}
      {icon && (
        <span
          className="text-foreground/60 group-hover:text-accent transition-colors duration-220"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}

      {/* Label */}
      <span className="text-sm font-medium text-center leading-tight text-foreground">
        {label}
      </span>

      {/* Description optionnelle */}
      {description && (
        <span className="text-xs text-muted-foreground text-center leading-snug">
          {description}
        </span>
      )}

      {/* Badge optionnel (ex: "Nouveau", prix, "Express") */}
      {badge && (
        <span className="absolute top-2 right-2">{badge}</span>
      )}
    </Link>
  )
}
