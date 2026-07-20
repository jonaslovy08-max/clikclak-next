import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function json(body: Record<string, unknown>, status = 200): NextResponse {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
    },
  })
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const secret = process.env.KEEPALIVE_SECRET

  if (!secret || request.headers.get('x-keepalive-secret') !== secret) {
    return json({ ok: false, error: 'Unauthorized' }, 401)
  }

  try {
    const supabase = createSupabaseAdminClient()

    const { error } = await supabase
      .from('brands')
      .select('id')
      .limit(1)

    if (error) {
      console.error('[Supabase keepalive] Query failed:', error.code)
      return json({ ok: false, error: 'Supabase query failed' }, 500)
    }

    return json({
      ok: true,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return json({ ok: false, error: 'Internal server error' }, 500)
  }
}
