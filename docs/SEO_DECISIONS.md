# SEO_DECISIONS.md — ClikClak.ch

Phase : 2 — URL Mapping  
Date : 2026-05-06  
Mise à jour : 2026-05-06 — décisions 4.7 et 4.8 ajoutées, §5 validé définitivement  
Sources : Screaming Frog, Google Search Console 16 mois, Yoast redirections, REDIRECTS_LEGACY_CLEAN.csv  
Statut : **définitivement validé**

---

## 1. URLs à conserver en 200

Ces URLs existent actuellement en 200 et doivent être recréées à l'identique dans Next.js.  
Le slug ne change pas. Le canonical pointe sur lui-même avec trailing slash.

| URL | Priorité | Clics GSC | Impressions GSC | Liens internes | Remarques SEO |
|-----|----------|-----------|-----------------|----------------|---------------|
| `/` | critique | 896 | 2374 | 110 | Page principale. Title et H1 OK. |
| `/services/reparation-iphone/` | critique | 59 | 455 | 119 | Title avec emojis — à améliorer. |
| `/services/reparation-samsung-lausanne/` | critique | 2 | 57 | 172 | Meta 161 chars — à raccourcir. |
| `/services/reparation-macbook/` | haute | 87 | 295 | 5 | H1 incorrect (`Réparation d'ordinateur`). Sous-maillée. |
| `/reparation-smartphone-express/` | haute | 3 | 63 | 48 | Title contient adresse physique. |
| `/reparation/` | haute | 1 | 85 | 45 | Title 93 chars (limite 60). H1 trop court. |
| `/contact-clik-clak-lausanne/` | haute | 1 | 142 | 68 | H1 `Contact` trop générique. |
| `/reparation-degat-eau-lausanne/` | haute | 0 | 2 | 1 | Sous-maillée. Destination finale de 6 variantes Yoast. |
| `/services/recuperation-donnees/` | haute | 0 | 8 | 3 | **URL canonique définitivement validée** (§4.7). Title tronqué à corriger. |
| `/services/reparation-huawei-lausanne/` | moyenne | 0 | 18 | 28 | Title contient adresse physique. |
| `/services/reparation-xiaomi/` | moyenne | 1 | 20 | 57 | Meta générique. Title 69 chars. |
| `/services/reparation-google-pixel/` | moyenne | 1 | 8 | 86 | Title 68 chars. |
| `/services/reparation-oppo/` | moyenne | 0 | 9 | 74 | Title 67 chars. |
| `/services/reparation-tablette/` | moyenne | 1 | 48 | 55 | Double H1 à corriger. Meta générique. |
| `/services/depannage-reparation-domicile/` | moyenne | 0 | 21 | 6 | Title 74 chars. Sous-maillée. |
| `/service-de-coursier/` | basse | 0 | 19 | 2 | Sous-maillée. |
| `/services/transfert-donnees/` | basse | 0 | 0 | 3 | Title tronqué (tiret final). |
| `/services/rachat-de-votre-smartphone/` | basse | 0 | 0 | 3 | Title tronqué. Meta générique. |
| `/services/nettoyage/` | basse | 0 | 33 | 3 | Faute dans la meta (`sont` → `son`). |
| `/cgv/` | basse | 0 | 0 | 23 | noindex correct. Conserver. |
| `/shop-reparation-smartphone-lausanne/` | haute | — | — | — | **Page 200 validée définitivement** (§4.1). |
| `/clik-clak-repair-lausanne/` | moyenne | — | — | — | Vérifier existence — créer si absent. |

---

## 2. URLs à transformer en 301

Ces redirections doivent être recréées dans `next.config.js` (redirects).  
Chaque redirection est directe (1 saut). Les chaînes ont été aplatissues.

### 2.1 Redirections simples actives (Screaming Frog)

