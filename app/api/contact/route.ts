import { NextRequest, NextResponse } from 'next/server'
import { getVisitorIdentity }     from '@/lib/chatbot/requestIdentity'
import { checkContactRateLimit }  from '@/lib/contact/rateLimiter'

/*
  Route API contact — /api/contact (POST)

  Variables d'environnement :
    CONTACT_TO_EMAIL        : destinataire général (ex: info@clikclak.ch)
    CONTACT_FROM_EMAIL      : expéditeur vérifié Resend (ex: noreply@clikclak.ch)
    RESEND_API_KEY          : clé API Resend
    CONTACT_BUYBACK_EMAIL   : (optionnel) rachat → si absent, CONTACT_TO_EMAIL
    CONTACT_COURIER_EMAIL   : (optionnel) coursier → si absent, CONTACT_TO_EMAIL
    CONTACT_DEPANNAGE_EMAIL : (optionnel) dépannage → si absent, CONTACT_TO_EMAIL
    CONTACT_B2B_EMAIL       : (optionnel) B2B entreprises → si absent, CONTACT_TO_EMAIL

  Sécurité :
    - Validation Content-Type (415)
    - Limite taille body 6 Mo (413)
    - Validation et sanitisation des champs
    - Honeypot obligatoire vide
    - Turnstile obligatoire en production
    - Rate limiting Redis (5/h, 20/j) — fail closed → 503
    - Cache-Control: no-store sur toutes les réponses
    - Référence unique générée côté serveur pour rachat
    - Aucune donnée personnelle loggée en production
*/

interface ContactPayload {
  name:          string
  firstName?:    string
  lastName?:     string
  email:         string
  phone?:        string
  deviceType?:   string
  brand?:        string
  model?:        string
  requestType?:  string
  message:       string
  consent:       boolean
  _hp:           string
  imageBase64?:  string
  imageFilename?: string
  imageOriginalSize?:   number
  imageCompressedSize?: number
  /* Services */
  serviceLabel?:     string
  brandModel?:       string
  selectedServices?: string[]
  /* B2B */
  companyName?:      string
  /* Adresse dépannage */
  addrStreet?:  string
  addrNumber?:  string
  addrPostal?:  string
  addrCity?:    string
  addrCountry?: string
  /* Adresse prise en charge (coursier) */
  pickupStreet?: string
  pickupNumber?: string
  pickupPostal?: string
  pickupCity?:   string
  /* Adresse retour (coursier) */
  sameReturn?:   boolean
  returnStreet?: string
  returnNumber?: string
  returnPostal?: string
  returnCity?:   string
  /* Coursier */
  within50km?:  boolean
  /* Rachat */
  deviceCapacity?:    string
  conditionGeneral?:  string
  conditionScreen?:   string
  conditionBattery?:  string
  powerState?:        string
  lockState?:         string
  accessories?:       string
  paymentPref?:       string
  deliveryMode?:      string
  /* Legacy (formulaire contact général) */
  address?:       string
  pickupAddress?: string
  returnAddress?: string
  /* Anti-spam */
  turnstileToken?: string
}

/* ── Helper réponse avec Cache-Control ───────────────────────────── */

function resp(body: Record<string, unknown>, status = 200, extraHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', ...extraHeaders },
  })
}

/* ── Sanitisation des champs ─────────────────────────────────────── */

const CTRL_CHARS = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g

function sanitize(value: unknown, maxLen: number): string | undefined {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'string') return undefined
  const s = value.normalize('NFKC').replace(CTRL_CHARS, '').trim()
  if (!s) return undefined
  return s.length > maxLen ? s.slice(0, maxLen) : s
}

