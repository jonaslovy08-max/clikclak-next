/*
  POST /api/meta/instagram/deauthorize

  Callback Meta — annulation d'autorisation Instagram Business Login.
  Wrapper mince autour de handleDeauthorizeCallback().
*/

import 'server-only'
import { handleDeauthorizeCallback } from '@/lib/meta/instagram/callbacksOrchestrator'
import { deleteInstagramDataByUserId } from '@/lib/meta/instagram/dataDeletion'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEADERS = {
  'Content-Type':  'application/json',
  'Cache-Control': 'no-store',
}

export async function GET(): Promise<Response> {
  return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
    status: 405, headers: { ...HEADERS, Allow: 'POST' },
  })
}

export async function POST(request: Request): Promise<Response> {
  const rawBody     = await request.text().catch(() => '')
  const contentType = request.headers.get('content-type') ?? ''

  const result = await handleDeauthorizeCallback(rawBody, contentType, {
    getAppSecret:  () => process.env.META_INSTAGRAM_APP_SECRET,
    deleteUserData: async (userId) => {
      await deleteInstagramDataByUserId(userId)
      /* Log uniquement un préfixe tronqué — jamais le user_id complet */
      console.info('[deauthorize] Données supprimées', { hint: `user[0..5]=${userId.slice(0, 6)}` })
    },
  })

  return new Response(JSON.stringify(result.body), {
    status: result.status, headers: HEADERS,
  })
}