| Source | Destination | Liens internes | Origine |
|--------|-------------|----------------|---------|
| `/services/reparation-samsung/` | `/services/reparation-samsung-lausanne/` | 46 | Yoast actif |
| `/services/reparation-huawei/` | `/services/reparation-huawei-lausanne/` | 46 | Yoast actif |
| `/services/reparation-ordinateur/` | `/services/reparation-macbook/` | 72 | Yoast actif |
| `/services/reparation-de-tablette/` | `/services/reparation-tablette/` | 22 | Yoast actif |
| `/services/reparation-ambulante/` | `/services/depannage-reparation-domicile/` | 47 | Yoast actif |
| `/reparation-smartphone/` | `/reparation-smartphone-express/` | 25 | Yoast actif |
| `/degat-d-eau/` | `/reparation-degat-eau-lausanne/` | 1 | Yoast actif (fin de chaîne) |
| `/contact-reparation-smartphone-lausanne-clik-clak-repair/` | `/contact-clik-clak-lausanne/` | 0 | Yoast actif |
| `/author/clikclakrepair/` | `/` | 9 | WordPress auto |
| `/r-cup-ration-de-donn-es/` | `/services/recuperation-donnees/` | 67 | **Validé 2026-05-06** — consolidation doublon |

### 2.2 Chaînes à raccourcir en 1 saut (correction obligatoire)

| Source | Destination directe | Problème actuel | Liens internes |
|--------|---------------------|-----------------|----------------|
| `/contact/` | `/contact-clik-clak-lausanne/` | 2 sauts | 170 |
| `/contact` (sans slash) | `/contact-clik-clak-lausanne/` | 2 sauts | 1 |
| `/services/` | `/reparation/` | chaîne → 404 | 14 |
| `/nos-services/` | `/reparation/` | chaîne → 404 | 0 |

### 2.3 Pages 404 nécessitant une redirection (Screaming Frog)

| Source (404) | Destination | Liens internes |
|--------------|-------------|----------------|
| `/product/iphone-11-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-11-pro-max-ecran-reparation/` | `/services/reparation-iphone/` | 0 |
| `/product/iphone-11-pro-max-ecran-reparation-copie/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-xs-max-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-xr-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-xs-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-se-2020-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-8-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-8-plus-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-x-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-12-ecranvitre/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-12-mini-ecran-reparation/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-12-12-pro-reparation/` | `/services/reparation-iphone/` | 2 |
| `/product/iphone-11-ecran-reparation-2/` | `/services/reparation-iphone/` | 1 |
| `/product/iphone-7-ecran-reparation/` | `/services/reparation-iphone/` | 2 |
| `/nos-services-reparation/` | `/reparation/` | 0 (endpoint de chaîne) |

### 2.4 URLs avec trafic GSC actif (à traiter en priorité)

Ces URLs n'ont pas été trouvées en 200 dans Screaming Frog mais ont des impressions ou clics GSC réels. Elles doivent être redirigées avant la mise en ligne pour ne pas perdre le positionnement acquis.

| Source | Destination | Clics GSC | Impressions GSC |
|--------|-------------|-----------|-----------------|
| `/categorie-produit/reparation-smartphone/` | `/reparation-smartphone-express/` | **16** | 34 |
| `/produit/samsung-galaxy-s7-ecran-reparation/` | `/services/reparation-samsung-lausanne/` | **4** | 30 |
| `/produit/iphone-11-pro-max-ecran-reparation/` | `/services/reparation-iphone/` | 0 | 7 |
| `/produit/iphone-6s-ecran-reparation/` | `/services/reparation-iphone/` | 0 | 7 |
| `/produit/samsung-galaxy-note-10-ecran-reparation/` | `/services/reparation-samsung-lausanne/` | 0 | 4 |
| `/produit/huawei-mate-20-pro-ecran-reparation/` | `/services/reparation-huawei-lausanne/` | 0 | 4 |
| `/categorie-produit/reparation-smartphone/oppo-reparation-ecran/` | `/services/reparation-oppo/` | 0 | 13 |
| `/categorie-produit/reparation-smartphone/reparation-xiaomi/` | `/services/reparation-xiaomi/` | 0 | 10 |

### 2.5 Redirections Yoast à migrer (sélection critique)

Ces redirections Yoast doivent être portées dans `next.config.js`. La liste complète est dans `REDIRECTS_LEGACY_CLEAN.csv`.

