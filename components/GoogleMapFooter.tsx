'use client'

import { useEffect, useRef } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import { googleMapLegacyStyle } from '@/data/googleMapLegacyStyle'

/*
  Carte Google Maps — footer ClikClak.

  Stratégie de style :
    Les options `styles` (legacy) et `mapId` (cloud) sont mutuellement exclusives.
    On utilise exclusivement les styles legacy (googleMapLegacyStyle) pour garantir
    le rendu sombre/noir-blanc. Le mapId n'est donc PAS passé aux MapOptions.

  Marker :
    google.maps.Marker legacy avec icône SVG lime #CCFF33.
    (AdvancedMarkerElement requiert mapId — incompatible avec legacy styles.)
*/

/* Clik Clak Repair — coordonnées GPS exactes du local */
const CENTER = { lat: 46.51860333098784, lng: 6.6310497432510624 }

/* Pin SVG lime — teardrop avec point central sombre */
const PIN_SVG = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44" fill="none">',
  '<path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="#CCFF33"/>',
  '<circle cx="16" cy="16" r="6" fill="#191919"/>',
  '</svg>',
].join('')

export default function GoogleMapFooter() {
  const mapRef = useRef<HTMLDivElement>(null)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  useEffect(() => {
    if (!apiKey || !mapRef.current) return
    let active = true

    setOptions({ key: apiKey, v: 'weekly' })

    importLibrary('maps').then(({ Map }) => {
      if (!active || !mapRef.current) return

      const map = new Map(mapRef.current, {
        center:           CENTER,
        zoom:             18,
        styles:           googleMapLegacyStyle,
        disableDefaultUI: true,
        scrollwheel:      false,
        gestureHandling:  'none',
        clickableIcons:   false,
      })

      /* Marker legacy — disponible sur le namespace global après importLibrary('maps') */
      new google.maps.Marker({
        position: CENTER,
        map,
        title:    'Clik Clak Repair',
        icon: {
          url:        `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(PIN_SVG)}`,
          scaledSize: new google.maps.Size(32, 44),
          anchor:     new google.maps.Point(16, 44),
        },
      })
    }).catch(() => { /* silently ignore — placeholder visible si erreur */ })

    return () => { active = false }
  }, [apiKey])

  /* Placeholder — clé API absente */
  if (!apiKey) {
    return (
      <div
        aria-hidden="true"
        style={{
          height:          'clamp(280px, 30vw, 460px)',
          backgroundColor: '#141414',
          borderTop:       '1px solid rgba(242,242,242,0.08)',
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 300, color: 'rgba(242,242,242,0.25)' }}>
          Carte indisponible pour le moment
        </span>
      </div>
    )
  }

  return (
    <div
      ref={mapRef}
      role="img"
      aria-label="Localisation Clik Clak Repair — Rue du Petit-Chêne 9b, Lausanne"
      style={{ height: 'clamp(280px, 30vw, 460px)' }}
    />
  )
}
