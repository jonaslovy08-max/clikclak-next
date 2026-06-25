-- =============================================================================
-- Migration 003 — Fonctions RPC de mutation des offres de réparation
-- =============================================================================
-- Ces fonctions permettent à un administrateur actif (role = 'admin') de créer,
-- modifier et archiver des offres de réparation de façon atomique, tout en
-- conservant un journal complet dans admin_activity_logs.
--
-- SECURITY DEFINER : requis car admin_activity_logs n'a pas de policy INSERT
-- pour le rôle authenticated (seulement SELECT). Les fonctions incluent leurs
-- propres contrôles d'autorisation (auth.uid() + admin role actif).
--
-- Permissions :
--   - REVOKE EXECUTE FROM PUBLIC / anon
--   - GRANT  EXECUTE TO authenticated
--   Le contrôle interne (role = 'admin') reste obligatoire malgré ce GRANT.
--
-- Idempotentes : CREATE OR REPLACE — ne modifie aucune donnée existante.
-- =============================================================================


-- ── 1. Création d'une offre ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_create_repair_offer(
  p_device_model_id   uuid,
  p_repair_type_id    uuid,
  p_variant_key       text,
  p_variant_name      text    DEFAULT NULL,
  p_subtitle          text    DEFAULT NULL,
  p_pricing_mode      text    DEFAULT 'fixed',
  p_price_cents       integer DEFAULT NULL,
  p_currency          text    DEFAULT 'CHF',
  p_availability      text    DEFAULT 'available',
  p_duration_minutes  integer DEFAULT NULL,
  p_warranty_months   integer DEFAULT NULL,
  p_public_note       text    DEFAULT NULL,
  p_internal_note     text    DEFAULT NULL,
  p_status            text    DEFAULT 'active',
  p_sort_order        integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id  uuid;
  v_new_offer  public.repair_offers;
