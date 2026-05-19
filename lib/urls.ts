// Source de vérité des URLs du site
// Ne jamais hardcoder une URL dans un composant — toujours importer depuis ici
// Slugs validés dans docs/SEO_DECISIONS.md

export const URLS = {
  home: '/',
  reparation: '/reparation/',
  reparationExpress: '/reparation-smartphone-express/',
  reparationDegatsEau: '/reparation-degat-eau-lausanne/',

  services: {
    iphone: '/services/reparation-iphone/',
    samsung: '/services/reparation-samsung-lausanne/',
    huawei: '/services/reparation-huawei-lausanne/',
    xiaomi: '/services/reparation-xiaomi/',
    googlePixel: '/services/reparation-google-pixel/',
    oppo: '/services/reparation-oppo/',
    macbook: '/services/reparation-macbook/',
    tablette: '/services/reparation-tablette/',
    domicile: '/services/depannage-reparation-domicile/',
    recuperationDonnees: '/services/recuperation-donnees/',
    transfertDonnees: '/services/transfert-donnees/',
    rachat: '/services/rachat-de-votre-smartphone/',
    nettoyage: '/services/nettoyage/',
  },

  coursier: '/service-de-coursier/',
  contact: '/contact-clik-clak-lausanne/',
  apropos: '/clik-clak-repair-lausanne/',
  cgv: '/cgv/',
  shop: '/shop-reparation-smartphone-lausanne/',

  // Décision §4.7 — URL canonique validée, ancienne URL en 301 pending (Phase 7)
  // NE PAS utiliser cette URL dans les nouveaux liens internes
  _legacyRecuperationDonnees: '/r-cup-ration-de-donn-es/',
} as const
