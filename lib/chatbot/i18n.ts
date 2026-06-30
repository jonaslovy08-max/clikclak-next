/*
  lib/chatbot/i18n.ts

  Dictionnaire centralisé des textes visibles du chatbot ClikClak.
  Client + serveur (aucun secret). Utilisé par ClikClakAssistant.tsx.

  Règle : aucune chaîne française ou anglaise codée en dur dans le composant —
  tout passe par CHATBOT_I18N[locale] ou les helpers ci-dessous.
*/

import { getAlternatePath } from '@/i18n/routes'
import type { ChatbotLocale } from './locale'

/* ── Localisation des hrefs ────────────────────────────────────────
   Les données métier (data/*.ts, lib/chatbot/*Index.ts) restent
   exclusivement en français — un seul jeu d'URLs FR sert de source.
   Cette fonction convertit à l'affichage uniquement, sans dupliquer
   aucune donnée de réparation, de modèle ou de prix.

   Cas particulier : le shop n'a pas d'équivalent EN (SHOP_ENABLED=false,
   aucune page /en/shop-* créée — décision déjà actée pour le reste du
   site). Les liens shop restent donc volontairement vers la version FR
   même en contexte EN, à l'identique du comportement du LanguageSwitcher
   et du menu sur le reste du site.
──────────────────────────────────────────────────────────────────── */
export function localizeChatbotHref(href: string, locale: ChatbotLocale): string {
  if (locale === 'fr') return href
  if (href.startsWith('/shop-reparation-smartphone-lausanne')) return href

  const alt = getAlternatePath(href, 'en')
  /* getAlternatePath retombe sur '/en' si aucune route ne correspond.
     Pour un href métier connu sans correspondance dans i18n/routes.ts,
     mieux vaut conserver l'URL FR d'origine (jamais cassée) plutôt que
     rediriger silencieusement vers l'accueil anglais. */
  if (alt === '/en' && href !== '/') return href
  return alt
}

/* ── Localisation du nom de ville ──────────────────────────────────
   CONTACT_INFO.city ('Lausanne, Suisse') reste la donnée de référence
   unique (non dupliquée). Seul le nom du pays est cosmétiquement
   localisé à l'affichage — pas de traduction dynamique, mapping fixe. */
export function localizeChatbotCity(city: string, locale: ChatbotLocale): string {
  if (locale === 'fr') return city
  return city.replace(/\bSuisse\b/, 'Switzerland')
}

/* ── Types ─────────────────────────────────────────────────────────── */

interface ChatbotStrings {
  /* Header */
  botName:            string
  botSubtitle:         string
  closeAriaLabel:      string
  dialogAriaLabel:     string

  /* Welcome */
  welcomeMessage:      string

  /* Brands */
  brandOther:          string

  /* Quick actions */
  qaFindPrice:         string
  qaIdentifyModel:      string
  qaDataRecovery:      string
  qaSellDevice:        string
  qaDepannage:         string
  qaShop:              string
  qaContact:           string
  quickActionsToggle:  string

  /* Common */
  back:                string
  sendAriaLabel:       string
  inputPlaceholder:     string
  noModelFound:        string
  noProductFound:       string
  priceOnRequest:       string
  viewFullPage:        string
  viewFullShop:        string
  pricesVaryNote:      string
  pricesVaryByModelNote: string

  /* find-price screen */
  whichBrand:          string

  /* iphone-model screen */
  searchIphoneModelPlaceholder: string

  /* other-brand screen */
  pricesFor:           (brand: string) => string
  viewBrandPrices:     (brand: string) => string
  navSmartphoneRepair: string
  navTabletRepair:     string
  navComputerRepair:   string

  /* identify-model screen */
  identifyModelTitle:  string
  identifySettingsIphone: string
  identifySettingsAndroid: string
  identifySettingsMac: string
  sendPhoto:           string

  /* data-recovery screen */
  dataRecoveryTitle:   string
  dataRecoveryNote:    string
  viewDataRecoveryPage: string
  contactClikClak:     string

  /* sell-device screen */
  sellDeviceTitle:     string
  sellDeviceNote:      string
  requestEstimate:     string

