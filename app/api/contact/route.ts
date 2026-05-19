import { NextRequest, NextResponse } from 'next/server'

/*
  Route API contact — /api/contact (POST)

  Variables d'environnement :
    CONTACT_TO_EMAIL        : destinataire général (ex: info@clikclak.ch)
    CONTACT_FROM_EMAIL      : expéditeur vérifié Resend (ex: noreply@clikclak.ch)
    RESEND_API_KEY          : clé API Resend
    CONTACT_BUYBACK_EMAIL   : (optionnel) rachat → si absent, CONTACT_TO_EMAIL
    CONTACT_COURIER_EMAIL   : (optionnel) coursier → si absent, CONTACT_TO_EMAIL
    CONTACT_DEPANNAGE_EMAIL : (optionnel) dépannage → si absent, CONTACT_TO_EMAIL

  Sécurité :
    - Honeypot obligatoire vide
    - Validation côté serveur des champs requis
    - Taille payload ~6 Mo
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
  if (serviceLabel === 'Estimation rachat appareil') return process.env.CONTACT_BUYBACK_EMAIL  ?? fallback
  if (serviceLabel === 'Service de coursier')         return process.env.CONTACT_COURIER_EMAIL   ?? fallback
  if (serviceLabel === 'Dépannage à domicile')        return process.env.CONTACT_DEPANNAGE_EMAIL ?? fallback
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
  const row = (label: string, value: string | undefined) =>
    value
      ? `<tr><td style="padding:6px 12px;color:#888;font-size:13px;width:175px;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 12px;font-size:13px">${esc(value)}</td></tr>`
      : ''

  const isBuyback = data.serviceLabel === 'Estimation rachat appareil'
  const title     = ref ? `[${esc(ref)}] Demande estimation rachat — ClikClak` : (data.serviceLabel ? `Demande ${esc(data.serviceLabel)} — ClikClak` : 'Nouvelle demande — ClikClak')

  const clientName = [data.firstName, data.lastName].filter(Boolean).join(' ') || data.name || ''
  const fullAddr   = addrStr(data.addrStreet, data.addrNumber, data.addrPostal, data.addrCity, data.addrCountry)
  const pickupFull = addrStr(data.pickupStreet, data.pickupNumber, data.pickupPostal, data.pickupCity)
  const returnFull = data.sameReturn ? 'Identique à la prise en charge' : addrStr(data.returnStreet, data.returnNumber, data.returnPostal, data.returnCity)

  const servicesRow = data.selectedServices?.length
    ? `<tr><td style="padding:6px 12px;color:#888;font-size:13px;width:175px;white-space:nowrap;vertical-align:top">Services souhaités</td><td style="padding:6px 12px;font-size:13px">${data.selectedServices.map(esc).join(', ')}</td></tr>`
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
      <p style="margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap">${esc(data.message)}</p>
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
        ${row('Prénom', data.firstName)}
        ${row('Nom', data.lastName)}
        ${!data.firstName ? row('Nom', clientName) : ''}
        ${row('Email', data.email)}
        ${row('Téléphone', data.phone)}
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
          `<p style="margin:0 0 6px;font-size:13px"><span style="color:#888">${l} :</span> ${esc(v as string)}</p>`
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
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > 6_000_000) {
    return NextResponse.json({ error: 'Payload trop lourd.' }, { status: 413 })
  }

  let data: ContactPayload
  try { data = await req.json() }
  catch { return NextResponse.json({ error: 'Données invalides.' }, { status: 400 }) }

  /* Honeypot */
  if (data._hp?.trim()) return NextResponse.json({ ok: true })

  /* Turnstile — bypass en développement sans clé, obligatoire sinon */
  const isDevBypass = process.env.NODE_ENV !== 'production' && !process.env.TURNSTILE_SECRET_KEY
  if (!isDevBypass) {
    const tsToken = data.turnstileToken?.trim()
    if (!tsToken) {
      return NextResponse.json({ error: 'Validation anti-spam manquante.' }, { status: 422 })
    }
    const tsOk = await verifyTurnstile(tsToken)
    if (!tsOk) {
      return NextResponse.json({ error: 'Validation anti-spam échouée. Veuillez réessayer.' }, { status: 422 })
    }
  }

  /* Validation de base */
  const name    = (data.firstName && data.lastName)
    ? `${data.firstName.trim()} ${data.lastName.trim()}`
    : data.name?.trim()
  const email   = data.email?.trim()
  const message = data.message?.trim()

  if (!name || !email || !data.consent) {
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 422 })
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide.' }, { status: 422 })
  }

  /* Validations spécifiques */
  if (data.serviceLabel) {
    if (Array.isArray(data.selectedServices) && data.selectedServices.length === 0)
      return NextResponse.json({ error: 'Veuillez sélectionner au moins un service.' }, { status: 422 })
    if (data.selectedServices?.includes('Autre') && !message)
      return NextResponse.json({ error: 'Veuillez décrire votre demande lorsque vous choisissez "Autre".' }, { status: 422 })
    if (data.serviceLabel === 'Service de coursier' && !data.within50km)
      return NextResponse.json({ error: 'Merci de confirmer que l\'adresse se situe dans le périmètre de livraison.' }, { status: 422 })
    if (data.serviceLabel === 'Estimation rachat appareil' && (!data.paymentPref || !data.deliveryMode))
      return NextResponse.json({ error: 'Veuillez indiquer votre préférence de paiement et le mode de remise.' }, { status: 422 })
  }
  if (!data.serviceLabel && !message)
    return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 422 })

  /* Référence rachat */
  const isBuyback = data.serviceLabel === 'Estimation rachat appareil'
  const ref       = isBuyback ? generateBuybackRef() : undefined

  const toEmail   = getToEmail(data.serviceLabel)
  const fromEmail = process.env.CONTACT_FROM_EMAIL
  const apiKey    = process.env.RESEND_API_KEY

  /* Mode dev */
  if (!toEmail || !fromEmail || !apiKey) {
    return NextResponse.json({
      ok:        true,
      devMode:   true,
      reference: ref ?? null,
      message:   'Formulaire reçu (mode dev — env non configurés).',
    })
  }

  /* Envoi email admin */
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
      return NextResponse.json({ error: 'Envoi impossible. Réessayez ou contactez-nous directement.' }, { status: 502 })
    }
  } catch (err) {
    console.error('[contact/route] admin email fetch error:', err)
    return NextResponse.json({ error: 'Erreur réseau. Réessayez ou contactez-nous directement.' }, { status: 502 })
  }

  /* Envoi email client (rachat uniquement, non-bloquant) */
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

  return NextResponse.json({ ok: true, reference: ref ?? null })
}
