/*
  lib/chatbot/siteContext.ts

  Génère le contexte textuel injecté dans le system prompt du chatbot.
  Utilise uniquement les données réelles du site — rien n'est inventé ici.

  Règles :
  - Ne jamais inventer de prix, stock, délai, garantie ou produit.
  - Ne pas injecter les 318 produits du shop (trop volumineux) — injecter uniquement les catégories.
  - Les prix exacts proviennent des data/iphoneRepairs.ts etc., non injectés ici pour rester léger.
  - Si une information n'est pas certaine, ne pas l'inclure.
*/

import { SERVICES } from './servicesIndex'
import { CONTACT_INFO } from './contactInfo'

export function getClikClakSiteContext(): string {
  const serviceLines = SERVICES
    .map(s => `  - ${s.title} : ${s.description}`)
    .join('\n')

  return `CONTEXTE CLIKCLAK — informations vérifiées du site :

SERVICES DISPONIBLES :
${serviceLines}

SHOP :
  - Catégories : smartphones neufs ou d'occasion, tablettes, ordinateurs, pièces détachées, accessoires
  - URL shop : ${CONTACT_INFO.shopPage}
  - Les produits et stocks exacts sont à consulter directement sur le shop ou à confirmer en boutique.
  - Ne jamais inventer la disponibilité d'un produit spécifique.

CONTACT :
  - Ville : ${CONTACT_INFO.city}
  - Page contact et formulaire : ${CONTACT_INFO.contactPage}
  - ${CONTACT_INFO.note}
  - Adresse exacte et horaires : à confirmer via la page contact ou en boutique.

RÈGLES D'UTILISATION DU CONTEXTE :
  - Utilise ce contexte pour orienter les clients vers le bon service ou la bonne page.
  - Pour les prix exacts, dis que le tarif dépend du modèle et propose de le confirmer en boutique ou via le formulaire.
  - Pour les produits du shop, oriente vers ${CONTACT_INFO.shopPage} plutôt que d'inventer un stock.
  - Pour l'adresse ou les horaires précis, oriente vers ${CONTACT_INFO.contactPage}.`
}
