-- =============================================================================
-- Migration 011 — Boite de reception Instagram (conversations et messages)
-- =============================================================================
-- Tables de persistance des messages Instagram recus et envoyes.
-- Acces exclusif via service_role (RLS active, aucune policy anon/authenticated).
-- Expiration automatique des messages apres 30 jours.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Table instagram_conversations
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.instagram_conversations (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  instagram_account_id  text        NOT NULL
                          REFERENCES public.instagram_connections(instagram_user_id)
                          ON DELETE CASCADE,
  participant_id        text        NOT NULL,
  last_message_at       timestamptz NOT NULL,
  last_inbound_at       timestamptz,
  last_message_preview  text        CHECK (length(last_message_preview) <= 200),
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  UNIQUE (instagram_account_id, participant_id)
);

CREATE INDEX IF NOT EXISTS idx_instagram_conversations_account
  ON public.instagram_conversations (instagram_account_id);

CREATE INDEX IF NOT EXISTS idx_instagram_conversations_participant
  ON public.instagram_conversations (participant_id);

CREATE INDEX IF NOT EXISTS idx_instagram_conversations_last_message
  ON public.instagram_conversations (last_message_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'set_updated_at_instagram_conversations'
  ) THEN
    CREATE TRIGGER set_updated_at_instagram_conversations
      BEFORE UPDATE ON public.instagram_conversations
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.instagram_conversations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.instagram_conversations IS
  'Conversations Instagram entre le compte professionnel ClikClak et ses clients.
   instagram_account_id = identifiant du compte pro ; participant_id = IGSID du client.';

COMMENT ON COLUMN public.instagram_conversations.last_inbound_at IS
  'Horodatage du dernier message entrant. Utilise pour verifier la fenetre de 24 h.';

-- ---------------------------------------------------------------------------
-- 2. Table instagram_messages
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.instagram_messages (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid        NOT NULL
                    REFERENCES public.instagram_conversations(id)
                    ON DELETE CASCADE,
  external_mid    text,
  direction       text        NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  source          text        NOT NULL CHECK (source IN ('instagram', 'auto_reply', 'manual_reply')),
  text            text        NOT NULL CHECK (length(text) BETWEEN 1 AND 4096),
  status          text        NOT NULL CHECK (status IN ('received', 'sent', 'failed')),
  reply_to_mid    text,
  sent_by         uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  occurred_at     timestamptz NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz NOT NULL DEFAULT now() + interval '30 days'
);

-- external_mid unique uniquement lorsqu'il n'est pas NULL
CREATE UNIQUE INDEX IF NOT EXISTS idx_instagram_messages_mid_unique
  ON public.instagram_messages (external_mid)
  WHERE external_mid IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_instagram_messages_conversation
  ON public.instagram_messages (conversation_id, occurred_at);

CREATE INDEX IF NOT EXISTS idx_instagram_messages_expires
  ON public.instagram_messages (expires_at);

ALTER TABLE public.instagram_messages ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.instagram_messages IS
  'Messages individuels des conversations Instagram. expire_at = 30 jours apres creation.
   direction inbound = recu du client ; outbound auto_reply = reponse automatique ;
   outbound manual_reply = reponse manuelle par un admin.';

COMMENT ON COLUMN public.instagram_messages.external_mid IS
  'Identifiant message Instagram (mid). NULL pour les reponses manuelles (pas de mid externe).';

COMMENT ON COLUMN public.instagram_messages.expires_at IS
  'Les messages sont conserves au maximum 30 jours. Aucun message expire nest affiche.';

-- ---------------------------------------------------------------------------
-- 3. Droits service_role — acces exclusif
-- ---------------------------------------------------------------------------

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.instagram_conversations TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.instagram_messages TO service_role;

REVOKE ALL
  ON public.instagram_conversations FROM anon, authenticated;

REVOKE ALL
  ON public.instagram_messages FROM anon, authenticated;
