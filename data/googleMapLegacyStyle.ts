/*
  Style Google Maps JavaScript API (format legacy MapTypeStyle[]).

  Dérivé du design ClikClak : fond #191919, routes grises, textes clairs,
  eau noire, POI masqués, aucune couleur Google visible.

  Compatible avec l'option `styles` de google.maps.MapOptions.
  NE PAS passer mapId simultanément — mapId désactive les styles legacy.
*/

type S = google.maps.MapTypeStyle

export const googleMapLegacyStyle: S[] = [
  /* ── Base globale ─────────────────────────────────────────────────── */
  { elementType: 'geometry',           stylers: [{ color: '#191919' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#d6d6d6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#191919' }] },
  { elementType: 'labels.icon',        stylers: [{ visibility: 'off' }] },

  /* ── Routes ───────────────────────────────────────────────────────── */
  { featureType: 'road',              elementType: 'geometry',           stylers: [{ color: '#2a2a2a' }] },
  { featureType: 'road',              elementType: 'geometry.stroke',    stylers: [{ color: '#111111' }] },
  { featureType: 'road',              elementType: 'labels.text.fill',   stylers: [{ color: '#9a9a9a' }] },
  { featureType: 'road.arterial',     elementType: 'geometry',           stylers: [{ color: '#353535' }] },
  { featureType: 'road.arterial',     elementType: 'geometry.stroke',    stylers: [{ color: '#191919' }] },
  { featureType: 'road.highway',      elementType: 'geometry',           stylers: [{ color: '#3a3a3a' }] },
  { featureType: 'road.highway',      elementType: 'geometry.stroke',    stylers: [{ color: '#1a1a1a' }] },
  { featureType: 'road.highway',      elementType: 'labels.text.fill',   stylers: [{ color: '#c0c0c0' }] },
  { featureType: 'road.local',        elementType: 'geometry',           stylers: [{ color: '#232323' }] },
  { featureType: 'road.local',        elementType: 'geometry.stroke',    stylers: [{ color: '#141414' }] },

  /* ── Eau ──────────────────────────────────────────────────────────── */
  { featureType: 'water', elementType: 'geometry',          stylers: [{ color: '#0f0f0f' }] },
  { featureType: 'water', elementType: 'labels.text.fill',  stylers: [{ color: '#555555' }] },

  /* ── Paysage ──────────────────────────────────────────────────────── */
  { featureType: 'landscape',         elementType: 'geometry', stylers: [{ color: '#191919' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#161616' }] },
  { featureType: 'landscape.man_made',elementType: 'geometry', stylers: [{ color: '#1e1e1e' }] },

  /* ── POI ──────────────────────────────────────────────────────────── */
  { featureType: 'poi',               elementType: 'geometry', stylers: [{ color: '#181818' }] },
  { featureType: 'poi',               elementType: 'labels',   stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park',          elementType: 'geometry', stylers: [{ color: '#161616' }] },
  { featureType: 'poi.business',      stylers:                  [{ visibility: 'off'  }] },
  { featureType: 'poi.medical',       stylers:                  [{ visibility: 'off'  }] },
  { featureType: 'poi.school',        stylers:                  [{ visibility: 'off'  }] },
  { featureType: 'poi.sports_complex',stylers:                  [{ visibility: 'off'  }] },

  /* ── Transit ──────────────────────────────────────────────────────── */
  { featureType: 'transit',           stylers: [{ visibility: 'off' }] },

  /* ── Limites administratives ──────────────────────────────────────── */
  { featureType: 'administrative',          elementType: 'geometry.stroke',  stylers: [{ color: '#444444' }] },
  { featureType: 'administrative',          elementType: 'labels.text.fill', stylers: [{ color: '#b0b0b0' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d0d0d0' }] },
  { featureType: 'administrative.country',  elementType: 'geometry.stroke',  stylers: [{ color: '#4a4a4a' }] },
]
