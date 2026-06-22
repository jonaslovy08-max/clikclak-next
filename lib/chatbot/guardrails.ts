/*
  lib/chatbot/guardrails.ts

  Garde-fous du chatbot ClikClak.
  Server-side uniquement.

  Deux niveaux :
  - Injection manifeste → violation enregistrée, réponse locale, pas d'Anthropic.
  - Hors sujet → OFF_TOPIC_RESPONSE, pas d'Anthropic, pas de violation.
*/

/* ── Réponses locales ────────────────────────────────────────────── */

export const OFF_TOPIC_RESPONSE =
  'Je suis l\'assistant Clik Clak et je peux vous aider pour les réparations, les tarifs, les services ou les informations pratiques. Quel est votre appareil ou votre question ?'

export const INJECTION_RESPONSE =
  'Je suis l\'assistant Clik Clak. Je peux vous aider avec les réparations et services proposés.'

export const GREETING_RESPONSE =
  'Bonjour 👋 Je suis l\'assistant Clik Clak. Je peux vous aider à trouver un tarif de réparation, identifier un problème ou choisir le bon service. Quel est votre appareil ?'

/* ── Normalisation ───────────────────────────────────────────────── */

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/* ── Patterns d'injection (liste exhaustive) ─────────────────────── */

export const BLOCKED_PATTERNS: RegExp[] = [
  /* Jailbreak classiques */
  /\bdan\b/i,
  /do\s*anything\s*now/i,
  /jailbreak/i,
  /bypass/i,
  /contourne\s*les\s*(r[eè]gles|restrictions)/i,
  /sans\s*restriction/i,
  /tu\s*n.?as\s*(pas|aucune)\s*(de\s*)?restriction/i,

  /* Manipulation du rôle */
  /ignore\s*(les?\s*)?(instructions?|r[eè]gles?|consignes?|pr[eé]c[eé]dentes?)/i,
  /oublie\s*(les?\s*)?(instructions?|r[eè]gles?|ton\s*r[oô]le)/i,
  /mode\s*d[eé]veloppeur/i,
  /developer\s*mode/i,
  /developer\s*message/i,
  /system\s*message/i,
  /act\s*as/i,
  /pretend\s*(you\s*are|to\s*be)/i,
  /r[eé]ponds?\s*en\s*tant\s*que/i,
  /r[eé]ponds?\s*comme\s*(si|un)/i,
  /tu\s*es\s*maintenant/i,
  /tu\s*joues?\s*(le\s*r[oô]le|un\s*r[oô]le)/i,
  /joue\s*(le\s*)?r[oô]le/i,
  /fais?\s*semblant/i,
  /nouvelle\s*personnalite/i,
  /oublie\s*ton\s*r[oô]le/i,

  /* Extraction du prompt système */
  /system\s*prompt/i,
  /r[eé]v[eè]le?\s*(le\s*)?(prompt|instructions?)/i,
  /montre\s*(le\s*)?(prompt|instructions?|instructions?\s*cach[eé]es?)/i,
  /affiche\s*(le\s*)?(prompt|instructions?|instructions?\s*internes?)/i,
  /instructions?\s*(cach[eé]es?|internes?|syst[eè]me)/i,

  /* Exploits courants */
  /grandma\s*(exploit|trick)/i,
  /grandmother\s*exploit/i,
  /the\s*grandma\s*glitch/i,

  /* Divers */
  /without\s*(any\s*)?restriction/i,
  /no\s*restriction/i,
]

/* ── Détection d'injection ───────────────────────────────────────── */

/**
 * Analyse un texte (ou la concaténation de plusieurs messages récents)
 * pour détecter une tentative d'injection.
 * Ne logge pas le contenu du message.
 */
export function detectInjectionAttempt(input: string): boolean {
  if (!input || input.length < 3) return false
  return BLOCKED_PATTERNS.some(pattern => pattern.test(input))
}

/* ── Mots-clés autorisés ─────────────────────────────────────────── */

export const ALLOWED_KEYWORDS: string[] = [
  'clikclak', 'clik clak',
  /* Salutations — autorisées pour éviter les faux positifs */
  'bonjour', 'salut', 'hello', 'bonsoir', 'coucou',
  /* Réparations */
  'reparation', 'reparer', 'repare', 'changer', 'remplacer',
  'prix', 'tarif', 'devis', 'cout', 'combien',
  'iphone', 'samsung', 'huawei', 'oppo', 'ipad', 'macbook',
  'smartphone', 'telephone', 'tablette', 'ordinateur', 'laptop', 'mac',
  'ecran', 'vitre', 'tactile', 'affichage',
  'batterie', 'charge', 'connecteur', 'lightning', 'usb',
  'camera', 'photo', 'objectif', 'lentille',
  'diagnostic', 'panne', 'allume', 'chauffe', 'bug',
  'eau', 'oxydation', 'degat',
  'donnees', 'recuperation', 'sauvegarde',
  'rachat', 'reprise', 'vendre', 'revendre',
  'shop', 'boutique', 'produit', 'accessoire', 'piece', 'stock', 'disponibilite',
  'horaire', 'adresse', 'contact', 'whatsapp', 'appel',
  'courrier', 'coursier', 'lausanne',
  'pixel', 'xiaomi', 'nokia', 'motorola', 'realme', 'honor', 'vivo', 'galaxy',
  'transfert', 'depannage', 'depot',
  'garantie', 'facture',
]

/* ── Filtre hors-sujet ───────────────────────────────────────────── */

/**
 * Retourne true si le message concerne ClikClak.
 * Vérifie d'abord les injections (qui retournent false immédiatement),
 * puis cherche au moins un mot-clé autorisé.
 */
export function isAllowedClikClakTopic(input: string): boolean {
  const text = normalizeText(input)
  if (!text || text.length < 2) return false
  if (detectInjectionAttempt(input)) return false
  return ALLOWED_KEYWORDS.some(keyword => text.includes(normalizeText(keyword)))
}

/* ── Sanitisation de la réponse ──────────────────────────────────── */

const FORBIDDEN_OUTPUT_PATTERNS: string[] = [
  'je peux parler de tout',
  'je peux repondre a tout',
  'voici du code',
  'conseil medical',
  'conseil juridique',
  'conseil financier',
  'sans restriction',
  'en tant qu',
]

/* ── Détection de salutation ─────────────────────────────────────── */

const GREETING_RE = /^(bonjour|salut|hello|bonsoir|coucou|hi|hey|allo|all[oô])[!?,.\s]*$/i

/**
 * Vrai si le message est une salutation simple (pas une question intégrée).
 * Traité avant le filtre hors-sujet pour éviter les faux positifs.
 */
export function isGreeting(input: string): boolean {
  return GREETING_RE.test(normalizeText(input))
}

const FALLBACK_ANSWER =
  "Je n'ai pas pu générer de réponse. Contactez Clik Clak directement."

/**
 * Vérifie que la réponse Claude respecte le périmètre ClikClak.
 * Supprime les liens Markdown [texte](url) — ils doivent passer par les actions structurées.
 * Retourne FALLBACK_ANSWER si la réponse est absente ou hors périmètre.
 */
export function sanitizeAssistantAnswer(answer: string): string {
  let text = answer.trim()
  if (!text) return FALLBACK_ANSWER

  /* Supprimer les liens Markdown [texte](url) → garder uniquement le texte */
  text = text.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').trim()

  const normalized = normalizeText(text)
  if (FORBIDDEN_OUTPUT_PATTERNS.some(p => normalized.includes(normalizeText(p)))) {
    return OFF_TOPIC_RESPONSE
  }

  return text
}