BEGIN
  -- ── Identité de l'appelant ───────────────────────────────────────────────
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'auth_required: Authentification requise.';
  END IF;

  -- ── Contrôle du rôle admin actif ─────────────────────────────────────────
  -- Ne jamais faire confiance au rôle fourni par le client.
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_caller_id AND active = true AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis pour créer une offre.';
  END IF;

  -- ── Validation : variant_key ─────────────────────────────────────────────
  IF p_variant_key IS NULL OR length(trim(p_variant_key)) = 0 THEN
    RAISE EXCEPTION 'validation:variant_key: La clé de variante est obligatoire.';
  END IF;
  IF p_variant_key !~ '^[a-z0-9][a-z0-9-]*$' THEN
    RAISE EXCEPTION 'validation:variant_key: Minuscules, chiffres et tirets uniquement.';
  END IF;

  -- ── Validation : pricing_mode ────────────────────────────────────────────
  IF p_pricing_mode NOT IN ('fixed', 'on_request', 'quote') THEN
    RAISE EXCEPTION 'validation:pricing_mode: Valeur invalide (fixed | on_request | quote).';
  END IF;

  -- ── Validation : availability ────────────────────────────────────────────
  IF p_availability NOT IN ('available', 'on_request', 'unavailable') THEN
    RAISE EXCEPTION 'validation:availability: Valeur invalide (available | on_request | unavailable).';
  END IF;

  -- ── Validation : status ──────────────────────────────────────────────────
  IF p_status NOT IN ('active', 'inactive', 'archived') THEN
    RAISE EXCEPTION 'validation:status: Valeur invalide (active | inactive | archived).';
  END IF;

  -- ── Validation : currency ────────────────────────────────────────────────
  IF p_currency <> 'CHF' THEN
    RAISE EXCEPTION 'validation:currency: Seule la devise CHF est supportée.';
  END IF;

  -- ── Cohérence prix / mode tarifaire ─────────────────────────────────────
  IF p_pricing_mode = 'fixed' AND (p_price_cents IS NULL OR p_price_cents < 0) THEN
    RAISE EXCEPTION 'validation:price_cents: Prix >= 0 obligatoire pour le mode fixed.';
  END IF;
  IF p_pricing_mode IN ('on_request', 'quote') AND p_price_cents IS NOT NULL THEN
    RAISE EXCEPTION 'validation:price_cents: Le prix doit être null pour on_request ou quote.';
  END IF;

  -- ── Cohérence indisponibilité ────────────────────────────────────────────
  IF p_availability = 'unavailable' AND p_price_cents IS NOT NULL THEN
    RAISE EXCEPTION 'validation:price_cents: Une offre indisponible ne peut pas avoir de prix.';
  END IF;
  IF p_availability = 'unavailable' AND (p_public_note IS NULL OR trim(p_public_note) = '') THEN
    RAISE EXCEPTION 'validation:public_note: Note publique obligatoire pour une offre indisponible.';
  END IF;

  -- ── Durée / garantie ─────────────────────────────────────────────────────
  IF p_duration_minutes IS NOT NULL AND p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'validation:duration_minutes: La durée doit être un entier positif.';
  END IF;
  IF p_warranty_months IS NOT NULL AND p_warranty_months < 0 THEN
    RAISE EXCEPTION 'validation:warranty_months: La garantie doit être >= 0.';
  END IF;

  -- ── Vérification des références FK ──────────────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM public.device_models WHERE id = p_device_model_id) THEN
    RAISE EXCEPTION 'validation:device_model_id: Modèle introuvable.';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.repair_types WHERE id = p_repair_type_id) THEN
    RAISE EXCEPTION 'validation:repair_type_id: Type de réparation introuvable.';
  END IF;

  -- ── Unicité (device_model, repair_type, variant_key) ────────────────────
  IF EXISTS (
    SELECT 1 FROM public.repair_offers
    WHERE device_model_id = p_device_model_id
      AND repair_type_id  = p_repair_type_id
      AND variant_key     = trim(p_variant_key)
  ) THEN
    RAISE EXCEPTION 'conflict: Une offre avec cette variante existe déjà pour ce modèle et ce type.';
  END IF;

  -- ── Insertion ─────────────────────────────────────────────────────────────
  INSERT INTO public.repair_offers (
    device_model_id, repair_type_id,
    variant_key, variant_name, subtitle,
    pricing_mode, price_cents, currency,
    availability, duration_minutes, warranty_months,
    public_note, internal_note, status, sort_order
  ) VALUES (
    p_device_model_id, p_repair_type_id,
    trim(p_variant_key),
    NULLIF(trim(coalesce(p_variant_name,   '')), ''),
    NULLIF(trim(coalesce(p_subtitle,       '')), ''),
    p_pricing_mode,
    p_price_cents,
    p_currency,
    p_availability,
    p_duration_minutes,
    p_warranty_months,
    NULLIF(trim(coalesce(p_public_note,    '')), ''),
    NULLIF(trim(coalesce(p_internal_note,  '')), ''),
    p_status,
    p_sort_order
  )
  RETURNING * INTO v_new_offer;

  -- ── Journal (atomique avec l'insertion) ──────────────────────────────────
  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'create', 'repair_offer', v_new_offer.id, NULL, to_jsonb(v_new_offer));

  RETURN jsonb_build_object('id', v_new_offer.id);
END;
$$;


-- ── 2. Modification d'une offre ──────────────────────────────────────────────
-- device_model_id, repair_type_id et variant_key ne sont pas modifiables.
-- Contrôle de concurrence optimiste via expected_updated_at.

