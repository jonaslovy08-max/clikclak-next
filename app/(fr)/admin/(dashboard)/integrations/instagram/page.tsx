/* eslint-disable react/no-unescaped-entities */
/*
  app/admin/(dashboard)/integrations/instagram/page.tsx
  → /admin/integrations/instagram

  Page de gestion de l'intégration Instagram Business Login.

  Affiche les connexions actives et permet :
  - de connecter un nouveau compte Instagram professionnel ;
  - de relancer l'abonnement webhook si nécessaire ;
  - de déconnecter un compte.

  Ne jamais afficher le token, le secret, le code OAuth ni la clé de chiffrement.
*/

import type { Metadata }         from 'next'
import { requireInstagramAccess } from '@/lib/admin/auth'
import { listInstagramConnections, type InstagramConnectionPublic } from '@/lib/meta/instagram/connections'
import {
  listInstagramConversations,
  getInstagramConversation,
  listInstagramMessages,
  type ConversationRow,
  type MessageRow,
} from '@/lib/meta/instagram/messages'
import { isValidUuid } from '@/lib/meta/instagram/accessControl'
import { isWithin24Hours } from '@/lib/meta/instagram/inboxOrchestrator'
import {
  retryWebhookSubscription,
  disconnectInstagramAccount,
  sendManualInstagramReply,
} from './actions'
import { ReplyForm, RefreshButton, AutoRefresh } from './InboxClient'

export const metadata: Metadata = { title: 'Intégration Instagram' }

/* ── Badges ──────────────────────────────────────────────────────── */

