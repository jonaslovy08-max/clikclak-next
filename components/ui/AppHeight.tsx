'use client'

import { useEffect } from 'react'

/*
  AppHeight — définit --app-height via window.innerHeight (px).

  Résout le bug Safari iOS : svh/dvh sont instables ou non supportés
  (iOS < 16.4). window.innerHeight reflète toujours la vraie hauteur
  visible, barre d'adresse et toolbar exclues.

  CSS consommateur :
    .hero-main-wrap { min-height: var(--app-height); }

  Fallback CSS :root { --app-height: 100vh } défini dans globals.css
  pour le rendu avant hydration JS.
*/
export default function AppHeight() {
  useEffect(() => {
    const set = () =>
      document.documentElement.style.setProperty(
        '--app-height',
        `${window.innerHeight}px`,
      )
    set()
    /* resize retiré : sur iOS Safari, il se déclenche quand la barre d'adresse
       se masque au scroll, ce qui mettait à jour --app-height et provoquait
       un jump de layout. orientationchange (rotation) conservé. */
    window.addEventListener('orientationchange', set)
    return () => {
      window.removeEventListener('orientationchange', set)
    }
  }, [])
  return null
}
