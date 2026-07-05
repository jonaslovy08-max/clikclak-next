/*
  GaNavTracker — suivi des navigations App Router pour Google Analytics 4.

  GoogleTags envoie le page_view initial dans s.onload (après gtag('config',...,{send_page_view:false})).
  Ce composant gère UNIQUEMENT les navigations SPA suivantes (changements de pathname).
  Le premier rendu est ignoré (isFirstRender) pour éviter tout doublon avec le page_view initial.

  Prérequis GA4 : désactiver "Page changes based on browser history events" dans
    GA4 Admin → Flux de données → Événements améliorés → Page views.
    Sans cette désactivation, Enhanced Measurement génère un doublon par navigation SPA.

  No-op si window.gtag n'est pas défini (localhost, staging, avant consentement).
*/
'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function GaNavTracker() {
  const pathname = usePathname()
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    if (typeof window.gtag !== 'function') return
    // page_location (URL complète) est requis par GA4 pour l'attribution correcte.
    // window.location.href reflète la nouvelle URL — déjà mise à jour avant useEffect.
    window.gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path:     pathname,
      page_title:    document.title,
    })
  }, [pathname])

  return null
}
