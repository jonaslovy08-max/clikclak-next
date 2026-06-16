import { NextRequest, NextResponse }         from 'next/server'
import Anthropic                             from '@anthropic-ai/sdk'
import { CHATBOT_SYSTEM_PROMPT }            from '@/lib/chatbot/chatbotSystemPrompt'
import { CHATBOT_TOOLS, executeTool }       from '@/lib/chatbot/chatbotTools'
import {
  isAllowedClikClakTopic,
  OFF_TOPIC_RESPONSE,
} from '@/lib/chatbot/guardrails'

/* ── Config ─────────────────────────────────────────────────────── */

const MAX_MESSAGE_LENGTH  = 1000
const MAX_HISTORY_TURNS   = 6   // 6 messages (3 échanges user+assistant)
const MAX_TOKENS_RESPONSE = 600
const FALLBACK_MODEL      = 'claude-haiku-4-5-20251001'

/* ── Helpers ────────────────────────────────────────────────────── */

type HistoryMessage = { role: 'user' | 'assistant'; content: string }

interface ChatRequest {
  message: string
  history?: HistoryMessage[]
}

interface ChatResponse {
  message:      string
  suggestions?: { label: string; href?: string }[]
  results?:     { title: string; href: string; description?: string }[]
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()
}

/* ── Route handler ──────────────────────────────────────────────── */

export async function POST(req: NextRequest): Promise<NextResponse<ChatResponse>> {
  /* ── 1. Parse + validate ── */
  let body: ChatRequest
  try {
    body = await req.json() as ChatRequest
  } catch {
    return NextResponse.json({ message: 'Requête invalide.' }, { status: 400 })
  }

  const { message, history = [] } = body

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ message: 'Message requis.' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ message: 'Message trop long (max 1000 caractères).' }, { status: 400 })
  }

  /* ── Guardrail — identique à /api/chatbot ── */
  if (!isAllowedClikClakTopic(message)) {
    return NextResponse.json({
      message: OFF_TOPIC_RESPONSE,
      blocked: true,
      reason:  'off_topic',
    } as ChatResponse & { blocked: boolean; reason: string })
  }

  /* ── 2. Check API key ── */
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({
      message:     "L'assistant IA n'est pas encore configuré. Vous pouvez utiliser les raccourcis ou contacter ClikClak.",
      suggestions: [{ label: 'Contacter ClikClak', href: '/contact-clik-clak-lausanne' }],
    })
  }

  /* ── 3. Build messages ── */
  const trimmedHistory = history.slice(-MAX_HISTORY_TURNS)
  const messages: Anthropic.MessageParam[] = [
    ...trimmedHistory.map(m => ({
      role:    m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user' as const, content: message },
  ]

  /* ── 4. Call Claude ── */
  const model = process.env.ANTHROPIC_MODEL ?? FALLBACK_MODEL
  const client = new Anthropic({ apiKey })

  try {
    let response = await client.messages.create({
      model,
      max_tokens: MAX_TOKENS_RESPONSE,
      system:     CHATBOT_SYSTEM_PROMPT,
      messages,
      tools:      CHATBOT_TOOLS,
    })

    /* ── 5. Handle tool use (one round) ── */
    if (response.stop_reason === 'tool_use') {
      const toolResults: Anthropic.ToolResultBlockParam[] = []

      for (const block of response.content) {
        if (block.type === 'tool_use') {
          const result = executeTool(block.name, block.input as Record<string, unknown>)
          toolResults.push({
            type:        'tool_result',
            tool_use_id: block.id,
            content:     JSON.stringify(result),
          })
        }
      }

      const messagesWithTools: Anthropic.MessageParam[] = [
        ...messages,
        { role: 'assistant' as const, content: response.content },
        { role: 'user'      as const, content: toolResults      },
      ]

      response = await client.messages.create({
        model,
        max_tokens: MAX_TOKENS_RESPONSE,
        system:     CHATBOT_SYSTEM_PROMPT,
        messages:   messagesWithTools,
        tools:      CHATBOT_TOOLS,
      })
    }

    /* ── 6. Extract text response ── */
    const text = extractText(response.content)
    if (!text) {
      return NextResponse.json({ message: "Je n'ai pas pu générer une réponse. Réessayez ou contactez ClikClak." })
    }

    return NextResponse.json({ message: text })

  } catch (err: unknown) {
    /* Never expose API key or internal errors */
    const isAnthropicError = err instanceof Error && err.message.includes('401')
    if (isAnthropicError) {
      return NextResponse.json({
        message: "Clé API invalide. L'assistant IA est temporairement indisponible.",
      }, { status: 503 })
    }
    return NextResponse.json({
      message: "Une erreur est survenue. Veuillez réessayer ou contacter ClikClak directement.",
      suggestions: [{ label: 'Contacter ClikClak', href: '/contact-clik-clak-lausanne' }],
    }, { status: 503 })
  }
}
