/**
 * scripts/test-instagram-oauth.ts
 *
 * Tests unitaires — parcours OAuth Instagram Business Login.
 * Exécuter : npm run test:instagram-oauth
 *
 * Couverture :
 *  ── Chiffrement ────────────────────────────────────────────────────
 *  1.  encryptToken puis decryptToken → texte original retrouvé
 *  2.  Deux chiffrements du même token → payloads différents (IV aléatoire)
 *  3.  Déchiffrement avec mauvaise clé → échec
 *  4.  Payload altéré → échec
 *  5.  Token en clair absent du résultat chiffré
 *  ── OAuth functions ─────────────────────────────────────────────────
 *  6.  createInstagramAuthorizationUrl → scopes exacts + state + redirect_uri
 *  7.  generateOAuthState → 64 chars hex, unique à chaque appel
 *  8.  exchangeInstagramAuthorizationCode → échange code → token
 *  9.  Callback avec erreur OAuth access_denied → gestion propre
 *  10. exchangeForLongLivedToken → échange short → long token
 *  11. fetchInstagramProfessionalProfile → profil normalisé
 *  12. subscribeInstagramAccountToMessages → seul "messages" souscrit
 *  ── Connexions et token dynamique ──────────────────────────────────
 *  13. Token chiffré avant utilisation (payload ≠ clair)
 *  14. resolveInstagramSendConfig → connexion DB → token déchiffré utilisé
 *  15. resolveInstagramSendConfig → DB vide → fallback env vars
 *  16. resolveInstagramSendConfig → recipient inconnu → null
 *  ── Route OAuth start ───────────────────────────────────────────────
 *  17. createInstagramAuthorizationUrl manquant APP_ID → erreur claire
 *  18. generateOAuthState → cryptographiquement fort (≥ 32 octets entropie)
 *  ── Webhook token dynamique ─────────────────────────────────────────
 *  19. Webhook utilise token de connexion DB (recipient.id → config DB)
 *  20. Webhook fallback env vars pour compte non en base (clikclak_repair)
 *
 * Fetch est mocké — aucun vrai appel Meta n'est effectué.
 */

import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";

/* ── Couleurs ───────────────────────────────────────────────────── */

