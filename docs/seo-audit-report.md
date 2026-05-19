# Audit SEO ClikClak

**Date :** 2026-05-18  
**Périmètre :** Audit technique pré-production — routes, redirects, sitemap, canonical, robots, titles, H1, liens internes  
**Stack :** Next.js 15.5.15, App Router

---

## Routes auditées

### Pages finales avec contenu réel

| URL | Status | Sitemap | Notes |
|---|---|---|---|
| `/` | ✅ Complète | ✅ 1.0 | Homepage |
| `/reparation/` | ✅ Complète | ✅ 0.8 | Hub réparation |
| `/reparation-smartphone-express/` | ✅ Complète | ✅ 0.9 | Sélection marque smartphone |
| `/reparation-tablette-express/` | ✅ Complète | ✅ 0.7 | Ajoutée lors de l'audit |
| `/reparation-ordinateur-express/` | ✅ Complète | ✅ 0.7 | Ajoutée lors de l'audit |
| `/reparation-degat-eau-lausanne/` | ✅ Complète | ✅ 0.7 | |
| `/services/reparation-iphone/` | ✅ Complète (44 modèles) | ✅ 0.9 | |
| `/services/reparation-iphone/[modelSlug]` | ✅ 44 pages SSG | — | Modèles crawlables |
| `/services/reparation-samsung-lausanne/` | ✅ Complète | ✅ 0.9 | |
| `/services/reparation-samsung-lausanne/[modelSlug]` | ✅ 81 pages SSG | — | |
| `/services/reparation-ipad/` | ✅ Complète (9 familles) | ✅ 0.8 | Ajoutée lors de l'audit |
| `/services/reparation-macbook/` | ✅ Complète | ✅ 0.8 | |
| `/services/reparation-huawei-lausanne/` | ✅ Complète | ✅ 0.7 | |
| `/services/reparation-oppo/` | ✅ Complète | ✅ 0.7 | Était absent — ajouté |
| `/services/reparation-sony-xperia/` | ✅ Complète | ✅ 0.6 | Était absent — ajouté |
| `/services/recuperation-donnees/` | ✅ Complète | ✅ 0.7 | |
| `/services/depannage-reparation-domicile/` | ✅ Complète | ✅ 0.7 | H1 = "Dépannage 7/7 à Lausanne" |
| `/service-de-coursier/` | ✅ Complète | ✅ 0.6 | |
| `/services/transfert-donnees/` | ✅ Complète | ✅ 0.5 | |
| `/services/rachat-de-votre-smartphone/` | ✅ Complète | ✅ 0.6 | |
| `/shop-reparation-smartphone-lausanne/` | ✅ Complète | ✅ 0.7 | |
| `/shop-reparation-smartphone-lausanne/[productSlug]` | ✅ 23 pages SSG | — | Produits "sur demande" |
| `/contact-clik-clak-lausanne/` | ✅ Complète | ✅ 0.6 | |
| `/clik-clak-repair-lausanne/` | ✅ Complète | ✅ 0.5 | |
| `/cgv/` | ✅ Complète | ✗ Exclue | `robots: noindex` correct |
| `/politique-confidentialite/` | ✅ Complète | ✗ Exclue | `robots: noindex` correct |

### Pages placeholders — traitées lors de l'audit

| URL | Statut avant | Correction appliquée |
|---|---|---|
| `/services/reparation-google-pixel/` | Stub indexable | `robots: { index: false }` ajouté |
| `/services/reparation-xiaomi/` | Stub indexable | `robots: { index: false }` ajouté |
| `/services/reparation-tablette/` | Stub indexable | `robots: { index: false }` ajouté |
| `/services/nettoyage/` | Stub indexable | `robots: { index: false }` ajouté |

> Ces pages restent accessibles pour éviter les 404 dans les anciens liens, mais ne sont plus indexées.

---

## Redirections vérifiées

### Redirections actives dans `next.config.ts`

| Source | Destination | Code | Status |
|---|---|---|---|
| `/r-cup-ration-de-donn-es` | `/services/recuperation-donnees` | 308 | ✅ |
| `/r-cup-ration-de-donn-es/` | `/services/recuperation-donnees` | 308 | ✅ |
| `/services/depannage` | `/services/depannage-reparation-domicile` | 308 | ✅ |
| `/services/depannage/` | `/services/depannage-reparation-domicile` | 308 | ✅ |
| `/contact` | `/contact-clik-clak-lausanne` | 308 | ✅ Ajouté lors de l'audit |
| `/contact/` | `/contact-clik-clak-lausanne` | 308 | ✅ Ajouté lors de l'audit |
| `/shop` | `/shop-reparation-smartphone-lausanne` | 308 | ✅ Ajouté lors de l'audit |
| `/shop/` | `/shop-reparation-smartphone-lausanne` | 308 | ✅ Ajouté lors de l'audit |
| `/services` | `/reparation` | 308 | ✅ Ajouté lors de l'audit |
| `/services/` | `/reparation` | 308 | ✅ Ajouté lors de l'audit |

