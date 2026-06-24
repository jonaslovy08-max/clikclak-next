# Mise en place Supabase — Interface d'administration ClikClak

Ce document décrit les étapes manuelles à effectuer dans Supabase pour activer
la Phase 0 de l'interface d'administration.

Le site public continue de lire les fichiers `data/*.ts` pendant toute cette phase.
Aucun changement visible n'est apporté au site public.

---

## 1. Créer le projet Supabase

1. Se connecter sur [supabase.com](https://supabase.com)
2. Cliquer sur **New project**
3. Choisir l'organisation appropriée
4. Nom du projet : `clikclak-admin` (ou équivalent)

### Région recommandée

```
Central Europe (Zurich) — eu-central-2
```

**Justification :**
- Projet et clientèle principalement suisses
- Données hébergées en Suisse → conformité RGPD et droit suisse simplifié
- Latence réduite depuis Lausanne
- La région ne peut pas être changée facilement après création du projet

5. Choisir un mot de passe fort pour la base de données (le conserver en lieu sûr)
6. Plan : **Free** suffit pour la Phase 0
7. Cliquer sur **Create new project** — la création prend ~2 minutes

---

## 2. Récupérer les trois variables d'environnement

Dans le tableau de bord Supabase, aller dans **Project Settings → API** :

| Variable locale | Emplacement dans le Dashboard | Usage |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Tous les clients |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key | Client navigateur + serveur SSR |
| `SUPABASE_SECRET_KEY` | Secret key | Serveur uniquement |

> ⚠️ Ne jamais partager `SUPABASE_SECRET_KEY`. Ne jamais la committer.
> Elle contourne les politiques RLS et donne un accès total à la base de données.

---

## 3. Configurer les variables localement

Dans le fichier `.env.local` (jamais commité, jamais partagé) :

```env
NEXT_PUBLIC_SUPABASE_URL=https://[ref].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SECRET_KEY=eyJ...
```

Remplacer `[ref]` et les valeurs `eyJ...` par les vraies valeurs copiées depuis le Dashboard.

---

## 4. Configuration Infomaniak — Phase 0 uniquement

**Ne pas encore ajouter les variables Supabase chez Infomaniak pendant la Phase 0.**

Ces variables ne sont nécessaires en production que lorsqu'une fonctionnalité
utilisant Supabase sera réellement déployée, notamment l'interface `/admin`.

Pour la Phase 0 :
- Conserver les variables uniquement dans `.env.local` en local
- S'en servir uniquement pour appliquer et vérifier la migration SQL
- Ajouter les variables chez Infomaniak lors du déploiement de la Phase 2 (`/admin`)

---

## 5. Appliquer la migration SQL

Dans le tableau de bord Supabase :

1. Aller dans **SQL Editor**
2. Cliquer sur **New query**
3. Ouvrir le fichier `supabase/migrations/001_initial_repair_admin_schema.sql`
4. Copier l'intégralité du contenu
5. Le coller dans l'éditeur SQL
6. Cliquer sur **Run** (ou `Ctrl+Enter`)
7. Vérifier que la requête se termine avec **Success** sans erreur

Si une erreur apparaît :
- Vérifier que la base de données est bien initialisée (attendre si le projet vient d'être créé)
- S'assurer d'être dans le bon projet Supabase

---

## 6. Vérifier que RLS est actif

Après la migration, vérifier dans **SQL Editor** :

```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

Toutes les tables doivent avoir `rowsecurity = true`.

Vérifier également les politiques :

```sql
SELECT polname, tablename, cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, polname;
```

---

## 7. Créer manuellement le premier utilisateur Auth

> ⚠️ Ne jamais créer d'utilisateur automatiquement dans les scripts.
> La création doit être manuelle et intentionnelle.

Dans le tableau de bord Supabase :

1. Aller dans **Authentication → Users**
2. Cliquer sur **Add user → Create new user**
3. Renseigner l'email de l'administrateur
4. Cocher **Auto Confirm User**
5. Cliquer sur **Create User**
6. Copier l'UUID généré (ex: `a1b2c3d4-...`)

---

## 8. Rattacher l'utilisateur à admin_profiles

Cet utilisateur doit être enregistré dans `admin_profiles` pour recevoir
les permissions dans l'interface d'administration.

Dans **SQL Editor** :

```sql
INSERT INTO public.admin_profiles (id, email, role, active)
VALUES (
  '[UUID copié à l''étape 7]',
  '[email de l''administrateur]',
  'admin',
  true
);
```

> Remplacer les crochets par les vraies valeurs. Ne pas utiliser cet exemple tel quel.

Vérifier l'insertion :

```sql
SELECT id, email, role, active FROM public.admin_profiles;
```

---

## 9. Lancer le script de vérification

Une fois les variables configurées dans `.env.local` et la migration appliquée :

```bash
npm run supabase:check
```

Résultat attendu :

```
── Vérification connexion Supabase (ClikClak Admin) ──────────

  ✓ Variables d'environnement présentes
    Supabase URL : https://[ref].supabas...

  Vérification des 9 tables attendues...

  ✓ brands                      (accessible)
  ✓ device_categories           (accessible)
  ✓ device_families             (accessible)
  ✓ device_models               (accessible)
  ✓ repair_types                (accessible)
  ✓ repair_offers               (accessible)
  ✓ admin_profiles              (accessible)
  ✓ admin_activity_logs         (accessible)
  ✓ model_slug_history          (accessible)

  ✓ 9/9 tables vérifiées

  ✅ Connexion Supabase opérationnelle — Phase 0 validée
```

Si des tables sont manquantes → réappliquer la migration (étape 5).
Si les variables sont manquantes → vérifier `.env.local` (étape 3).

---

## 10. Retour en arrière

Cette phase est entièrement réversible.

**Côté application** :
- Supprimer `lib/supabase/`
- Désinstaller `@supabase/supabase-js` et `@supabase/ssr`
- Supprimer `supabase/` et `scripts/check-supabase-connection.ts`
- Supprimer les variables Supabase de `.env.local`
- Le site public continue de fonctionner sans interruption

**Côté Supabase** :
- Supprimer le projet Supabase depuis le Dashboard
- Les fichiers `data/*.ts` restent intacts et continuent d'être la source de vérité

---

## Références

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase SSR pour Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- Migration suivante : `supabase/migrations/002_seed_reference_data.sql` (Phase 1)
