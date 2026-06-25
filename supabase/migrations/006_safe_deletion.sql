-- =============================================================================
-- Migration 006 — Provenance des données et suppression sûre
-- =============================================================================
-- 1. Ajout de colonnes de provenance et synchronisation
-- 2. Mise à jour des RPC existantes pour origin='admin'
-- 3. admin_delete_repair_offer — suppression sécurisée d'une réparation
-- 4. admin_delete_device_model — suppression sécurisée d'un modèle
-- =============================================================================


-- ── 1. Colonnes de provenance ────────────────────────────────────────────────
-- origin : distingue les données du catalogue initial des données admin
-- public_synced_at : moment où la donnée a été publiée sur le site public (null = jamais)
-- Les données existantes (212 modèles, 1308 offres) restent origin='import'

ALTER TABLE public.device_families
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'import'
    CHECK (origin IN ('import', 'admin'));

ALTER TABLE public.device_models
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'import'
    CHECK (origin IN ('import', 'admin')),
  ADD COLUMN IF NOT EXISTS public_synced_at timestamptz NULL;

ALTER TABLE public.repair_offers
  ADD COLUMN IF NOT EXISTS origin text NOT NULL DEFAULT 'import'
    CHECK (origin IN ('import', 'admin')),
  ADD COLUMN IF NOT EXISTS public_synced_at timestamptz NULL;


-- ── 2. Mise à jour des RPC existantes — origin='admin' sur les nouvelles données
-- admin_bulk_update_model_offers : les nouvelles offres créées via l'admin reçoivent origin='admin'
-- admin_create_device_model_with_offers : même principe
-- admin_create_family_and_model_with_offers : même principe

