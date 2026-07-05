# ClikClak — Règles projet pour Claude

## Stack
- Next.js 15, App Router, TypeScript strict, Tailwind v3 JIT
- GSAP 3.x (ScrollTrigger, timeline/paused, fromTo)
- `'use client'` uniquement si hooks / effets / GSAP
- Server Components par défaut (pas de `'use client'` inutile)

---

## Tunnel de réparation — Logique obligatoire

Le parcours utilisateur pour toute réparation doit toujours suivre exactement :

```
Réparation
  → Type d'appareil
    → Marque / Gamme
      → Modèle
        → Tarifs
```

### Règles critiques

1. **Ne jamais sauter une étape.** Un lien "Réparation > Smartphone" doit mener vers
   la sélection de marque, pas directement vers les tarifs iPhone.

2. **Ne jamais inventer de prix.** Les tarifs doivent toujours venir d'un fichier `data/`.
   Si aucune donnée n'existe pour une marque/modèle → afficher contact/diagnostic à la place.

3. **Ne pas dupliquer les prix.** Un prix n'existe qu'en un seul endroit dans le code :
   son fichier `data/`. Les pages lisent et affichent ces données, elles ne les contiennent pas.

4. **Source de vérité :**
   - iPhone → `data/iphoneRepairs.ts`
   - iPad → `data/ipadRepairs.ts`
   - Samsung → `data/samsungRepairs.ts`
   - OPPO → `data/oppoRepairs.ts`
   - Huawei → `data/huaweiRepairs.ts`
   - MacBook → `data/macbookRepairs.ts` *(tarifs provisoires — mettre à jour avant mise en ligne)*

---

### Implémentation actuelle (validée 2026-05-13)

| Étape | Type | URL | État |
|-------|------|-----|------|
| Type d'appareil | Smartphone | `/reparation-smartphone-express` | ✅ complet |
| Type d'appareil | Tablette | `/reparation-tablette-express` | ✅ complet |
| Type d'appareil | Ordinateur | `/reparation-ordinateur-express` | ✅ complet |
| Marque | Apple iPhone | `/services/reparation-iphone` | ✅ complet |
| Marque | Apple iPad | `/services/reparation-ipad` | ✅ complet (BrandPricingClient) |
| Marque | Samsung | `/services/reparation-samsung-lausanne` | ✅ complet (BrandPricingClient) |
| Marque | OPPO | `/services/reparation-oppo` | ✅ complet (BrandPricingClient) |
| Marque | Huawei | `/services/reparation-huawei-lausanne` | ✅ complet (BrandPricingClient) |
| Marque | MacBook | `/services/reparation-macbook` | ✅ complet (BrandPricingClient, tarifs provisoires) |
| Marque | Google Pixel, Xiaomi | `/services/reparation-[marque]` | 🔧 stub — data absente |
| Modèle | iPhone (44 modèles) | `/services/reparation-iphone/[modelSlug]` | ✅ complet |
| Tarifs | Toutes marques ci-dessus | Depuis les fichiers `data/` | ✅ complet |

### Composant générique — BrandPricingClient

`components/repair/BrandPricingClient.tsx` ('use client')
- Architecture identique à la page iPhone : familles → dropdown modèles → tarifs GSAP
- Utilisé par : iPad, Samsung, OPPO, Huawei, MacBook
- Détection automatique "sélection directe" (iPad) vs "dropdown" (Samsung) :
  si `family.id === model.id` → clic direct, pas de dropdown
- Props : brand, h1Prefix, h1Brand, breadcrumbLabel, breadcrumbHref, families,
          models, defaultModelId, initialFamilyCount?, repairNote?, searchPlaceholder?
- Les pages serveur exportent les metadata + passent les données depuis data/

### Chemins de navigation desktop

```
Menu : Réparation > Smartphone → /reparation-smartphone-express
  → Apple  → /services/reparation-iphone (iPhone, 44 modèles)
  → Samsung → /services/reparation-samsung-lausanne (Galaxy S/Note/A/J)
  → Huawei  → /services/reparation-huawei-lausanne (P/Mate/Honor)
  → OPPO    → /services/reparation-oppo (Find X2/X3, Reno4)
  → Pixel/Xiaomi → stub (data absente)

Menu : Réparation > Tablette → /reparation-tablette-express
  → iPad → /services/reparation-ipad (9 familles)

Menu : Réparation > Ordinateur → /reparation-ordinateur-express
  → MacBook → /services/reparation-macbook (6 familles, 31 modèles)
```

### Ajouter une nouvelle marque (procédure)

1. Créer `data/[marqueRepairs].ts` avec les types `GenericFamily`, `GenericModel`, `GenericRepair`
   (nommage local libre, mêmes champs requis)
2. Ajouter `build[Marque]Index()` dans `lib/repairSearch.ts` et l'inclure dans `buildRepairSearchIndex()`
3. Créer `app/services/reparation-[marque]/page.tsx` : server component (metadata) + `<BrandPricingClient .../>`
4. Mettre à jour `RepairBrandSelector.tsx` si la marque n'y est pas déjà

---

## Conventions UI

### Animations GSAP

