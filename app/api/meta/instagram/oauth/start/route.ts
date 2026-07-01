/*
  GET /api/meta/instagram/oauth/start

  Démarre le parcours OAuth Instagram Business Login.

  1. Vérifie la session admin (même logique que requireAdminProfile).
  2. Génère un state cryptographiquement aléatoire.
  3. Stocke le state dans Redis avec TTL 10 min.
  4. Redirige vers l'URL d'autorisation Instagram.

  Protégé : refus 401 si session absente ou invalide.
  Aucun secret ne passe au navigateur.
*/

import 'server-only'
import { NextResponse } from 'next/server'
import { Redis }        from '@upstash/redis'

import { createSupabaseServerClient }   from '@/lib/supabase/server'
import { createInstagramAuthorizationUrl, generateOAuthState } from '@/lib/meta/instagram/oauth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/* ── Redis pour le state OAuth ───────────────────────────────────── */

let _redis: Redis | null = null
function getRedis(): Redis {
  if (!_redis) _redis = Redis.fromEnv()
  return _redis
}

const STATE_KEY_PREFIX = 'meta:instagram:oauth:state'
const STATE_TTL_SECS   = 10 * 60  // 10 minutes

/* ── Route handler ───────────────────────────────────────────────── */

export async function GET(): Promise<NextResponse> {

  /* ── 1. Vérification session admin ─────────────────────────────── */
  let supabase
  try {
    supabase = await createSupabaseServerClient()
  } catch {
    return NextResponse.json({ error: 'Configuration serveur incomplète.' }, { status: 500 })
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Authentification requise.' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('admin_profiles')
    .select('active, role')
    .eq('id', user.id)
    .single()

  const ALLOWED_ROLES = ['admin', 'editor', 'instagram_reviewer'] as const
  if (!profile?.active || !ALLOWED_ROLES.includes(profile.role as typeof ALLOWED_ROLES[number])) {
    return NextResponse.json({ error: 'Profil admin invalide.' }, { status: 403 })
  }

  /* ── 2. Génération et stockage du state ─────────────────────────── */
  const state   = generateOAuthState()
  const stateKey = `${STATE_KEY_PREFIX}:${state}`

  try {
    await getRedis().set(stateKey, user.id, { ex: STATE_TTL_SECS })
  } catch {
    return NextResponse.json(
      { error: 'Impossible d\'initialiser le parcours OAuth.' },
      { status: 503 },
    )
  }

  /* ── 3. Redirection vers Instagram ──────────────────────────────── */
  let authUrl: string
  try {
    authUrl = createInstagramAuthorizationUrl(state)
  } catch (err) {
    console.error('[oauth:start] Configuration Instagram manquante', {
      error: err instanceof Error ? err.message : 'unknown',
    })
    return NextResponse.json(
      { error: 'Configuration Instagram incomplète.' },
      { status: 500 },
    )
  }

  return NextResponse.redirect(authUrl)
}
