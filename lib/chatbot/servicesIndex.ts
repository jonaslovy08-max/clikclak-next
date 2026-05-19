import { normalizeText } from './normalizeSearch'

export interface ServiceEntry {
  title:       string
  description: string
  href:        string
  keywords:    string[]
}

export const SERVICES: ServiceEntry[] = [
  { title: 'Réparation smartphone',       description: 'Réparation iPhone, Samsung, Huawei et autres smartphones à Lausanne.',        href: '/reparation-smartphone-express',              keywords: ['smartphone', 'mobile', 'iphone', 'samsung', 'huawei', 'oppo', 'pixel', 'xiaomi'] },
  { title: 'Réparation tablette',         description: 'Réparation iPad, Samsung Galaxy Tab et autres tablettes.',                     href: '/reparation-tablette-express',                keywords: ['tablette', 'ipad', 'galaxy tab', 'tab'] },
  { title: 'Réparation ordinateur',       description: 'Réparation MacBook et PC portables à Lausanne.',                               href: '/reparation-ordinateur-express',              keywords: ['ordinateur', 'pc', 'macbook', 'mac', 'laptop', 'portable'] },
  { title: 'Réparation iPhone',           description: 'Tarifs et modèles disponibles pour réparation iPhone.',                        href: '/services/reparation-iphone',                 keywords: ['iphone', 'apple', '16', '15', '14', '13', '12', '11', 'x', 'se'] },
  { title: 'Réparation Samsung',          description: 'Tarifs et modèles disponibles pour réparation Samsung.',                       href: '/services/reparation-samsung-lausanne',        keywords: ['samsung', 'galaxy', 's25', 's24', 's23', 's22', 's21', 'a'] },
  { title: 'Réparation iPad',             description: 'Tarifs et familles disponibles pour réparation iPad.',                         href: '/services/reparation-ipad',                   keywords: ['ipad', 'pro', 'air', 'mini', 'tablette apple'] },
  { title: 'Réparation MacBook',          description: 'Tarifs disponibles pour réparation MacBook.',                                  href: '/services/reparation-macbook',                keywords: ['macbook', 'mac', 'apple', 'pro', 'air', 'm1', 'm2', 'm3'] },
  { title: 'Réparation Huawei / Honor',   description: 'Tarifs disponibles pour réparation Huawei et Honor.',                          href: '/services/reparation-huawei-lausanne',         keywords: ['huawei', 'honor', 'p30', 'p40', 'mate', 'nova'] },
  { title: 'Réparation OPPO',             description: 'Tarifs disponibles pour réparation OPPO.',                                     href: '/services/reparation-oppo',                   keywords: ['oppo', 'find', 'reno', 'a'] },
  { title: 'Changement d\'écran',         description: 'Remplacement écran cassé ou fissuré.',                                         href: '/services/reparation-ecran',                  keywords: ['ecran', 'vitre', 'cassé', 'fissure', 'brisé', 'affichage', 'dalle', 'lcd', 'oled'] },
  { title: 'Changement de batterie',      description: 'Remplacement batterie déchargée, gonflée ou faible autonomie.',                href: '/services/changement-batterie',               keywords: ['batterie', 'battery', 'autonomie', 'gonflée', 'décharge', 'charge rapide'] },
  { title: 'Connecteur de charge',        description: 'Réparation port de charge USB-C, Lightning ou micro-USB.',                    href: '/services/connecteur-de-charge',              keywords: ['connecteur', 'port', 'charge', 'usb', 'lightning', 'usb-c', 'chargement'] },
  { title: 'Diagnostic',                  description: 'Diagnostic complet de votre appareil.',                                       href: '/services/diagnostic',                        keywords: ['diagnostic', 'panne', 'analyse', 'test', 'vérification'] },
  { title: 'Récupération de données',     description: 'Récupération depuis smartphone, ordinateur, disque dur, SSD, clé USB.',       href: '/services/recuperation-donnees',              keywords: ['recuperation', 'données', 'fichiers', 'photos', 'ssd', 'disque', 'cle usb', 'sauvegarde', 'perdu', 'supprimé'] },
  { title: 'Transfert de données',        description: 'Transfert de données d\'un appareil à un autre.',                             href: '/services/transfert-donnees',                 keywords: ['transfert', 'migration', 'copie', 'sauvegarde', 'backup'] },
  { title: 'Dépannage 7/7',              description: 'Dépannage à domicile ou en boutique, 7 jours sur 7.',                         href: '/services/depannage-reparation-domicile',     keywords: ['depannage', 'domicile', 'assistance', 'aide', '7/7', 'configuration', 'bloqué', 'lent'] },
  { title: 'Rachat appareils',            description: 'Vendre votre smartphone, tablette, ordinateur, Mac, montre ou écouteurs.',    href: '/services/rachat-de-votre-smartphone',        keywords: ['rachat', 'vendre', 'revente', 'reprise', 'occasion', 'estimation', 'évaluation'] },
  { title: 'Service de coursier',         description: 'Collecte et retour de votre appareil à Lausanne et environs.',               href: '/service-de-coursier',                        keywords: ['coursier', 'livraison', 'collecte', 'retour', 'déplacement'] },
  { title: 'Réparation dégâts d\'eau',   description: 'Intervention urgente après contact avec l\'eau ou l\'humidité.',              href: '/reparation-degat-eau-lausanne',              keywords: ['eau', 'degat', 'oxydation', 'humidite', 'mouillé', 'pluie', 'tombé'] },
  { title: 'Shop ClikClak',              description: 'Smartphones, pièces détachées et accessoires disponibles en boutique.',       href: '/shop-reparation-smartphone-lausanne',        keywords: ['shop', 'acheter', 'occasion', 'neuf', 'accessoire', 'piece', 'produit'] },
  { title: 'Contact ClikClak Lausanne',  description: 'Formulaire de contact, adresse boutique, téléphone.',                         href: '/contact-clik-clak-lausanne',                 keywords: ['contact', 'formulaire', 'adresse', 'telephone', 'rendez-vous', 'lausanne'] },
]

export function searchServices(query: string, limit = 4): ServiceEntry[] {
  const q     = normalizeText(query)
  const words = q.split(' ').filter(w => w.length > 1)
  return SERVICES
    .filter(s => {
      const text = normalizeText([s.title, s.description, ...s.keywords].join(' '))
      return text.includes(q) || words.some(w => text.includes(w))
    })
    .slice(0, limit)
}
