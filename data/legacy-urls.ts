// Redirections legacy — à implémenter dans next.config.ts en Phase 7
// Source de vérité : docs/SEO_DECISIONS.md + docs/REDIRECTS_LEGACY_CLEAN.csv
// Statuts : VALIDÉ | EN_ATTENTE | REVIEW

export const LEGACY_REDIRECTS = [
  // ── Décisions validées (SEO_DECISIONS.md) ──────────────────────────────

  // §4.7 — URL canonique récupération de données
  { from: '/r-cup-ration-de-donn-es/', to: '/services/recuperation-donnees/', status: 'VALIDÉ' },

  // §4.2 — Chaîne /services/ cassée
  { from: '/services/', to: '/reparation/', status: 'VALIDÉ' },
  { from: '/nos-services/', to: '/reparation/', status: 'VALIDÉ' },
  { from: '/nos-services-reparation/', to: '/reparation/', status: 'VALIDÉ' },

  // §2.2 — Chaîne /contact/ raccourcie
  { from: '/contact/', to: '/contact-clik-clak-lausanne/', status: 'VALIDÉ' },
  { from: '/contact', to: '/contact-clik-clak-lausanne/', status: 'VALIDÉ' },
  { from: '/contact-reparation-smartphone-lausanne-clik-clak-repair/', to: '/contact-clik-clak-lausanne/', status: 'VALIDÉ' },

  // §2.1 — Redirections simples actives
  { from: '/services/reparation-samsung/', to: '/services/reparation-samsung-lausanne/', status: 'VALIDÉ' },
  { from: '/services/reparation-huawei/', to: '/services/reparation-huawei-lausanne/', status: 'VALIDÉ' },
  { from: '/services/reparation-ordinateur/', to: '/services/reparation-macbook/', status: 'VALIDÉ' },
  { from: '/services/reparation-de-tablette/', to: '/services/reparation-tablette/', status: 'VALIDÉ' },
  { from: '/services/reparation-ambulante/', to: '/services/depannage-reparation-domicile/', status: 'VALIDÉ' },
  { from: '/reparation-smartphone/', to: '/reparation-smartphone-express/', status: 'VALIDÉ' },
  { from: '/degat-d-eau/', to: '/reparation-degat-eau-lausanne/', status: 'VALIDÉ' },

  // §2.3 — Pages 404 product iPhone
  { from: '/product/iphone-11-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-11-pro-max-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-11-pro-max-ecran-reparation-copie/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-xs-max-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-xr-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-xs-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-se-2020-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-8-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-8-plus-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-x-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-12-ecranvitre/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-12-mini-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-12-12-pro-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-11-ecran-reparation-2/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/product/iphone-7-ecran-reparation/', to: '/services/reparation-iphone/', status: 'VALIDÉ' },

  // §2.4 — URLs GSC avec trafic
  { from: '/categorie-produit/reparation-smartphone/', to: '/reparation-smartphone-express/', status: 'VALIDÉ' },
  { from: '/produit/samsung-galaxy-s7-ecran-reparation/', to: '/services/reparation-samsung-lausanne/', status: 'VALIDÉ' },

  // §2.5 — Yoast critiques
  { from: '/shop', to: '/shop-reparation-smartphone-lausanne/', status: 'VALIDÉ' },
  { from: '/qui-sommes-nous', to: '/clik-clak-repair-lausanne/', status: 'VALIDÉ' },
  { from: '/reparations-apple', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/reparation-apple', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/services/reparation-iphone-prix', to: '/services/reparation-iphone/', status: 'VALIDÉ' },
  { from: '/services/reparation-google-pixel-lausanne', to: '/services/reparation-google-pixel/', status: 'VALIDÉ' },
  { from: '/degat-eau', to: '/reparation-degat-eau-lausanne/', status: 'VALIDÉ' },
  { from: '/reparation-degat-deau', to: '/reparation-degat-eau-lausanne/', status: 'VALIDÉ' },
  { from: '/reparation-degat-deau-a-lausanne', to: '/reparation-degat-eau-lausanne/', status: 'VALIDÉ' },
  { from: '/services/water-damage', to: '/reparation-degat-eau-lausanne/', status: 'VALIDÉ' },
  { from: '/services/cracked-screen', to: '/reparation-smartphone-express/', status: 'VALIDÉ' },
  { from: '/services/reparation-smartphone-a-domicile', to: '/services/depannage-reparation-domicile/', status: 'VALIDÉ' },
  { from: '/reparation-smartphone-par-coursier', to: '/service-de-coursier/', status: 'VALIDÉ' },
  { from: '/services/reparations-rapides', to: '/reparation-smartphone-express/', status: 'VALIDÉ' },
  { from: '/services_group/services', to: '/reparation/', status: 'VALIDÉ' },
  { from: '/services', to: '/reparation/', status: 'VALIDÉ' },

  // ── En attente de validation (ne pas implémenter sans confirmation) ──

  { from: '/design-communication', to: '/', status: 'REVIEW' },
  { from: '/assurance', to: '/', status: 'REVIEW' },
  { from: '/locations-utilitaires', to: '/', status: 'REVIEW' },
] as const
