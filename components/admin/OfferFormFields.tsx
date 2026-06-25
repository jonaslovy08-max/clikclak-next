'use client'
/*
  components/admin/OfferFormFields.tsx

  Champs partagés du formulaire d'offre (création + modification).
  Gère la logique conditionnelle prix/mode tarifaire et indisponibilité.
*/

import { type AdminActionResult } from '@/app/admin/(dashboard)/reparations/actions'

interface FieldErrorsProps { errors?: Record<string, string[]>; field: string }
function FieldError({ errors, field }: FieldErrorsProps) {
  const msgs = errors?.[field]
  if (!msgs?.length) return null
  return <p className="mt-1 text-xs text-red-400">{msgs[0]}</p>
}

const inputClass = `
  w-full h-9 px-3 rounded-btn
  bg-white/5 border border-white/12
  text-foreground text-sm font-rubik
  placeholder:text-foreground/25
  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors duration-220
`

const labelClass = 'block text-xs font-rubik font-medium text-foreground/55 mb-1'
const selectClass = `${inputClass} cursor-pointer`

interface OfferFormFieldsProps {
  state:       AdminActionResult
  pending:     boolean
  defaults?: {
    variant_name?:      string | null
    subtitle?:          string | null
    pricing_mode?:      string
    price_cents?:       number | null
    availability?:      string
    duration_minutes?:  number | null
    warranty_months?:   number | null
    public_note?:       string | null
    internal_note?:     string | null
    status?:            string
    sort_order?:        number
  }
}

function centsToChf(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return ''
  const full = Math.trunc(cents / 100)
  const frac = cents % 100
  if (frac === 0) return String(full)
  return `${full}.${String(frac).padStart(2, '0')}`
}

export function OfferFormFields({ state, pending, defaults = {} }: OfferFormFieldsProps) {
  const errors = state.fieldErrors

  return (
    <div className="space-y-4">

      {/* Variante */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="variant_name" className={labelClass}>
            Nom de variante <span className="text-foreground/30">(optionnel)</span>
          </label>
          <input
            id="variant_name"
            name="variant_name"
            type="text"
            defaultValue={defaults.variant_name ?? ''}
            disabled={pending}
            className={inputClass}
            placeholder="ex : Premium OLED"
          />
          <FieldError errors={errors} field="variant_name" />
        </div>

        <div>
          <label htmlFor="subtitle" className={labelClass}>
            Sous-titre <span className="text-foreground/30">(optionnel)</span>
          </label>
          <input
            id="subtitle"
            name="subtitle"
            type="text"
            defaultValue={defaults.subtitle ?? ''}
            disabled={pending}
            className={inputClass}
            placeholder="ex : Changement d'écran"
          />
          <FieldError errors={errors} field="subtitle" />
        </div>
      </div>

      {/* Tarification */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="pricing_mode" className={labelClass}>Mode tarifaire</label>
          <select
            id="pricing_mode"
            name="pricing_mode"
            defaultValue={defaults.pricing_mode ?? 'fixed'}
            disabled={pending}
            className={selectClass}
          >
            <option value="fixed">Prix fixe (CHF)</option>
            <option value="on_request">Sur demande</option>
            <option value="quote">Sur devis</option>
          </select>
          <FieldError errors={errors} field="pricing_mode" />
        </div>

        <div>
          <label htmlFor="price_chf" className={labelClass}>
            Prix CHF <span className="text-foreground/30">(si fixe)</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-rubik text-foreground/35 pointer-events-none">CHF</span>
            <input
              id="price_chf"
              name="price_chf"
              type="text"
              inputMode="decimal"
              defaultValue={centsToChf(defaults.price_cents)}
              disabled={pending}
              className={`${inputClass} pl-10`}
              placeholder="249 ou 249.90"
            />
          </div>
          <FieldError errors={errors} field="price_chf" />
        </div>
      </div>

      {/* Disponibilité */}
      <div>
        <label htmlFor="availability" className={labelClass}>Disponibilité</label>
        <select
          id="availability"
          name="availability"
          defaultValue={defaults.availability ?? 'available'}
          disabled={pending}
          className={selectClass}
        >
          <option value="available">Disponible</option>
          <option value="on_request">Sur demande</option>
          <option value="unavailable">Indisponible</option>
        </select>
        <FieldError errors={errors} field="availability" />
      </div>

      {/* Notes */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <label htmlFor="public_note" className={labelClass}>
            Note publique <span className="text-foreground/30">(obligatoire si indisponible)</span>
          </label>
          <textarea
            id="public_note"
            name="public_note"
            rows={2}
            defaultValue={defaults.public_note ?? ''}
            disabled={pending}
            className={`${inputClass} h-auto py-2 resize-none`}
            placeholder="ex : Ne peut pas être remplacé"
          />
          <FieldError errors={errors} field="public_note" />
        </div>

        <div>
          <label htmlFor="internal_note" className={labelClass}>
            Note interne <span className="text-foreground/30">(non visible publiquement)</span>
          </label>
          <textarea
            id="internal_note"
            name="internal_note"
            rows={2}
            defaultValue={defaults.internal_note ?? ''}
            disabled={pending}
            className={`${inputClass} h-auto py-2 resize-none`}
          />
          <FieldError errors={errors} field="internal_note" />
        </div>
      </div>

      {/* Durée + Garantie */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="duration_minutes" className={labelClass}>
            Durée <span className="text-foreground/30">(min, optionnel)</span>
          </label>
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            min={1}
            defaultValue={defaults.duration_minutes ?? ''}
            disabled={pending}
            className={inputClass}
            placeholder="ex : 30"
          />
          <FieldError errors={errors} field="duration_minutes" />
        </div>

        <div>
          <label htmlFor="warranty_months" className={labelClass}>
            Garantie <span className="text-foreground/30">(mois, optionnel)</span>
          </label>
          <input
            id="warranty_months"
            name="warranty_months"
            type="number"
            min={0}
            defaultValue={defaults.warranty_months ?? ''}
            disabled={pending}
            className={inputClass}
            placeholder="ex : 6"
          />
          <FieldError errors={errors} field="warranty_months" />
        </div>
      </div>

      {/* Statut + Ordre */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="status" className={labelClass}>Statut</label>
          <select
            id="status"
            name="status"
            defaultValue={defaults.status ?? 'active'}
            disabled={pending}
            className={selectClass}
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="archived">Archivé</option>
          </select>
          <FieldError errors={errors} field="status" />
        </div>

        <div>
          <label htmlFor="sort_order" className={labelClass}>Ordre</label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            min={0}
            defaultValue={defaults.sort_order ?? 0}
            disabled={pending}
            className={inputClass}
          />
          <FieldError errors={errors} field="sort_order" />
        </div>
      </div>

    </div>
  )
}
