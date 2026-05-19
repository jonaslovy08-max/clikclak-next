/*
  data/oppoRepairs.ts — Source de vérité des tarifs OPPO.
  Tunnel : Réparation → Smartphone → OPPO → [cette page] → Tarifs
*/

import type { RepairItem, RepairBrandData } from './repairTypes'

function oppoRepairs(ecran: number): RepairItem[] {
  return [
    { label: 'Écran & vitre',               price: ecran, category: 'screen'  },
    { label: 'Batterie',                     price: 99.99, category: 'battery' },
    { label: 'Face arrière',                 price: 89.99, category: 'other'   },
    { label: 'Caméra principale',            price: 99.99, category: 'other'   },
    { label: 'Caméra frontale',              price: 89.99, category: 'other'   },
    { label: 'Lentille caméra',              price: 69.99, category: 'other'   },
    { label: 'Connecteur de charge ou NFC',  price: 99.99, category: 'other'   },
  ]
}

export const oppoBrandData: RepairBrandData = {
  h1Prefix:          'Réparation',
  h1Brand:           'OPPO',
  brandIcon:         '/assets/icons/icon-oppo.svg',
  breadcrumbLabel:   'Réparation OPPO Lausanne',
  breadcrumbHref:    '/reparation-smartphone-express/',
  defaultModelId:    'oppo-find-x3-pro',
  repairNote:        'Réparation OPPO à Lausanne. Contactez-nous pour tout modèle non listé ou pour un diagnostic.',
  searchPlaceholder: 'Rechercher mon OPPO...',

  families: [
    {
      id: 'oppo-find-x3', label: 'OPPO Find X3', shortLabel: 'Find X3',
      models: [
        { id: 'oppo-find-x3-pro',  label: 'OPPO Find X3 Pro',  repairs: oppoRepairs(249.99) },
        { id: 'oppo-find-x3-neo',  label: 'OPPO Find X3 Neo',  repairs: oppoRepairs(219.99) },
        { id: 'oppo-find-x3-lite', label: 'OPPO Find X3 Lite', repairs: oppoRepairs(189.99) },
      ],
    },
    {
      id: 'oppo-find-x2', label: 'OPPO Find X2', shortLabel: 'Find X2',
      models: [
        { id: 'oppo-find-x2-pro',  label: 'OPPO Find X2 Pro',  repairs: oppoRepairs(249.99) },
        { id: 'oppo-find-x2-neo',  label: 'OPPO Find X2 Neo',  repairs: oppoRepairs(219.99) },
        { id: 'oppo-find-x2-lite', label: 'OPPO Find X2 Lite', repairs: oppoRepairs(189.99) },
      ],
    },
    {
      id: 'oppo-reno4', label: 'OPPO Reno4', shortLabel: 'Reno4',
      models: [
        { id: 'oppo-reno4-pro', label: 'OPPO Reno4 Pro', repairs: oppoRepairs(199.99) },
      ],
    },
  ],
}
