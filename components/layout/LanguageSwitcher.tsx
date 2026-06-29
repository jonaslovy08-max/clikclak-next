'use client'
/*
  LanguageSwitcher — sélecteur FR | EN
  Accessible, sans drapeau, sans menu déroulant.
  Utilise getAlternatePath (i18n/routes.ts) pour trouver l'URL équivalente dans l'autre locale.
*/

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { getAlternatePath } from '@/i18n/routes'

interface Props {
  /** Locale courante de la page */
  locale: 'fr' | 'en'
  /** Classes CSS supplémentaires */
  className?: string
}

export default function LanguageSwitcher({ locale, className = '' }: Props) {
  const pathname    = usePathname()
  const otherLocale = locale === 'fr' ? 'en' : 'fr'
  const otherUrl    = getAlternatePath(pathname, otherLocale)

  return (
    <div
      className={`flex items-center gap-0 text-sm font-medium ${className}`}
      aria-label="Sélecteur de langue"
    >
      {/* FR */}
      {locale === 'fr' ? (
        <span
          className="text-accent"
          aria-current="true"
          aria-label="Français — langue active"
        >
          FR
        </span>
      ) : (
        <Link
          href={otherUrl}
          aria-label="Passer en français"
          className="text-foreground/50 hover:text-foreground transition-colors"
        >
          FR
        </Link>
      )}

      <span className="mx-1.5 text-foreground/25" aria-hidden>|</span>

      {/* EN */}
      {locale === 'en' ? (
        <span
          className="text-accent"
          aria-current="true"
          aria-label="English — active language"
        >
          EN
        </span>
      ) : (
        <Link
          href={otherUrl}
          aria-label="Switch to English"
          className="text-foreground/50 hover:text-foreground transition-colors"
        >
          EN
        </Link>
      )}
    </div>
  )
}
