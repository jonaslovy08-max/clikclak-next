/*
  GoogleTags — initialise Google Consent Mode v2 + charge gtag.js.

  Ordre critique :
    1. Inline script (beforeInteractive) — définit dataLayer, gtag() et positionne
       tous les consentements sur "denied" avant le chargement de tout script tracking.
    2. gtag.js (afterInteractive) — chargé après interactivité.
    3. Config GA / Ads (afterInteractive) — configure les IDs.

  Variables d'environnement :
    NEXT_PUBLIC_GA_ID          — ID Google Analytics (ex: G-XXXXXXXXXX)
    NEXT_PUBLIC_GOOGLE_ADS_ID  — ID Google Ads (ex: AW-XXXXXXXXXX)

  Si aucune des deux variables n'est définie, ce composant ne rend rien.
  CookieConsent continue de fonctionner (applyConsent est no-op si gtag absent).
*/

import Script from 'next/script'

const GA_ID  = process.env.NEXT_PUBLIC_GA_ID
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

export default function GoogleTags() {
  if (!GA_ID && !ADS_ID) return null

  const primaryId = (GA_ID ?? ADS_ID) as string

  return (
    <>
      {/* ── 1. Consent Mode v2 defaults — doit s'exécuter avant gtag.js ── */}
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
      <Script id="gcm-default" strategy="beforeInteractive">{`
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('consent','default',{
          analytics_storage:'denied',
          ad_storage:'denied',
          ad_user_data:'denied',
          ad_personalization:'denied',
          wait_for_update:500
        });
        gtag('js',new Date());
      `}</Script>

      {/* ── 2. Chargement de gtag.js ── */}
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${primaryId}`}
        strategy="afterInteractive"
      />

      {/* ── 3. Configuration des IDs ── */}
      <Script id="gtag-config" strategy="afterInteractive">{`
        ${GA_ID  ? `gtag('config','${GA_ID}');`  : ''}
        ${ADS_ID ? `gtag('config','${ADS_ID}');` : ''}
      `}</Script>
    </>
  )
}
