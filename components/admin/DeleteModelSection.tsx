'use client'
/*
  components/admin/DeleteModelSection.tsx

  Zone de danger pour la suppression définitive d'un modèle.
  N'apparaît que pour les modèles origin='admin' non publiés.
  Exige la saisie exacte du nom du modèle + case famille.
*/

import { useState, useTransition } from 'react'
import { useRouter }               from 'next/navigation'
import {
  deleteModelAction,
  type TarifsActionResult,
} from '@/app/admin/(dashboard)/modeles/[modelSlug]/tarifs/actions'
import type { ModelContext } from '@/lib/admin/queries'

interface Props {
  model:          ModelContext
  offerCount:     number
  updatedAt:      string
  canDeleteFamily: boolean  // famille vide et origin='admin'
  familyName:     string
}

export function DeleteModelSection({ model, offerCount, updatedAt, canDeleteFamily, familyName }: Props) {
  const router  = useRouter()
  const [isPending, startTransition] = useTransition()
  const [confirmed, setConfirmed]   = useState(false)
  const [inputName, setInputName]   = useState('')
  const [deleteFamily, setDeleteFamily] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  if (model.origin !== 'admin') {
    return (
      <div className="text-xs font-rubik text-foreground/30 pt-2">
        Ce modèle provient du catalogue initial. Il peut être archivé, mais pas supprimé définitivement.
      </div>
    )
  }

  if (model.status === 'active') {
    return (
      <div className="text-xs font-rubik text-foreground/35 pt-2">
        Archivez d&apos;abord ce modèle avant de pouvoir le supprimer définitivement.
      </div>
    )
  }

  if (!confirmed) {
    return (
      <button
        type="button"
        onClick={() => setConfirmed(true)}
        className="text-sm font-rubik text-red-400/40 hover:text-red-400 transition-colors"
      >
        Supprimer définitivement ce modèle…
      </button>
    )
  }

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result: TarifsActionResult = await deleteModelAction(
        model.id, updatedAt, inputName, model.name, deleteFamily,
      )
      if (result.success) {
        router.push('/admin/modeles')
      } else {
        setError(result.message)
      }
    })
  }

  return (
    <div className="p-4 rounded-card bg-red-400/6 border border-red-400/20 space-y-4">
      <div>
        <p className="text-sm font-rubik font-semibold text-red-400">Suppression définitive</p>
        <p className="text-xs font-rubik text-foreground/50 mt-1">
          Cette action est <strong>irréversible</strong>. Le modèle et ses réparations seront définitivement supprimés.
        </p>
      </div>

      {offerCount > 0 && (
        <p className="text-xs font-rubik text-foreground/50">
          {offerCount} réparation{offerCount > 1 ? 's' : ''} sera{offerCount > 1 ? 'ont' : ''} également supprimée{offerCount > 1 ? 's' : ''}.
        </p>
      )}

      <div>
        <label className="block text-xs font-rubik font-medium text-foreground/50 mb-1.5">
          Saisissez exactement : <code className="text-red-300">{model.name}</code>
        </label>
        <input
          type="text"
          value={inputName}
          onChange={e => setInputName(e.target.value)}
          disabled={isPending}
          placeholder={model.name}
          className="
            w-full h-9 px-3 rounded-btn
            bg-white/5 border border-red-400/20
            text-foreground text-sm font-rubik
            focus:outline-none focus:ring-2 focus:ring-red-400/40
            disabled:opacity-50
          "
        />
      </div>

      {canDeleteFamily && (
        <label className="flex items-center gap-2 text-xs font-rubik text-foreground/45 cursor-pointer">
          <input type="checkbox" checked={deleteFamily} onChange={e => setDeleteFamily(e.target.checked)}
            className="w-3.5 h-3.5 rounded" />
          Supprimer également la famille vide « {familyName} »
        </label>
      )}

      {error && (
        <p className="text-xs font-rubik text-red-400 bg-red-400/8 border border-red-400/20 px-3 py-2 rounded-btn">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={() => { setConfirmed(false); setError(null); setInputName('') }}
          className="px-4 py-1.5 rounded-btn text-sm font-rubik text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
          Annuler
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending || inputName !== model.name}
          className="
            px-4 py-1.5 rounded-btn text-sm font-rubik font-semibold
            bg-red-500 text-white
            hover:bg-red-500/90
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-colors
          "
        >
          {isPending ? 'Suppression…' : 'Supprimer définitivement'}
        </button>
      </div>
    </div>
  )
}
