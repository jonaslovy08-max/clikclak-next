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
NEXT_PUBLIC_GA_ID
NEXT_PUBLIC_GOOGLE_ADS_ID
```
