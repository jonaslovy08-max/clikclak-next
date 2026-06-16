/*
  lib/chatbot/guardrails.ts

  Garde-fous du chatbot ClikClak.
  Filtre les messages hors-sujet avant tout appel Anthropic.
  Server-side uniquement.
*/

export const OFF_TOPIC_RESPONSE =
  "Je peux uniquement répondre aux questions liées aux réparations, services, produits et informations Clik Clak. Pour une réparation, un prix, un diagnostic ou une récupération de données, indiquez votre appareil ou votre problème."

/* ── Normalisation ────────────────────────────────────────────── */

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/* ── Mots-clés autorisés ─────────────────────────────────────── */

export const ALLOWED_KEYWORDS: string[] = [
  'clikclak',
  'clik clak',
  'reparation',
  'reparer',
  'prix',
  'tarif',
  'devis',
  'iphone',
  'samsung',
  'huawei',
  'oppo',
  'ipad',
  'macbook',
  'smartphone',
  'telephone',
  'tablette',
  'ecran',
  'vitre',
  'tactile',
  'batterie',
  'charge',
  'connecteur',
  'diagnostic',
  'panne',
  'allume',
  'chauffe',
  'eau',
  'oxydation',
  'degat',
  'donnees',
  'recuperation',
  'sauvegarde',
  'rachat',
  'reprise',
  'shop',
  'boutique',
  'produit',
  'accessoire',
  'piece',
  'stock',
  'disponibilite',
  'horaire',
  'adresse',
  'contact',
  'whatsapp',
  'appel',
  'courrier',
  'lausanne',
  'pixel',
  'xiaomi',
  'nokia',
  'motorola',
  'realme',
  'oppo',
  'honor',
  'vivo',
  'tablette',
  'ordinateur',
  'laptop',
  'mac',
  'transfert',
  'coursier',
  'depannage',
  'depot',
]

/* ── Patterns bloqués (injection de prompt, jailbreak) ───────── */

export const BLOCKED_PATTERNS: RegExp[] = [
  /ignore.*instruction/i,
  /oublie.*instruction/i,
  /mode.*developpeur/i,
  /developer.*mode/i,
  /system.*prompt/i,
  /revele.*prompt/i,
  /tu es maintenant/i,
  /sans restriction/i,
  /act as/i,
  /jailbreak/i,
  /pretend.*you are/i,
  /fais semblant/i,
  /joue le role/i,
  /nouvelle personnalite/i,
  /oublie ton role/i,
]

/* ── Filtre principal ─────────────────────────────────────────── */

/**
 * Retourne true si le message est dans le périmètre ClikClak.
 * Vérifie les blocages d'abord, puis cherche au moins un mot-clé autorisé.
 */
export function isAllowedClikClakTopic(input: string): boolean {
  const text = normalizeText(input)

  if (!text || text.length < 2) return false

  if (BLOCKED_PATTERNS.some(pattern => pattern.test(input))) return false

  return ALLOWED_KEYWORDS.some(keyword => text.includes(normalizeText(keyword)))
}

/* ── Sanitisation de la réponse ───────────────────────────────── */

const FORBIDDEN_OUTPUT_PATTERNS: string[] = [
  'je peux parler de tout',
  'je peux repondre a tout',
  'voici du code',
  'conseil medical',
  'conseil juridique',
  'conseil financier',
]

/**
 * Vérifie que la réponse de Claude reste dans le cadre ClikClak.
 * Fallback vers OFF_TOPIC_RESPONSE si la réponse semble hors périmètre.
 */
export function sanitizeAssistantAnswer(answer: string): string {
  const text = answer.trim()

  if (!text) {
    return "Je n'ai pas pu générer de réponse. Contactez Clik Clak directement."
  }

  const normalized = normalizeText(text)

  if (FORBIDDEN_OUTPUT_PATTERNS.some(pattern => normalized.includes(normalizeText(pattern)))) {
    return OFF_TOPIC_RESPONSE
  }

  return text
}
