/*
  lib/chatbot/servicesIndexEn.ts

  Couche de libellés anglais pour le contexte chatbot — clé = href FR
  canonique déjà présent dans SERVICES (lib/chatbot/servicesIndex.ts).
  Ne duplique aucun prix, modèle ou donnée métier : uniquement un titre
  et une description courte par service, au même niveau de détail que
  les libellés FR existants.

  Sources réutilisées (aucune traduction inventée) :
  - Libellés de navigation anglais déjà en production : components/layout/Header.tsx (navLinksEn)
  - Titres <title> et meta description des pages EN existantes sous app/(en)/en/services/*
  - i18n/routes.ts pour la correspondance des URLs (non dupliqué ici)

  SERVICES reste l'unique source de vérité pour les hrefs ; ce fichier
  ne fait qu'associer un libellé EN à un href déjà existant.
*/

export interface ServiceLabelEn {
  title:       string
  description: string
}

export const SERVICE_LABELS_EN: Record<string, ServiceLabelEn> = {
  '/reparation-smartphone-express':         { title: 'Smartphone repair',        description: 'iPhone, Samsung, Huawei and other smartphone repairs in Lausanne.' },
  '/reparation-tablette-express':           { title: 'Tablet repair',            description: 'iPad, Samsung Galaxy Tab and other tablet repairs.' },
  '/reparation-ordinateur-express':         { title: 'Computer repair',          description: 'MacBook and laptop repairs in Lausanne.' },
  '/services/reparation-iphone':            { title: 'iPhone repair',            description: 'Prices and models available for iPhone repair.' },
  '/services/reparation-samsung-lausanne':  { title: 'Samsung repair',           description: 'Prices and models available for Samsung repair.' },
  '/services/reparation-ipad':              { title: 'iPad repair',              description: 'Prices and families available for iPad repair.' },
  '/services/reparation-macbook':           { title: 'MacBook repair',           description: 'Prices available for MacBook repair.' },
  '/services/reparation-huawei-lausanne':   { title: 'Huawei / Honor repair',    description: 'Prices available for Huawei and Honor repair.' },
  '/services/reparation-oppo':              { title: 'OPPO repair',              description: 'Prices available for OPPO repair.' },
  '/services/reparation-ecran':             { title: 'Screen repair',            description: 'Replacement of a cracked or broken screen.' },
  '/services/changement-batterie':          { title: 'Battery replacement',      description: 'Replacement of a drained, swollen or low-autonomy battery.' },
  '/services/connecteur-de-charge':         { title: 'Charging port repair',     description: 'Repair of USB-C, Lightning or micro-USB charging ports.' },
  '/services/diagnostic':                   { title: 'Diagnostics',              description: 'Full diagnostic of your device.' },
  '/services/recuperation-donnees':         { title: 'Data recovery',            description: 'Recovery from smartphone, computer, hard drive, SSD, USB drive.' },
  '/services/transfert-donnees':            { title: 'Data transfer',            description: 'Data transfer from one device to another.' },
  '/services/depannage-reparation-domicile': { title: 'Home repair service',     description: 'On-site or in-store support, 7 days a week.' },
  '/services/rachat-de-votre-smartphone':   { title: 'Sell your device',         description: 'Sell your smartphone, tablet, computer, Mac, watch or earphones.' },
  '/service-de-coursier':                   { title: 'Courier service',          description: 'Pickup and return of your device in Lausanne and surrounding areas.' },
  '/reparation-degat-eau-lausanne':         { title: 'Water damage repair',      description: 'Urgent service after contact with water or humidity.' },
  '/shop-reparation-smartphone-lausanne':   { title: 'Shop',                     description: 'New or used smartphones, spare parts and accessories available in store.' },
  '/contact-clik-clak-lausanne':            { title: 'Contact',                  description: 'Contact form, store address, phone number.' },
}
