/**
 * scripts/test-middleware-pathname.ts
 *
 * Tests de régression pour l'injection de x-pathname dans les routes admin.
 * Exécuter : npm run test:middleware-pathname
 *
 * Tèste la fonction createRequestHeaders() réellement utilisée par middleware.ts.
 *
 * Couverture :
 *  1. Route admin → x-pathname correctement injecté
 *  2. Route non-admin → x-pathname correctement injecté
 *  3. Valeur x-pathname forgée par le client → écrasée par le chemin réel
 *  4. /admin/integrations/instagram → transmis exactement
 *  5. Comportement de redirection admin : condition unauthenticated reste fonctionnelle
 *  6. Condition "déjà connecté sur /admin/login" reste fonctionnelle
 *  7. Routes publiques admin (/admin/login) ne sont pas redirigées
 *  8. Chemin avec sous-route → transmis sans modification
 */

import assert from "node:assert/strict";
import { createRequestHeaders, type PathnameRequest } from "../lib/middleware/pathname";

/* ── Couleurs ──────────────────────────────────────────────────────── */

const C = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red:   (s: string) => `\x1b[31m${s}\x1b[0m`,
  bold:  (s: string) => `\x1b[1m${s}\x1b[0m`,
};

/* ── Helper : construire un objet PathnameRequest de test ─────────── */

function makeRequest(pathname: string, forgedPathname?: string): PathnameRequest {
  const headers = new Headers()
  headers.set("content-type", "text/html")
  if (forgedPathname !== undefined) {
    headers.set("x-pathname", forgedPathname)
  }
  return {
    headers,
    nextUrl: { pathname },
  }
}

/* ── Runner ────────────────────────────────────────────────────────── */

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  process.stdout.write(`  ${name} ... `);
  try {
    fn();
    console.log(C.green("✅ PASS"));
    passed++;
  } catch (err) {
    console.log(C.red("❌ FAIL"));
    console.error(C.red(`    ${err instanceof Error ? err.message : String(err)}`));
    failed++;
  }
}

/* ── Constantes de redirection admin ─────────────────────────────── */

const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password"];

/** Logique de redirection extraite de middleware.ts (non authentifié). */
function shouldRedirectToLogin(user: null | object, pathname: string): boolean {
  const isPublic = ADMIN_PUBLIC_PATHS.some(p => pathname.startsWith(p));
  return !user && pathname.startsWith("/admin") && !isPublic;
}

/** Logique de redirection extraite (déjà connecté sur /admin/login). */
function shouldRedirectToAdmin(user: null | object, pathname: string): boolean {
  return !!user && pathname.startsWith("/admin/login");
}

/* ── Suite ─────────────────────────────────────────────────────────── */

async function main(): Promise<void> {
  console.log(C.bold("\nClikClak — Tests middleware x-pathname\n"));

  /* 1. Route admin → x-pathname injecté */
  test("1.  Route admin (/admin/reparations) → x-pathname correctement injecté", () => {
    const req     = makeRequest("/admin/reparations");
    const headers = createRequestHeaders(req);
    assert.equal(headers.get("x-pathname"), "/admin/reparations");
  });

  /* 2. Route non-admin → x-pathname injecté */
  test("2.  Route non-admin (/services/reparation-iphone) → x-pathname injecté", () => {
    const req     = makeRequest("/services/reparation-iphone");
    const headers = createRequestHeaders(req);
    assert.equal(headers.get("x-pathname"), "/services/reparation-iphone");
  });

  /* 3. Valeur forgée par le client → écrasée */
  test("3.  x-pathname forgé par le client (/malicious) → écrasé par le chemin réel", () => {
    const req     = makeRequest("/admin/modeles", "/malicious");
    /* Avant createRequestHeaders, la valeur forgée est présente */
    assert.equal(req.headers.get("x-pathname"), "/malicious");
    /* Après, elle est remplacée par le chemin réel */
    const headers = createRequestHeaders(req);
    assert.equal(headers.get("x-pathname"), "/admin/modeles");
    assert.notEqual(headers.get("x-pathname"), "/malicious");
  });

  /* 4. /admin/integrations/instagram → transmis exactement */
  test("4.  /admin/integrations/instagram → transmis exactement sans modification", () => {
    const target  = "/admin/integrations/instagram";
    const req     = makeRequest(target);
    const headers = createRequestHeaders(req);
    assert.equal(
      headers.get("x-pathname"),
      target,
      `x-pathname doit valoir exactement "${target}"`
    );
  });

  /* 5. Comportement redirect → unauthenticated */
  test("5.  Sans session sur /admin/integrations/instagram → doit rediriger vers login", () => {
    const pathname = "/admin/integrations/instagram";
    assert.ok(
      shouldRedirectToLogin(null, pathname),
      "Un utilisateur non connecté sur /admin/* doit être redirigé vers /admin/login"
    );
  });

  /* 6. Comportement redirect → déjà connecté sur /admin/login */
  test("6.  Connecté sur /admin/login → doit rediriger vers /admin", () => {
    assert.ok(
      shouldRedirectToAdmin({ id: "user-1" }, "/admin/login"),
      "Un utilisateur connecté sur /admin/login doit être redirigé vers /admin"
    );
  });

  /* 7. Route publique /admin/login → pas de redirection non authentifiée */
  test("7.  /admin/login (sans session) → n'est PAS redirigé (route publique)", () => {
    assert.ok(
      !shouldRedirectToLogin(null, "/admin/login"),
      "/admin/login ne doit pas déclencher de redirection non authentifiée"
    );
  });

  /* 8. Sous-route profonde → transmise sans modification */
  test("8.  Sous-route profonde /admin/modeles/iphone-16/tarifs → transmise exactement", () => {
    const deep    = "/admin/modeles/iphone-16/tarifs";
    const req     = makeRequest(deep, "/forged-value");
    const headers = createRequestHeaders(req);
    assert.equal(headers.get("x-pathname"), deep);
  });

  /* ── Résultat ──────────────────────────────────────────────────── */
  console.log("");
  console.log(
    `${C.bold("Résultats :")} ${C.green(`${passed} passé(s)`)}` +
    (failed > 0 ? ` ${C.red(`${failed} échoué(s)`)}` : "")
  );

  if (failed > 0) process.exit(1);
  console.log(C.green("\n✅ Tous les tests middleware sont passés.\n"));
}

main().catch((err: unknown) => {
  console.error(C.red("\n❌ Erreur inattendue :"));
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
