'use client'

/*
  ContactForm — formulaire de contact ClikClak.
  Client component : gestion état, validation, compression image, envoi API.

  Compression image :
    FileReader → Image → Canvas (max 1600px) → canvas.toBlob(JPEG, 0.75)
    Pas de dépendance externe. EXIF supprimé via canvas.
*/

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import TurnstileWidget from '@/components/forms/TurnstileWidget'

const SITE_KEY_CONFIGURED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/* ── Types ──────────────────────────────────────────────────────────── */
type FormState = 'idle' | 'sending' | 'success' | 'error'

interface Fields {
  name:        string
  email:       string
  phone:       string
  deviceType:  string
  brand:       string
  model:       string
  requestType: string
  message:     string
  consent:     boolean
  _hp:         string
}

interface CompressedImage {
  base64:         string
  originalSize:   number
  compressedSize: number
  filename:       string
}

/* ── Constantes ─────────────────────────────────────────────────────── */
const MAX_FILE_BYTES = 10 * 1024 * 1024 // 10 Mo
const MAX_DIMENSION  = 1600
const JPEG_QUALITY   = 0.75

const INITIAL: Fields = {
  name:        '',
  email:       '',
  phone:       '',
  deviceType:  '',
  brand:       '',
  model:       '',
  requestType: '',
  message:     '',
  consent:     false,
  _hp:         '',
}

