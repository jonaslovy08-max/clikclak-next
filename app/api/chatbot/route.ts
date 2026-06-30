/*
  app/api/chatbot/route.ts — Chatbot ClikClak V2 IA — bilingue FR/EN

  Pipeline de traitement (ordre strict) :
    1. Feature flag CHATBOT_ENABLED
    2. Validation Content-Type
    3. Limite taille body
    4. Parsing JSON + extraction locale (fr|en, défaut fr) + validation schéma strict
    5. Normalisation NFKC + nettoyage
    6. Identifiant visiteur anonyme
    7. Vérification blocage temporaire
    8. Rate limiting (minute / heure / jour)
    9. Guardrails — injection et hors-sujet (toujours appliqués aux deux langues)
   10. Construction prompt système + historique validé (localisés)
   11. Appel Anthropic (timeout 20s, 0 retry)
   12. Sanitisation de la réponse (localisée)
   13. Réponse avec Cache-Control: no-store

  Sécurité :
  - ANTHROPIC_API_KEY uniquement côté serveur
  - Aucune donnée personnelle loggée
  - Aucun message d'erreur technique exposé au client
  - Panne Redis → 503 (fail closed)
  - La locale du body est une simple préférence d'affichage : elle ne
    contourne JAMAIS les guardrails (injection/hors-sujet), qui couvrent
    les deux langues indépendamment de ce que le client déclare.
*/

import { NextRequest, NextResponse } from 'next/server'
import Anthropic                     from '@anthropic-ai/sdk'

import { CHATBOT_ENABLED }         from '@/lib/config/features'
import { CHATBOT_LIMITS }          from '@/lib/chatbot/config'
import { parseChatbotLocale, type ChatbotLocale } from '@/lib/chatbot/locale'
import { apiMessage }              from '@/lib/chatbot/apiMessages'
import { getVisitorIdentity }      from '@/lib/chatbot/requestIdentity'
import {
  checkRateLimit,
  isTemporarilyBlocked,
  registerViolation,
}                                  from '@/lib/chatbot/rateLimiter'
import {
  detectInjectionAttempt,
  isAllowedClikClakTopic,
  isGreeting,
  sanitizeAssistantAnswer,
  OFF_TOPIC_RESPONSE,
  INJECTION_RESPONSE,
  GREETING_RESPONSE,
}                                  from '@/lib/chatbot/guardrails'
import { getClikClakSystemPrompt } from '@/lib/chatbot/systemPrompt'
import { getClikClakSiteContext }  from '@/lib/chatbot/siteContext'
import {
  resolveRepairPricing,
  buildPricingResponse,
  detectBrandTokenFromMessage,
  detectRepairTokenFromMessage,
}                                  from '@/lib/chatbot/repairPricing'

export const runtime = 'nodejs'

/* ── Helpers réponse ─────────────────────────────────────────────── */

type JsonObj = Record<string, unknown>

function json(body: JsonObj, status = 200, extraHeaders?: Record<string, string>): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
  })
}

/* ── Modèle ──────────────────────────────────────────────────────── */

const FALLBACK_MODEL = 'claude-haiku-4-5-20251001'

/* ── Normalisation du contenu message ───────────────────────────── */

function normalizeContent(raw: string): string {
  return raw
    .normalize('NFKC')
    /* Caractères de contrôle (sauf tab \t, LF \n, CR \r) */
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
}

/* ── Validation du schéma messages ──────────────────────────────── */

type ValidRole    = 'user' | 'assistant'
type ValidMessage = { role: ValidRole; content: string }

type SchemaResult =
  | { ok: true;  messages: ValidMessage[] }
  | { ok: false; code: 'INVALID_BODY' | 'MESSAGES_NOT_ARRAY' | 'MESSAGES_EMPTY' | 'TOO_MANY_MESSAGES' | 'MESSAGE_INVALID' | 'ROLE_MISSING' | 'ROLE_INVALID' | 'CONTENT_NOT_STRING' | 'LAST_MUST_BE_USER'; vars?: Record<string, string | number> }

