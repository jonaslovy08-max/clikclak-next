/*
  data/samsungRepairs.ts — Source de vérité des tarifs Samsung.
  Ne pas dupliquer ces données dans les pages JSX.
  Tunnel : Réparation → Smartphone → Samsung → [cette page] → Tarifs
*/

import type { RepairItem, RepairModel, RepairBrandData } from './repairTypes'

/* ── Helpers ── */
type SRepairsOpts = {
  ecran: number | string
  batt:  number | string
  face:  number
  camP:  number
  camF:  number
  lent:  number
  conn:  number | string
  extra?: RepairItem[]
}

function sRepairs(o: SRepairsOpts): RepairItem[] {
  const r: RepairItem[] = [
    { label: 'Écran & vitre',               price: o.ecran as number, category: 'screen'  },
    { label: 'Batterie',                     price: o.batt  as number, category: 'battery' },
    { label: 'Face arrière',                 price: o.face,            category: 'other'   },
    { label: 'Caméra principale',            price: o.camP,            category: 'other'   },
    { label: 'Caméra frontale',              price: o.camF,            category: 'other'   },
    { label: 'Lentille caméra',              price: o.lent,            category: 'other'   },
    { label: 'Connecteur de charge ou NFC',  price: o.conn as number,  category: 'other'   },
  ]
  if (o.extra) r.push(...o.extra)
  return r
}

const SD: SRepairsOpts = { ecran: 'Sur demande', batt: 'Sur demande', face: 0, camP: 0, camF: 0, lent: 0, conn: 'Sur demande' }
function surDemande(): RepairItem[] {
  return [
    { label: 'Écran & vitre',               price: 'Sur demande', category: 'screen'  },
    { label: 'Batterie',                     price: 'Sur demande', category: 'battery' },
    { label: 'Face arrière',                 price: 'Sur demande', category: 'other'   },
    { label: 'Caméra principale',            price: 'Sur demande', category: 'other'   },
    { label: 'Caméra frontale',              price: 'Sur demande', category: 'other'   },
    { label: 'Lentille caméra',              price: 'Sur demande', category: 'other'   },
    { label: 'Connecteur de charge ou NFC',  price: 'Sur demande', category: 'other'   },
  ]
}
void SD

function aModern(ecran: number): RepairItem[] {
  return [
    { label: 'Écran & vitre',      price: ecran, category: 'screen'  },
    { label: 'Batterie',           price: 79.99, category: 'battery' },
    { label: 'Face arrière',       price: 69.99, category: 'other'   },
    { label: 'Connecteur de charge', price: 89.99, category: 'other' },
    { label: 'Caméra',             price: 79.99, category: 'other'   },
    { label: 'Lentille caméra',    price: 79.99, category: 'other'   },
  ]
}

function aAncien(ecran: number): RepairItem[] {
  return [
    { label: 'Écran & vitre',      price: ecran, category: 'screen'  },
    { label: 'Batterie',           price: 79.99, category: 'battery' },
    { label: 'Face arrière',       price: 79.99, category: 'other'   },
    { label: 'Connecteur de charge', price: 79.99, category: 'other' },
  ]
}

function jRepairs(ecran: number): RepairItem[] {
  return [
    { label: 'Écran & vitre',      price: ecran, category: 'screen'  },
    { label: 'Batterie',           price: 89.99, category: 'battery' },
    { label: 'Face arrière',       price: 79.99, category: 'other'   },
    { label: 'Connecteur de charge', price: 79.99, category: 'other' },
  ]
}

const s25 = { face: 89.99, camP: 99.99, camF: 99.99, lent: 85.99, conn: 89.99 }
const s24 = { face: 89.99, camP: 99.99, camF: 99.99, lent: 85.99, conn: 89.99 }
const s23 = { face: 89.99, camP: 99.99, camF: 99.99, lent: 85.99, conn: 89.99 }
const s22 = { face: 89.99, camP: 99.99, camF: 99.99, lent: 85.99, conn: 89.99 }
const s21 = { face: 99.99, camP: 129.99, camF: 159.99, lent: 85.99, conn: 99.99 }
const s20 = { face: 89.99, camP: 99.99, camF: 99.99, lent: 85.99, conn: 99.99 }
const s10 = { face: 89.99, camP: 99.99, camF: 89.99, lent: 85.99, conn: 99.99 }
const s9  = { face: 89.99, camP: 99.99, camF: 89.99, lent: 79.99, conn: 99.99 }
const s8  = { face: 79.99, camP: 99.99, camF: 89.99, lent: 69.99, conn: 99.99 }
const s7  = { face: 69.99, camP: 99.99, camF: 89.99, lent: 69.99, conn: 79.99 }
const s6  = { face: 49.99, camP: 99.99, camF: 89.99, lent: 69.99, conn: 'Ne peut pas être remplacé' as const }
const s5  = { face: 49.99, camP: 59.99, camF: 49.99, lent: 49.99, conn: 59.99 }
const s4extra: RepairItem[] = [
  { label: 'Bouton Home',   price: 45.99, category: 'other' },
  { label: 'Bouton Power',  price: 45.99, category: 'other' },
  { label: 'Bouton Volume', price: 45.99, category: 'other' },
]

