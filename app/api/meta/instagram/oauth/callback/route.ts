/*
  GET /api/meta/instagram/oauth/callback

  Réception du callback OAuth Instagram après autorisation.

  Ordre strict de traitement :
    1.  Vérifier la session admin (admin|editor|instagram_reviewer)
    2.  Gérer les erreurs OAuth (access_denied etc.)
    3.  Valider le state Redis (existence, TTL, user correspondant)
    4.  Invalider le state (usage unique)
    5.  Échanger le code → token courte durée
    6.  Échanger → token longue durée
    7.  Récupérer le profil Instagram
    8.  Sauvegarder la connexion avec status='pending', webhook_subscribed=false
    9.  Abonner au webhook messages
    10. Si succès : mettre à jour status='active', webhook_subscribed=true
    11. Si échec : mettre à jour status='error', webhook_subscribed=false
    12. Si la mise à jour post-succès échoue : désabonner (best-effort), erreur

  Sécurité :
  - code non logué, token non logué, state non logué.
  - Erreurs utilisateur : codes prédéfinis, jamais error_description brut.
  - state invalidé après usage unique, vérification user.id.
*/

import 'server-only'
import { NextRequest, NextResponse } from 'next/server'
import { Redis }                      from '@upstash/redis'

import { createSupabaseServerClient }  from '@/lib/supabase/server'
import {
  exchangeInstagramAuthorizationCode,
  exchangeForLongLivedToken,
  fetchInstagramProfessionalProfile,
  subscribeInstagramAccountToMessages,
  unsubscribeInstagramAccount,
  INSTAGRAM_SCOPES,
} from '@/lib/meta/instagram/oauth'
import {
  saveInstagramConnection,
  updateInstagramConnectionWebhook,
} from '@/lib/meta/instagram/connections'
import { finalizeInstagramOAuthConnection } from '@/lib/meta/instagram/oauthOrchestrator'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATE_KEY_PREFIX      = 'meta:instagram:oauth:state'
const ADMIN_INTEGRATION_URL = '/admin/integrations/instagram'
const ALLOWED_ROLES         = ['admin', 'editor', 'instagram_reviewer'] as const

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

function adminRedirect(base: URL, params: Record<string, string>): NextResponse {
  const url = new URL(ADMIN_INTEGRATION_URL, base)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  return NextResponse.redirect(url.toString())
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const base   = request.nextUrl
  const params = request.nextUrl.searchParams

  /* ── 1. Session admin ───────────────────────────────────────────── */
  let supabase
  try { supabase = await createSupabaseServerClient() } catch {
    return adminRedirect(base, { error: 'config' })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/admin/login', base).toString())

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('active, role')
    .eq('id', user.id)
    .single()

  if (!profile?.active || !ALLOWED_ROLES.includes(profile.role as typeof ALLOWED_ROLES[number])) {
    return adminRedirect(base, { error: 'unauthorized' })
  }

  /* ── 2. Erreurs OAuth ───────────────────────────────────────────── */
  const oauthError = params.get('error')
  if (oauthError) {
    /* Ne jamais loguer error_description — peut contenir des données sensibles */
    console.info('[oauth:callback] Erreur OAuth reçue', { error: oauthError })
    const code = oauthError === 'access_denied' ? 'access_denied' : 'oauth_error'
    return adminRedirect(base, { error: code })
  }

  /* ── 3. Validation du state ─────────────────────────────────────── */
  const code          = params.get('code')
  const receivedState = params.get('state')

  if (!receivedState || !code) return adminRedirect(base, { error: 'invalid_request' })

  const stateKey = `${STATE_KEY_PREFIX}:${receivedState}`
  let storedUserId: string | null

  try {
    storedUserId = await getRedis().get<string>(stateKey)
  } catch {
    return adminRedirect(base, { error: 'redis_unavailable' })
  }

  if (!storedUserId) return adminRedirect(base, { error: 'state_invalid' })

  /* Vérifier que l'utilisateur du callback est bien celui qui a lancé le flow */
  if (storedUserId !== user.id) {
    await getRedis().del(stateKey).catch(() => undefined)
    return adminRedirect(base, { error: 'state_invalid' })
  }

  /* ── 4. Invalider le state (usage unique) ───────────────────────── */
  await getRedis().del(stateKey).catch(() => undefined)

  /* ── 5. Code → short-lived token ───────────────────────────────── */
  let shortToken: string
  try {
    shortToken = (await exchangeInstagramAuthorizationCode(code)).access_token
  } catch (err) {
    console.error('[oauth:callback] Échange code échoué', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return adminRedirect(base, { error: 'token_exchange_failed' })
  }

  /* ── 6. Short → long-lived token ───────────────────────────────── */
  let longToken: string
  let expiresAt: Date | null = null
  try {
    const result = await exchangeForLongLivedToken(shortToken)
    longToken    = result.access_token
    expiresAt    = new Date(Date.now() + result.expires_in * 1000)
  } catch (err) {
    console.error('[oauth:callback] Échange long-lived échoué', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return adminRedirect(base, { error: 'long_token_exchange_failed' })
  }

  /* ── 7. Profil Instagram ────────────────────────────────────────── */
  let igProfile: Awaited<ReturnType<typeof fetchInstagramProfessionalProfile>>
  try {
    igProfile = await fetchInstagramProfessionalProfile(longToken)
  } catch (err) {
    console.error('[oauth:callback] Récupération profil échouée', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return adminRedirect(base, { error: 'profile_fetch_failed' })
  }

  /* ── 8→11. Sauvegarde + abonnement via orchestrateur ──────────── */
  let orchestrationResult: Awaited<ReturnType<typeof finalizeInstagramOAuthConnection>>
  try {
    orchestrationResult = await finalizeInstagramOAuthConnection(
      igProfile.id,
      longToken,
      {
        saveConnectionPending: async (instagramUserId) => {
          const saved = await saveInstagramConnection({
            instagram_user_id:   instagramUserId,
            username:            igProfile.username,
            account_type:        igProfile.account_type ?? null,
            profile_picture_url: igProfile.profile_picture_url ?? null,
            plaintext_token:     longToken,
            token_expires_at:    expiresAt,
            scopes:              [...INSTAGRAM_SCOPES],
            webhook_subscribed:  false,
            status:              'pending',
            connected_by:        user.id,
          })
          return saved.id
        },
        subscribeToMessages:      subscribeInstagramAccountToMessages,
        updateWebhookStatus:      updateInstagramConnectionWebhook,
        unsubscribeFromMessages:  unsubscribeInstagramAccount,
      },
    )
  } catch (err) {
    console.error('[oauth:callback] Orchestration échouée', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return adminRedirect(base, { error: 'save_failed' })
  }

  if (orchestrationResult.outcome === 'finalize_failed') {
    return adminRedirect(base, { error: 'finalize_failed' })
  }
  if (orchestrationResult.outcome === 'active') {
    return adminRedirect(base, { success: 'connected' })
  }
  return adminRedirect(base, { success: 'connected_no_webhook' })
}
