/*
  data/repairTypes.ts — Types partagés pour toutes les pages de tarifs réparation.
  Importé par data/samsungRepairs.ts, data/ipadRepairs.ts, etc.
  et par components/repair/RepairPricingPage.tsx.
*/

export type RepairPrice    = number | string  /* 'Sur demande' | 'Sur devis' | 'Ne peut pas être remplacé' | etc. */
export type RepairCategory = 'screen' | 'battery' | 'other'

export interface RepairItem {
  label:    string
  price:    RepairPrice
  category: RepairCategory
}

export interface RepairModel {
  id:      string
  label:   string
  repairs: RepairItem[]
}

export interface RepairFamily {
  id:           string
  label:        string
  /*
    Affichage bouton — port du pattern iPhone :
      buttonPrefix (gris) + shortLabel (lime)
    Exemple Samsung S25 : buttonPrefix='Galaxy ' + shortLabel='S25' → "Galaxy S25"
    Si buttonPrefix absent → shortLabel seul en lime.
  */
  shortLabel:   string
  buttonPrefix?: string
  models:       RepairModel[]
}

export interface RepairBrandData {
  h1Prefix:            string
  h1Brand:             string
  brandIcon?:          string   /* chemin SVG dans /assets/icons/ — affiché au-dessus du H1 */
  breadcrumbLabel:     string
  breadcrumbHref:      string
  families:            RepairFamily[]
  defaultModelId:      string
  initialFamilyCount?: number
  repairNote?:         string
  searchPlaceholder?:  string
}

export function formatPrice(price: RepairPrice): string {
  if (typeof price === 'number') return `CHF ${Math.trunc(price)}`
  return price
}

/* Supprime les centimes d'un prix déjà formaté en string.
   "CHF 249.99" → "CHF 249"  |  "CHF 249" → "CHF 249"  |  "Sur demande" → "Sur demande" */
export function stripCents(price: string): string {
  return price.replace(/^(CHF\s+)(\d+)\.\d+$/, '$1$2')
}
