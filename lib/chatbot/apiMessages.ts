/*
  lib/chatbot/apiMessages.ts

  Dictionnaire centralisé des messages d'erreur de /api/chatbot.
  Server-side uniquement (importé par app/api/chatbot/route.ts).

  Règle : aucun message ne doit jamais exposer de détail technique,
  de clé, de prompt ou de trace interne — uniquement des messages
  génériques et localisés.
*/

import type { ChatbotLocale } from './locale'

export type ApiMessageCode =
  | 'CHATBOT_DISABLED'
  | 'UNSUPPORTED_MEDIA_TYPE'
  | 'PAYLOAD_TOO_LARGE'
  | 'READ_ERROR'
  | 'INVALID_JSON'
  | 'INVALID_BODY'
  | 'MESSAGES_NOT_ARRAY'
  | 'MESSAGES_EMPTY'
  | 'TOO_MANY_MESSAGES'
  | 'MESSAGE_INVALID'
  | 'ROLE_MISSING'
  | 'ROLE_INVALID'
  | 'CONTENT_NOT_STRING'
  | 'LAST_MUST_BE_USER'
  | 'EMPTY_CONTENT'
  | 'CONTENT_TOO_LONG'
  | 'CHATBOT_UNAVAILABLE'
  | 'TEMPORARILY_BLOCKED'
  | 'RATE_LIMITED'

type Vars = Record<string, string | number>

const MESSAGES: Record<ApiMessageCode, Record<ChatbotLocale, string>> = {
  CHATBOT_DISABLED: {
    fr: 'Le chatbot est temporairement indisponible.',
    en: 'The chatbot is temporarily unavailable.',
  },
  UNSUPPORTED_MEDIA_TYPE: {
    fr: 'Format de requête non pris en charge.',
    en: 'Unsupported request format.',
  },
  PAYLOAD_TOO_LARGE: {
    fr: 'Corps de requête trop volumineux.',
    en: 'Request body too large.',
  },
  READ_ERROR: {
    fr: 'Impossible de lire la requête.',
    en: 'Unable to read the request.',
  },
  INVALID_JSON: {
    fr: 'JSON invalide.',
    en: 'Invalid JSON.',
  },
  INVALID_BODY: {
    fr: 'Format de requête invalide.',
    en: 'Invalid request format.',
  },
  MESSAGES_NOT_ARRAY: {
    fr: 'messages doit être un tableau.',
    en: 'messages must be an array.',
  },
  MESSAGES_EMPTY: {
    fr: 'messages ne peut pas être vide.',
    en: 'messages cannot be empty.',
  },
  TOO_MANY_MESSAGES: {
    fr: 'Trop de messages (maximum {max}).',
    en: 'Too many messages (maximum {max}).',
  },
  MESSAGE_INVALID: {
    fr: 'Message {index} invalide.',
    en: 'Message {index} is invalid.',
  },
  ROLE_MISSING: {
    fr: 'Message {index} : role manquant.',
    en: 'Message {index}: missing role.',
  },
  ROLE_INVALID: {
    fr: 'Message {index} : role invalide (user ou assistant uniquement).',
    en: 'Message {index}: invalid role (user or assistant only).',
  },
  CONTENT_NOT_STRING: {
    fr: 'Message {index} : content doit être une chaîne.',
    en: 'Message {index}: content must be a string.',
  },
  LAST_MUST_BE_USER: {
    fr: 'Le dernier message doit être de l\'utilisateur.',
    en: 'The last message must be from the user.',
  },
  EMPTY_CONTENT: {
    fr: 'Message {index} vide après normalisation.',
    en: 'Message {index} is empty after normalisation.',
  },
  CONTENT_TOO_LONG: {
    fr: 'Message trop long (maximum {max} caractères).',
    en: 'Message too long (maximum {max} characters).',
  },
  CHATBOT_UNAVAILABLE: {
    fr: 'Le service est temporairement indisponible. Vous pouvez contacter directement ClikClak.',
    en: 'The service is temporarily unavailable. You can contact ClikClak directly.',
  },
  TEMPORARILY_BLOCKED: {
    fr: 'Trop de demandes ont été envoyées. Réessayez plus tard.',
    en: 'Too many requests have been sent. Please try again later.',
  },
  RATE_LIMITED: {
    fr: 'Trop de demandes ont été envoyées. Réessayez plus tard.',
    en: 'Too many requests have been sent. Please try again later.',
  },
}

export function apiMessage(code: ApiMessageCode, locale: ChatbotLocale, vars?: Vars): string {
  let msg = MESSAGES[code][locale]
  if (vars) {
    for (const [key, value] of Object.entries(vars)) {
      msg = msg.replace(`{${key}}`, String(value))
    }
  }
  return msg
}
