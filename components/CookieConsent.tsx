'use client'

/*
  CookieConsent — bannière cookies + panneau préférences.

  États :
    null          → pas encore monté / choix déjà enregistré (rien affiché)
    'banner'      → bannière compacte en bas de page
    'preferences' → panneau préférences détaillé

  Stockage : localStorage (CONSENT_KEY)
  Transition : CSS translateY 0 ↔ 100% + opacity — pas de GSAP (indépendant du contenu page)

  Rouvrir les préférences : émettre l'événement DOM OPEN_PREFS_EVENT depuis n'importe où.
*/

import { useState, useEffect } from 'react'
import {
  readConsentChoice,
  saveConsentChoice,
  applyConsent,
  OPEN_PREFS_EVENT,
} from '@/lib/cookieConsent'

type View = null | 'banner' | 'preferences'

const STRINGS = {
  fr: {
    bannerAriaLabel:     'Bannière cookies',
    prefsAriaLabel:      'Préférences cookies',
    bannerText:          'Nous utilisons des cookies pour mesurer l\'audience, améliorer le site et, avec votre accord, personnaliser nos campagnes publicitaires.',
    decline:             'Refuser',
    customise:           'Personnaliser',
    acceptAll:           'Tout accepter',
    prefsTitle:          'Préférences cookies',
    closeAriaLabel:      'Fermer',
    necessary:           'Nécessaires',
    necessaryDesc:       'Indispensables au fonctionnement du site. Toujours actifs.',
    alwaysActive:        'Toujours actif',
    statistics:          'Statistiques',
    statisticsDesc:      'Mesure d\'audience via Google Analytics. Permet d\'améliorer le site.',
    marketing:           'Marketing',
    marketingDesc:       'Suivi de conversions et publicités personnalisées via Google Ads.',
    declineAll:          'Tout refuser',
    save:                'Sauvegarder',
    footerNote:          'Vos préférences sont enregistrées localement et peuvent être modifiées à tout moment via le lien « Gestion des cookies » en bas de page.',
  },
  en: {
    bannerAriaLabel:     'Cookie banner',
    prefsAriaLabel:      'Cookie preferences',
    bannerText:          'We use cookies to measure audience, improve the site and, with your consent, personalise our advertising campaigns.',
    decline:             'Decline',
    customise:           'Customise',
    acceptAll:           'Accept all',
    prefsTitle:          'Cookie preferences',
    closeAriaLabel:      'Close',
    necessary:           'Necessary',
    necessaryDesc:       'Essential for the site to work. Always active.',
    alwaysActive:        'Always active',
    statistics:          'Statistics',
    statisticsDesc:      'Audience measurement via Google Analytics. Helps improve the site.',
    marketing:           'Marketing',
    marketingDesc:       'Conversion tracking and personalised ads via Google Ads.',
    declineAll:          'Decline all',
    save:                'Save preferences',
    footerNote:          'Your preferences are saved locally and can be changed at any time via the \'Cookie settings\' link at the bottom of the page.',
  },
}

