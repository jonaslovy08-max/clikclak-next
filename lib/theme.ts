// Tokens du design system ClikClak — source : clikclak-design-system.md
// Utiliser ces constantes dans les composants, jamais de valeurs hexadécimales directes.
// Les CSS vars correspondantes sont définies dans app/globals.css.

export const COLORS = {
  background:  '#191919',
  foreground:  '#ffffff',
  surface:     '#f2f2f2',
  muted:       '#505050',
  primary:     '#ccff33',
  card:        '#191919',
  danger:      '#ef4444',
  success:     '#22c55e',
} as const

export const CSS_VARS = {
  background:         'var(--background)',
  foreground:         'var(--foreground)',
  surface:            'var(--surface)',
  surfaceForeground:  'var(--surface-foreground)',
  muted:              'var(--muted)',
  mutedForeground:    'var(--muted-foreground)',
  primary:            'var(--primary)',
  primaryForeground:  'var(--primary-foreground)',
  accent:             'var(--accent)',
  accentForeground:   'var(--accent-foreground)',
  card:               'var(--card)',
  cardForeground:     'var(--card-foreground)',
  border:             'var(--border)',
  borderSoft:         'var(--border-soft)',
  borderAccent:       'var(--border-accent)',
  gridLine:           'var(--grid-line)',
  overlayDark:        'var(--overlay-dark)',
  danger:             'var(--danger)',
  success:            'var(--success)',
  fontRubik:          'var(--font-rubik)',
} as const

export const RADIUS = {
  btn:   'var(--radius-btn)',   // 6px
  card:  'var(--radius-card)',  // 12px
  badge: 'var(--radius-badge)', // 4px
} as const

export const FONT_WEIGHTS = {
  light:     '300', // textes fins, légendes
  regular:   '400', // texte courant
  medium:    '500', // navigation, boutons, labels
  semibold:  '600', // titres secondaires
  bold:      '700', // titres forts
  extrabold: '800', // gros titres
  black:     '900', // hero uniquement
} as const

// Transition centralisée — correspond à --transition-interactive
export const TRANSITION_INTERACTIVE = 'border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease'
