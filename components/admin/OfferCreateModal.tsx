'use client'
/*
  components/admin/OfferCreateModal.tsx

  Formulaire de création d'une offre.
  - Prérempli avec le modèle sélectionné si fourni
  - Options avancées repliées par défaut
*/

import { useActionState, useState, useMemo } from 'react'
import { OfferModal }      from './OfferModal'
import {
  createRepairOfferAction,
  type AdminActionResult,
} from '@/app/admin/(dashboard)/reparations/actions'
import type { ModelSelectOption, TypeSelectOption } from '@/lib/admin/queries'

const initialState: AdminActionResult = { success: false, message: '' }

interface Props {
  models:         ModelSelectOption[]
  types:          TypeSelectOption[]
  prefilledModel?: string   // model UUID to preselect
  closeHref:      string
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
const labelClass = 'block text-xs font-rubik font-medium text-foreground/50 mb-1'

function FieldError({ errors, field }: { errors?: Record<string, string[]>; field: string }) {
  const m = errors?.[field]
  if (!m?.length) return null
  return <p className="mt-1 text-xs text-red-400">{m[0]}</p>
}

export function OfferCreateModal({ models, types, prefilledModel, closeHref }: Props) {
  const [state, action, pending] = useActionState<AdminActionResult, FormData>(
    createRepairOfferAction,
    initialState,
  )

  const [pricingMode, setPricingMode]   = useState('fixed')
  const [availability, setAvailability] = useState('available')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [modelSearch, setModelSearch]   = useState('')

  const errors = state.fieldErrors

  const filteredModels = useMemo(() => {
    if (!modelSearch.trim()) return models
    const q = modelSearch.toLowerCase()
    return models.filter(m =>
      m.name.toLowerCase().includes(q) || m.brand_name.toLowerCase().includes(q)
    )
  }, [models, modelSearch])

  const groupedModels = useMemo(() => {
    const g: Record<string, ModelSelectOption[]> = {}
    for (const m of filteredModels) {
      if (!g[m.brand_key]) g[m.brand_key] = []
      g[m.brand_key].push(m)
    }
    return g
  }, [filteredModels])

  if (state.success) {
    return (
      <OfferModal title="Offre créée" closeHref={closeHref}>
        <div className="text-center py-6 space-y-4">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" className="mx-auto" aria-hidden>
            <circle cx="18" cy="18" r="17" stroke="#ccff33" strokeWidth="1.5" />
            <path d="M11 18l5 5 9-10" stroke="#ccff33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-sm font-rubik text-foreground/60">{state.message}</p>
          <a href={closeHref} className="inline-block px-4 py-2 rounded-btn bg-accent text-primary-foreground text-sm font-rubik font-semibold hover:bg-accent/90 transition-colors">
            Fermer
          </a>
        </div>
      </OfferModal>
    )
  }

  return (
    <OfferModal title="Ajouter une réparation" closeHref={closeHref}>
      <form action={action} className="space-y-4">

        {/* Modèle */}
        {prefilledModel ? (
          <>
            <input type="hidden" name="device_model_id" value={prefilledModel} />
            <div className="px-3 py-2 rounded-btn bg-white/4 border border-white/8">
              <p className="text-[10px] font-rubik text-foreground/30 uppercase tracking-wide">Modèle prérempli</p>
              <p className="text-sm font-rubik text-foreground/70 mt-0.5">
                {models.find(m => m.id === prefilledModel)?.name ?? prefilledModel}
              </p>
            </div>
          </>
        ) : (
          <div>
            <label htmlFor="model_search" className={labelClass}>Modèle</label>
            <input id="model_search" type="search" value={modelSearch}
              onChange={e => setModelSearch(e.target.value)}
              placeholder="Filtrer les modèles…" disabled={pending}
              className={`${inputClass} mb-1`} />
            <select name="device_model_id" required disabled={pending}
              className={`${inputClass} h-32`} size={6} aria-label="Choisir un modèle">
              {Object.entries(groupedModels).map(([bk, bms]) => (
                <optgroup key={bk} label={bms[0].brand_name}>
                  {bms.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </optgroup>
              ))}
            </select>
            <FieldError errors={errors} field="device_model_id" />
          </div>
        )}

        {/* Type + Clé variante */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="repair_type_id" className={labelClass}>Type de réparation</label>
            <select id="repair_type_id" name="repair_type_id" required disabled={pending}
              className={`${inputClass} cursor-pointer`}>
              <option value="">— Choisir —</option>
              {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <FieldError errors={errors} field="repair_type_id" />
          </div>
          <div>
            <label htmlFor="variant_key" className={labelClass}>Clé variante</label>
            <input id="variant_key" name="variant_key" type="text"
              required defaultValue="standard" pattern="[a-z0-9][a-z0-9-]*"
              disabled={pending} className={inputClass} placeholder="standard" />
            <FieldError errors={errors} field="variant_key" />
          </div>
        </div>

        {/* Mode tarifaire + Prix */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="cr_pricing_mode" className={labelClass}>Mode tarifaire</label>
            <select id="cr_pricing_mode" name="pricing_mode" value={pricingMode}
              onChange={e => setPricingMode(e.target.value)} disabled={pending}
              className={`${inputClass} cursor-pointer`}>
              <option value="fixed">Prix fixe (CHF)</option>
              <option value="on_request">Sur demande</option>
              <option value="quote">Sur devis</option>
            </select>
          </div>
          <div>
            <label htmlFor="cr_price_chf" className={labelClass}>Prix CHF</label>
            <div className="relative">
              <input id="cr_price_chf" name="price_chf" type="text" inputMode="decimal"
                disabled={pending || pricingMode !== 'fixed'}
                placeholder={pricingMode === 'fixed' ? '0' : '—'}
                className={`${inputClass} pr-12 ${pricingMode !== 'fixed' ? 'opacity-30' : ''}`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-rubik text-foreground/40 pointer-events-none">CHF</span>
            </div>
            <FieldError errors={errors} field="price_chf" />
          </div>
        </div>

        {/* Disponibilité */}
        <div>
          <label htmlFor="cr_availability" className={labelClass}>Disponibilité</label>
          <select id="cr_availability" name="availability" value={availability}
            onChange={e => setAvailability(e.target.value)} disabled={pending}
            className={`${inputClass} cursor-pointer`}>
            <option value="available">Disponible</option>
            <option value="on_request">Sur demande</option>
            <option value="unavailable">Indisponible</option>
          </select>
        </div>

        {/* Note publique */}
        <div>
          <label htmlFor="cr_public_note" className={labelClass}>
            Note publique{availability === 'unavailable' && <span className="ml-1 text-amber-400">* obligatoire</span>}
          </label>
          <textarea id="cr_public_note" name="public_note" rows={2}
            required={availability === 'unavailable'} disabled={pending}
            className={`${inputClass} h-auto py-2 resize-none`}
            placeholder="Visible par les visiteurs" />
          <FieldError errors={errors} field="public_note" />
        </div>

        {/* Options avancées */}
        <div className="border-t border-white/8 pt-3">
          <button type="button" onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-2 text-sm font-rubik text-foreground/40 hover:text-foreground/70 transition-colors w-full text-left"
            aria-expanded={showAdvanced}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`} aria-hidden>
              <path d="M4 2l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Options avancées
          </button>

          <div className={showAdvanced ? 'mt-4 space-y-3' : 'hidden'}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Nom de variante</label>
                <input name="variant_name" type="text" disabled={pending} className={inputClass} placeholder="ex : Premium" />
              </div>
              <div>
                <label className={labelClass}>Sous-titre</label>
                <input name="subtitle" type="text" disabled={pending} className={inputClass} placeholder="ex : Changement d'écran" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Note interne</label>
                <textarea name="internal_note" rows={2} disabled={pending}
                  className={`${inputClass} h-auto py-2 resize-none`} />
              </div>
              <div className="space-y-2">
                <div>
                  <label className={labelClass}>Durée (min)</label>
                  <input name="duration_minutes" type="number" min={1} disabled={pending} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Garantie (mois)</label>
                  <input name="warranty_months" type="number" min={0} disabled={pending} className={inputClass} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Statut</label>
                <select name="status" defaultValue="active" disabled={pending}
                  className={`${inputClass} cursor-pointer`}>
                  <option value="active">Actif</option>
                  <option value="inactive">Inactif</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Ordre</label>
                <input name="sort_order" type="number" min={0} defaultValue={0} disabled={pending} className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* Erreur globale */}
        {!state.success && state.message && !state.fieldErrors && (
          <p role="alert" className="text-sm font-rubik text-red-400 bg-red-400/8 border border-red-400/20 px-4 py-2.5 rounded-btn">
            {state.message}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-1">
          <a href={closeHref} className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/45 hover:text-foreground hover:bg-white/5 transition-colors">
            Annuler
          </a>
          <button type="submit" disabled={pending}
            className="h-9 px-5 rounded-btn bg-accent text-primary-foreground font-rubik font-semibold text-sm hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-220">
            {pending ? 'Création…' : 'Créer'}
          </button>
        </div>
      </form>
    </OfferModal>
  )
}
