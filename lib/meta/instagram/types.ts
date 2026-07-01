/*
  lib/meta/instagram/types.ts

  Types du payload webhook Instagram Messaging.
  Seuls les champs utilisés par le pipeline sont définis.
*/

export interface InstagramSender    { id: string }
export interface InstagramRecipient { id: string }

export interface InstagramMessage {
  /** Identifiant unique du message — utilisé pour le dédoublonnage. */
  mid:      string
  /** Texte brut du message. Absent sur les événements non-texte. */
  text?:    string
  /**
   * true pour les messages envoyés par la page elle-même (echo).
   * Ces messages doivent être ignorés silencieusement.
   */
  is_echo?: boolean
}

export interface InstagramMessaging {
  sender:    InstagramSender
  recipient: InstagramRecipient
  timestamp: number
  /** Présent uniquement sur les événements de message entrant. */
  message?:  InstagramMessage
  /** Présent sur les accusés de lecture — ignoré. */
  read?:     unknown
  /** Présent sur les confirmations de livraison — ignoré. */
  delivery?: unknown
  /** Présent sur les réactions — ignoré. */
  reaction?: unknown
}

export interface InstagramEntry {
  id:        string
  time?:     number
  messaging: InstagramMessaging[]
}

export interface InstagramWebhookPayload {
  object: string
  entry:  InstagramEntry[]
}

/** Message extrait et validé, prêt à être traité par le pipeline. */
export interface ParsedInstagramMessage {
  senderId:    string
  recipientId: string
  mid:         string
  text:        string
}
