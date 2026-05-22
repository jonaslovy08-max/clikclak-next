'use client'

import { useState, useEffect, useRef } from 'react'

/*
  ShareButton — bouton de partage global.

  Priorité : Web Share API native (mobile, Safari, certains Chrome).
  Fallback  : dropdown discret avec WhatsApp, Facebook, Email, Copier le lien.

  Hydration :
    fullUrl est calculé côté client uniquement (useEffect) pour éviter
    tout mismatch SSR. Le composant accepte une URL absolue ou relative.
    Relative (?model=xxx) → résolue sur window.location.pathname.
    Chemin (/path) → résolue sur window.location.origin.

  SSR :
    Aucun accès à window au render — uniquement dans les handlers et useEffect.

  Props :
    title    — titre du partage (affiché dans la sheet native)
    text     — description courte
    url      — URL absolue, chemin absolu (/path) ou query (?model=xxx)
    className — classe supplémentaire sur le wrapper
*/

type Props = {
  title:     string
  text:      string
  url:       string
  className?: string
}

export default function ShareButton({ title, text, url, className }: Props) {
  const [open,    setOpen]    = useState(false)
  const [copied,  setCopied]  = useState(false)
  const [fullUrl, setFullUrl] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  /* ── Résolution URL côté client uniquement ── */
  useEffect(() => {
    if (url.startsWith('http')) {
      setFullUrl(url)
    } else if (url.startsWith('/')) {
      setFullUrl(`${window.location.origin}${url}`)
    } else {
      /* query string relative, ex: ?model=iphone-15-pro */
      const qs = url.startsWith('?') ? url : `?${url}`
      setFullUrl(`${window.location.origin}${window.location.pathname}${qs}`)
    }
  }, [url])

  /* ── Fermeture du dropdown au clic extérieur ── */
  useEffect(() => {
    if (!open) return
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  /* ── Clic principal ── */
  const handleClick = async () => {
    const u = fullUrl || url
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await (navigator as Navigator).share({ title, text, url: u })
      } catch {
        /* annulation utilisateur — silencieux */
      }
    } else {
      setOpen(v => !v)
    }
  }

  /* ── Copier le lien (titre + URL pour un partage enrichi) ── */
  const copyLink = async () => {
    try {
      const u    = fullUrl || url
      const copy = title ? `${title}\n${u}` : u
      await navigator.clipboard.writeText(copy)
      setCopied(true)
      setOpen(false)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      /* silencieux si permission refusée */
    }
  }

  /* ── URLs encodées pour le fallback ── */
  const u    = encodeURIComponent(fullUrl || url)
  const t    = encodeURIComponent(title)
  const body = encodeURIComponent(`${text}\n\n${fullUrl || url}`)
  const wa   = encodeURIComponent(`${title} — ${text}\n${fullUrl || url}`)

  const ITEMS = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${wa}`,                                     external: true  },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,             external: true  },
    { label: 'Email',    href: `mailto:?subject=${t}&body=${body}`,                             external: false },
  ]

  return (
    <div
      ref={ref}
      className={`relative inline-flex items-center gap-2${className ? ` ${className}` : ''}`}
    >
      <button
        type="button"
        onClick={handleClick}
        aria-expanded={open}
        className="flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm transition-colors"
        style={{ color: copied && !open ? '#ccff33' : '#a0a0a0' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/ui/icon-share.svg"
          alt=""
          aria-hidden
          style={{ height: 14, width: 14, objectFit: 'contain', opacity: 0.7 }}
        />
        <span style={{ fontSize: 13, letterSpacing: '0.03em' }}>
          {copied && !open ? 'Lien copié ✓' : 'Partager'}
        </span>
      </button>

      {/* ── Dropdown fallback ── */}
      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 flex flex-col rounded-lg overflow-hidden"
          style={{
            minWidth:        190,
            background:      'rgba(22, 22, 22, 0.97)',
            border:          '1px solid rgba(242,242,242,0.12)',
            backdropFilter:  'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          role="menu"
          aria-label="Options de partage"
        >
          {ITEMS.map((item, i) => (
            <a
              key={item.label}
              href={item.href}
              target={item.external ? '_blank' : undefined}
              rel={item.external ? 'noopener noreferrer' : undefined}
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center px-4 py-3 text-sm font-light transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:bg-white/[0.06]"
              style={{
                color:       'rgba(242,242,242,0.72)',
                ...(i > 0 ? { borderTop: '1px solid rgba(242,242,242,0.06)' } : {}),
              }}
            >
              {item.label}
            </a>
          ))}
          <button
            type="button"
            onClick={copyLink}
            role="menuitem"
            className="flex items-center px-4 py-3 text-sm font-light transition-colors hover:bg-white/[0.06] focus-visible:outline-none focus-visible:bg-white/[0.06] text-left"
            style={{
              color:      copied ? '#ccff33' : 'rgba(242,242,242,0.72)',
              borderTop:  '1px solid rgba(242,242,242,0.06)',
            }}
          >
            {copied ? 'Lien copié ✓' : 'Copier le lien'}
          </button>
        </div>
      )}
    </div>
  )
}
