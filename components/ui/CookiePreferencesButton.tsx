'use client'

import { OPEN_PREFS_EVENT } from '@/lib/cookieConsent'

/*
  Bouton footer "Gestion des cookies" — émet l'événement DOM OPEN_PREFS_EVENT.
  CookieConsent écoute cet événement et rouvre les préférences.
  Style identique aux liens de navigation du footer.
*/
export default function CookiePreferencesButton({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const label = locale === 'en' ? 'Cookie settings' : 'Gestion des cookies'
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(OPEN_PREFS_EVENT))}
      className="inline-flex items-center gap-2 text-sm font-light text-foreground/70 hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
    >
      <span className="text-accent" aria-hidden>–</span>
      {label}
    </button>
  )
}