function validateSchema(parsed: unknown): SchemaResult {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, code: 'INVALID_BODY' }
  }

  const body = parsed as Record<string, unknown>

  if (!Array.isArray(body.messages)) {
    return { ok: false, code: 'MESSAGES_NOT_ARRAY' }
  }

  const msgs = body.messages as unknown[]

  if (msgs.length === 0) {
    return { ok: false, code: 'MESSAGES_EMPTY' }
  }

  if (msgs.length > CHATBOT_LIMITS.maxHistoryMessages) {
    return { ok: false, code: 'TOO_MANY_MESSAGES', vars: { max: CHATBOT_LIMITS.maxHistoryMessages } }
  }

  const validated: ValidMessage[] = []

  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i]
    if (!m || typeof m !== 'object' || Array.isArray(m)) {
      return { ok: false, code: 'MESSAGE_INVALID', vars: { index: i } }
    }

    const msg = m as Record<string, unknown>

    if (typeof msg.role !== 'string') {
      return { ok: false, code: 'ROLE_MISSING', vars: { index: i } }
    }

    if (msg.role !== 'user' && msg.role !== 'assistant') {
      return { ok: false, code: 'ROLE_INVALID', vars: { index: i } }
    }

    if (typeof msg.content !== 'string') {
      return { ok: false, code: 'CONTENT_NOT_STRING', vars: { index: i } }
    }

    validated.push({ role: msg.role as ValidRole, content: msg.content })
  }

  /* Le dernier message doit être de l'utilisateur */
  if (validated[validated.length - 1].role !== 'user') {
    return { ok: false, code: 'LAST_MUST_BE_USER' }
  }

  return { ok: true, messages: validated }
}

/* ── Normalisation et validation des longueurs ───────────────────── */

type NormResult =
  | { ok: true;  messages: ValidMessage[] }
  | { ok: false; code: 'EMPTY_CONTENT' | 'CONTENT_TOO_LONG'; vars?: Record<string, string | number> }

function normalizeMessages(messages: ValidMessage[]): NormResult {
  const result: ValidMessage[] = []

  for (let i = 0; i < messages.length; i++) {
    const normalized = normalizeContent(messages[i].content)

    if (!normalized) {
      return { ok: false, code: 'EMPTY_CONTENT', vars: { index: i } }
    }

    if (normalized.length > CHATBOT_LIMITS.maxInputCharacters) {
      return { ok: false, code: 'CONTENT_TOO_LONG', vars: { max: CHATBOT_LIMITS.maxInputCharacters } }
    }

    result.push({ role: messages[i].role, content: normalized })
  }

  return { ok: true, messages: result }
}

/* ── Extraction texte Anthropic ──────────────────────────────────── */

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()
}

