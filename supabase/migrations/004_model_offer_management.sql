-- =============================================================================
-- Migration 004 — Gestion groupée des modèles et de leurs offres
-- =============================================================================
-- Trois fonctions RPC atomiques :
--
--   1. admin_bulk_update_model_offers  — mise à jour groupée des offres
--   2. admin_create_device_model_with_offers — création d'un modèle + offres
--   3. admin_archive_device_model      — archivage du modèle et de ses offres
--
-- SECURITY DEFINER : requis pour l'accès à admin_activity_logs (pas de policy
-- INSERT pour authenticated). Les contrôles d'autorisation sont internes.
-- =============================================================================


-- ── 1. Mise à jour groupée des offres d'un modèle ────────────────────────────
-- Crée ou met à jour plusieurs offres en une seule transaction atomique.
-- Contrôle de concurrence optimiste via expected_updated_at.

CREATE OR REPLACE FUNCTION public.admin_bulk_update_model_offers(
  p_model_id uuid,
  p_offers   jsonb    -- tableau d'objets offre (voir format ci-dessous)
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id   uuid;
  v_i           integer;
  v_offer       jsonb;
  v_offer_id    uuid;
  v_updated_at  timestamptz;
  v_old_offer   public.repair_offers;
  v_new_id      uuid;
  v_updated     integer := 0;
  v_created     integer := 0;
BEGIN
  -- Identité + rôle
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'auth_required: Authentification requise.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_caller_id AND active = true AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis.';
  END IF;

  -- Vérifier que le modèle existe
  IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE id = p_model_id) THEN
    RAISE EXCEPTION 'not_found: Modèle introuvable.';
  END IF;

  -- Valider et traiter chaque offre
  IF p_offers IS NULL OR jsonb_typeof(p_offers) != 'array' THEN
    RAISE EXCEPTION 'validation:offers: Tableau d''offres attendu.';
  END IF;

  FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
    v_offer := p_offers->v_i;

    -- Valider pricing_mode
    IF (v_offer->>'pricing_mode') NOT IN ('fixed', 'on_request', 'quote') THEN
      RAISE EXCEPTION 'validation:offers[%]: pricing_mode invalide.', v_i;
    END IF;

    -- Cohérence prix
    IF (v_offer->>'pricing_mode') = 'fixed' AND (v_offer->>'price_cents') IS NULL THEN
      RAISE EXCEPTION 'validation:offers[%]: Prix obligatoire pour le mode fixed.', v_i;
    END IF;
    IF (v_offer->>'pricing_mode') IN ('on_request', 'quote') AND (v_offer->>'price_cents') IS NOT NULL THEN
      RAISE EXCEPTION 'validation:offers[%]: Prix doit être null pour on_request/quote.', v_i;
    END IF;

    -- availability
    IF (v_offer->>'availability') NOT IN ('available', 'on_request', 'unavailable') THEN
      RAISE EXCEPTION 'validation:offers[%]: availability invalide.', v_i;
    END IF;
    IF (v_offer->>'availability') = 'unavailable' AND (v_offer->>'price_cents') IS NOT NULL THEN
      RAISE EXCEPTION 'validation:offers[%]: Pas de prix pour une offre indisponible.', v_i;
    END IF;
    IF (v_offer->>'availability') = 'unavailable'
       AND ((v_offer->>'public_note') IS NULL OR trim(v_offer->>'public_note') = '')
    THEN
      RAISE EXCEPTION 'validation:offers[%]: Note publique obligatoire pour une offre indisponible.', v_i;
    END IF;

    -- status
    IF (v_offer->>'status') NOT IN ('active', 'inactive', 'archived') THEN
      RAISE EXCEPTION 'validation:offers[%]: status invalide.', v_i;
    END IF;

    v_offer_id := CASE WHEN (v_offer->>'offer_id') IS NULL THEN NULL
                       ELSE (v_offer->>'offer_id')::uuid END;

    IF v_offer_id IS NULL THEN
      -- ── Création d'une nouvelle offre ──────────────────────────────────────

      -- repair_type must exist
      IF NOT EXISTS (
        SELECT 1 FROM public.repair_types WHERE id = (v_offer->>'repair_type_id')::uuid
      ) THEN
        RAISE EXCEPTION 'validation:offers[%]: Type de réparation introuvable.', v_i;
      END IF;

      INSERT INTO public.repair_offers (
        device_model_id, repair_type_id,
        variant_key, variant_name, subtitle,
        pricing_mode, price_cents, currency,
        availability, duration_minutes, warranty_months,
        public_note, internal_note, status, sort_order
      ) VALUES (
        p_model_id,
        (v_offer->>'repair_type_id')::uuid,
        coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        v_offer->>'pricing_mode',
        CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL
             ELSE (v_offer->>'price_cents')::integer END,
        coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        coalesce(nullif(v_offer->>'availability', ''), 'available'),
        CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL
             ELSE (v_offer->>'duration_minutes')::integer END,
        CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL
             ELSE (v_offer->>'warranty_months')::integer END,
        nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        coalesce(nullif(v_offer->>'status', ''), 'inactive'),
        coalesce((v_offer->>'sort_order')::integer, v_created + v_updated)
      )
      RETURNING id INTO v_new_id;

      INSERT INTO public.admin_activity_logs
        (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES
        (v_caller_id, 'create', 'repair_offer', v_new_id, NULL,
         v_offer || jsonb_build_object('device_model_id', p_model_id, 'id', v_new_id));

      v_created := v_created + 1;

    ELSE
      -- ── Mise à jour d'une offre existante ──────────────────────────────────

      -- Lire l'état courant
      SELECT * INTO v_old_offer FROM public.repair_offers WHERE id = v_offer_id;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found:offers[%]: Offre introuvable (id: %).', v_i, v_offer_id;
      END IF;
      IF v_old_offer.device_model_id != p_model_id THEN
        RAISE EXCEPTION 'forbidden:offers[%]: Cette offre n''appartient pas à ce modèle.', v_i;
      END IF;

      -- Contrôle de concurrence
      v_updated_at := CASE WHEN (v_offer->>'expected_updated_at') IS NULL THEN NULL
                           ELSE (v_offer->>'expected_updated_at')::timestamptz END;

      UPDATE public.repair_offers
      SET
        variant_key     = coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        variant_name    = nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        subtitle        = nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        pricing_mode    = v_offer->>'pricing_mode',
        price_cents     = CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL
                               ELSE (v_offer->>'price_cents')::integer END,
        currency        = coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        availability    = coalesce(nullif(v_offer->>'availability', ''), 'available'),
        duration_minutes = CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL
                                ELSE (v_offer->>'duration_minutes')::integer END,
        warranty_months = CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL
                               ELSE (v_offer->>'warranty_months')::integer END,
        public_note     = nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        internal_note   = nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        status          = coalesce(nullif(v_offer->>'status', ''), 'active'),
        sort_order      = coalesce((v_offer->>'sort_order')::integer, v_old_offer.sort_order)
      WHERE id = v_offer_id
        AND (v_updated_at IS NULL OR updated_at = v_updated_at);

      IF NOT FOUND THEN
        IF EXISTS (SELECT 1 FROM public.repair_offers WHERE id = v_offer_id) THEN
          RAISE EXCEPTION 'conflict:offers[%]: Cette offre a été modifiée par un autre utilisateur. Rechargez la page.', v_i;
        ELSE
          RAISE EXCEPTION 'not_found:offers[%]: Offre introuvable après mise à jour.', v_i;
        END IF;
      END IF;

      -- Journal
      INSERT INTO public.admin_activity_logs
        (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES
        (v_caller_id, 'update', 'repair_offer', v_offer_id,
         to_jsonb(v_old_offer),
         v_offer || jsonb_build_object('device_model_id', p_model_id));

      v_updated := v_updated + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('updated', v_updated, 'created', v_created);
END;
$$;


-- ── 2. Création d'un modèle avec ses offres initiales ────────────────────────

CREATE OR REPLACE FUNCTION public.admin_create_device_model_with_offers(
  p_family_id     uuid,
  p_category_id   uuid,
  p_internal_key  text,
  p_name          text,
  p_slug          text,
  p_legacy_slug   text    DEFAULT NULL,
  p_status        text    DEFAULT 'inactive',
  p_sort_order    integer DEFAULT 0,
  p_offers        jsonb   DEFAULT '[]'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id    uuid;
  v_new_model    public.device_models;
  v_offer        jsonb;
  v_offer_id     uuid;
  v_offers_count integer := 0;
  v_i            integer;
BEGIN
  -- Identité + rôle
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'auth_required: Authentification requise.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_caller_id AND active = true AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis.';
  END IF;

  -- Validation champs modèle
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'validation:name: Le nom public est obligatoire.';
  END IF;
  IF p_internal_key IS NULL OR p_internal_key !~ '^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'validation:internal_key: Format invalide (ex: iphone:iphone-17e).';
  END IF;
  IF p_slug IS NULL OR p_slug !~ '^[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'validation:slug: Format invalide (lettres minuscules, chiffres et tirets).';
  END IF;
  IF p_status NOT IN ('active', 'inactive', 'archived') THEN
    RAISE EXCEPTION 'validation:status: Statut invalide.';
  END IF;

  -- Vérification des références
  IF NOT EXISTS (SELECT 1 FROM public.device_families WHERE id = p_family_id) THEN
    RAISE EXCEPTION 'validation:family_id: Famille introuvable.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.device_categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'validation:category_id: Catégorie introuvable.';
  END IF;

  -- Unicité
  IF EXISTS (SELECT 1 FROM public.device_models WHERE internal_key = p_internal_key) THEN
    RAISE EXCEPTION 'conflict:internal_key: Cette clé interne est déjà utilisée : "%".', p_internal_key;
  END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE slug = p_slug) THEN
    RAISE EXCEPTION 'conflict:slug: Ce slug est déjà utilisé : "%".', p_slug;
  END IF;

  -- Validation des offres
  IF p_offers IS NOT NULL AND jsonb_typeof(p_offers) = 'array' THEN
    FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
      v_offer := p_offers->v_i;

      IF NOT EXISTS (
        SELECT 1 FROM public.repair_types WHERE id = (v_offer->>'repair_type_id')::uuid
      ) THEN
        RAISE EXCEPTION 'validation:offers[%]: Type de réparation introuvable.', v_i;
      END IF;

      IF (v_offer->>'pricing_mode') NOT IN ('fixed', 'on_request', 'quote') THEN
        RAISE EXCEPTION 'validation:offers[%]: pricing_mode invalide.', v_i;
      END IF;

      IF (v_offer->>'pricing_mode') = 'fixed' AND (v_offer->>'price_cents') IS NULL THEN
        RAISE EXCEPTION 'validation:offers[%]: Prix obligatoire pour le mode fixed.', v_i;
      END IF;
      IF (v_offer->>'pricing_mode') IN ('on_request', 'quote') AND (v_offer->>'price_cents') IS NOT NULL THEN
        RAISE EXCEPTION 'validation:offers[%]: Prix doit être null pour on_request/quote.', v_i;
      END IF;

      IF (v_offer->>'availability') NOT IN ('available', 'on_request', 'unavailable') THEN
        RAISE EXCEPTION 'validation:offers[%]: availability invalide.', v_i;
      END IF;
      IF (v_offer->>'availability') = 'unavailable'
         AND ((v_offer->>'public_note') IS NULL OR trim(v_offer->>'public_note') = '')
      THEN
        RAISE EXCEPTION 'validation:offers[%]: Note publique obligatoire pour une offre indisponible.', v_i;
      END IF;
    END LOOP;
  END IF;

  -- Création du modèle
  INSERT INTO public.device_models (
    family_id, category_id, internal_key, name, slug, legacy_slug, status, sort_order
  ) VALUES (
    p_family_id, p_category_id,
    trim(p_internal_key), trim(p_name), trim(p_slug),
    coalesce(nullif(trim(coalesce(p_legacy_slug, '')), ''), trim(p_slug)),
    p_status, p_sort_order
  )
  RETURNING * INTO v_new_model;

  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'create', 'device_model', v_new_model.id, NULL, to_jsonb(v_new_model));

  -- Création des offres
  IF p_offers IS NOT NULL AND jsonb_typeof(p_offers) = 'array' AND jsonb_array_length(p_offers) > 0 THEN
    FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
      v_offer := p_offers->v_i;

      INSERT INTO public.repair_offers (
        device_model_id, repair_type_id,
        variant_key, variant_name, subtitle,
        pricing_mode, price_cents, currency,
        availability, duration_minutes, warranty_months,
        public_note, internal_note, status, sort_order
      ) VALUES (
        v_new_model.id,
        (v_offer->>'repair_type_id')::uuid,
        coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        v_offer->>'pricing_mode',
        CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL
             ELSE (v_offer->>'price_cents')::integer END,
        coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        coalesce(nullif(v_offer->>'availability', ''), 'available'),
        CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL
             ELSE (v_offer->>'duration_minutes')::integer END,
        CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL
             ELSE (v_offer->>'warranty_months')::integer END,
        nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        coalesce(nullif(v_offer->>'status', ''), 'inactive'),
        coalesce((v_offer->>'sort_order')::integer, v_i)
      )
      RETURNING id INTO v_offer_id;

      INSERT INTO public.admin_activity_logs
        (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES
        (v_caller_id, 'create', 'repair_offer', v_offer_id, NULL,
         v_offer || jsonb_build_object('device_model_id', v_new_model.id, 'id', v_offer_id));

      v_offers_count := v_offers_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object(
    'model_id',       v_new_model.id,
    'model_slug',     v_new_model.slug,
    'offers_created', v_offers_count
  );
END;
$$;


-- ── 3. Archivage d'un modèle et de toutes ses offres ─────────────────────────

CREATE OR REPLACE FUNCTION public.admin_archive_device_model(
  p_model_id            uuid,
  p_expected_updated_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id     uuid;
  v_old_model     public.device_models;
  v_new_model     public.device_models;
  v_offers_count  integer;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'auth_required: Authentification requise.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_caller_id AND active = true AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis pour archiver un modèle.';
  END IF;

  SELECT * INTO v_old_model FROM public.device_models WHERE id = p_model_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found: Modèle introuvable.';
  END IF;
  IF v_old_model.status = 'archived' THEN
    RAISE EXCEPTION 'conflict: Ce modèle est déjà archivé.';
  END IF;

  -- Archiver le modèle (contrôle de concurrence)
  UPDATE public.device_models
  SET status = 'archived'
  WHERE id = p_model_id AND updated_at = p_expected_updated_at
  RETURNING * INTO v_new_model;

  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.device_models WHERE id = p_model_id) THEN
      RAISE EXCEPTION 'conflict: Ce modèle a été modifié par un autre utilisateur. Rechargez la page.';
    ELSE
      RAISE EXCEPTION 'not_found: Modèle introuvable après archivage.';
    END IF;
  END IF;

  -- Archiver toutes ses offres
  UPDATE public.repair_offers
  SET status = 'archived'
  WHERE device_model_id = p_model_id AND status != 'archived';

  GET DIAGNOSTICS v_offers_count = ROW_COUNT;

  -- Journaux
  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'archive', 'device_model', v_old_model.id,
     to_jsonb(v_old_model), to_jsonb(v_new_model));

  RETURN jsonb_build_object('model_id', v_old_model.id, 'offers_archived', v_offers_count);
END;
$$;


-- =============================================================================
-- Permissions
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.admin_bulk_update_model_offers(uuid, jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_bulk_update_model_offers(uuid, jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_bulk_update_model_offers(uuid, jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_create_device_model_with_offers(uuid,uuid,text,text,text,text,text,integer,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_device_model_with_offers(uuid,uuid,text,text,text,text,text,integer,jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_create_device_model_with_offers(uuid,uuid,text,text,text,text,text,integer,jsonb) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_archive_device_model(uuid, timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_archive_device_model(uuid, timestamptz) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_archive_device_model(uuid, timestamptz) TO authenticated;


-- =============================================================================
-- Vérifications post-migration (non destructives)
-- =============================================================================
--
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--     AND routine_name IN (
--       'admin_bulk_update_model_offers',
--       'admin_create_device_model_with_offers',
--       'admin_archive_device_model'
--     );
--
--   SELECT COUNT(*) FROM public.device_models;   -- inchangé
--   SELECT COUNT(*) FROM public.repair_offers;   -- inchangé
-- =============================================================================
