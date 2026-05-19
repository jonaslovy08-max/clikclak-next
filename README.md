# ClikClak.ch — Next.js

Refonte complète de clikclak.ch depuis WordPress vers Next.js App Router.

## Stack

- Next.js 15 App Router
- TypeScript
- Tailwind CSS 3
- PostgreSQL + Prisma
- Zod + React Hook Form
- Radix UI (composants interactifs complexes uniquement)
- Framer Motion (sobriété)

## Démarrage

```bash
npm install
npm run dev
```

## Documentation SEO

- `docs/SEO_DECISIONS.md` — décisions SEO validées (source de vérité)
- `docs/URL_MAPPING.csv` — mapping complet des URLs
- `docs/REDIRECTS_LEGACY_CLEAN.csv` — redirections legacy analysées
- `docs/MIGRATION_SEO.md` — stratégie de migration
- `docs/LAUNCH_CHECKLIST.md` — checklist de mise en ligne

## Architecture

```
app/           Routes Next.js App Router
lib/           Utilitaires (seo.ts, urls.ts, theme.ts)
data/          Données statiques (navigation, legacy-urls)
components/    Composants réutilisables (Phase 3+)
docs/          Documentation SEO et migration
```

## Phases

| Phase | Objectif | Statut |
|-------|----------|--------|
| 1 | Initialisation + routes placeholder | ✅ Fait |
| 2 | URL Mapping SEO | ✅ Fait |
| 3 | Homepage finale | En attente |
| 4 | Service récupération de données | En attente |
| 5 | Shop | En attente |
| 6 | Backoffice `/admin` | En attente |
| 7 | Redirections `next.config.ts` | En attente |
| 8 | Checklist lancement | En attente |

## Règles SEO critiques

- Ne jamais modifier un slug sans validation dans `docs/SEO_DECISIONS.md`
- Ne jamais rediriger `/shop-reparation-smartphone-lausanne/` vers l'accueil
- `http://` doit rediriger vers `https://` (Vercel ou middleware)
- Chaque page doit avoir `metadata`, `H1` et `canonical`
- Un seul H1 par page
