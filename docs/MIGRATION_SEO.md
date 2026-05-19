# MIGRATION_SEO.md — ClikClak.ch

Stratégie de migration WordPress → Next.js côté SEO.

## Principes

1. Aucune URL existante en 200 n'est modifiée sans décision documentée dans `SEO_DECISIONS.md`
2. Chaque redirection 301 est directe (1 saut — pas de chaîne)
3. `/shop-reparation-smartphone-lausanne/` reste une page 200
4. La récupération de données est portée par `/services/recuperation-donnees/` (URL canonique validée)
5. HTTP redirige vers HTTPS dès le premier jour

## URLs prioritaires (par trafic GSC 16 mois)

| URL | Clics | Impressions | Statut |
|-----|-------|-------------|--------|
| `/` | 896 | 2374 | ✅ Créée |
| `/services/reparation-macbook/` | 87 | 295 | ✅ Créée |
| `/services/reparation-iphone/` | 59 | 455 | ✅ Créée |
| `/reparation-smartphone-express/` | 3 | 63 | ✅ Créée |
| `/services/reparation-samsung-lausanne/` | 2 | 57 | ✅ Créée |
| `/contact-clik-clak-lausanne/` | 1 | 142 | ✅ Créée |
| `/reparation/` | 1 | 85 | ✅ Créée |

## GSC — Problèmes identifiés (rapport couverture)

| Problème | Nombre | Action |
|----------|--------|--------|
| Introuvable (404) | 64 pages | Redirections Phase 7 |
| Autre page avec canonical correcte | 57 pages | Vérifier après migration |
| Exclue noindex | 20 pages | Normal (CGV, admin) |
| Page avec redirection | 18 pages | Réduire chaînes Phase 7 |
| Explorée non indexée | 89 pages | Surveiller après migration |

## ⚠ Blocage avant mise en production — `/r-cup-ration-de-donn-es/`

**Cette URL est temporairement servie en 200 pendant le développement.**  
**Elle doit impérativement passer en 301 avant le lancement final.**

| | Valeur |
|---|---|
| **URL legacy** | `/r-cup-ration-de-donn-es/` |
| **Statut actuel** | 200 temporaire (Phase 1) |
| **Statut requis au lancement** | 301 → `/services/recuperation-donnees/` |
| **Décision** | SEO_DECISIONS.md §4.7 — validée le 2026-05-06 |
| **Fichier source** | `data/legacy-urls.ts` (entrée statut `VALIDÉ`) |
| **Implémentation** | `next.config.ts` — Phase 7 |

**Pourquoi temporairement en 200 :**  
Le slug encodé `/r-cup-ration-de-donn-es/` contient 67 liens internes dans le WordPress actuel. Conserver la page en 200 pendant le développement évite tout risque de 404 en cas de déploiement intermédiaire. La balise canonical pointe déjà sur `/services/recuperation-donnees/` pour signaler à Google l'URL de destination dès maintenant.

**Ce qui doit être fait en Phase 7, avant go-live :**
1. Ajouter dans `next.config.ts` : `{ source: '/r-cup-ration-de-donn-es/', destination: '/services/recuperation-donnees/', permanent: true }`
2. Supprimer le dossier `app/r-cup-ration-de-donn-es/` (la page 200 disparaît, la 301 prend le relais)
3. Cocher l'entrée correspondante dans `docs/LAUNCH_CHECKLIST.md`

**Ne jamais mettre en production avec cette URL en 200.**

---

## Domaine legacy : smartphonereparation.ch

Chemin interne `/www.smartphonereparation.ch` présent dans Yoast comme destination intermédiaire.
**Ne jamais reprendre ce chemin dans `next.config.ts`.**
Toutes les sources doivent pointer directement vers leur destination métier finale.

## Fichiers de référence

- `docs/SEO_DECISIONS.md` — décisions validées
- `docs/URL_MAPPING.csv` — mapping complet (77 entrées)
- `docs/REDIRECTS_LEGACY_CLEAN.csv` — redirections Yoast analysées
- `data/legacy-urls.ts` — liste des 301 à implémenter en Phase 7