- **Règle critique** : ne jamais mettre `opacity`, `visibility`, `transform` dans le `style` JSX
  d'un élément animé par GSAP. React écrase GSAP au re-render.
- Initialisation → `useLayoutEffect` (avant le premier paint)
- Ouverture/fermeture → `useEffect([open])` avec `fromTo` frais à chaque cycle
- `prefers-reduced-motion` → `gsap.set()` instantané, pas d'animation

### Scroll smooth

- Les ancres `#section` utilisent `SmoothAnchorLinks` (global, `layout.tsx`)
- Les navigations page → page utilisent `PageTransitionWrapper` (entrance fade-in sur `pathname` change)
- Offset scroll : 24 px au-dessus de la section cible (cohérent avec `selectModelAndScroll`)

### Icônes / couleurs SVG

- Jamais de `filter` ou `opacity` sur les SVG de logo
- Utiliser `mask-image` CSS pour coloriser (technique `MaskedIcon`)
- Accent lime : `#ccff33` / `#CCFF33`
- Fond sombre : `#191919`

---

## Fichiers critiques — ne pas modifier sans analyse complète

| Fichier | Rôle |
|---------|------|
| `data/iphoneRepairs.ts` | Source de vérité des prix iPhone — ne JAMAIS dupliquer les prix |
| `data/ipadRepairs.ts` | Source de vérité des prix iPad |
| `data/samsungRepairs.ts` | Source de vérité des prix Samsung (S/Note/A/J) |
| `data/oppoRepairs.ts` | Source de vérité des prix OPPO |
| `data/huaweiRepairs.ts` | Source de vérité des prix Huawei/Honor |
| `data/macbookRepairs.ts` | Source de vérité des prix MacBook *(provisoires)* |
| `lib/repairSearch.ts` | Index de recherche global — toutes marques |
| `components/repair/BrandPricingClient.tsx` | Composant générique pricing page (GSAP, famille→modèle→tarifs) |
| `components/repair/RepairBrandSelector.tsx` | Sélection marque (étape 2 du tunnel smartphone) |
| `app/services/reparation-iphone/page.tsx` | Page sélection modèle iPhone (spécifique, complexe) |
| `components/layout/DesktopNav.tsx` | Menu + dropdown Réparation + barre indicatrice |
| `app/layout.tsx` | Root layout — preloader, cookie consent, transitions |

---

## SEO — Règles strictes

- Ne jamais modifier les URLs, slugs, H1 ou métadonnées sans instruction explicite
- `robots: { index: false }` sur les pages légales (CGV, politique de confidentialité)
- Chaque page modèle iPhone a son canonical propre : `/services/reparation-iphone/[id]/`
- La page principale `/services/reparation-iphone` conserve son URL et son H1

---

## Variables d'environnement (ne jamais hardcoder)

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_ANALYTICS_ENABLED   ← "true" uniquement en production Infomaniak
NEXT_PUBLIC_GA_MEASUREMENT_ID   ← ID GA4 (remplace NEXT_PUBLIC_GA_ID, déprécié)
NEXT_PUBLIC_GOOGLE_ADS_ID
```

---

## Google Analytics 4 — Configuration et modèle de consentement

### Réglage GA4 obligatoire (anti-doublon page_view)

Dans GA4 Admin → Flux de données → [clikclak.ch] → Mesure améliorée → ⚙️ :
**Désactiver** "Modifications de pages basées sur les événements de l'historique du navigateur"
(Enhanced Measurement > Page views > "Page changes based on browser history events")

Raison : GaNavTracker est le seul émetteur de page_view sur les navigations SPA.
Si Enhanced Measurement est actif sur ce point, chaque navigation produit deux page_view.
gtag('config', ..., {send_page_view:false}) supprime l'automatique au chargement initial ;
le page_view initial est réémis explicitement dans s.onload de GoogleTags.

### Modèle de consentement : Consent Mode v2 AVANCÉ

Ce projet utilise le Consent Mode v2 en mode **avancé** :

- `analytics_storage:'denied'` → cookies Analytics bloqués tant que l'utilisateur n'a pas accepté.
- `ad_storage:'denied'` / `ad_user_data:'denied'` / `ad_personalization:'denied'` → idem pour Ads.
- **Mais** : des signaux sans cookies (*cookieless pings*) peuvent être transmis à Google pour
  le modelling de conversion, même sans consentement explicite. C'est le comportement standard
  du Consent Mode v2 avancé — prévu par Google pour alimenter les modèles statistiques.

Pour passer en mode **basique** (zéro transmission avant consentement) :
ne charger gtag.js qu'après acceptation explicite — modification majeure, ne pas appliquer
sans validation préalable.

### Fichiers Analytics

| Fichier | Rôle |
|---|---|
| `components/GoogleTags.tsx` | Consent Mode v2, chargement gtag.js, config GA4/Ads, page_view initial |
| `components/GaNavTracker.tsx` | Suivi navigations App Router (usePathname) |
| `components/layout/RootProviders.tsx` | Point de montage — une seule instance, partagée FR/EN |
| `lib/cookieConsent.ts` | Lecture/écriture consentement, applyConsent() pour mise à jour gtag |
| `components/CookieConsent.tsx` | Bannière bilingue FR/EN, appel applyConsent() |
