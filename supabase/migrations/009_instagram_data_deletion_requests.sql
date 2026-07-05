-- =============================================================================
-- Migration 009 — Suivi des demandes de suppression de donnees Instagram
-- =============================================================================
-- Table minimale pour repondre aux callbacks Meta de suppression de donnees.
-- Aucun user_id en clair. Aucun token. Aucun contenu de message.
-- Acces uniquement via le client service role (RLS active, aucune policy publique).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.instagram_data_deletion_requests (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  confirmation_code text        UNIQUE NOT NULL,
  status           text        NOT NULL DEFAULT 'processing'
                     CHECK (status IN ('processing', 'completed', 'failed')),
  requested_at     timestamptz NOT NULL DEFAULT now(),
  completed_at     timestamptz,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_data_deletion_confirmation
  ON public.instagram_data_deletion_requests (confirmation_code);

CREATE INDEX IF NOT EXISTS idx_data_deletion_status
  ON public.instagram_data_deletion_requests (status);

ALTER TABLE public.instagram_data_deletion_requests ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.instagram_data_deletion_requests IS
  'Suivi des demandes de suppression de donnees Instagram recues via les callbacks Meta. Aucun user_id en clair. Aucun token. Aucun signed_request. Aucun contenu de message.';

COMMENT ON COLUMN public.instagram_data_deletion_requests.confirmation_code IS
  'Code UUID aleatoire retourne a Meta comme preuve de traitement. Ne contient aucune donnee personnelle.';

COMMENT ON COLUMN public.instagram_data_deletion_requests.status IS
  'processing = suppression en cours ; completed = suppression terminee ; failed = erreur technique.';