CREATE OR REPLACE FUNCTION public.admin_update_repair_offer(
  p_offer_id             uuid,
  p_expected_updated_at  timestamptz,
  p_variant_name         text    DEFAULT NULL,
  p_subtitle             text    DEFAULT NULL,
  p_pricing_mode         text    DEFAULT 'fixed',
  p_price_cents          integer DEFAULT NULL,
  p_currency             text    DEFAULT 'CHF',
  p_availability         text    DEFAULT 'available',
  p_duration_minutes     integer DEFAULT NULL,
  p_warranty_months      integer DEFAULT NULL,
  p_public_note          text    DEFAULT NULL,
  p_internal_note        text    DEFAULT NULL,
  p_status               text    DEFAULT 'active',
  p_sort_order           integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id  uuid;
  v_old_offer  public.repair_offers;
  v_new_offer  public.repair_offers;
BEGIN
  -- ── Identité + rôle ──────────────────────────────────────────────────────
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

  -- ── Lecture de l'état actuel (pour le journal) ───────────────────────────
  SELECT * INTO v_old_offer FROM public.repair_offers WHERE id = p_offer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found: Offre introuvable.';
  END IF;

  -- ── Validations ──────────────────────────────────────────────────────────
  IF p_pricing_mode NOT IN ('fixed', 'on_request', 'quote') THEN
    RAISE EXCEPTION 'validation:pricing_mode: Valeur invalide.';
  END IF;
  IF p_availability NOT IN ('available', 'on_request', 'unavailable') THEN
    RAISE EXCEPTION 'validation:availability: Valeur invalide.';
  END IF;
  IF p_status NOT IN ('active', 'inactive', 'archived') THEN
    RAISE EXCEPTION 'validation:status: Valeur invalide.';
  END IF;
  IF p_currency <> 'CHF' THEN
    RAISE EXCEPTION 'validation:currency: Seule la devise CHF est supportée.';
  END IF;

  -- Cohérence prix
  IF p_pricing_mode = 'fixed' AND (p_price_cents IS NULL OR p_price_cents < 0) THEN
    RAISE EXCEPTION 'validation:price_cents: Prix >= 0 obligatoire pour le mode fixed.';
  END IF;
  IF p_pricing_mode IN ('on_request', 'quote') AND p_price_cents IS NOT NULL THEN
    RAISE EXCEPTION 'validation:price_cents: Prix doit être null pour on_request ou quote.';
  END IF;

  -- Cohérence indisponibilité
  IF p_availability = 'unavailable' AND p_price_cents IS NOT NULL THEN
    RAISE EXCEPTION 'validation:price_cents: Pas de prix pour une offre indisponible.';
  END IF;
  IF p_availability = 'unavailable' AND (p_public_note IS NULL OR trim(p_public_note) = '') THEN
    RAISE EXCEPTION 'validation:public_note: Note publique obligatoire pour une offre indisponible.';
  END IF;

  -- Durée / garantie
  IF p_duration_minutes IS NOT NULL AND p_duration_minutes <= 0 THEN
    RAISE EXCEPTION 'validation:duration_minutes: Durée entière positive requise.';
  END IF;
  IF p_warranty_months IS NOT NULL AND p_warranty_months < 0 THEN
    RAISE EXCEPTION 'validation:warranty_months: Garantie >= 0 requise.';
  END IF;

  -- ── Mise à jour avec contrôle de concurrence ─────────────────────────────
  -- Le trigger set_updated_at met à jour automatiquement updated_at.
  -- La clause WHERE id = p_offer_id AND updated_at = p_expected_updated_at
  -- détecte les modifications concurrentes.
  UPDATE public.repair_offers
  SET
    variant_name       = NULLIF(trim(coalesce(p_variant_name,  '')), ''),
    subtitle           = NULLIF(trim(coalesce(p_subtitle,      '')), ''),
    pricing_mode       = p_pricing_mode,
    price_cents        = p_price_cents,
    currency           = p_currency,
    availability       = p_availability,
    duration_minutes   = p_duration_minutes,
    warranty_months    = p_warranty_months,
    public_note        = NULLIF(trim(coalesce(p_public_note,   '')), ''),
    internal_note      = NULLIF(trim(coalesce(p_internal_note, '')), ''),
    status             = p_status,
    sort_order         = p_sort_order
  WHERE id = p_offer_id
    AND updated_at = p_expected_updated_at
  RETURNING * INTO v_new_offer;

  -- ── Détection du conflit ─────────────────────────────────────────────────
  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.repair_offers WHERE id = p_offer_id) THEN
      RAISE EXCEPTION 'conflict: Cette offre a été modifiée par un autre utilisateur. Rechargez la page.';
    ELSE
      RAISE EXCEPTION 'not_found: Offre introuvable après mise à jour.';
    END IF;
  END IF;

  -- ── Journal ───────────────────────────────────────────────────────────────
  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'update', 'repair_offer', v_old_offer.id,
     to_jsonb(v_old_offer), to_jsonb(v_new_offer));

  RETURN jsonb_build_object('id', v_new_offer.id, 'updated_at', v_new_offer.updated_at);
END;
$$;


