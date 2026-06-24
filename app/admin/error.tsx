'use client'
/*
  app/admin/error.tsx

  Client Component — affiché en cas d'erreur non capturée dans la zone admin.
  N'expose aucun détail technique à l'utilisateur.
*/

import { useEffect } from 'react'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Journalise côté client sans secret
    console.error('[AdminError]', error.digest ?? error.message)
  }, [error])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4">
      <div className="max-w-sm text-center space-y-6">
        <h1 className="text-2xl font-rubik font-bold text-foreground">
          Une erreur est survenue
        </h1>
        <p className="text-foreground/50 text-sm font-rubik">
          Impossible de charger cette page. Réessayez ou contactez le support.
        </p>
        <button
          onClick={reset}
          className="
            px-6 h-10 rounded-btn
            bg-accent text-primary-foreground
            font-rubik font-semibold text-sm
            hover:bg-accent/90 transition-colors duration-220
          "
        >
          Réessayer
        </button>
      </div>
    </div>
  )
}