CREATE OR REPLACE FUNCTION public.admin_bulk_update_model_offers(
  p_model_id uuid,
  p_offers   jsonb
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
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN RAISE EXCEPTION 'auth_required: Authentification requise.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = v_caller_id AND active = true AND role = 'admin') THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE id = p_model_id) THEN
    RAISE EXCEPTION 'not_found: Modèle introuvable.';
  END IF;
  IF p_offers IS NULL OR jsonb_typeof(p_offers) != 'array' THEN
    RAISE EXCEPTION 'validation:offers: Tableau d''offres attendu.';
  END IF;

  FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
    v_offer := p_offers->v_i;
    IF (v_offer->>'pricing_mode') NOT IN ('fixed', 'on_request', 'quote') THEN RAISE EXCEPTION 'validation:offers[%]: pricing_mode invalide.', v_i; END IF;
    IF (v_offer->>'pricing_mode') = 'fixed' AND (v_offer->>'price_cents') IS NULL THEN RAISE EXCEPTION 'validation:offers[%]: Prix obligatoire pour le mode fixed.', v_i; END IF;
    IF (v_offer->>'pricing_mode') IN ('on_request', 'quote') AND (v_offer->>'price_cents') IS NOT NULL THEN RAISE EXCEPTION 'validation:offers[%]: Prix doit être null pour on_request/quote.', v_i; END IF;
    IF (v_offer->>'availability') NOT IN ('available', 'on_request', 'unavailable') THEN RAISE EXCEPTION 'validation:offers[%]: availability invalide.', v_i; END IF;
    IF (v_offer->>'availability') = 'unavailable' AND (v_offer->>'price_cents') IS NOT NULL THEN RAISE EXCEPTION 'validation:offers[%]: Pas de prix pour une offre indisponible.', v_i; END IF;
    IF (v_offer->>'availability') = 'unavailable' AND ((v_offer->>'public_note') IS NULL OR trim(v_offer->>'public_note') = '') THEN RAISE EXCEPTION 'validation:offers[%]: Note publique obligatoire pour une offre indisponible.', v_i; END IF;
    IF (v_offer->>'status') NOT IN ('active', 'inactive', 'archived') THEN RAISE EXCEPTION 'validation:offers[%]: status invalide.', v_i; END IF;

    v_offer_id := CASE WHEN (v_offer->>'offer_id') IS NULL THEN NULL ELSE (v_offer->>'offer_id')::uuid END;

    IF v_offer_id IS NULL THEN
      IF NOT EXISTS (SELECT 1 FROM public.repair_types WHERE id = (v_offer->>'repair_type_id')::uuid) THEN
        RAISE EXCEPTION 'validation:offers[%]: Type de réparation introuvable.', v_i;
      END IF;
      INSERT INTO public.repair_offers (
        device_model_id, repair_type_id, variant_key, variant_name, subtitle,
        pricing_mode, price_cents, currency, availability, duration_minutes, warranty_months,
        public_note, internal_note, status, sort_order, origin
      ) VALUES (
        p_model_id, (v_offer->>'repair_type_id')::uuid,
        coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        v_offer->>'pricing_mode',
        CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL ELSE (v_offer->>'price_cents')::integer END,
        coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        coalesce(nullif(v_offer->>'availability', ''), 'available'),
        CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL ELSE (v_offer->>'duration_minutes')::integer END,
        CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL ELSE (v_offer->>'warranty_months')::integer END,
        nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        coalesce(nullif(v_offer->>'status', ''), 'inactive'),
        coalesce((v_offer->>'sort_order')::integer, v_created + v_updated),
        'admin'   -- toute nouvelle offre créée via l'admin
      ) RETURNING id INTO v_new_id;
      INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES (v_caller_id, 'create', 'repair_offer', v_new_id, NULL, v_offer || jsonb_build_object('device_model_id', p_model_id, 'id', v_new_id, 'origin', 'admin'));
      v_created := v_created + 1;
    ELSE
      SELECT * INTO v_old_offer FROM public.repair_offers WHERE id = v_offer_id;
      IF NOT FOUND THEN RAISE EXCEPTION 'not_found:offers[%]: Offre introuvable (id: %).', v_i, v_offer_id; END IF;
      IF v_old_offer.device_model_id != p_model_id THEN RAISE EXCEPTION 'forbidden:offers[%]: Cette offre n''appartient pas à ce modèle.', v_i; END IF;
      v_updated_at := CASE WHEN (v_offer->>'expected_updated_at') IS NULL THEN NULL ELSE (v_offer->>'expected_updated_at')::timestamptz END;
      UPDATE public.repair_offers SET
        variant_key = coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        variant_name = nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        subtitle = nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        pricing_mode = v_offer->>'pricing_mode',
        price_cents = CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL ELSE (v_offer->>'price_cents')::integer END,
        currency = coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        availability = coalesce(nullif(v_offer->>'availability', ''), 'available'),
        duration_minutes = CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL ELSE (v_offer->>'duration_minutes')::integer END,
        warranty_months = CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL ELSE (v_offer->>'warranty_months')::integer END,
        public_note = nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        internal_note = nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        status = coalesce(nullif(v_offer->>'status', ''), 'active'),
        sort_order = coalesce((v_offer->>'sort_order')::integer, v_old_offer.sort_order)
      WHERE id = v_offer_id AND (v_updated_at IS NULL OR updated_at = v_updated_at);
      IF NOT FOUND THEN
        IF EXISTS (SELECT 1 FROM public.repair_offers WHERE id = v_offer_id) THEN RAISE EXCEPTION 'conflict:offers[%]: Cette offre a été modifiée par un autre utilisateur. Rechargez la page.', v_i;
        ELSE RAISE EXCEPTION 'not_found:offers[%]: Offre introuvable après mise à jour.', v_i; END IF;
      END IF;
      INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES (v_caller_id, 'update', 'repair_offer', v_offer_id, to_jsonb(v_old_offer), v_offer || jsonb_build_object('device_model_id', p_model_id));
      v_updated := v_updated + 1;
    END IF;
  END LOOP;
  RETURN jsonb_build_object('updated', v_updated, 'created', v_created);
END;
$$;


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
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN RAISE EXCEPTION 'auth_required: Authentification requise.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = v_caller_id AND active = true AND role = 'admin') THEN RAISE EXCEPTION 'forbidden: Rôle admin actif requis.'; END IF;
  IF p_name IS NULL OR trim(p_name) = '' THEN RAISE EXCEPTION 'validation:name: Le nom public est obligatoire.'; END IF;
  IF p_internal_key IS NULL OR p_internal_key !~ '^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$' THEN RAISE EXCEPTION 'validation:internal_key: Format invalide.'; END IF;
  IF p_slug IS NULL OR p_slug !~ '^[a-z0-9][a-z0-9-]*$' THEN RAISE EXCEPTION 'validation:slug: Format invalide.'; END IF;
  IF p_status NOT IN ('active', 'inactive', 'archived') THEN RAISE EXCEPTION 'validation:status: Statut invalide.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.device_families WHERE id = p_family_id) THEN RAISE EXCEPTION 'validation:family_id: Famille introuvable.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.device_categories WHERE id = p_category_id) THEN RAISE EXCEPTION 'validation:category_id: Catégorie introuvable.'; END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE internal_key = p_internal_key) THEN RAISE EXCEPTION 'conflict:internal_key: Cette clé interne est déjà utilisée : "%".', p_internal_key; END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE slug = p_slug) THEN RAISE EXCEPTION 'conflict:slug: Ce slug est déjà utilisé : "%".', p_slug; END IF;

  IF p_offers IS NOT NULL AND jsonb_typeof(p_offers) = 'array' THEN
    FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
      v_offer := p_offers->v_i;
      IF NOT EXISTS (SELECT 1 FROM public.repair_types WHERE id = (v_offer->>'repair_type_id')::uuid) THEN RAISE EXCEPTION 'validation:offers[%]: Type de réparation introuvable.', v_i; END IF;
      IF (v_offer->>'pricing_mode') NOT IN ('fixed', 'on_request', 'quote') THEN RAISE EXCEPTION 'validation:offers[%]: pricing_mode invalide.', v_i; END IF;
      IF (v_offer->>'pricing_mode') = 'fixed' AND (v_offer->>'price_cents') IS NULL THEN RAISE EXCEPTION 'validation:offers[%]: Prix obligatoire pour le mode fixed.', v_i; END IF;
      IF (v_offer->>'pricing_mode') IN ('on_request', 'quote') AND (v_offer->>'price_cents') IS NOT NULL THEN RAISE EXCEPTION 'validation:offers[%]: Prix doit être null.', v_i; END IF;
      IF (v_offer->>'availability') NOT IN ('available', 'on_request', 'unavailable') THEN RAISE EXCEPTION 'validation:offers[%]: availability invalide.', v_i; END IF;
      IF (v_offer->>'availability') = 'unavailable' AND ((v_offer->>'public_note') IS NULL OR trim(v_offer->>'public_note') = '') THEN RAISE EXCEPTION 'validation:offers[%]: Note publique obligatoire.', v_i; END IF;
    END LOOP;
  END IF;

  INSERT INTO public.device_models (family_id, category_id, internal_key, name, slug, legacy_slug, status, sort_order, origin)
  VALUES (p_family_id, p_category_id, trim(p_internal_key), trim(p_name), trim(p_slug),
    coalesce(nullif(trim(coalesce(p_legacy_slug, '')), ''), trim(p_slug)), p_status, p_sort_order, 'admin')
  RETURNING * INTO v_new_model;
  INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_caller_id, 'create', 'device_model', v_new_model.id, NULL, to_jsonb(v_new_model));

  IF p_offers IS NOT NULL AND jsonb_typeof(p_offers) = 'array' AND jsonb_array_length(p_offers) > 0 THEN
    FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
      v_offer := p_offers->v_i;
      INSERT INTO public.repair_offers (
        device_model_id, repair_type_id, variant_key, variant_name, subtitle,
        pricing_mode, price_cents, currency, availability, duration_minutes, warranty_months,
        public_note, internal_note, status, sort_order, origin
      ) VALUES (
        v_new_model.id, (v_offer->>'repair_type_id')::uuid,
        coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        v_offer->>'pricing_mode',
        CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL ELSE (v_offer->>'price_cents')::integer END,
        coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        coalesce(nullif(v_offer->>'availability', ''), 'available'),
        CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL ELSE (v_offer->>'duration_minutes')::integer END,
        CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL ELSE (v_offer->>'warranty_months')::integer END,
        nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        coalesce(nullif(v_offer->>'status', ''), 'inactive'), coalesce((v_offer->>'sort_order')::integer, v_i),
        'admin'
      ) RETURNING id INTO v_offer_id;
      INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES (v_caller_id, 'create', 'repair_offer', v_offer_id, NULL, v_offer || jsonb_build_object('device_model_id', v_new_model.id, 'id', v_offer_id, 'origin', 'admin'));
      v_offers_count := v_offers_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('model_id', v_new_model.id, 'model_slug', v_new_model.slug, 'offers_created', v_offers_count);
