'use client'

/*
  SmoothAnchorLinks — intercepteur global de clics sur href="#section".

  Sans cet intercepteur, les ancres (#selection-service, #contact, etc.)
  provoquent un saut instantané. Ce composant remplace ce comportement
  par un scroll smooth calculé manuellement (même pattern que
  selectModelAndScroll dans /reparation-iphone).

  Portée : tous les <a href="#..."> de la page courante.

  Exclusions (comportement natif conservé) :
    — href="#" seul (aucune cible)
    — cible introuvable dans le DOM
    — prefers-reduced-motion : scroll instant (behavior:'auto')
    — Cmd/Ctrl + clic, clic molette → non interceptés

  Offset : 24px au-dessus de la section cible — cohérent avec
  selectModelAndScroll et scrollIntoView offset utilisés ailleurs.
*/

import { useEffect } from 'react'

export default function SmoothAnchorLinks() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      /* Ignorer les clics modificateurs (nouvel onglet, etc.) */
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return

      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href]')
      if (!a) return

      const href = a.getAttribute('href') ?? ''
      if (!href.startsWith('#') || href.length <= 1) return

      const id = href.slice(1)
      const el = document.getElementById(id)
      if (!el) return

      e.preventDefault()

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const y = el.getBoundingClientRect().top + window.scrollY - 24

      window.scrollTo({ top: y, behavior: reduced ? 'auto' : 'smooth' })
    }

    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  return null
}