/* Limites de longueur par champ */
const FIELD_MAX: Record<string, number> = {
  name:         150,
  firstName:    100,
  lastName:     100,
  email:        254,
  phone:         30,
  message:     4000,
  deviceType:   150,
  brand:        100,
  model:        200,
  brandModel:   200,
  serviceLabel: 100,
  requestType:  100,
  companyName:  200,
  deviceCapacity:    50,
  conditionGeneral: 200,
  conditionScreen:  200,
  conditionBattery: 200,
  powerState:       100,
  lockState:        100,
  accessories:      500,
  paymentPref:      100,
  deliveryMode:     100,
  addrStreet:  200, addrNumber:  20, addrPostal:  20, addrCity:  100, addrCountry: 100,
  pickupStreet:200, pickupNumber:20, pickupPostal:20, pickupCity:100,
  returnStreet:200, returnNumber:20, returnPostal:20, returnCity:100,
  imageFilename: 255,
}

/* ── Helpers ─────────────────────────────────────────────────────── */
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function addrStr(...parts: (string | undefined)[]): string | undefined {
  const f = parts.filter(Boolean)
  return f.length ? f.join(', ') : undefined
}

function getToEmail(serviceLabel?: string): string {
  const fallback = process.env.CONTACT_TO_EMAIL ?? ''
  if (!serviceLabel) return fallback
  if (serviceLabel === 'Estimation rachat appareil') return process.env.CONTACT_BUYBACK_EMAIL   ?? fallback
  if (serviceLabel === 'Service de coursier')         return process.env.CONTACT_COURIER_EMAIL   ?? fallback
  if (serviceLabel === 'Dépannage à domicile')        return process.env.CONTACT_DEPANNAGE_EMAIL ?? fallback
  if (serviceLabel === 'Contact B2B')                 return process.env.CONTACT_B2B_EMAIL       ?? fallback
  return fallback
}

/* ── Vérification Turnstile côté serveur ─────────────────────────── */
async function verifyTurnstile(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY
  if (!secretKey) return false // production sans clé → refus

  try {
    const res  = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ secret: secretKey, response: token }),
    })
    const json = await res.json() as { success: boolean }
    return json.success === true
  } catch {
    return false
  }
}

function generateBuybackRef(): string {
  const d   = new Date()
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  const rnd = Math.random().toString(36).toUpperCase().slice(2, 6)
  return `CC-RACHAT-${ymd}-${rnd}`
}

