-- =============================================================================
-- Migration 002 — Correctif des privilèges objet
-- =============================================================================
-- Contexte : la migration 001 n'incluait pas les GRANT nécessaires.
-- En Supabase, service_role bypasse le RLS mais a tout de même besoin de
-- privilèges TABLE explicites au niveau objet PostgreSQL.
-- Sans ces grants, les requêtes PostgREST avec la SUPABASE_SECRET_KEY
-- retournent : "permission denied for table ..." (code 42501).
--
-- À appliquer dans le SQL Editor Supabase :
--   Dashboard → SQL Editor → coller ce fichier → Run
-- =============================================================================

-- service_role : accès complet (bypasse RLS, scripts de migration, tableau de bord)
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

-- Séquences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =============================================================================
-- Vérification post-migration :
--   SELECT grantee, table_name, privilege_type
--   FROM information_schema.role_table_grants
--   WHERE table_schema = 'public'
--   ORDER BY table_name, grantee, privilege_type;
-- =============================================================================
