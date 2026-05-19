# Test Open Icecat — ClikClak Shop

**Date :** 2026-05-18  
**Auteur :** Test automatisé — scripts/test-icecat.mjs  
**Compte :** Open Icecat gratuit (variables ICECAT_USERNAME / ICECAT_PASSWORD dans .env.local)

---

## Objectif

Évaluer si Open Icecat peut enrichir le shop ClikClak avec :
- Images produit haute résolution
- Fiches techniques (specs)
- Marque / modèle / EAN / MPN
- Descriptions structurées

Intégration **non effectuée** dans cette phase — test exploratoire uniquement.

---

## Endpoints testés

### Groupe 1 — API REST icecat.biz

| Endpoint | Résultat |
|---|---|
| `icecat.biz/api/products?Brand=Apple&Name=iPhone+15+Pro` | **404 HTML** |
| `icecat.biz/api/products/{EAN}` | **404 HTML** |
| `icecat.biz/api/v1/products` | **404 HTML** |
| `icecat.biz/api/v3/products` | **404 HTML** |
| `icecat.biz/api/categories` | 200 mais HTML (interface web Next.js, pas JSON) |

### Groupe 2 — API Back Office bo.icecat.biz

| Endpoint | Résultat |
|---|---|
| `bo.icecat.biz/api/products` | **404 JSON** `{"Code":404,"Error":"Not Found"}` |
| `bo.icecat.biz/api/brands` | **404 JSON** |
| `bo.icecat.biz/api/categories` | **404 JSON** |
| `bo.icecat.biz/api/auth/login` | **404 JSON** |
| Toutes les routes bo.icecat.biz | **404 JSON** (catch-all, aucune route produit exposée) |

### Groupe 3 — Ancienne URL index.cgi

| Endpoint | Résultat |
|---|---|
| `icecat.biz/index.cgi?shopname=X&lang=EN&prod_id=MGKQ3LL/A&vendorname=Apple` | **404 HTML** |
| Avec `output=productxml` | **404 HTML** |
| Avec `output=product_json` | **404 HTML** |
| Avec password en query param | **404 HTML** |

> **Note :** L'endpoint `index.cgi` a été **retiré** de icecat.biz. Il était l'ancien accès Open Icecat gratuit.

### Groupe 4 — icecat.us

| Endpoint | Résultat |
|---|---|
| `icecat.us/api/` (root) | 200 HTML (interface web) |
| `icecat.us/api/products?Brand=Apple&Name=iPhone+15+Pro` | **404 HTML** |
| `icecat.us/api/v2/products` | **404 HTML** |
| `icecat.us/api/catalog/1/Apple/iPhone15Pro/` | 200 HTML (page web produit, pas JSON) |
| `icecat.us/export/freexml.gz/EN/` | **404 HTML** |

### Groupe 5 — Autres domaines

| Endpoint | Résultat |
|---|---|
| `portal.icecat.biz/api/products` | Résolution DNS échouée |
| `api2.icecat.biz/products` | Résolution DNS échouée |

---

## Produits testés

| Produit recherché | Trouvé | Image | Specs | Langue | Exploitable | Notes |
|---|---|---|---|---|---|---|
| Apple — iPhone 15 Pro | Non | — | — | — | Non | 404 tous endpoints |
| Apple — iPhone 14 | Non | — | — | — | Non | 404 tous endpoints |
| Samsung — Galaxy S23 | Non | — | — | — | Non | 404 tous endpoints |
| Apple — MacBook Pro 14 | Non | — | — | — | Non | 404 tous endpoints |
| Apple — AirPods Pro | Non | — | — | — | Non | 404 tous endpoints |
| Apple — USB-C Power Adapter | Non | — | — | — | Non | 404 tous endpoints |

**Résumé :** 0 / 6 produits trouvés.

---

## Analyse des résultats

### Ce qui fonctionne

- `bo.icecat.biz` répond en **JSON** → il existe une API REST backend, mais aucune route produit n'est exposée publiquement ou via les credentials actuels.
- `icecat.us` retourne des pages web HTML (interface publique) pour certains chemins — les données produit existent mais ne sont pas accessibles via REST.

### Ce qui ne fonctionne pas

- **L'endpoint `index.cgi`** (ancien accès Open Icecat) a été retiré de `icecat.biz` et ne répond plus.
- **L'API REST `/api/products`** retourne 404 sur toutes les déclinaisons testées.
- L'authentification **HTTP Basic Auth** n'est reconnue par aucun endpoint qui retourne des données produit.

### Hypothèses sur l'origine du problème