function StatusBadge({ status, expiresAt }: { status: InstagramConnectionPublic['status']; expiresAt: string | null }) {
  const now       = Date.now()
  const expMs     = expiresAt ? new Date(expiresAt).getTime() : null
  const soonMs    = 7 * 24 * 60 * 60 * 1000 // 7 jours

  const map: Record<InstagramConnectionPublic['status'], { color: string; label: string }> = {
    active:  { color: 'text-green-400 bg-green-400/10 border-green-400/20', label: 'Actif' },
    pending: { color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',    label: 'En cours' },
    expired: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/20', label: 'Expiré' },
    revoked: { color: 'text-red-400 bg-red-400/10 border-red-400/20',       label: 'Révoqué' },
    error:   { color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', label: 'Erreur' },
  }
  /* Forcer 'Expiré' si la date est dépassée */
  if (expMs && expMs < now) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-rubik border text-amber-400 bg-amber-400/10 border-amber-400/20">
        Expiré
      </span>
    )
  }
  /* Avertissement si expiration < 7 jours */
  if (status === 'active' && expMs && expMs < now + soonMs) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-rubik border text-yellow-400 bg-yellow-400/10 border-yellow-400/20">
        ⚠ Expire bientôt
      </span>
    )
  }
  const { color, label } = map[status] ?? map.error
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-rubik border ${color}`}>
      {label}
    </span>
  )
}

function WebhookBadge({ subscribed }: { subscribed: boolean }) {
  return subscribed ? (
    <span className="inline-flex items-center gap-1 text-xs font-rubik text-green-400">
      <span aria-hidden>●</span> Webhook messages actif
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-xs font-rubik text-orange-400">
      <span aria-hidden>○</span> Webhook inactif
    </span>
  )
}

/* ── Formatage de date ───────────────────────────────────────────── */

function formatDate(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat('fr-CH', {
      day:   '2-digit',
      month: '2-digit',
      year:  'numeric',
    }).format(new Date(iso))
  } catch {
    return '—'
  }
}

/* ── Composant carte de connexion ───────────────────────────────── */

function ConnectionCard({ conn }: { conn: InstagramConnectionPublic }) {
  return (
    <div className="p-4 rounded-card bg-white/[0.04] border border-white/8 space-y-4">

      {/* Profil */}
      <div className="flex items-start gap-3">
        {conn.profile_picture_url && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={conn.profile_picture_url}
            alt={`Photo de profil @${conn.username ?? 'inconnu'}`}
            width={40}
            height={40}
            className="rounded-full shrink-0 object-cover bg-white/10"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-rubik font-medium text-foreground truncate">
            @{conn.username ?? '—'}
          </p>
          <p className="text-xs font-rubik text-foreground/40 mt-0.5">
            ID : {conn.instagram_user_id}
          </p>
          {conn.account_type && (
            <p className="text-xs font-rubik text-foreground/40">
              Type : {conn.account_type}
            </p>
          )}
        </div>
        <StatusBadge status={conn.status} expiresAt={conn.token_expires_at} />
      </div>

      {/* Informations */}
      <div className="grid grid-cols-2 gap-2 text-xs font-rubik text-foreground/50">
        <div>
          <p className="text-foreground/30 uppercase tracking-wider text-[10px] mb-0.5">Webhook</p>
          <WebhookBadge subscribed={conn.webhook_subscribed} />
        </div>
        <div>
          <p className="text-foreground/30 uppercase tracking-wider text-[10px] mb-0.5">Token expire</p>
          <p>{formatDate(conn.token_expires_at)}</p>
        </div>
        <div>
          <p className="text-foreground/30 uppercase tracking-wider text-[10px] mb-0.5">Connecté le</p>
          <p>{formatDate(conn.created_at)}</p>
        </div>
        <div>
          <p className="text-foreground/30 uppercase tracking-wider text-[10px] mb-0.5">Scopes</p>
          <p className="truncate">{conn.scopes.length} permission{conn.scopes.length > 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap pt-1 border-t border-white/8">
        {!conn.webhook_subscribed && (
          <form action={retryWebhookSubscription.bind(null, conn.id) as (fd: FormData) => Promise<void>}>
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-rubik font-medium rounded-btn bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] transition-colors text-foreground/80"
            >
              Retenter l&apos;abonnement webhook
            </button>
          </form>
        )}
        <form action={disconnectInstagramAccount.bind(null, conn.id) as (fd: FormData) => Promise<void>}>
          <button
            type="submit"
            className="px-3 py-1.5 text-xs font-rubik font-medium rounded-btn bg-red-500/10 border border-red-500/20 hover:bg-red-500/15 transition-colors text-red-400"
          >
            Déconnecter
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────────────── */

/* ── Helpers inbox ───────────────────────────────────────────────── */

function maskParticipantId(id: string): string {
  return id.length > 6 ? `…${id.slice(-4)}` : id
}

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-CH', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso))
  } catch { return '—' }
}

const SOURCE_BADGE: Record<MessageRow['source'], string> = {
  instagram:    'Client',
  auto_reply:   'Réponse auto',
  manual_reply: 'Réponse manuelle',
}
const SOURCE_COLOR: Record<MessageRow['source'], string> = {
  instagram:    'text-foreground/50 bg-white/5',
  auto_reply:   'text-blue-300/80 bg-blue-400/10',
  manual_reply: 'text-accent/80 bg-accent/10',
}

export default async function InstagramIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  await requireInstagramAccess()

  const sp             = await searchParams
  const success        = sp.success        ?? null
  const error          = sp.error          ?? null
  const replySuccess   = sp.reply_success  ?? null
  const replyError     = sp.reply_error    ?? null

  /* conversation sélectionnée depuis query param — validée serveur */
  const rawConvId      = sp.conversation   ?? null
  const selectedConvId = rawConvId && isValidUuid(rawConvId) ? rawConvId : null

  let connections: InstagramConnectionPublic[] = []
  let loadError: string | null = null
  try {
    connections = await listInstagramConnections()
  } catch {
    loadError = 'Impossible de charger les connexions. Vérifier la configuration Supabase.'
  }

  /* Conversations — agrège tous les comptes connectés */
  let allConversations: ConversationRow[] = []
  for (const conn of connections) {
    try {
      const convs = await listInstagramConversations(conn.instagram_user_id)
      allConversations = [...allConversations, ...convs]
    } catch { /* best-effort */ }
  }
  allConversations.sort(
    (a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
  )

  /* Conversation + messages sélectionnés */
  let selectedConversation: ConversationRow | null = null
  let messages: MessageRow[] = []
  if (selectedConvId) {
    try {
      selectedConversation = await getInstagramConversation(selectedConvId)
      if (selectedConversation) {
        messages = await listInstagramMessages(selectedConvId)
      }
    } catch { /* best-effort */ }
  }

  /* Vérification fenêtre 24h pour le formulaire de réponse */
  const lastInbound = selectedConversation?.last_inbound_at
    ? new Date(selectedConversation.last_inbound_at)
    : null
  const canReply = isWithin24Hours(lastInbound)

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-rubik font-bold text-foreground">
            Intégration Instagram
          </h1>
          <p className="mt-1 text-sm font-rubik text-foreground/40">
            Connectez un compte Instagram professionnel pour permettre à Clik Clak de
            recevoir et de répondre aux messages privés.
          </p>
        </div>

        {/* Bouton connecter */}
        <a
          href="/api/meta/instagram/oauth/start"
          className="
            inline-flex items-center gap-2 px-4 py-2
            rounded-btn bg-accent text-foreground text-sm font-rubik font-medium
            hover:bg-accent/90 transition-colors shrink-0
          "
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5.5v5M5.5 8h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Connecter un compte Instagram
        </a>
      </div>

      {/* Bannière succès */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-card bg-green-500/[0.08] border border-green-500/20">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 mt-0.5 text-green-400">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 8l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-rubik text-green-300">
            {success === 'connected'
              ? 'Compte Instagram connecté avec succès. Webhook messages actif.'
              : 'Compte Instagram connecté. Le webhook n\'a pas pu être activé — réessayez ci-dessous.'}
          </p>
        </div>
      )}

      {/* Bannière erreur */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-card bg-red-500/[0.08] border border-red-500/20">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden className="shrink-0 mt-0.5 text-red-400">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M8 5v3.5M8 10.5h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-sm font-rubik font-medium text-red-300">La connexion a échoué.</p>
            <p className="text-xs font-rubik text-foreground/50 mt-0.5">
              {error === 'access_denied'
                ? 'Autorisation refusée par l\'utilisateur Instagram.'
                : error === 'state_invalid'
                  ? 'Session OAuth expirée ou invalide. Réessayez.'
                  : 'Une erreur est survenue lors de la connexion. Réessayez.'}
            </p>
          </div>
        </div>
      )}

      {/* Erreur chargement DB */}
      {loadError && (
        <div className="p-4 rounded-card bg-red-500/[0.06] border border-red-500/15">
          <p className="text-sm font-rubik text-red-300">{loadError}</p>
        </div>
      )}

      {/* Feedback réponse manuelle */}
      {replySuccess && (
        <div className="flex items-start gap-3 p-3 rounded-card bg-green-500/[0.08] border border-green-500/20">
          <p className="text-sm font-rubik text-green-300">
            {replySuccess === 'sent' ? 'Réponse envoyée.' : 'Réponse envoyée (non persistée).'}
          </p>
        </div>
      )}
      {replyError && (
        <div className="flex items-start gap-3 p-3 rounded-card bg-red-500/[0.08] border border-red-500/20">
          <p className="text-sm font-rubik text-red-300">
            {replyError === 'window_expired'
              ? "Fenêtre de 24 h expirée. Impossible d'envoyer."
              : replyError === 'rate_limited'
                ? "Trop d'envois. Réessayez dans une minute."
                : 'Envoi échoué. Réessayez.'}
          </p>
        </div>
      )}

      {/* Liste des connexions */}
      <section>
        <h2 className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3">
          Comptes connectés
        </h2>

        {connections.length === 0 && !loadError ? (
          <div className="p-6 rounded-card bg-white/[0.02] border border-white/6 text-center">
            <p className="text-sm font-rubik text-foreground/40">Aucun compte Instagram connecté.</p>
            <p className="text-xs font-rubik text-foreground/25 mt-1">
              Utilisez le bouton ci-dessus pour connecter un compte professionnel.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {connections.map(conn => (
              <ConnectionCard key={conn.id} conn={conn} />
            ))}
          </div>
        )}
      </section>

      {/* ── Boîte de réception Instagram ──────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider">
            Messages Instagram
          </h2>
          <div className="flex items-center gap-2">
            <AutoRefresh intervalMs={5000} />
            <RefreshButton />
          </div>
        </div>

        {allConversations.length === 0 ? (
          <div className="p-6 rounded-card bg-white/[0.02] border border-white/6 text-center">
            <p className="text-sm font-rubik text-foreground/40">
              Aucune conversation. Les messages entrants apparaîtront ici dès réception.
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-4">
            {/* Colonne conversations */}
            <div className="lg:col-span-2 flex flex-col gap-1.5 max-h-[60vh] overflow-y-auto rounded-card border border-white/8 p-2">
              {allConversations.map(conv => {
                const isSelected = conv.id === selectedConvId
                return (
                  <a
                    key={conv.id}
                    href={`/admin/integrations/instagram?conversation=${encodeURIComponent(conv.id)}`}
                    className={`
                      block p-3 rounded-btn transition-colors
                      ${isSelected
                        ? 'bg-white/[0.10] border border-white/15'
                        : 'hover:bg-white/[0.05] border border-transparent'}
                    `}
                  >
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <span className="text-xs font-rubik font-mono text-foreground/60 truncate">
                        {maskParticipantId(conv.participant_id)}
                      </span>
                      <span className="text-[10px] font-rubik text-foreground/30 shrink-0">
                        {formatDateTime(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.last_message_preview && (
                      <p className="text-xs font-rubik text-foreground/40 truncate">
                        {conv.last_message_preview}
                      </p>
                    )}
                  </a>
                )
              })}
            </div>

            {/* Colonne messages */}
            <div className="lg:col-span-3 flex flex-col rounded-card border border-white/8 p-4 min-h-[300px]">
              {!selectedConversation ? (
                <p className="m-auto text-sm font-rubik text-foreground/30">
                  Sélectionnez une conversation.
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/8">
                    <span className="text-xs font-rubik text-foreground/50 font-mono">
                      {maskParticipantId(selectedConversation.participant_id)}
                    </span>
                    {!canReply && lastInbound && (
                      <span className="text-xs font-rubik text-amber-400/70">
                        Fenêtre 24 h expirée
                      </span>
                    )}
                  </div>

                  {/* Fil de messages */}
                  <div className="flex-1 flex flex-col gap-3 overflow-y-auto max-h-[40vh] mb-3">
                    {messages.length === 0 ? (
                      <p className="text-xs font-rubik text-foreground/30 text-center mt-4">
                        Aucun message visible (les messages s'effacent après 30 jours).
                      </p>
                    ) : messages.map(msg => {
                      const isInbound = msg.direction === 'inbound'
                      return (
                        <div key={msg.id} className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}>
                          <div className={`
                            max-w-[80%] rounded-card px-3 py-2
                            ${isInbound
                              ? 'bg-white/[0.06] border border-white/8'
                              : 'bg-accent/10 border border-accent/20'}
                          `}>
                            <p className="text-sm font-rubik text-foreground/80 whitespace-pre-wrap break-words">
                              {msg.text}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`text-[10px] font-rubik px-1.5 py-0.5 rounded ${SOURCE_COLOR[msg.source]}`}>
                                {SOURCE_BADGE[msg.source]}
                              </span>
                              <span className="text-[10px] font-rubik text-foreground/25">
                                {formatDateTime(msg.occurred_at)}
                              </span>
                              {msg.status === 'failed' && (
                                <span className="text-[10px] font-rubik text-red-400">Échec</span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Composer */}
                  <ReplyForm
                    conversationId={selectedConvId!}
                    windowExpired={!canReply}
                    sendAction={
                      sendManualInstagramReply.bind(null, selectedConvId!) as
                        (text: string, fd: FormData) => Promise<void>
                    }
                  />
                </>
              )}
            </div>
          </div>
        )}
      </section>

    </div>
  )
}