END;
$$;


CREATE OR REPLACE FUNCTION public.admin_create_family_and_model_with_offers(
  p_brand_id              uuid,
  p_family_name           text,
  p_family_internal_key   text,
  p_family_short_label    text,
  p_family_button_prefix  text,
  p_family_status         text,
  p_family_sort_order     integer,
  p_category_id           uuid,
  p_model_internal_key    text,
  p_model_name            text,
  p_model_slug            text,
  p_model_legacy_slug     text,
  p_model_status          text,
  p_model_sort_order      integer,
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
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN RAISE EXCEPTION 'auth_required: Authentification requise.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = v_caller_id AND active = true AND role = 'admin') THEN RAISE EXCEPTION 'forbidden: Rôle admin actif requis.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.brands WHERE id = p_brand_id) THEN RAISE EXCEPTION 'validation:brand_id: Marque introuvable.'; END IF;
  IF p_family_name IS NULL OR trim(p_family_name) = '' THEN RAISE EXCEPTION 'validation:family_name: Le nom de la famille est obligatoire.'; END IF;
  IF p_family_internal_key IS NULL OR p_family_internal_key !~ '^[a-z0-9][a-z0-9-]*$' THEN RAISE EXCEPTION 'validation:family_internal_key: Format invalide.'; END IF;
  IF p_family_short_label IS NULL OR trim(p_family_short_label) = '' THEN RAISE EXCEPTION 'validation:family_short_label: Le libellé court est obligatoire.'; END IF;
  IF p_family_status NOT IN ('active', 'inactive', 'archived') THEN RAISE EXCEPTION 'validation:family_status: Statut invalide.'; END IF;
  IF EXISTS (SELECT 1 FROM public.device_families WHERE brand_id = p_brand_id AND internal_key = trim(p_family_internal_key)) THEN RAISE EXCEPTION 'conflict:family_internal_key: Cette clé de famille existe déjà : "%".', p_family_internal_key; END IF;
  IF EXISTS (SELECT 1 FROM public.device_families WHERE brand_id = p_brand_id AND name = trim(p_family_name)) THEN RAISE EXCEPTION 'conflict:family_name: Une famille avec ce nom existe déjà : "%".', p_family_name; END IF;
  IF p_model_name IS NULL OR trim(p_model_name) = '' THEN RAISE EXCEPTION 'validation:model_name: Le nom du modèle est obligatoire.'; END IF;
  IF p_model_internal_key IS NULL OR p_model_internal_key !~ '^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$' THEN RAISE EXCEPTION 'validation:model_internal_key: Format invalide.'; END IF;
  IF p_model_slug IS NULL OR p_model_slug !~ '^[a-z0-9][a-z0-9-]*$' THEN RAISE EXCEPTION 'validation:model_slug: Format invalide.'; END IF;
  IF p_model_status NOT IN ('active', 'inactive', 'archived') THEN RAISE EXCEPTION 'validation:model_status: Statut invalide.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.device_categories WHERE id = p_category_id) THEN RAISE EXCEPTION 'validation:category_id: Catégorie introuvable.'; END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE internal_key = p_model_internal_key) THEN RAISE EXCEPTION 'conflict:model_internal_key: Cette clé de modèle est déjà utilisée : "%".', p_model_internal_key; END IF;
  IF EXISTS (SELECT 1 FROM public.device_models WHERE slug = p_model_slug) THEN RAISE EXCEPTION 'conflict:model_slug: Ce slug est déjà utilisé : "%".', p_model_slug; END IF;

  IF p_offers IS NOT NULL AND jsonb_typeof(p_offers) = 'array' THEN
    FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
      v_offer := p_offers->v_i;
      IF NOT EXISTS (SELECT 1 FROM public.repair_types WHERE id = (v_offer->>'repair_type_id')::uuid) THEN RAISE EXCEPTION 'validation:offers[%]: Type de réparation introuvable.', v_i; END IF;
      IF (v_offer->>'pricing_mode') NOT IN ('fixed', 'on_request', 'quote') THEN RAISE EXCEPTION 'validation:offers[%]: pricing_mode invalide.', v_i; END IF;
      IF (v_offer->>'pricing_mode') = 'fixed' AND (v_offer->>'price_cents') IS NULL THEN RAISE EXCEPTION 'validation:offers[%]: Prix obligatoire pour le mode fixed.', v_i; END IF;
      IF (v_offer->>'pricing_mode') IN ('on_request', 'quote') AND (v_offer->>'price_cents') IS NOT NULL THEN RAISE EXCEPTION 'validation:offers[%]: Prix doit être null.', v_i; END IF;
      IF (v_offer->>'availability') NOT IN ('available', 'on_request', 'unavailable') THEN RAISE EXCEPTION 'validation:offers[%]: availability invalide.', v_i; END IF;
      IF (v_offer->>'availability') = 'unavailable' AND ((v_offer->>'public_note') IS NULL OR trim(v_offer->>'public_note') = '') THEN RAISE EXCEPTION 'validation:offers[%]: Note publique obligatoire.', v_i; END IF;
    END LOOP;
  END IF;

  INSERT INTO public.device_families (brand_id, internal_key, name, short_label, button_prefix, status, sort_order, origin)
  VALUES (p_brand_id, trim(p_family_internal_key), trim(p_family_name), trim(p_family_short_label),
    nullif(trim(coalesce(p_family_button_prefix, '')), ''), p_family_status, p_family_sort_order, 'admin')
  RETURNING * INTO v_new_family;
  INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_caller_id, 'create', 'device_family', v_new_family.id, NULL, to_jsonb(v_new_family));

  INSERT INTO public.device_models (family_id, category_id, internal_key, name, slug, legacy_slug, status, sort_order, origin)
  VALUES (v_new_family.id, p_category_id, trim(p_model_internal_key), trim(p_model_name), trim(p_model_slug),
    coalesce(nullif(trim(coalesce(p_model_legacy_slug, '')), ''), trim(p_model_slug)), p_model_status, p_model_sort_order, 'admin')
  RETURNING * INTO v_new_model;
  INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_caller_id, 'create', 'device_model', v_new_model.id, NULL, to_jsonb(v_new_model));

  IF p_offers IS NOT NULL AND jsonb_typeof(p_offers) = 'array' AND jsonb_array_length(p_offers) > 0 THEN
    FOR v_i IN 0..jsonb_array_length(p_offers) - 1 LOOP
      v_offer := p_offers->v_i;
      INSERT INTO public.repair_offers (
        device_model_id, repair_type_id, variant_key, variant_name, subtitle,
        pricing_mode, price_cents, currency, availability, duration_minutes, warranty_months,
        public_note, internal_note, status, sort_order, origin
      ) VALUES (
        v_new_model.id, (v_offer->>'repair_type_id')::uuid,
        coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        nullif(trim(coalesce(v_offer->>'variant_name', '')), ''), nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        v_offer->>'pricing_mode',
        CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL ELSE (v_offer->>'price_cents')::integer END,
        coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        coalesce(nullif(v_offer->>'availability', ''), 'available'),
        CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL ELSE (v_offer->>'duration_minutes')::integer END,
        CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL ELSE (v_offer->>'warranty_months')::integer END,
        nullif(trim(coalesce(v_offer->>'public_note', '')), ''), nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        coalesce(nullif(v_offer->>'status', ''), 'inactive'), coalesce((v_offer->>'sort_order')::integer, v_i),
        'admin'
      ) RETURNING id INTO v_offer_id;
      INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES (v_caller_id, 'create', 'repair_offer', v_offer_id, NULL, v_offer || jsonb_build_object('device_model_id', v_new_model.id, 'id', v_offer_id, 'origin', 'admin'));
      v_offers_count := v_offers_count + 1;
    END LOOP;
  END IF;

  RETURN jsonb_build_object('family_id', v_new_family.id, 'model_id', v_new_model.id, 'model_slug', v_new_model.slug, 'offers_created', v_offers_count);
