import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  // ================================================================
  // HEADERS DE SÉCURITÉ
  // ================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',         value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy',         value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',      value: 'camera=(), microphone=(), geolocation=()' },
          /*
            CSP intentionnellement non activée — le site utilise :
              Cloudflare Turnstile (challenges.cloudflare.com)
              Google Maps (maps.googleapis.com)
              images / scripts internes + GSAP CDN possible
            À activer progressivement après tests complets en staging.
          */
        ],
      },
    ]
  },

  // ================================================================
  // REDIRECTIONS — à implémenter en Phase 7
  // Toute modification doit être validée dans docs/SEO_DECISIONS.md
  // ================================================================
  async redirects() {
    return [
      /* §4.7 — Ancienne URL récupération de données (encodée WP) */
      { source: '/r-cup-ration-de-donn-es',  destination: '/services/recuperation-donnees', permanent: true },
      { source: '/r-cup-ration-de-donn-es/', destination: '/services/recuperation-donnees', permanent: true },

      /* /services/depannage → /services/depannage-reparation-domicile */
      { source: '/services/depannage',  destination: '/services/depannage-reparation-domicile', permanent: true },
      { source: '/services/depannage/', destination: '/services/depannage-reparation-domicile', permanent: true },

      /* §2.2 — /contact → /contact-clik-clak-lausanne */
      { source: '/contact',  destination: '/contact-clik-clak-lausanne', permanent: true },
      { source: '/contact/', destination: '/contact-clik-clak-lausanne', permanent: true },

      /* §2.5 — /shop → /shop-reparation-smartphone-lausanne */
      { source: '/shop',  destination: '/shop-reparation-smartphone-lausanne', permanent: true },
      { source: '/shop/', destination: '/shop-reparation-smartphone-lausanne', permanent: true },

      /* §4.2 — /services → /reparation */
      { source: '/services',  destination: '/reparation', permanent: true },
      { source: '/services/', destination: '/reparation', permanent: true },

      /* ── Legacy WordPress — ajoutées Phase 3 SEO ─────────────────── */
      /* Ancienne page contact */
      { source: '/contact-reparation-smartphone-lausanne-clik-clak-repair',  destination: '/contact-clik-clak-lausanne', permanent: true },
      { source: '/contact-reparation-smartphone-lausanne-clik-clak-repair/', destination: '/contact-clik-clak-lausanne', permanent: true },

      /* Ancienne page "Qui sommes-nous" */
      { source: '/qui-sommes-nous',  destination: '/clik-clak-repair-lausanne', permanent: true },
      { source: '/qui-sommes-nous/', destination: '/clik-clak-repair-lausanne', permanent: true },

      /* Dégâts d'eau — plusieurs variantes WP */
      { source: '/degat-eau',                       destination: '/reparation-degat-eau-lausanne', permanent: true },
      { source: '/degat-eau/',                      destination: '/reparation-degat-eau-lausanne', permanent: true },
      { source: '/reparation-degat-deau-a-lausanne',  destination: '/reparation-degat-eau-lausanne', permanent: true },
      { source: '/reparation-degat-deau-a-lausanne/', destination: '/reparation-degat-eau-lausanne', permanent: true },
      { source: '/reparation-degat-deau',           destination: '/reparation-degat-eau-lausanne', permanent: true },
      { source: '/reparation-degat-deau/',          destination: '/reparation-degat-eau-lausanne', permanent: true },

      /* Ancien service coursier WP */
      { source: '/reparation-smartphone-par-coursier',  destination: '/service-de-coursier', permanent: true },
      { source: '/reparation-smartphone-par-coursier/', destination: '/service-de-coursier', permanent: true },
    ]
  },

  // ================================================================
  // DIAGNOSTIC TEMPORAIRE — concurrence de génération statique
  // Conteneur Infomaniak : 64 CPU visibles / ~954 Mo cgroup, sans swap.
  // Next dimensionne le pool de workers sur les CPU (64) → OOM/SIGABRT
  // à « Generating static pages (0/478) ». cpus:1 force 1 seul worker.
  // Réversible — à retirer une fois la cause mémoire traitée à la source.
  // ================================================================
  experimental: {
    cpus: 1,
  },

  // ================================================================
  // HTTPS — Vercel enforce HTTPS automatiquement.
  // Si déploiement hors Vercel : ajouter un middleware HTTP→HTTPS.
  // Voir docs/SEO_DECISIONS.md §4.6
  // ================================================================
}

export default withNextIntl(nextConfig)