| Source | Destination |
|--------|-------------|
| `/shop` | `/shop-reparation-smartphone-lausanne/` |
| `/contact/` | `/contact-clik-clak-lausanne/` |
| `/qui-sommes-nous` | `/clik-clak-repair-lausanne/` |
| `/reparations-apple` | `/services/reparation-iphone/` |
| `/reparation-apple` | `/services/reparation-iphone/` |
| `/services/reparation-iphone-prix` | `/services/reparation-iphone/` |
| `/services/reparation-google-pixel-lausanne` | `/services/reparation-google-pixel/` |
| `/degat-eau` | `/reparation-degat-eau-lausanne/` |
| `/reparation-degat-deau` | `/reparation-degat-eau-lausanne/` |
| `/reparation-degat-deau-a-lausanne` | `/reparation-degat-eau-lausanne/` |
| `/services/water-damage` | `/reparation-degat-eau-lausanne/` |
| `/services/cracked-screen` | `/reparation-smartphone-express/` |
| `/services/reparation-smartphone-a-domicile` | `/services/depannage-reparation-domicile/` |
| `/reparation-smartphone-par-coursier` | `/service-de-coursier/` |
| `/services/reparations-rapides` | `/reparation-smartphone-express/` |
| `/services_group/services` | `/reparation/` |
| `/services` | `/reparation/` |
| `tous les /product-category/iphone-*` | `/services/reparation-iphone/` |
| `tous les /product-category/samsung-*` (réparation) | `/services/reparation-samsung-lausanne/` |
| `tous les /product-category/huawei-*` (réparation) | `/services/reparation-huawei-lausanne/` |
| `/product-category/accessories` | `/shop-reparation-smartphone-lausanne/` |
| `/product-category/iphone-accessoires` | `/shop-reparation-smartphone-lausanne/` |
| `/product-category/samsung-accessoires` | `/shop-reparation-smartphone-lausanne/` |
| `/product-category/laptops` | `/services/reparation-macbook/` |

---

## 3. URLs à revoir manuellement

Ces URLs nécessitent une décision humaine avant d'être intégrées au nouveau site.

### 3.1 Doublons récupération de données — ~~en attente~~ RÉSOLU

**Décision validée le 2026-05-06 — voir §4.7 et §5.**

- `/services/recuperation-donnees/` → URL canonique en 200, à conserver et améliorer
- `/r-cup-ration-de-donn-es/` → 301 vers `/services/recuperation-donnees/`
- Les 67 liens internes vers `/r-cup-ration-de-donn-es/` devront pointer vers `/services/recuperation-donnees/` dans le nouveau site

### 3.2 Page à propos

- `/clik-clak-repair-lausanne/` non trouvée dans Screaming Frog
- Destination de `/qui-sommes-nous` (Yoast)
- Vérifier son existence et son état (200, 301, 404)

### 3.3 Services supplémentaires

- `/services_group/services-supp-offres/` — URL WordPress de type archive, noindex, 14 liens internes
- Ne pas reproduire ce slug dans Next.js
- Décider si le contenu doit être intégré ailleurs ou supprimé

### 3.4 Redirections vers l'accueil à valider

Ces URLs Yoast redirigent actuellement vers `/`. Aucune d'elles ne génère de trafic GSC visible. Confirmer que la redirection vers l'accueil est acceptable ou si une destination plus précise est préférable.

| Source | Destination actuelle | Statut |
|--------|---------------------|--------|
| `/design-communication` | `/` | hors périmètre |
| `/assurance` | `/` | hors périmètre |
| `/locations-utilitaires` | `/` | hors périmètre |
| `/services_group/design-communication` | `/` | hors périmètre |

### 3.5 Titres et metas à corriger avant mise en ligne

| URL | Problème | Priorité |
|-----|----------|----------|
| `/services/reparation-macbook/` | H1 `Réparation d'ordinateur` — ne correspond pas au slug MacBook | haute |
| `/services/reparation-tablette/` | Double H1 (widget WooCommerce `Select Your Smartphone`) | haute |
| `/reparation/` | Title 93 chars — limite 60 | moyenne |
| `/services/recuperation-donnees/` | Title tronqué, meta générique 204 chars | haute |
| `/services/transfert-donnees/` | Title tronqué | moyenne |
| `/services/rachat-de-votre-smartphone/` | Title tronqué, meta générique | moyenne |
| `/services/reparation-xiaomi/` | Meta générique copier-colle | moyenne |
| `/services/nettoyage/` | Faute `sont` dans la meta | basse |

---

## 4. Décisions validées

Ces décisions sont définitives. Elles ne nécessitent pas de confirmation supplémentaire.

### 4.1 `/shop-reparation-smartphone-lausanne/` doit être une page 200

