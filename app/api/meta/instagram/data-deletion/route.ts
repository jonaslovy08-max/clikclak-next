/*
  POST /api/meta/instagram/data-deletion

  Callback Meta — demande de suppression des données Instagram.
  Wrapper mince autour de handleDataDeletionCallback().
*/

import 'server-only'
import { handleDataDeletionCallback } from '@/lib/meta/instagram/callbacksOrchestrator'
import { deleteInstagramDataByUserId, recordDataDeletionCompleted } from '@/lib/meta/instagram/dataDeletion'

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

  const result = await handleDataDeletionCallback(rawBody, contentType, {
    getAppSecret:   () => process.env.META_INSTAGRAM_APP_SECRET,
    deleteUserData: deleteInstagramDataByUserId,
    recordCompleted: recordDataDeletionCompleted,
    siteUrl:        process.env.NEXT_PUBLIC_SITE_URL ?? 'https://clikclak.ch',
  })

  return new Response(JSON.stringify(result.body), {
    status: result.status, headers: HEADERS,
  })
}
