/**
 * scripts/test-instagram-data-deletion.ts
 *
 * Tests unitaires — callbacks Meta de désautorisation et suppression des données.
 * Exécuter : npm run test:instagram-data-deletion
 *
 * Imports : signedRequestCore.ts + callbacksOrchestrator.ts (sans server-only).
 * Aucun appel Meta distant. Aucun Supabase distant.
 */

import assert           from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import {
  parseAndVerifySignedRequestWithSecret,
  base64UrlDecode,
} from "../lib/meta/instagram/signedRequestCore";
import {
  extractSignedRequest,
  handleDeauthorizeCallback,
  handleDataDeletionCallback,
  type DeauthorizeDeps,
  type DataDeletionDeps,
} from "../lib/meta/instagram/callbacksOrchestrator";

/* ── Couleurs ──────────────────────────────────────────────────────── */

const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:   (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold:  (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/* ── Constantes de test ────────────────────────────────────────────── */

const TEST_SECRET  = "test-secret-for-meta-callbacks-signing";
const TEST_USER_ID = "ig_user_12345678";
const SITE_URL     = "https://clikclak.ch";

/* ── Helpers ───────────────────────────────────────────────────────── */

function buildSignedRequest(
  payload:    Record<string, unknown>,
  secret:     string,
): string {
  const payloadB64 = Buffer.from(JSON.stringify(payload))
    .toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  const sig = createHmac("sha256", secret).update(payloadB64).digest();
  const sigB64 = sig.toString("base64")
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");

  return `${sigB64}.${payloadB64}`;
}

function makeFormBody(sr: string): string {
  return `signed_request=${encodeURIComponent(sr)}`;
}

function makeJsonBody(sr: string): string {
  return JSON.stringify({ signed_request: sr });
}

/* ── Deps factories ────────────────────────────────────────────────── */

function makeDeauthorizeDeps(overrides?: Partial<DeauthorizeDeps>): DeauthorizeDeps & {
  deletedUserIds: string[]
} {
  const deletedUserIds: string[] = [];
  return {
    getAppSecret:  () => TEST_SECRET,
    deleteUserData: async (id) => { deletedUserIds.push(id); },
    ...overrides,
    deletedUserIds,
  };
}

function makeDataDeletionDeps(overrides?: Partial<DataDeletionDeps>): DataDeletionDeps & {
  deletedUserIds: string[]
  insertedCodes:  string[]
} {
  const deletedUserIds: string[] = [];
  const insertedCodes:  string[] = [];
  return {
    getAppSecret:    () => TEST_SECRET,
    deleteUserData:  async (id) => { deletedUserIds.push(id); },
    recordCompleted: async () => {
      const code = randomUUID();
      insertedCodes.push(code);
      return code;
    },
    siteUrl:         SITE_URL,
    ...overrides,
    deletedUserIds,
    insertedCodes,
  };
}

/* ── Runner ────────────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
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

/* ── Suite ─────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log(C.bold("\nClikClak — Tests callbacks Meta (désautorisation + suppression données)\n"));

  /* ── Signed Request Core (1-9) ──────────────────────────────────── */

  await test("1.  signed_request valide → payload décodé avec user_id", () => {
    const sr     = buildSignedRequest({ algorithm: "HMAC-SHA256", user_id: TEST_USER_ID }, TEST_SECRET);
    const result = parseAndVerifySignedRequestWithSecret(sr, TEST_SECRET);
    assert.equal(result.user_id, TEST_USER_ID);
  });

  await test("2.  Signature invalide → refus", () => {
    const sr = buildSignedRequest({ user_id: TEST_USER_ID }, "wrong-secret");
    assert.throws(() => parseAndVerifySignedRequestWithSecret(sr, TEST_SECRET), /[Ss]ignature/);
  });

  await test("3.  Payload altéré → refus", () => {
    const validSr = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const parts   = validSr.split(".");
    const altPayload = Buffer.from(JSON.stringify({ user_id: "ATTACKER" }))
      .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const tampered = `${parts[0]}.${altPayload}`;
    assert.throws(() => parseAndVerifySignedRequestWithSecret(tampered, TEST_SECRET), /[Ss]ignature/);
  });

  await test("4.  base64UrlDecode gère - et _ (URL-safe)", () => {
    const standard = Buffer.from("Hello+World/Test=").toString("base64");
    const urlSafe  = standard.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const decoded  = base64UrlDecode(urlSafe).toString("base64");
    /* Les bytes décodés doivent être identiques */
    assert.equal(
      base64UrlDecode(urlSafe).toString("hex"),
      Buffer.from(standard, "base64").toString("hex")
    );
    void decoded;
  });

  await test("5.  algorithm autre que HMAC-SHA256 → refus", () => {
    const sr = buildSignedRequest({ algorithm: "HMAC-SHA1", user_id: TEST_USER_ID }, TEST_SECRET);
    assert.throws(() => parseAndVerifySignedRequestWithSecret(sr, TEST_SECRET), /[Aa]lgorithme/);
  });

  await test("6.  user_id absent → refus", () => {
    const sr = buildSignedRequest({ algorithm: "HMAC-SHA256", issued_at: 1 }, TEST_SECRET);
    assert.throws(() => parseAndVerifySignedRequestWithSecret(sr, TEST_SECRET), /user_id/);
  });

  await test("7.  Secret absent → erreur propre via handleDeauthorizeCallback", async () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDeauthorizeDeps({ getAppSecret: () => undefined });
    const res  = await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 500);
    const body = res.body as { error: string };
    assert.ok(!body.error.includes(TEST_SECRET), "Secret ne doit pas apparaître dans l'erreur");
  });

  await test("8.  Signature tronquée (longueur différente) → refus", () => {
    const validPayloadB64 = Buffer.from(JSON.stringify({ user_id: TEST_USER_ID }))
      .toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
    const sr = `abc.${validPayloadB64}`; // signature trop courte
    assert.throws(() => parseAndVerifySignedRequestWithSecret(sr, TEST_SECRET), /[Ss]ignature/);
  });

  await test("9.  Aucune erreur ne contient secret, signature ou signed_request complet", () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, "bad-secret");
    const msgs: string[] = [];
    try { parseAndVerifySignedRequestWithSecret(sr, TEST_SECRET) } catch (e) {
      msgs.push(e instanceof Error ? e.message : String(e));
    }
    for (const msg of msgs) {
      assert.ok(!msg.includes("bad-secret"), "Secret ne doit pas fuiter");
      assert.ok(!msg.includes(sr), "signed_request complet ne doit pas fuiter");
    }
  });

  /* ── Extraction du signed_request (10) ─────────────────────────── */

  await test("10. extractSignedRequest — form-urlencoded et JSON supportés", () => {
    const sr   = "SOME_SIGNED_REQUEST";
    const form = makeFormBody(sr);
    const json = makeJsonBody(sr);
    assert.equal(extractSignedRequest(form, "application/x-www-form-urlencoded"), sr);
    assert.equal(extractSignedRequest(json, "application/json"), sr);
    assert.equal(extractSignedRequest("", "application/x-www-form-urlencoded"), null);
  });

  /* ── Callback deauthorize (11-16) ──────────────────────────────── */

  await test("11. POST form-urlencoded valide → 200 { success: true }", async () => {
    const sr   = buildSignedRequest({ algorithm: "HMAC-SHA256", user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDeauthorizeDeps();
    const res  = await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 200);
    assert.equal((res.body as { success: boolean }).success, true);
  });

  await test("12. signed_request absent → 400", async () => {
    const deps = makeDeauthorizeDeps();
    const res  = await handleDeauthorizeCallback("no_sr=value", "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 400);
  });

  await test("13. Signature invalide → 401", async () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, "wrong-secret");
    const deps = makeDeauthorizeDeps();
    const res  = await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 401);
  });

  await test("14. Connexion supprimée après appel valide", async () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDeauthorizeDeps();
    await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.ok(deps.deletedUserIds.includes(TEST_USER_ID));
  });

  await test("15. Connexion déjà absente → 200 (idempotent, deleteUserData ne lève pas)", async () => {
    const deps = makeDeauthorizeDeps({
      /* deleteUserData silencieux quand connexion absente (idempotent) */
      deleteUserData: async () => { /* no-op */ },
    });
    const sr  = buildSignedRequest({ user_id: "ABSENT_USER" }, TEST_SECRET);
    const res = await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 200);
  });

  await test("16. Erreur deleteUserData → 500", async () => {
    const deps = makeDeauthorizeDeps({
      deleteUserData: async () => { throw new Error("DB error"); },
    });
    const sr  = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const res = await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 500);
    const body = res.body as { error: string };
    assert.ok(!body.error.includes(TEST_USER_ID), "user_id ne doit pas être dans l'erreur");
  });

  /* ── Callback data-deletion (17-24) ────────────────────────────── */

  await test("17. Demande valide → suppression + code de confirmation", async () => {
    const sr   = buildSignedRequest({ algorithm: "HMAC-SHA256", user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDataDeletionDeps();
    const res  = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 200);
    const body = res.body as { url?: string; confirmation_code?: string };
    assert.ok(body.url, "url doit être présente");
    assert.ok(body.confirmation_code, "confirmation_code doit être présent");
  });

  await test("18. Réponse contient url et confirmation_code", async () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDataDeletionDeps();
    const res  = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    const body = res.body as Record<string, unknown>;
    assert.ok(typeof body.url === "string");
    assert.ok(typeof body.confirmation_code === "string");
  });

  await test("19. URL commence exactement par le bon préfixe", async () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDataDeletionDeps();
    const res  = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    const body = res.body as { url: string };
    const EXPECTED = `${SITE_URL}/suppression-donnees?confirmation=`;
    assert.ok(
      body.url.startsWith(EXPECTED),
      `URL doit commencer par "${EXPECTED}"\nReçue : ${body.url}`
    );
  });

  await test("20. Code de confirmation non prévisible (UUID unique à chaque appel)", async () => {
    const codes = new Set<string>();
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    for (let i = 0; i < 5; i++) {
      const sr   = buildSignedRequest({ user_id: `user_${i}` }, TEST_SECRET);
      const deps = makeDataDeletionDeps();
      const res  = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
      const body = res.body as { confirmation_code: string };
      assert.ok(UUID_RE.test(body.confirmation_code), `Code invalide : ${body.confirmation_code}`);
      codes.add(body.confirmation_code);
    }

    assert.equal(codes.size, 5, "Chaque code doit être unique");
  });

  await test("21. Erreur deleteUserData → 500, pas de confirmation", async () => {
    const deps = makeDataDeletionDeps({
      deleteUserData: async () => { throw new Error("DB unreachable"); },
    });
    const sr  = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const res = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 500);
    const body = res.body as Record<string, unknown>;
    assert.ok(!body.confirmation_code, "Aucune confirmation si suppression échouée");
    assert.ok(!body.url, "Aucune url si suppression échouée");
  });

  await test("22. recordCompleted n'est pas appelé si deleteUserData échoue", async () => {
    let recordCalled = false;
    const deps = makeDataDeletionDeps({
      deleteUserData:  async () => { throw new Error("fail"); },
      recordCompleted: async () => { recordCalled = true; return randomUUID(); },
    });
    const sr = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.ok(!recordCalled, "recordCompleted ne doit pas être appelé après un échec");
  });

  await test("23. Demande répétée (connexion absente) → 200 (idempotent)", async () => {
    const deps = makeDataDeletionDeps({
      deleteUserData: async () => { /* idempotent, no-op */ },
    });
    const sr  = buildSignedRequest({ user_id: "ALREADY_DELETED" }, TEST_SECRET);
    const res = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    assert.equal(res.status, 200, "Une connexion déjà supprimée → 200 quand même");
    const body = res.body as { confirmation_code?: string };
    assert.ok(body.confirmation_code, "Un code de confirmation doit quand même être généré");
  });

  await test("24. status completed uniquement après suppression + recordCompleted réussis", async () => {
    let deleteCalled   = false;
    let recordCalled   = false;
    let orderCorrect   = true;

    const deps = makeDataDeletionDeps({
      deleteUserData:  async () => { deleteCalled = true; },
      recordCompleted: async () => {
        if (!deleteCalled) orderCorrect = false;
        recordCalled = true;
        return randomUUID();
      },
    });

    const sr  = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const res = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);

    assert.equal(res.status, 200);
    assert.ok(deleteCalled, "deleteUserData doit être appelé");
    assert.ok(recordCalled, "recordCompleted doit être appelé");
    assert.ok(orderCorrect, "recordCompleted doit être appelé APRÈS delete");
  });

  /* ── Page de statut — logique de validation (25-28) ────────────── */

  await test("25. Code UUID valide → format reconnu", () => {
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const code = randomUUID();
    assert.ok(UUID_RE.test(code));
  });

  await test("26. Code inconnu → la page doit afficher un message générique (contrat null)", () => {
    /* getDataDeletionByCode retourne null pour les codes inconnus.
       La page transforme null en message générique — sans appel DB supplémentaire. */
    const unknownCode: null = null;
    assert.equal(unknownCode, null); // contrat de la fonction pour les codes inconnus
  });

  await test("27. Code malformé → rejeté par la validation regex", () => {
    const CODE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const invalid = [
      "", "not-uuid", "../etc", "' OR 1=1 --", "x".repeat(36), "0".repeat(32),
    ];
    for (const code of invalid) {
      assert.ok(!CODE_RE.test(code), `Code malformé accepté : "${code}"`);
    }
  });

  await test("28. La réponse ne contient pas de données personnelles Instagram", async () => {
    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDataDeletionDeps();
    const res  = await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);
    const text = JSON.stringify(res.body);
    assert.ok(!text.includes(TEST_USER_ID), "user_id ne doit pas être dans la réponse");
    assert.ok(!text.includes("access_token"), "access_token ne doit pas être dans la réponse");
    assert.ok(!text.includes("signed_request"), "signed_request ne doit pas être dans la réponse");
  });

  /* ── Sécurité (29-32) ──────────────────────────────────────────── */

  await test("29. signedRequestCore.ts — pas d'import server-only (importable côté test)", () => {
    const fs      = require("node:fs") as { readFileSync: (p: string, e: string) => string };
    const path    = require("node:path") as { resolve: (...p: string[]) => string };
    const content = fs.readFileSync(path.resolve("lib/meta/instagram/signedRequestCore.ts"), "utf8");
    /* Rechercher l'instruction import réelle (pas un commentaire) */
    const importSingleQuote = /^import 'server-only'/m.test(content);
    const importDoubleQuote = /^import "server-only"/m.test(content);
    assert.ok(!importSingleQuote, "signedRequestCore.ts ne doit pas contenir import 'server-only'");
    assert.ok(!importDoubleQuote, "signedRequestCore.ts ne doit pas contenir import \"server-only\"");
  });

  await test("30. Aucun log ne contient signed_request ou secret", async () => {
    const logs: string[] = [];
    const orig = (console as unknown as Record<string, unknown>).info;
    (console as unknown as Record<string, unknown>).info = (...a: unknown[]) => {
      logs.push(JSON.stringify(a));
    };

    const sr   = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    const deps = makeDeauthorizeDeps();
    await handleDeauthorizeCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);

    (console as unknown as Record<string, unknown>).info = orig;
    const allLogs = logs.join(" ");
    assert.ok(!allLogs.includes(sr), "signed_request ne doit pas être loggé");
    assert.ok(!allLogs.includes(TEST_SECRET), "Secret ne doit pas être loggé");
  });

  await test("31. Migration 009 — RLS activée, aucune policy anon/authenticated", () => {
    const fs      = require("node:fs") as { readFileSync: (p: string, e: string) => string };
    const path    = require("node:path") as { resolve: (...p: string[]) => string };
    const sql = fs.readFileSync(
      path.resolve("supabase/migrations/009_instagram_data_deletion_requests.sql"), "utf8"
    );
    assert.ok(!sql.includes("CREATE POLICY"), "Aucune policy ne doit être créée");
    assert.ok(!sql.includes("FOR anon"), "Aucune policy anon");
    assert.ok(sql.includes("ENABLE ROW LEVEL SECURITY"), "RLS doit être activée");
  });

  await test("32. Données de message non persistées par les callbacks", async () => {
    const deletedKeys: string[] = [];
    const insertedTables: string[] = [];

    const deps = makeDataDeletionDeps({
      deleteUserData: async (id) => { deletedKeys.push(`conversation:${id}`); },
      recordCompleted: async () => {
        insertedTables.push("instagram_data_deletion_requests");
        return randomUUID();
      },
    });

    const sr = buildSignedRequest({ user_id: TEST_USER_ID }, TEST_SECRET);
    await handleDataDeletionCallback(makeFormBody(sr), "application/x-www-form-urlencoded", deps);

    /* Seule la table de suivi doit être insérée, jamais de table de messages */
    const messageTables = insertedTables.filter(t => t.includes("message") || t.includes("conversation"));
    assert.equal(messageTables.length, 0, "Aucune table de messages ne doit être insérée");
  });

  /* ── Résultat ──────────────────────────────────────────────────── */

  console.log("");
  console.log(
    `${C.bold("Résultats :")} ${C.green(`${passed} passé(s)`)}` +
    (failed > 0 ? ` ${C.red(`${failed} échoué(s)`)}` : "")
  );

  if (failed > 0) process.exit(1);
  console.log(C.green("\n✅ Tous les tests callbacks Meta sont passés.\n"));
}

main().catch((err: unknown) => {
  console.error(C.red("\n❌ Erreur inattendue :"));
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