/* ── Email admin ─────────────────────────────────────────────────── */
function buildAdminEmail(data: ContactPayload, ref?: string): string {
  /* Label gris (gauche) + valeur blanche (droite) */
  const TD_LABEL = 'padding:6px 12px;color:#888;font-size:13px;width:175px;white-space:nowrap;vertical-align:top'
  const TD_VALUE = 'padding:6px 12px;font-size:13px;color:#f2f2f2 !important'
  const A_LINK   = 'color:#FFFFFF !important;text-decoration:underline;'

  /* Ligne texte simple */
  const row = (label: string, value: string | undefined) =>
    value
      ? `<tr><td style="${TD_LABEL}">${label}</td><td style="${TD_VALUE}">${esc(value)}</td></tr>`
      : ''

  /* Ligne avec lien mailto: */
  const rowEmail = (label: string, email: string | undefined) =>
    email
      ? `<tr><td style="${TD_LABEL}">${label}</td><td style="${TD_VALUE}"><a href="mailto:${esc(email)}" style="${A_LINK}">${esc(email)}</a></td></tr>`
      : ''

  /* Ligne avec lien tel: */
  const rowPhone = (label: string, phone: string | undefined) =>
    phone
      ? `<tr><td style="${TD_LABEL}">${label}</td><td style="${TD_VALUE}"><a href="tel:${phone.replace(/[^\d+]/g, '')}" style="${A_LINK}">${esc(phone)}</a></td></tr>`
      : ''

  const isBuyback = data.serviceLabel === 'Estimation rachat appareil'
  const title     = ref ? `[${esc(ref)}] Demande estimation rachat — ClikClak` : (data.serviceLabel ? `Demande ${esc(data.serviceLabel)} — ClikClak` : 'Nouvelle demande — ClikClak')

  const clientName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || ''
  const fullAddr   = addrStr(data.addrStreet, data.addrNumber, data.addrPostal, data.addrCity, data.addrCountry)
  const pickupFull = addrStr(data.pickupStreet, data.pickupNumber, data.pickupPostal, data.pickupCity)
  const returnFull = data.sameReturn ? 'Identique à la prise en charge' : addrStr(data.returnStreet, data.returnNumber, data.returnPostal, data.returnCity)

  const servicesRow = data.selectedServices?.length
    ? `<tr><td style="${TD_LABEL}">Services souhaités</td><td style="${TD_VALUE}">${data.selectedServices.map(esc).join(', ')}</td></tr>`
    : ''

  const confirmRows = isBuyback ? `
    <tr><td colspan="2" style="padding:14px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Confirmations</td></tr>
    ${row('Conditions de reprise acceptées', 'Oui')}
    ${row('Propriété / autorisation de vente', 'Confirmée')}
    ${row('Politique de confidentialité', 'Acceptée')}
    ${row('Sauvegarde et suppression données', 'Comprise')}
  ` : ''

  const buybackChecklist = isBuyback ? `
    <div style="margin:16px 0;padding:14px;background:rgba(204,255,51,0.06);border-radius:8px;border-left:3px solid rgba(204,255,51,0.4)">
      <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em">À vérifier avant offre finale</p>
      <ul style="margin:0;padding:0 0 0 16px;font-size:13px;line-height:2;color:#f2f2f2">
        <li>Modèle exact</li>
        <li>Capacité</li>
        <li>État réel</li>
        <li>État batterie</li>
        <li>Écran</li>
        <li>Verrouillage iCloud / Google / Samsung</li>
        <li>Preuve de propriété si doute</li>
        <li>Correspondance avec les photos</li>
        <li>Accessoires</li>
        <li>Mode de paiement</li>
      </ul>
    </div>` : ''

  const msgSection = data.message ? `
    <div style="margin:16px 0;padding:16px;background:rgba(255,255,255,0.04);border-radius:8px;border-left:3px solid rgba(204,255,51,0.4)">
      <p style="margin:0 0 6px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em">Message</p>
      <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap;color:#f2f2f2 !important">${esc(data.message)}</p>
    </div>` : ''

  const imgSection = data.imageBase64 ? `
    <p style="margin:20px 0 8px;font-size:13px;color:#888">Photo jointe :</p>
    <img src="${data.imageBase64}" style="max-width:600px;width:100%;border-radius:6px" alt="Photo appareil" />` : ''

  return `
    <div style="font-family:system-ui,sans-serif;max-width:660px;margin:0 auto;background:#111;color:#f2f2f2;border-radius:10px;padding:28px 24px">
      <h2 style="margin:0 0 20px;font-size:18px;font-weight:400;color:#ccff33">${title}</h2>
      ${ref ? `<p style="margin:-12px 0 20px;font-size:13px;color:#888">Référence : <strong style="color:#ccff33;font-weight:400">${esc(ref)}</strong></p>` : ''}
      <table style="border-collapse:collapse;width:100%;background:rgba(255,255,255,0.04);border-radius:8px;overflow:hidden">
        <tr><td colspan="2" style="padding:14px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Client</td></tr>
        ${row('Entreprise', data.companyName)}
        ${row('Prénom', data.firstName)}
        ${row('Nom', data.lastName)}
        ${!data.firstName ? row('Nom', clientName) : ''}
        ${rowEmail('Email', data.email)}
        ${rowPhone('Téléphone', data.phone)}
        ${fullAddr ? row('Adresse', fullAddr) : ''}
        ${pickupFull ? row('Adresse collecte', pickupFull) : ''}
        ${returnFull ? row('Adresse retour', returnFull) : ''}
        ${data.within50km !== undefined ? row('Rayon 50 km', data.within50km ? 'Confirmé' : 'Non confirmé') : ''}
        <tr><td colspan="2" style="padding:14px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Appareil</td></tr>
        ${row('Type', data.deviceType)}
        ${row('Marque', data.brand || (data.brandModel ? data.brandModel.split(' ')[0] : undefined))}
        ${row('Modèle', data.model || data.brandModel)}
        ${row('Capacité', data.deviceCapacity)}
        ${row('État général', data.conditionGeneral)}
        ${row('Écran', data.conditionScreen)}
        ${row('Batterie', data.conditionBattery)}
        ${row('S\'allume ?', data.powerState)}
        ${row('Verrouillage', data.lockState)}
        ${row('Accessoires', data.accessories)}
        ${servicesRow}
        ${data.paymentPref || data.deliveryMode ? `<tr><td colspan="2" style="padding:14px 12px 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:.08em">Rachat</td></tr>` : ''}
        ${row('Paiement souhaité', data.paymentPref)}
        ${row('Mode remise', data.deliveryMode)}
        ${confirmRows}
      </table>
      ${buybackChecklist}
      ${msgSection}
      ${imgSection}
      <p style="margin:24px 0 0;font-size:11px;color:#555">clikclak.ch — demande reçue via le site</p>
    </div>
  `
}

