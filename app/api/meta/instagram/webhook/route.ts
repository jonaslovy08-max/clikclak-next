import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

import {
  resolveRepairPricing,
  buildPricingResponse,
  detectBrandTokenFromMessage,
  detectRepairTokenFromMessage,
} from "@/lib/chatbot/repairPricing";
import {
  parseInstagramMessages,
  formatInstagramResponse,
} from "@/lib/meta/instagram/webhook";
import {
  claimInstagramMessage,
  markInstagramMessageProcessed,
  releaseInstagramMessageClaim,
  loadConversation,
  appendAndSaveConversation,
  buildRecentContext,
  type StoredUserMessage,
} from "@/lib/meta/instagram/conversation";
import { sendInstagramTextMessage } from "@/lib/meta/instagram/client";
import { resolveInstagramSendConfig } from "@/lib/meta/instagram/resolver";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* ── Vérification signature HMAC-SHA256 ──────────────────────── */

function verifyMetaSignature(
  rawBody: Buffer,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const signatureHex = signatureHeader.slice("sha256=".length);

  if (!/^[a-f0-9]{64}$/i.test(signatureHex)) {
    return false;
  }

  const receivedSignature = Buffer.from(signatureHex, "hex");
  const expectedSignature = createHmac("sha256", appSecret)
    .update(rawBody)
    .digest();

  return (
    receivedSignature.length === expectedSignature.length &&
    timingSafeEqual(receivedSignature, expectedSignature)
  );
}

/* ── Résolution tarifaire multi-tour ──────────────────────────── */

const STATUS_PRIORITY: Record<string, number> = {
  found:         5,
  no_price:      4,
  repair_needed: 3,
  model_needed:  3,
  brand_only:    2,
  not_found:     1,
};

function resolveWithContext(
  currentText:   string,
  recentContext: string
): ReturnType<typeof resolveRepairPricing> {
  let match = resolveRepairPricing(currentText);
  const currentPriority = STATUS_PRIORITY[match.status] ?? 1;

  const hasModelNumber = /\b(iphone|samsung|galaxy|ipad|macbook)?\s*\d{1,2}\b/i.test(
    currentText
  );

  if (
    currentPriority < STATUS_PRIORITY["found"] &&
    !hasModelNumber &&
    recentContext !== currentText
  ) {
    const ctxMatch = resolveRepairPricing(recentContext);
    if ((STATUS_PRIORITY[ctxMatch.status] ?? 0) > currentPriority) {
      match = ctxMatch;
    }
  }

  if (hasModelNumber && match.status === "not_found") {
    const ctxBrand  = detectBrandTokenFromMessage(recentContext);
    const ctxRepair = detectRepairTokenFromMessage(recentContext);
    if (ctxBrand) {
      const prefix    = ctxRepair ? `${ctxBrand} ${ctxRepair}` : ctxBrand;
      const augmented = `${prefix} ${currentText}`;
      const augMatch  = resolveRepairPricing(augmented);
      if ((STATUS_PRIORITY[augMatch.status] ?? 0) > (STATUS_PRIORITY[match.status] ?? 0)) {
        match = augMatch;
      }
    }
  }

  return match;
}

/* ── Réponse par défaut (aucune correspondance tarifaire) ─────── */

const DEFAULT_RESPONSE =
  "Bonjour ! Je suis l'assistant Clik Clak. Dites-moi quelle réparation vous souhaitez " +
  "(marque, modèle, type de panne) et je vous fournirai le tarif. " +
  "Vous pouvez aussi nous contacter sur https://clikclak.ch/contact-clik-clak-lausanne";

/* ── Traitement d'un message entrant ─────────────────────────── */

type ProcessResult = 'ok' | 'skipped' | 'failed'

/**
 * Options permettant d'injecter des dépendances pour les tests.
 * Jamais utilisé en production — uniquement dans les scripts de test.
 */
export interface ProcessMessageOpts {
  _connectionLookup?: (recipientId: string) => Promise<import('@/lib/meta/instagram/connections').InstagramSendConfig | null>
}

