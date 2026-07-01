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
  retryWebhookSubscription,
  disconnectInstagramAccount,
} from './actions'

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

export default async function InstagramIntegrationPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  await requireInstagramAccess()

  const sp      = await searchParams
  const success = sp.success ?? null
  const error   = sp.error   ?? null

  let connections: InstagramConnectionPublic[] = []
  let loadError: string | null = null
  try {
    connections = await listInstagramConnections()
  } catch {
    loadError = 'Impossible de charger les connexions. Vérifier la configuration Supabase.'
  }

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

      {/* Liste des connexions */}
      <section>
        <h2 className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3">
          Comptes connectés
        </h2>

        {connections.length === 0 && !loadError ? (
          <div className="p-6 rounded-card bg-white/[0.02] border border-white/6 text-center">
            <p className="text-sm font-rubik text-foreground/40">
              Aucun compte Instagram connecté.
            </p>
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

    </div>
  )
}
