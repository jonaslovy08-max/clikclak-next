/*
  lib/meta/instagram/oauthOrchestrator.ts

  Orchestrateur pur de finalisation OAuth Instagram (post-échange de token).
  Sans import "server-only" — importable par les tests tsx.
  app/api/meta/instagram/oauth/callback/route.ts est un wrapper mince autour
  de finalizeInstagramOAuthConnection().

  Ordre garanti :
    1. save(pending, webhook_subscribed=false)
    2. subscribeToMessages
    3a. Si succès : update(active, webhook_subscribed=true)
        Si update échoue après subscribe réussi : unsubscribe (best-effort)
    3b. Si échec : update(error, webhook_subscribed=false)
*/

export type OAuthFinalizationResult =
  | { outcome: 'active' }
  | { outcome: 'error' }
  | { outcome: 'finalize_failed' }

export interface OAuthFinalizationDeps {
  saveConnectionPending(instagramUserId: string): Promise<string>         // returns id
  subscribeToMessages(userId: string, token: string): Promise<boolean>
  updateWebhookStatus(id: string, subscribed: boolean, status: 'active' | 'error'): Promise<void>
  unsubscribeFromMessages(userId: string, token: string): Promise<boolean>
}

/**
 * Finalise une connexion Instagram après l'échange de token OAuth.
 * Injecte les dépendances pour être testable indépendamment.
 *
 * Garantit l'ordre strict : save → subscribe → update.
 * Compense avec unsubscribe si la mise à jour post-succès échoue.
 */
export async function finalizeInstagramOAuthConnection(
  instagramUserId: string,
  accessToken:     string,
  deps:            OAuthFinalizationDeps,
): Promise<OAuthFinalizationResult> {

  /* 1. Sauvegarder en état pending avant tout appel externe */
  const connectionId = await deps.saveConnectionPending(instagramUserId)

  /* 2. Abonner au webhook */
  const subscribeOk = await deps.subscribeToMessages(instagramUserId, accessToken)

  if (!subscribeOk) {
    /* Échec subscribe → marquer error, token conservé pour retry */
    try { await deps.updateWebhookStatus(connectionId, false, 'error') } catch { /* best-effort */ }
    return { outcome: 'error' }
  }

  /* 3. Mise à jour après succès subscribe */
  try {
    await deps.updateWebhookStatus(connectionId, true, 'active')
    return { outcome: 'active' }
  } catch {
    /* Subscribe réussi mais DB update échoué → désabonner (compensation) */
    await deps.unsubscribeFromMessages(instagramUserId, accessToken).catch(() => undefined)
    return { outcome: 'finalize_failed' }
  }
}
