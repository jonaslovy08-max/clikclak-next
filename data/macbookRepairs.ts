/*
  data/macbookRepairs.ts — Source de vérité des tarifs MacBook / iMac.

  Prix FINAUX ClikClak. Ne pas dupliquer dans les pages JSX.
  "Sur devis" = tarif à établir après diagnostic individuel.

  Tunnel : Réparation → Ordinateur → MacBook → [cette page] → Tarifs

  5 familles :
    MacBook Pro  → 6 modèles par génération
    MacBook Air  → 3 modèles par taille/puce
    MacBook Neo  → 1 modèle
    MacBook 12"  → 1 modèle
    iMac         → 3 modèles (réparations adaptées desktop)

  MacBook portables : Écran, Batterie, Diagnostic, Clavier, Trackpad,
    Connecteur, Haut-parleurs, Ventilateur/nettoyage, Surchauffe, Logiciel,
    Récupération, Dégâts d'eau.
  iMac (desktop) : Écran, Diagnostic, Nettoyage interne, Surchauffe, Logiciel,
    Récupération, Dégâts d'eau.
  AUCUNE réparation smartphone (pas de caméra, NFC, face arrière, etc.).
*/

import type { RepairItem, RepairBrandData } from './repairTypes'

/* ── Réparations communes MacBook portables ── */
const macCommon: RepairItem[] = [
  { label: 'Diagnostic',                              price: 'Sur devis', category: 'other' },
  { label: 'Clavier',                                 price: 'Sur devis', category: 'other' },
  { label: 'Trackpad',                                price: 'Sur devis', category: 'other' },
  { label: 'Connecteur de charge / USB-C / MagSafe',  price: 'Sur devis', category: 'other' },
  { label: 'Haut-parleurs',                           price: 'Sur devis', category: 'other' },
  { label: 'Ventilateur / nettoyage interne',         price: 'Sur devis', category: 'other' },
  { label: 'Surchauffe',                              price: 'Sur devis', category: 'other' },
  { label: 'Problème logiciel',                       price: 'Sur devis', category: 'other' },
  { label: 'Récupération de données',                 price: 'Sur devis', category: 'other' },
  { label: "Dégâts d'eau / oxydation",                price: 'Sur devis', category: 'other' },
]

/* ── Réparations iMac (desktop — pas de clavier Apple intégré, pas de batterie, pas de trackpad) ── */
const imacCommon: RepairItem[] = [
  { label: 'Diagnostic',                  price: 'Sur devis', category: 'other' },
  { label: 'Nettoyage interne',           price: 'Sur devis', category: 'other' },
  { label: 'Surchauffe',                  price: 'Sur devis', category: 'other' },
  { label: 'Problème logiciel',           price: 'Sur devis', category: 'other' },
  { label: 'Récupération de données',     price: 'Sur devis', category: 'other' },
  { label: "Dégâts d'eau / oxydation",    price: 'Sur devis', category: 'other' },
]

/* Construit les réparations d'un MacBook portable */
function mbRepairs(ecran: number, batt: number | 'Sur devis'): RepairItem[] {
  return [
    { label: 'Écran',    price: ecran, category: 'screen'  },
    { label: 'Batterie', price: batt,  category: 'battery' },
    ...macCommon,
  ]
}

/* Construit les réparations d'un iMac (écran seul + common desktop) */
function imacRepairs(ecran: number): RepairItem[] {
  return [
    { label: 'Écran', price: ecran, category: 'screen' },
    ...imacCommon,
  ]
}

function m(id: string, label: string, repairs: RepairItem[]) {
  return { id, label, repairs }
}

export const macbookBrandData: RepairBrandData = {
  h1Prefix:          'Réparation',
  h1Brand:           'MacBook',
  brandIcon:         '/assets/icons/icon-iphone.svg',
  breadcrumbLabel:   'Réparation MacBook à Lausanne',
  breadcrumbHref:    '/reparation-ordinateur-express',
  repairNote:        "Les tarifs MacBook / iMac sont indicatifs et peuvent varier selon la configuration exacte, la disponibilité des pièces et l'état de l'appareil. Un diagnostic peut être nécessaire avant confirmation du prix.",
  searchPlaceholder: 'Rechercher mon MacBook...',

  families: [

    /* ── MacBook Pro ── */
    {
      id: 'macbook-pro', label: 'MacBook Pro', shortLabel: 'Pro', buttonPrefix: 'MacBook ',
      models: [
        m('macbook-pro-16-2021-plus',  'MacBook Pro 16" 2021 et supérieur', mbRepairs(800, 280)),
        m('macbook-pro-16-2019',       'MacBook Pro 16" 2019',              mbRepairs(640, 140)),
        m('macbook-pro-15-2016-2019',  'MacBook Pro 15" 2016 à 2019',       mbRepairs(640, 140)),
        m('macbook-pro-14',            'MacBook Pro 14"',                   mbRepairs(700, 280)),
        m('macbook-pro-13-2016-2019',  'MacBook Pro 13" 2016 à 2019',       mbRepairs(570, 140)),
        m('macbook-pro-13-2020-2022',  'MacBook Pro 13" 2020 à 2022',       mbRepairs(570, 280)),
      ],
    },

    /* ── MacBook Air ── */
    {
      id: 'macbook-air', label: 'MacBook Air', shortLabel: 'Air', buttonPrefix: 'MacBook ',
      models: [
        m('macbook-air-15',           'MacBook Air 15"',               mbRepairs(570, 210)),
        m('macbook-air-13-m2-plus',   'MacBook Air 13" M2 ou supérieur', mbRepairs(520, 180)),
        m('macbook-air-13-2015-2020', 'MacBook Air 13" 2015 à 2020',   mbRepairs(390, 'Sur devis')),
      ],
    },

    /* ── MacBook Neo ── */
    {
      id: 'macbook-neo', label: 'MacBook Neo', shortLabel: 'Neo', buttonPrefix: 'MacBook ',
      models: [
        m('macbook-neo', 'MacBook Neo', mbRepairs(220, 120)),
      ],
    },

    /* ── MacBook 12" ── */
    {
      id: 'macbook-12', label: 'MacBook 12"', shortLabel: '12"', buttonPrefix: 'MacBook ',
      models: [
        m('macbook-12-2016-2017', 'MacBook 12" 2016 ou 2017', mbRepairs(460, 'Sur devis')),
      ],
    },

    /* ── iMac ── */
    {
      id: 'imac', label: 'iMac', shortLabel: 'iMac', buttonPrefix: '',
      models: [
        m('imac-27-5k',      'iMac 27" 5K',    imacRepairs(700)),
        m('imac-24-5-4-5k',  'iMac 24.5" 4.5K', imacRepairs(590)),
        m('imac-21-5-4k',    'iMac 21.5" 4K',  imacRepairs(520)),
      ],
    },

  ],
}
