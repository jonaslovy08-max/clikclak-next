'use client'
/*
  components/admin/DeleteOfferDialog.tsx

  Confirmation de suppression définitive d'une réparation.
  N'apparaît que pour les offres origin='admin' non publiées.
  Exige "SUPPRIMER" pour confirmer.
*/

import { useActionState } from 'react'
import { OfferModal }     from './OfferModal'
import {
  deleteOfferAction,
  type TarifsActionResult,
} from '@/app/admin/(dashboard)/modeles/[modelSlug]/tarifs/actions'
import type { OfferDetail } from '@/lib/admin/queries'

const initialState: TarifsActionResult = { success: false, message: '' }

interface Props {
  offer:     OfferDetail
  closeHref: string
}

export function DeleteOfferDialog({ offer, closeHref }: Props) {
  const [state, action, pending] = useActionState<TarifsActionResult, FormData>(
    async (prev, formData) => {
      const confirmation = formData.get('confirmation') as string ?? ''
      return deleteOfferAction(offer.id, offer.updated_at, confirmation)
    },
    initialState,
  )

  if (state.success) {
    return (
      <OfferModal title="Réparation supprimée" closeHref={closeHref}>
        <div className="text-center py-6 space-y-4">
          <p className="text-sm font-rubik text-foreground/60">{state.message}</p>
          <a href={closeHref} className="inline-block px-4 py-2 rounded-btn bg-white/8 border border-white/15 text-sm font-rubik text-foreground/60 hover:text-foreground transition-colors">
            Fermer
          </a>
        </div>
      </OfferModal>
    )
  }

  if (offer.origin !== 'admin') {
    return (
      <OfferModal title="Suppression impossible" closeHref={closeHref}>
        <div className="space-y-4">
          <div className="p-4 rounded-card bg-white/4 border border-white/10">
            <p className="text-sm font-rubik text-foreground/60">
              Cette réparation provient du catalogue initial.
              Elle peut être <strong>archivée</strong>, mais pas supprimée définitivement.
            </p>
          </div>
          <div className="flex justify-end">
            <a href={closeHref} className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
              Fermer
            </a>
          </div>
        </div>
      </OfferModal>
    )
  }

  if (offer.status === 'active') {
    return (
      <OfferModal title="Archivage requis" closeHref={closeHref}>
        <div className="space-y-4">
          <div className="p-4 rounded-card bg-amber-400/8 border border-amber-400/20">
            <p className="text-sm font-rubik text-foreground/60">
              Archivez d&apos;abord cette réparation avant de pouvoir la supprimer définitivement.
            </p>
          </div>
          <div className="flex justify-end">
            <a href={closeHref} className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
              Fermer
            </a>
          </div>
        </div>
      </OfferModal>
    )
  }

  return (
    <OfferModal title="Supprimer définitivement" closeHref={closeHref}>
      <div className="space-y-4">
        <div className="p-4 rounded-card bg-red-400/8 border border-red-400/20">
          <p className="text-sm font-rubik font-medium text-red-400">Cette action est irréversible.</p>
          <p className="text-xs font-rubik text-foreground/50 mt-1">
            <strong>{offer.type_name}</strong> — {offer.model_name}
          </p>
        </div>

        <form action={action} className="space-y-4">
          <div>
            <label className="block text-xs font-rubik font-medium text-foreground/50 mb-1.5">
              Saisissez <code className="text-red-300">SUPPRIMER</code> pour confirmer
            </label>
            <input
              name="confirmation"
              type="text"
              required
              disabled={pending}
              placeholder="SUPPRIMER"
              className="
                w-full h-9 px-3 rounded-btn
                bg-white/5 border border-red-400/20
                text-foreground text-sm font-rubik
                focus:outline-none focus:ring-2 focus:ring-red-400/40
                disabled:opacity-50
              "
            />
          </div>

          {state.message && !state.success && (
            <p role="alert" className="text-xs font-rubik text-red-400 bg-red-400/8 border border-red-400/20 px-3 py-2 rounded-btn">
              {state.message}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <a href={closeHref} className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
              Annuler
            </a>
            <button type="submit" disabled={pending}
              className="h-9 px-5 rounded-btn text-sm font-rubik font-semibold bg-red-500 text-white hover:bg-red-500/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {pending ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </form>
      </div>
    </OfferModal>
  )
}