  /* depannage screen */
  depannageTitle:      string
  depannageNote:       string
  requestDepannage:    string

  /* shop screen */
  searchProductPlaceholder: string

  /* contact screen */
  contactTitle:        string
  contactNote:         string
  contactForm:         string

  /* Session limit */
  sessionLimitReached:  string
  questionsRemaining:  (n: number) => string

  /* sendToAI error branches */
  errRateLimited:       string
  errUnavailable:       string
  errTooLong:           string
  errGeneric:           string
  errNetwork:           string
  fallbackAnswer:       string
  viewServices:         string
}

/* ── FR (texte existant, inchangé) ───────────────────────────────── */

const FR: ChatbotStrings = {
  botName:            'ClikClak Bot',
  botSubtitle:        'Assistant automatisé',
  closeAriaLabel:     'Fermer le chatbot',
  dialogAriaLabel:    'ClikClak Bot',

  welcomeMessage:     'Bonjour, je suis ClikClak Bot. Je peux vous aider à trouver un prix de réparation, identifier une panne, chercher un produit ou vous orienter vers le bon service.',

  brandOther:         'Autre',

  qaFindPrice:        'Trouver un prix',
  qaIdentifyModel:    'Identifier mon modèle',
  qaDataRecovery:     'Récupération de données',
  qaSellDevice:       'Vendre un appareil',
  qaDepannage:        'Dépannage 7/7',
  qaShop:             'Voir le shop',
  qaContact:          'Contacter ClikClak',
  quickActionsToggle: 'Actions rapides',

  back:               '← Retour',
  sendAriaLabel:      'Envoyer',
  inputPlaceholder:   'Posez votre question : prix, panne, modèle, shop…',
  noModelFound:       'Aucun modèle trouvé.',
  noProductFound:     'Aucun produit trouvé.',
  priceOnRequest:     'Prix sur demande',
  viewFullPage:       'Voir la page complète',
  viewFullShop:       'Voir tout le shop',
  pricesVaryNote:     'Les tarifs peuvent varier selon les pièces disponibles.',
  pricesVaryByModelNote: 'Les tarifs varient selon le modèle exact.',

  whichBrand:         'Pour quelle marque ?',

  searchIphoneModelPlaceholder: 'Rechercher un modèle iPhone…',

  pricesFor:          (brand) => `Tarifs ${brand}`,
  viewBrandPrices:    (brand) => `Voir les tarifs ${brand}`,
  navSmartphoneRepair: 'Réparation smartphone',
  navTabletRepair:    'Réparation tablette',
  navComputerRepair:  'Réparation ordinateur',

  identifyModelTitle: 'Comment identifier votre modèle',
  identifySettingsIphone: 'Réglages > Général > Informations',
  identifySettingsAndroid: 'Paramètres > À propos du téléphone',
  identifySettingsMac: 'Menu Apple > À propos de ce Mac',
  sendPhoto:          'Envoyer une photo',

  dataRecoveryTitle:  'Récupération de données',
  dataRecoveryNote:   'Aucun résultat ne peut être garanti avant analyse.',
  viewDataRecoveryPage: 'Voir la page récupération',
  contactClikClak:    'Contacter ClikClak',

  sellDeviceTitle:    'Vendre un appareil',
  sellDeviceNote:     'Smartphone, tablette, Mac, montre ou écouteurs. Offre après contrôle réel.',
  requestEstimate:    'Demander une estimation',

  depannageTitle:     'Dépannage 7/7',
  depannageNote:      'Selon disponibilité et faisabilité technique.',
  requestDepannage:   'Demander un dépannage',

  searchProductPlaceholder: 'Chercher un produit…',

  contactTitle:       'Contacter ClikClak',
  contactNote:        'Formulaire de contact ou passage en boutique à Lausanne.',
  contactForm:        'Formulaire de contact',

  sessionLimitReached: 'Vous avez atteint la limite de cette conversation. Pour poursuivre, contactez directement ClikClak.',
  questionsRemaining: (n) => `${n} question${n > 1 ? 's' : ''} restante${n > 1 ? 's' : ''}`,

  errRateLimited:     'Vous avez envoyé trop de messages. Réessayez dans quelques minutes.',
  errUnavailable:     'Le chatbot est momentanément indisponible. Vous pouvez contacter ClikClak directement.',
  errTooLong:         'Votre message est trop long. Raccourcissez-le et réessayez.',
  errGeneric:         "Votre message n'a pas pu être traité. Reformulez votre question.",
  errNetwork:         'Le chatbot IA est momentanément indisponible. Vous pouvez contacter Clik Clak directement.',
  fallbackAnswer:     "Je n'ai pas pu générer de réponse.",
  viewServices:       'Voir les services',
}

