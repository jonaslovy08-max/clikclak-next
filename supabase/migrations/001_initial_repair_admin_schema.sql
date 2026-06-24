-- =============================================================================
-- Migration 001 — Schéma initial interface d'administration ClikClak
-- =============================================================================
-- Objectif : créer les tables, contraintes, index, fonctions et politiques RLS
--            pour l'administration des réparations.
-- Source de vérité publique actuelle : fichiers data/*.ts (inchangés).
-- Ce schéma prépare la future migration sans modifier le site public.
--
-- Ordre d'exécution :
--   1. Extension pgcrypto
--   2. Fonction utilitaire set_updated_at()
--   3-11. Tables, index, triggers, ENABLE RLS
--   12. Fonctions d'autorisation RLS (après création de admin_profiles)
--   13. Politiques RLS
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Extension
-- ---------------------------------------------------------------------------
-- gen_random_uuid() est disponible nativement dans PostgreSQL 13+.
-- Supabase utilise PostgreSQL 15+ — pas besoin d'activer pgcrypto séparément.
-- On l'active par précaution pour les environnements plus anciens.
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ---------------------------------------------------------------------------
-- 2. Fonction utilitaire — updated_at automatique
-- ---------------------------------------------------------------------------
-- Pas de dépendance sur une table — peut être créée en premier.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


-- ---------------------------------------------------------------------------
-- 3. Table : brands
-- ---------------------------------------------------------------------------
-- Représente les marques du catalogue de réparation.
-- Chaque marque correspond à une section publique (/services/reparation-iphone…).

CREATE TABLE public.brands (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identifiant interne stable, non destiné à l'affichage public.
  -- Ne doit jamais être modifié après création car il sert de référence
  -- pour les scripts de migration.
  internal_key         text        NOT NULL UNIQUE,

  name                 text        NOT NULL,             -- ex: "iPhone"
  slug                 text        NOT NULL UNIQUE,       -- ex: "iphone"

  -- Champs SEO/UI repris directement depuis RepairBrandData
  h1_prefix            text        NOT NULL DEFAULT 'Réparation',
  h1_brand             text        NOT NULL,             -- ex: "Samsung"
  brand_icon           text,                             -- chemin SVG (optionnel)
  breadcrumb_label     text        NOT NULL,
  breadcrumb_href      text        NOT NULL,

  -- Chemin public racine de la marque — UNIQUE car chaque marque a sa route.
  -- Protège contre la création accidentelle de deux marques sur la même URL.
  public_base_path     text        NOT NULL UNIQUE,      -- ex: "/services/reparation-iphone"

  -- Options UI reprises depuis RepairBrandData
  default_model_slug   text,
  initial_family_count integer     CHECK (initial_family_count IS NULL OR initial_family_count > 0),
  repair_note          text,
  search_placeholder   text,

  status               text        NOT NULL DEFAULT 'active'
                                   CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order           integer     NOT NULL DEFAULT 0,

  created_at           timestamptz NOT NULL DEFAULT now(),
  updated_at           timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_brands_status       ON public.brands (status);
CREATE INDEX idx_brands_sort_order   ON public.brands (sort_order);
CREATE INDEX idx_brands_slug         ON public.brands (slug);
CREATE INDEX idx_brands_public_base  ON public.brands (public_base_path);

CREATE TRIGGER trg_brands_updated_at
  BEFORE UPDATE ON public.brands
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 4. Table : device_categories
-- ---------------------------------------------------------------------------
-- Catégories d'appareils : Smartphone, Tablette, Ordinateur.
-- Pas d'enum rigide pour rester extensible.

CREATE TABLE public.device_categories (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_key text        NOT NULL UNIQUE,   -- ex: "smartphone"
  name         text        NOT NULL,           -- ex: "Smartphone"
  slug         text        NOT NULL UNIQUE,    -- ex: "smartphone"
  status       text        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order   integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_categories_status     ON public.device_categories (status);
CREATE INDEX idx_device_categories_sort_order ON public.device_categories (sort_order);

CREATE TRIGGER trg_device_categories_updated_at
  BEFORE UPDATE ON public.device_categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.device_categories ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 5. Table : device_families
-- ---------------------------------------------------------------------------
-- Familles / générations d'appareils dans une marque.
-- Ex : "Galaxy S25" dans Samsung, "iPhone 15" dans iPhone.

CREATE TABLE public.device_families (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id     uuid        NOT NULL REFERENCES public.brands (id) ON DELETE RESTRICT,

  -- Identifiant stable dans le contexte de sa marque
  internal_key text        NOT NULL,    -- ex: "galaxy-s25"
  name         text        NOT NULL,    -- ex: "Galaxy S25"
  short_label  text        NOT NULL,    -- ex: "S25"
  button_prefix text,                   -- ex: "Galaxy " (null pour iPhone)

  status       text        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order   integer     NOT NULL DEFAULT 0,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now(),

  -- Unicité à l'intérieur d'une marque
  CONSTRAINT uq_device_families_brand_key  UNIQUE (brand_id, internal_key),
  CONSTRAINT uq_device_families_brand_name UNIQUE (brand_id, name)
);

CREATE INDEX idx_device_families_brand_id   ON public.device_families (brand_id);
CREATE INDEX idx_device_families_status     ON public.device_families (status);
CREATE INDEX idx_device_families_sort_order ON public.device_families (sort_order);

CREATE TRIGGER trg_device_families_updated_at
  BEFORE UPDATE ON public.device_families
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.device_families ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 6. Table : device_models
-- ---------------------------------------------------------------------------
-- Modèles individuels d'appareils.
-- Le slug est la clé d'URL publique — à traiter comme immuable une fois publié.
-- brand_id n'est pas dupliqué ici : il se dérive via device_families.

CREATE TABLE public.device_models (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id    uuid        NOT NULL REFERENCES public.device_families (id) ON DELETE RESTRICT,
  category_id  uuid        NOT NULL REFERENCES public.device_categories (id) ON DELETE RESTRICT,

  internal_key text        NOT NULL UNIQUE,    -- ex: "iphone-15-pro"
  name         text        NOT NULL,            -- ex: "iPhone 15 Pro"
  slug         text        NOT NULL UNIQUE,     -- ex: "iphone-15-pro" (= URL)

  -- Trace la valeur importée depuis les fichiers TypeScript actuels.
  -- Ne doit pas modifier automatiquement les URLs publiques.
  legacy_slug  text,

  status       text        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order   integer     NOT NULL DEFAULT 0,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_device_models_family_id   ON public.device_models (family_id);
CREATE INDEX idx_device_models_category_id ON public.device_models (category_id);
CREATE INDEX idx_device_models_slug        ON public.device_models (slug);
CREATE INDEX idx_device_models_status      ON public.device_models (status);
CREATE INDEX idx_device_models_sort_order  ON public.device_models (sort_order);

CREATE TRIGGER trg_device_models_updated_at
  BEFORE UPDATE ON public.device_models
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.device_models ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 7. Table : repair_types
-- ---------------------------------------------------------------------------
-- Types de réparation (Écran, Batterie, Caméra principale…).
-- Les valeurs réelles seront extraites des fichiers data/*.ts lors de la migration.

CREATE TABLE public.repair_types (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_key text        NOT NULL UNIQUE,   -- ex: "ecran", "batterie"
  name         text        NOT NULL,           -- ex: "Écran"
  short_name   text,                           -- ex: "Écran" (compact UI)
  slug         text        NOT NULL UNIQUE,    -- ex: "ecran"

  -- Correspond à RepairCategory existant dans data/repairTypes.ts
  category     text        NOT NULL
                           CHECK (category IN ('screen', 'battery', 'other')),
  description  text,

  status       text        NOT NULL DEFAULT 'active'
                           CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order   integer     NOT NULL DEFAULT 0,

  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_repair_types_category   ON public.repair_types (category);
CREATE INDEX idx_repair_types_status     ON public.repair_types (status);
CREATE INDEX idx_repair_types_sort_order ON public.repair_types (sort_order);

CREATE TRIGGER trg_repair_types_updated_at
  BEFORE UPDATE ON public.repair_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.repair_types ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 8. Table : repair_offers
-- ---------------------------------------------------------------------------
-- Offre de réparation : relation entre un modèle et un type de réparation,
-- avec prix, disponibilité, durée et garantie.
--
-- Supporte plusieurs variantes par modèle/type (ex: écran standard vs OLED premium).
-- variant_key doit être stable — il identifie la variante dans les scripts.

CREATE TABLE public.repair_offers (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  device_model_id   uuid        NOT NULL REFERENCES public.device_models (id) ON DELETE RESTRICT,
  repair_type_id    uuid        NOT NULL REFERENCES public.repair_types  (id) ON DELETE RESTRICT,

  -- Identifiant de variante (ex: "standard", "oled-premium", "original-refurbished")
  variant_key       text        NOT NULL DEFAULT 'standard',
  -- Libellé public de la variante (optionnel, ex: "OLED Premium")
  variant_name      text,
  -- Sous-titre UI (ex: "Changement d'écran")
  subtitle          text,

  -- Mode de prix — détermine l'affichage public et les contraintes sur price_cents
  pricing_mode      text        NOT NULL DEFAULT 'fixed'
                                CHECK (pricing_mode IN ('fixed', 'on_request', 'quote')),

  -- Prix en centimes (ex: CHF 129.– → 12900)
  -- NULL obligatoire pour on_request et quote
  price_cents       integer,

  currency          text        NOT NULL DEFAULT 'CHF'
                                CHECK (char_length(currency) = 3),   -- ISO 4217

  availability      text        NOT NULL DEFAULT 'available'
                                CHECK (availability IN ('available', 'on_request', 'unavailable')),

  -- Durée estimée en minutes (null si non renseignée)
  duration_minutes  integer     CHECK (duration_minutes IS NULL OR duration_minutes > 0),

  -- Garantie en mois (null si non renseignée)
  warranty_months   integer     CHECK (warranty_months IS NULL OR warranty_months >= 0),

  public_note       text,    -- note visible par les visiteurs
  internal_note     text,    -- note interne non publiée

  status            text        NOT NULL DEFAULT 'active'
                                CHECK (status IN ('active', 'inactive', 'archived')),
  sort_order        integer     NOT NULL DEFAULT 0,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  -- Une seule offre par combinaison modèle + type + variante
  CONSTRAINT uq_repair_offer_variant UNIQUE (device_model_id, repair_type_id, variant_key),

  -- Cohérence prix / mode de tarification
  CONSTRAINT chk_pricing_mode_consistency CHECK (
    (pricing_mode = 'fixed'      AND price_cents IS NOT NULL AND price_cents >= 0)
    OR
    (pricing_mode = 'on_request' AND price_cents IS NULL)
    OR
    (pricing_mode = 'quote'      AND price_cents IS NULL)
  )
);

CREATE INDEX idx_repair_offers_model_id     ON public.repair_offers (device_model_id);
CREATE INDEX idx_repair_offers_type_id      ON public.repair_offers (repair_type_id);
CREATE INDEX idx_repair_offers_pricing_mode ON public.repair_offers (pricing_mode);
CREATE INDEX idx_repair_offers_availability ON public.repair_offers (availability);
CREATE INDEX idx_repair_offers_status       ON public.repair_offers (status);
CREATE INDEX idx_repair_offers_sort_order   ON public.repair_offers (sort_order);

CREATE TRIGGER trg_repair_offers_updated_at
  BEFORE UPDATE ON public.repair_offers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.repair_offers ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 9. Table : admin_profiles
-- ---------------------------------------------------------------------------
-- Profils des administrateurs, liés à Supabase Auth.
-- Ne pas créer d'administrateur automatiquement dans cette migration.

CREATE TABLE public.admin_profiles (
  -- Lié directement à auth.users — même UUID
  id         uuid        PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email      text        NOT NULL,
  role       text        NOT NULL DEFAULT 'editor'
                         CHECK (role IN ('admin', 'editor')),
  active     boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_admin_profiles_role   ON public.admin_profiles (role);
CREATE INDEX idx_admin_profiles_active ON public.admin_profiles (active);

CREATE TRIGGER trg_admin_profiles_updated_at
  BEFORE UPDATE ON public.admin_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 10. Table : admin_activity_logs
-- ---------------------------------------------------------------------------
-- Journal append-only des modifications effectuées par les administrateurs.
-- Les logs ne peuvent pas être modifiés ni supprimés depuis l'interface.

CREATE TABLE public.admin_activity_logs (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- NULL si l'administrateur a été supprimé ultérieurement
  admin_user_id uuid        REFERENCES public.admin_profiles (id) ON DELETE SET NULL,

  action        text        NOT NULL,   -- ex: 'create', 'update', 'archive', 'delete'
  entity_type   text        NOT NULL,   -- ex: 'repair_offer', 'device_model'
  entity_id     uuid,                   -- UUID de l'entité concernée

  old_values    jsonb,                  -- état avant modification
  new_values    jsonb,                  -- état après modification

  -- Pas de updated_at : les logs sont immuables
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_user_id     ON public.admin_activity_logs (admin_user_id);
CREATE INDEX idx_activity_logs_entity      ON public.admin_activity_logs (entity_type, entity_id);
CREATE INDEX idx_activity_logs_created_at  ON public.admin_activity_logs (created_at DESC);

ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 11. Table : model_slug_history
-- ---------------------------------------------------------------------------
-- Trace l'historique des changements de slugs et chemins publics.
-- Prépare la gestion future des redirections 301 contrôlées.
-- Non utilisée par le routage public actuellement.

CREATE TABLE public.model_slug_history (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),

  -- SET NULL pour conserver l'historique si le modèle est archivé
  device_model_id  uuid        REFERENCES public.device_models (id) ON DELETE SET NULL,

  old_slug         text        NOT NULL,
  new_slug         text        NOT NULL,

  -- Chemin public complet avant/après (ex: "/services/reparation-iphone/iphone-15-pro")
  -- Unicité sur old_public_path : une ancienne URL ne peut pas apparaître deux fois
  old_public_path  text        NOT NULL UNIQUE,
  new_public_path  text        NOT NULL,

  -- Administrateur ayant effectué le changement (SET NULL si supprimé)
  changed_by       uuid        REFERENCES public.admin_profiles (id) ON DELETE SET NULL,

  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_slug_history_model_id        ON public.model_slug_history (device_model_id);
CREATE INDEX idx_slug_history_old_public_path ON public.model_slug_history (old_public_path);
CREATE INDEX idx_slug_history_created_at      ON public.model_slug_history (created_at DESC);

ALTER TABLE public.model_slug_history ENABLE ROW LEVEL SECURITY;


-- ---------------------------------------------------------------------------
-- 12. Fonctions d'autorisation RLS
-- ---------------------------------------------------------------------------
-- Définies ICI, après public.admin_profiles, car leur corps SQL référence
-- cette table. PostgreSQL valide les références à la création de la fonction.
--
-- SECURITY DEFINER : la fonction s'exécute avec les droits du propriétaire,
-- ce qui lui permet d'interroger admin_profiles sans déclencher de récursion
-- RLS sur cette table (la politique own_profile_select utilise id = auth.uid(),
-- pas ces fonctions).
-- Le search_path est verrouillé pour éviter les injections de schéma.

CREATE OR REPLACE FUNCTION public.is_active_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = auth.uid()
      AND active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.has_admin_role(required_role text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_profiles
    WHERE id = auth.uid()
      AND active = true
      AND (
        role = required_role
        -- admin peut effectuer tout ce qu'un editor peut faire
        OR (required_role = 'editor' AND role = 'admin')
      )
  );
$$;


-- =============================================================================
-- 13. Politiques RLS — Phase 0
-- =============================================================================
-- Pendant la Phase 0 : aucun accès public (anon).
-- Seuls les administrateurs authentifiés et actifs accèdent aux données.
-- L'accès complet via la Secret key (SUPABASE_SECRET_KEY) reste disponible pour les scripts serveur.
-- Les permissions d'écriture fines seront ajoutées avec les Server Actions.
-- =============================================================================

-- ── brands ──────────────────────────────────────────────────────────────────
CREATE POLICY "admin_read_brands" ON public.brands
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "admin_write_brands" ON public.brands
  FOR ALL TO authenticated
  USING (public.has_admin_role('admin'))
  WITH CHECK (public.has_admin_role('admin'));

-- ── device_categories ───────────────────────────────────────────────────────
CREATE POLICY "admin_read_categories" ON public.device_categories
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "admin_write_categories" ON public.device_categories
  FOR ALL TO authenticated
  USING (public.has_admin_role('admin'))
  WITH CHECK (public.has_admin_role('admin'));

-- ── device_families ─────────────────────────────────────────────────────────
CREATE POLICY "admin_read_families" ON public.device_families
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "admin_write_families" ON public.device_families
  FOR ALL TO authenticated
  USING (public.has_admin_role('admin'))
  WITH CHECK (public.has_admin_role('admin'));

-- ── device_models ───────────────────────────────────────────────────────────
CREATE POLICY "admin_read_models" ON public.device_models
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "admin_write_models" ON public.device_models
  FOR ALL TO authenticated
  USING (public.has_admin_role('admin'))
  WITH CHECK (public.has_admin_role('admin'));

-- ── repair_types ────────────────────────────────────────────────────────────
CREATE POLICY "admin_read_repair_types" ON public.repair_types
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "admin_write_repair_types" ON public.repair_types
  FOR ALL TO authenticated
  USING (public.has_admin_role('admin'))
  WITH CHECK (public.has_admin_role('admin'));

-- ── repair_offers ───────────────────────────────────────────────────────────
CREATE POLICY "admin_read_offers" ON public.repair_offers
  FOR SELECT TO authenticated
  USING (public.is_active_admin());

CREATE POLICY "admin_write_offers" ON public.repair_offers
  FOR ALL TO authenticated
  USING (public.has_admin_role('admin'))
  WITH CHECK (public.has_admin_role('admin'));

-- ── admin_profiles ──────────────────────────────────────────────────────────
-- Un utilisateur authentifié peut lire son propre profil.
-- Politique simple sans appel à is_active_admin() → évite la récursion RLS.
CREATE POLICY "own_profile_select" ON public.admin_profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid());

-- La gestion des autres profils est réservée à la Secret key (scripts/tableau de bord Supabase).
-- Les policies d'écriture seront ajoutées lors de la Phase Admin.

-- ── admin_activity_logs ─────────────────────────────────────────────────────
-- Admin peut lire les logs.
CREATE POLICY "admin_read_logs" ON public.admin_activity_logs
  FOR SELECT TO authenticated
  USING (public.has_admin_role('admin'));

-- Insertion uniquement via SUPABASE_SECRET_KEY (Server Actions) — pas de policy INSERT pour authenticated.
-- Mise à jour et suppression : aucune policy → impossible depuis le client.

-- ── model_slug_history ──────────────────────────────────────────────────────
CREATE POLICY "admin_read_slug_history" ON public.model_slug_history
  FOR SELECT TO authenticated
  USING (public.has_admin_role('admin'));

-- Insertion gérée par les Server Actions (SUPABASE_SECRET_KEY).

-- =============================================================================
-- Privilèges objet — Section 14
-- =============================================================================
-- En Supabase, les rôles service_role et authenticated ont besoin de
-- privilèges TABLE explicites même si service_role bypasse le RLS.
-- (Par défaut, seul le rôle "postgres" owner possède les droits sur ses tables.)
-- =============================================================================

-- service_role : accès complet (bypasse RLS + scripts de migration)
GRANT ALL ON public.brands              TO service_role;
GRANT ALL ON public.device_categories   TO service_role;
GRANT ALL ON public.device_families     TO service_role;
GRANT ALL ON public.device_models       TO service_role;
GRANT ALL ON public.repair_types        TO service_role;
GRANT ALL ON public.repair_offers       TO service_role;
GRANT ALL ON public.admin_profiles      TO service_role;
GRANT ALL ON public.admin_activity_logs TO service_role;
GRANT ALL ON public.model_slug_history  TO service_role;

-- authenticated : toutes les opérations DML (les policies RLS limitent l'accès réel)
GRANT ALL ON public.brands              TO authenticated;
GRANT ALL ON public.device_categories   TO authenticated;
GRANT ALL ON public.device_families     TO authenticated;
GRANT ALL ON public.device_models       TO authenticated;
GRANT ALL ON public.repair_types        TO authenticated;
GRANT ALL ON public.repair_offers       TO authenticated;
GRANT ALL ON public.admin_profiles      TO authenticated;
GRANT ALL ON public.admin_activity_logs TO authenticated;
GRANT ALL ON public.model_slug_history  TO authenticated;

-- Séquences (uuid_generate_v4 gère les PK uuid, mais par sécurité pour les séquences futures)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- Fin de la migration 001
-- =============================================================================
-- Vérifications post-migration recommandées :
--   SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
--   SELECT polname, tablename FROM pg_policies WHERE schemaname = 'public';
--   SELECT grantee, table_name, privilege_type FROM information_schema.role_table_grants
--     WHERE table_schema = 'public' ORDER BY table_name, grantee;
-- =============================================================================
