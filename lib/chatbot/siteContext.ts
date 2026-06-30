/*
  lib/chatbot/siteContext.ts

  Génère le contexte textuel injecté dans le system prompt du chatbot.
  Utilise uniquement les données réelles du site — rien n'est inventé ici.
  Bilingue FR/EN : entièrement localisé, y compris les titres/descriptions
  de SERVICES — voir servicesIndexEn.ts pour la couche de libellés EN
  (clé = href FR canonique, donnée de référence non dupliquée). Aucune
  traduction dynamique via Anthropic : les libellés EN sont écrits une
  fois ici et réutilisés à chaque appel.

  Règles :
  - Ne jamais inventer de prix, stock, délai, garantie ou produit.
  - Ne pas injecter les centaines de produits du shop — injecter uniquement les catégories.
  - Les prix exacts proviennent des data/iphoneRepairs.ts etc., non injectés ici pour rester léger.
  - Si une information n'est pas certaine, ne pas l'inclure.
*/

import { SERVICES } from './servicesIndex'
import { SERVICE_LABELS_EN } from './servicesIndexEn'
import { CONTACT_INFO } from './contactInfo'
import { localizeChatbotHref, localizeChatbotCity } from './i18n'
import type { ChatbotLocale } from './locale'

export function getClikClakSiteContext(locale: ChatbotLocale): string {
  const contactHref = localizeChatbotHref(CONTACT_INFO.contactPage, locale)
  const city = localizeChatbotCity(CONTACT_INFO.city, locale)

  if (locale === 'en') {
    const serviceLines = SERVICES
      .map(s => {
        const label = SERVICE_LABELS_EN[s.href]
        if (!label) throw new Error(`servicesIndexEn.ts: missing EN label for service href "${s.href}"`)
        return `  - ${label.title}: ${label.description}`
      })
      .join('\n')

    return `CLIKCLAK CONTEXT — verified site information:

AVAILABLE SERVICES:
${serviceLines}

SHOP:
  - Categories: new or used smartphones, tablets, computers, spare parts, accessories
  - Shop URL: ${CONTACT_INFO.shopPage} (French-language shop — no English version yet)
  - Exact products and stock must be checked directly on the shop or confirmed in-store.
  - Never invent the availability of a specific product.

CONTACT:
  - City: ${city}
  - Contact page and form: ${contactHref}
  - For any specific question, direct the customer to the contact form at ${contactHref}.
  - Exact address and opening hours: to be confirmed via the contact page or in-store.

CONTEXT USAGE RULES:
  - Use this context to direct customers to the right service or page.
  - For exact prices, say the price depends on the model and offer to confirm in-store or via the contact form.
  - For shop products, direct to ${CONTACT_INFO.shopPage} rather than inventing stock.
  - For a precise address or opening hours, direct to ${contactHref}.`
  }

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
  - Page contact et formulaire : ${contactHref}
  - ${CONTACT_INFO.note}
  - Adresse exacte et horaires : à confirmer via la page contact ou en boutique.

RÈGLES D'UTILISATION DU CONTEXTE :
  - Utilise ce contexte pour orienter les clients vers le bon service ou la bonne page.
  - Pour les prix exacts, dis que le tarif dépend du modèle et propose de le confirmer en boutique ou via le formulaire.
  - Pour les produits du shop, oriente vers ${CONTACT_INFO.shopPage} plutôt que d'inventer un stock.
  - Pour l'adresse ou les horaires précis, oriente vers ${contactHref}.`
}