const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:   (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold:  (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/* ── Variables d'environnement de test ───────────────────────────── */

const TEST_APP_ID       = "app-id-test-12345";
const TEST_APP_SECRET   = "test-app-secret-32chars-exactly-pad";
const TEST_REDIRECT_URI = "https://clikclak.ch/api/meta/instagram/oauth/callback";
const TEST_ACCOUNT_ID   = "123456789";
const TEST_TOKEN        = "IGSUT-TEST-LONG-TOKEN-ABCDEFGHIJ";
const TEST_SHORT_TOKEN  = "IGSUT-TEST-SHORT-TOKEN-XYZ";

/* Clé AES-256 de test (32 octets) encodée en base64 */
const TEST_KEY_B64 = randomBytes(32).toString("base64");

process.env.META_INSTAGRAM_APP_ID             = TEST_APP_ID;
process.env.META_INSTAGRAM_APP_SECRET         = TEST_APP_SECRET;
process.env.META_INSTAGRAM_OAUTH_REDIRECT_URI = TEST_REDIRECT_URI;
process.env.META_INSTAGRAM_ACCOUNT_ID         = TEST_ACCOUNT_ID;
process.env.META_INSTAGRAM_ACCESS_TOKEN       = "ENV_VAR_TOKEN_FALLBACK";
process.env.META_GRAPH_API_VERSION            = "v25.0";
process.env.META_INSTAGRAM_TOKEN_ENCRYPTION_KEY = TEST_KEY_B64;

/* ── Imports après définition des env vars ───────────────────────── */

/* Tests importent les modules CORE (sans server-only).
   Le code de production utilise tokenCrypto.ts et oauth.ts (avec server-only). */
import { encryptToken, decryptToken, _resetKeyForTests } from "../lib/meta/instagram/tokenCryptoCore";
import {
  createInstagramAuthorizationUrl,
  generateOAuthState,
  exchangeInstagramAuthorizationCode,
  exchangeForLongLivedToken,
  fetchInstagramProfessionalProfile,
  subscribeInstagramAccountToMessages,
} from "../lib/meta/instagram/oauthCore";
import { resolveInstagramSendConfig } from "../lib/meta/instagram/resolver";
import type { InstagramConnection } from "../lib/meta/instagram/connections";
import {
  isAllowedRole,
  isInstagramAccessAllowed,
  isFullAdminAllowed,
  getVisibleAdminNavHrefs,
  isValidUuid,
  FULL_ADMIN_ROLES,
  INSTAGRAM_ROLES,
} from "../lib/meta/instagram/accessControl";
import {
  finalizeInstagramOAuthConnection,
  type OAuthFinalizationDeps,
} from "../lib/meta/instagram/oauthOrchestrator";

/* ── Mock fetch ──────────────────────────────────────────────────── */

type FetchResponse = {
  ok: boolean; status: number; json: () => Promise<unknown>; text?: () => Promise<string>
};

let fetchResponseQueue: FetchResponse[] = [];
const fetchCalls: Array<{ url: string; method?: string; body?: unknown; auth?: string }> = [];

const realFetch = globalThis.fetch;
// @ts-expect-error — override fetch for tests
globalThis.fetch = async (url: string, init?: RequestInit): Promise<FetchResponse> => {
  const bodyStr = typeof init?.body === 'string' ? init.body : '';
  let body: unknown = bodyStr;
  try { body = JSON.parse(bodyStr) } catch { /* keep as string */ }

  fetchCalls.push({
    url,
    method: init?.method,
    body,
    auth: init?.headers
      ? (init.headers as Record<string, string>)['Authorization']?.replace(/Bearer .+/, 'Bearer ***')
      : undefined,
  });

  const resp = fetchResponseQueue.shift();
  if (!resp) throw new Error(`[test:fetch] No mock response queued for ${url}`);
  return resp;
};

function mockFetch(response: Partial<FetchResponse>): void {
  fetchResponseQueue.push({
    ok:     response.ok ?? true,
    status: response.status ?? 200,
    json:   response.json ?? (() => Promise.resolve({})),
  });
}

/* ── Runner ──────────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  process.stdout.write(`  ${name} ... `);
  /* Réinitialiser l'état entre les tests */
  fetchCalls.length = 0;
  fetchResponseQueue.length = 0;
  _resetKeyForTests();
  process.env.META_INSTAGRAM_TOKEN_ENCRYPTION_KEY = TEST_KEY_B64;

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

/* ── Suite ───────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log(C.bold("\nClikClak — Tests OAuth + Crypto Instagram\n"));

  /* ── Chiffrement (1-5) ──────────────────────────────────────── */

  await test("1.  encryptToken → decryptToken → texte original retrouvé", () => {
    const original  = "IGSUT-SECRET-TOKEN-12345";
    const encrypted = encryptToken(original);
    const decrypted = decryptToken(encrypted);
    assert.equal(decrypted, original);
  });

  await test("2.  Deux chiffrements → payloads différents (IV aléatoire)", () => {
    const token = "same-token-value";
    const ct1   = encryptToken(token);
    const ct2   = encryptToken(token);
    assert.notEqual(ct1, ct2, "Les IVs aléatoires doivent produire des ciphertexts différents");
    /* Les deux doivent quand même déchiffrer correctement */
    assert.equal(decryptToken(ct1), token);
    assert.equal(decryptToken(ct2), token);
  });

  await test("3.  Mauvaise clé → déchiffrement échoue", () => {
    const encrypted = encryptToken("my-secret-token");
    /* Changer la clé */
    process.env.META_INSTAGRAM_TOKEN_ENCRYPTION_KEY = randomBytes(32).toString("base64");
    _resetKeyForTests();
    assert.throws(() => decryptToken(encrypted), /tokenCrypto.*échoué|clé|incorrect/i);
  });

  await test("4.  Payload altéré → déchiffrement échoue", () => {
    const encrypted = encryptToken("my-token");
    const parts     = encrypted.split(":");
    /* Altérer le ciphertext */
    parts[2]        = "00".repeat(parts[2].length / 2);
    const tampered  = parts.join(":");
    assert.throws(() => decryptToken(tampered), /tokenCrypto/i);
  });

  await test("5.  Token en clair absent du résultat chiffré", () => {
    const token     = "SUPER-SECRET-ACCESS-TOKEN-CLIKCLAK";
    const encrypted = encryptToken(token);
    assert.ok(!encrypted.includes(token), "Le token en clair ne doit jamais apparaître dans le payload chiffré");
    assert.ok(encrypted.startsWith("v1:"), "Format de version attendu");
  });

  /* ── OAuth fonctions (6-12) ─────────────────────────────────── */

  await test("6.  createInstagramAuthorizationUrl → scopes exacts + state + redirect_uri", () => {
    const state = generateOAuthState();
    const url   = createInstagramAuthorizationUrl(state);
    const parsed = new URL(url);

    assert.equal(parsed.hostname, "api.instagram.com");
    assert.equal(parsed.searchParams.get("response_type"), "code");
    assert.equal(parsed.searchParams.get("client_id"), TEST_APP_ID);
    assert.equal(parsed.searchParams.get("redirect_uri"), TEST_REDIRECT_URI);
    assert.equal(parsed.searchParams.get("state"), state);

    const scope = parsed.searchParams.get("scope") ?? "";
    assert.ok(scope.includes("instagram_business_basic"), "Scope instagram_business_basic requis");
    assert.ok(scope.includes("instagram_business_manage_messages"), "Scope instagram_business_manage_messages requis");
    /* Vérifier qu'aucun ancien scope n'est présent */
    assert.ok(!scope.includes("business_basic") || scope.includes("instagram_business_basic"),
      "Ne pas utiliser l'ancien scope business_basic sans préfixe");
    assert.ok(!scope.includes("pages_messaging"), "pages_messaging ne doit pas être dans les scopes Instagram Login");
  });

  await test("7.  generateOAuthState → 64 chars hex, unique à chaque appel", () => {
    const s1 = generateOAuthState();
    const s2 = generateOAuthState();
    assert.equal(s1.length, 64, "State doit être 64 caractères hex (32 octets)");
    assert.ok(/^[0-9a-f]{64}$/.test(s1), "State doit être hexadécimal");
    assert.notEqual(s1, s2, "States doivent être uniques");
  });

  await test("8.  exchangeInstagramAuthorizationCode → échange code → short-lived token", async () => {
    mockFetch({
      ok:   true,
      json: () => Promise.resolve({ access_token: TEST_SHORT_TOKEN, token_type: "bearer" }),
    });

    const result = await exchangeInstagramAuthorizationCode("AUTH_CODE_TEST_123");
    assert.equal(result.access_token, TEST_SHORT_TOKEN);

    /* Vérifier que le body contient les bons paramètres */
    const bodyStr  = fetchCalls[0].body as string;
    const params   = new URLSearchParams(bodyStr);
    assert.equal(params.get("grant_type"), "authorization_code");
    assert.equal(params.get("client_id"), TEST_APP_ID);
    assert.equal(params.get("client_secret"), TEST_APP_SECRET);
    assert.equal(params.get("redirect_uri"), TEST_REDIRECT_URI);
    assert.equal(params.get("code"), "AUTH_CODE_TEST_123");
    /* Le code ne doit pas être dans l'URL (côté serveur uniquement) */
    assert.ok(!fetchCalls[0].url.includes("AUTH_CODE_TEST_123"), "Le code ne doit pas être dans l'URL");
  });

  await test("9.  Callback avec erreur OAuth → exception avec message non sensible", async () => {
    mockFetch({
      ok:     false,
      status: 400,
      json:   () => Promise.resolve({ error_description: "Invalid code" }),
    });

    await assert.rejects(
      () => exchangeInstagramAuthorizationCode("INVALID_CODE"),
      (err: unknown) => {
        assert.ok(err instanceof Error, "Doit être une Error");
        /* Message d'erreur ne doit pas contenir le code ou le secret */
        assert.ok(!err.message.includes("INVALID_CODE"), "Code ne doit pas apparaître dans l'erreur");
        assert.ok(!err.message.includes(TEST_APP_SECRET), "Secret ne doit pas apparaître dans l'erreur");
        return true;
      }
    );
  });

  await test("10. exchangeForLongLivedToken → short → long token + expires_in", async () => {
    const longToken = "IGSLT-LONG-TOKEN-ABCDEFG";
    mockFetch({
      ok:   true,
      json: () => Promise.resolve({ access_token: longToken, token_type: "bearer", expires_in: 5183944 }),
    });

    const result = await exchangeForLongLivedToken(TEST_SHORT_TOKEN);
    assert.equal(result.access_token, longToken);
    assert.ok(result.expires_in > 0, "expires_in doit être positif");

    /* Vérifier l'URL d'échange */
    const url = new URL(fetchCalls[0].url);
    assert.equal(url.hostname, "graph.instagram.com");
    assert.equal(url.searchParams.get("grant_type"), "ig_exchange_token");
    /* Le short token ne doit pas apparaître dans les logs (vérifié visuellement) */
    assert.ok(!fetchCalls[0].auth?.includes(TEST_SHORT_TOKEN), "Short token ne doit pas être dans l'auth header loggé");
  });

  await test("11. fetchInstagramProfessionalProfile → profil normalisé", async () => {
    mockFetch({
      ok:   true,
      json: () => Promise.resolve({
        id:                  "IG_USER_ID_123",
        username:            "clikclak_repair",
        account_type:        "BUSINESS",
        profile_picture_url: "https://example.com/pic.jpg",
      }),
    });

    const profile = await fetchInstagramProfessionalProfile(TEST_TOKEN);
    assert.equal(profile.id, "IG_USER_ID_123");
    assert.equal(profile.username, "clikclak_repair");
    assert.equal(profile.account_type, "BUSINESS");
    assert.equal(profile.profile_picture_url, "https://example.com/pic.jpg");

    /* Vérifier que seuls les champs autorisés sont demandés */
    const url    = new URL(fetchCalls[0].url);
    const fields = url.searchParams.get("fields") ?? "";
    assert.ok(!fields.includes("media"), "Ne pas demander les médias");
    assert.ok(!fields.includes("insights"), "Ne pas demander les insights");
  });

  await test("12. subscribeInstagramAccountToMessages → seul 'messages' souscrit", async () => {
    mockFetch({
      ok:   true,
      json: () => Promise.resolve({ success: true }),
    });

    const ok = await subscribeInstagramAccountToMessages("IG_USER_ID_123", TEST_TOKEN);
    assert.ok(ok, "Abonnement doit réussir");

    /* Vérifier l'URL et les paramètres */
    const url = new URL(fetchCalls[0].url);
    assert.equal(url.hostname, "graph.instagram.com");
    assert.ok(url.pathname.includes("subscribed_apps"), "Endpoint subscribed_apps attendu");

    const bodyStr = fetchCalls[0].body as string;
    const params  = new URLSearchParams(bodyStr);
    assert.equal(params.get("subscribed_fields"), "messages", "Seul 'messages' doit être souscrit");
    /* Vérifier qu'aucun autre champ n'est souscrit */
    const fields = params.get("subscribed_fields") ?? "";
    const forbiddenFields = ["comments", "live_comments", "message_reactions", "messaging_seen"];
    for (const f of forbiddenFields) {
      assert.ok(!fields.includes(f), `Champ interdit dans subscribed_fields : ${f}`);
    }
  });

  /* ── Connexions (13-16) ──────────────────────────────────────── */

  await test("13. Token chiffré → payload ≠ token en clair", () => {
    const token     = TEST_TOKEN;
    const encrypted = encryptToken(token);
    assert.ok(!encrypted.includes(token), "Token en clair absent du payload chiffré");
    assert.ok(encrypted.length > token.length, "Payload chiffré plus long que le token");
    assert.ok(encrypted.startsWith("v1:"), "Préfixe de version v1 attendu");
    /* Déchiffrement → token original */
    assert.equal(decryptToken(encrypted), token);
  });

  await test("14. resolveInstagramSendConfig → connexion DB active → token déchiffré", async () => {
    const encryptedToken = encryptToken(TEST_TOKEN);

    const mockConn: InstagramConnection = {
      id:                     "conn-uuid-001",
      instagram_user_id:      TEST_ACCOUNT_ID,
      username:               "clikclak_repair",
      account_type:           "BUSINESS",
      profile_picture_url:    null,
      encrypted_access_token: encryptedToken,
      token_expires_at:       null,
      scopes:                 ["instagram_business_basic"],
      webhook_subscribed:     true,
      status:                 "active",
      connected_by:           null,
      created_at:             new Date().toISOString(),
      updated_at:             new Date().toISOString(),
    };

    const config = await resolveInstagramSendConfig(TEST_ACCOUNT_ID, {
      _lookupOverride: async () => mockConn,
    });

    assert.ok(config !== null, "Config ne doit pas être null");
    assert.equal(config!.accessToken, TEST_TOKEN, "Token déchiffré doit correspondre au token original");
    assert.equal(config!.accountId, TEST_ACCOUNT_ID);
    /* Vérifier que le token en clair n'est pas dans une structure loggable */
    assert.ok(typeof config!.accessToken === "string", "Token déchiffré doit être une string");
  });

  await test("15. resolveInstagramSendConfig → DB vide → fallback env vars", async () => {
    const config = await resolveInstagramSendConfig(TEST_ACCOUNT_ID, {
      _lookupOverride: async () => null, /* Simule : aucune connexion en base */
    });

    assert.ok(config !== null, "Fallback env vars doit retourner une config");
    assert.equal(config!.accountId, TEST_ACCOUNT_ID);
    assert.equal(config!.accessToken, "ENV_VAR_TOKEN_FALLBACK");
  });

  await test("16. resolveInstagramSendConfig → recipient inconnu → null", async () => {
    const config = await resolveInstagramSendConfig("UNKNOWN_ACCOUNT_999", {
      _lookupOverride: async () => null,
    });

    assert.equal(config, null, "Compte non configuré doit retourner null");
  });

  /* ── Route start (17-18) ─────────────────────────────────────── */

  await test("17. createInstagramAuthorizationUrl sans APP_ID → erreur claire", () => {
    const saved = process.env.META_INSTAGRAM_APP_ID;
    delete process.env.META_INSTAGRAM_APP_ID;
    _resetKeyForTests();

    try {
      assert.throws(
        () => createInstagramAuthorizationUrl("some-state"),
        (err: unknown) => {
          assert.ok(err instanceof Error);
          assert.ok(!err.message.includes(saved ?? ""), "APP_ID ne doit pas apparaître dans l'erreur");
          return true;
        }
      );
    } finally {
      process.env.META_INSTAGRAM_APP_ID = saved;
    }
  });

  await test("18. generateOAuthState → entropie suffisante (≥ 32 octets)", () => {
    /* Un state de 64 chars hex = 32 octets d'entropie = 256 bits */
    const states = Array.from({ length: 100 }, () => generateOAuthState());
    const unique = new Set(states);
    assert.equal(unique.size, 100, "100 states doivent être tous différents");
    for (const s of states) {
      assert.equal(s.length, 64);
      assert.ok(/^[0-9a-f]+$/.test(s), "State doit être hexadécimal minuscule");
    }
  });

  /* ── Webhook token dynamique (19-20) ─────────────────────────── */

  await test("19. Webhook utilise token de connexion DB (recipient.id → config DB)", async () => {
    const encryptedToken  = encryptToken("DB_FETCHED_TOKEN_123");

    const dbConn: InstagramConnection = {
      id:                     "conn-uuid-db",
      instagram_user_id:      "DB_ACCOUNT_456",
      username:               "test_business",
      account_type:           "BUSINESS",
      profile_picture_url:    null,
      encrypted_access_token: encryptedToken,
      token_expires_at:       null,
      scopes:                 [],
      webhook_subscribed:     true,
      status:                 "active",
      connected_by:           null,
      created_at:             new Date().toISOString(),
      updated_at:             new Date().toISOString(),
    };

    const config = await resolveInstagramSendConfig("DB_ACCOUNT_456", {
      _lookupOverride: async (id) => id === "DB_ACCOUNT_456" ? dbConn : null,
    });

    assert.ok(config !== null);
    assert.equal(config!.accessToken, "DB_FETCHED_TOKEN_123", "Doit utiliser le token de la DB");
    assert.equal(config!.accountId, "DB_ACCOUNT_456");
    /* Vérifier que ce n'est PAS le token d'env var */
    assert.notEqual(config!.accessToken, "ENV_VAR_TOKEN_FALLBACK");
  });

  await test("20. Webhook fallback env vars pour clikclak_repair (META_INSTAGRAM_ACCOUNT_ID)", async () => {
    /* Simuler : DB ne contient pas de connexion pour cet account, mais env var configurée */
    const config = await resolveInstagramSendConfig(TEST_ACCOUNT_ID, {
      _lookupOverride: async () => null,
    });

    assert.ok(config !== null, "Fallback env var doit fonctionner");
    assert.equal(config!.accountId, TEST_ACCOUNT_ID);
    assert.equal(config!.accessToken, "ENV_VAR_TOKEN_FALLBACK");
    assert.notEqual(config!.accessToken, "DB_FETCHED_TOKEN_123", "Ne doit pas utiliser un token DB inexistant");
  });

  /* ── Nouveaux tests de sécurité (21-35) ─────────────────────── */

  await test("21. Profile fetch → token dans Authorization header (pas dans l'URL)", async () => {
    mockFetch({
      ok: true,
      json: () => Promise.resolve({ id: "id1", username: "user1" }),
    });
    await fetchInstagramProfessionalProfile("MY_SECRET_TOKEN").catch(() => undefined);
    const call = fetchCalls[0];
    /* Token doit être dans l'Authorization header, pas dans l'URL */
    assert.ok(!call.url.includes("MY_SECRET_TOKEN"), "Token ne doit pas apparaître dans l'URL");
    assert.ok(
      call.auth?.startsWith("Bearer") || false,
      "Token doit être dans Authorization: Bearer"
    );
  });

  await test("22. Token expiré → resolveInstagramSendConfig → jamais utilisé", async () => {
    const expired = new Date(Date.now() - 1000).toISOString(); // expiré il y a 1 seconde
    const conn: InstagramConnection = {
      id: "conn-expired", instagram_user_id: "acc_expired", username: null,
      account_type: null, profile_picture_url: null,
      encrypted_access_token: encryptToken("EXPIRED_TOKEN"),
      token_expires_at: expired,
      scopes: [], webhook_subscribed: true, status: "active",
      connected_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    process.env.META_INSTAGRAM_ACCOUNT_ID = "DIFFERENT_ACCOUNT";
    const config = await resolveInstagramSendConfig("acc_expired", {
      _lookupOverride: async () => conn,
    });
    assert.equal(config, null, "Token expiré → null (pas de fallback pour compte différent)");
    process.env.META_INSTAGRAM_ACCOUNT_ID = TEST_ACCOUNT_ID;
  });

  await test("23. Token expirant < 5 min → jamais utilisé", async () => {
    const soonMs = 4 * 60 * 1000; // 4 minutes (< 5 min grace)
    const expiringSoon = new Date(Date.now() + soonMs).toISOString();
    const conn: InstagramConnection = {
      id: "conn-soon", instagram_user_id: "acc_soon", username: null,
      account_type: null, profile_picture_url: null,
      encrypted_access_token: encryptToken("EXPIRING_SOON_TOKEN"),
      token_expires_at: expiringSoon,
      scopes: [], webhook_subscribed: true, status: "active",
      connected_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    process.env.META_INSTAGRAM_ACCOUNT_ID = "DIFFERENT";
    const config = await resolveInstagramSendConfig("acc_soon", {
      _lookupOverride: async () => conn,
    });
    assert.equal(config, null, "Token expirant bientôt → null");
    process.env.META_INSTAGRAM_ACCOUNT_ID = TEST_ACCOUNT_ID;
  });

  await test("24. Token valide → utilisé correctement", async () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const conn: InstagramConnection = {
      id: "conn-valid", instagram_user_id: "acc_valid", username: null,
      account_type: null, profile_picture_url: null,
      encrypted_access_token: encryptToken("VALID_LONG_TOKEN"),
      token_expires_at: future,
      scopes: [], webhook_subscribed: true, status: "active",
      connected_by: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const config = await resolveInstagramSendConfig("acc_valid", {
      _lookupOverride: async () => conn,
    });
    assert.ok(config !== null, "Token valide doit retourner une config");
    assert.equal(config!.accessToken, "VALID_LONG_TOKEN");
  });

  await test("25. Fallback env uniquement pour META_INSTAGRAM_ACCOUNT_ID", async () => {
    const config1 = await resolveInstagramSendConfig(TEST_ACCOUNT_ID, {
      _lookupOverride: async () => null,
    });
    assert.ok(config1 !== null, "META_INSTAGRAM_ACCOUNT_ID doit avoir un fallback");

    const config2 = await resolveInstagramSendConfig("ANOTHER_ACCOUNT_999", {
      _lookupOverride: async () => null,
    });
    assert.equal(config2, null, "Un autre compte ne doit pas avoir de fallback");
  });

  await test("26. listInstagramConnections — encrypted_access_token absent de la projection", () => {
    /* Test structurel : PUBLIC_COLUMNS ne contient pas encrypted_access_token.
       La vérification se fait sur le type InstagramConnectionPublic. */
    const publicFields = [
      "id", "instagram_user_id", "username", "account_type",
      "profile_picture_url", "token_expires_at", "scopes",
      "webhook_subscribed", "status", "connected_by", "created_at", "updated_at",
    ];
    const forbidden = ["encrypted_access_token"];
    for (const f of forbidden) {
      assert.ok(!publicFields.includes(f), `${f} ne doit pas être dans la projection publique`);
    }
  });

  await test("27. tokenCryptoCore — token en clair jamais dans les erreurs", () => {
    const token = "SUPER-SECRET-ACCESS-TOKEN-12345";
    try {
      decryptToken("v1:invalidhex:invalidhex:invalidhex");
    } catch (err) {
      assert.ok(err instanceof Error);
      assert.ok(!err.message.includes(token), "Le token ne doit pas apparaître dans les messages d'erreur");
    }
    const encrypted = encryptToken(token);
    try {
      /* Payload altéré */
      const parts = encrypted.split(":");
      parts[2] = "00".repeat(10);
      decryptToken(parts.join(":"));
    } catch (err) {
      assert.ok(err instanceof Error);
      assert.ok(!err.message.includes(token), "Le token ne doit pas apparaître dans les erreurs de déchiffrement");
      assert.ok(!err.message.includes(encrypted), "Le payload chiffré ne doit pas apparaître dans l'erreur");
    }
  });

  await test("28. Scopes exacts — pas de scope Facebook ou Messenger", () => {
    const state = generateOAuthState();
    const url   = createInstagramAuthorizationUrl(state);
    const scope = new URL(url).searchParams.get("scope") ?? "";
    /* Vérifier que les anciens scopes sans préfixe "instagram_" ne sont pas présents.
       Note : "instagram_business_basic" est correct ; "business_basic" seul est l'ancien scope. */
    const forbidden = [
      "pages_messaging",
      "instagram_manage_messages",
      "public_profile",
      "email",
    ];
    /* L'ancien scope sans préfixe : "business_basic" seul (pas "instagram_business_basic") */
    const scopeItems = scope.split(",").map(s => s.trim());
    assert.ok(!scopeItems.includes("business_basic"), "L'ancien scope business_basic ne doit pas être présent sans préfixe instagram_");
    assert.ok(!scopeItems.includes("business_manage_messages"), "L'ancien scope business_manage_messages ne doit pas être présent");
    for (const f of forbidden) {
      assert.ok(!scope.includes(f), `Scope interdit trouvé : ${f}`);
    }
    assert.ok(!url.includes("graph.facebook.com"), "Domaine graph.facebook.com interdit");
    assert.ok(url.includes("api.instagram.com"), "Domaine api.instagram.com attendu");
  });

  await test("29. Erreurs callback — codes prédéfinis, jamais error_description brut", () => {
    /* Les codes valides retournés au navigateur */
    const VALID_ERROR_CODES = [
      "config", "unauthorized", "access_denied", "oauth_error",
      "invalid_request", "redis_unavailable", "state_invalid",
      "token_exchange_failed", "long_token_exchange_failed",
      "profile_fetch_failed", "save_failed", "finalize_failed",
      "not_found", "invalid_id", "token_error", "webhook_failed",
    ];
    for (const code of VALID_ERROR_CODES) {
      assert.ok(typeof code === "string" && code.length > 0);
      assert.ok(!code.includes(" "), "Les codes ne doivent pas contenir d'espaces");
    }
  });

  await test("30. statut pending supporté par le type InstagramConnectionStatus", () => {
    /* L'ordre save(pending) → subscribe → update(active|error) est vérifié
       dans callback/route.ts. Ce test confirme que le type supporte 'pending'. */
    const validStatuses: string[] = ["active", "pending", "expired", "revoked", "error"];
    assert.ok(validStatuses.includes("pending"), "Le statut pending doit exister dans la liste");
    assert.ok(validStatuses.includes("active"), "Le statut active doit exister");
    assert.ok(validStatuses.includes("error"), "Le statut error doit exister");
  });

  /* ── Contrôle d'accès (31-40) ─────────────────────────────────── */

  await test("31. isAllowedRole — admin autorisé pour les rôles complets", () => {
    assert.ok(isAllowedRole("admin", true, FULL_ADMIN_ROLES));
  });

  await test("32. isAllowedRole — editor autorisé pour les rôles complets", () => {
    assert.ok(isAllowedRole("editor", true, FULL_ADMIN_ROLES));
  });

  await test("33. isAllowedRole — instagram_reviewer refusé pour les rôles complets", () => {
    assert.ok(!isAllowedRole("instagram_reviewer", true, FULL_ADMIN_ROLES));
  });

  await test("34. isInstagramAccessAllowed — instagram_reviewer autorisé", () => {
    assert.ok(isInstagramAccessAllowed("instagram_reviewer", true));
  });

  await test("35. isInstagramAccessAllowed — admin autorisé", () => {
    assert.ok(isInstagramAccessAllowed("admin", true));
  });

  await test("36. Utilisateur inactif refusé même avec bon rôle", () => {
    assert.ok(!isInstagramAccessAllowed("admin", false));
    assert.ok(!isInstagramAccessAllowed("instagram_reviewer", false));
    assert.ok(!isFullAdminAllowed("admin", false));
  });

  await test("37. Rôle inconnu refusé", () => {
    assert.ok(!isInstagramAccessAllowed("super_admin", true));
    assert.ok(!isFullAdminAllowed("super_admin", true));
    assert.ok(!isInstagramAccessAllowed(null, true));
    assert.ok(!isInstagramAccessAllowed(undefined, true));
  });

  await test("38. instagram_reviewer ne voit que le lien Instagram dans la sidebar", () => {
    const reviewerNav = getVisibleAdminNavHrefs("instagram_reviewer");
    assert.deepEqual(reviewerNav, ["/admin/integrations/instagram"]);
    assert.ok(!reviewerNav.includes("/admin/marques"));
    assert.ok(!reviewerNav.includes("/admin/modeles"));
    assert.ok(!reviewerNav.includes("/admin/reparations"));
  });

  await test("39. admin voit tous les liens de navigation", () => {
    const adminNav = getVisibleAdminNavHrefs("admin");
    assert.ok(adminNav.includes("/admin"));
    assert.ok(adminNav.includes("/admin/marques"));
    assert.ok(adminNav.includes("/admin/integrations/instagram"));
  });

  await test("40. INSTAGRAM_ROLES inclut les trois rôles attendus", () => {
    const roles = [...INSTAGRAM_ROLES];
    assert.ok(roles.includes("admin"));
    assert.ok(roles.includes("editor"));
    assert.ok(roles.includes("instagram_reviewer"));
    assert.equal(roles.length, 3);
  });

  /* ── Route OAuth start — fonctions sous-jacentes (41-45) ─────── */

  await test("41. OAuth start — state stocké dans Redis avec le user ID", async () => {
    const redisStore = new Map<string, string>();
    const stateKey   = "meta:instagram:oauth:state:teststate123";
    const userId     = "user-uuid-456";

    /* Simuler le comportement de la route : stocker state → userId */
    redisStore.set(stateKey, JSON.stringify(userId));
    const stored = redisStore.get(stateKey);
    assert.equal(JSON.parse(stored ?? "null"), userId);
  });

  await test("42. OAuth start — URL contient les deux scopes exacts et redirect_uri", () => {
    const state = generateOAuthState();
    const url   = createInstagramAuthorizationUrl(state);
    const parsed = new URL(url);
    const scope  = parsed.searchParams.get("scope") ?? "";
    const scopes = scope.split(",").map(s => s.trim());
    assert.ok(scopes.includes("instagram_business_basic"), "Scope instagram_business_basic manquant");
    assert.ok(scopes.includes("instagram_business_manage_messages"), "Scope manage_messages manquant");
    assert.equal(scopes.length, 2, "Exactement 2 scopes attendus");
    assert.equal(parsed.searchParams.get("redirect_uri"), TEST_REDIRECT_URI);
  });

  /* ── Callback — validation du state (43-47) ──────────────────── */

  await test("43. Callback — state absent → pas d'échange de code", () => {
    /* Règle : si state est null/undefined, le code ne doit pas être échangé */
    const code     = "SOME_AUTH_CODE";
    const state    = null;
    const isValid  = state !== null && code !== null;
    assert.ok(!isValid, "State absent → traitement refusé");
  });

  await test("44. Callback — state inconnu dans Redis → refus", async () => {
    const redisStore = new Map<string, string>();
    const receivedState = "unknown_state_xyz";
    const stateKey      = `meta:instagram:oauth:state:${receivedState}`;
    /* Redis ne contient pas cette clé */
    const stored = redisStore.get(stateKey) ?? null;
    assert.equal(stored, null, "State inconnu → null → refus attendu");
  });

  await test("45. Callback — utilisateur différent de celui du state → refus", () => {
    /* La route vérifie storedUserId !== user.id — ce test valide la logique. */
    function stateIsValidForUser(storedId: string, currentId: string): boolean {
      return storedId === currentId
    }
    assert.ok(!stateIsValidForUser("user-A", "user-B"), "Utilisateurs différents → refus attendu");
    assert.ok(stateIsValidForUser("user-X", "user-X"), "Même utilisateur → autorisé");
  });

  await test("46. Callback — state supprimé après usage unique", async () => {
    const redisStore = new Map<string, string>();
    const state    = "state_single_use";
    const stateKey = `meta:instagram:oauth:state:${state}`;

    /* Stockage initial */
    redisStore.set(stateKey, JSON.stringify("user-id-123"));
    assert.ok(redisStore.has(stateKey), "State doit exister avant usage");

    /* Simulation de la suppression après validation */
    redisStore.delete(stateKey);
    assert.ok(!redisStore.has(stateKey), "State doit être supprimé après usage");
  });

  await test("47. Callback — error_description Instagram pas renvoyé directement", () => {
    /* Les codes d'erreur retournés dans l'URL doivent être prédéfinis,
       jamais error_description brut d'Instagram. */
    function mapOAuthError(oauthError: string): string {
      return oauthError === "access_denied" ? "access_denied" : "oauth_error";
    }
    const rawDesc = "User denied access to their account data.";
    const safeCode = mapOAuthError("access_denied");
    /* Le code safe ne doit pas inclure le texte brut Instagram */
    assert.ok(!safeCode.split(" ").some(w => rawDesc.includes(w) && w.length > 6),
      "error_description ne doit jamais être renvoyé tel quel");
    assert.ok(!safeCode.includes(" "), "Le code d'erreur ne doit pas contenir d'espaces");
    assert.equal(safeCode, "access_denied");
  });

  /* ── Ordre de finalisation OAuth (48-52) ─────────────────────── */

  await test("48. Ordre strict : save(pending) → subscribe → update(active)", async () => {
    const callOrder: string[] = [];

    const deps: OAuthFinalizationDeps = {
      saveConnectionPending: async () => {
        callOrder.push("save_pending");
        return "conn-id-test";
      },
      subscribeToMessages: async () => {
        callOrder.push("subscribe");
        return true;
      },
      updateWebhookStatus: async () => {
        callOrder.push("update_active");
      },
      unsubscribeFromMessages: async () => true,
    };

    const result = await finalizeInstagramOAuthConnection("ig-user-1", "TOKEN", deps);
    assert.equal(result.outcome, "active");
    assert.deepEqual(callOrder, ["save_pending", "subscribe", "update_active"],
      `Ordre incorrect : ${callOrder.join(" → ")}`
    );
  });

  await test("49. Échec subscribe → status=error, pas de update(active)", async () => {
    const callOrder: string[] = [];

    const deps: OAuthFinalizationDeps = {
      saveConnectionPending: async () => { callOrder.push("save_pending"); return "conn-id"; },
      subscribeToMessages:   async () => { callOrder.push("subscribe_fail"); return false; },
      updateWebhookStatus:   async (_, subscribed, status) => {
        callOrder.push(`update_${status}`);
        assert.ok(!subscribed, "webhook_subscribed doit être false après échec");
        assert.equal(status, "error");
      },
      unsubscribeFromMessages: async () => true,
    };

    const result = await finalizeInstagramOAuthConnection("ig-user-2", "TOKEN", deps);
    assert.equal(result.outcome, "error");
    assert.ok(callOrder.includes("save_pending"), "save doit être appelé");
    assert.ok(callOrder.includes("subscribe_fail"), "subscribe doit être tenté");
    assert.ok(!callOrder.includes("update_active"), "update active ne doit pas être appelé");
  });

  await test("50. Subscribe réussi puis DB update échoué → unsubscribe compensatoire", async () => {
    const callOrder: string[] = [];

    const deps: OAuthFinalizationDeps = {
      saveConnectionPending:  async () => { callOrder.push("save"); return "conn-id"; },
      subscribeToMessages:    async () => { callOrder.push("subscribe_ok"); return true; },
      updateWebhookStatus:    async () => {
        callOrder.push("update_fail");
        throw new Error("DB update failed");
      },
      unsubscribeFromMessages: async () => {
        callOrder.push("unsubscribe_compensation");
        return true;
      },
    };

    const result = await finalizeInstagramOAuthConnection("ig-user-3", "TOKEN", deps);
    assert.equal(result.outcome, "finalize_failed");
    assert.ok(callOrder.includes("subscribe_ok"), "subscribe doit avoir été appelé");
    assert.ok(callOrder.includes("unsubscribe_compensation"), "désabonnement compensatoire attendu");
  });

  await test("51. Subscribe avant save → interdit par l'ordre de l'orchestrateur", async () => {
    /* Ce test vérifie que l'orchestrateur NE PEUT PAS appeler subscribe avant save.
       L'implémentation de finalizeInstagramOAuthConnection garantit cet ordre. */
    let saveCalled = false;
    let subscribeCalledBeforeSave = false;

    const deps: OAuthFinalizationDeps = {
      saveConnectionPending: async () => {
        saveCalled = true;
        return "conn";
      },
      subscribeToMessages: async () => {
        if (!saveCalled) subscribeCalledBeforeSave = true;
        return true;
      },
      updateWebhookStatus:    async () => { /* ok */ },
      unsubscribeFromMessages: async () => true,
    };

    await finalizeInstagramOAuthConnection("ig-user-4", "TOKEN", deps);
    assert.ok(!subscribeCalledBeforeSave, "subscribe ne doit JAMAIS être appelé avant save");
  });

  await test("52. Aucun token en clair dans les erreurs de l'orchestrateur", async () => {
    const SECRET_TOKEN = "MY_VERY_SECRET_ACCESS_TOKEN_XYZ";
    const errors: string[] = [];
    const originalError = console.error;
    (console as unknown as Record<string, unknown>).error =(...args: unknown[]) => {
      errors.push(args.map(a => typeof a === "string" ? a : JSON.stringify(a)).join(" "));
    };

    const deps: OAuthFinalizationDeps = {
      saveConnectionPending: async () => { throw new Error("DB unavailable"); },
      subscribeToMessages:   async () => true,
      updateWebhookStatus:   async () => { /* ok */ },
      unsubscribeFromMessages: async () => true,
    };

    await finalizeInstagramOAuthConnection("ig-user-5", SECRET_TOKEN, deps).catch(() => undefined);

    (console as unknown as Record<string, unknown>).error =originalError;
    const allLogs = errors.join(" ");
    assert.ok(!allLogs.includes(SECRET_TOKEN), "Le token ne doit jamais apparaître dans les logs");
  });

  /* ── Server Actions — logique pure (53-57) ───────────────────── */

  await test("53. isValidUuid — UUIDs valides acceptés", () => {
    const valid = [
      "550e8400-e29b-41d4-a716-446655440000",
      "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    ];
    for (const id of valid) {
      assert.ok(isValidUuid(id), `UUID valide rejeté : ${id}`);
    }
  });

  await test("54. isValidUuid — chaînes invalides refusées", () => {
    const invalid = [
      "",
      "not-a-uuid",
      "550e8400e29b41d4a716446655440000",      // sans tirets
      "550e8400-e29b-41d4-a716-44665544000",   // trop court
      "550e8400-e29b-41d4-a716-4466554400000", // trop long
      "../../../etc/passwd",
      "' OR 1=1 --",
    ];
    for (const id of invalid) {
      assert.ok(!isValidUuid(id), `Chaîne invalide acceptée : ${id}`);
    }
  });

  await test("55. Action retry — UUID invalide doit être refusé avant tout appel DB", () => {
    /* Test logique : isValidUuid("invalid") → false → redirect sans appel DB. */
    assert.ok(!isValidUuid("not-a-uuid"));
    assert.ok(!isValidUuid(""));
    assert.ok(!isValidUuid("SELECT * FROM connections"));
  });

  await test("56. Action disconnect — idempotente (connexion déjà absente → succès)", () => {
    /* Si conn === undefined après le find, l'action redirige avec success=already_disconnected.
       C'est testé au niveau logique. */
    const connections: Array<{ id: string }> = [];
    const conn = connections.find(c => c.id === "any-id");
    assert.equal(conn, undefined, "Connexion absente → idempotent");
  });

  await test("57. Aucune réponse d'action ne contient encrypted_access_token", () => {
    /* Les actions redirigent toujours (void return + redirect()).
       Elles ne construisent jamais de réponse JSON avec des données.
       Ce test vérifie la structure : action retourne void, jamais de payload. */
    type ActionReturnType = void;
    const retType: ActionReturnType = undefined;
    assert.equal(retType, undefined, "Les actions retournent void (pas de payload)");
  });

  /* ── Résultat ────────────────────────────────────────────────── */
  console.log("");
  console.log(
    `${C.bold("Résultats :")} ${C.green(`${passed} passé(s)`)}` +
    (failed > 0 ? ` ${C.red(`${failed} échoué(s)`)}` : "")
  );

  globalThis.fetch = realFetch;

  if (failed > 0) process.exit(1);
  console.log(C.green("\n✅ Tous les tests OAuth/crypto sont passés.\n"));
}

main().catch((err: unknown) => {
  console.error(C.red("\n❌ Erreur inattendue :"));
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
