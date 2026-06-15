import { SHOP_PRODUCTS } from '@/data/shopProducts'

export interface SearchEntry {
  title:       string
  description: string
  href:        string
  keywords:    string[]
  type:        'repair' | 'service' | 'shop' | 'help'
}

function norm(s: string): string {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

const STATIC_ENTRIES: SearchEntry[] = [
  { title: 'Réparation iPhone',         description: 'Tarifs réparation iPhone — toutes générations',             href: '/services/reparation-iphone',               keywords: ['iphone', 'apple', 'ecran', 'batterie', 'connecteur'],         type: 'repair'  },
  { title: 'Réparation Samsung',        description: 'Tarifs réparation Samsung Galaxy',                          href: '/services/reparation-samsung-lausanne',      keywords: ['samsung', 'galaxy', 's', 'a', 'note', 'ecran', 'batterie'],   type: 'repair'  },
  { title: 'Réparation iPad',           description: 'Tarifs réparation iPad Apple',                              href: '/services/reparation-ipad',                  keywords: ['ipad', 'tablette', 'apple', 'ecran', 'batterie'],             type: 'repair'  },
  { title: 'Réparation MacBook',        description: 'Tarifs réparation MacBook',                                  href: '/services/reparation-macbook',               keywords: ['macbook', 'mac', 'ordinateur', 'apple', 'clavier'],           type: 'repair'  },
  { title: 'Réparation Huawei',         description: 'Tarifs réparation Huawei / Honor',                          href: '/services/reparation-huawei-lausanne',        keywords: ['huawei', 'honor', 'p20', 'p30', 'mate'],                      type: 'repair'  },
  { title: 'Réparation OPPO',           description: 'Tarifs réparation OPPO',                                    href: '/services/reparation-oppo',                  keywords: ['oppo', 'find', 'reno'],                                       type: 'repair'  },
  { title: 'Changement d\'écran',       description: 'Remplacement écran cassé ou fissuré',                       href: '/services/reparation-ecran',                 keywords: ['ecran', 'vitre', 'casse', 'fissure', 'dalle', 'affichage'],   type: 'repair'  },
  { title: 'Changement de batterie',    description: 'Remplacement batterie déchargée ou gonflée',                href: '/services/changement-batterie',              keywords: ['batterie', 'charge', 'autonomie', 'gonfle', 'dechargee'],     type: 'repair'  },
  { title: 'Connecteur de charge',      description: 'Réparation port de charge USB / Lightning',                 href: '/services/connecteur-de-charge',             keywords: ['connecteur', 'charge', 'usb', 'lightning', 'port'],           type: 'repair'  },
  { title: 'Diagnostic',               description: 'Diagnostic complet de votre appareil',                      href: '/services/diagnostic',                       keywords: ['diagnostic', 'panne', 'depannage', 'test'],                   type: 'repair'  },
  { title: 'Récupération de données',  description: 'Récupération depuis smartphone, disque dur, SSD, clé USB',  href: '/services/recuperation-donnees',             keywords: ['recuperation', 'donnees', 'fichiers', 'photos', 'ssd', 'disque', 'cle usb', 'memoire'], type: 'service' },
  { title: 'Dépannage 7/7',            description: 'Dépannage à domicile ou en boutique',                       href: '/services/depannage-reparation-domicile',    keywords: ['depannage', 'domicile', 'assistance', 'configuration', '7/7', 'aide'], type: 'service' },
  { title: 'Rachat appareils',         description: 'Vendre votre smartphone, tablette ou ordinateur',           href: '/services/rachat-de-votre-smartphone',       keywords: ['rachat', 'vendre', 'revente', 'reprise', 'occasion', 'estimation'], type: 'service' },
  { title: 'Service de coursier',      description: 'Collecte et retour de votre appareil',                      href: '/service-de-coursier',                       keywords: ['coursier', 'livraison', 'collecte', 'retour'],                type: 'service' },
  { title: 'Réparation dégâts d\'eau', description: 'Intervention après contact avec l\'eau',                    href: '/reparation-degat-eau-lausanne',             keywords: ['eau', 'degat', 'oxydation', 'humidite', 'tombe', 'mouille'],  type: 'repair'  },
  { title: 'Shop ClikClak',            description: 'Smartphones, pièces et accessoires disponibles',            href: '/shop-reparation-smartphone-lausanne',        keywords: ['shop', 'acheter', 'occasion', 'neuf', 'accessoires', 'pieces'], type: 'shop'   },
  { title: 'Contact ClikClak',         description: 'Formulaire, téléphone, adresse boutique Lausanne',          href: '/contact-clik-clak-lausanne',                keywords: ['contact', 'formulaire', 'adresse', 'telephone'],              type: 'service' },
]

let _shopEntries: SearchEntry[] | null = null
function getShopEntries(): SearchEntry[] {
  if (!_shopEntries) {
    _shopEntries = SHOP_PRODUCTS
      .filter(p => p.availability === 'en-stock')
      .map(p => ({
        title:       p.name,
        description: `${p.price != null ? `CHF ${p.price.toFixed(0)} — ` : ''}${p.brand ?? ''}`.trim().replace(/— $/, ''),
        href:        `/shop-reparation-smartphone-lausanne/${p.slug}`,
        keywords:    [p.name, p.brand ?? '', p.mainCategory].map(s => s.toLowerCase()),
        type:        'shop' as const,
      }))
  }
  return _shopEntries
}

export function searchChatbot(query: string, limit = 5): SearchEntry[] {
  const q = norm(query.trim())
  if (!q || q.length < 2) return []
  const words = q.split(/\s+/).filter(w => w.length > 1)
  const all = [...STATIC_ENTRIES, ...getShopEntries()]
  return all
    .filter(e => {
      const text = norm([e.title, e.description, ...e.keywords].join(' '))
      return text.includes(q) || words.some(w => text.includes(w))
    })
    .slice(0, limit)
}
