-- =================================================================
-- Migration 013 — admin_bulk_update_model_offers : retour timestamps
-- =================================================================
-- La réponse inclut désormais un tableau "offers" contenant, pour
-- chaque offre traitée, les champs nécessaires à la resynchronisation
-- de expected_updated_at côté client (sans rechargement de page).
--
-- Champs retournés par offre :
--   offer_id       — UUID de l'offre (nouvelle ou existante)
--   updated_at     — timestamp PostgreSQL après INSERT/UPDATE
--   is_new         — true si créée, false si mise à jour
--   repair_type_id — présent uniquement pour les nouvelles offres
--   variant_key    — présent uniquement pour les nouvelles offres
-- =================================================================

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
  v_caller_id        uuid;
  v_i                integer;
  v_offer            jsonb;
  v_offer_id         uuid;
  v_updated_at       timestamptz;
  v_old_offer        public.repair_offers;
  v_new_id           uuid;
  v_new_updated_at   timestamptz;
  v_offer_updated_at timestamptz;
  v_updated          integer := 0;
  v_created          integer := 0;
  v_saved_offers     jsonb   := '[]'::jsonb;
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
    IF (v_offer->>'availability') = 'unavailable' AND (v_offer->>'price_cents') IS NOT NULL THEN
      RAISE EXCEPTION 'validation:offers[%]: Pas de prix pour une offre indisponible.', v_i;
    END IF;
    IF (v_offer->>'availability') = 'unavailable'
       AND ((v_offer->>'public_note') IS NULL OR trim(v_offer->>'public_note') = '')
    THEN
      RAISE EXCEPTION 'validation:offers[%]: Note publique obligatoire pour une offre indisponible.', v_i;
    END IF;
    IF (v_offer->>'status') NOT IN ('active', 'inactive', 'archived') THEN
      RAISE EXCEPTION 'validation:offers[%]: status invalide.', v_i;
    END IF;

    v_offer_id := CASE WHEN (v_offer->>'offer_id') IS NULL THEN NULL
                       ELSE (v_offer->>'offer_id')::uuid END;

    IF v_offer_id IS NULL THEN
      -- ── Création d'une nouvelle offre ──────────────────────────────────────

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
      RETURNING id, updated_at INTO v_new_id, v_new_updated_at;

      INSERT INTO public.admin_activity_logs
        (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES
        (v_caller_id, 'create', 'repair_offer', v_new_id, NULL,
         v_offer || jsonb_build_object('device_model_id', p_model_id, 'id', v_new_id));

      v_saved_offers := v_saved_offers || jsonb_build_array(
        jsonb_build_object(
          'offer_id',       v_new_id,
          'updated_at',     v_new_updated_at,
          'repair_type_id', v_offer->>'repair_type_id',
          'variant_key',    coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
          'is_new',         true
        )
      );

      v_created := v_created + 1;

    ELSE
      -- ── Mise à jour d'une offre existante ──────────────────────────────────

      SELECT * INTO v_old_offer FROM public.repair_offers WHERE id = v_offer_id;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'not_found:offers[%]: Offre introuvable (id: %).', v_i, v_offer_id;
      END IF;
      IF v_old_offer.device_model_id != p_model_id THEN
        RAISE EXCEPTION 'forbidden:offers[%]: Cette offre n''appartient pas à ce modèle.', v_i;
      END IF;

      v_updated_at := CASE WHEN (v_offer->>'expected_updated_at') IS NULL THEN NULL
                           ELSE (v_offer->>'expected_updated_at')::timestamptz END;

      UPDATE public.repair_offers
      SET
        variant_key      = coalesce(nullif(trim(coalesce(v_offer->>'variant_key', '')), ''), 'standard'),
        variant_name     = nullif(trim(coalesce(v_offer->>'variant_name', '')), ''),
        subtitle         = nullif(trim(coalesce(v_offer->>'subtitle', '')), ''),
        pricing_mode     = v_offer->>'pricing_mode',
        price_cents      = CASE WHEN (v_offer->>'price_cents') IS NULL THEN NULL
                                ELSE (v_offer->>'price_cents')::integer END,
        currency         = coalesce(nullif(v_offer->>'currency', ''), 'CHF'),
        availability     = coalesce(nullif(v_offer->>'availability', ''), 'available'),
        duration_minutes = CASE WHEN (v_offer->>'duration_minutes') IS NULL THEN NULL
                                ELSE (v_offer->>'duration_minutes')::integer END,
        warranty_months  = CASE WHEN (v_offer->>'warranty_months') IS NULL THEN NULL
                                ELSE (v_offer->>'warranty_months')::integer END,
        public_note      = nullif(trim(coalesce(v_offer->>'public_note', '')), ''),
        internal_note    = nullif(trim(coalesce(v_offer->>'internal_note', '')), ''),
        status           = coalesce(nullif(v_offer->>'status', ''), 'active'),
        sort_order       = coalesce((v_offer->>'sort_order')::integer, v_old_offer.sort_order)
      WHERE id = v_offer_id
        AND (v_updated_at IS NULL OR updated_at = v_updated_at)
      RETURNING updated_at INTO v_offer_updated_at;

      IF NOT FOUND THEN
        IF EXISTS (SELECT 1 FROM public.repair_offers WHERE id = v_offer_id) THEN
          RAISE EXCEPTION 'conflict:offers[%]: Cette offre a été modifiée par un autre utilisateur. Rechargez la page.', v_i;
        ELSE
          RAISE EXCEPTION 'not_found:offers[%]: Offre introuvable après mise à jour.', v_i;
        END IF;
      END IF;

      INSERT INTO public.admin_activity_logs
        (admin_user_id, action, entity_type, entity_id, old_values, new_values)
      VALUES
        (v_caller_id, 'update', 'repair_offer', v_offer_id,
         to_jsonb(v_old_offer),
         v_offer || jsonb_build_object('device_model_id', p_model_id));

      v_saved_offers := v_saved_offers || jsonb_build_array(
        jsonb_build_object(
          'offer_id',   v_offer_id,
          'updated_at', v_offer_updated_at,
          'is_new',     false
        )
      );

      v_updated := v_updated + 1;
    END IF;
  END LOOP;

  RETURN jsonb_build_object(
    'updated', v_updated,
    'created', v_created,
    'offers',  v_saved_offers
  );
END;
$$;
