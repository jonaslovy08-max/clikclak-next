/*
  data/huaweiRepairs.ts — Source de vérité des tarifs Huawei.
  Tunnel : Réparation → Smartphone → Huawei → [cette page] → Tarifs

  Structure 3 super-familles :
    P Series    → tous les modèles P + P Lite/Plus/Pro
    Mate Series → tous les modèles Mate
    Honor       → tous les modèles Honor
*/

import type { RepairItem, RepairBrandData } from './repairTypes'

function hRepairs(ecran: number | string): RepairItem[] {
  return [
    { label: 'Écran & vitre',        price: ecran as RepairItem['price'], category: 'screen'  },
    { label: 'Batterie',             price: 79.99,  category: 'battery' },
    { label: 'Face arrière',         price: 69.99,  category: 'other'   },
    { label: 'Connecteur de charge', price: 79.99,  category: 'other'   },
  ]
}

function m(id: string, label: string, ecran: number | string) {
  return { id, label, repairs: hRepairs(ecran) }
}

const ND = 'Non disponible — modèle non pris en charge'

export const huaweiBrandData: RepairBrandData = {
  h1Prefix:          'Réparation',
  h1Brand:           'Huawei',
  brandIcon:         '/assets/icons/icon-huawei.svg',
  breadcrumbLabel:   'Réparation Huawei Lausanne',
  breadcrumbHref:    '/reparation-smartphone-express',
  repairNote:        'Réparation Huawei à Lausanne. Contactez-nous pour tout modèle non listé ou pour un diagnostic.',
  searchPlaceholder: 'Rechercher mon Huawei...',

  families: [

    /* ── P Series ── */
    {
      id: 'huawei-p', label: 'P Series', shortLabel: 'P Series',
      models: [
        m('huawei-p30-lite', 'P30 Lite',  139.99),
        m('huawei-p30',      'P30',       249.99),
        m('huawei-p30-pro',  'P30 Pro',   ND    ),
        m('huawei-p20-pro',  'P20 Pro',   279.99),
        m('huawei-p20',      'P20',       149.99),
        m('huawei-p20-lite', 'P20 Lite',  109.99),
        m('huawei-p10-pro',  'P10 Pro',   179.99),
        m('huawei-p10',      'P10',       139.99),
        m('huawei-p10-plus', 'P10 Plus',  139.99),
        m('huawei-p10-lite', 'P10 Lite',   99.99),
        m('huawei-p9',       'P9',        109.99),
        m('huawei-p9-lite',  'P9 Lite',    99.99),
        m('huawei-p8',       'P8',        109.99),
        m('huawei-p7',       'P7',        109.99),
      ],
    },

    /* ── Mate Series ── */
    {
      id: 'huawei-mate', label: 'Mate Series', shortLabel: 'Mate Series',
      models: [
        m('huawei-mate-20-lite', 'Mate 20 Lite', 139.99),
        m('huawei-mate-20',      'Mate 20',      159.99),
        m('huawei-mate-20-pro',  'Mate 20 Pro',  299.99),
        m('huawei-mate-10-pro',  'Mate 10 Pro',  189.99),
        m('huawei-mate-10',      'Mate 10',      149.99),
        m('huawei-mate-10-lite', 'Mate 10 Lite', 129.99),
        m('huawei-mate-9',       'Mate 9',        99.99),
        m('huawei-mate-8',       'Mate 8',        99.99),
      ],
    },

    /* ── Honor ── */
    {
      id: 'huawei-honor', label: 'Honor', shortLabel: 'Honor',
      models: [
        m('honor-20',     'Honor 20',     149.99),
        m('honor-10',     'Honor 10',     139.99),
        m('honor-9',      'Honor 9',      119.99),
        m('honor-8',      'Honor 8',      119.99),
        m('honor-8-lite', 'Honor 8 Lite',  99.99),
        m('honor-7',      'Honor 7',       99.99),
      ],
    },

  ],
}
