/*
  app/api/chatbot/route.ts — Chatbot ClikClak V2 IA

  Pipeline de traitement (ordre strict) :
    1. Feature flag CHATBOT_ENABLED
    2. Validation Content-Type
    3. Limite taille body
    4. Parsing JSON + validation schéma strict
    5. Normalisation NFKC + nettoyage
    6. Identifiant visiteur anonyme
    7. Vérification blocage temporaire
    8. Rate limiting (minute / heure / jour)
    9. Guardrails — injection et hors-sujet
   10. Construction prompt système + historique validé
   11. Appel Anthropic (timeout 20s, 0 retry)
   12. Sanitisation de la réponse
   13. Réponse avec Cache-Control: no-store

  Sécurité :
  - ANTHROPIC_API_KEY uniquement côté serveur
  - Aucune donnée personnelle loggée
  - Aucun message d'erreur technique exposé au client
  - Panne Redis → 503 (fail closed)
*/

import { NextRequest, NextResponse } from 'next/server'
import Anthropic                     from '@anthropic-ai/sdk'

import { CHATBOT_ENABLED }         from '@/lib/config/features'
import { CHATBOT_LIMITS }          from '@/lib/chatbot/config'
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
import { CLIKCLAK_SYSTEM_PROMPT }  from '@/lib/chatbot/systemPrompt'
import { getClikClakSiteContext }  from '@/lib/chatbot/siteContext'
import {
  resolveRepairPricing,
  buildPricingResponse,
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
  | { ok: false; error: string }

function validateSchema(parsed: unknown): SchemaResult {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Format de requête invalide.' }
  }

  const body = parsed as Record<string, unknown>

  if (!Array.isArray(body.messages)) {
    return { ok: false, error: 'messages doit être un tableau.' }
  }

  const msgs = body.messages as unknown[]

  if (msgs.length === 0) {
    return { ok: false, error: 'messages ne peut pas être vide.' }
  }

  if (msgs.length > CHATBOT_LIMITS.maxHistoryMessages) {
    return { ok: false, error: `Trop de messages (maximum ${CHATBOT_LIMITS.maxHistoryMessages}).` }
  }

  const validated: ValidMessage[] = []

  for (let i = 0; i < msgs.length; i++) {
    const m = msgs[i]
    if (!m || typeof m !== 'object' || Array.isArray(m)) {
      return { ok: false, error: `Message ${i} invalide.` }
    }

    const msg = m as Record<string, unknown>

    if (typeof msg.role !== 'string') {
      return { ok: false, error: `Message ${i} : role manquant.` }
    }

    if (msg.role !== 'user' && msg.role !== 'assistant') {
      return { ok: false, error: `Message ${i} : role invalide (user ou assistant uniquement).` }
    }

    if (typeof msg.content !== 'string') {
      return { ok: false, error: `Message ${i} : content doit être une chaîne.` }
    }

    validated.push({ role: msg.role as ValidRole, content: msg.content })
  }

  /* Le dernier message doit être de l'utilisateur */
  if (validated[validated.length - 1].role !== 'user') {
    return { ok: false, error: 'Le dernier message doit être de l\'utilisateur.' }
  }

  return { ok: true, messages: validated }
}

/* ── Normalisation et validation des longueurs ───────────────────── */

type NormResult =
  | { ok: true;  messages: ValidMessage[] }
  | { ok: false; error: string; code: string }