> **Note :** Next.js utilise 308 (permanent redirect) pour les redirections avec `permanent: true`. Équivalent fonctionnel du 301 pour les crawlers.

### Vérifications absence de doublons

- `/services/depannage` ne génère plus de page statique ✅
- `/r-cup-ration-de-donn-es` ne génère plus de page statique ✅
- La source `/services/` → `/reparation` ne crée pas de boucle (les routes `/services/X` restent accessibles) ✅

---

## Sitemap

### URLs ajoutées lors de l'audit

| URL ajoutée | Raison |
|---|---|
| `/reparation-tablette-express/` | Page réelle manquante |
| `/reparation-ordinateur-express/` | Page réelle manquante |
| `/services/reparation-ipad/` | Page réelle manquante |
| `/services/reparation-oppo/` | Page réelle manquante |
| `/services/reparation-sony-xperia/` | Page réelle manquante |

### URLs supprimées du sitemap

| URL supprimée | Raison |
|---|---|
| `/services/reparation-xiaomi/` | Stub noindex |
| `/services/reparation-google-pixel/` | Stub noindex |
| `/services/reparation-tablette/` | Stub noindex |
| `/services/nettoyage/` | Stub noindex |

### Exclusions maintenues

| URL | Raison d'exclusion |
|---|---|
| `/cgv/` | `robots: noindex` |
| `/politique-confidentialite/` | `robots: noindex` |
| `/r-cup-ration-de-donn-es/` | Redirigée vers `/services/recuperation-donnees/` |
| `/services/depannage/` | Redirigée vers `/services/depannage-reparation-domicile/` |
| Pages modèles `/services/reparation-iphone/[slug]` | Crawlables via liens internes, pas besoin dans sitemap statique |
| Pages produits shop `/shop-reparation.../[slug]` | Contenu minimal (placeholder), ajout à prévoir après enrichissement |

---

## Robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://clikclak.ch/sitemap.xml
```

✅ Correct. Pages publiques autorisées. `/api/` correctement bloqué pour éviter l'indexation des endpoints.

---

## Canonicals

| Page | Canonical | Correct |
|---|---|---|
| `/` | `https://clikclak.ch/` | ✅ |
| `/services/reparation-iphone/` | `…/services/reparation-iphone/` | ✅ |
| `/services/reparation-iphone/[slug]` | `…/services/reparation-iphone/[slug]/` | ✅ |
| `/services/reparation-samsung-lausanne/` | `…/services/reparation-samsung-lausanne/` | ✅ |
| `/services/depannage-reparation-domicile/` | `…/services/depannage-reparation-domicile/` | ✅ |
| `/shop-reparation-smartphone-lausanne/` | `…/shop-reparation-smartphone-lausanne/` | ✅ |
| `/cgv/` | Canonical présent + noindex | ✅ |
| `/politique-confidentialite/` | Canonical présent + noindex | ✅ |
| Stubs (google-pixel, xiaomi…) | Canonical vers eux-mêmes + noindex | ✅ |

---

## Titles et meta descriptions

### Titres uniques vérifiés

| Page | Title |
|---|---|
| Homepage | Réparation smartphone Lausanne, réparation iPhone, Samsung |
| `/reparation/` | Réparation smartphone Lausanne — Clik Clak Repair |
| `/reparation-smartphone-express/` | Réparation smartphone express Lausanne — Clik Clak Repair |
| `/services/reparation-iphone/` | (à vérifier — page complexe) |
| `/services/reparation-samsung-lausanne/` | (à vérifier — page complexe) |
| `/services/depannage-reparation-domicile/` | Dépannage 7/7 Lausanne \| Smartphone, tablette & ordinateur \| ClikClak |
| `/shop-reparation-smartphone-lausanne/` | Shop ClikClak Lausanne \| Smartphones, accessoires et pièces détachées |
| `/contact-clik-clak-lausanne/` | (page contact) |
| `/cgv/` | Conditions générales de vente — Clik Clak Repair |
| `/politique-confidentialite/` | Politique de confidentialité \| ClikClak |

**Problème identifié non corrigé :** La homepage et `/reparation/` ont des titres très proches sémantiquement. À surveiller mais pas dupliqués à l'identique.