/* ── EN ──────────────────────────────────────────────────────────── */

const EN: ChatbotStrings = {
  botName:            'ClikClak Bot',
  botSubtitle:        'Automated assistant',
  closeAriaLabel:     'Close chatbot',
  dialogAriaLabel:    'ClikClak Bot',

  welcomeMessage:     "Hi, I'm ClikClak Bot. I can help you find a repair price, identify an issue, look for a product, or point you to the right service.",

  brandOther:         'Other',

  qaFindPrice:        'Find a price',
  qaIdentifyModel:    'Identify my model',
  qaDataRecovery:     'Data recovery',
  qaSellDevice:       'Sell a device',
  qaDepannage:        '7/7 support',
  qaShop:             'View the shop',
  qaContact:          'Contact ClikClak',
  quickActionsToggle: 'Quick actions',

  back:               '← Back',
  sendAriaLabel:      'Send',
  inputPlaceholder:   'Ask your question: price, issue, model, shop…',
  noModelFound:       'No model found.',
  noProductFound:     'No product found.',
  priceOnRequest:     'Price on request',
  viewFullPage:       'View full page',
  viewFullShop:       'View the full shop',
  pricesVaryNote:     'Prices may vary depending on parts availability.',
  pricesVaryByModelNote: 'Prices vary depending on the exact model.',

  whichBrand:         'Which brand?',

  searchIphoneModelPlaceholder: 'Search for an iPhone model…',

  pricesFor:          (brand) => `${brand} prices`,
  viewBrandPrices:    (brand) => `View ${brand} prices`,
  navSmartphoneRepair: 'Smartphone repair',
  navTabletRepair:    'Tablet repair',
  navComputerRepair:  'Computer repair',

  identifyModelTitle: 'How to identify your model',
  identifySettingsIphone: 'Settings > General > About',
  identifySettingsAndroid: 'Settings > About phone',
  identifySettingsMac: 'Apple menu > About This Mac',
  sendPhoto:          'Send a photo',

  dataRecoveryTitle:  'Data recovery',
  dataRecoveryNote:   'No result can be guaranteed before analysis.',
  viewDataRecoveryPage: 'View the data recovery page',
  contactClikClak:    'Contact ClikClak',

  sellDeviceTitle:    'Sell a device',
  sellDeviceNote:     'Smartphone, tablet, Mac, watch or earphones. Offer confirmed after physical inspection.',
  requestEstimate:    'Request an estimate',

  depannageTitle:     '7/7 support',
  depannageNote:      'Subject to availability and technical feasibility.',
  requestDepannage:   'Request support',

  searchProductPlaceholder: 'Search for a product…',

  contactTitle:       'Contact ClikClak',
  contactNote:        'Contact form, or visit our store in Lausanne.',
  contactForm:        'Contact form',

  sessionLimitReached: "You've reached the limit for this conversation. To continue, please contact ClikClak directly.",
  questionsRemaining: (n) => `${n} question${n > 1 ? 's' : ''} remaining`,

  errRateLimited:     "You've sent too many messages. Please try again in a few minutes.",
  errUnavailable:     'The chatbot is temporarily unavailable. You can contact ClikClak directly.',
  errTooLong:         'Your message is too long. Please shorten it and try again.',
  errGeneric:         'Your message could not be processed. Please rephrase your question.',
  errNetwork:         'The AI chatbot is temporarily unavailable. You can contact ClikClak directly.',
  fallbackAnswer:     'I could not generate a reply.',
  viewServices:       'View services',
}

export const CHATBOT_I18N: Record<ChatbotLocale, ChatbotStrings> = { fr: FR, en: EN }