function normalizeMessages(messages: ValidMessage[]): NormResult {
  const result: ValidMessage[] = []

  for (let i = 0; i < messages.length; i++) {
    const normalized = normalizeContent(messages[i].content)

    if (!normalized) {
      return { ok: false, error: `Message ${i} vide après normalisation.`, code: 'EMPTY_CONTENT' }
    }

    if (normalized.length > CHATBOT_LIMITS.maxInputCharacters) {
      return {
        ok:    false,
        error: `Message trop long (maximum ${CHATBOT_LIMITS.maxInputCharacters} caractères).`,
        code:  'CONTENT_TOO_LONG',
      }
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
    return json({
      error: 'Le chatbot est temporairement indisponible.',
      code:  'CHATBOT_DISABLED',
    }, 503)
  }

  /* ── Étape 2 : Content-Type ─────────────────────────────────────── */
  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return json({
      error: 'Format de requête non pris en charge.',
      code:  'UNSUPPORTED_MEDIA_TYPE',
    }, 415)
  }

  /* ── Étape 3 : Taille du body ───────────────────────────────────── */

  /* Vérification rapide via Content-Length si disponible */
  const cl = req.headers.get('content-length')
  if (cl) {
    const bytes = parseInt(cl, 10)
    if (!isNaN(bytes) && bytes > CHATBOT_LIMITS.maxBodyBytes) {
      return json({
        error: 'Corps de requête trop volumineux.',
        code:  'PAYLOAD_TOO_LARGE',
      }, 413)
    }
  }

  /* Lecture et vérification réelle */
  let rawBody: string
  try {
    rawBody = await req.text()
  } catch {
    return json({ error: 'Impossible de lire la requête.', code: 'READ_ERROR' }, 400)
  }

  if (Buffer.byteLength(rawBody, 'utf-8') > CHATBOT_LIMITS.maxBodyBytes) {
    return json({
      error: 'Corps de requête trop volumineux.',
      code:  'PAYLOAD_TOO_LARGE',
    }, 413)
  }

  /* ── Étape 4 : JSON + validation schéma ─────────────────────────── */
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    return json({ error: 'JSON invalide.', code: 'INVALID_JSON' }, 400)
  }

  const schemaResult = validateSchema(parsed)
  if (!schemaResult.ok) {
    return json({ error: schemaResult.error, code: 'INVALID_SCHEMA' }, 400)
  }

  /* ── Étape 5 : Normalisation ────────────────────────────────────── */
  const normResult = normalizeMessages(schemaResult.messages)
  if (!normResult.ok) {
    return json({ error: normResult.error, code: normResult.code }, 400)
  }
  const messages = normResult.messages

  /* ── Étape 6 : Identifiant visiteur ─────────────────────────────── */
  const identifier = getVisitorIdentity(req)
  if (!identifier) {
    /* Salt absent — fail closed sans appeler Anthropic */
    console.error('[chatbot] CHATBOT_RATE_LIMIT_SALT absent ou invalide')
    return json({
      error: 'Le chatbot est temporairement indisponible.',
      code:  'CHATBOT_UNAVAILABLE',
    }, 503)
  }

  /* ── Étape 7 : Blocage temporaire ───────────────────────────────── */
  let blocked: boolean
  try {
    blocked = await isTemporarilyBlocked(identifier)
  } catch {
    console.error('[chatbot] Redis indisponible — blocage non vérifiable')
    return json({
      error: 'Le chatbot est temporairement indisponible.',
      code:  'CHATBOT_UNAVAILABLE',
    }, 503)
  }

  if (blocked) {
    return json({
      error: 'Trop de demandes ont été envoyées. Réessayez plus tard.',
      code:  'TEMPORARILY_BLOCKED',
    }, 429, {
      'Retry-After': String(CHATBOT_LIMITS.blockDurationSeconds),
    })
  }

  /* ── Étape 8 : Rate limiting ────────────────────────────────────── */
  let rlResult
  try {
    rlResult = await checkRateLimit(identifier)
  } catch {
    console.error('[chatbot] Redis indisponible — rate limit non applicable')
    return json({
      error: 'Le chatbot est temporairement indisponible.',
      code:  'CHATBOT_UNAVAILABLE',
    }, 503)
  }

  if (!rlResult.success) {
    const retryAfter = Math.max(1, Math.ceil((rlResult.reset - Date.now()) / 1000))
    return json({
      error: 'Trop de demandes ont été envoyées. Réessayez plus tard.',
      code:  'RATE_LIMITED',
    }, 429, {
      'Retry-After':         String(retryAfter),
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset':   String(rlResult.reset),
    })
  }

  /* ── Étape 9 : Guardrails ───────────────────────────────────────── */

  /* Analyser le dernier message + les derniers messages user combinés */
  const lastUserMsg     = [...messages].reverse().find(m => m.role === 'user')!
  const recentUserTexts = messages.filter(m => m.role === 'user').slice(-3).map(m => m.content).join(' ')

  /* 9a. Salutations — réponse locale immédiate, pas d'Anthropic */
  if (isGreeting(lastUserMsg.content)) {
    return json({ answer: GREETING_RESPONSE })
  }

  /* 9b. Injection manifeste */
  if (detectInjectionAttempt(lastUserMsg.content) || detectInjectionAttempt(recentUserTexts)) {
    try {
      await registerViolation(identifier)
    } catch (e) {
      console.error('[chatbot] Erreur enregistrement violation:', e instanceof Error ? e.message : String(e))
    }
    return json({ answer: INJECTION_RESPONSE })
  }

  /* 9c. Filtre hors-sujet */
  if (!isAllowedClikClakTopic(lastUserMsg.content)) {
    return json({ answer: OFF_TOPIC_RESPONSE, blocked: true, reason: 'off_topic' })
  }

  /* 9d. Résolveur tarifaire déterministe — retourne sans appeler Anthropic si trouvé */
  const pricingMatch = resolveRepairPricing(lastUserMsg.content)

  if (
    pricingMatch.status === 'found'         ||
    pricingMatch.status === 'no_price'      ||
    pricingMatch.status === 'model_needed'  ||
    pricingMatch.status === 'repair_needed' ||
    pricingMatch.status === 'brand_only'
  ) {
    const { answer, actions } = buildPricingResponse(pricingMatch)
    if (answer) {
      return json({ answer, actions: actions.length > 0 ? actions : undefined })
    }
  }

  /* ── Étape 10 : Clé API + prompt système ────────────────────────── */
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[chatbot] ANTHROPIC_API_KEY absente')
    return json({
      error: 'Le service est temporairement indisponible. Vous pouvez contacter directement ClikClak.',
      code:  'CHATBOT_UNAVAILABLE',
    }, 503)
  }

  const systemPrompt = `${CLIKCLAK_SYSTEM_PROMPT}\n\n${getClikClakSiteContext()}`
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
    const answer  = sanitizeAssistantAnswer(rawText)

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

    return json({
      error: 'Le service est temporairement indisponible. Vous pouvez contacter directement ClikClak.',
      code:  'CHATBOT_UNAVAILABLE',
    }, 503)
  }
}