---

## H1

| Page | H1 | Correct |
|---|---|---|
| `/` | Généré dynamiquement via HomeHero | À vérifier |
| `/services/depannage-reparation-domicile/` | "Dépannage 7/7 à Lausanne" | ✅ |
| `/services/reparation-google-pixel/` | "Réparation Google Pixel" | ⚠️ Stub — noindexé |
| `/services/reparation-xiaomi/` | "Réparation Xiaomi" | ⚠️ Stub — noindexé |
| `/services/nettoyage/` | "Nettoyage" | ⚠️ Stub — noindexé (trop court) |
| `/services/reparation-tablette/` | "Réparation tablette" | ⚠️ Stub — noindexé |
| `/shop-reparation-smartphone-lausanne/` | "Shop ClikClak" | ✅ |
| `/shop-reparation.../[slug]` | `{product.name}` dynamique | ✅ Unique par page |

---

## Liens internes corrigés

| Fichier | Ancien lien | Nouveau lien |
|---|---|---|
| `components/home/ServiceSelector.tsx` | `/services/depannage` | `/services/depannage-reparation-domicile` |
| `components/layout/DesktopNav.tsx` | `/services/depannage` | `/services/depannage-reparation-domicile` |
| `components/repair/RepairDeviceSelector.tsx` | `/services/depannage` | `/services/depannage-reparation-domicile` |

**Liens `/r-cup-ration-de-donn-es` :** Référencé uniquement dans `lib/urls.ts` (constante documentaire) et `data/legacy-urls.ts` (table de redirections). Aucun lien interne actif vers cette URL. ✅

---

## Pages placeholders restantes (noindexées)

| Page | H1 actuel | Recommandation |
|---|---|---|
| `/services/reparation-google-pixel/` | "Réparation Google Pixel" | Compléter quand données tarifs disponibles, ou rediriger vers `/reparation-smartphone-express/` |
| `/services/reparation-xiaomi/` | "Réparation Xiaomi" | Idem |
| `/services/reparation-tablette/` | "Réparation tablette" | Peut pointer vers `/reparation-tablette-express/` via redirect |
| `/services/nettoyage/` | "Nettoyage" | Compléter ou supprimer si service non actif |

---

## Recommandations avant production

### Priorité haute

1. **Compléter ou rediriger les stubs** :
   - `/services/reparation-tablette/` → rediriger vers `/reparation-tablette-express/` (doublon inutile)
   - `/services/reparation-google-pixel/` et `/services/reparation-xiaomi/` → compléter si données tarifs disponibles, sinon rediriger vers `/reparation-smartphone-express/`
   - `/services/nettoyage/` → compléter avec contenu ou supprimer

2. **Tester les redirections en production** : Vérifier `/contact`, `/shop`, `/services/` après déploiement avec un outil comme Screaming Frog ou Redirect Checker.

3. **Vérifier les pages modèles dynamiques** : Les 44+ pages `/services/reparation-iphone/[slug]` ne sont pas dans le sitemap. Google devrait les découvrir via les liens internes, mais les ajouter dynamiquement via `generateSitemaps()` serait plus robuste pour de grands catalogues.

### Priorité moyenne

4. **Enrichir les pages shop** : Quand de vraies photos et prix seront disponibles, ajouter les pages produits shop au sitemap.

5. **Vérifier le H1 de la homepage** : `HomeHero` est un composant client — vérifier que le H1 est bien rendu côté serveur (il l'est si c'est du JSX statique dans le composant).

6. **Schema.org** : Ajouter des balises JSON-LD pour les pages réparation (LocalBusiness, Service) afin d'enrichir les résultats Google.

### Priorité basse

7. **Analytics / Search Console** : Soumettre le sitemap à Google Search Console après déploiement.

8. **Core Web Vitals** : Mesurer LCP, CLS, FID après déploiement sur mobile Safari et Chrome.

---

## Résumé des corrections appliquées

| Correction | Fichiers modifiés |
|---|---|
| `robots: { index: false }` sur 4 stubs | `app/services/reparation-google-pixel/page.tsx` |
| | `app/services/reparation-xiaomi/page.tsx` |
| | `app/services/reparation-tablette/page.tsx` |
| | `app/services/nettoyage/page.tsx` |
| Sitemap — suppression 4 stubs, ajout 5 pages réelles | `app/sitemap.ts` |
| Redirects `/contact`, `/shop`, `/services` implémentés | `next.config.ts` |
| Liens internes `/services/depannage` → `/services/depannage-reparation-domicile` | (corrections précédentes) |
