/*
  lib/chatbot/config.ts — Source unique de vérité pour les limites du chatbot.
  Importable côté serveur ET client (pas de server-only, pas d'env vars).
  Les env vars de sécurité restent dans les modules serveur uniquement.
*/

export const CHATBOT_LIMITS = {
  /* Corps HTTP */
  maxBodyBytes:               16 * 1024, // 16 Ko

  /* Messages */
  maxInputCharacters:         600,
  maxHistoryMessages:         12,
  maxOutputTokens:            350,
  maxQuestionsPerConversation: 10,

  /* Anthropic */
  timeoutMs:                  20_000,

  /* Rate limiting par fenêtre glissante */
  perMinute:                  5,
  perHour:                    15,
  perDay:                     30,

  /* Blocage après violations */
  maxViolations:              3,
  blockDurationSeconds:       3600,
} as const