END;
$$;


-- ── 3. Suppression sécurisée d'une réparation ────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_delete_repair_offer(
  p_offer_id            uuid,
  p_expected_updated_at timestamptz,
  p_confirmation        text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id uuid;
  v_offer     public.repair_offers;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN RAISE EXCEPTION 'auth_required: Authentification requise.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = v_caller_id AND active = true AND role = 'admin') THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis.';
  END IF;

  IF p_confirmation IS DISTINCT FROM 'SUPPRIMER' THEN
    RAISE EXCEPTION 'confirmation_required: Saisissez exactement SUPPRIMER pour confirmer.';
  END IF;

  SELECT * INTO v_offer FROM public.repair_offers WHERE id = p_offer_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found: Réparation introuvable.'; END IF;

  IF v_offer.origin != 'admin' THEN
    RAISE EXCEPTION 'forbidden_import: Cette réparation provient du catalogue initial. Elle peut être archivée, mais pas supprimée définitivement.';
  END IF;

  IF v_offer.public_synced_at IS NOT NULL THEN
    RAISE EXCEPTION 'synced: Cette réparation a été publiée. Elle ne peut pas être supprimée définitivement.';
  END IF;

  IF v_offer.status NOT IN ('inactive', 'archived') THEN
    RAISE EXCEPTION 'status_error: Archivez d''abord cette réparation avant de pouvoir la supprimer définitivement.';
  END IF;

  IF v_offer.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'conflict: Cette réparation a été modifiée par un autre utilisateur. Rechargez la page.';
  END IF;

  INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_caller_id, 'delete', 'repair_offer', v_offer.id, to_jsonb(v_offer), NULL);

  DELETE FROM public.repair_offers WHERE id = p_offer_id;

  RETURN jsonb_build_object('deleted', true, 'offer_id', p_offer_id);
