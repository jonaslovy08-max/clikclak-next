import Link from 'next/link'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize    = 'sm' | 'md' | 'lg'

type ButtonProps = {
  variant?:    ButtonVariant
  size?:       ButtonSize
  href?:       string
  className?:  string
  children:    React.ReactNode
  disabled?:   boolean
  type?:       'button' | 'submit' | 'reset'
  onClick?:    () => void
  'aria-label'?: string
  external?:   boolean
}

const base = [
  'inline-flex items-center justify-center gap-2',
  'font-rubik font-medium leading-none whitespace-nowrap',
  'rounded-btn',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none',
].join(' ')

const variants: Record<ButtonVariant, string> = {
  primary: [
    'shiny-cta shiny-cta-primary',
    'text-primary-foreground',
  ].join(' '),

  secondary: [
    'shiny-cta shiny-cta-secondary',
    'text-accent',
  ].join(' '),

  ghost: [
    'bg-transparent text-foreground/70 border border-transparent',
    'transition-interactive duration-220 ease-out',
    'hover:text-foreground hover:bg-white/5',
    'active:scale-[0.98]',
  ].join(' '),
}

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9  px-4  text-sm',
  md: 'h-11 px-6  text-base',
  lg: 'h-14 px-8  text-lg min-w-[180px]',
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  className,
  children,
  disabled,
  type = 'button',
  onClick,
  external,
  ...rest
}: ButtonProps) {
  const classes = cn(base, variants[variant], sizes[size], className)

  if (href) {
    /* Les ancres (#section) n'ont pas besoin du router Next.js.
       Un <a> natif permet à SmoothAnchorLinks d'intercepter le clic
       avant tout comportement router et de déclencher le scroll smooth. */
    if (href.startsWith('#')) {
      return (
        <a href={href} className={classes} aria-label={rest['aria-label']}>
          <span className="inline-flex items-center gap-2">{children}</span>
        </a>
      )
    }
    return (
      <Link
        href={href}
        className={classes}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        aria-label={rest['aria-label']}
      >
        <span className="inline-flex items-center gap-2">{children}</span>
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      aria-label={rest['aria-label']}
    >
      <span className="inline-flex items-center gap-2">{children}</span>
    </button>
  )
}
