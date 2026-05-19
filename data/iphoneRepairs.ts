export type MainRepair  = { name: string; subtitle: string; price: string }
export type OtherRepair = { name: string; price: string }
export type IphoneModel = {
  id:           string
  label:        string
  generation:   string
  image:        string
  mainRepairs:  MainRepair[]
  otherRepairs: OtherRepair[]
}

/* Formatage prix en CHF */
const chf = (n: number): string => `CHF ${n.toFixed(2)}`

/* Helper — construit un IphoneModel depuis les données brutes */
function m(
  id:         string,
  label:      string,
  generation: string,
  ecran:      number,
  batterie:   number,
  autres:     [string, number][],
): IphoneModel {
  return {
    id, label, generation, image: '',
    mainRepairs: [
      { name: 'Écran',    subtitle: "Changement d'écran",       price: chf(ecran)    },
      { name: 'Batterie', subtitle: 'Remplacement de batterie', price: chf(batterie) },
    ],
    otherRepairs: autres.map(([name, price]) => ({ name, price: chf(price) })),
  }
}

/* ─── Générations ─────────────────────────────────────────────────────────── */
export const generations = [
  { id: 'iphone-16',    label: 'iPhone 16'    },
  { id: 'iphone-15',    label: 'iPhone 15'    },
  { id: 'iphone-14',    label: 'iPhone 14'    },
  { id: 'iphone-13',    label: 'iPhone 13'    },
  { id: 'iphone-12',    label: 'iPhone 12'    },
  { id: 'iphone-11',    label: 'iPhone 11'    },
  { id: 'iphone-xr-xs', label: 'iPhone XR/XS' },
  { id: 'iphone-x',     label: 'iPhone X'     },
  { id: 'iphone-8',     label: 'iPhone 8'     },
  { id: 'iphone-7',     label: 'iPhone 7'     },
  { id: 'iphone-6s',    label: 'iPhone 6s'    },
  { id: 'iphone-6',     label: 'iPhone 6'     },
  { id: 'iphone-se',    label: 'iPhone SE'    },
  { id: 'iphone-5',     label: 'iPhone 5'     },
  { id: 'iphone-4',     label: 'iPhone 4'     },
]

