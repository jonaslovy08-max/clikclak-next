/*
  lib/meta/instagram/resolver.ts

  Résolution dynamique du token d'envoi Instagram par recipient.id.
  Ce module ne contient PAS import "server-only" afin de rester importable
  par les scripts de test tsx via le webhook.

  IMPORTANT : n'importer jamais ce module depuis un Client Component.

  Priorité :
    1. Connexion active en base (token déchiffré côté serveur)
    2. Variables d'environnement (fallback pour clikclak_repair)
    3. null → message retentable

  Vérification d'expiration :
    - Token expiré ou expirant dans moins de 5 minutes → ignoré
    - Connexion marquée expired en best-effort
    - Fallback env var uniquement si recipient.id === META_INSTAGRAM_ACCOUNT_ID
*/

import { decryptToken } from './tokenCryptoCore'
import type { InstagramConnection, InstagramSendConfig } from './connections'

export type { InstagramSendConfig }

const TOKEN_EXPIRY_GRACE_MS = 5 * 60 * 1000 // 5 minutes

function isTokenExpiredOrSoon(tokenExpiresAt: string | null): boolean {
  if (!tokenExpiresAt) return false
  const expiry = new Date(tokenExpiresAt).getTime()
  return expiry < Date.now() + TOKEN_EXPIRY_GRACE_MS
}

/**
 * Résout la configuration d'envoi Instagram pour un identifiant de compte.
 * @param recipientId  L'ID Instagram de la page/compte ClikClak (recipient.id du webhook).
 * @param opts         Injection de dépendances pour les tests.
 */
export async function resolveInstagramSendConfig(
  recipientId: string,
  opts?: {
    _lookupOverride?: (id: string) => Promise<InstagramConnection | null>
  },
): Promise<InstagramSendConfig | null> {

  /* ── 1. Connexion base de données ─────────────────────────────── */
  let conn: InstagramConnection | null = null

  try {
    if (opts?._lookupOverride) {
      conn = await opts._lookupOverride(recipientId)
    } else {
      /* Import dynamique — getInstagramConnectionByAccountId est dans
         connections.ts (server-only) et n'est pas directement importable
         sans server-only. On passe donc par une dynamic import. */
      const { getInstagramConnectionByAccountId } = await import('./connections')
      conn = await getInstagramConnectionByAccountId(recipientId)
    }
  } catch {
    /* DB indisponible — tenter le fallback env */
  }

  if (conn && conn.status === 'active') {
    /* Vérifier l'expiration */
    if (isTokenExpiredOrSoon(conn.token_expires_at)) {
      /* Marquer expired en best-effort */
      try {
        const { updateConnectionStatus } = await import('./connections')
        await updateConnectionStatus(conn.id, 'expired')
      } catch { /* ignore */ }
      console.error('[resolver] Token Instagram expiré ou expirant dans < 5 min', {
        accountId: recipientId.slice(0, 6) + '…',
        expiresAt: conn.token_expires_at,
      })
      /* Ne pas utiliser ce token — passer au fallback */
    } else {
      try {
        const accessToken = decryptToken(conn.encrypted_access_token)
        return {
          accountId:   recipientId,
          accessToken,
          graphVersion: process.env.META_GRAPH_API_VERSION,
        }
      } catch {
        console.error('[resolver] Déchiffrement du token échoué', {
          accountId: recipientId.slice(0, 6) + '…',
        })
      }
    }
  }

  /* ── 2. Fallback variables d'environnement ─────────────────────── */
  const envAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID
  const envToken     = process.env.META_INSTAGRAM_ACCESS_TOKEN

  if (recipientId === envAccountId && envToken) {
    return {
      accountId:   recipientId,
      accessToken: envToken,
      graphVersion: process.env.META_GRAPH_API_VERSION,
    }
  }

  /* ── 3. Compte non configuré ──────────────────────────────────── */
  console.error('[resolver] Compte Instagram destinataire non configuré', {
    hint: `accountId[0..5]=${recipientId.slice(0, 6)}`,
  })
  return null
}
