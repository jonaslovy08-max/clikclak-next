/*
  data/ipadRepairs.ts — Source de vérité des tarifs iPad.
  Ne pas dupliquer ces données dans les pages JSX.
  Tunnel : Réparation → Tablette → iPad → [cette page] → Tarifs

  Structure 4 super-familles :
    iPad       → iPad 1-4, iPad 9.7 6ème, iPad 9.7 7ème
    iPad Air   → iPad Air 1, iPad Air 2
    iPad Mini  → iPad Mini 1/2/3, iPad Mini 4, iPad Mini 5
    iPad Pro   → iPad Pro 9.7, 10.5, 12.9 1ère, 12.9 2ème
*/

import type { RepairItem, RepairBrandData } from './repairTypes'

function model(id: string, label: string, repairs: RepairItem[]) {
  return { id, label, repairs }
}

export const ipadBrandData: RepairBrandData = {
  h1Prefix:          'Réparation',
  h1Brand:           'iPad',
  brandIcon:         '/assets/icons/icon-iphone.svg',
  breadcrumbLabel:   'Réparation iPad Lausanne',
  breadcrumbHref:    '/reparation-tablette-express',
  repairNote:        "Les prix sont indicatifs et peuvent varier selon l'état de l'appareil et la disponibilité des pièces. Un diagnostic est effectué avant toute intervention.",
  searchPlaceholder: 'Rechercher mon iPad...',

  families: [

    /* ── iPad ── */
    {
      id: 'ipad', label: 'iPad', shortLabel: 'iPad', buttonPrefix: '',
      models: [
        model('ipad-1-2-3-4', 'iPad 1 / 2 / 3 / 4', [
          { label: 'Vitre iPad',                    price: 99.99,  category: 'other'   },
          { label: 'Écran & vitre iPad',            price: 149.99, category: 'screen'  },
          { label: 'Batterie',                      price: 109.99, category: 'battery' },
          { label: 'Boutons Home / Volume / Power', price: 99.99,  category: 'other'   },
          { label: 'Connecteur de charge',          price: 99.99,  category: 'other'   },
        ]),
        model('ipad-9-7-6gen', 'iPad 9.7″ 6ème Gén. (2017-2018)', [
          { label: 'Vitre', price: 149.99, category: 'screen' },
        ]),
        model('ipad-9-7-7gen', 'iPad 9.7″ 7ème Gén. (2019)', [
          { label: 'Vitre', price: 169.99, category: 'screen' },
        ]),
      ],
    },

    /* ── iPad Air ── */
    {
      id: 'ipad-air', label: 'iPad Air', shortLabel: 'Air', buttonPrefix: 'iPad ',
      models: [
        model('ipad-air-1', 'iPad Air 1', [
          { label: 'Vitre',                         price: 129.99, category: 'other'   },
          { label: 'Écran & vitre',                 price: 149.99, category: 'screen'  },
          { label: 'Batterie',                      price: 119.99, category: 'battery' },
          { label: 'Boutons Home / Volume / Power', price: 109.99, category: 'other'   },
        ]),
        model('ipad-air-2', 'iPad Air 2', [
          { label: 'Écran & vitre', price: 199.99, category: 'screen'  },
          { label: 'Batterie',      price: 139.99, category: 'battery' },
        ]),
      ],
    },

    /* ── iPad Mini ── */
    {
      id: 'ipad-mini', label: 'iPad Mini', shortLabel: 'Mini', buttonPrefix: 'iPad ',
      models: [
        model('ipad-mini-1-2-3', 'iPad Mini 1 / 2 / 3', [
          { label: 'Vitre',                         price: 99.99,  category: 'other'   },
          { label: 'Écran & vitre',                 price: 149.99, category: 'screen'  },
          { label: 'Batterie iPad Mini',            price: 109.99, category: 'battery' },
          { label: 'Boutons Home / Volume / Power', price: 99.99,  category: 'other'   },
        ]),
        model('ipad-mini-4', 'iPad Mini 4', [
          { label: 'Écran & vitre', price: 169.99, category: 'screen' },
        ]),
        model('ipad-mini-5', 'iPad Mini 5', [
          { label: 'Écran & vitre', price: 169.99, category: 'screen' },
        ]),
      ],
    },

    /* ── iPad Pro ── */
    {
      id: 'ipad-pro', label: 'iPad Pro', shortLabel: 'Pro', buttonPrefix: 'iPad ',
      models: [
        model('ipad-pro-9-7',   'iPad Pro 9.7″',            [{ label: 'Écran', price: 'Sur demande', category: 'screen' }]),
        model('ipad-pro-10-5',  'iPad Pro 10.5″',           [{ label: 'Écran', price: 'Sur demande', category: 'screen' }]),
        model('ipad-pro-12-9-1','iPad Pro 12.9″ 1ère Gén.', [{ label: 'Écran', price: 'Sur demande', category: 'screen' }]),
        model('ipad-pro-12-9-2','iPad Pro 12.9″ 2ème Gén.', [{ label: 'Écran', price: 'Sur demande', category: 'screen' }]),
      ],
    },

  ],
}
