'use client'
/*
  components/admin/OfferModal.tsx

  Modal générique admin avec overlay + focus trap basique.
  Fermer via le lien "Fermer" (URL sans modal params) ou la touche Escape.
*/

import { useEffect, useRef, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface OfferModalProps {
  title:    string
  children: ReactNode
  closeHref: string
}

export function OfferModal({ title, children, closeHref }: OfferModalProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Fermeture Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') router.push(closeHref)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [closeHref, router])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={() => router.push(closeHref)}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={dialogRef}
        className="
          relative z-10 w-full max-w-xl max-h-[90vh] overflow-y-auto
          mt-16 mx-4 rounded-card
          bg-[#1a1a1a] border border-white/12
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 sticky top-0 bg-[#1a1a1a]">
          <h2 id="modal-title" className="text-base font-rubik font-semibold text-foreground">
            {title}
          </h2>
          <a
            href={closeHref}
            className="
              p-1.5 rounded-btn text-foreground/40
              hover:text-foreground hover:bg-white/8
              transition-colors duration-220
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
            "
            aria-label="Fermer"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
              <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </a>
        </div>

        {/* Contenu */}
        <div className="px-6 py-5">
          {children}
        </div>
      </div>
    </div>
  )
}
