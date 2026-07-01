-- =============================================================================
-- Migration 008 — Role instagram_reviewer et statut pending
-- =============================================================================
-- 1. Ajoute le role instagram_reviewer a admin_profiles.role.
-- 2. Ajoute le statut pending a instagram_connections.status.
-- =============================================================================

-- 1. Role instagram_reviewer

ALTER TABLE public.admin_profiles
  DROP CONSTRAINT IF EXISTS admin_profiles_role_check;

ALTER TABLE public.admin_profiles
  ADD CONSTRAINT admin_profiles_role_check
  CHECK (
    role IN (
      'admin',
      'editor',
      'instagram_reviewer'
    )
  );

COMMENT ON COLUMN public.admin_profiles.role IS
  'admin = acces total ; editor = lecture et ecriture du catalogue ; instagram_reviewer = acces limite a la page Instagram';

-- 2. Statut pending pour les connexions Instagram

ALTER TABLE public.instagram_connections
  DROP CONSTRAINT IF EXISTS instagram_connections_status_check;

ALTER TABLE public.instagram_connections
  ADD CONSTRAINT instagram_connections_status_check
  CHECK (
    status IN (
      'pending',
      'active',
      'expired',
      'revoked',
      'error'
    )
  );

COMMENT ON COLUMN public.instagram_connections.status IS
  'pending = connexion en cours de finalisation ; active = operationnelle ; expired = token expire ; revoked = acces revoque ; error = erreur de connexion ou abonnement';
