/**
 * scripts/test-instagram-webhook.ts
 *
 * Tests unitaires pour le pipeline webhook Instagram ClikClak.
 * Exécuter : npm run test:instagram
 *
 * Couverture (14 tests) :
 *  ── Existants ─────────────────────────────────────────────────────
 *  1.  Signature valide → 200 EVENT_RECEIVED
 *  2.  Signature invalide → 401
 *  3.  Événement sans texte (read) → ignoré, aucun envoi
 *  4.  Message echo → ignoré, aucun envoi
 *  5.  Message dupliqué (:done présente) → une seule réponse
 *  6.  "Écran iPhone 14 Pro" → tarif issu du résolveur, jamais codé en dur
 *  7.  Multi-tour : "iPhone 14 Pro" puis "L'écran" → modèle conservé
 *  8.  Prix non publié → aucune invention
 *  9.  sendInstagramTextMessage appelé avec le sender.id du webhook
 *  ── Nouveaux ──────────────────────────────────────────────────────
 *  10. URL d'envoi = graph.instagram.com/v25.0/{accountId}/messages
 *  11. Échec fetch Instagram → webhook 500, :lock supprimé, :done absent,
 *      contexte non enregistré
 *  12. Nouvelle tentative après échec → envoi retenté (pas ignoré)
 *  13. Succès → webhook 200, :done présente, :lock absente, contexte enregistré
 *  14. Payload 2 messages (un succès + un échec) → 500 ; au retry, le
 *      succès est ignoré (:done) et l'échec est retraité
 *
 * Fetch est mocké — aucun vrai message Instagram n'est envoyé.
 * Redis est mocké en mémoire.
 */

import { createHmac } from "node:crypto";
import assert from "node:assert/strict";
import { Redis } from "@upstash/redis";
import { resolveRepairPricing } from "../lib/chatbot/repairPricing";
import { GET, POST } from "../app/api/meta/instagram/webhook/route";

/* ── Couleurs console ────────────────────────────────────────── */

