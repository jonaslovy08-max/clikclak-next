-- =============================================================================
-- Migration 012 — Nettoyage sécurisé des messages Instagram expirés
-- =============================================================================
-- Cette fonction supprime uniquement les messages dont la date d'expiration
-- est dépassée.
--
-- Elle peut être appelée :
--   1. par la route /api/meta/instagram/cleanup ;
--   2. par le code applicatif lors des opérations courantes ;
--   3. par une tâche planifiée externe ou pg_cron.
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION public.cleanup_expired_instagram_messages()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM public.instagram_messages
  WHERE expires_at < CURRENT_TIMESTAMP;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$function$;

COMMENT ON FUNCTION public.cleanup_expired_instagram_messages() IS
  'Supprime uniquement les messages Instagram dont expires_at est dépassé.';

REVOKE ALL
ON FUNCTION public.cleanup_expired_instagram_messages()
FROM PUBLIC;

REVOKE ALL
ON FUNCTION public.cleanup_expired_instagram_messages()
FROM anon;

REVOKE ALL
ON FUNCTION public.cleanup_expired_instagram_messages()
FROM authenticated;

GRANT EXECUTE
ON FUNCTION public.cleanup_expired_instagram_messages()
TO service_role;

COMMIT;