**Règle :** Cette URL ne doit jamais être redirigée vers l'accueil.  
**Décision :** Créer une vraie page shop en 200 à cette URL dans Next.js.  
**Raison :** Protégée explicitement dans CLAUDE.md. La redirection Yoast actuelle (`→ /`) est une erreur à corriger dès la phase shop.  
**Impact :** `/shop` doit rediriger vers `/shop-reparation-smartphone-lausanne/` (1 saut).

### 4.2 `/services/` doit rediriger vers `/reparation/`

**Décision :** `301 /services/ → /reparation/`  
**Raison :** La chaîne actuelle `/services/ → /nos-services/ → /nos-services-reparation/` se termine sur une 404. 14 liens internes sont concernés.  
**Impact :** Corriger également `/nos-services/` → `/reparation/` et créer un 301 `/nos-services-reparation/` → `/reparation/`.

### 4.3 `/services/reparation-macbook/` doit être conservée et renforcée

**Décision :** Conserver l'URL en 200, corriger le H1, augmenter le maillage interne.  
**Raison :** Meilleure page du site après la homepage avec 87 clics et 295 impressions GSC sur 16 mois. Seulement 5 liens internes actuellement — fortement sous-exploitée.  
**Actions requises :**  
- Corriger le H1 de `Réparation d'ordinateur` vers `Réparation MacBook`  
- Augmenter le maillage interne depuis la homepage, `/reparation/` et les pages marques

### 4.4 Tous les `/product/iphone-*` en 404 doivent rediriger vers `/services/reparation-iphone/`

**Décision :** `301 /product/iphone-* → /services/reparation-iphone/`  
**Raison :** 13 URLs de produits WooCommerce iPhone sont en 404 dans Screaming Frog. Chacune a des liens internes. Aucune ne peut rester sans redirection.  
**Règle :** Ces URLs ne doivent jamais pointer vers le shop — elles correspondent à des réparations, pas à des produits à vendre.

### 4.5 `/www.smartphonereparation.ch` ne doit jamais être repris comme destination finale

**Décision :** Ce chemin est un artefact de l'ancien domaine `smartphonereparation.ch`. Il ne doit pas apparaître dans `next.config.js`.  
**Raison :** Toutes les URLs Yoast qui pointent vers `/www.smartphonereparation.ch` doivent être reconfigurées pour pointer directement vers leur destination métier (service réparation, shop accessoires, ou homepage selon le cas).  
**Règle :** Toute redirection avec cette destination intermédiaire crée une chaîne inutile. Chaque source doit avoir une destination finale directe.

### 4.6 HTTP doit rediriger vers HTTPS

**Décision :** La redirection `http://clikclak.ch/* → https://clikclak.ch/*` doit être configurée au niveau du serveur (Vercel ou middleware Next.js), pas uniquement dans le navigateur.  
**Raison :** `http://clikclak.ch/` génère 35 clics et 1 749 impressions GSC sur 16 mois — signal non négligeable. Si la redirection HTTP→HTTPS n'est pas active sur le nouveau serveur dès le premier jour, ce signal et ces backlinks peuvent être perdus.  
**Action :** Vérifier la configuration Vercel (HTTPS forced) ou ajouter un middleware Next.js de redirection.

### 4.7 `/services/recuperation-donnees/` est l'URL canonique définitive pour la récupération de données

**Validé le 2026-05-06.**

**Décision :** `/services/recuperation-donnees/` devient la seule URL de référence pour le service récupération de données. Elle sera créée en 200 dans Next.js avec un title, une meta description et un H1 corrects.

**Raison :** C'est la seule des deux URLs présente dans le rapport GSC Pages (8 impressions). L'URL `/r-cup-ration-de-donn-es/` n'apparaît pas du tout dans GSC malgré 67 liens internes — Google ne lui accorde aucun positionnement. Le slug encodé est illisible et contraire aux bonnes pratiques.

**Conséquences directes :**
1. `301 /r-cup-ration-de-donn-es/ → /services/recuperation-donnees/`
2. Les 67 liens internes pointant vers `/r-cup-ration-de-donn-es/` devront pointer vers `/services/recuperation-donnees/` dans le code du nouveau site — aucune occurrence de l'ancien slug ne doit subsister dans les composants, le maillage, ou les données
3. Le title, la meta et le H1 de `/services/recuperation-donnees/` doivent être réécrits avant mise en ligne (actuellement title tronqué, meta générique 204 chars)

