/*
  app/api/chatbot/route.ts — Chatbot ClikClak V2 IA

  Sécurité :
  - ANTHROPIC_API_KEY uniquement côté serveur. Jamais exposé au client.
  - Guardrails appliqués avant tout appel Anthropic.
  - Réponses Claude sanitisées avant envoi.
  - Aucun détail interne exposé au client en cas d'erreur.
*/

import { NextRequest, NextResponse }           from 'next/server'
import Anthropic                               from '@anthropic-ai/sdk'
import {
  isAllowedClikClakTopic,
  sanitizeAssistantAnswer,
  OFF_TOPIC_RESPONSE,
} from '@/lib/chatbot/guardrails'
import { CLIKCLAK_SYSTEM_PROMPT }              from '@/lib/chatbot/systemPrompt'
import { getClikClakSiteContext }              from '@/lib/chatbot/siteContext'

export const runtime = 'nodejs'

/* ── Config ─────────────────────────────────────────────────────── */

const FALLBACK_MODEL       = 'claude-haiku-4-5-20251001'
const MAX_TOKENS           = 600
const TEMPERATURE          = 0.2
const MAX_HISTORY_MESSAGES = 8
const MAX_CONTENT_LENGTH   = 1200

/* ── Types ───────────────────────────────────────────────────────── */

type Role    = 'user' | 'assistant'
type Message = { role: Role; content: string }

interface RequestBody {
  messages?: unknown
}

interface SuccessResponse {
  answer:   string
  blocked?: boolean
  reason?:  string
}

/* ── Route POST ─────────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse<SuccessResponse | { error: string }>> {

  /* 1. Parse body */
  let body: RequestBody
  try {
    body = await req.json() as RequestBody
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  /* 2. Validate messages */
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages doit être un tableau non vide.' }, { status: 400 })
  }

  /* 3. Sanitize + truncate messages */
  const rawMessages = (body.messages as Message[])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_HISTORY_MESSAGES)
    .map(m => ({
      role:    m.role,
      content: m.content.trim().slice(0, MAX_CONTENT_LENGTH),
    }))

  if (rawMessages.length === 0) {
    return NextResponse.json({ error: 'Aucun message valide.' }, { status: 400 })
  }

  /* 4. Extract last user message */
  const lastUserMsg = [...rawMessages].reverse().find(m => m.role === 'user')
  if (!lastUserMsg || !lastUserMsg.content) {
    return NextResponse.json({ error: 'Message utilisateur manquant.' }, { status: 400 })
  }

  /* 5. Guardrail — filtre hors-sujet avant tout appel Anthropic */
  if (!isAllowedClikClakTopic(lastUserMsg.content)) {
    return NextResponse.json({
      answer:  OFF_TOPIC_RESPONSE,
      blocked: true,
      reason:  'off_topic',
    })
  }

  /* 6. Check API key */
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('[chatbot/route] ANTHROPIC_API_KEY manquant')
    return NextResponse.json({
      answer: 'Le chatbot IA est momentanément indisponible. Vous pouvez contacter Clik Clak directement.',
    }, { status: 500 })
  }

  /* 7. Build system prompt avec contexte site */
  const systemPrompt = `${CLIKCLAK_SYSTEM_PROMPT}\n\n${getClikClakSiteContext()}`

  /* 8. Call Anthropic */
  const model  = process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL
  const client = new Anthropic({ apiKey })

  const DEV = process.env.NODE_ENV === 'development'

  try {
    if (DEV) console.log(`[chatbot] Appel Anthropic — modèle: ${model}, messages: ${rawMessages.length}`)

    const response = await client.messages.create({
      model,
      max_tokens:  MAX_TOKENS,
      temperature: TEMPERATURE,
      system:      systemPrompt,
      messages:    rawMessages,
    })

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text)
      .join('\n')
      .trim()

    if (!text) {
      return NextResponse.json({
        answer: "Je n'ai pas pu générer de réponse. Contactez Clik Clak directement.",
      })
    }

    return NextResponse.json({ answer: sanitizeAssistantAnswer(text) })

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[chatbot/route] Erreur Anthropic:', msg.slice(0, 200))
    return NextResponse.json({
      answer: 'Le chatbot IA est momentanément indisponible. Vous pouvez contacter Clik Clak directement.',
    }, { status: 503 })
  }
}
