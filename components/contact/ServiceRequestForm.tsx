'use client'

/*
  ServiceRequestForm — formulaire dédié dépannage à domicile / service de coursier.

  Variantes :
    serviceType="depannage" :
      adresse structurée, checkboxes besoins/services fusionnés, photo
    serviceType="coursier" :
      adresse prise en charge structurée, adresse retour (toggle "identique"),
      checkboxes services souhaités, confirmation rayon 50 km, photo

  API : /api/contact (POST) — même route que le formulaire contact général.
  Image : compression canvas, max 1600 px, JPEG 0.75 — logique locale.
*/

import { useState, useRef, useId } from 'react'
import Link from 'next/link'
import TurnstileWidget from '@/components/forms/TurnstileWidget'

const SITE_KEY_CONFIGURED = !!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/* ── Types ──────────────────────────────────────────────────────────── */
type ServiceType = 'depannage' | 'coursier'
type FormState   = 'idle' | 'sending' | 'success' | 'error'
interface Props  { serviceType: ServiceType }
interface CompressedImage {
  base64: string; originalSize: number; compressedSize: number; filename: string
}

/* ── Listes de services ─────────────────────────────────────────────── */
const SERVICES_COURSIER_FR = [
  'Réparation écran', 'Changement de batterie', 'Connecteur de charge',
  'Dégâts d\'eau / oxydation', 'Diagnostic', 'Récupération de données',
  'Transfert de données', 'Problème logiciel', 'Nettoyage / surchauffe', 'Autre',
]
const SERVICES_DEPANNAGE_FR = [
  'Réparation écran', 'Changement de batterie', 'Connecteur de charge',
  'Dégâts d\'eau / oxydation', 'Diagnostic', 'Configuration',
  'Transfert de données', 'Sauvegarde', 'Problème logiciel',
  'Appareil bloqué', 'Récupération de données', 'Aide compte iCloud / Google', 'Autre',
]
const SERVICES_COURSIER_EN = [
  'Screen repair', 'Battery replacement', 'Charging port',
  'Water damage / oxidation', 'Diagnostics', 'Data recovery',
  'Data transfer', 'Software issue', 'Cleaning / overheating', 'Other',
]
const SERVICES_DEPANNAGE_EN = [
  'Screen repair', 'Battery replacement', 'Charging port',
  'Water damage / oxidation', 'Diagnostics', 'Configuration',
  'Data transfer', 'Backup', 'Software issue',
  'Locked device', 'Data recovery', 'iCloud / Google account help', 'Other',
]

/* ── Compression image ──────────────────────────────────────────────── */
const MAX_FILE = 10 * 1024 * 1024
function compressImage(file: File): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) { reject(new Error('Le fichier doit être une image.')); return }
    if (file.size > MAX_FILE) { reject(new Error('Fichier trop lourd (max 10 Mo).')); return }
    const r = new FileReader()
    r.onerror = () => reject(new Error('Lecture impossible.'))
    r.onload  = ev => {
      const img = new window.Image()
      img.onerror = () => reject(new Error('Décodage impossible.'))
      img.onload = () => {
        let { width: w, height: h } = img
        if (w > 1600 || h > 1600) { if (w >= h) { h = Math.round(h * 1600 / w); w = 1600 } else { w = Math.round(w * 1600 / h); h = 1600 } }
        const c = document.createElement('canvas'); c.width = w; c.height = h
        const ctx = c.getContext('2d'); if (!ctx) { reject(new Error('Canvas indisponible.')); return }
        ctx.drawImage(img, 0, 0, w, h)
        c.toBlob(blob => {
          if (!blob) { reject(new Error('Compression échouée.')); return }
          const r2 = new FileReader()
          r2.onload = e2 => resolve({ base64: e2.target?.result as string, originalSize: file.size, compressedSize: blob.size, filename: file.name })
          r2.readAsDataURL(blob)
        }, 'image/jpeg', 0.75)
      }
      img.src = ev.target?.result as string
    }
    r.readAsDataURL(file)
  })
}
function fmt(b: number) { return b < 1048576 ? `${(b / 1024).toFixed(0)} Ko` : `${(b / 1048576).toFixed(1)} Mo` }