/* ── Email client (rachat uniquement) ───────────────────────────── */
function buildClientEmail(data: ContactPayload, ref: string): string {
  const firstName = data.firstName || data.name?.split(' ')[0] || 'Madame, Monsieur'
  const deviceSummary = [data.deviceType, data.brand || data.brandModel, data.model].filter(Boolean).join(' — ') || '—'

  return `
    <div style="font-family:system-ui,sans-serif;max-width:620px;margin:0 auto;background:#111;color:#f2f2f2;border-radius:10px;padding:28px 24px">
      <h2 style="margin:0 0 8px;font-size:18px;font-weight:400;color:#ccff33">Votre demande d&apos;estimation a bien été reçue</h2>
      <p style="margin:0 0 20px;font-size:13px;color:#888">Référence : <strong style="color:#ccff33;font-weight:400">${esc(ref)}</strong></p>
      <p style="font-size:14px;line-height:1.7;margin:0 0 16px">Bonjour ${esc(firstName)},</p>
      <p style="font-size:14px;line-height:1.7;margin:0 0 16px">
        Nous avons bien reçu votre demande d&apos;estimation pour l&apos;appareil suivant :
      </p>
      <div style="margin:16px 0;padding:16px;background:rgba(255,255,255,0.04);border-radius:8px">
        ${[
          ['Appareil',            deviceSummary],
          ['Capacité',            data.deviceCapacity],
          ['État général',        data.conditionGeneral],
          ['Paiement souhaité',   data.paymentPref],
          ['Mode de remise',      data.deliveryMode],
        ].filter(([,v]) => v).map(([l,v]) =>
          `<p style="margin:0 0 6px;font-size:13px;color:#f2f2f2 !important"><span style="color:#888">${l} :</span> <span style="color:#f2f2f2 !important">${esc(v as string)}</span></p>`
        ).join('')}
      </div>
      <p style="font-size:14px;line-height:1.7;margin:16px 0">
        ClikClak va analyser les informations transmises et vous répondra avec une offre ou une demande d&apos;information complémentaire.
      </p>
      <div style="margin:16px 0;padding:14px;background:rgba(204,255,51,0.06);border-radius:8px;border-left:3px solid rgba(204,255,51,0.4)">
        <p style="margin:0 0 8px;font-size:12px;color:#888;text-transform:uppercase;letter-spacing:.08em">Important</p>
        <ul style="margin:0;padding:0 0 0 16px;font-size:13px;line-height:2;color:#f2f2f2">
          <li>L&apos;offre finale dépend du contrôle réel de l&apos;appareil.</li>
          <li>Sauvegardez vos données avant toute vente définitive.</li>
          <li>Désactivez iCloud / Localiser / Google / Samsung si applicable.</li>
          <li>Ne transmettez jamais vos mots de passe par email.</li>
          <li>Préparez les accessoires indiqués dans votre demande.</li>
        </ul>
      </div>
      <div style="margin:24px 0 0;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#555;line-height:1.8">
        <strong style="color:#888">ClikClak</strong><br />
        Rue du Petit-Chêne 9b, 1003 Lausanne<br />
        info@clikclak.ch — 021 320 44 77
      </div>
    </div>
  `
}

