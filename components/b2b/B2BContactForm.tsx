'use client'

import { useState, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import TurnstileWidget from '@/components/forms/TurnstileWidget'

type FormState = 'idle' | 'sending' | 'success' | 'error'

/* ── Styles ─────────────────────────────────────────────────────── */
const IS: React.CSSProperties = {
  width: '100%', background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(242,242,242,0.13)', borderRadius: 8,
  padding: '12px 16px', fontSize: 15, fontWeight: 300,
  color: 'rgba(242,242,242,0.9)', outline: 'none',
  appearance: 'none', WebkitAppearance: 'none',
}
const LS: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 300,
  textTransform: 'uppercase', letterSpacing: '0.1em',
  color: 'rgba(242,242,242,0.4)', marginBottom: 8,
}
const ES: React.CSSProperties = {
  fontSize: 12, fontWeight: 300, color: 'rgba(255,100,100,0.85)', marginTop: 6,
}

function trackEvent(name: string, params?: Record<string, string>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', name, params)
  }
}

type Props = { locale?: 'fr' | 'en' }

export default function B2BContactForm({ locale = 'fr' }: Props) {
  const isFr = locale === 'fr'
  const formId = useId()
  const hasStartedRef = useRef(false)

  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email,       setEmail]       = useState('')
  const [phone,       setPhone]       = useState('')
  const [message,     setMessage]     = useState('')
  const [consent,     setConsent]     = useState(false)
  const [tsToken,     setTsToken]     = useState<string | null>(null)
  const [formState,   setFormState]   = useState<FormState>('idle')
  const [errorMsg,    setErrorMsg]    = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleStart = useCallback(() => {
    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      trackEvent('b2b_form_start')
    }
  }, [])

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {}
    if (!firstName.trim()) errs.firstName = isFr ? 'Prénom requis.' : 'First name required.'
    if (!lastName.trim())  errs.lastName  = isFr ? 'Nom requis.' : 'Last name required.'
    if (!companyName.trim()) errs.companyName = isFr ? 'Entreprise requise.' : 'Company required.'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
      errs.email = isFr ? 'Email invalide.' : 'Invalid email.'
    if (!message.trim()) errs.message = isFr ? 'Message requis.' : 'Message required.'
    if (!consent) errs.consent = isFr ? 'Consentement requis.' : 'Consent required.'
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const errs = validate()
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return }
    setFieldErrors({})

    const SITE_KEY_CONFIGURED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (SITE_KEY_CONFIGURED && !tsToken) {
      setErrorMsg(isFr ? 'Validation anti-spam manquante.' : 'Anti-spam check required.')
      return
    }

    setFormState('sending')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          name: `${firstName} ${lastName}`,
          companyName,
          email,
          phone: phone || undefined,
          message,
          consent: true,
          serviceLabel: 'Contact B2B',
          _hp: '',
          turnstileToken: tsToken ?? undefined,
        }),
      })

      const json = await res.json() as { ok?: boolean; error?: string }

      if (!res.ok || !json.ok) {
        setFormState('error')
        setErrorMsg(json.error ?? (isFr ? "Erreur lors de l'envoi. Réessayez." : 'Send error. Please try again.'))
        trackEvent('b2b_form_submit', { success: 'false' })
        return
      }

      setFormState('success')
      trackEvent('b2b_form_submit', { success: 'true' })
    } catch {
      setFormState('error')
      setErrorMsg(isFr ? 'Erreur réseau. Réessayez.' : 'Network error. Please try again.')
      trackEvent('b2b_form_submit', { success: 'false' })
    }
  }

  if (formState === 'success') {
    return (
      <div
        className="rounded-xl p-8 flex flex-col gap-4 items-start"
        style={{ border: '1px solid rgba(204,255,51,0.3)', background: 'rgba(204,255,51,0.04)' }}
        role="alert"
      >
        <span className="text-2xl" aria-hidden>✓</span>
        <h3 className="text-lg font-light" style={{ color: '#ccff33' }}>
          {isFr ? 'Message envoyé' : 'Message sent'}
        </h3>
        <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.65)' }}>
          {isFr
            ? 'Nous avons bien reçu votre demande et vous répondrons dans les meilleurs délais.'
            : 'We have received your request and will get back to you as soon as possible.'}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label={isFr ? 'Formulaire contact B2B' : 'B2B contact form'}>
      <div className="flex flex-col gap-5">

        {/* Prénom + Nom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={`${formId}-fn`} style={LS}>
              {isFr ? 'Prénom' : 'First name'} <span aria-hidden style={{ color: '#ccff33' }}>*</span>
            </label>
            <input
              id={`${formId}-fn`}
              type="text"
              autoComplete="given-name"
              value={firstName}
              onChange={e => { setFirstName(e.target.value); handleStart() }}
              style={IS}
              aria-required
              aria-invalid={!!fieldErrors.firstName}
              aria-describedby={fieldErrors.firstName ? `${formId}-fn-err` : undefined}
            />
            {fieldErrors.firstName && (
              <p id={`${formId}-fn-err`} style={ES} role="alert">{fieldErrors.firstName}</p>
            )}
          </div>
          <div>
            <label htmlFor={`${formId}-ln`} style={LS}>
              {isFr ? 'Nom' : 'Last name'} <span aria-hidden style={{ color: '#ccff33' }}>*</span>
            </label>
            <input
              id={`${formId}-ln`}
              type="text"
              autoComplete="family-name"
              value={lastName}
              onChange={e => { setLastName(e.target.value); handleStart() }}
              style={IS}
              aria-required
              aria-invalid={!!fieldErrors.lastName}
              aria-describedby={fieldErrors.lastName ? `${formId}-ln-err` : undefined}
            />
            {fieldErrors.lastName && (
              <p id={`${formId}-ln-err`} style={ES} role="alert">{fieldErrors.lastName}</p>
            )}
          </div>
        </div>

        {/* Entreprise */}
        <div>
          <label htmlFor={`${formId}-co`} style={LS}>
            {isFr ? 'Entreprise' : 'Company'} <span aria-hidden style={{ color: '#ccff33' }}>*</span>
          </label>
          <input
            id={`${formId}-co`}
            type="text"
            autoComplete="organization"
            value={companyName}
            onChange={e => { setCompanyName(e.target.value); handleStart() }}
            style={IS}
            aria-required
            aria-invalid={!!fieldErrors.companyName}
            aria-describedby={fieldErrors.companyName ? `${formId}-co-err` : undefined}
          />
          {fieldErrors.companyName && (
            <p id={`${formId}-co-err`} style={ES} role="alert">{fieldErrors.companyName}</p>
          )}
        </div>

        {/* Email + Téléphone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label htmlFor={`${formId}-em`} style={LS}>
              {isFr ? 'Email professionnel' : 'Professional email'} <span aria-hidden style={{ color: '#ccff33' }}>*</span>
            </label>
            <input
              id={`${formId}-em`}
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => { setEmail(e.target.value); handleStart() }}
              style={IS}
              aria-required
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? `${formId}-em-err` : undefined}
            />
            {fieldErrors.email && (
              <p id={`${formId}-em-err`} style={ES} role="alert">{fieldErrors.email}</p>
            )}
          </div>
          <div>
            <label htmlFor={`${formId}-ph`} style={LS}>
              {isFr ? 'Téléphone' : 'Phone'}
            </label>
            <input
              id={`${formId}-ph`}
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); handleStart() }}
              style={IS}
            />
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor={`${formId}-msg`} style={LS}>
            {isFr ? 'Description du besoin' : 'Describe your needs'} <span aria-hidden style={{ color: '#ccff33' }}>*</span>
          </label>
          <textarea
            id={`${formId}-msg`}
            rows={5}
            value={message}
            onChange={e => { setMessage(e.target.value); handleStart() }}
            placeholder={isFr
              ? "Type d'appareil(s), nombre, nature de la panne ou du projet…"
              : 'Device type(s), quantity, nature of the issue or project…'}
            style={{ ...IS, resize: 'vertical', minHeight: 120 }}
            aria-required
            aria-invalid={!!fieldErrors.message}
            aria-describedby={fieldErrors.message ? `${formId}-msg-err` : undefined}
          />
          {fieldErrors.message && (
            <p id={`${formId}-msg-err`} style={ES} role="alert">{fieldErrors.message}</p>
          )}
        </div>

        {/* Honeypot — hidden from humans */}
        <input
          type="text"
          name="_hp"
          aria-hidden
          tabIndex={-1}
          autoComplete="off"
          style={{ display: 'none' }}
        />

        {/* Turnstile */}
        <TurnstileWidget onToken={setTsToken} locale={locale} />

        {/* Consentement */}
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consent}
            onChange={e => setConsent(e.target.checked)}
            aria-required
            aria-invalid={!!fieldErrors.consent}
            style={{ marginTop: 3, accentColor: '#ccff33', flexShrink: 0 }}
          />
          <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
            {isFr
              ? <>J&apos;accepte que ClikClak utilise ces informations pour traiter ma demande. Voir la{' '}
                  <Link href="/politique-confidentialite" className="underline hover:text-accent transition-colors" style={{ color: 'rgba(242,242,242,0.7)' }}>
                    politique de confidentialité
                  </Link>.</>
              : <>I agree that ClikClak uses this information to process my request. See our{' '}
                  <Link href="/en/privacy-policy" className="underline hover:text-accent transition-colors" style={{ color: 'rgba(242,242,242,0.7)' }}>
                    privacy policy
                  </Link>.</>}
          </span>
        </label>
        {fieldErrors.consent && (
          <p style={ES} role="alert">{fieldErrors.consent}</p>
        )}

        {/* Erreur globale */}
        {formState === 'error' && errorMsg && (
          <p style={{ ...ES, marginTop: 0 }} role="alert">{errorMsg}</p>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={formState === 'sending'}
          className="self-start px-8 py-3 rounded-lg text-sm font-medium transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          style={{
            background: '#ccff33',
            color: '#191919',
            opacity: formState === 'sending' ? 0.6 : 1,
            cursor: formState === 'sending' ? 'wait' : 'pointer',
          }}
        >
          {formState === 'sending'
            ? (isFr ? 'Envoi en cours…' : 'Sending…')
            : (isFr ? 'Envoyer la demande' : 'Send request')}
        </button>

      </div>
    </form>
  )
}
