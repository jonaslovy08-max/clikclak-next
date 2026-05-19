// Constantes d'animation ClikClak — source : animations.md
//
// Règle : préférer CSS pur si l'animation est simple (hover, focus, transition).
// Utiliser Framer Motion uniquement pour : menu mobile, accordéons, apparitions complexes.
//
// Framer Motion n'est pas encore installé — ces configs seront utilisées en Phase 3.

/** Transitions Framer Motion — à utiliser quand fm est installé */
export const transitions = {
  spring: { type: 'spring', stiffness: 300, damping: 30 },
  smooth: { ease: [0.43, 0.13, 0.23, 0.96], duration: 0.35 },
  fast:   { duration: 0.18, ease: 'easeOut' },
} as const

/** Durées CSS (utilisées dans Tailwind via duration-{key}) */
export const CSS_DURATIONS = {
  fast:        '150ms',
  interactive: '220ms', // durée principale du design system
  smooth:      '350ms',
} as const

/** Easings CSS */
export const CSS_EASINGS = {
  out:    'ease-out',
  inOut:  'ease-in-out',
  smooth: 'cubic-bezier(0.43, 0.13, 0.23, 0.96)',
} as const
