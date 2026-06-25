'use client'
/*
  components/admin/OfferEditModal.tsx

  Formulaire de modification d'une offre — refonte Phase 2B.

  Interface simplifiée :
  - Champs principaux visibles immédiatement : mode tarifaire, prix, disponibilité, note publique
  - Options avancées repliées par défaut : variante, sous-titre, notes, durée, garantie, statut, ordre

  Le contrôle de concurrence (expected_updated_at) est conservé.
*/

import { useActionState, useState } from 'react'
import { OfferModal }    from './OfferModal'
import {
  updateRepairOfferAction,
  type AdminActionResult,
} from '@/app/admin/(dashboard)/reparations/actions'
import type { OfferDetail } from '@/lib/admin/queries'

const initialState: AdminActionResult = { success: false, message: '' }

interface Props {
  offer:     OfferDetail
  closeHref: string
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

function centsToChf(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return ''
  const full = Math.trunc(cents / 100)
  const frac = cents % 100
  return frac === 0 ? String(full) : `${full}.${String(frac).padStart(2, '0')}`
}

export function OfferEditModal({ offer, closeHref }: Props) {
  const [state, action, pending] = useActionState<AdminActionResult, FormData>(
    updateRepairOfferAction,
    initialState,
  )

  const [pricingMode, setPricingMode]   = useState(offer.pricing_mode)
  const [availability, setAvailability] = useState(offer.availability)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const errors = state.fieldErrors

  if (state.success) {
    return (
      <OfferModal title="Offre modifiée" closeHref={closeHref}>
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
    <OfferModal
      title={`Modifier · ${offer.type_name}`}
      closeHref={closeHref}
    >
      {/* Contexte compact */}
      <p className="text-xs font-rubik text-foreground/35 mb-5 -mt-1">
        {offer.brand_name} · {offer.model_name}
      </p>

      <form action={action} className="space-y-5">
        {/* Hidden */}
        <input type="hidden" name="offer_id"            value={offer.id} />
        <input type="hidden" name="expected_updated_at" value={offer.updated_at} />

        {/* ── Champs principaux ──────────────────────────── */}

        {/* Mode tarifaire + Prix */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="pricing_mode" className={labelClass}>Mode tarifaire</label>
            <select
              id="pricing_mode"
              name="pricing_mode"
              value={pricingMode}
              onChange={e => setPricingMode(e.target.value)}
              disabled={pending}
              className={`${inputClass} cursor-pointer`}
            >
              <option value="fixed">Prix fixe (CHF)</option>
              <option value="on_request">Sur demande</option>
              <option value="quote">Sur devis</option>
            </select>
            <FieldError errors={errors} field="pricing_mode" />
          </div>

          <div>
            <label htmlFor="price_chf" className={labelClass}>
              Prix {pricingMode !== 'fixed' && <span className="text-foreground/25">(non applicable)</span>}
            </label>
            <div className="relative">
              <input
                id="price_chf"
                name="price_chf"
                type="text"
                inputMode="decimal"
                defaultValue={centsToChf(offer.price_cents)}
                disabled={pending || pricingMode !== 'fixed'}
                placeholder={pricingMode === 'fixed' ? '0' : '—'}
                className={`${inputClass} pr-12 ${pricingMode !== 'fixed' ? 'opacity-30' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-rubik text-foreground/40 pointer-events-none">
                CHF
              </span>
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
            value={availability}
            onChange={e => setAvailability(e.target.value)}
            disabled={pending}
            className={`${inputClass} cursor-pointer`}
          >
            <option value="available">Disponible</option>
            <option value="on_request">Sur demande</option>
            <option value="unavailable">Indisponible</option>
          </select>
          <FieldError errors={errors} field="availability" />
        </div>

        {/* Note publique */}
        <div>
          <label htmlFor="public_note" className={labelClass}>
            Note publique
            {availability === 'unavailable' && (
              <span className="ml-1 text-amber-400">* obligatoire</span>
            )}
          </label>
          <textarea
            id="public_note"
            name="public_note"
            rows={2}
            defaultValue={offer.public_note ?? ''}
            disabled={pending}
            required={availability === 'unavailable'}
            className={`${inputClass} h-auto py-2 resize-none`}
            placeholder="Visible par les visiteurs"
          />
          <FieldError errors={errors} field="public_note" />
        </div>

        {/* ── Options avancées ───────────────────────────── */}
        <div className="border-t border-white/8 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(v => !v)}
            className="flex items-center gap-2 text-sm font-rubik text-foreground/40 hover:text-foreground/70 transition-colors w-full text-left"
            aria-expanded={showAdvanced}
          >
            <svg
              width="14" height="14" viewBox="0 0 14 14" fill="none"
              className={`transition-transform duration-200 ${showAdvanced ? 'rotate-90' : ''}`}
              aria-hidden
            >
              <path d="M4 2l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Options avancées
          </button>

          {/* Les champs advanced sont TOUJOURS dans le DOM (display:none) → soumis même masqués */}
          <div className={showAdvanced ? 'mt-4 space-y-3' : 'hidden'}>

            {/* Variante + Sous-titre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="adv_variant_name" className={labelClass}>Nom de variante</label>
                <input id="adv_variant_name" name="variant_name" type="text"
                  defaultValue={offer.variant_name ?? ''} disabled={pending}
                  className={inputClass} placeholder="ex : Premium" />
              </div>
              <div>
                <label htmlFor="adv_subtitle" className={labelClass}>Sous-titre</label>
                <input id="adv_subtitle" name="subtitle" type="text"
                  defaultValue={offer.subtitle ?? ''} disabled={pending}
                  className={inputClass} placeholder="ex : Changement d'écran" />
              </div>
            </div>

            {/* Clé variante lecture seule */}
            <div>
              <label className={labelClass}>Clé variante (non modifiable)</label>
              <div className="h-9 px-3 rounded-btn bg-white/3 border border-white/8 flex items-center">
                <code className="text-xs text-foreground/35">{offer.variant_key}</code>
              </div>
            </div>

            {/* Note interne */}
            <div>
              <label htmlFor="adv_internal_note" className={labelClass}>Note interne</label>
              <textarea id="adv_internal_note" name="internal_note" rows={2}
                defaultValue={offer.internal_note ?? ''} disabled={pending}
                className={`${inputClass} h-auto py-2 resize-none`} />
            </div>

            {/* Durée + Garantie */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="adv_duration" className={labelClass}>Durée (min)</label>
                <input id="adv_duration" name="duration_minutes" type="number" min={1}
                  defaultValue={offer.duration_minutes ?? ''} disabled={pending}
                  className={inputClass} placeholder="ex : 30" />
              </div>
              <div>
                <label htmlFor="adv_warranty" className={labelClass}>Garantie (mois)</label>
                <input id="adv_warranty" name="warranty_months" type="number" min={0}
                  defaultValue={offer.warranty_months ?? ''} disabled={pending}
                  className={inputClass} placeholder="ex : 6" />
              </div>
            </div>

            {/* Statut + Ordre */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="adv_status" className={labelClass}>Statut</label>
                <select id="adv_status" name="status" defaultValue={offer.status}
                  disabled={pending} className={`${inputClass} cursor-pointer`}>
                  <option value="active">Actif</option>
                  <option value="inactive">Brouillon</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
              <div>
                <label htmlFor="adv_sort_order" className={labelClass}>Ordre</label>
                <input id="adv_sort_order" name="sort_order" type="number" min={0}
                  defaultValue={offer.sort_order} disabled={pending} className={inputClass} />
              </div>
            </div>

          </div>
        </div>

        {/* Erreur globale */}
        {!state.success && state.message && !state.fieldErrors && (
          <p role="alert" className={`text-sm font-rubik px-4 py-2.5 rounded-btn border ${
            state.conflict
              ? 'text-amber-400 bg-amber-400/8 border-amber-400/20'
              : 'text-red-400 bg-red-400/8 border-red-400/20'
          }`}>
            {state.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <a href={closeHref} className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/45 hover:text-foreground hover:bg-white/5 transition-colors">
            Annuler
          </a>
          <button
            type="submit"
            disabled={pending}
            className="
              h-9 px-5 rounded-btn bg-accent text-primary-foreground
              font-rubik font-semibold text-sm
              hover:bg-accent/90
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors duration-220
            "
          >
            {pending ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </OfferModal>
  )
}