/* ── Route POST ──────────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse> {

  /* ── Étape 1 : Feature flag ─────────────────────────────────────── */
  if (!CHATBOT_ENABLED) {
    /* Locale pas encore connue à ce stade (body pas encore lu) — défaut fr */
    return json({ error: apiMessage('CHATBOT_DISABLED', 'fr'), code: 'CHATBOT_DISABLED' }, 503)
  }

  /* ── Étape 2 : Content-Type ─────────────────────────────────────── */
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return json({ error: apiMessage('UNSUPPORTED_MEDIA_TYPE', 'fr'), code: 'UNSUPPORTED_MEDIA_TYPE' }, 415)
  }

  /* ── Étape 3 : Taille du body ───────────────────────────────────── */

  /* Vérification rapide via Content-Length si disponible */
  const cl = req.headers.get('content-length')
  if (cl) {
    const bytes = parseInt(cl, 10)
    if (!isNaN(bytes) && bytes > CHATBOT_LIMITS.maxBodyBytes) {
      return json({ error: apiMessage('PAYLOAD_TOO_LARGE', 'fr'), code: 'PAYLOAD_TOO_LARGE' }, 413)
    }
  }

  /* Lecture et vérification réelle */
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return json({ error: apiMessage('READ_ERROR', 'fr'), code: 'READ_ERROR' }, 400)
  }

  if (Buffer.byteLength(rawBody, 'utf-8') > CHATBOT_LIMITS.maxBodyBytes) {
    return json({ error: apiMessage('PAYLOAD_TOO_LARGE', 'fr'), code: 'PAYLOAD_TOO_LARGE' }, 413)
  }

  /* ── Étape 4 : JSON + locale + validation schéma ────────────────── */
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return json({ error: apiMessage('INVALID_JSON', 'fr'), code: 'INVALID_JSON' }, 400)
  }

  /* Locale déclarée par le client — jamais une valeur libre, jamais de
     confiance aveugle : strictement 'fr' ou 'en', défaut 'fr'. N'affecte
     que l'affichage (textes, prompt système, sens de réponse) — jamais
     les guardrails de sécurité, appliqués identiquement aux deux langues. */
  const locale: ChatbotLocale = parseChatbotLocale(
    parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>).locale
      : undefined,
  )

  const schemaResult = validateSchema(parsed)
  if (!schemaResult.ok) {
    return json({ error: apiMessage(schemaResult.code, locale, schemaResult.vars), code: schemaResult.code }, 400)
  }

  /* ── Étape 5 : Normalisation ────────────────────────────────────── */
  const normResult = normalizeMessages(schemaResult.messages)
  if (!normResult.ok) {
    return json({ error: apiMessage(normResult.code, locale, normResult.vars), code: normResult.code }, 400)
  }
  const messages = normResult.messages

  /* ── Étape 6 : Identifiant visiteur ─────────────────────────────── */
  const identifier = getVisitorIdentity(req)
  if (!identifier) {
    /* Salt absent — fail closed sans appeler Anthropic */
    console.error('[chatbot] CHATBOT_RATE_LIMIT_SALT absent ou invalide')
    return json({ error: apiMessage('CHATBOT_UNAVAILABLE', locale), code: 'CHATBOT_UNAVAILABLE' }, 503)
  }

  /* ── Étape 7 : Blocage temporaire ───────────────────────────────── */
  let blocked: boolean
  try {
    blocked = await isTemporarilyBlocked(identifier)
  } catch {
    console.error('[chatbot] Redis indisponible — blocage non vérifiable')
    return json({ error: apiMessage('CHATBOT_UNAVAILABLE', locale), code: 'CHATBOT_UNAVAILABLE' }, 503)
  }

  if (blocked) {
    return json({ error: apiMessage('TEMPORARILY_BLOCKED', locale), code: 'TEMPORARILY_BLOCKED' }, 429, {
      'Retry-After': String(CHATBOT_LIMITS.blockDurationSeconds),
    })
  }

  /* ── Étape 8 : Rate limiting ────────────────────────────────────── */
  let rlResult
  try {
    rlResult = await checkRateLimit(identifier)
  } catch {
    console.error('[chatbot] Redis indisponible — rate limit non applicable')
    return json({ error: apiMessage('CHATBOT_UNAVAILABLE', locale), code: 'CHATBOT_UNAVAILABLE' }, 503)
  }

  if (!rlResult.success) {
    const retryAfter = Math.max(1, Math.ceil((rlResult.reset - Date.now()) / 1000))
    return json({ error: apiMessage('RATE_LIMITED', locale), code: 'RATE_LIMITED' }, 429, {
      'Retry-After':           String(retryAfter),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset':     String(rlResult.reset),
    })
  }

  /* ── Étape 9 : Guardrails ───────────────────────────────────────── */

  /* Analyser le dernier message + les derniers messages user combinés.
     Détection toujours bilingue, indépendamment de `locale`. */
  const lastUserMsg     = [...messages].reverse().find(m => m.role === 'user')!
  const recentUserTexts = messages.filter(m => m.role === 'user').slice(-3).map(m => m.content).join(' ')

  /* 9a. Salutations — réponse locale immédiate, pas d'Anthropic */
  if (isGreeting(lastUserMsg.content)) {
    return json({ answer: GREETING_RESPONSE[locale] })
  }

  /* 9b. Injection manifeste */
  if (detectInjectionAttempt(lastUserMsg.content) || detectInjectionAttempt(recentUserTexts)) {
    try {
      await registerViolation(identifier)
    } catch (e) {
      console.error('[chatbot] Erreur enregistrement violation:', e instanceof Error ? e.message : String(e))
    }
    return json({ answer: INJECTION_RESPONSE[locale] })
  }

  /* 9c. Filtre hors-sujet.
     Pour les messages très courts (ex : "Écran", "Et pour le 14 Pro ?"),
     on accepte si le contexte récent est clairement ClikClak. */
  const topicOk = isAllowedClikClakTopic(lastUserMsg.content) ||
    (lastUserMsg.content.length <= 28 && isAllowedClikClakTopic(recentUserTexts))
  if (!topicOk) {
    return json({ answer: OFF_TOPIC_RESPONSE[locale], blocked: true, reason: 'off_topic' })
  }

  /* 9d. Résolveur tarifaire déterministe avec contexte multi-tour.
     Stratégie :
       1. Analyser le dernier message seul.
       2. Si résultat incomplet, relancer avec les derniers messages utilisateur combinés
          (jusqu'à 5 tours) pour récupérer le modèle ou la réparation mentionnés avant.
       3. Utiliser le résultat le plus précis.
     Aucun appel Anthropic si marque + modèle + réparation sont tous résolus. */

  /* Priorité des statuts — plus la valeur est haute, plus le résultat est complet */
  const STATUS_PRIORITY: Record<string, number> = {
    found:          5,
    no_price:       4,
    repair_needed:  3,
    model_needed:   3,
    brand_only:     2,
    not_found:      1,
  }

  let pricingMatch = resolveRepairPricing(lastUserMsg.content)

  const recentUserContent = messages
    .filter(m => m.role === 'user')
    .slice(-5)
    .map(m => m.content)
    .join(' ')

  /* Cas 1 — message sans marque ni numéro de modèle (ex : "Écran", "Batterie") :
     compléter avec l'historique récent qui contient peut-être le modèle. */
  const currentHasModelNumber = /\b(iphone|samsung|galaxy|ipad|macbook)?\s*\d{1,2}\b/i.test(lastUserMsg.content)

  if (
    STATUS_PRIORITY[pricingMatch.status] < STATUS_PRIORITY['found'] &&
    !currentHasModelNumber &&
    recentUserContent !== lastUserMsg.content
  ) {
    const ctxMatch = resolveRepairPricing(recentUserContent)
    if ((STATUS_PRIORITY[ctxMatch.status] ?? 0) > (STATUS_PRIORITY[pricingMatch.status] ?? 0)) {
      pricingMatch = ctxMatch
    }
  }

  /* Cas 2 — message avec numéro de modèle mais sans marque (ex : "Et pour le 14 Pro ?") :
     construire une requête augmentée en préfixant la marque et la réparation du contexte.
     Cela évite qu'Anthropic réponde avec un prix inventé. */
  if (currentHasModelNumber && pricingMatch.status === 'not_found') {
    const ctxBrandToken  = detectBrandTokenFromMessage(recentUserContent)
    const ctxRepairToken = detectRepairTokenFromMessage(recentUserContent)

    if (ctxBrandToken) {
      const prefix    = ctxRepairToken ? `${ctxBrandToken} ${ctxRepairToken}` : ctxBrandToken
      const augmented = `${prefix} ${lastUserMsg.content}`
      const augMatch  = resolveRepairPricing(augmented)
      if ((STATUS_PRIORITY[augMatch.status] ?? 0) > (STATUS_PRIORITY[pricingMatch.status] ?? 0)) {
        pricingMatch = augMatch
      }
    }
  }

  if (
    pricingMatch.status === 'found'         ||
    pricingMatch.status === 'no_price'      ||
    pricingMatch.status === 'model_needed'  ||
    pricingMatch.status === 'repair_needed' ||
    pricingMatch.status === 'brand_only'
  ) {
    const { answer, actions } = buildPricingResponse(pricingMatch, locale)
    if (answer) {
      return json({ answer, actions: actions.length > 0 ? actions : undefined })
    }
  }

  /* ── Étape 10 : Clé API + prompt système ────────────────────────── */
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[chatbot] ANTHROPIC_API_KEY absente')
    return json({ error: apiMessage('CHATBOT_UNAVAILABLE', locale), code: 'CHATBOT_UNAVAILABLE' }, 503)
  }

  const systemPrompt = `${getClikClakSystemPrompt(locale)}\n\n${getClikClakSiteContext(locale)}`
  const model        = process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL

  const client = new Anthropic({
    apiKey,
    timeout:    CHATBOT_LIMITS.timeoutMs,
    maxRetries: 0,
  })

  /* ── Étape 11 : Appel Anthropic ─────────────────────────────────── */
  const start = Date.now()

  try {
    const response = await client.messages.create({
      model,
      max_tokens:  CHATBOT_LIMITS.maxOutputTokens,
      temperature: 0.2,
      system:      systemPrompt,
      messages,
    })

    /* ── Étape 12 : Sanitisation de la réponse ───────────────────── */
    const rawText = extractText(response.content)
    const answer  = sanitizeAssistantAnswer(rawText, locale)

    return json({ answer })

  } catch (err: unknown) {
    const duration = Date.now() - start

    /* Logging minimal — jamais de clé, prompt, messages ou IP */
    if (err instanceof Anthropic.APIConnectionTimeoutError) {
      console.error('[chatbot] Timeout Anthropic', { duration, model })
    } else if (err instanceof Anthropic.APIError) {
      const requestId = (err as { headers?: Record<string, string> }).headers?.['x-request-id']
      console.error('[chatbot] Erreur API Anthropic', {
        status: err.status,
        model,
        duration,
        requestId,
      })
    } else {
      console.error('[chatbot] Erreur inattendue', { model, duration })
    }

    return json({ error: apiMessage('CHATBOT_UNAVAILABLE', locale), code: 'CHATBOT_UNAVAILABLE' }, 503)
  }
}