/* ── Helpers ────────────────────────────────────────────────────────── */
function fmtBytes(bytes: number): string {
  if (bytes < 1024)           return `${bytes} o`
  if (bytes < 1024 * 1024)    return `${(bytes / 1024).toFixed(0)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Le fichier doit être une image (JPG, PNG, WebP…).'))
      return
    }
    if (file.size > MAX_FILE_BYTES) {
      reject(new Error('Fichier trop lourd (max 10 Mo avant compression).'))
      return
    }

    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Lecture du fichier impossible.'))
    reader.onload  = (ev) => {
      const img  = new window.Image()
      img.onerror = () => reject(new Error('Décodage de l\'image impossible.'))
      img.onload  = () => {
        let { width, height } = img
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width >= height) {
            height = Math.round((height * MAX_DIMENSION) / width)
            width  = MAX_DIMENSION
          } else {
            width  = Math.round((width * MAX_DIMENSION) / height)
            height = MAX_DIMENSION
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width  = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) { reject(new Error('Canvas non disponible.')); return }
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compression échouée.')); return }
            const r2 = new FileReader()
            r2.onload = (e2) => resolve({
              base64:         e2.target?.result as string,
              originalSize:   file.size,
              compressedSize: blob.size,
              filename:       file.name,
            })
            r2.readAsDataURL(blob)
          },
          'image/jpeg',
          JPEG_QUALITY,
        )
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/* ── Styles partagés ────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width:           '100%',
  background:      'rgba(255,255,255,0.04)',
  border:          '1px solid rgba(242,242,242,0.13)',
  borderRadius:    8,
  padding:         '12px 16px',
  fontSize:        15,
  fontWeight:      300,
  color:           'rgba(242,242,242,0.9)',
  outline:         'none',
  appearance:      'none',
  WebkitAppearance: 'none',
}
const labelStyle: React.CSSProperties = {
  display:       'block',
  fontSize:      12,
  fontWeight:    300,
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color:         'rgba(242,242,242,0.4)',
  marginBottom:  8,
}
const errorStyle: React.CSSProperties = {
  fontSize:    12,
  fontWeight:  300,
  color:       'rgba(255,100,100,0.85)',
  marginTop:   6,
}

/* ── Composant ──────────────────────────────────────────────────────── */
export default function ContactForm() {
  const uid         = useId()
  const [fields, setFields] = useState<Fields>(INITIAL)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [state,  setState]  = useState<FormState>('idle')
  const [apiErr, setApiErr] = useState<string>('')

  const [image,      setImage]      = useState<CompressedImage | null>(null)
  const [imgPreview, setImgPreview] = useState<string>('')
  const [imgErr,     setImgErr]     = useState<string>('')
  const [imgLoading, setImgLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')

  const fileRef = useRef<HTMLInputElement>(null)

  /* ── Champ focus ring ── */
  const [focused, setFocused] = useState<string>('')
  const focusRing = (name: string): React.CSSProperties => focused === name
    ? { borderColor: 'rgba(204,255,51,0.55)', boxShadow: '0 0 0 2px rgba(204,255,51,0.1)' }
    : {}

  const setField = (name: keyof Fields, value: string | boolean) => {
    setFields(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n })
  }

  /* ── Upload image ── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImgErr('')
    setImgLoading(true)
    try {
      const compressed = await compressImage(file)
      setImage(compressed)
      setImgPreview(compressed.base64)
    } catch (err) {
      setImgErr(err instanceof Error ? err.message : 'Erreur lors du traitement de l\'image.')
    } finally {
      setImgLoading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const removeImage = () => {
    setImage(null)
    setImgPreview('')
    setImgErr('')
    if (fileRef.current) fileRef.current.value = ''
  }

  /* ── Validation ── */
  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (!fields.name.trim())    e.name    = 'Veuillez indiquer votre nom.'
    if (!fields.email.trim())   e.email   = 'Veuillez indiquer votre email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                e.email   = 'Email invalide.'
    if (!fields.message.trim()) e.message = 'Veuillez décrire votre demande.'
    if (!fields.consent)        e.consent   = 'Le consentement est obligatoire.'
    if (SITE_KEY_CONFIGURED && !turnstileToken) e.turnstile = 'Veuillez valider la protection anti-spam avant d\'envoyer le formulaire.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Envoi ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setState('sending')
    setApiErr('')

    try {
      const payload: Record<string, unknown> = {
        name:           fields.name.trim(),
        email:          fields.email.trim(),
        phone:          fields.phone.trim(),
        deviceType:     fields.deviceType,
        brand:          fields.brand,
        model:          fields.model.trim(),
        requestType:    fields.requestType,
        message:        fields.message.trim(),
        consent:        fields.consent,
        _hp:            fields._hp,
        turnstileToken,
      }
      if (image) {
        payload.imageBase64         = image.base64
        payload.imageFilename       = image.filename
        payload.imageOriginalSize   = image.originalSize
        payload.imageCompressedSize = image.compressedSize
      }

      const res = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })

      const json = await res.json()
      if (!res.ok) {
        setApiErr(json.error ?? 'Une erreur est survenue.')
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setApiErr('Erreur réseau. Vérifiez votre connexion.')
      setState('error')
    }
  }

  /* ── Succès ── */
  if (state === 'success') {
    return (
      <div
        className="flex flex-col gap-6 items-start p-8 rounded-xl"
        style={{ border: '1px solid rgba(204,255,51,0.25)', background: 'rgba(204,255,51,0.04)' }}
      >
        <span className="text-3xl" aria-hidden>✓</span>
        <div className="flex flex-col gap-2">
          <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>
            Votre demande a bien été envoyée.
          </p>
          <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
            ClikClak vous répondra dès que possible à l&apos;adresse <strong className="font-normal" style={{ color: '#ccff33' }}>{fields.email}</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setFields(INITIAL); setImage(null); setImgPreview(''); setState('idle') }}
          className="text-sm font-light underline underline-offset-4 focus-visible:outline-none"
          style={{ color: 'rgba(242,242,242,0.45)' }}
        >
          Envoyer une nouvelle demande
        </button>
      </div>
    )
  }

  const isSending = state === 'sending'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* ── Honeypot anti-spam (invisible) ── */}
      <div aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor={`${uid}-hp`}>Ne pas remplir</label>
        <input
          id={`${uid}-hp`}
          type="text"
          name="_hp"
          tabIndex={-1}
          autoComplete="off"
          value={fields._hp}
          onChange={e => setField('_hp', e.target.value)}
        />
      </div>

      {/* ── Bloc 1 : Identité ── */}
      <div
        className="flex flex-col gap-4 p-6 rounded-xl"
        style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
          Vos coordonnées
        </p>

        {/* Nom */}
        <div>
          <label htmlFor={`${uid}-name`} style={labelStyle}>
            Nom / prénom <span style={{ color: '#ccff33' }}>*</span>
          </label>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            placeholder="Votre nom"
            disabled={isSending}
            value={fields.name}
            onChange={e => setField('name', e.target.value)}
            onFocus={() => setFocused('name')}
            onBlur={() => setFocused('')}
            style={{ ...inputStyle, ...focusRing('name') }}
          />
          {errors.name && <p style={errorStyle}>{errors.name}</p>}
        </div>

        {/* Email + Téléphone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${uid}-email`} style={labelStyle}>
              Email <span style={{ color: '#ccff33' }}>*</span>
            </label>
            <input
              id={`${uid}-email`}
              type="email"
              autoComplete="email"
              placeholder="votre@email.com"
              disabled={isSending}
              value={fields.email}
              onChange={e => setField('email', e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused('')}
              style={{ ...inputStyle, ...focusRing('email') }}
            />
            {errors.email && <p style={errorStyle}>{errors.email}</p>}
          </div>
          <div>
            <label htmlFor={`${uid}-phone`} style={labelStyle}>
              Téléphone <span style={{ color: 'rgba(242,242,242,0.25)', fontSize: 11 }}>(optionnel)</span>
            </label>
            <input
              id={`${uid}-phone`}
              type="tel"
              autoComplete="tel"
              placeholder="021 XXX XX XX"
              disabled={isSending}
              value={fields.phone}
              onChange={e => setField('phone', e.target.value)}
              onFocus={() => setFocused('phone')}
              onBlur={() => setFocused('')}
              style={{ ...inputStyle, ...focusRing('phone') }}
            />
          </div>
        </div>
      </div>

      {/* ── Bloc 2 : Appareil ── */}
      <div
        className="flex flex-col gap-4 p-6 rounded-xl"
        style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
          Votre appareil
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label htmlFor={`${uid}-deviceType`} style={labelStyle}>
              Type d&apos;appareil
            </label>
            <select
              id={`${uid}-deviceType`}
              disabled={isSending}
              value={fields.deviceType}
              onChange={e => setField('deviceType', e.target.value)}
              onFocus={() => setFocused('deviceType')}
              onBlur={() => setFocused('')}
              style={{ ...inputStyle, ...focusRing('deviceType'), cursor: 'pointer' }}
            >
              <option value="">— Sélectionner —</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Tablette">Tablette</option>
              <option value="Ordinateur / MacBook">Ordinateur / MacBook</option>
              <option value="Récupération de données">Récupération de données</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          {/* Marque */}
          <div>
            <label htmlFor={`${uid}-brand`} style={labelStyle}>
              Marque
            </label>
            <select
              id={`${uid}-brand`}
              disabled={isSending}
              value={fields.brand}
              onChange={e => setField('brand', e.target.value)}
              onFocus={() => setFocused('brand')}
              onBlur={() => setFocused('')}
              style={{ ...inputStyle, ...focusRing('brand'), cursor: 'pointer' }}
            >
              <option value="">— Sélectionner —</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="OPPO">OPPO</option>
              <option value="Huawei">Huawei</option>
              <option value="Sony Xperia">Sony Xperia</option>
              <option value="Google Pixel">Google Pixel</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
        </div>

        {/* Modèle */}
        <div>
          <label htmlFor={`${uid}-model`} style={labelStyle}>
            Modèle
          </label>
          <input
            id={`${uid}-model`}
            type="text"
            placeholder='Ex : iPhone 16 Pro, Galaxy S25 Ultra, iPad Air 2, MacBook Pro 14"'
            disabled={isSending}
            value={fields.model}
            onChange={e => setField('model', e.target.value)}
            onFocus={() => setFocused('model')}
            onBlur={() => setFocused('')}
            style={{ ...inputStyle, ...focusRing('model') }}
          />
        </div>
      </div>

      {/* ── Bloc 3 : Demande ── */}
      <div
        className="flex flex-col gap-4 p-6 rounded-xl"
        style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
          Votre demande
        </p>

        {/* Type de demande */}
        <div>
          <label htmlFor={`${uid}-requestType`} style={labelStyle}>
            Type de demande
          </label>
          <select
            id={`${uid}-requestType`}
            disabled={isSending}
            value={fields.requestType}
            onChange={e => setField('requestType', e.target.value)}
            onFocus={() => setFocused('requestType')}
            onBlur={() => setFocused('')}
            style={{ ...inputStyle, ...focusRing('requestType'), cursor: 'pointer' }}
          >
            <option value="">— Sélectionner —</option>
            <option value="Réparation écran">Réparation écran</option>
            <option value="Changement de batterie">Changement de batterie</option>
            <option value="Connecteur de charge">Connecteur de charge</option>
            <option value="Dégâts d'eau / oxydation">Dégâts d&apos;eau / oxydation</option>
            <option value="Diagnostic">Diagnostic</option>
            <option value="Récupération de données">Récupération de données</option>
            <option value="Transfert de données">Transfert de données</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor={`${uid}-message`} style={labelStyle}>
            Message <span style={{ color: '#ccff33' }}>*</span>
          </label>
          <textarea
            id={`${uid}-message`}
            rows={5}
            placeholder="Décrivez la panne, depuis quand elle est apparue, et si l'appareil est tombé ou a été en contact avec un liquide."
            disabled={isSending}
            value={fields.message}
            onChange={e => setField('message', e.target.value)}
            onFocus={() => setFocused('message')}
            onBlur={() => setFocused('')}
            style={{ ...inputStyle, ...focusRing('message'), resize: 'vertical', minHeight: 120, lineHeight: 1.7 }}
          />
          {errors.message && <p style={errorStyle}>{errors.message}</p>}
        </div>
      </div>

      {/* ── Bloc 4 : Photo ── */}
      <div
        className="flex flex-col gap-4 p-6 rounded-xl"
        style={{ border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
            Photo de l&apos;appareil <span style={{ color: 'rgba(242,242,242,0.25)', textTransform: 'none', fontSize: 11, letterSpacing: 0 }}>(optionnel)</span>
          </p>
          <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
            Ajoutez une photo si cela peut aider au diagnostic. L&apos;image sera automatiquement réduite avant l&apos;envoi.
          </p>
        </div>

        {/* Prévisualisation */}
        {imgPreview && image && (
          <div className="flex flex-col gap-3">
            <div className="relative w-full max-w-sm rounded-lg overflow-hidden" style={{ border: '1px solid rgba(242,242,242,0.12)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgPreview} alt="Aperçu" className="w-full object-contain" style={{ maxHeight: 280 }} />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                {image.filename} — {fmtBytes(image.originalSize)} → <span style={{ color: 'rgba(204,255,51,0.7)' }}>{fmtBytes(image.compressedSize)}</span>
              </p>
              <button
                type="button"
                onClick={removeImage}
                className="text-xs font-light underline underline-offset-4 focus-visible:outline-none"
                style={{ color: 'rgba(242,242,242,0.4)' }}
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Upload */}
        {!imgPreview && (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              id={`${uid}-photo`}
              disabled={isSending || imgLoading}
              onChange={handleFile}
              className="sr-only"
            />
            <label
              htmlFor={`${uid}-photo`}
              className="inline-flex items-center gap-2 cursor-pointer select-none"
              style={{
                padding:      '10px 20px',
                border:       '1px dashed rgba(242,242,242,0.2)',
                borderRadius: 8,
                fontSize:     14,
                fontWeight:   300,
                color:        imgLoading ? 'rgba(242,242,242,0.3)' : 'rgba(242,242,242,0.6)',
                transition:   'border-color 200ms, color 200ms',
                cursor:       isSending ? 'not-allowed' : 'pointer',
              }}
            >
              {imgLoading ? 'Compression en cours…' : 'Choisir une image'}
            </label>
          </div>
        )}

        {imgErr && <p style={errorStyle}>{imgErr}</p>}
      </div>

      {/* ── Protection anti-spam Turnstile ── */}
      <TurnstileWidget onToken={t => { setTurnstileToken(t ?? ''); setErrors(p => { const n = { ...p }; delete n.turnstile; return n }) }} />
      {errors.turnstile && <p style={{ ...errorStyle, marginTop: -8 }}>{errors.turnstile}</p>}

      {/* ── Consentement ── */}
      <label className="flex items-start gap-3 cursor-pointer select-none group">
        <input
          type="checkbox"
          checked={fields.consent}
          disabled={isSending}
          onChange={e => setField('consent', e.target.checked)}
          className="mt-[3px] shrink-0 w-4 h-4 accent-[#ccff33] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff33]"
        />
        <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
          J&apos;accepte que ClikClak utilise ces informations pour répondre à ma demande, conformément à la{' '}
          <Link
            href="/politique-confidentialite"
            className="underline underline-offset-4 hover:text-foreground/80 transition-colors duration-200 focus-visible:outline-none"
            style={{ color: 'rgba(204,255,51,0.7)' }}
          >
            politique de confidentialité
          </Link>
          . <span style={{ color: '#ccff33' }}>*</span>
        </span>
      </label>
      {errors.consent && <p style={{ ...errorStyle, marginTop: -8 }}>{errors.consent}</p>}

      {/* ── Erreur API ── */}
      {state === 'error' && apiErr && (
        <div
          className="p-4 rounded-lg text-sm font-light leading-relaxed"
          style={{ border: '1px solid rgba(255,100,100,0.25)', background: 'rgba(255,100,100,0.05)', color: 'rgba(255,150,150,0.9)' }}
        >
          {apiErr}
          <span style={{ color: 'rgba(242,242,242,0.4)' }}>
            {' '}Vous pouvez aussi nous contacter directement par{' '}
            <a href="mailto:info@clikclak.ch" className="underline underline-offset-4" style={{ color: 'rgba(204,255,51,0.7)' }}>email</a>
            {' '}ou par téléphone.
          </span>
        </div>
      )}

      {/* ── Bouton envoi ── */}
      <div>
        <button
          type="submit"
          disabled={isSending}
          className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed shiny-cta shiny-cta-primary text-primary-foreground h-14 px-8 text-base"
        >
          {isSending ? 'Envoi en cours…' : 'Envoyer la demande'}
        </button>
      </div>

    </form>
  )
}
