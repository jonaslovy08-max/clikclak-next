'use client'
/*
  components/admin/ArchiveConfirmDialog.tsx

  Confirmation avant archivage d'une offre.
  Envoie le offer_id et expected_updated_at via Server Action.
*/

import { useActionState } from 'react'
import {
  archiveRepairOfferAction,
  type AdminActionResult,
} from '@/app/admin/(dashboard)/reparations/actions'
import { OfferModal } from './OfferModal'

const initialState: AdminActionResult = { success: false, message: '' }

interface Props {
  offerId:      string
  offerLabel:   string
  updatedAt:    string
  closeHref:    string
}

export function ArchiveConfirmDialog({ offerId, offerLabel, updatedAt, closeHref }: Props) {
  const [state, action, pending] = useActionState<AdminActionResult, FormData>(
    archiveRepairOfferAction,
    initialState,
  )

  if (state.success) {
    return (
      <OfferModal title="Offre archivée" closeHref={closeHref}>
        <div className="text-center py-6 space-y-4">
          <p className="text-sm font-rubik text-foreground/70">{state.message}</p>
          <a href={closeHref} className="inline-block px-4 py-2 rounded-btn bg-accent text-primary-foreground text-sm font-rubik font-semibold hover:bg-accent/90 transition-colors">
            Fermer
          </a>
        </div>
      </OfferModal>
    )
  }

  return (
    <OfferModal title="Archiver cette offre ?" closeHref={closeHref}>
      <div className="space-y-4">
        <p className="text-sm font-rubik text-foreground/70">
          L&apos;offre <strong className="text-foreground">{offerLabel}</strong> sera archivée.
          Elle ne sera plus visible dans la liste par défaut mais ne sera pas supprimée.
        </p>

        {!state.success && state.message && (
          <p role="alert" className={`text-sm font-rubik px-4 py-2.5 rounded-btn border ${
            state.conflict
              ? 'text-amber-400 bg-amber-400/8 border-amber-400/20'
              : 'text-red-400 bg-red-400/8 border-red-400/20'
          }`}>
            {state.message}
          </p>
        )}

        <form action={action}>
          <input type="hidden" name="offer_id"            value={offerId} />
          <input type="hidden" name="expected_updated_at" value={updatedAt} />

          <div className="flex items-center justify-end gap-3">
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
                bg-red-500 text-white
                font-rubik font-semibold text-sm
                hover:bg-red-500/90
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/60
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors duration-220
              "
            >
              {pending ? 'Archivage…' : 'Confirmer l&apos;archivage'}
            </button>
          </div>
        </form>
      </div>
    </OfferModal>
  )
}
