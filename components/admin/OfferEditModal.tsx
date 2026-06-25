'use client'
/*
  components/admin/OfferEditModal.tsx

  Formulaire de modification d'une offre de réparation.
  Envoie expected_updated_at pour le contrôle de concurrence optimiste.
*/

import { useActionState } from 'react'
import { OfferModal }       from './OfferModal'
import { OfferFormFields }  from './OfferFormFields'
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

export function OfferEditModal({ offer, closeHref }: Props) {
  const [state, action, pending] = useActionState<AdminActionResult, FormData>(
    updateRepairOfferAction,
    initialState,
  )

  // Redirection automatique après succès
  if (state.success) {
    return (
      <OfferModal title="Offre modifiée" closeHref={closeHref}>
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

  return (
    <OfferModal title={`Modifier : ${offer.model_name} — ${offer.type_name}`} closeHref={closeHref}>
      <form action={action} className="space-y-5">
        {/* Champs hidden */}
        <input type="hidden" name="offer_id"            value={offer.id} />
        <input type="hidden" name="expected_updated_at" value={offer.updated_at} />

        {/* Contexte non modifiable */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-btn bg-white/4 border border-white/8">
          <div>
            <p className="text-[10px] font-rubik text-foreground/30 uppercase tracking-wide">Modèle</p>
            <p className="text-sm font-rubik text-foreground/70 mt-0.5">{offer.model_name}</p>
          </div>
          <div>
            <p className="text-[10px] font-rubik text-foreground/30 uppercase tracking-wide">Type</p>
            <p className="text-sm font-rubik text-foreground/70 mt-0.5">{offer.type_name}</p>
          </div>
          <div>
            <p className="text-[10px] font-rubik text-foreground/30 uppercase tracking-wide">Clé variante</p>
            <code className="text-xs text-foreground/50 mt-0.5 block">{offer.variant_key}</code>
          </div>
        </div>

        {/* Champs modifiables */}
        <OfferFormFields
          state={state}
          pending={pending}
          defaults={{
            variant_name:     offer.variant_name,
            subtitle:         offer.subtitle,
            pricing_mode:     offer.pricing_mode,
            price_cents:      offer.price_cents,
            availability:     offer.availability,
            duration_minutes: offer.duration_minutes ?? null,
            warranty_months:  offer.warranty_months  ?? null,
            public_note:      offer.public_note,
            internal_note:    offer.internal_note,
            status:           offer.status,
            sort_order:       offer.sort_order,
          }}
        />

        {/* Erreur globale */}
        {!state.success && state.message && !state.fieldErrors && (
          <p
            role="alert"
            className={`text-sm font-rubik px-4 py-2.5 rounded-btn border ${
              state.conflict
                ? 'text-amber-400 bg-amber-400/8 border-amber-400/20'
                : 'text-red-400 bg-red-400/8 border-red-400/20'
            }`}
          >
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
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1a1a1a]
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
