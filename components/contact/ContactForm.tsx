'use client'

/*
  ContactForm — formulaire de contact ClikClak.
  Client component : gestion état, validation, compression image, envoi API.
  Supporte FR et EN via la prop locale.
*/

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import TurnstileWidget from '@/components/forms/TurnstileWidget'

/* ── Traductions ─────────────────────────────────────────────────────── */
const TRANSLATIONS = {
  fr: {
    success_title:    'Votre demande a bien été envoyée.',
    success_reply:    'ClikClak vous répondra dès que possible à l\'adresse',
    send_again:       'Envoyer une nouvelle demande',
    section_identity: 'Vos coordonnées',
    label_name:       'Nom / prénom',
    ph_name:          'Votre nom',
    label_phone:      'Téléphone',
    section_device:   'Votre appareil',
    label_device_type:'Type d\'appareil',
    select_default:   '— Sélectionner —',
    opt_tablet:       'Tablette',
    opt_data:         'Récupération de données',
    opt_other:        'Autre',
    label_brand:      'Marque',
    label_model:      'Modèle',
    ph_model:         'Ex : iPhone 16 Pro, Galaxy S25 Ultra, iPad Air 2, MacBook Pro 14"',
    section_request:  'Votre demande',
    label_req_type:   'Type de demande',
    opt_screen:       'Réparation écran',
    opt_battery:      'Changement de batterie',
    opt_charging:     'Connecteur de charge',
    opt_water:        'Dégâts d\'eau / oxydation',
    opt_diagnostic:   'Diagnostic',
    opt_data_rec:     'Récupération de données',
    opt_data_transfer:'Transfert de données',
    label_message:    'Message',
    ph_message:       'Décrivez la panne, depuis quand elle est apparue, et si l\'appareil est tombé ou a été en contact avec un liquide.',
    section_photo:    'Photo de l\'appareil',
    photo_optional:   '(optionnel)',
    photo_hint:       'Ajoutez une photo si cela peut aider au diagnostic. L\'image sera automatiquement réduite avant l\'envoi.',
    photo_remove:     'Supprimer',
    photo_loading:    'Compression en cours…',
    photo_choose:     'Choisir une image',
    consent_text:     'J\'accepte que ClikClak utilise ces informations pour répondre à ma demande, conformément à la',
    consent_link:     'politique de confidentialité',
    consent_link_href:'/politique-confidentialite',
    sending:          'Envoi en cours…',
    submit:           'Envoyer la demande',
    err_name:         'Veuillez indiquer votre nom.',
    err_email_req:    'Veuillez indiquer votre email.',
    err_email_invalid:'Email invalide.',
    err_message:      'Veuillez décrire votre demande.',
    err_consent:      'Le consentement est obligatoire.',
    err_turnstile:    'Veuillez valider la protection anti-spam avant d\'envoyer le formulaire.',
    err_generic:      'Une erreur est survenue.',
    err_network:      'Erreur réseau. Vérifiez votre connexion.',
    err_contact:      'Vous pouvez aussi nous contacter directement par',
    err_contact_email:'email',
    err_contact_phone:'ou par téléphone.',
  },
  en: {
    success_title:    'Your request has been sent successfully.',
    success_reply:    'ClikClak will reply as soon as possible to',
    send_again:       'Send another request',
    section_identity: 'Your details',
    label_name:       'Name',
    ph_name:          'Your name',
    label_phone:      'Phone',
    section_device:   'Your device',
    label_device_type:'Device type',
    select_default:   '— Select —',
    opt_tablet:       'Tablet',
    opt_data:         'Data recovery',
    opt_other:        'Other',
    label_brand:      'Brand',
    label_model:      'Model',
    ph_model:         'E.g.: iPhone 16 Pro, Galaxy S25 Ultra, iPad Air 2, MacBook Pro 14"',
    section_request:  'Your request',
    label_req_type:   'Request type',
    opt_screen:       'Screen repair',
    opt_battery:      'Battery replacement',
    opt_charging:     'Charging port repair',
    opt_water:        'Water damage / oxidation',
    opt_diagnostic:   'Diagnostic',
    opt_data_rec:     'Data recovery',
    opt_data_transfer:'Data transfer',
    label_message:    'Message',
    ph_message:       'Describe the issue, when it started, and whether the device was dropped or exposed to liquid.',
    section_photo:    'Device photo',
    photo_optional:   '(optional)',
    photo_hint:       'Add a photo if it can help with the diagnostic. The image will be automatically compressed before sending.',
    photo_remove:     'Remove',
    photo_loading:    'Compressing…',
    photo_choose:     'Choose an image',
    consent_text:     'I agree that ClikClak may use this information to respond to my request, in accordance with the',
    consent_link:     'privacy policy',
    consent_link_href:'/en/privacy-policy',
    sending:          'Sending…',
    submit:           'Send request',
    err_name:         'Please enter your name.',
    err_email_req:    'Please enter your email.',
    err_email_invalid:'Invalid email address.',
    err_message:      'Please describe your request.',
    err_consent:      'Consent is required.',
    err_turnstile:    'Please complete the anti-spam verification before sending.',
    err_generic:      'An error occurred.',
    err_network:      'Network error. Please check your connection.',
    err_contact:      'You can also contact us directly by',
    err_contact_email:'email',
    err_contact_phone:'or by phone.',
  },
} as const

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
export default function ContactForm({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T = TRANSLATIONS[locale]
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
    if (!fields.name.trim())    e.name    = T.err_name
    if (!fields.email.trim())   e.email   = T.err_email_req
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                e.email   = T.err_email_invalid
    if (!fields.message.trim()) e.message = T.err_message
    if (!fields.consent)        e.consent   = T.err_consent
    if (SITE_KEY_CONFIGURED && !turnstileToken) e.turnstile = T.err_turnstile
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
        locale,          // langue du client → transmise au serveur
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
        setApiErr(json.error ?? T.err_generic)
        setState('error')
      } else {
        setState('success')
      }
    } catch {
      setApiErr(T.err_network)
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
            {T.success_title}
          </p>
          <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
            {T.success_reply} <strong className="font-normal" style={{ color: '#ccff33' }}>{fields.email}</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setFields(INITIAL); setImage(null); setImgPreview(''); setState('idle') }}
          className="text-sm font-light underline underline-offset-4 focus-visible:outline-none"
          style={{ color: 'rgba(242,242,242,0.45)' }}
        >
          {T.send_again}
        </button>
      </div>
    )
  }

  const isSending = state === 'sending'

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

      {/* Honeypot anti-spam — ne jamais remplir */}
      <div aria-hidden style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, overflow: 'hidden' }}>
        <input
          type="text"
          name="org_url"
          tabIndex={-1}
          autoComplete="nope"
          aria-hidden="true"
          data-1p-ignore="true"
          data-lpignore="true"
          data-form-type="other"
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
          {T.section_identity}
        </p>

        {/* Nom */}
        <div>
          <label htmlFor={`${uid}-name`} style={labelStyle}>
            {T.label_name} <span style={{ color: '#ccff33' }}>*</span>
          </label>
          <input
            id={`${uid}-name`}
            type="text"
            autoComplete="name"
            placeholder={T.ph_name}
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
              {T.label_phone} <span style={{ color: 'rgba(242,242,242,0.25)', fontSize: 11 }}>{T.photo_optional}</span>
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
          {T.section_device}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Type */}
          <div>
            <label htmlFor={`${uid}-deviceType`} style={labelStyle}>
              {T.label_device_type}
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
              <option value="">{T.select_default}</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Tablette">{T.opt_tablet}</option>
              <option value="Ordinateur / MacBook">Ordinateur / MacBook</option>
              <option value="Récupération de données">{T.opt_data}</option>
              <option value="Autre">{T.opt_other}</option>
            </select>
          </div>

          {/* Marque */}
          <div>
            <label htmlFor={`${uid}-brand`} style={labelStyle}>
              {T.label_brand}
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
              <option value="">{T.select_default}</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="OPPO">OPPO</option>
              <option value="Huawei">Huawei</option>
              <option value="Sony Xperia">Sony Xperia</option>
              <option value="Google Pixel">Google Pixel</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Autre">{T.opt_other}</option>
            </select>
          </div>
        </div>

        {/* Modèle */}
        <div>
          <label htmlFor={`${uid}-model`} style={labelStyle}>
            {T.label_model}
          </label>
          <input
            id={`${uid}-model`}
            type="text"
            placeholder={T.ph_model}
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
          {T.section_request}
        </p>

        {/* Type de demande */}
        <div>
          <label htmlFor={`${uid}-requestType`} style={labelStyle}>
            {T.label_req_type}
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
            <option value="">{T.select_default}</option>
            <option value="Réparation écran">{T.opt_screen}</option>
            <option value="Changement de batterie">{T.opt_battery}</option>
            <option value="Connecteur de charge">{T.opt_charging}</option>
            <option value="Dégâts d'eau / oxydation">{T.opt_water}</option>
            <option value="Diagnostic">{T.opt_diagnostic}</option>
            <option value="Récupération de données">{T.opt_data_rec}</option>
            <option value="Transfert de données">{T.opt_data_transfer}</option>
            <option value="Autre">{T.opt_other}</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor={`${uid}-message`} style={labelStyle}>
            {T.label_message} <span style={{ color: '#ccff33' }}>*</span>
          </label>
          <textarea
            id={`${uid}-message`}
            rows={5}
            placeholder={T.ph_message}
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
            {T.section_photo} <span style={{ color: 'rgba(242,242,242,0.25)', textTransform: 'none', fontSize: 11, letterSpacing: 0 }}>{T.photo_optional}</span>
          </p>
          <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
            {T.photo_hint}
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
                {T.photo_remove}
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
              {imgLoading ? T.photo_loading : T.photo_choose}
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
          {T.consent_text}{' '}
          <Link
            href={T.consent_link_href}
            className="underline underline-offset-4 hover:text-foreground/80 transition-colors duration-200 focus-visible:outline-none"
            style={{ color: 'rgba(204,255,51,0.7)' }}
          >
            {T.consent_link}
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
            {' '}{T.err_contact}{' '}
            <a href="mailto:info@clikclak.ch" className="underline underline-offset-4" style={{ color: 'rgba(204,255,51,0.7)' }}>{T.err_contact_email}</a>
            {' '}{T.err_contact_phone}
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
          {isSending ? T.sending : T.submit}
        </button>
      </div>

    </form>
  )
}
