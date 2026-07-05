-- Accès serveur uniquement pour l’intégration Instagram.

GRANT USAGE ON SCHEMA public TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
ON TABLE public.instagram_connections
TO service_role;

GRANT SELECT, INSERT
ON TABLE public.instagram_data_deletion_requests
TO service_role;

REVOKE ALL
ON TABLE public.instagram_connections
FROM anon, authenticated;

REVOKE ALL
ON TABLE public.instagram_data_deletion_requests
FROM anon, authenticated;