export default function CookieConsent({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const S = STRINGS[locale]
  const [view,      setView]      = useState<View>(null)
  const [visible,   setVisible]   = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  /* Déclenche la transition après que le DOM est prêt */
  useEffect(() => {
    if (view === null) return
    const t = setTimeout(() => setVisible(true), 30)
    return () => clearTimeout(t)
  }, [view])

  /* Mount : lecture localStorage + écoute événement */
  useEffect(() => {
    const openPrefs = () => {
      const stored = readConsentChoice()
      setAnalytics(stored?.analytics ?? true)
      setMarketing(stored?.marketing ?? true)
      setVisible(false)
      setTimeout(() => {
        setView('preferences')
      }, view !== null ? 250 : 0)
    }
    window.addEventListener(OPEN_PREFS_EVENT, openPrefs)

    const choice = readConsentChoice()
    if (choice) {
      applyConsent(choice)
    } else {
      /* Délai : ne pas envahir le chargement initial */
      const t = setTimeout(() => setView('banner'), 900)
      return () => {
        clearTimeout(t)
        window.removeEventListener(OPEN_PREFS_EVENT, openPrefs)
      }
    }

    return () => window.removeEventListener(OPEN_PREFS_EVENT, openPrefs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function dismiss() {
    setVisible(false)
    setTimeout(() => { setView(null) }, 350)
  }

  function acceptAll() {
    const choice = saveConsentChoice(true, true)
    applyConsent(choice)
    dismiss()
  }

  function rejectAll() {
    const choice = saveConsentChoice(false, false)
    applyConsent(choice)
    dismiss()
  }

  function saveCustom() {
    const choice = saveConsentChoice(analytics, marketing)
    applyConsent(choice)
    dismiss()
  }

  if (view === null) return null

  return (
    <div
      role="dialog"
      aria-label={view === 'banner' ? S.bannerAriaLabel : S.prefsAriaLabel}
      aria-modal="false"
      style={{
        position:   'fixed',
        bottom:     0,
        left:       0,
        right:      0,
        zIndex:     200,
        transform:  visible ? 'translateY(0)' : 'translateY(110%)',
        opacity:    visible ? 1 : 0,
        transition: 'transform 350ms cubic-bezier(0.25,1,0.5,1), opacity 280ms ease',
      }}
    >

      {/* ── Bannière ──────────────────────────────────────────────── */}
      {view === 'banner' && (
        <div style={{ backgroundColor: '#141414', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="w-full max-w-6xl mx-auto px-5 py-4 md:py-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-10">
            <p
              className="text-sm font-light flex-1 leading-relaxed"
              style={{ color: 'rgba(242,242,242,0.65)' }}
            >
              {S.bannerText}
            </p>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <BannerBtn variant="ghost"  onClick={rejectAll}>{S.decline}</BannerBtn>
              <BannerBtn
                variant="outline"
                onClick={() => {
                  setVisible(false)
                  setTimeout(() => setView('preferences'), 200)
                }}
              >
                {S.customise}
              </BannerBtn>
              <BannerBtn variant="primary" onClick={acceptAll}>{S.acceptAll}</BannerBtn>
            </div>
          </div>
        </div>
      )}

      {/* ── Panneau préférences ────────────────────────────────────── */}
      {view === 'preferences' && (
        <div
          style={{
            backgroundColor: '#141414',
            borderTop:       '1px solid rgba(255,255,255,0.1)',
            maxHeight:       '80dvh',
            overflowY:       'auto',
          }}
        >
          <div className="w-full max-w-lg mx-auto px-5 py-6 flex flex-col gap-5">

            {/* En-tête */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-light" style={{ color: 'rgba(242,242,242,0.92)' }}>
                {S.prefsTitle}
              </h2>
              <button
                type="button"
                onClick={dismiss}
                aria-label={S.closeAriaLabel}
                className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded"
                style={{ color: 'rgba(242,242,242,0.35)', fontSize: 18, lineHeight: 1, padding: '2px 4px' }}
              >
                ✕
              </button>
            </div>

            {/* Ligne séparateur */}
            <hr style={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Catégories */}
            <ConsentRow
              label={S.necessary}
              description={S.necessaryDesc}
              alwaysActiveLabel={S.alwaysActive}
              value={true}
              disabled
            />
            <ConsentRow
              label={S.statistics}
              description={S.statisticsDesc}
              alwaysActiveLabel={S.alwaysActive}
              value={analytics}
              onChange={setAnalytics}
            />
            <ConsentRow
              label={S.marketing}
              description={S.marketingDesc}
              alwaysActiveLabel={S.alwaysActive}
              value={marketing}
              onChange={setMarketing}
            />

            {/* Actions */}
            <div className="flex flex-wrap gap-2.5 justify-end pt-1">
              <BannerBtn variant="ghost"   onClick={rejectAll}>{S.declineAll}</BannerBtn>
              <BannerBtn variant="primary" onClick={saveCustom}>{S.save}</BannerBtn>
            </div>

            <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.3)', lineHeight: 1.5 }}>
              {S.footerNote}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Bouton bannière ──────────────────────────────────────────────────────── */
function BannerBtn({
  variant,
  onClick,
  children,
}: {
  variant:  'ghost' | 'outline' | 'primary'
  onClick:  () => void
  children: React.ReactNode
}) {
  const base = 'text-xs font-light px-4 py-2 rounded-lg transition-opacity duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent'
  const styles: React.CSSProperties =
    variant === 'primary'
      ? { color: '#191919', backgroundColor: '#ccff33' }
      : variant === 'outline'
      ? { color: 'rgba(242,242,242,0.75)', border: '1px solid rgba(255,255,255,0.18)' }
      : { color: 'rgba(242,242,242,0.45)', border: '1px solid rgba(255,255,255,0.08)' }

  return (
    <button type="button" onClick={onClick} className={base} style={styles}>
      {children}
    </button>
  )
}

/* ── Ligne consentement ──────────────────────────────────────────────────── */
function ConsentRow({
  label,
  description,
  alwaysActiveLabel,
  value,
  onChange,
  disabled,
}: {
  label:             string
  description:       string
  alwaysActiveLabel: string
  value:             boolean
  onChange?:         (v: boolean) => void
  disabled?:         boolean
}) {
  return (
    <div
      className="flex items-start justify-between gap-6 py-3"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.85)' }}>
          {label}
          {disabled && (
            <span
              className="ml-2 text-xs"
              style={{ color: 'rgba(242,242,242,0.35)' }}
            >
              {alwaysActiveLabel}
            </span>
          )}
        </span>
        <span className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.4)' }}>
          {description}
        </span>
      </div>
      <Toggle value={value} onChange={onChange} disabled={disabled} />
    </div>
  )
}

/* ── Toggle switch ───────────────────────────────────────────────────────── */
function Toggle({
  value,
  onChange,
  disabled,
}: {
  value:     boolean
  onChange?: (v: boolean) => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={() => onChange?.(!value)}
      className="focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-xl"
      style={{
        flexShrink:      0,
        width:           40,
        height:          22,
        borderRadius:    11,
        backgroundColor: value ? '#ccff33' : 'rgba(255,255,255,0.15)',
        border:          'none',
        position:        'relative',
        cursor:          disabled ? 'not-allowed' : 'pointer',
        transition:      'background-color 200ms ease',
        opacity:         disabled ? 0.55 : 1,
      }}
    >
      <span
        style={{
          position:        'absolute',
          top:             3,
          left:            value ? 21 : 3,
          width:           16,
          height:          16,
          borderRadius:    8,
          backgroundColor: value ? '#191919' : 'rgba(255,255,255,0.55)',
          transition:      'left 200ms ease',
          pointerEvents:   'none',
        }}
      />
    </button>
  )
}
