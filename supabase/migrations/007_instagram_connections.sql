-- =============================================================================
-- Migration 007 — Connexions Instagram Business Login
-- =============================================================================
-- Objectif : stocker les connexions OAuth Instagram for Instagram Login.
-- Aucun token en clair — les access tokens sont chiffrés (AES-256-GCM)
-- par l'application avant insertion.
--
-- Lecture et écriture uniquement via le client service role (côté serveur).
-- RLS activée : aucune policy anon ou authenticated ne donne accès aux tokens.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Table instagram_connections
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.instagram_connections (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_user_id       text        UNIQUE NOT NULL,
  username                text,
  account_type            text,
  profile_picture_url     text,
  encrypted_access_token  text        NOT NULL,
  token_expires_at        timestamptz,
  scopes                  text[]      NOT NULL DEFAULT '{}',
  webhook_subscribed      boolean     NOT NULL DEFAULT false,
  status                  text        NOT NULL DEFAULT 'active'
                            CHECK (status IN ('active', 'expired', 'revoked', 'error')),
  connected_by            uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- 2. Index
-- ---------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_instagram_connections_user_id
  ON public.instagram_connections (instagram_user_id);

CREATE INDEX IF NOT EXISTS idx_instagram_connections_status
  ON public.instagram_connections (status);

-- ---------------------------------------------------------------------------
-- 3. Trigger updated_at — réutilise la fonction existante set_updated_at()
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_instagram_connections'
  ) THEN
    CREATE TRIGGER set_updated_at_instagram_connections
      BEFORE UPDATE ON public.instagram_connections
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. RLS — activée, aucune policy publique
-- ---------------------------------------------------------------------------

ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

-- Aucune policy anon ou authenticated : la table n'est accessible
-- que via le client service role (SUPABASE_SECRET_KEY), qui contourne RLS.
-- Cela garantit qu'aucun token chiffré n'est exposé via le client public.

-- ---------------------------------------------------------------------------
-- 5. Commentaires
-- ---------------------------------------------------------------------------

COMMENT ON TABLE  public.instagram_connections IS
  'Connexions OAuth Instagram for Instagram Login. Tokens chiffrés AES-256-GCM côté application.';
COMMENT ON COLUMN public.instagram_connections.encrypted_access_token IS
  'Access token chiffré — jamais en clair. Format: v1:{iv_hex}:{ct_hex}:{tag_hex}';
COMMENT ON COLUMN public.instagram_connections.token_expires_at IS
  'Expiration du long-lived token Instagram (environ 60 jours). À renouveler avant expiration.';
COMMENT ON COLUMN public.instagram_connections.webhook_subscribed IS
  'true uniquement après confirmation de souscription API à subscribed_apps.';
COMMENT ON COLUMN public.instagram_connections.connected_by IS
  'UUID admin ayant réalisé la connexion — nullable, mis à NULL si l''admin est supprimé.';