END;
$$;


-- ── 4. Suppression sécurisée d'un modèle ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_delete_device_model(
  p_model_id             uuid,
  p_expected_updated_at  timestamptz,
  p_confirmation_name    text,
  p_delete_empty_family  boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id       uuid;
  v_model           public.device_models;
  v_offer           public.repair_offers;
  v_offers_deleted  integer := 0;
  v_family_deleted  boolean := false;
  v_family          public.device_families;
  v_remaining       integer;
BEGIN
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN RAISE EXCEPTION 'auth_required: Authentification requise.'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.admin_profiles WHERE id = v_caller_id AND active = true AND role = 'admin') THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis.';
  END IF;

  SELECT * INTO v_model FROM public.device_models WHERE id = p_model_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'not_found: Modèle introuvable.'; END IF;

  IF v_model.origin != 'admin' THEN
    RAISE EXCEPTION 'forbidden_import: Ce modèle provient du catalogue initial. Il peut être archivé, mais pas supprimé définitivement.';
  END IF;

  IF v_model.public_synced_at IS NOT NULL THEN
    RAISE EXCEPTION 'synced: Ce modèle a été publié. Il ne peut pas être supprimé définitivement.';
  END IF;

  IF v_model.status NOT IN ('inactive', 'archived') THEN
    RAISE EXCEPTION 'status_error: Le modèle doit être en brouillon ou archivé avant suppression définitive.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.model_slug_history WHERE device_model_id = p_model_id) THEN
    RAISE EXCEPTION 'has_history: Ce modèle a un historique de slugs. Il ne peut pas être supprimé définitivement.';
  END IF;

  IF EXISTS (SELECT 1 FROM public.repair_offers WHERE device_model_id = p_model_id AND origin != 'admin') THEN
    RAISE EXCEPTION 'offers_imported: Ce modèle contient des réparations du catalogue initial. Il ne peut pas être supprimé définitivement.';
  END IF;

  IF p_confirmation_name IS DISTINCT FROM v_model.name THEN
    RAISE EXCEPTION 'confirmation_mismatch: Le nom saisi ne correspond pas au nom du modèle.';
  END IF;

  IF v_model.updated_at IS DISTINCT FROM p_expected_updated_at THEN
    RAISE EXCEPTION 'conflict: Ce modèle a été modifié par un autre utilisateur. Rechargez la page.';
  END IF;

  -- Supprimer les offres
  FOR v_offer IN SELECT * FROM public.repair_offers WHERE device_model_id = p_model_id LOOP
    INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
    VALUES (v_caller_id, 'delete', 'repair_offer', v_offer.id, to_jsonb(v_offer), NULL);
    DELETE FROM public.repair_offers WHERE id = v_offer.id;
    v_offers_deleted := v_offers_deleted + 1;
  END LOOP;

  -- Supprimer le modèle
  INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES (v_caller_id, 'delete', 'device_model', v_model.id, to_jsonb(v_model), NULL);
  DELETE FROM public.device_models WHERE id = p_model_id;

  -- Supprimer la famille vide si demandé et éligible
  IF p_delete_empty_family THEN
    SELECT * INTO v_family FROM public.device_families WHERE id = v_model.family_id;
    IF FOUND AND v_family.origin = 'admin' THEN
      SELECT COUNT(*) INTO v_remaining FROM public.device_models WHERE family_id = v_model.family_id;
      IF v_remaining = 0 THEN
        INSERT INTO public.admin_activity_logs (admin_user_id, action, entity_type, entity_id, old_values, new_values)
        VALUES (v_caller_id, 'delete', 'device_family', v_family.id, to_jsonb(v_family), NULL);
        DELETE FROM public.device_families WHERE id = v_family.id;
        v_family_deleted := true;
      END IF;
    END IF;
  END IF;

  RETURN jsonb_build_object('deleted', true, 'model_id', p_model_id, 'offers_deleted', v_offers_deleted, 'family_deleted', v_family_deleted);
END;
$$;


-- =============================================================================
-- Permissions
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.admin_delete_repair_offer(uuid, timestamptz, text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_repair_offer(uuid, timestamptz, text) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_delete_repair_offer(uuid, timestamptz, text) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_delete_device_model(uuid, timestamptz, text, boolean) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_delete_device_model(uuid, timestamptz, text, boolean) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_delete_device_model(uuid, timestamptz, text, boolean) TO authenticated;


-- =============================================================================
-- Vérifications post-migration (non destructives)
-- =============================================================================
--
--   SELECT COUNT(*) FROM public.device_models;  -- doit rester 212
--   SELECT COUNT(*) FROM public.repair_offers;  -- doit rester 1308
--   SELECT COUNT(*) FROM public.device_models WHERE origin = 'import';  -- 212
--   SELECT COUNT(*) FROM public.repair_offers WHERE origin = 'import';  -- 1308
-- =============================================================================
