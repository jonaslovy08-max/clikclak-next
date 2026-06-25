-- =============================================================================
-- Migration 005 — Création atomique famille + modèle + offres
-- =============================================================================
-- admin_create_family_and_model_with_offers :
--   Crée une nouvelle famille, son premier modèle et ses offres initiales
--   dans une seule transaction. En cas d'erreur partielle, rien n'est persisté.
--
-- SECURITY DEFINER : requis pour admin_activity_logs (pas de policy INSERT
-- authenticated). Les contrôles d'autorisation sont internes.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.admin_create_family_and_model_with_offers(
  -- Nouvelle famille
  p_brand_id              uuid,
  p_family_name           text,
  p_family_internal_key   text,
  p_family_short_label    text,
  p_family_button_prefix  text,
  p_family_status         text,
  p_family_sort_order     integer,
  -- Modèle
  p_category_id           uuid,
  p_model_internal_key    text,
  p_model_name            text,
  p_model_slug            text,
  p_model_legacy_slug     text,
  p_model_status          text,
  p_model_sort_order      integer,
  -- Offres initiales (tableau vide = aucune offre)
  p_offers                jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id    uuid;
  v_new_family   public.device_families;
  v_new_model    public.device_models;
  v_offer        jsonb;
  v_offer_id     uuid;
  v_offers_count integer := 0;
  v_i            integer;
BEGIN
  -- ── Authentification + rôle ──────────────────────────────────────────────
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

  -- ── Validation : marque ───────────────────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE id = p_brand_id) THEN
    RAISE EXCEPTION 'validation:brand_id: Marque introuvable.';
  END IF;

  -- ── Validation : famille ──────────────────────────────────────────────────
  IF p_family_name IS NULL OR trim(p_family_name) = '' THEN
    RAISE EXCEPTION 'validation:family_name: Le nom de la famille est obligatoire.';
  END IF;
  IF p_family_internal_key IS NULL OR p_family_internal_key !~ '^[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'validation:family_internal_key: Format invalide (ex: iphone-18).';
  END IF;
  IF p_family_short_label IS NULL OR trim(p_family_short_label) = '' THEN
    RAISE EXCEPTION 'validation:family_short_label: Le libellé court est obligatoire.';
  END IF;
  IF p_family_status NOT IN ('active', 'inactive', 'archived') THEN
    RAISE EXCEPTION 'validation:family_status: Statut invalide.';
  END IF;

  -- Unicité famille dans la marque
  IF EXISTS (
    SELECT 1 FROM public.device_families
    WHERE brand_id = p_brand_id AND internal_key = trim(p_family_internal_key)
  ) THEN
    RAISE EXCEPTION 'conflict:family_internal_key: Cette clé de famille existe déjà pour cette marque : "%".', p_family_internal_key;
  END IF;
  IF EXISTS (
    SELECT 1 FROM public.device_families
    WHERE brand_id = p_brand_id AND name = trim(p_family_name)
  ) THEN
    RAISE EXCEPTION 'conflict:family_name: Une famille avec ce nom existe déjà pour cette marque : "%".', p_family_name;
  END IF;

  -- ── Validation : modèle ───────────────────────────────────────────────────
  IF p_model_name IS NULL OR trim(p_model_name) = '' THEN
    RAISE EXCEPTION 'validation:model_name: Le nom du modèle est obligatoire.';
  END IF;
  IF p_model_internal_key IS NULL OR p_model_internal_key !~ '^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'validation:model_internal_key: Format invalide (ex: iphone:iphone-18).';
  END IF;
  IF p_model_slug IS NULL OR p_model_slug !~ '^[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'validation:model_slug: Format invalide.';
  END IF;
  IF p_model_status NOT IN ('active', 'inactive', 'archived') THEN
    RAISE EXCEPTION 'validation:model_status: Statut invalide.';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.device_categories WHERE id = p_category_id) THEN
    RAISE EXCEPTION 'validation:category_id: Catégorie introuvable.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE internal_key = p_model_internal_key) THEN
    RAISE EXCEPTION 'conflict:model_internal_key: Cette clé de modèle est déjà utilisée : "%".', p_model_internal_key;
  END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE slug = p_model_slug) THEN
    RAISE EXCEPTION 'conflict:model_slug: Ce slug est déjà utilisé : "%".', p_model_slug;
  END IF;

  -- ── Validation des offres ─────────────────────────────────────────────────
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

  -- ── Création de la famille ────────────────────────────────────────────────
  INSERT INTO public.device_families (
    brand_id, internal_key, name, short_label, button_prefix, status, sort_order
  ) VALUES (
    p_brand_id,
    trim(p_family_internal_key),
    trim(p_family_name),
    trim(p_family_short_label),
    nullif(trim(coalesce(p_family_button_prefix, '')), ''),
    p_family_status,
    p_family_sort_order
  )
  RETURNING * INTO v_new_family;

  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'create', 'device_family', v_new_family.id, NULL, to_jsonb(v_new_family));

  -- ── Création du modèle ────────────────────────────────────────────────────
  INSERT INTO public.device_models (
    family_id, category_id, internal_key, name, slug, legacy_slug, status, sort_order
  ) VALUES (
    v_new_family.id, p_category_id,
    trim(p_model_internal_key), trim(p_model_name), trim(p_model_slug),
    coalesce(nullif(trim(coalesce(p_model_legacy_slug, '')), ''), trim(p_model_slug)),
    p_model_status, p_model_sort_order
  )
  RETURNING * INTO v_new_model;

  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'create', 'device_model', v_new_model.id, NULL, to_jsonb(v_new_model));

  -- ── Création des offres ───────────────────────────────────────────────────
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
    'family_id',      v_new_family.id,
    'model_id',       v_new_model.id,
    'model_slug',     v_new_model.slug,
    'offers_created', v_offers_count
  );
END;
$$;


-- =============================================================================
-- Permissions
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.admin_create_family_and_model_with_offers(uuid,text,text,text,text,text,integer,uuid,text,text,text,text,text,integer,jsonb) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_family_and_model_with_offers(uuid,text,text,text,text,text,integer,uuid,text,text,text,text,text,integer,jsonb) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_create_family_and_model_with_offers(uuid,text,text,text,text,text,integer,uuid,text,text,text,text,text,integer,jsonb) TO authenticated;


-- =============================================================================
-- Vérifications post-migration (non destructives)
-- =============================================================================
--
--   SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public'
--     AND routine_name = 'admin_create_family_and_model_with_offers';
--
--   SELECT COUNT(*) FROM public.device_families;  -- inchangé
--   SELECT COUNT(*) FROM public.device_models;    -- inchangé
-- =============================================================================