/* ── Styles ─────────────────────────────────────────────────────────── */
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
const ES: React.CSSProperties = { fontSize: 12, fontWeight: 300, color: 'rgba(255,100,100,0.85)', marginTop: 6 }
const BS: React.CSSProperties = {
  border: '1px solid rgba(242,242,242,0.08)', background: 'rgba(255,255,255,0.02)',
  borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16,
}
const ring = (f: string, name: string): React.CSSProperties =>
  f === name ? { borderColor: 'rgba(204,255,51,0.55)', boxShadow: '0 0 0 2px rgba(204,255,51,0.1)' } : {}

/* ── Sous-composant champ texte ─────────────────────────────────────── */
function Field({ id, label, required, type = 'text', placeholder, disabled, value, onChange, onFocus, onBlur, focused, name, error }: {
  id: string; label: string; required?: boolean; type?: string; placeholder?: string; disabled?: boolean
  value: string; onChange: (v: string) => void; onFocus: () => void; onBlur: () => void
  focused: string; name: string; error?: string
}) {
  return (
    <div>
      <label htmlFor={id} style={LS}>
        {label} {required && <span style={{ color: '#ccff33' }}>*</span>}
      </label>
      <input id={id} type={type} placeholder={placeholder} disabled={disabled}
        value={value} onChange={e => onChange(e.target.value)}
        onFocus={onFocus} onBlur={onBlur}
        style={{ ...IS, ...ring(focused, name) }} />
      {error && <p style={ES}>{error}</p>}
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function ServiceRequestForm({ serviceType, locale = 'fr' }: Props & { locale?: 'fr' | 'en' }) {
  const uid = useId()
  const services = locale === 'en'
    ? (serviceType === 'coursier' ? SERVICES_COURSIER_EN : SERVICES_DEPANNAGE_EN)
    : (serviceType === 'coursier' ? SERVICES_COURSIER_FR : SERVICES_DEPANNAGE_FR)

  /* ── État ── */
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  /* Adresse structurée */
  const [street,  setStreet]  = useState('')
  const [number,  setNumber]  = useState('')
  const [postal,  setPostal]  = useState('')
  const [city,    setCity]    = useState('')
  /* Adresse retour coursier */
  const [sameReturn,    setSameReturn]    = useState(true)
  const [retStreet,     setRetStreet]     = useState('')
  const [retNumber,     setRetNumber]     = useState('')
  const [retPostal,     setRetPostal]     = useState('')
  const [retCity,       setRetCity]       = useState('')
  /* Appareil */
  const [deviceType,  setDeviceType]  = useState('')
  const [brandModel,  setBrandModel]  = useState('')
  /* Services checkboxes */
  const [selected, setSelected] = useState<Set<string>>(new Set())
  /* Message */
  const [message, setMessage] = useState('')
  /* Rayon 50 km */
  const [within50km,  setWithin50km]  = useState(false)
  /* Consentement + honeypot + turnstile */
  const [consent, setConsent] = useState(false)
  const [hp, setHp] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  /* Formulaire */
  const [errors,  setErrors]  = useState<Record<string, string>>({})
  const [state,   setState]   = useState<FormState>('idle')
  const [apiErr,  setApiErr]  = useState('')
  const [focused, setFocused] = useState('')
  /* Image */
  const [image,      setImage]      = useState<CompressedImage | null>(null)
  const [imgPreview, setImgPreview] = useState('')
  const [imgErr,     setImgErr]     = useState('')
  const [imgLoading, setImgLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const isSending   = state === 'sending'
  const hasOther    = selected.has('Autre')
  const msgRequired = hasOther

  /* ── Helpers ── */
  const clearErr = (k: string) => setErrors(p => { const n = { ...p }; delete n[k]; return n })
  const f = (name: string) => ({
    onFocus: () => setFocused(name),
    onBlur:  () => setFocused(''),
    focused,
    name,
  })

  const toggleService = (s: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s); else next.add(s)
      return next
    })
    clearErr('services')
  }

  /* ── Upload image ── */
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setImgErr(''); setImgLoading(true)
    try { const c = await compressImage(file); setImage(c); setImgPreview(c.base64) }
    catch (err) { setImgErr(err instanceof Error ? err.message : 'Erreur image.') }
    finally { setImgLoading(false); if (fileRef.current) fileRef.current.value = '' }
  }
  const removeImage = () => { setImage(null); setImgPreview(''); setImgErr(''); if (fileRef.current) fileRef.current.value = '' }

  /* ── Validation ── */
  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())   e.name   = 'Veuillez indiquer votre nom.'
    if (!email.trim())  e.email  = 'Veuillez indiquer votre email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email invalide.'
    if (!phone.trim())  e.phone  = 'Veuillez indiquer votre téléphone.'
    if (!street.trim()) e.street = 'Veuillez indiquer la rue.'
    if (!number.trim()) e.number = 'Veuillez indiquer le numéro.'
    if (!postal.trim()) e.postal = 'Veuillez indiquer le code postal.'
    if (!city.trim())   e.city   = 'Veuillez indiquer la localité.'
    if (!sameReturn && serviceType === 'coursier') {
      if (!retStreet.trim()) e.retStreet = 'Veuillez indiquer la rue de retour.'
      if (!retNumber.trim()) e.retNumber = 'Veuillez indiquer le numéro de retour.'
      if (!retPostal.trim()) e.retPostal = 'Veuillez indiquer le code postal de retour.'
      if (!retCity.trim())   e.retCity   = 'Veuillez indiquer la localité de retour.'
    }
    if (selected.size === 0) e.services = 'Veuillez sélectionner au moins un service.'
    if (msgRequired && !message.trim()) e.message = 'Veuillez décrire votre demande lorsque vous choisissez "Autre".'
    if (serviceType === 'coursier' && !within50km) e.within50km = 'Merci de confirmer que l\'adresse se situe dans le périmètre de livraison.'
    if (!consent) e.consent = 'Le consentement est obligatoire.'
    if (SITE_KEY_CONFIGURED && !turnstileToken) e.turnstile = 'Veuillez valider la protection anti-spam avant d\'envoyer le formulaire.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  /* ── Envoi ── */
  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setState('sending'); setApiErr('')

    const serviceLabel = serviceType === 'depannage' ? 'Dépannage à domicile' : 'Service de coursier'
    const payload: Record<string, unknown> = {
      name: name.trim(), email: email.trim(), phone: phone.trim(),
      serviceLabel, deviceType, brandModel: brandModel.trim(),
      selectedServices: Array.from(selected),
      message: message.trim(), consent, _hp: hp, turnstileToken,
    }
    if (serviceType === 'depannage') {
      payload.addrStreet  = street.trim()
      payload.addrNumber  = number.trim()
      payload.addrPostal  = postal.trim()
      payload.addrCity    = city.trim()
    } else {
      payload.pickupStreet = street.trim()
      payload.pickupNumber = number.trim()
      payload.pickupPostal = postal.trim()
      payload.pickupCity   = city.trim()
      payload.sameReturn   = sameReturn
      if (!sameReturn) {
        payload.returnStreet = retStreet.trim()
        payload.returnNumber = retNumber.trim()
        payload.returnPostal = retPostal.trim()
        payload.returnCity   = retCity.trim()
      }
      payload.within50km = within50km
    }
    if (image) {
      payload.imageBase64         = image.base64
      payload.imageFilename       = image.filename
      payload.imageOriginalSize   = image.originalSize
      payload.imageCompressedSize = image.compressedSize
    }

    try {
      const res  = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const json = await res.json()
      if (!res.ok) { setApiErr(json.error ?? 'Une erreur est survenue.'); setState('error') }
      else          setState('success')
    } catch {
      setApiErr('Erreur réseau. Vérifiez votre connexion.')
      setState('error')
    }
  }

  /* ── Succès ── */
  if (state === 'success') {
    return (
      <div className="flex flex-col gap-5 items-start p-8 rounded-xl"
        style={{ border: '1px solid rgba(204,255,51,0.25)', background: 'rgba(204,255,51,0.04)' }}>
        <span className="text-3xl" aria-hidden>✓</span>
        <div className="flex flex-col gap-2">
          <p className="text-base font-light" style={{ color: 'rgba(242,242,242,0.9)' }}>Votre demande a bien été envoyée.</p>
          <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.5)' }}>
            ClikClak vous répondra dès que possible à <strong className="font-normal" style={{ color: '#ccff33' }}>{email}</strong>.
          </p>
        </div>
      </div>
    )
  }

  /* ── Rendu ── */
  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

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
          value={hp}
          onChange={e => setHp(e.target.value)}
        />
      </div>

      {/* ── A. Identité ── */}
      <div style={BS}>
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>Vos coordonnées</p>
        <Field id={`${uid}-name`}  label="Nom / prénom" required disabled={isSending}
          value={name}  onChange={v => { setName(v);  clearErr('name') }}  error={errors.name}  {...f('name')} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id={`${uid}-email`} label="Email" required type="email" placeholder="votre@email.com" disabled={isSending}
            value={email} onChange={v => { setEmail(v); clearErr('email') }} error={errors.email} {...f('email')} />
          <Field id={`${uid}-phone`} label="Téléphone" required type="tel" placeholder="021 XXX XX XX" disabled={isSending}
            value={phone} onChange={v => { setPhone(v); clearErr('phone') }} error={errors.phone} {...f('phone')} />
        </div>
      </div>

      {/* ── B. Adresse principale ── */}
      <div style={BS}>
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
          {serviceType === 'coursier'
            ? (locale === 'en' ? 'Pickup address' : 'Adresse de prise en charge')
            : (locale === 'en' ? 'Intervention address' : "Adresse d'intervention")}
        </p>
        {serviceType === 'depannage' && (
          <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
            Le dépannage à domicile est proposé selon disponibilité, zone d&apos;intervention et type de demande. Les demandes éloignées de Lausanne sont évaluées au cas par cas.
          </p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Field id={`${uid}-street`} label="Rue" required disabled={isSending}
              placeholder="Rue du Petit-Chêne" value={street} onChange={v => { setStreet(v); clearErr('street') }} error={errors.street} {...f('street')} />
          </div>
          <Field id={`${uid}-number`} label="Numéro" required disabled={isSending}
            placeholder="9b" value={number} onChange={v => { setNumber(v); clearErr('number') }} error={errors.number} {...f('number')} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field id={`${uid}-postal`} label="Code postal" required disabled={isSending}
            placeholder="1003" value={postal} onChange={v => { setPostal(v); clearErr('postal') }} error={errors.postal} {...f('postal')} />
          <Field id={`${uid}-city`} label="Localité" required disabled={isSending}
            placeholder="Lausanne" value={city} onChange={v => { setCity(v); clearErr('city') }} error={errors.city} {...f('city')} />
        </div>
      </div>

      {/* ── C. Adresse retour (coursier) ── */}
      {serviceType === 'coursier' && (
        <div style={BS}>
          <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
            {locale === 'en' ? 'Return address' : 'Adresse de retour'}
          </p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={sameReturn} disabled={isSending}
              onChange={e => setSameReturn(e.target.checked)}
              className="w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer" />
            <span className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.7)' }}>
              L&apos;adresse de retour est identique à l&apos;adresse de prise en charge
            </span>
          </label>
          {!sameReturn && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <Field id={`${uid}-ret-street`} label="Rue de retour" required disabled={isSending}
                    placeholder="Rue du Petit-Chêne" value={retStreet} onChange={v => { setRetStreet(v); clearErr('retStreet') }} error={errors.retStreet} {...f('retStreet')} />
                </div>
                <Field id={`${uid}-ret-number`} label="Numéro" required disabled={isSending}
                  placeholder="9b" value={retNumber} onChange={v => { setRetNumber(v); clearErr('retNumber') }} error={errors.retNumber} {...f('retNumber')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field id={`${uid}-ret-postal`} label="Code postal" required disabled={isSending}
                  placeholder="1003" value={retPostal} onChange={v => { setRetPostal(v); clearErr('retPostal') }} error={errors.retPostal} {...f('retPostal')} />
                <Field id={`${uid}-ret-city`} label="Localité" required disabled={isSending}
                  placeholder="Lausanne" value={retCity} onChange={v => { setRetCity(v); clearErr('retCity') }} error={errors.retCity} {...f('retCity')} />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── D. Appareil ── */}
      <div style={BS}>
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>Votre appareil</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${uid}-device`} style={LS}>Type d&apos;appareil <span style={{ color: '#ccff33' }}>*</span></label>
            <select id={`${uid}-device`} disabled={isSending} value={deviceType} onChange={e => setDeviceType(e.target.value)}
              onFocus={() => setFocused('device')} onBlur={() => setFocused('')}
              style={{ ...IS, ...ring(focused, 'device'), cursor: 'pointer' }}>
              <option value="">{locale === 'en' ? '— Select —' : '— Sélectionner —'}</option>
              <option value="Smartphone">Smartphone</option>
              <option value="Tablette">{locale === 'en' ? 'Tablet' : 'Tablette'}</option>
              <option value="Ordinateur / MacBook">{locale === 'en' ? 'Computer / MacBook' : 'Ordinateur / MacBook'}</option>
              <option value="Récupération de données">{locale === 'en' ? 'Data recovery' : 'Récupération de données'}</option>
              <option value="Autre">{locale === 'en' ? 'Other' : 'Autre'}</option>
            </select>
          </div>
          <Field id={`${uid}-brand`} label="Marque / modèle" disabled={isSending}
            placeholder='iPhone 16 Pro, Galaxy S25, iPad Air…' value={brandModel} onChange={setBrandModel} {...f('brand')} />
        </div>
      </div>

      {/* ── E. Services / besoins (checkboxes multiples) ── */}
      <div style={BS}>
        <div>
          <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
            {serviceType === 'coursier' ? 'Service de réparation souhaité' : 'Votre demande concerne'}
            <span style={{ color: '#ccff33', marginLeft: 4 }}>*</span>
          </p>
          <p className="text-xs font-light mt-1" style={{ color: 'rgba(242,242,242,0.4)' }}>
            Plusieurs choix possibles.{hasOther ? ' Merci de décrire votre demande dans le message ci-dessous.' : ''}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {services.map(s => {
            const checked = selected.has(s)
            return (
              <label key={s}
                className="flex items-center gap-3 cursor-pointer select-none rounded-lg px-3 py-2"
                style={{
                  border:     `1px solid ${checked ? 'rgba(204,255,51,0.3)' : 'rgba(242,242,242,0.08)'}`,
                  background: checked ? 'rgba(204,255,51,0.05)' : 'rgba(255,255,255,0.02)',
                  transition: 'border-color 150ms, background 150ms',
                }}>
                <input type="checkbox" checked={checked} disabled={isSending}
                  onChange={() => toggleService(s)}
                  className="w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer" />
                <span className="text-sm font-light" style={{ color: checked ? 'rgba(242,242,242,0.9)' : 'rgba(242,242,242,0.6)' }}>
                  {s}
                </span>
              </label>
            )
          })}
        </div>
        {errors.services && <p style={ES}>{errors.services}</p>}
      </div>

      {/* ── F. Message ── */}
      <div style={BS}>
        <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
          Message {msgRequired && <span style={{ color: '#ccff33' }}>*</span>}
          {!msgRequired && <span style={{ color: 'rgba(242,242,242,0.25)', textTransform: 'none', fontSize: 11, letterSpacing: 0 }}> (recommandé)</span>}
        </p>
        <div>
          <textarea id={`${uid}-message`} rows={4} disabled={isSending}
            placeholder={serviceType === 'depannage'
              ? 'Décrivez le problème, le modèle de l\'appareil si vous le connaissez, et ce que vous souhaitez faire.'
              : 'Décrivez la panne, le contexte, depuis quand le problème est présent, et si l\'appareil est tombé ou a été en contact avec un liquide.'}
            value={message} onChange={e => { setMessage(e.target.value); clearErr('message') }}
            onFocus={() => setFocused('message')} onBlur={() => setFocused('')}
            style={{ ...IS, ...ring(focused, 'message'), resize: 'vertical', minHeight: 100, lineHeight: 1.7 }} />
          {errors.message && <p style={ES}>{errors.message}</p>}
        </div>
      </div>

      {/* ── G. Photo optionnelle ── */}
      <div style={BS}>
        <div>
          <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
            Photo <span style={{ color: 'rgba(242,242,242,0.25)', textTransform: 'none', fontSize: 11, letterSpacing: 0 }}>(optionnel)</span>
          </p>
          <p className="text-xs font-light mt-1" style={{ color: 'rgba(242,242,242,0.4)' }}>
            Ajoutez une photo de l&apos;appareil si cela peut aider au diagnostic. L&apos;image sera compressée avant l&apos;envoi.
          </p>
        </div>
        {imgPreview && image ? (
          <div className="flex flex-col gap-3">
            <div className="relative w-full max-w-sm rounded-lg overflow-hidden" style={{ border: '1px solid rgba(242,242,242,0.12)' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imgPreview} alt="Aperçu" className="w-full object-contain" style={{ maxHeight: 220 }} />
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
                {image.filename} — {fmt(image.originalSize)} → <span style={{ color: 'rgba(204,255,51,0.7)' }}>{fmt(image.compressedSize)}</span>
              </p>
              <button type="button" onClick={removeImage}
                className="text-xs font-light underline underline-offset-4 focus-visible:outline-none"
                style={{ color: 'rgba(242,242,242,0.4)' }}>{locale === 'en' ? 'Remove' : 'Supprimer'}</button>
            </div>
          </div>
        ) : (
          <div>
            <input ref={fileRef} type="file" accept="image/*" id={`${uid}-photo`}
              disabled={isSending || imgLoading} onChange={handleFile} className="sr-only" />
            <label htmlFor={`${uid}-photo`}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px',
                border: '1px dashed rgba(242,242,242,0.2)', borderRadius: 8, fontSize: 14, fontWeight: 300,
                color: imgLoading ? 'rgba(242,242,242,0.3)' : 'rgba(242,242,242,0.6)', cursor: isSending ? 'not-allowed' : 'pointer' }}>
              {imgLoading
                ? (locale === 'en' ? 'Compressing…' : 'Compression…')
                : (locale === 'en' ? 'Choose an image' : 'Choisir une image')}
            </label>
            {imgErr && <p style={{ ...ES, marginTop: 8 }}>{imgErr}</p>}
          </div>
        )}
      </div>

      {/* ── H. Rayon 50 km (coursier uniquement) ── */}
      {serviceType === 'coursier' && (
        <div style={{ ...BS, borderColor: 'rgba(204,255,51,0.15)', background: 'rgba(204,255,51,0.03)' }}>
          <p className="text-xs font-light uppercase tracking-[0.15em]" style={{ color: '#ccff33' }}>
            Périmètre de livraison
          </p>
          <p className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.6)' }}>
            Le service de coursier est disponible dans un rayon d&apos;environ 50 km autour de 1003 Lausanne, selon disponibilité.
          </p>
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={within50km} disabled={isSending}
              onChange={e => { setWithin50km(e.target.checked); clearErr('within50km') }}
              className="mt-[3px] w-4 h-4 accent-[#ccff33] shrink-0 cursor-pointer" />
            <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>
              Je confirme que l&apos;adresse de prise en charge se situe dans un rayon d&apos;environ 50 km autour de 1003 Lausanne.{' '}
              <span style={{ color: '#ccff33' }}>*</span>
            </span>
          </label>
          {errors.within50km && <p style={ES}>{errors.within50km}</p>}
          {!within50km && !errors.within50km && (
            <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.4)' }}>
              Pour une demande hors zone, merci de nous contacter directement au 021 320 44 77.
            </p>
          )}
        </div>
      )}

      {/* ── I. Consentement ── */}
      <label className="flex items-start gap-3 cursor-pointer select-none">
        <input type="checkbox" checked={consent} disabled={isSending}
          onChange={e => { setConsent(e.target.checked); clearErr('consent') }}
          className="mt-[3px] shrink-0 w-4 h-4 accent-[#ccff33] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#ccff33]" />
        <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.55)' }}>
          {locale === 'en'
            ? <>I agree that ClikClak may use this information to respond to my request, in accordance with the{' '}
                <Link href="/en/privacy-policy" className="underline underline-offset-4 focus-visible:outline-none" style={{ color: 'rgba(204,255,51,0.7)' }}>privacy policy</Link>.</>
            : <>J&apos;accepte que ClikClak utilise ces informations pour répondre à ma demande, conformément à la{' '}
                <Link href="/politique-confidentialite" className="underline underline-offset-4 focus-visible:outline-none" style={{ color: 'rgba(204,255,51,0.7)' }}>politique de confidentialité</Link>.</>
          }{' '}
          <span style={{ color: '#ccff33' }}>*</span>
        </span>
      </label>
      {errors.consent && <p style={{ ...ES, marginTop: -8 }}>{errors.consent}</p>}

      {/* ── Protection anti-spam Turnstile ── */}
      <TurnstileWidget onToken={t => { setTurnstileToken(t ?? ''); clearErr('turnstile') }} locale={locale} />
      {errors.turnstile && <p style={ES}>{errors.turnstile}</p>}

      {/* ── Erreur API ── */}
      {state === 'error' && apiErr && (
        <div className="p-4 rounded-lg text-sm font-light leading-relaxed"
          style={{ border: '1px solid rgba(255,100,100,0.25)', background: 'rgba(255,100,100,0.05)', color: 'rgba(255,150,150,0.9)' }}>
          {apiErr}{' '}
          <span style={{ color: 'rgba(242,242,242,0.4)' }}>
            Vous pouvez aussi nous appeler au{' '}
            <a href="tel:+41213204477" className="underline underline-offset-4" style={{ color: 'rgba(204,255,51,0.7)' }}>021 320 44 77</a>.
          </span>
        </div>
      )}

      {/* ── Bouton ── */}
      <div>
        <button type="submit" disabled={isSending}
          className="inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-40 disabled:cursor-not-allowed shiny-cta shiny-cta-primary text-primary-foreground h-14 px-8 text-base">
          <span className="inline-flex items-center gap-2">
            {isSending
              ? (locale === 'en' ? 'Sending…' : 'Envoi en cours…')
              : serviceType === 'depannage'
                ? (locale === 'en' ? 'Send repair request' : 'Envoyer la demande de dépannage')
                : (locale === 'en' ? 'Send courier request' : 'Envoyer la demande de coursier')}
          </span>
        </button>
      </div>

    </form>
  )
}
