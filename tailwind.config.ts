import type { Config } from 'tailwindcss'

// Design System ClikClak — tous les tokens mappent sur des variables CSS
// Ne jamais ajouter de valeur hexadécimale directe ici (passer par globals.css)
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      // ── Couleurs sémantiques ────────────────────────────────────
      colors: {
        background:  'var(--background)',
        foreground:  'var(--foreground)',

        surface: {
          DEFAULT:    'var(--surface)',
          foreground: 'var(--surface-foreground)',
        },
        muted: {
          DEFAULT:    'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        primary: {
          DEFAULT:    'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        accent: {
          DEFAULT:    'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        card: {
          DEFAULT:    'var(--card)',
          foreground: 'var(--card-foreground)',
        },
        // Token "border" → permet bg-border, text-border, ring-border, etc.
        border:  'var(--border)',
        danger:  'var(--danger)',
        success: 'var(--success)',

        // Alias bruts (usage direct si besoin)
        anthracite: '#191919',
        'grey-mid': '#505050',
        'grey-light': '#f2f2f2',
        lime: '#ccff33',
      },

      // ── Typographie ─────────────────────────────────────────────
      fontFamily: {
        rubik: ['var(--font-rubik)', 'system-ui', 'sans-serif'],
      },

      // ── Rayon des angles ────────────────────────────────────────
      borderRadius: {
        btn:   'var(--radius-btn)',    // 6px
        card:  'var(--radius-card)',   // 12px
        badge: 'var(--radius-badge)',  // 4px
      },

      // ── Durée de transition personnalisée (220ms exact) ─────────
      transitionDuration: {
        '220': '220ms',
      },

      // ── Propriété de transition composable ──────────────────────
      transitionProperty: {
        interactive: 'border-color, box-shadow, transform',
      },

      // ── Box shadow (lueur lime) ──────────────────────────────────
      boxShadow: {
        'glow-lime':      '0 0 28px rgba(204, 255, 51, 0.28)',
        'glow-lime-soft': '0 0 16px rgba(204, 255, 51, 0.18)',
      },
    },
  },
  plugins: [],
}

export default config
