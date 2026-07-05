/*
  lib/meta/instagram/webhook.ts

  Parseur de payload webhook Instagram.
  Extrait uniquement les messages texte entrants utiles.

  Événements ignorés silencieusement :
  - Pas de texte (read, delivery, reaction, sticker, image…)
  - Echo (messages envoyés par le compte ClikClak lui-même)
  - Messages dont le sender.id correspond à META_INSTAGRAM_ACCOUNT_ID
  - Événements incomplets (sender, recipient ou mid absents)
  - object !== "instagram"
*/

import type {
  InstagramWebhookPayload,
  InstagramMessaging,
  ParsedInstagramMessage,
} from './types'

function isValidMessaging(m: unknown): m is InstagramMessaging {
  if (!m || typeof m !== 'object' || Array.isArray(m)) return false
  const msg = m as Record<string, unknown>
  return (
    typeof (msg.sender as Record<string, unknown> | undefined)?.id === 'string' &&
    typeof (msg.recipient as Record<string, unknown> | undefined)?.id === 'string'
  )
}

/**
 * Extrait les messages texte entrants d'un payload webhook Instagram.
 * Retourne un tableau vide si le payload est invalide ou ne contient
 * aucun message exploitable.
 */
export function parseInstagramMessages(payload: unknown): ParsedInstagramMessage[] {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return []

  const p = payload as Partial<InstagramWebhookPayload>
  if (p.object !== 'instagram') return []
  if (!Array.isArray(p.entry)) return []

  /* L'identifiant du compte ClikClak, utilisé pour filtrer les echos
     non marqués is_echo (cas rare selon la configuration Meta). */
  const ownAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID ?? ''

  const results: ParsedInstagramMessage[] = []

  for (const entry of p.entry) {
    if (!entry || !Array.isArray(entry.messaging)) continue

    for (const item of entry.messaging) {
      if (!isValidMessaging(item)) continue

      const { sender, recipient, message } = item

      /* Filtre : doit être un événement message */
      if (!message) continue

      /* Filtre : doit avoir un identifiant de message */
      if (!message.mid || typeof message.mid !== 'string') continue

      /* Filtre : doit contenir du texte */
      if (typeof message.text !== 'string' || !message.text.trim()) continue

      /* Filtre : ignorer les echos */
      if (message.is_echo === true) continue

      /* Filtre : ignorer les messages envoyés par le compte ClikClak */
      if (ownAccountId && sender.id === ownAccountId) continue

      results.push({
        senderId:    sender.id,
        recipientId: recipient.id,
        mid:         message.mid,
        text:        message.text.trim(),
        /* timestamp en ms depuis epoch, si présent dans le payload */
        timestamp:   typeof item.timestamp === 'number' ? item.timestamp : undefined,
      })
    }
  }

  return results
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clikclak.ch'

/**
 * Formate une réponse tarifaire pour Instagram.
 *
 * La réponse est en texte brut — pas de Markdown, pas de tableau.
 * Les actions contenant un href (lien vers une page de tarifs) sont
 * converties en URLs absolues ajoutées au message.
 * Le message est tronqué à MAX_CHARS si nécessaire.
 */
export function formatInstagramResponse(
  answer:  string,
  actions: Array<{ label: string; href: string; variant?: string }>,
  maxChars = 900,
): string {
  const parts: string[] = [answer.trim()]

  /* Ajouter l'URL de la page de tarifs si disponible (variant 'link') */
  const linkAction = actions.find(a => a.variant === 'link')
  if (linkAction?.href) {
    const href = linkAction.href.startsWith('http')
      ? linkAction.href
      : `${SITE_URL}${linkAction.href}`
    parts.push(`\n${linkAction.label} :\n${href}`)
  }

  let text = parts.join('\n')

  if (text.length > maxChars) {
    text = text.slice(0, maxChars - 3).trimEnd() + '…'
  }

  return text
}
