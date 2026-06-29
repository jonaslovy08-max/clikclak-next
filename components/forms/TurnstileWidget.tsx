'use client'

/*
  TurnstileWidget — widget Cloudflare Turnstile pour la protection anti-spam.

  Variables d'environnement :
    NEXT_PUBLIC_TURNSTILE_SITE_KEY : clé publique (client)
    TURNSTILE_SECRET_KEY           : clé secrète (serveur uniquement, jamais exposée)

  Comportement :
    - Si NEXT_PUBLIC_TURNSTILE_SITE_KEY est configurée → widget réel, token généré.
    - Si la clé est absente (développement) → message discret, aucun blocage.
    - La vérification serveur est dans app/api/contact/route.ts.

  Le script Cloudflare est chargé une seule fois globalement, même si
  plusieurs instances de ce composant coexistent.
*/

import { useEffect, useRef } from 'react'

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

/* ── Types globaux Turnstile ── */
declare global {
  interface Window {
    turnstile?: {
      render:  (el: HTMLElement, opts: TurnstileOpts) => string
      reset:   (id: string) => void
      remove:  (id: string) => void
    }
    __ckTsDone?:   boolean
    __ckTsCbs?:    Array<() => void>
    __ckTsOnLoad?: () => void
  }
}

interface TurnstileOpts {
  sitekey:             string
  callback:            (token: string) => void
  'expired-callback':  () => void
  'error-callback':    () => void
  theme:               'dark'
}

/* ── Chargement singleton du script Cloudflare ── */
function ensureTurnstile(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.__ckTsDone && window.turnstile) return Promise.resolve()

  if (!window.__ckTsCbs) window.__ckTsCbs = []

  return new Promise<void>((resolve) => {
    if (window.__ckTsDone && window.turnstile) { resolve(); return }
    window.__ckTsCbs!.push(resolve)

    if (!document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]')) {
      window.__ckTsOnLoad = () => {
        window.__ckTsDone = true
        ;(window.__ckTsCbs ?? []).forEach(r => r())
        window.__ckTsCbs = []
      }
      const s    = document.createElement('script')
      s.src      = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__ckTsOnLoad'
      s.async    = true
      document.head.appendChild(s)
    }
  })
}

/* ── Composant ── */
export default function TurnstileWidget({ onToken, locale = 'fr' }: { onToken: (token: string | null) => void; locale?: 'fr' | 'en' }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef  = useRef<string | null>(null)
  const cbRef        = useRef(onToken)

  useEffect(() => { cbRef.current = onToken }, [onToken])

  useEffect(() => {
    if (!SITE_KEY) return

    let cancelled = false

    ensureTurnstile().then(() => {
      if (cancelled || !containerRef.current || widgetIdRef.current || !window.turnstile) return
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey:            SITE_KEY,
        callback:           (t)  => cbRef.current(t),
        'expired-callback': ()   => cbRef.current(null),
        'error-callback':   ()   => cbRef.current(null),
        theme:              'dark',
      })
    })

    return () => {
      cancelled = true
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  /* Développement sans clé → message discret, formulaire non bloqué */
  if (!SITE_KEY) {
    return (
      <p className="text-xs font-light" style={{ color: 'rgba(242,242,242,0.28)' }}>
        {locale === 'en'
          ? 'Anti-spam protection (development mode — key not configured)'
          : 'Protection anti-spam (mode développement — clé non configurée)'}
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-light uppercase tracking-[0.1em]" style={{ color: 'rgba(242,242,242,0.35)' }}>
        {locale === 'en' ? 'Anti-spam protection' : 'Protection anti-spam'}
      </p>
      <div ref={containerRef} />
    </div>
  )
}
