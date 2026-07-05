/*
  GoogleTags — initialise Google Consent Mode v2 + charge gtag.js.

  Ordre critique :
    1. ConsentModeDefaults (dans <head> des root layouts) — définit dataLayer, gtag() et
       positionne tous les consentements sur "denied" avant tout autre script.
       Ce composant est SÉPARÉ de GoogleTags pour garantir la présence dans <head>.
    2. Script afterInteractive (ce composant) — charge gtag.js dynamiquement uniquement
       si hostname autorisé, puis configure les IDs dans le callback onload.

  Variables d'environnement :
    NEXT_PUBLIC_ANALYTICS_ENABLED   — "true" uniquement en production clikclak.ch
    NEXT_PUBLIC_GA_MEASUREMENT_ID   — ID Google Analytics 4 (ex: G-XXXXXXXXXX)  ← prioritaire
    NEXT_PUBLIC_GA_ID               — (déprécié) alias de NEXT_PUBLIC_GA_MEASUREMENT_ID
    NEXT_PUBLIC_GOOGLE_ADS_ID       — ID Google Ads (ex: AW-XXXXXXXXXX)

  Double protection contre tout chargement hors production :
    1. NEXT_PUBLIC_ANALYTICS_ENABLED=true (build-time) — absent → null immédiat.
       Ne jamais définir en staging, preview ou localhost.
    2. Hostname guard (client-side) — autorise uniquement clikclak.ch / www.clikclak.ch.
       Empêche tout chargement même si la variable est mal configurée.

  Stratégie page_view (anti-doublon) :
    - send_page_view:false dans gtag('config') désactive le page_view automatique.
    - Un page_view initial est envoyé explicitement dans s.onload, après config.
    - Les navigations App Router suivantes sont tracées par GaNavTracker (usePathname).
    - Enhanced Measurement > "Page changes based on browser history events" DOIT être
      désactivé dans GA4 Admin — sinon doublons sur chaque navigation SPA.
      Chemin : GA4 Admin → Flux de données → → Événements améliorés → Page views →
               Désactiver "Page changes based on browser history events".

  Modèle de consentement : Consent Mode v2 AVANCÉ.
    - analytics_storage:'denied' bloque les cookies Analytics.
    - Mais des signaux sans cookies (cookieless pings) peuvent être transmis à Google
      pour le modelling de conversion, même avant consentement explicite.
    - Pour zéro transmission avant consentement (mode Basique), il faudrait charger
      gtag.js uniquement après acceptation — non implémenté ici.
    - Toute modification du modèle requiert une validation préalable.

  CookieConsent : applyConsent() est no-op si window.gtag n'est pas défini.
*/

import Script from 'next/script'

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'
const GA_ID  = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? process.env.NEXT_PUBLIC_GA_ID
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

const ALLOWED_HOSTS = `['clikclak.ch','www.clikclak.ch'].includes(location.hostname)`

export default function GoogleTags() {
  if (!ANALYTICS_ENABLED) return null
  if (!GA_ID && !ADS_ID) return null

  const primaryId = (GA_ID ?? ADS_ID) as string

  // GA4 : send_page_view:false — le page_view initial est envoyé manuellement ci-dessous.
  // Google Ads : pas de send_page_view (comportement par défaut, sans page_view auto).
  const configCalls = [
    GA_ID  ? `gtag('config','${GA_ID}',{send_page_view:false});`  : '',
    ADS_ID ? `gtag('config','${ADS_ID}');` : '',
  ].filter(Boolean).join('\n            ')

  // Page_view initial envoyé après config (send_page_view:false l'aurait supprimé).
  // page_location (URL complète) est requis par GA4 pour l'attribution correcte.
  // Les navigations suivantes sont gérées par GaNavTracker.
  const initialPageView = GA_ID
    ? `\n            gtag('event','page_view',{page_location:location.href,page_path:location.pathname,page_title:document.title});`
    : ''

  return (
    // ConsentModeDefaults est dans <head> des root layouts — séparé de ce composant.
    // Ce composant ne gère que le chargement de gtag.js (afterInteractive, dans <body>).
    <Script id="gtag-load" strategy="afterInteractive">{`
      if (${ALLOWED_HOSTS}) {
        var s=document.createElement('script');
        s.src='https://www.googletagmanager.com/gtag/js?id=${primaryId}';
        s.async=true;
        s.onload=function(){
          if (typeof gtag==='function') {
            ${configCalls}${initialPageView}
          }
        };
        document.head.appendChild(s);
      }
    `}</Script>
  )
}
