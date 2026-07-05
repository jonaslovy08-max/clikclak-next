/*
  GET /api/meta/instagram/cleanup

  Route de nettoyage des messages Instagram expirés.
  Destinée à être appelée par un cron job externe (Infomaniak, Supabase Edge Function).

  Protection : Authorization: Bearer META_INSTAGRAM_CLEANUP_SECRET
  La valeur de META_INSTAGRAM_CLEANUP_SECRET ne doit jamais apparaître dans les logs.

  Idempotente : supprimer un message déjà absent ne produit aucune erreur.
  N'affecte que les messages dont expires_at < now().

  Usage Infomaniak :
    curl -H "Authorization: Bearer $SECRET" https://clikclak.ch/api/meta/instagram/cleanup

  Usage Supabase pg_cron (alternative) :
    SELECT cron.schedule(
      'cleanup-instagram-messages', '0 3 * * *',
      'SELECT public.cleanup_expired_instagram_messages()'
    );
*/

import 'server-only'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEADERS = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }

export async function GET(request: Request): Promise<Response> {
  /* ── Vérification du secret ──────────────────────────────────── */
  const cleanupSecret = process.env.META_INSTAGRAM_CLEANUP_SECRET
  if (!cleanupSecret) {
    return new Response(JSON.stringify({ error: 'Configuration serveur incomplète.' }), {
      status: 500, headers: HEADERS,
    })
  }

  const auth = request.headers.get('authorization')
  if (!auth || auth !== `Bearer ${cleanupSecret}`) {
    return new Response(JSON.stringify({ error: 'Non autorisé.' }), {
      status: 401, headers: HEADERS,
    })
  }

  /* ── Exécution de la purge ───────────────────────────────────── */
  try {
    const { createSupabaseAdminClient } = await import('@/lib/supabase/admin')
    const db = createSupabaseAdminClient()

    /* Appel de la fonction SQL de nettoyage (migration 012) */
    const { data, error } = await db.rpc('cleanup_expired_instagram_messages')

    if (error) {
      console.error('[cleanup] Erreur nettoyage messages', { error: error.message.slice(0, 80) })
      return new Response(JSON.stringify({ error: 'Erreur interne.' }), {
        status: 500, headers: HEADERS,
      })
    }

    const deletedCount = typeof data === 'number' ? data : 0
    console.info('[cleanup] Messages expirés supprimés', { count: deletedCount })

    return new Response(JSON.stringify({ deleted: deletedCount, ok: true }), {
      status: 200, headers: HEADERS,
    })
  } catch (err) {
    console.error('[cleanup] Exception', {
      error: err instanceof Error ? err.message.slice(0, 80) : 'unknown',
    })
    return new Response(JSON.stringify({ error: 'Erreur interne.' }), {
      status: 500, headers: HEADERS,
    })
  }
}