/* ─── Modèles ─────────────────────────────────────────────────────────────── */
export const iphoneModels: IphoneModel[] = [

  // ── iPhone 16 ───────────────────────────────────────────────────────────
  m('iphone-16',         'iPhone 16',         'iphone-16',  249.99, 99.99, [
    ['Vitre arrière / Châssis', 279.99],
    ['Caméra principale',       159.99],
    ['Caméra frontale',         139.99],
    ['Lentille caméra',         109.99],
    ['Connecteur de charge',    159.99],
  ]),
  m('iphone-16-plus',    'iPhone 16 Plus',    'iphone-16',  249.99, 99.99, [
    ['Vitre arrière / Châssis', 279.99],
    ['Caméra principale',       159.99],
    ['Caméra frontale',         139.99],
    ['Lentille caméra',         109.99],
    ['Connecteur de charge',    159.99],
  ]),
  m('iphone-16-pro',     'iPhone 16 Pro',     'iphone-16',  289.99, 109.99, [
    ['Vitre arrière / Châssis', 279.99],
    ['Caméra principale',       159.99],
    ['Caméra frontale',         139.99],
    ['Lentille caméra',         109.99],
    ['Connecteur de charge',    159.99],
  ]),
  m('iphone-16-pro-max', 'iPhone 16 Pro Max', 'iphone-16',  289.99, 109.99, [
    ['Vitre arrière / Châssis', 279.99],
    ['Caméra principale',       159.99],
    ['Caméra frontale',         139.99],
    ['Lentille caméra',         109.99],
    ['Connecteur de charge',    159.99],
  ]),

  // ── iPhone 15 ───────────────────────────────────────────────────────────
  m('iphone-15',         'iPhone 15',         'iphone-15',  229.99, 99.99, [
    ['Vitre arrière / Châssis', 259.99],
    ['Caméra principale',       149.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    149.99],
  ]),
  m('iphone-15-plus',    'iPhone 15 Plus',    'iphone-15',  259.99, 99.99, [
    ['Vitre arrière / Châssis', 259.99],
    ['Caméra principale',       149.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    149.99],
  ]),
  m('iphone-15-pro',     'iPhone 15 Pro',     'iphone-15',  279.99, 99.99, [
    ['Vitre arrière / Châssis', 259.99],
    ['Caméra principale',       149.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    149.99],
  ]),
  m('iphone-15-pro-max', 'iPhone 15 Pro Max', 'iphone-15',  289.99, 99.99, [
    ['Vitre arrière / Châssis', 259.99],
    ['Caméra principale',       149.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    149.99],
  ]),

  // ── iPhone 14 ───────────────────────────────────────────────────────────
  m('iphone-14',         'iPhone 14',         'iphone-14',  219.99, 99.99, [
    ['Vitre arrière / Châssis', 239.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    139.99],
  ]),
  m('iphone-14-plus',    'iPhone 14 Plus',    'iphone-14',  219.99, 99.99, [
    ['Vitre arrière / Châssis', 249.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    139.99],
  ]),
  m('iphone-14-pro',     'iPhone 14 Pro',     'iphone-14',  259.99, 99.99, [
    ['Vitre arrière / Châssis', 239.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    139.99],
  ]),
  m('iphone-14-pro-max', 'iPhone 14 Pro Max', 'iphone-14',  259.99, 99.99, [
    ['Vitre arrière / Châssis', 239.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         129.99],
    ['Lentille caméra',          99.99],
    ['Connecteur de charge',    139.99],
  ]),

  // ── iPhone 13 ───────────────────────────────────────────────────────────
  m('iphone-13',         'iPhone 13',         'iphone-13',  249.99, 85.99, [
    ['Vitre arrière / Châssis', 299.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    129.99],
  ]),
  m('iphone-13-pro',     'iPhone 13 Pro',     'iphone-13',  299.99, 85.99, [
    ['Vitre arrière / Châssis', 299.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    129.99],
  ]),
  m('iphone-13-pro-max', 'iPhone 13 Pro Max', 'iphone-13',  299.99, 85.99, [
    ['Vitre arrière / Châssis', 299.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    129.99],
  ]),
  m('iphone-13-mini',    'iPhone 13 Mini',    'iphone-13',  199.99, 85.99, [
    ['Vitre arrière / Châssis', 279.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    129.99],
  ]),

  // ── iPhone 12 ───────────────────────────────────────────────────────────
  m('iphone-12',         'iPhone 12',         'iphone-12',  199.99, 85.99, [
    ['Vitre arrière / Châssis', 279.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    119.99],
  ]),
  m('iphone-12-pro',     'iPhone 12 Pro',     'iphone-12',  219.99, 85.99, [
    ['Vitre arrière / Châssis', 299.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    119.99],
  ]),
  m('iphone-12-pro-max', 'iPhone 12 Pro Max', 'iphone-12',  219.99, 85.99, [
    ['Vitre arrière / Châssis', 299.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    119.99],
  ]),
  m('iphone-12-mini',    'iPhone 12 Mini',    'iphone-12',  199.99, 85.99, [
    ['Vitre arrière / Châssis', 269.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         119.99],
    ['Lentille caméra',          89.99],
    ['Connecteur de charge',    119.99],
  ]),

  // ── iPhone 11 ───────────────────────────────────────────────────────────
  m('iphone-11',         'iPhone 11',         'iphone-11',  139.99, 85.99, [
    ['Vitre arrière / Châssis', 199.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         109.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',    119.99],
  ]),
  m('iphone-11-pro',     'iPhone 11 Pro',     'iphone-11',  149.99, 85.99, [
    ['Vitre arrière / Châssis', 199.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         109.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',    119.99],
  ]),
  m('iphone-11-pro-max', 'iPhone 11 Pro Max', 'iphone-11',  159.99, 85.99, [
    ['Vitre arrière / Châssis', 199.99],
    ['Caméra principale',       129.99],
    ['Caméra frontale',         109.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',    119.99],
  ]),

  // ── iPhone XR / XS — note: Vitre arrière délai 24h ──────────────────────
  m('iphone-xr',         'iPhone XR',         'iphone-xr-xs', 129.99, 85.99, [
    ['Vitre arrière / Châssis', 199.99],
    ['Caméra principale',        99.99],
    ['Caméra frontale',          89.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',     99.99],
  ]),
  m('iphone-xs',         'iPhone XS',         'iphone-xr-xs', 129.99, 85.99, [
    ['Vitre arrière / Châssis', 199.99],
    ['Caméra principale',        99.99],
    ['Caméra frontale',          89.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',     99.99],
  ]),
  m('iphone-xs-max',     'iPhone XS Max',     'iphone-xr-xs', 159.99, 85.99, [
    ['Vitre arrière / Châssis', 199.99],
    ['Caméra principale',        99.99],
    ['Caméra frontale',          89.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',     99.99],
  ]),

  // ── iPhone X ────────────────────────────────────────────────────────────
  m('iphone-x',          'iPhone X',          'iphone-x',   129.99, 85.99, [
    ['Vitre arrière / Châssis', 249.99],
    ['Caméra principale',        99.99],
    ['Caméra frontale',          89.99],
    ['Lentille caméra',          79.99],
    ['Connecteur de charge',     99.99],
  ]),

  // ── iPhone 8 ────────────────────────────────────────────────────────────
  m('iphone-8',          'iPhone 8',          'iphone-8',   109.99, 75.99, [
    ['Vitre arrière / Châssis', 149.99],
    ['Bouton Home',              89.99],
    ['Bouton Power',             99.99],
    ['Bouton Volume',            99.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     89.99],
  ]),
  m('iphone-8-plus',     'iPhone 8 Plus',     'iphone-8',   119.99, 75.99, [
    ['Vitre arrière / Châssis', 149.99],
    ['Bouton Home',              89.99],
    ['Bouton Power',             99.99],
    ['Bouton Volume',            99.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     89.99],
  ]),

  // ── iPhone 7 ────────────────────────────────────────────────────────────
  m('iphone-7',          'iPhone 7',          'iphone-7',    89.99, 69.99, [
    ['Bouton Home',              89.99],
    ['Bouton Power',             89.99],
    ['Bouton Volume',            89.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     79.99],
  ]),
  m('iphone-7-plus',     'iPhone 7 Plus',     'iphone-7',    99.99, 69.99, [
    ['Bouton Home',              89.99],
    ['Bouton Power',             89.99],
    ['Bouton Volume',            89.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     79.99],
  ]),

  // ── iPhone 6s ───────────────────────────────────────────────────────────
  m('iphone-6s',         'iPhone 6s',         'iphone-6s',   89.99, 69.99, [
    ['Bouton Home',              79.99],
    ['Bouton Power',             89.99],
    ['Bouton Volume',            89.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     69.99],
  ]),
  m('iphone-6s-plus',    'iPhone 6s Plus',    'iphone-6s',   89.99, 69.99, [
    ['Bouton Home',              79.99],
    ['Bouton Power',             89.99],
    ['Bouton Volume',            89.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     69.99],
  ]),

  // ── iPhone 6 ────────────────────────────────────────────────────────────
  m('iphone-6',          'iPhone 6',          'iphone-6',    89.99, 59.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             69.99],
    ['Bouton Volume',            69.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     69.99],
  ]),
  m('iphone-6-plus',     'iPhone 6 Plus',     'iphone-6',    89.99, 59.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             69.99],
    ['Bouton Volume',            69.99],
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     69.99],
  ]),

  // ── iPhone SE ───────────────────────────────────────────────────────────
  m('iphone-se-3',       'iPhone SE 3e génération',  'iphone-se',  129.99, 85.99, [
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     89.99],
  ]),
  m('iphone-se-2',       'iPhone SE 2e génération',  'iphone-se',  119.99, 69.99, [
    ['Caméra principale',        89.99],
    ['Caméra frontale',          79.99],
    ['Lentille caméra',          69.99],
    ['Connecteur de charge',     89.99],
  ]),
  m('iphone-se-1',       'iPhone SE 1re génération', 'iphone-se',   69.99, 59.99, [
    ['Caméra principale',        59.99],
    ['Caméra frontale',          49.99],
    ['Lentille caméra',          49.99],
    ['Connecteur de charge',     69.99],
  ]),

  // ── iPhone 5 ────────────────────────────────────────────────────────────
  m('iphone-5',          'iPhone 5',          'iphone-5',    69.99, 59.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             79.99],
    ['Bouton Volume',            79.99],
    ['Caméra principale',        59.99],
    ['Caméra frontale',          49.99],
    ['Lentille caméra',          49.99],
    ['Connecteur de charge',     69.99],
  ]),
  m('iphone-5c',         'iPhone 5c',         'iphone-5',    69.99, 59.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             79.99],
    ['Bouton Volume',            79.99],
    ['Caméra principale',        59.99],
    ['Caméra frontale',          49.99],
    ['Lentille caméra',          49.99],
    ['Connecteur de charge',     69.99],
  ]),
  m('iphone-5s',         'iPhone 5s',         'iphone-5',    79.99, 59.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             79.99],
    ['Bouton Volume',            79.99],
    ['Caméra principale',        59.99],
    ['Caméra frontale',          49.99],
    ['Lentille caméra',          49.99],
    ['Connecteur de charge',     69.99],
  ]),

  // ── iPhone 4 ────────────────────────────────────────────────────────────
  m('iphone-4',          'iPhone 4',          'iphone-4',    59.99, 49.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             79.99],
    ['Bouton Volume',            79.99],
    ['Caméra principale',        59.99],
    ['Caméra frontale',          49.99],
    ['Lentille caméra',          49.99],
    ['Connecteur de charge',     69.99],
  ]),
  m('iphone-4s',         'iPhone 4s',         'iphone-4',    59.99, 49.99, [
    ['Bouton Home',              59.99],
    ['Bouton Power',             79.99],
    ['Bouton Volume',            79.99],
    ['Caméra principale',        59.99],
    ['Caméra frontale',          49.99],
    ['Lentille caméra',          49.99],
    ['Connecteur de charge',     69.99],
  ]),
]
