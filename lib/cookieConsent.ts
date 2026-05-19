/*
  lib/cookieConsent.ts — helpers consentement cookies ClikClak.

  Clé de stockage : CONSENT_KEY  (localStorage)
  Format : ConsentChoice (JSON)

  Mise à jour : incrémenter CONSENT_KEY (ex: v2) force un nouveau consentement.
*/

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?:      (...args: unknown[]) => void
  }
}

export const CONSENT_KEY = 'clikclak-cookie-consent-v1'

export type ConsentChoice = {
  analytics:  boolean  // Google Analytics  → analytics_storage
  marketing:  boolean  // Google Ads        → ad_storage / ad_user_data / ad_personalization
  timestamp:  number
}

/* ── Lecture ──────────────────────────────────────────────────────────────── */
export function readConsentChoice(): ConsentChoice | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    return raw ? (JSON.parse(raw) as ConsentChoice) : null
  } catch {
    return null
  }
}

/* ── Écriture ─────────────────────────────────────────────────────────────── */
export function saveConsentChoice(analytics: boolean, marketing: boolean): ConsentChoice {
  const choice: ConsentChoice = { analytics, marketing, timestamp: Date.now() }
  localStorage.setItem(CONSENT_KEY, JSON.stringify(choice))
  return choice
}

/* ── Application à gtag (consent update) ─────────────────────────────────── */
export function applyConsent(choice: ConsentChoice): void {
  if (typeof window === 'undefined') return
  if (typeof window.gtag !== 'function') return
  window.gtag('consent', 'update', {
    analytics_storage:  choice.analytics ? 'granted' : 'denied',
    ad_storage:         choice.marketing ? 'granted' : 'denied',
    ad_user_data:       choice.marketing ? 'granted' : 'denied',
    ad_personalization: choice.marketing ? 'granted' : 'denied',
  })
}

/* ── Événement DOM pour rouvrir les préférences ───────────────────────────── */
export const OPEN_PREFS_EVENT = 'clikclak:open-preferences'