/* ── Handler POST ────────────────────────────────────────────────── */
export async function POST(req: NextRequest) {

  /* 1. Content-Type */
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return resp({ error: 'Format de requête non pris en charge.' }, 415)
  }

  /* 2. Content-Length — vérification rapide */
  const cl = req.headers.get('content-length')
  if (cl && parseInt(cl, 10) > 6_000_000) {
    return resp({ error: 'Pièce jointe trop volumineuse (6 Mo maximum).' }, 413)
  }

  /* 3. Lecture et vérification de la taille réelle */
  let rawBody: string
  try { rawBody = await req.text() }
  catch { return resp({ error: 'Impossible de lire la requête.' }, 400) }

  if (Buffer.byteLength(rawBody, 'utf-8') > 6_000_000) {
    return resp({ error: 'Pièce jointe trop volumineuse (6 Mo maximum).' }, 413)
  }

  /* 4. Parse JSON */
  let raw: unknown
  try { raw = JSON.parse(rawBody) }
  catch { return resp({ error: 'Données invalides.' }, 400) }

  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return resp({ error: 'Données invalides.' }, 400)
  }

  const parsed = raw as Record<string, unknown>

  /* Sanitisation de tous les champs texte */
  const data: ContactPayload = {
    name:          sanitize(parsed.name,          FIELD_MAX.name)          ?? '',
    firstName:     sanitize(parsed.firstName,     FIELD_MAX.firstName),
    lastName:      sanitize(parsed.lastName,      FIELD_MAX.lastName),
    email:         sanitize(parsed.email,         FIELD_MAX.email)         ?? '',
    phone:         sanitize(parsed.phone,         FIELD_MAX.phone),
    deviceType:    sanitize(parsed.deviceType,    FIELD_MAX.deviceType),
    brand:         sanitize(parsed.brand,         FIELD_MAX.brand),
    model:         sanitize(parsed.model,         FIELD_MAX.model),
    message:       sanitize(parsed.message,       FIELD_MAX.message)       ?? '',
    consent:       parsed.consent === true,
    _hp:           typeof parsed._hp === 'string' ? parsed._hp : '',
    requestType:   sanitize(parsed.requestType,   FIELD_MAX.requestType),
    serviceLabel:  sanitize(parsed.serviceLabel,  FIELD_MAX.serviceLabel),
    brandModel:    sanitize(parsed.brandModel,    FIELD_MAX.brandModel),
    deviceCapacity:    sanitize(parsed.deviceCapacity,    FIELD_MAX.deviceCapacity),
    conditionGeneral:  sanitize(parsed.conditionGeneral,  FIELD_MAX.conditionGeneral),
    conditionScreen:   sanitize(parsed.conditionScreen,   FIELD_MAX.conditionScreen),
    conditionBattery:  sanitize(parsed.conditionBattery,  FIELD_MAX.conditionBattery),
    powerState:    sanitize(parsed.powerState,    FIELD_MAX.powerState),
    lockState:     sanitize(parsed.lockState,     FIELD_MAX.lockState),
    accessories:   sanitize(parsed.accessories,   FIELD_MAX.accessories),
    paymentPref:   sanitize(parsed.paymentPref,   FIELD_MAX.paymentPref),
    deliveryMode:  sanitize(parsed.deliveryMode,  FIELD_MAX.deliveryMode),
    addrStreet:    sanitize(parsed.addrStreet,    FIELD_MAX.addrStreet),
    addrNumber:    sanitize(parsed.addrNumber,    FIELD_MAX.addrNumber),
    addrPostal:    sanitize(parsed.addrPostal,    FIELD_MAX.addrPostal),
    addrCity:      sanitize(parsed.addrCity,      FIELD_MAX.addrCity),
    addrCountry:   sanitize(parsed.addrCountry,   FIELD_MAX.addrCountry),
    pickupStreet:  sanitize(parsed.pickupStreet,  FIELD_MAX.pickupStreet),
    pickupNumber:  sanitize(parsed.pickupNumber,  FIELD_MAX.pickupNumber),
    pickupPostal:  sanitize(parsed.pickupPostal,  FIELD_MAX.pickupPostal),
    pickupCity:    sanitize(parsed.pickupCity,    FIELD_MAX.pickupCity),
    returnStreet:  sanitize(parsed.returnStreet,  FIELD_MAX.returnStreet),
    returnNumber:  sanitize(parsed.returnNumber,  FIELD_MAX.returnNumber),
    returnPostal:  sanitize(parsed.returnPostal,  FIELD_MAX.returnPostal),
    returnCity:    sanitize(parsed.returnCity,    FIELD_MAX.returnCity),
    sameReturn:    parsed.sameReturn === true,
    within50km:    parsed.within50km === true,
    turnstileToken: typeof parsed.turnstileToken === 'string' ? parsed.turnstileToken.trim() : undefined,
    imageBase64:   typeof parsed.imageBase64 === 'string' ? parsed.imageBase64 : undefined,
    imageFilename: sanitize(parsed.imageFilename, FIELD_MAX.imageFilename),
    imageOriginalSize:   typeof parsed.imageOriginalSize === 'number' ? parsed.imageOriginalSize : undefined,
    imageCompressedSize: typeof parsed.imageCompressedSize === 'number' ? parsed.imageCompressedSize : undefined,
    selectedServices: Array.isArray(parsed.selectedServices)
      ? (parsed.selectedServices as unknown[])
          .filter((s): s is string => typeof s === 'string')
          .map(s => s.normalize('NFKC').replace(CTRL_CHARS, '').trim().slice(0, 100))
          .filter(Boolean)
          .slice(0, 20)
      : undefined,
    address:       sanitize(parsed.address,       200),
    pickupAddress: sanitize(parsed.pickupAddress, 200),
    returnAddress: sanitize(parsed.returnAddress, 200),
    companyName:   sanitize(parsed.companyName,   FIELD_MAX.companyName),
  }

  /* 5. Honeypot — avant Turnstile pour filtrer les bots bon marché.
     Faux positif connu : Chrome/gestionnaires de mots de passe peuvent remplir
     automatiquement le champ honeypot avec la même adresse email que le champ
     email principal. Dans ce cas précis, on ne bloque pas. */
  const hpVal    = (data._hp    ?? '').trim().toLowerCase()
  const emailVal = (data.email  ?? '').trim().toLowerCase()
  const isAutofillFalsePositive = hpVal !== '' && hpVal === emailVal
  if (hpVal && !isAutofillFalsePositive) return resp({ ok: true })

  /* 6. Turnstile — bypass en développement sans clé, obligatoire sinon */
  const isDevBypass = process.env.NODE_ENV !== 'production' && !process.env.TURNSTILE_SECRET_KEY
  if (!isDevBypass) {
    const tsToken = data.turnstileToken?.trim()
    if (!tsToken) {
      return resp({ error: 'Validation anti-spam manquante.' }, 422)
    }
    const tsOk = await verifyTurnstile(tsToken)
    if (!tsOk) {
      return resp({ error: 'Validation anti-spam échouée. Veuillez réessayer.' }, 422)
    }
  }

  /* 7. Validation de base */
  const name    = (data.firstName && data.lastName)
    ? `${data.firstName} ${data.lastName}`
    : data.name
  const email   = data.email
  const message = data.message || undefined

  if (!name || !email || !data.consent) {
    return resp({ error: 'Champs requis manquants.' }, 422)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return resp({ error: 'Email invalide.' }, 422)
  }

  /* 8. Rate limiting Redis */
  const identifier = getVisitorIdentity(req)
  if (!identifier) {
    console.error('[contact/route] CHATBOT_RATE_LIMIT_SALT absent — rate limit désactivé')
    return resp({ error: 'Service temporairement indisponible.' }, 503)
  }

  let rlResult
  try {
    rlResult = await checkContactRateLimit(identifier)
  } catch {
    console.error('[contact/route] Redis indisponible')
    return resp({ error: 'Service temporairement indisponible. Réessayez dans quelques instants.' }, 503)
  }

  if (!rlResult.success) {
    return resp(
      { error: 'Trop de messages ont été envoyés. Réessayez dans quelques minutes.' },
      429,
      { 'Retry-After': String(rlResult.retryAfter) },
    )
  }

  /* 9. Validations spécifiques */
  if (data.serviceLabel) {
    if (Array.isArray(data.selectedServices) && data.selectedServices.length === 0)
      return resp({ error: 'Veuillez sélectionner au moins un service.' }, 422)
    if (data.selectedServices?.includes('Autre') && !message)
      return resp({ error: 'Veuillez décrire votre demande lorsque vous choisissez "Autre".' }, 422)
    if (data.serviceLabel === 'Service de coursier' && !data.within50km)
      return resp({ error: 'Merci de confirmer que l\'adresse se situe dans le périmètre de livraison.' }, 422)
    if (data.serviceLabel === 'Estimation rachat appareil' && (!data.paymentPref || !data.deliveryMode))
      return resp({ error: 'Veuillez indiquer votre préférence de paiement et le mode de remise.' }, 422)
  }
  if (!data.serviceLabel && !message)
    return resp({ error: 'Champs requis manquants.' }, 422)

  /* Référence rachat */
  const isBuyback = data.serviceLabel === 'Estimation rachat appareil'
  const ref       = isBuyback ? generateBuybackRef() : undefined

  const toEmail   = getToEmail(data.serviceLabel)
  const fromEmail = process.env.CONTACT_FROM_EMAIL
  const apiKey    = process.env.RESEND_API_KEY

  /* Mode dev */
  if (!toEmail || !fromEmail || !apiKey) {
    return resp({
      ok:        true,
      devMode:   true,
      reference: ref ?? null,
      message:   'Formulaire reçu (mode dev — env non configurés).',
    })
  }

  /* 10. Envoi email admin */
  const mergedData = { ...data, name: name ?? '', email, message: message ?? '' }

  try {
    const adminRes = await fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    `ClikClak Contact <${fromEmail}>`,
        to:      [toEmail],
        replyTo: email,
        subject: ref
          ? `[${ref}] Demande estimation rachat — ClikClak`
          : data.serviceLabel
            ? `[${esc(data.serviceLabel)}] ${esc(name ?? '')}`
            : `Demande contact — ${esc(name ?? '')}`,
        html: buildAdminEmail(mergedData, ref),
      }),
    })

    if (!adminRes.ok) {
      console.error('[contact/route] admin email error:', adminRes.status)
      return resp({ error: 'Envoi impossible. Réessayez ou contactez-nous directement.' }, 502)
    }
  } catch (err) {
    console.error('[contact/route] admin email fetch error:', err)
    return resp({ error: 'Erreur réseau. Réessayez ou contactez-nous directement.' }, 502)
  }

  /* Email client (rachat uniquement, non-bloquant) */
  if (isBuyback && ref) {
    fetch('https://api.resend.com/emails', {
      method:  'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    `ClikClak <${fromEmail}>`,
        to:      [email],
        subject: `[${ref}] Votre demande d'estimation ClikClak a bien été reçue`,
        html:    buildClientEmail(mergedData, ref),
      }),
    }).catch(() => {
      /* Non bloquant — la demande admin a déjà été envoyée */
    })
  }

  return resp({ ok: true, reference: ref ?? null })
}
