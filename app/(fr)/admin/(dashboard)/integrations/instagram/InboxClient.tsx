/* eslint-disable react/no-unescaped-entities */
'use client'
/*
  Composants clients pour la boîte de réception Instagram.
  Formulaire de réponse manuelle et bouton d'actualisation.
  Aucun token ni donnée sensible n'est traité côté client.
*/

import { useTransition, useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/* ── Formulaire de réponse manuelle ─────────────────────────────── */

interface ReplyFormProps {
  conversationId: string
  windowExpired:  boolean
  /** conversationId est déjà lié via .bind() — la fonction accepte (text, fd) */
  sendAction:     (text: string, fd: FormData) => Promise<void>
}

export function ReplyForm({ conversationId: _conversationId, windowExpired, sendAction }: ReplyFormProps) {
  void _conversationId
  const [text, setText]         = useState('')
  const [isPending, startTrans] = useTransition()
  const MAX = 1000

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || isPending || windowExpired) return
    /* Générer un submissionId unique par tentative d'envoi.
       Transmis dans FormData — jamais le texte dans Redis. */
    const submissionId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const fd = new FormData()
    fd.set('submissionId', submissionId)
    startTrans(() => {
      void sendAction(text.trim(), fd)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 pt-3 border-t border-white/8">
      {windowExpired ? (
        <p className="text-xs font-rubik text-amber-400/80 px-1">
          La fenêtre de réponse de 24 heures est expirée. Impossible d'envoyer un nouveau message.
        </p>
      ) : (
        <>
          <div className="relative">
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              maxLength={MAX}
              placeholder="Votre réponse…"
              disabled={isPending}
              rows={3}
              className="
                w-full resize-none px-3 py-2 text-sm font-rubik
                bg-white/[0.04] border border-white/10 rounded-card
                text-foreground placeholder:text-foreground/25
                focus:outline-none focus:border-white/20
                disabled:opacity-50
              "
            />
            <span
              className="absolute bottom-2 right-2 text-xs font-rubik"
              style={{ color: text.length > MAX * 0.9 ? 'rgba(251,191,36,0.8)' : 'rgba(242,242,242,0.25)' }}
            >
              {text.length}/{MAX}
            </span>
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="submit"
              disabled={!text.trim() || isPending || text.length > MAX}
              className="
                px-4 py-1.5 text-sm font-rubik font-medium rounded-btn
                bg-accent text-foreground
                hover:bg-accent/90 transition-colors
                disabled:opacity-40 disabled:cursor-not-allowed
              "
            >
              {isPending ? 'Envoi…' : 'Envoyer'}
            </button>
          </div>
        </>
      )}
    </form>
  )
}

/* ── Bouton actualiser ───────────────────────────────────────────── */

export function RefreshButton() {
  const router       = useRouter()
  const [, startTrans] = useTransition()

  function handleRefresh() {
    startTrans(() => { router.refresh() })
  }

  return (
    <button
      onClick={handleRefresh}
      className="
        px-3 py-1.5 text-xs font-rubik rounded-btn
        bg-white/[0.06] border border-white/10
        hover:bg-white/[0.10] transition-colors text-foreground/70
      "
    >
      ↻ Actualiser
    </button>
  )
}

/* ── Auto-refresh (toutes les 5 s si page visible) ───────────────── */

export function AutoRefresh({ intervalMs = 5000 }: { intervalMs?: number }) {
  const router    = useRouter()
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    function startInterval() {
      timerRef.current = setInterval(() => {
        if (!document.hidden) router.refresh()
      }, intervalMs)
    }

    function stopInterval() {
      if (timerRef.current) clearInterval(timerRef.current)
    }

    startInterval()
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopInterval(); else startInterval()
    })

    return () => stopInterval()
  }, [router, intervalMs])

  return null
}
