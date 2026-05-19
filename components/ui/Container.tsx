import { cn } from '@/lib/utils'

type ContainerProps = {
  className?: string
  children:   React.ReactNode
  narrow?:    boolean
} & React.HTMLAttributes<HTMLDivElement>

/**
 * Container — largeur contrôlée, centré, responsive.
 * narrow=true pour les contenus textuels resserrés (articles, formulaires).
 */
export function Container({
  className,
  children,
  narrow = false,
  ...props
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        narrow ? 'max-w-3xl' : 'max-w-6xl',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