function m(id: string, label: string, repairs: RepairItem[]): RepairModel {
  return { id, label, repairs }
}

export const samsungBrandData: RepairBrandData = {
  h1Prefix:           'Réparation',
  h1Brand:            'Samsung',
  brandIcon:          '/assets/icons/icon-samsung.svg',
  breadcrumbLabel:    'Réparation Samsung Lausanne',
  breadcrumbHref:     '/reparation-smartphone-express/',
  initialFamilyCount: 6,
  repairNote:         'La plupart des réparations Samsung sont réalisées en boutique à Lausanne. Délai estimé selon la disponibilité des pièces.',
  searchPlaceholder:  'Rechercher mon Samsung...',

  families: [
    {
      id: 'galaxy-s26', label: 'Galaxy S26', shortLabel: 'S26', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s26-ultra', 'Galaxy S26 Ultra', surDemande()),
        m('galaxy-s26-plus',  'Galaxy S26+',      surDemande()),
        m('galaxy-s26',       'Galaxy S26',       surDemande()),
      ],
    },
    {
      id: 'galaxy-s25', label: 'Galaxy S25', shortLabel: 'S25', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s25-ultra', 'Galaxy S25 Ultra', sRepairs({ ...s25, ecran: 289.99, batt: 99.99 })),
        m('galaxy-s25-plus',  'Galaxy S25+',      sRepairs({ ...s25, ecran: 259.99, batt: 99.99 })),
        m('galaxy-s25',       'Galaxy S25',       sRepairs({ ...s25, ecran: 199.99, batt: 99.99 })),
      ],
    },
    {
      id: 'galaxy-s24', label: 'Galaxy S24', shortLabel: 'S24', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s24-ultra', 'Galaxy S24 Ultra', sRepairs({ ...s24, ecran: 249.99, batt: 99.99 })),
        m('galaxy-s24-plus',  'Galaxy S24+',      sRepairs({ ...s24, ecran: 229.99, batt: 99.99 })),
        m('galaxy-s24-fe',    'Galaxy S24 FE',    sRepairs({ ...s24, ecran: 199.99, batt: 99.99 })),
        m('galaxy-s24',       'Galaxy S24',       sRepairs({ ...s24, ecran: 199.99, batt: 99.99 })),
      ],
    },
    {
      id: 'galaxy-s23', label: 'Galaxy S23', shortLabel: 'S23', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s23-ultra', 'Galaxy S23 Ultra', sRepairs({ ...s23, ecran: 249.99, batt: 99.99 })),
        m('galaxy-s23-plus',  'Galaxy S23+',      sRepairs({ ...s23, ecran: 229.99, batt: 99.99 })),
        m('galaxy-s23-fe',    'Galaxy S23 FE',    sRepairs({ ...s23, ecran: 199.99, batt: 99.99 })),
        m('galaxy-s23',       'Galaxy S23',       sRepairs({ ...s23, ecran: 199.99, batt: 99.99 })),
      ],
    },
    {
      id: 'galaxy-s22', label: 'Galaxy S22', shortLabel: 'S22', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s22-ultra', 'Galaxy S22 Ultra', sRepairs({ ...s22, ecran: 249.99, batt: 99.99 })),
        m('galaxy-s22-plus',  'Galaxy S22+',      sRepairs({ ...s22, ecran: 229.99, batt: 99.99 })),
        m('galaxy-s22-fe',    'Galaxy S22 FE',    sRepairs({ ...s22, ecran: 199.99, batt: 99.99 })),
        m('galaxy-s22',       'Galaxy S22',       sRepairs({ ...s22, ecran: 199.99, batt: 99.99 })),
      ],
    },
    {
      id: 'galaxy-s21', label: 'Galaxy S21', shortLabel: 'S21', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s21-ultra', 'Galaxy S21 Ultra', sRepairs({ ...s21, ecran: 369.99, batt: 99.99 })),
        m('galaxy-s21-plus',  'Galaxy S21+',      sRepairs({ ...s21, ecran: 279.99, batt: 99.99 })),
        m('galaxy-s21-fe',    'Galaxy S21 FE',    sRepairs({ ...s21, ecran: 239.99, batt: 99.99 })),
        m('galaxy-s21',       'Galaxy S21',       sRepairs({ ...s21, ecran: 269.99, batt: 99.99 })),
      ],
    },
    {
      id: 'galaxy-s20', label: 'Galaxy S20', shortLabel: 'S20', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s20-ultra', 'Galaxy S20 Ultra', sRepairs({ ...s20, ecran: 299.99, batt: 99.99 })),
        m('galaxy-s20-plus',  'Galaxy S20+',      sRepairs({ ...s20, ecran: 299.99, batt: 99.99 })),
        m('galaxy-s20-fe',    'Galaxy S20 FE',    sRepairs({ ...s20, ecran: 229.99, batt: 99.99 })),
        m('galaxy-s20',       'Galaxy S20',       sRepairs({ ...s20, ecran: 279.99, batt: 99.99 })),
      ],
    },
    {
      id: 'galaxy-s10', label: 'Galaxy S10', shortLabel: 'S10', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s10-plus', 'Galaxy S10+',    sRepairs({ ...s10, ecran: 299.99, batt: 79.99 })),
        m('galaxy-s10',      'Galaxy S10',     sRepairs({ ...s10, ecran: 249.99, batt: 79.99 })),
        m('galaxy-s10e',     'Galaxy S10e',    sRepairs({ ...s10, ecran: 199.99, batt: 79.99 })),
        m('galaxy-s10-lite', 'Galaxy S10 Lite',sRepairs({ ...s10, ecran: 189.99, batt: 79.99 })),
      ],
    },
    {
      id: 'galaxy-s9', label: 'Galaxy S9', shortLabel: 'S9', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s9-plus', 'Galaxy S9+', sRepairs({ ...s9, ecran: 199.99, batt: 79.99 })),
        m('galaxy-s9',      'Galaxy S9',  sRepairs({ ...s9, ecran: 189.99, batt: 79.99 })),
      ],
    },
    {
      id: 'galaxy-s8', label: 'Galaxy S8', shortLabel: 'S8', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s8-plus', 'Galaxy S8 Plus', sRepairs({ ...s8, ecran: 199.99, batt: 79.99 })),
        m('galaxy-s8',      'Galaxy S8',      sRepairs({ ...s8, ecran: 189.99, batt: 79.99 })),
      ],
    },
    {
      id: 'galaxy-s7', label: 'Galaxy S7', shortLabel: 'S7', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s7-edge', 'Galaxy S7 Edge', sRepairs({ ...s7, ecran: 179.99, batt: 79.99 })),
        m('galaxy-s7',      'Galaxy S7',      sRepairs({ ...s7, ecran: 159.99, batt: 79.99 })),
      ],
    },
    {
      id: 'galaxy-s6', label: 'Galaxy S6', shortLabel: 'S6', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s6-edge-plus', 'Galaxy S6 Edge+', sRepairs({ ...s6, ecran: 159.99, batt: 79.99 })),
        m('galaxy-s6-edge',      'Galaxy S6 Edge',  sRepairs({ ...s6, ecran: 159.99, batt: 79.99 })),
        m('galaxy-s6',           'Galaxy S6',       sRepairs({ ...s6, ecran: 159.99, batt: 79.99 })),
      ],
    },
    {
      id: 'galaxy-s5', label: 'Galaxy S5', shortLabel: 'S5', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s5-neo',  'Galaxy S5 Neo',  sRepairs({ ...s5, ecran: 109.99, batt: 39.99 })),
        m('galaxy-s5',      'Galaxy S5',      sRepairs({ ...s5, ecran: 109.99, batt: 39.99 })),
        m('galaxy-s5-mini', 'Galaxy S5 Mini', sRepairs({ ...s5, ecran: 99.99,  batt: 39.99 })),
      ],
    },
    {
      id: 'galaxy-s4', label: 'Galaxy S4', shortLabel: 'S4', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-s4',      'Galaxy S4',      sRepairs({ ecran: 99.99, batt: 79.99, face: 49.99, camP: 49.99, camF: 49.99, lent: 49.99, conn: 59.99, extra: s4extra })),
        m('galaxy-s4-mini', 'Galaxy S4 Mini', sRepairs({ ecran: 99.99, batt: 79.99, face: 49.99, camP: 49.99, camF: 49.99, lent: 49.99, conn: 59.99, extra: s4extra })),
      ],
    },
    {
      id: 'galaxy-note', label: 'Galaxy Note', shortLabel: 'Note', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-note-20-ultra', 'Note 20 Ultra 5G', surDemande()),
        m('galaxy-note-20-5g',    'Note 20 5G', sRepairs({ ecran: 339.99, batt: 109.99, face: 99.99, camP: 129.99, camF: 99.99,  lent: 79.99, conn: 99.99 })),
        m('galaxy-note-10-plus',  'Note 10+',   sRepairs({ ecran: 319.99, batt: 99.99,  face: 89.99, camP: 99.99,  camF: 99.99,  lent: 79.99, conn: 99.99 })),
        m('galaxy-note-10',       'Note 10',    sRepairs({ ecran: 269.99, batt: 89.99,  face: 89.99, camP: 109.99, camF: 99.99,  lent: 79.99, conn: 99.99 })),
        m('galaxy-note-9',        'Note 9',     sRepairs({ ecran: 269.99, batt: 79.99,  face: 89.99, camP: 99.99,  camF: 89.99,  lent: 79.99, conn: 99.99 })),
        m('galaxy-note-8',        'Note 8',     sRepairs({ ecran: 249.99, batt: 79.99,  face: 89.99, camP: 79.99,  camF: 89.99,  lent: 79.99, conn: 99.99 })),
      ],
    },
    {
      id: 'galaxy-a', label: 'Galaxy A', shortLabel: 'A', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-a90', 'Galaxy A90', aModern(159.99)),
        m('galaxy-a80', 'Galaxy A80', aModern(159.99)),
        m('galaxy-a72', 'Galaxy A72', aModern(169.99)),
        m('galaxy-a71', 'Galaxy A71', aModern(159.99)),
        m('galaxy-a70', 'Galaxy A70', aModern(159.99)),
        m('galaxy-a60', 'Galaxy A60', aModern(159.99)),
        m('galaxy-a52', 'Galaxy A52', aModern(169.99)),
        m('galaxy-a51', 'Galaxy A51', aModern(169.99)),
        m('galaxy-a50', 'Galaxy A50', aModern(159.99)),
        m('galaxy-a42', 'Galaxy A42', aModern(159.99)),
        m('galaxy-a41', 'Galaxy A41', aModern(159.99)),
        m('galaxy-a40', 'Galaxy A40', aModern(139.99)),
        m('galaxy-a32', 'Galaxy A32', aModern(159.99)),
        m('galaxy-a31', 'Galaxy A31', aModern(149.99)),
        m('galaxy-a30', 'Galaxy A30', aModern(149.99)),
        m('galaxy-a22', 'Galaxy A22', aModern(129.99)),
        m('galaxy-a21', 'Galaxy A21', aModern(129.99)),
        m('galaxy-a20', 'Galaxy A20', aModern(129.99)),
        m('galaxy-a12', 'Galaxy A12', aModern(119.99)),
        m('galaxy-a11', 'Galaxy A11', aModern(119.99)),
        m('galaxy-a10', 'Galaxy A10', aModern(119.99)),
        m('galaxy-a9',  'Galaxy A9',  aAncien(149.99)),
        m('galaxy-a8',  'Galaxy A8',  aAncien(149.99)),
        m('galaxy-a7',  'Galaxy A7',  aAncien(149.99)),
        m('galaxy-a6',  'Galaxy A6',  aAncien(139.99)),
        m('galaxy-a5',  'Galaxy A5',  aAncien(129.99)),
        m('galaxy-a3',  'Galaxy A3',  aAncien(129.99)),
      ],
    },
    {
      id: 'galaxy-j', label: 'Galaxy J', shortLabel: 'J', buttonPrefix: 'Galaxy ',
      models: [
        m('galaxy-j8', 'Galaxy J8', jRepairs(119.99)),
        m('galaxy-j7', 'Galaxy J7', jRepairs(109.99)),
        m('galaxy-j6', 'Galaxy J6', jRepairs(109.99)),
        m('galaxy-j5', 'Galaxy J5', jRepairs(109.99)),
        m('galaxy-j4', 'Galaxy J4', jRepairs(99.99)),
        m('galaxy-j3', 'Galaxy J3', jRepairs(99.99)),
        m('galaxy-j2', 'Galaxy J2', jRepairs(99.99)),
      ],
    },
  ],
}
