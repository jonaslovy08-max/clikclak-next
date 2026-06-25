'use client'
/*
  components/admin/OfferCreateModal.tsx

  Formulaire de création d'une nouvelle offre de réparation.
  Inclut la sélection du modèle (212 options) et du type (30 options).
*/

import { useActionState, useState, useMemo } from 'react'
import { OfferModal }      from './OfferModal'
import { OfferFormFields } from './OfferFormFields'
import {
  createRepairOfferAction,
  type AdminActionResult,
} from '@/app/admin/(dashboard)/reparations/actions'
import type { ModelSelectOption, TypeSelectOption } from '@/lib/admin/queries'

const initialState: AdminActionResult = { success: false, message: '' }

interface Props {
  models:    ModelSelectOption[]
  types:     TypeSelectOption[]
  closeHref: string
}

interface FieldErrorProps { errors?: Record<string, string[]>; field: string }
function FieldError({ errors, field }: FieldErrorProps) {
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
  disabled:opacity-50
  transition-colors duration-220
`
const labelClass = 'block text-xs font-rubik font-medium text-foreground/55 mb-1'
const selectClass = `${inputClass} cursor-pointer`

export function OfferCreateModal({ models, types, closeHref }: Props) {
  const [state, action, pending] = useActionState<AdminActionResult, FormData>(
    createRepairOfferAction,
    initialState,
  )

  const [modelSearch, setModelSearch] = useState('')

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return models
    const q = modelSearch.toLowerCase()
    return models.filter(m =>
      m.name.toLowerCase().includes(q) || m.brand_name.toLowerCase().includes(q)
    )
  }, [models, modelSearch])

  // Grouper les modèles filtrés par marque
  const groupedModels = useMemo(() => {
    const groups: Record<string, ModelSelectOption[]> = {}
    for (const m of filteredModels) {
      if (!groups[m.brand_key]) groups[m.brand_key] = []
      groups[m.brand_key].push(m)
    }
    return groups
  }, [filteredModels])

  if (state.success) {
    return (
      <OfferModal title="Offre créée" closeHref={closeHref}>
        <div className="text-center py-6 space-y-4">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mx-auto" aria-hidden>
            <circle cx="20" cy="20" r="19" stroke="#ccff33" strokeWidth="1.5" />
            <path d="M12 20l6 6 10-12" stroke="#ccff33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-rubik text-foreground/70">{state.message}</p>
          <a href={closeHref} className="inline-block px-4 py-2 rounded-btn bg-accent text-primary-foreground text-sm font-rubik font-semibold hover:bg-accent/90 transition-colors">
            Fermer
          </a>
        </div>
      </OfferModal>
    )
  }

  const errors = state.fieldErrors

  return (
    <OfferModal title="Ajouter une réparation" closeHref={closeHref}>
      <form action={action} className="space-y-4">

        {/* Sélection du modèle */}
        <div>
          <label htmlFor="model_search" className={labelClass}>
            Modèle <span className="text-foreground/30">(212 disponibles)</span>
          </label>
          <input
            id="model_search"
            type="search"
            value={modelSearch}
            onChange={e => setModelSearch(e.target.value)}
            placeholder="Filtrer : iPhone 15, Samsung…"
            className={`${inputClass} mb-1`}
            disabled={pending}
          />
          <select
            name="device_model_id"
            required
            disabled={pending}
            className={`${selectClass} h-36`}
            size={8}
            aria-label="Choisir un modèle"
          >
            {Object.entries(groupedModels).map(([brandKey, brandModels]) => (
              <optgroup key={brandKey} label={brandModels[0].brand_name}>
                {brandModels.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <FieldError errors={errors} field="device_model_id" />
        </div>

        {/* Type de réparation */}
        <div>
          <label htmlFor="repair_type_id" className={labelClass}>Type de réparation</label>
          <select
            id="repair_type_id"
            name="repair_type_id"
            required
            disabled={pending}
            className={selectClass}
          >
            <option value="">— Choisir un type —</option>
            {types.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
          <FieldError errors={errors} field="repair_type_id" />
        </div>

        {/* Clé de variante */}
        <div>
          <label htmlFor="variant_key" className={labelClass}>
            Clé de variante <span className="text-foreground/30">(ex : standard, premium)</span>
          </label>
          <input
            id="variant_key"
            name="variant_key"
            type="text"
            required
            defaultValue="standard"
            pattern="[a-z0-9][a-z0-9-]*"
            disabled={pending}
            className={inputClass}
            placeholder="standard"
          />
          <FieldError errors={errors} field="variant_key" />
        </div>

        {/* Champs communs */}
        <OfferFormFields state={state} pending={pending} />

        {/* Erreur globale */}
        {!state.success && state.message && !state.fieldErrors && (
          <p role="alert" className="text-sm font-rubik text-red-400 bg-red-400/8 border border-red-400/20 px-4 py-2.5 rounded-btn">
            {state.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <a
            href={closeHref}
            className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/55 hover:text-foreground hover:bg-white/5 transition-colors"
          >
            Annuler
          </a>
          <button
            type="submit"
            disabled={pending}
            className="
              h-9 px-5 rounded-btn
              bg-accent text-primary-foreground
              font-rubik font-semibold text-sm
              hover:bg-accent/90
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-220
            "
          >
            {pending ? 'Création…' : 'Créer l&apos;offre'}
          </button>
        </div>

      </form>
    </OfferModal>
  )
}
