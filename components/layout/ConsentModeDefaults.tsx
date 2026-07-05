/*
  ConsentModeDefaults — initialise Google Consent Mode v2 dans <head>.

  Ce composant DOIT être placé directement dans le <head> des root layouts
  (app/(fr)/layout.tsx et app/(en)/layout.tsx), pas dans un composant imbriqué.
  Next.js ne hisse pas beforeInteractive vers <head> depuis les composants dans <body>.

  Le script s'exécute avant tout autre JS (avant hydratation, avant gtag.js).
  Ordre garanti dans dataLayer :
    1. consent/default (tout denied) — fallback sécurisé
    2. consent/update depuis localStorage — appliqué synchronement si choix existant
    3. js/new Date()

  Puis, dans GoogleTags (afterInteractive) :
    4. config (send_page_view:false)
    5. page_view initial — avec l'état de consentement déjà correct

  Clé localStorage : 'clikclak-cookie-consent-v1' (identique à lib/cookieConsent.ts).
  Hostname guard : clikclak.ch / www.clikclak.ch uniquement.
  Rendu uniquement si NEXT_PUBLIC_ANALYTICS_ENABLED=true.
*/

const ANALYTICS_ENABLED = process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true'

/*
  Le script lit localStorage synchronement pour appliquer le choix persistant
  AVANT que gtag.js charge. Cas gérés :
    - Aucun choix stocké      → reste denied (fallback)
    - Choix accepté           → update granted avant gtag.js
    - Choix refusé            → update denied (redondant mais explicite)
    - localStorage inaccessible (private mode, erreur) → try/catch → reste denied
*/
const CONSENT_SCRIPT = [
  `if(['clikclak.ch','www.clikclak.ch'].includes(location.hostname)){`,
  `window.dataLayer=window.dataLayer||[];`,
  `function gtag(){dataLayer.push(arguments);}`,
  `gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});`,
  `try{`,
    `var c=JSON.parse(localStorage.getItem('clikclak-cookie-consent-v1')||'null');`,
    `if(c&&typeof c.analytics==='boolean'){`,
      `gtag('consent','update',{`,
        `analytics_storage:c.analytics?'granted':'denied',`,
        `ad_storage:c.marketing?'granted':'denied',`,
        `ad_user_data:c.marketing?'granted':'denied',`,
        `ad_personalization:c.marketing?'granted':'denied'`,
      `});`,
    `}`,
  `}catch(e){}`,
  `gtag('js',new Date());`,
  `}`,
].join('')

export default function ConsentModeDefaults() {
  if (!ANALYTICS_ENABLED) return null
  return <script dangerouslySetInnerHTML={{ __html: CONSENT_SCRIPT }} />
}