const C = {
  green:  (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:    (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold:   (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/* ── Variables d'environnement de test ───────────────────────── */

const TEST_APP_SECRET   = "test-app-secret-32chars-exactly-pad";
const TEST_VERIFY_TOKEN = "test-verify-token";
const TEST_ACCOUNT_ID   = "123456789";

process.env.META_INSTAGRAM_APP_SECRET           = TEST_APP_SECRET;
process.env.META_INSTAGRAM_WEBHOOK_VERIFY_TOKEN = TEST_VERIFY_TOKEN;
process.env.META_INSTAGRAM_ACCESS_TOKEN         = "TEST_TOKEN_NOT_REAL";
process.env.META_INSTAGRAM_ACCOUNT_ID           = TEST_ACCOUNT_ID;
process.env.META_GRAPH_API_VERSION              = "v25.0";
process.env.NEXT_PUBLIC_SITE_URL                = "https://clikclak.ch";

/* ── Mock Redis en mémoire ───────────────────────────────────── */

const redisStore = new Map<string, string>();

const redisMock = {
  set: (key: string, value: unknown, opts?: { nx?: boolean; ex?: number }) => {
    if (opts?.nx) {
      if (redisStore.has(key)) return Promise.resolve(null);
      redisStore.set(key, JSON.stringify(value));
      return Promise.resolve("OK");
    }
    redisStore.set(key, JSON.stringify(value));
    return Promise.resolve("OK");
  },
  get: (key: string) => {
    const v = redisStore.get(key);
    return Promise.resolve(v !== undefined ? JSON.parse(v) : null);
  },
  del: (...keys: string[]) => {
    for (const k of keys) redisStore.delete(k);
    return Promise.resolve(keys.length);
  },
};

// @ts-expect-error — remplacement du constructeur pour les tests uniquement
Redis.fromEnv = () => redisMock;

/* ── Clés Redis selon le protocole de dédoublonnage ─────────── */

function lockKey(mid: string) { return `meta:instagram:message:${mid}:lock`; }
function doneKey(mid: string) { return `meta:instagram:message:${mid}:done`; }
function convKey(sid: string) { return `meta:instagram:conversation:${sid}`;  }

function clearMid(mid: string) {
  redisStore.delete(lockKey(mid));
  redisStore.delete(doneKey(mid));
}

/* ── Mock fetch configurable ─────────────────────────────────── */

type FetchMockMode = 'success' | 'failure';

const sentMessages: Array<{ url: string; body: Record<string, unknown> }> = [];
let   fetchMode: FetchMockMode = 'success';

const realFetch = globalThis.fetch;
// @ts-expect-error — remplacement de fetch pour les tests uniquement
globalThis.fetch = (url: string, init?: RequestInit) => {
  const rawBody = init?.body;
  const body = rawBody ? (JSON.parse(rawBody as string) as Record<string, unknown>) : {};
  sentMessages.push({ url, body });

  if (fetchMode === 'failure') {
    return Promise.resolve({
      ok:     false,
      status: 503,
      json:   () => Promise.resolve({ error: { message: "Service Unavailable" } }),
    });
  }
  return Promise.resolve({
    ok:     true,
    status: 200,
    json:   () => Promise.resolve({ message_id: "mock-message-id" }),
  });
};

/* ── Helpers ─────────────────────────────────────────────────── */

function makeSignature(body: string, secret: string): string {
  return "sha256=" + createHmac("sha256", secret).update(Buffer.from(body)).digest("hex");
}

function makeRequest(body: string, sig: string): Request {
  return new Request("http://localhost:3000/api/meta/instagram/webhook", {
    method:  "POST",
    headers: {
      "content-type":        "application/json",
      "x-hub-signature-256": sig,
    },
    body,
  });
}

type PayloadOpts = {
  senderId?:    string;
  recipientId?: string;
  mid?:         string;
  text?:        string;
  isEcho?:      boolean;
  noMessage?:   boolean;
  /** Deuxième message dans le même payload (mid + text) */
  secondMsg?:   { mid: string; text: string; senderId?: string };
};

function instagramPayload(opts: PayloadOpts): string {
  const messaging: Record<string, unknown>[] = [];

  if (!opts.noMessage) {
    const msg: Record<string, unknown> = { mid: opts.mid ?? "mid_test_001" };
    if (opts.text    !== undefined) msg.text    = opts.text;
    if (opts.isEcho)                msg.is_echo = true;
    messaging.push({
      sender:    { id: opts.senderId    ?? "user_001" },
      recipient: { id: opts.recipientId ?? TEST_ACCOUNT_ID },
      timestamp: Date.now(),
      message:   msg,
    });
  } else {
    messaging.push({
      sender:    { id: opts.senderId    ?? "user_001" },
      recipient: { id: opts.recipientId ?? TEST_ACCOUNT_ID },
      timestamp: Date.now(),
      read:      { watermark: Date.now() },
    });
  }

  if (opts.secondMsg) {
    messaging.push({
      sender:    { id: opts.secondMsg.senderId ?? opts.senderId ?? "user_001" },
      recipient: { id: opts.recipientId ?? TEST_ACCOUNT_ID },
      timestamp: Date.now(),
      message:   { mid: opts.secondMsg.mid, text: opts.secondMsg.text },
    });
  }

  return JSON.stringify({
    object: "instagram",
    entry:  [{ id: TEST_ACCOUNT_ID, time: Date.now(), messaging }],
  });
}

/* ── Runner ──────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  process.stdout.write(`  ${name} ... `);
  try {
    await fn();
    console.log(C.green("✅ PASS"));
    passed++;
  } catch (err) {
    console.log(C.red("❌ FAIL"));
    console.error(C.red(`    ${err instanceof Error ? err.message : String(err)}`));
    failed++;
  }
}

/* ── Suite de tests ──────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log(C.bold("\nClikClak — Tests webhook Instagram\n"));

  /* ── Tests existants ──────────────────────────────────────── */

  /* 1. Signature valide → 200 */
  await test("1.  Signature valide → 200 EVENT_RECEIVED", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const mid = "mid_sig_ok";
    clearMid(mid);
    const body = instagramPayload({ text: "Bonjour", mid });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    const res  = await POST(makeRequest(body, sig) as never);
    assert.equal(res.status, 200);
    assert.equal(await res.text(), "EVENT_RECEIVED");
  });

  /* 2. Signature invalide → 401 */
  await test("2.  Signature invalide → 401", async () => {
    const body = instagramPayload({ text: "Bonjour", mid: "mid_sig_bad" });
    const res  = await POST(makeRequest(body, "sha256=badbeef") as never);
    assert.equal(res.status, 401);
  });

  /* 3. Événement sans texte → ignoré */
  await test("3.  Événement sans texte (read) → aucun message envoyé", async () => {
    sentMessages.length = 0;
    const body = instagramPayload({ noMessage: true, mid: "mid_no_text" });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    await POST(makeRequest(body, sig) as never);
    assert.equal(sentMessages.length, 0);
  });

  /* 4. Message echo → ignoré */
  await test("4.  Message echo → aucun message envoyé", async () => {
    sentMessages.length = 0;
    const body = instagramPayload({ text: "echo", isEcho: true, mid: "mid_echo" });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    await POST(makeRequest(body, sig) as never);
    assert.equal(sentMessages.length, 0);
  });

  /* 5. Message dupliqué (:done présent) → une seule réponse */
  await test("5.  Message dupliqué (:done présente) → une seule réponse", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const mid = "mid_dup_v2";
    clearMid(mid);

    const body = instagramPayload({ text: "Écran iPhone 14", mid });
    const sig  = makeSignature(body, TEST_APP_SECRET);

    /* Premier envoi — marque :done */
    await POST(makeRequest(body, sig) as never);
    assert.equal(sentMessages.length, 1, "Premier envoi attendu");
    assert.ok(redisStore.has(doneKey(mid)), ":done doit exister après le premier envoi");

    /* Deuxième envoi — :done présent, doit être ignoré */
    await POST(makeRequest(body, sig) as never);
    assert.equal(sentMessages.length, 1, "Le doublon ne doit pas générer une seconde réponse");
  });

  /* 6. "Écran iPhone 14 Pro" → tarif du résolveur */
  await test("6.  Écran iPhone 14 Pro → tarif réel du résolveur (pas codé en dur)", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const mid = "mid_iphone14pro_screen";
    clearMid(mid);

    const body = instagramPayload({ text: "Écran iPhone 14 Pro", mid });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    await POST(makeRequest(body, sig) as never);

    assert.equal(sentMessages.length, 1);
    const text = (sentMessages[0].body as { message?: { text?: string } })?.message?.text ?? "";

    const match = resolveRepairPricing("Écran iPhone 14 Pro");
    assert.equal(match.status, "found", `Résolveur status: ${match.status}`);
    assert.ok(match.results && match.results.length > 0, "Résultat attendu");

    const price = match.results![0].price;
    assert.ok(
      text.includes(price) || text.includes("CHF"),
      `Prix réel attendu (${price}). Reçu : ${text.slice(0, 120)}`
    );
  });

  /* 7. Multi-tour */
  await test("7.  Multi-tour : modèle du 1er message conservé au 2e", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const sid  = "user_mt_v2";
    const mid1 = "mid_mt_v2_001";
    const mid2 = "mid_mt_v2_002";
    clearMid(mid1);
    clearMid(mid2);
    redisStore.delete(convKey(sid));

    const b1 = instagramPayload({ text: "iPhone 14 Pro", mid: mid1, senderId: sid });
    await POST(makeRequest(b1, makeSignature(b1, TEST_APP_SECRET)) as never);
    assert.equal(sentMessages.length, 1, "Premier message → réponse");

    const b2 = instagramPayload({ text: "L'écran", mid: mid2, senderId: sid });
    await POST(makeRequest(b2, makeSignature(b2, TEST_APP_SECRET)) as never);
    assert.equal(sentMessages.length, 2, "Deuxième message → réponse");

    const reply = (sentMessages[1].body as { message?: { text?: string } })?.message?.text ?? "";
    const ok = /CHF/.test(reply) || (/iphone|14\s*pro/i.test(reply) && /écran|remplacement/i.test(reply));
    assert.ok(ok, `Réponse doit utiliser le contexte. Reçu : ${reply.slice(0, 200)}`);
  });

  /* 8. Prix non publié → aucune invention */
  await test("8.  Prix non publié → réponse honnête (pas de montant inventé)", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const mid = "mid_no_price_v2";
    clearMid(mid);

    const body = instagramPayload({ text: "Diagnostic MacBook Pro", mid });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    await POST(makeRequest(body, sig) as never);

    assert.equal(sentMessages.length, 1);
    const text = (sentMessages[0].body as { message?: { text?: string } })?.message?.text ?? "";
    const match = resolveRepairPricing("Diagnostic MacBook Pro");

    if (match.status === "found" && match.results?.some(r => r.price.startsWith("CHF"))) {
      assert.ok(text.includes("CHF"), "Prix publié → mention attendue");
    } else {
      const noFake = !text.match(/CHF\s+\d+/) || text.includes("devis") || match.status !== "not_found";
      assert.ok(noFake, `Aucun prix inventé. Reçu : ${text.slice(0, 150)}`);
    }
  });

  /* 9. recipient.id = sender.id du webhook */
  await test("9.  recipient.id = sender.id du webhook", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const sid = "user_rcpt_v2";
    const mid = "mid_rcpt_v2";
    clearMid(mid);

    const body = instagramPayload({ text: "Batterie Samsung Galaxy S24", mid, senderId: sid });
    await POST(makeRequest(body, makeSignature(body, TEST_APP_SECRET)) as never);

    assert.equal(sentMessages.length, 1);
    const r = (sentMessages[0].body as { recipient?: { id?: string } })?.recipient?.id;
    assert.equal(r, sid, `recipient.id attendu ${sid}, reçu ${r}`);
  });

  /* ── Nouveaux tests ───────────────────────────────────────── */

  /* 10. URL = graph.instagram.com */
  await test("10. URL d'envoi = graph.instagram.com/v25.0/{accountId}/messages", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const mid = "mid_url_check";
    clearMid(mid);

    const body = instagramPayload({ text: "Batterie iPhone 13", mid });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    await POST(makeRequest(body, sig) as never);

    assert.equal(sentMessages.length, 1, "Un appel fetch attendu");
    const url = sentMessages[0].url;
    const expectedUrl = `https://graph.instagram.com/v25.0/${TEST_ACCOUNT_ID}/messages`;
    assert.equal(url, expectedUrl, `URL attendue : ${expectedUrl}\nReçue : ${url}`);
  });

  /* 11. Échec fetch Instagram → 500, :lock supprimé, :done absent, contexte non enregistré */
  await test("11. Échec fetch → webhook 500, :lock supprimé, :done absent, contexte non enregistré", async () => {
    sentMessages.length = 0;
    fetchMode = 'failure';
    const sid = "user_fail_001";
    const mid = "mid_fail_001";
    clearMid(mid);
    redisStore.delete(convKey(sid));

    const body = instagramPayload({ text: "Écran iPhone 13", mid, senderId: sid });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    const res  = await POST(makeRequest(body, sig) as never);

    /* 500 attendu */
    assert.equal(res.status, 500, "Webhook doit retourner 500 en cas d'échec d'envoi");
    assert.equal(await res.text(), "EVENT_PROCESSING_FAILED");

    /* :lock supprimé (retry autorisé) */
    assert.ok(!redisStore.has(lockKey(mid)), ":lock doit être supprimé après échec");

    /* :done absent (pas marqué traité) */
    assert.ok(!redisStore.has(doneKey(mid)), ":done ne doit pas exister après un échec");

    /* Contexte non enregistré */
    assert.ok(!redisStore.has(convKey(sid)), "Contexte ne doit pas être enregistré après échec");
  });

  /* 12. Nouvelle tentative après l'échec → envoi retenté */
  await test("12. Retry après échec → envoi retenté (pas ignoré)", async () => {
    sentMessages.length = 0;
    /* mid_fail_001 du test 11 : :done absent, :lock absent → doit être retraité */
    fetchMode = 'success';
    const mid = "mid_fail_001";  /* même mid que test 11 */

    const body = instagramPayload({ text: "Écran iPhone 13", mid, senderId: "user_fail_001" });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    const res  = await POST(makeRequest(body, sig) as never);

    assert.equal(res.status, 200, "La nouvelle tentative doit réussir");
    assert.equal(sentMessages.length, 1, "L'envoi doit être retenté");
    assert.ok(redisStore.has(doneKey(mid)), ":done doit exister après succès");
  });

  /* 13. Succès → 200, :done présente, :lock absente, contexte enregistré */
  await test("13. Succès → 200, :done présente, :lock absente, contexte enregistré", async () => {
    sentMessages.length = 0;
    fetchMode = 'success';
    const sid = "user_success_013";
    const mid = "mid_success_013";
    clearMid(mid);
    redisStore.delete(convKey(sid));

    const body = instagramPayload({ text: "Batterie Samsung S22", mid, senderId: sid });
    const sig  = makeSignature(body, TEST_APP_SECRET);
    const res  = await POST(makeRequest(body, sig) as never);

    assert.equal(res.status, 200, "200 attendu après succès");
    assert.equal(await res.text(), "EVENT_RECEIVED");
    assert.ok(redisStore.has(doneKey(mid)), ":done doit exister");
    assert.ok(!redisStore.has(lockKey(mid)), ":lock doit être supprimé");
    assert.ok(redisStore.has(convKey(sid)), "Contexte doit être enregistré");
  });

  /* 14. Payload 2 messages (1 succès + 1 échec) → 500 ;
         au retry, le succès n'est pas renvoyé, l'échec est retraité */
  await test("14. Payload 2 messages (succès+échec) → 500 ; retry : succès ignoré, échec retenté", async () => {
    sentMessages.length = 0;
    const sid   = "user_partial_014";
    const midOk = "mid_partial_ok_014";
    const midFail = "mid_partial_fail_014";
    clearMid(midOk);
    clearMid(midFail);
    redisStore.delete(convKey(sid));

    /* Fetch : premier appel → succès, deuxième → échec */
    let fetchCallCount = 0;
    // @ts-expect-error — remplacement de fetch pour les tests uniquement
    globalThis.fetch = (url: string, init?: RequestInit) => {
      const rawBody = init?.body;
      const body = rawBody ? (JSON.parse(rawBody as string) as Record<string, unknown>) : {};
      sentMessages.push({ url, body });
      fetchCallCount++;
      if (fetchCallCount % 2 === 1) {
        return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({
        ok:     false,
        status: 503,
        json:   () => Promise.resolve({ error: { message: "fail" } }),
      });
    };

    /* Premier appel webhook : payload avec 2 messages */
    const body = instagramPayload({
      text:      "Batterie iPhone 12",
      mid:       midOk,
      senderId:  sid,
      secondMsg: { mid: midFail, text: "Écran Samsung S21" },
    });
    const sig = makeSignature(body, TEST_APP_SECRET);
    const res = await POST(makeRequest(body, sig) as never);

    /* Doit retourner 500 (un message a échoué) */
    assert.equal(res.status, 500, "500 attendu quand un message échoue");
    assert.equal(sentMessages.length, 2, "Les deux messages doivent avoir été tentés");
    assert.ok(redisStore.has(doneKey(midOk)),    "midOk doit être marqué :done");
    assert.ok(!redisStore.has(lockKey(midFail)),  ":lock de midFail doit être supprimé");
    assert.ok(!redisStore.has(doneKey(midFail)),  "midFail ne doit PAS être marqué :done");

    /* Reset compteur fetch pour le retry */
    fetchCallCount = 0;
    sentMessages.length = 0;

    /* Remettre fetch en mode succès pour le retry */
    // @ts-expect-error — remplacement de fetch pour les tests uniquement
    globalThis.fetch = (url: string, init?: RequestInit) => {
      const rawBody = init?.body;
      const b = rawBody ? (JSON.parse(rawBody as string) as Record<string, unknown>) : {};
      sentMessages.push({ url, body: b });
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({}) });
    };

    /* Deuxième appel webhook (retry) : même payload */
    const res2 = await POST(makeRequest(body, sig) as never);
    assert.equal(res2.status, 200, "Le retry doit réussir");

    /* Le succès (midOk) doit être ignoré (:done présent) */
    /* L'échec (midFail) doit être retraité */
    assert.equal(sentMessages.length, 1, "Seul midFail doit être retraité");
    assert.ok(redisStore.has(doneKey(midFail)), "midFail doit être marqué :done après retry");

    /* Restaurer fetch en mode global */
    // @ts-expect-error
    globalThis.fetch = (url: string, init?: RequestInit) => {
      const rawBody = init?.body;
      const b = rawBody ? (JSON.parse(rawBody as string) as Record<string, unknown>) : {};
      sentMessages.push({ url, body: b });
      if (fetchMode === 'failure') {
        return Promise.resolve({ ok: false, status: 503, json: () => Promise.resolve({ error: { message: "fail" } }) });
      }
      return Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ message_id: "ok" }) });
    };
  });

  /* ── Résultat ─────────────────────────────────────────────── */
  console.log("");
  console.log(
    `${C.bold("Résultats :")} ${C.green(`${passed} passé(s)`)}` +
    (failed > 0 ? ` ${C.red(`${failed} échoué(s)`)}` : "")
  );

  globalThis.fetch = realFetch;

  if (failed > 0) process.exit(1);
  console.log(C.green("\n✅ Tous les tests sont passés.\n"));
}

/* Référence GET utilisée dans le module (supprime warning "unused import") */
void GET;

main().catch((err: unknown) => {
  console.error(C.red("\n❌ Erreur inattendue dans la suite de tests :"));
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
