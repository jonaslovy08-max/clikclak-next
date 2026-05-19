/*
  Informations de contact ClikClak.
  Ne contient que les informations déjà présentes publiquement sur le site.
  Ne pas inventer d'horaires, de numéros ou d'adresses.
*/

export const CONTACT_INFO = {
  city:         'Lausanne, Suisse',
  contactPage:  '/contact-clik-clak-lausanne',
  shopPage:     '/shop-reparation-smartphone-lausanne',
  note:         'Pour toute question spécifique, utilisez le formulaire de contact sur /contact-clik-clak-lausanne.',
} as const

export function getContactInfo(): typeof CONTACT_INFO {
  return CONTACT_INFO
}
