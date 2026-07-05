/*
  lib/meta/instagram/client.ts

  Envoi de messages texte via l'Instagram API with Instagram Login.

  API utilisée :
    https://graph.instagram.com/{VERSION}/{ACCOUNT_ID}/messages

  Permissions requises sur l'application Meta :
    instagram_business_basic
    instagram_business_manage_messages

  La configuration de connexion (accountId, accessToken) est passée
  explicitement — jamais lue depuis les variables d'environnement ici.
  L'appelant est responsable de la résolution dynamique du bon token
  (connexion DB ou fallback env vars, via resolveInstagramSendConfig).

  Règles de sécurité :
  - Le token n'est jamais journalisé.
  - Le corps complet de la réponse d'erreur n'est jamais journalisé.
  - Seuls le code HTTP et un message nettoyé (≤ 120 car.) sont loggés.
  - Le token de production doit être contrôlé et renouvelé avant son expiration.
*/

const DEFAULT_GRAPH_VERSION = 'v25.0'
const SEND_TIMEOUT_MS       = 8_000

export interface InstagramSendConfig {
  accountId:    string
  accessToken:  string
  graphVersion?: string
}

/**
 * Envoie un message texte à un utilisateur Instagram.
 *
 * @param recipientId  Instagram-scoped ID du destinataire (sender.id du webhook).
 * @param text         Texte à envoyer (≤ 1000 caractères recommandé par Meta).
 * @param config       Connexion Instagram : accountId, accessToken, graphVersion optionnel.
 * @returns            true si l'envoi a réussi (response.ok), false sinon.
 */
export async function sendInstagramTextMessage(
  recipientId: string,
  text:        string,
  config:      InstagramSendConfig,
): Promise<boolean> {
  const { accountId, accessToken } = config
  const graphVersion = config.graphVersion ?? DEFAULT_GRAPH_VERSION

  if (!accessToken) {
    console.error('[instagram:client] accessToken manquant dans la configuration')
    return false
  }
  if (!accountId) {
    console.error('[instagram:client] accountId manquant dans la configuration')
    return false
  }

  const url = `https://graph.instagram.com/${graphVersion}/${accountId}/messages`

  const body = JSON.stringify({
    recipient: { id: recipientId },
    message:   { text },
  })

  const controller = new AbortController()
  const timer      = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body,
      signal: controller.signal,
    })

    if (!res.ok) {
      const status = res.status
      let errMsg   = String(status)
      try {
        const data = await res.json() as { error?: { message?: string; code?: number } }
        const raw  = data?.error?.message
        if (typeof raw === 'string') errMsg = raw.slice(0, 120)
      } catch {
        /* réponse non-JSON — on conserve le code HTTP */
      }
      console.error('[instagram:client] Échec envoi message', { status, message: errMsg })
      return false
    }

    return true

  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error('[instagram:client] Timeout envoi message (8s)')
    } else {
      const msg = err instanceof Error ? err.message.slice(0, 80) : 'unknown'
      console.error('[instagram:client] Erreur réseau envoi message', { error: msg })
    }
    return false
  } finally {
    clearTimeout(timer)
  }
}