-- ── 3. Archivage d'une offre ─────────────────────────────────────────────────
-- Aucune suppression physique — status = 'archived' uniquement.

CREATE OR REPLACE FUNCTION public.admin_archive_repair_offer(
  p_offer_id            uuid,
  p_expected_updated_at timestamptz
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_id  uuid;
  v_old_offer  public.repair_offers;
  v_new_offer  public.repair_offers;
BEGIN
  -- ── Identité + rôle ──────────────────────────────────────────────────────
  v_caller_id := auth.uid();
  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'auth_required: Authentification requise.';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_profiles
    WHERE id = v_caller_id AND active = true AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'forbidden: Rôle admin actif requis pour archiver une offre.';
  END IF;

  -- ── Lecture de l'état actuel ──────────────────────────────────────────────
  SELECT * INTO v_old_offer FROM public.repair_offers WHERE id = p_offer_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not_found: Offre introuvable.';
  END IF;

  IF v_old_offer.status = 'archived' THEN
    RAISE EXCEPTION 'conflict: Cette offre est déjà archivée.';
  END IF;

  -- ── Archivage avec contrôle de concurrence ───────────────────────────────
  UPDATE public.repair_offers
  SET status = 'archived'
  WHERE id = p_offer_id
    AND updated_at = p_expected_updated_at
  RETURNING * INTO v_new_offer;

  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.repair_offers WHERE id = p_offer_id) THEN
      RAISE EXCEPTION 'conflict: Cette offre a été modifiée par un autre utilisateur. Rechargez la page.';
    ELSE
      RAISE EXCEPTION 'not_found: Offre introuvable.';
    END IF;
  END IF;

  -- ── Journal ───────────────────────────────────────────────────────────────
  INSERT INTO public.admin_activity_logs
    (admin_user_id, action, entity_type, entity_id, old_values, new_values)
  VALUES
    (v_caller_id, 'archive', 'repair_offer', v_old_offer.id,
     to_jsonb(v_old_offer), to_jsonb(v_new_offer));

  RETURN jsonb_build_object('id', v_old_offer.id);
END;
$$;


-- =============================================================================
-- Permissions
-- =============================================================================
-- REVOKE de PUBLIC et anon : empêche tout appel non authentifié.
-- GRANT à authenticated : le contrôle interne (role = 'admin') reste obligatoire.
-- =============================================================================

REVOKE EXECUTE ON FUNCTION public.admin_create_repair_offer(uuid,uuid,text,text,text,text,integer,text,text,integer,integer,text,text,text,integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_create_repair_offer(uuid,uuid,text,text,text,text,integer,text,text,integer,integer,text,text,text,integer) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_create_repair_offer(uuid,uuid,text,text,text,text,integer,text,text,integer,integer,text,text,text,integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_update_repair_offer(uuid,timestamptz,text,text,text,integer,text,text,integer,integer,text,text,text,integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_update_repair_offer(uuid,timestamptz,text,text,text,integer,text,text,integer,integer,text,text,text,integer) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_update_repair_offer(uuid,timestamptz,text,text,text,integer,text,text,integer,integer,text,text,text,integer) TO authenticated;

REVOKE EXECUTE ON FUNCTION public.admin_archive_repair_offer(uuid,timestamptz) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_archive_repair_offer(uuid,timestamptz) FROM anon;
GRANT  EXECUTE ON FUNCTION public.admin_archive_repair_offer(uuid,timestamptz) TO authenticated;


-- =============================================================================
-- Vérifications post-migration (non destructives)
-- =============================================================================
--
--   SELECT routine_name, security_type
--   FROM information_schema.routines
--   WHERE routine_schema = 'public'
--     AND routine_name IN ('admin_create_repair_offer','admin_update_repair_offer','admin_archive_repair_offer');
--
--   SELECT grantee, routine_name, privilege_type
--   FROM information_schema.routine_privileges
--   WHERE routine_schema = 'public'
--     AND routine_name IN ('admin_create_repair_offer','admin_update_repair_offer','admin_archive_repair_offer')
--   ORDER BY routine_name, grantee;
--
--   SELECT COUNT(*) FROM public.repair_offers;  -- doit rester 1308
-- =============================================================================
