/*
  data/sonyXperiaRepairs.ts — Source de vérité des tarifs Sony Xperia.
  Ne pas dupliquer ces données dans les pages JSX.
  Tunnel : Réparation → Smartphone → Sony Xperia → [cette page] → Tarifs

  2 familles :
    Xperia Z  → 10 modèles (Z à Z5 Premium)
    Xperia X / XZ → 9 modèles (X à XZ Premium)

  Réparations par modèle :
    Écran & vitre      → category 'screen'  — prix variable
    Batterie           → category 'battery' — 79
    Face arrière       → category 'other'   — 69
    Connecteur de charge → category 'other' — 79
*/

import type { RepairItem, RepairBrandData } from './repairTypes'

/* Construit les réparations d'un modèle Sony depuis le prix d'écran */
function r(ecran: number): RepairItem[] {
  return [
    { label: 'Écran & vitre',          price: ecran, category: 'screen'  },
    { label: 'Batterie',               price: 79,    category: 'battery' },
    { label: 'Face arrière',           price: 69,    category: 'other'   },
    { label: 'Connecteur de charge',   price: 79,    category: 'other'   },
  ]
}

function m(id: string, label: string, ecran: number) {
  return { id, label, repairs: r(ecran) }
}

export const sonyXperiaBrandData: RepairBrandData = {
  h1Prefix:          'Réparation',
  h1Brand:           'Sony Xperia',
  brandIcon:         '/assets/icons/icon-sony-xperia.svg',
  breadcrumbLabel:   'Réparation Sony Xperia Lausanne',
  breadcrumbHref:    '/reparation-smartphone-express/',
  repairNote:        'Les tarifs Sony Xperia sont indicatifs et peuvent varier selon la disponibilité des pièces et l\'état de l\'appareil.',
  searchPlaceholder: 'Rechercher mon Sony Xperia...',

  families: [

    /* ── Xperia Z ── */
    {
      id: 'xperia-z', label: 'Xperia Z', shortLabel: 'Xperia Z',
      models: [
        m('xperia-z',           'Xperia Z',          129),
        m('xperia-z1',          'Xperia Z1',         129),
        m('xperia-z1-compact',  'Xperia Z1 Compact', 129),
        m('xperia-z2',          'Xperia Z2',         129),
        m('xperia-z3',          'Xperia Z3',         139),
        m('xperia-z3-compact',  'Xperia Z3 Compact', 139),
        m('xperia-z3-plus-z4',  'Xperia Z3+ / Z4',   139),
        m('xperia-z5',          'Xperia Z5',         149),
        m('xperia-z5-compact',  'Xperia Z5 Compact', 149),
        m('xperia-z5-premium',  'Xperia Z5 Premium', 179),
      ],
    },

    /* ── Xperia X / XZ ── */
    {
      id: 'xperia-x-xz', label: 'Xperia X / XZ', shortLabel: 'Xperia X / XZ',
      models: [
        m('xperia-x',           'Xperia X',           139),
        m('xperia-x-compact',   'Xperia X Compact',   139),
        m('xperia-xz1',         'Xperia XZ1',         159),
        m('xperia-xz1-compact', 'Xperia XZ1 Compact', 159),
        m('xperia-xz2',         'Xperia XZ2',         159),
        m('xperia-xz2-compact', 'Xperia XZ2 Compact', 159),
        m('xperia-xz3',         'Xperia XZ3',         159),
        m('xperia-xz3-compact', 'Xperia XZ3 Compact', 159),
        m('xperia-xz-premium',  'Xperia XZ Premium',  159),
      ],
    },

  ],
}