async function processMessage(
  senderId:    string,
  recipientId: string,
  mid:         string,
  text:        string,
  opts?:       ProcessMessageOpts,
): Promise<ProcessResult> {

  /* ── Étape 1 : revendiquer le traitement (claim) ─────────────── */
  const claimed = await claimInstagramMessage(mid);

  if (!claimed) {
    console.info("[instagram:webhook] Message ignoré (déjà traité ou verrou actif)", {
      mid: mid.slice(0, 12),
    });
    return 'skipped';
  }

  /* ── Étape 2 : résoudre la configuration d'envoi ─────────────── */
  let sendConfig: import('@/lib/meta/instagram/connections').InstagramSendConfig | null

  if (opts?._connectionLookup) {
    sendConfig = await opts._connectionLookup(recipientId)
  } else {
    sendConfig = await resolveInstagramSendConfig(recipientId)
  }

  if (!sendConfig) {
    /* Compte non configuré — libérer le verrou pour retry */
    await releaseInstagramMessageClaim(mid)
    return 'failed'
  }

  /* ── Étape 3 : chargement du contexte (best-effort) ─────────── */
  let history: StoredUserMessage[] = [];
  try {
    history = await loadConversation(senderId);
  } catch {
    /* Contexte indisponible — traiter quand même le message courant */
  }

  /* ── Étape 4 : résolution tarifaire ─────────────────────────── */
  const recentContext = buildRecentContext(history, text);
  const match         = resolveWithContext(text, recentContext);

  /* ── Étape 5 : formatage de la réponse ──────────────────────── */
  let responseText: string;
  if (
    match.status === "found"         ||
    match.status === "no_price"      ||
    match.status === "model_needed"  ||
    match.status === "repair_needed" ||
    match.status === "brand_only"
  ) {
    const { answer, actions } = buildPricingResponse(match, "fr");
    responseText = formatInstagramResponse(answer, actions);
  } else {
    responseText = DEFAULT_RESPONSE;
  }

  /* ── Étape 6 : envoi Instagram avec la config résolue ────────── */
  const sent = await sendInstagramTextMessage(senderId, responseText, sendConfig);

  if (!sent) {
    await releaseInstagramMessageClaim(mid);
    return 'failed';
  }

  /* ── Étape 7 : persistance du contexte + marquage done ───────── */
  try {
    await appendAndSaveConversation(senderId, history, text);
  } catch (err) {
    console.error("[instagram:webhook] Impossible de sauvegarder le contexte", {
      error: err instanceof Error ? err.message : "unknown",
    });
  }

  try {
    await markInstagramMessageProcessed(mid);
  } catch (err) {
    console.error("[instagram:webhook] Impossible de marquer le message traité", {
      error: err instanceof Error ? err.message : "unknown",
    });
  }

  return 'ok';
}

/* ── GET — Validation initiale de l'URL par Meta ────────────── */

export async function GET(request: NextRequest): Promise<Response> {
  const verifyToken = process.env.META_INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("[instagram:webhook] META_INSTAGRAM_WEBHOOK_VERIFY_TOKEN manquant.");
    return new Response("Configuration serveur incomplète.", { status: 500 });
  }

  const mode      = request.nextUrl.searchParams.get("hub.mode");
  const token     = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === verifyToken &&
    typeof challenge === "string"
  ) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type":  "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response("Vérification refusée.", {
    status: 403,
    headers: { "Cache-Control": "no-store" },
  });
}

/* ── POST — Réception sécurisée des événements Instagram ─────── */

export async function POST(request: NextRequest): Promise<Response> {
  const appSecret = process.env.META_INSTAGRAM_APP_SECRET;

  if (!appSecret) {
    console.error("[instagram:webhook] META_INSTAGRAM_APP_SECRET manquant.");
    return new Response("Configuration serveur incomplète.", { status: 500 });
  }

  /* ── 1. Lecture du corps brut ────────────────────────────────── */
  const rawBody   = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get("x-hub-signature-256");

  /* ── 2. Vérification de la signature HMAC-SHA256 ─────────────── */
  if (!verifyMetaSignature(rawBody, signature, appSecret)) {
    console.warn("[instagram:webhook] Signature Meta invalide.");
    return new Response("Signature invalide.", {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  /* ── 3. Parsing JSON ─────────────────────────────────────────── */
  let payload: unknown;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return new Response("JSON invalide.", {
      status: 400,
      headers: { "Cache-Control": "no-store" },
    });
  }

  /* ── 4. Extraction des messages utiles ───────────────────────── */
  const messages = parseInstagramMessages(payload);

  const p = payload as Record<string, unknown>;
  console.info("[instagram:webhook] Événement authentifié reçu.", {
    object:       typeof p?.object === "string" ? p.object : "inconnu",
    entryCount:   Array.isArray(p?.entry) ? p.entry.length : 0,
    messageCount: messages.length,
  });

  /* ── 5. Traitement de chaque message ─────────────────────────── */
  let hasFailure = false;

  for (const msg of messages) {
    let result: ProcessResult;
    try {
      result = await processMessage(msg.senderId, msg.recipientId, msg.mid, msg.text);
    } catch (err) {
      console.error("[instagram:webhook] Erreur traitement message", {
        error: err instanceof Error ? err.message.slice(0, 100) : "unknown",
      });
      result = 'failed';
    }

    if (result === 'failed') {
      hasFailure = true;
    }
  }

  /* ── 6. Réponse ──────────────────────────────────────────────── */
  if (hasFailure) {
    return new Response("EVENT_PROCESSING_FAILED", {
      status: 500,
      headers: {
        "Content-Type":  "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response("EVENT_RECEIVED", {
    status: 200,
    headers: {
      "Content-Type":  "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