**Règle :** Ne jamais garantir une récupération à 100 % dans le contenu de cette page (règle CLAUDE.md).

### 4.8 `/services/reparation-macbook/` doit être conservée en 200 et renforcée dans le maillage interne

**Validé le 2026-05-06** — confirmation de §4.3.

**Rappel chiffres :** 87 clics / 295 impressions GSC sur 16 mois. 2ème page la plus trafiquée après la homepage. Seulement 5 liens internes actuellement.

**Actions obligatoires avant mise en ligne :**
1. Corriger le H1 : `Réparation d'ordinateur` → `Réparation MacBook`
2. Ajouter des liens internes depuis : `/`, `/reparation/`, `/services/reparation-iphone/`, `/services/reparation-samsung-lausanne/`
3. Conserver l'URL `/services/reparation-macbook/` sans modification

---

## 5. Décision validée — URL canonique récupération de données

### Situation

Deux pages coexistent sur le même sujet :

| | `/r-cup-ration-de-donn-es/` | `/services/recuperation-donnees/` |
|---|---|---|
| **Statut HTTP** | 200 | 200 |
| **Indexabilité** | Indexable | Indexable |
| **Liens internes** | 67 | 3 |
| **Clics GSC (16 mois)** | **Non présente dans le rapport GSC** | 0 |
| **Impressions GSC** | **Non présente dans le rapport GSC** | 8 |
| **Title** | Clik Clak Repair Récupération de données ⭐️×5 | Clik Clak Récupération de données - *(tronqué)* |
| **H1** | Double H1 | Simple H1 correct |
| **Meta** | Spécifique au service | Générique 204 chars (copier-colle WP) |
| **Slug** | Encodé, illisible | Propre, lisible |
| **Canonical** | Auto-référencé | Auto-référencé |

### Analyse

L'URL `/r-cup-ration-de-donn-es/` **n'apparaît pas du tout dans le rapport GSC Pages 16 mois**, malgré 67 liens internes. Cela indique soit que Google ne lui accorde pas de positionnement, soit qu'elle est ignorée au profit de l'autre URL.

L'URL `/services/recuperation-donnees/` apparaît dans GSC avec 8 impressions, confirmant que c'est cette URL que Google indexe effectivement.

### Décision — validée le 2026-05-06

**`/services/recuperation-donnees/` est l'URL canonique définitive.**

Actions à enchaîner dans le nouveau site :
1. Créer la page `/services/recuperation-donnees/` en 200 avec un title propre (suggestion : `Récupération de données à Lausanne — Clik Clak Repair`)
2. Réécrire la meta description (actuellement 204 chars génériques copiés-collés depuis une autre page)
3. Vérifier et corriger le H1 (actuellement simple et correct, à conserver)
4. Ajouter `301 /r-cup-ration-de-donn-es/ → /services/recuperation-donnees/` dans `next.config.js`
5. Tous les liens internes du nouveau site doivent pointer vers `/services/recuperation-donnees/` — l'ancien slug encodé ne doit jamais apparaître dans le code source

**Note post-validation :** si des backlinks externes existent vers `/r-cup-ration-de-donn-es/`, la redirection 301 les transférera automatiquement vers l'URL propre. Aucune action supplémentaire requise.

---

## Résumé des comptages

| Catégorie | Nombre d'URLs | Statut |
|-----------|---------------|--------|
| Pages 200 à conserver | 22 | Validé |
| Pages 200 à créer | 2 (`/shop-reparation-smartphone-lausanne/`, `/clik-clak-repair-lausanne/`) | Validé |
| Redirections 301 simples à conserver | 10 (dont `/r-cup-ration-de-donn-es/`) | Validé |
| Chaînes à corriger (raccourcir) | 4 | Validé |
| Pages 404 à rediriger (Screaming Frog) | 16 | Validé |
| URLs GSC avec trafic à rediriger | 8 | Validé |
| Redirections Yoast à migrer (sélection) | 24 | Validé |
| Décisions validées | 8 (§4.1 à §4.8) | Validé |
| Points à confirmer manuellement | 0 | Résolu |

---

*Ce fichier est une source de vérité SEO pour la migration. Toute modification d'URL doit être documentée ici avant d'être implémentée.*
