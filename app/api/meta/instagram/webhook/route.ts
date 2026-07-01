import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

/**
 * Validation initiale de l’URL par Meta.
 */
export async function GET(request: NextRequest): Promise<Response> {
  const verifyToken = process.env.META_INSTAGRAM_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error(
      "[Instagram webhook] META_INSTAGRAM_WEBHOOK_VERIFY_TOKEN manquant."
    );

    return new Response("Configuration serveur incomplète.", {
      status: 500,
    });
  }

  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === verifyToken &&
    typeof challenge === "string"
  ) {
    return new Response(challenge, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
      },
    });
  }

  return new Response("Vérification refusée.", {
    status: 403,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

/**
 * Réception sécurisée des événements Instagram.
 *
 * Cette étape valide et accepte les événements.
 * Le traitement métier sera ajouté ensuite.
 */
export async function POST(request: NextRequest): Promise<Response> {
  const appSecret = process.env.META_INSTAGRAM_APP_SECRET;

  if (!appSecret) {
    console.error("[Instagram webhook] META_INSTAGRAM_APP_SECRET manquant.");

    return new Response("Configuration serveur incomplète.", {
      status: 500,
    });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature, appSecret)) {
    console.warn("[Instagram webhook] Signature Meta invalide.");

    return new Response("Signature invalide.", {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  let payload: unknown;

  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return new Response("JSON invalide.", {
      status: 400,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }

  const event =
    payload && typeof payload === "object"
      ? (payload as {
          object?: unknown;
          entry?: unknown[];
        })
      : null;

  console.info("[Instagram webhook] Événement authentifié reçu.", {
    object: typeof event?.object === "string" ? event.object : "inconnu",
    entryCount: Array.isArray(event?.entry) ? event.entry.length : 0,
  });

  return new Response("EVENT_RECEIVED", {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
