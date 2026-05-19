import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ================================================================
  // REDIRECTIONS — à implémenter en Phase 7
  // Toute modification doit être validée dans docs/SEO_DECISIONS.md
  // ================================================================
  async redirects() {
    return [
      /* §4.7 — Redirection permanente ancienne URL récupération de données */
      {
        source:      '/r-cup-ration-de-donn-es',
        destination: '/services/recuperation-donnees',
        permanent:   true,
      },
      {
        source:      '/r-cup-ration-de-donn-es/',
        destination: '/services/recuperation-donnees',
        permanent:   true,
      },
      /* /services/depannage → /services/depannage-reparation-domicile */
      {
        source:      '/services/depannage',
        destination: '/services/depannage-reparation-domicile',
        permanent:   true,
      },
      {
        source:      '/services/depannage/',
        destination: '/services/depannage-reparation-domicile',
        permanent:   true,
      },
      /* §2.2 — /contact → /contact-clik-clak-lausanne */
      {
        source:      '/contact',
        destination: '/contact-clik-clak-lausanne',
        permanent:   true,
      },
      {
        source:      '/contact/',
        destination: '/contact-clik-clak-lausanne',
        permanent:   true,
      },
      /* §2.5 — /shop → /shop-reparation-smartphone-lausanne */
      {
        source:      '/shop',
        destination: '/shop-reparation-smartphone-lausanne',
        permanent:   true,
      },
      {
        source:      '/shop/',
        destination: '/shop-reparation-smartphone-lausanne',
        permanent:   true,
      },
      /* §4.2 — /services → /reparation */
      {
        source:      '/services',
        destination: '/reparation',
        permanent:   true,
      },
      {
        source:      '/services/',
        destination: '/reparation',
        permanent:   true,
      },
    ]
  },

  // ================================================================
  // HTTPS — Vercel enforce HTTPS automatiquement.
  // Si déploiement hors Vercel : ajouter un middleware HTTP→HTTPS.
  // Voir docs/SEO_DECISIONS.md §4.6
  // ================================================================
}

export default nextConfig