1. **Compte pas encore activé / plan incorrect** : L'Open Icecat gratuit a des plans différents. Le compte créé peut nécessiter une activation manuelle par Icecat avant d'avoir accès à l'API.
2. **Migration d'API non documentée** : L'endpoint `index.cgi` historique a disparu. Le nouveau format d'accès n'est pas documenté publiquement de façon cohérente.
3. **Authentification différente** : L'API actuelle pourrait nécessiter un OAuth token ou une clé API différente des credentials web.
4. **Restriction par plan** : L'Open Icecat gratuit pourrait ne plus donner accès à l'API REST — accès réservé aux plans payants.

---

## Sécurité — incident mineur à noter

Lors du test du 18/05/2026, une sonde utilisant les credentials **en clair dans l'URL** a provoqué l'exposition des valeurs dans le message d'erreur affiché dans le terminal. Les credentials ont été visibles en mémoire du terminal de test **uniquement** — ils n'ont pas été persistés, loggués dans un fichier, ni transmis à un service tiers.

**Actions prises :**
- Le script `test-icecat-diag.mjs` a été corrigé pour supprimer cette approche.
- Les scripts actuels ne loggent jamais les valeurs des credentials.
- `.env.local` n'a pas été modifié.

---

## Résultat global

Open Icecat n'est **pas accessible** dans sa configuration actuelle via les credentials fournis et les endpoints documentés publiquement.

**Verdict : Insuffisant pour utilisation immédiate.**

---

## Recommandations

### Avant toute nouvelle tentative

1. **Vérifier l'état du compte Icecat** :
   - Se connecter sur [icecat.us](https://icecat.us) avec les credentials
   - Vérifier si le compte est bien activé pour l'accès API
   - Vérifier le plan souscrit (Open Icecat vs Icecat Full)
   - Chercher dans les paramètres du compte une section "API" ou "Access token"

2. **Chercher l'API Key** :
   - L'API actuelle Icecat utilise peut-être un **Bearer token** distinct du mot de passe web
   - Vérifier si une clé API est générée dans le dashboard Icecat

3. **Contacter le support Icecat** :
   - Demander la documentation API pour comptes Open Icecat gratuits
   - Vérifier si `index.cgi` a une URL de remplacement

### Si l'API devient accessible

#### Catégories où Icecat serait utile

| Catégorie shop | Intérêt Icecat | Raison |
|---|---|---|
| Smartphones neufs | **Élevé** | iPhone, Samsung ont des fiches Icecat complètes avec images |
| Mac / ordinateurs neufs | **Élevé** | Fiches techniques riches, photos HD |
| Accessoires emballés (chargeurs, câbles Apple) | **Moyen** | Fiche possible mais peu différenciante |
| AirPods / montres connectées | **Moyen** | Présents dans Icecat, mais images standardisées |

#### Catégories où Icecat est peu adapté

| Catégorie shop | Intérêt Icecat | Raison |
|---|---|---|
| Smartphones d'occasion uniques | **Faible** | Pas de photos "état réel", données génériques |
| Pièces détachées compatibles | **Faible** | Pièces tierces absentes du catalogue |
| Produits sans EAN/MPN clair | **Nul** | Icecat requiert une référence fabricant précise |

### Architecture propre si intégration validée

Si l'API fonctionne, l'intégration prévue serait :

```
lib/icecat/
  icecatClient.ts         ← appels API (server-side uniquement)
  normalizeIcecatProduct.ts ← mapping vers ShopProduct

app/api/shop/enrich/route.ts  ← route API Next.js (POST, protégée)
  → reçoit un slug produit
  → appelle icecatClient
  → retourne données normalisées
  → jamais exposé côté client
```

**Règles d'intégration à respecter :**
- Ne jamais appeler `icecatClient` dans un composant `'use client'`
- Mettre les données enrichies en cache (ISR ou `revalidate`)
- Ne pas remplacer automatiquement les images sans validation manuelle
- Ne pas importer massivement — enrichir produit par produit

---

## Prochaine étape proposée

1. Vérifier le statut du compte Icecat et chercher une clé API dans le dashboard
2. Tester avec le bon token si trouvé (relancer `npm run icecat:test`)
3. Si l'API répond, commencer par enrichir **5 smartphones neufs** manuellement
4. Valider la qualité des données avant tout import automatisé
5. Ne jamais intégrer sans validation explicite

**Ne pas intégrer Icecat au shop avant validation.**

---

## Fichiers créés lors de ce test

| Fichier | Rôle |
|---|---|
| `lib/icecat/icecatClient.ts` | Client server-side (prêt pour quand l'API sera accessible) |
| `lib/icecat/normalizeIcecatProduct.ts` | Normalisation données Icecat → ShopProduct |
| `scripts/test-icecat.mjs` | Script principal (`npm run icecat:test`) |
| `scripts/test-icecat-diag.mjs` | Script diagnostic endpoints |
| `scripts/test-icecat-bo.mjs` | Script exploration bo.icecat.biz |
| `scripts/test-icecat-final.mjs` | Script sondes finales |
| `docs/icecat-test-report.md` | Ce rapport |
