'use client'
/*
  TarifsEditor.tsx

  Éditeur groupé des tarifs d'un modèle.
  - Toutes les offres existantes sont affichées et éditables
  - Un bandeau de modifications non sauvegardées apparaît dès la première modification
  - Les types de réparation manquants peuvent être ajoutés
  - La sauvegarde est atomique via admin_bulk_update_model_offers
*/

import { useState, useTransition } from 'react'
import { useRouter }                        from 'next/navigation'
import type { OfferForTarifs, MissingRepairType, ModelContext } from '@/lib/admin/queries'
import {
  bulkUpdateOffersAction,
  archiveModelAction,
  type OfferPayload,
} from './actions'

/* ── Types ───────────────────────────────────────────────── */

interface RowState {
  id:                string | null
  repairTypeId:      string
  repairTypeName:    string
  variantKey:        string
  variantName:       string
  subtitle:          string
  pricingMode:       string
  priceChf:          string
  availability:      string
  publicNote:        string
  internalNote:      string
  durationMinutes:   string
  warrantyMonths:    string
  status:            string
  sortOrder:         number
  updatedAt:         string | null
  isDirty:           boolean
  isNew:             boolean
  showAdvanced:      boolean
}

function offerToRow(o: OfferForTarifs): RowState {
  return {
    id:             o.id,
    repairTypeId:   o.type_internal_key ? '' : '',  // will be set below
    repairTypeName: o.type_name,
    variantKey:     o.variant_key,
    variantName:    o.variant_name ?? '',
    subtitle:       o.subtitle ?? '',
    pricingMode:    o.pricing_mode,
    priceChf:       o.price_cents !== null ? centsToChf(o.price_cents) : '',
    availability:   o.availability,
    publicNote:     o.public_note ?? '',
    internalNote:   o.internal_note ?? '',
    durationMinutes: o.duration_minutes !== null ? String(o.duration_minutes) : '',
    warrantyMonths:  o.warranty_months  !== null ? String(o.warranty_months)  : '',
    status:         o.status,
    sortOrder:      o.sort_order,
    updatedAt:      o.updated_at ?? null,
    isDirty:        false,
    isNew:          false,
    showAdvanced:   false,
  }
}

function centsToChf(cents: number): string {
  const full = Math.trunc(cents / 100)
  const frac = cents % 100
  return frac === 0 ? String(full) : `${full}.${String(frac).padStart(2, '0')}`
}

// CSS shared classes
const inputSm = `
  h-8 px-2 rounded-btn
  bg-white/5 border border-white/10
  text-foreground text-xs font-rubik
  focus:outline-none focus:ring-1 focus:ring-accent/50
  disabled:opacity-40
  transition-colors duration-220
`
const selectSm = `${inputSm} cursor-pointer pr-6`
const labelSm  = 'block text-[10px] font-rubik text-foreground/35 mb-0.5'

/* ── Props ───────────────────────────────────────────────── */

interface Props {
  model:        ModelContext
  initialOffers: OfferForTarifs[]   // offers with repair_type_id embedded via type_internal_key hack
  missingTypes: MissingRepairType[]
  repairTypeIdMap: Record<string, string>  // internal_key → uuid
}

/* ── Composant principal ─────────────────────────────────── */

export function TarifsEditor({ model, initialOffers, missingTypes, repairTypeIdMap }: Props) {
  const router  = useRouter()
  const [isPending, startTransition] = useTransition()

  const [rows, setRows] = useState<RowState[]>(
    () => initialOffers.map(o => ({
      ...offerToRow(o),
      repairTypeId: repairTypeIdMap[o.type_internal_key] ?? '',
    }))
  )

  const [checkedMissing, setCheckedMissing] = useState<Set<string>>(new Set())
  const [newRows, setNewRows] = useState<RowState[]>([])
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState(false)

  const allRows = [...rows, ...newRows]
  const dirtyCount = allRows.filter(r => r.isDirty || r.isNew).length

  /* ── Helpers ───────────────────────────────────────────── */

  function updateRow(index: number, patch: Partial<RowState>) {
    setRows(prev => {
      if (index < prev.length) {
        const next = [...prev]
        next[index] = { ...next[index], ...patch, isDirty: true }
        return next
      }
      return prev
    })
  }

  function updateNewRow(index: number, patch: Partial<RowState>) {
    setNewRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], ...patch }
      return next
    })
  }

  function toggleMissing(typeId: string, typeName: string, typeInternalKey: string) {
    const next = new Set(checkedMissing)
    if (next.has(typeId)) {
      next.delete(typeId)
      setNewRows(prev => prev.filter(r => r.repairTypeId !== typeId))
    } else {
      next.add(typeId)
      setNewRows(prev => [...prev, {
        id:             null,
        repairTypeId:   typeId,
        repairTypeName: typeName,
        variantKey:     'standard',
        variantName:    '',
        subtitle:       '',
        pricingMode:    'on_request',
        priceChf:       '',
        availability:   'available',
        publicNote:     '',
        internalNote:   '',
        durationMinutes: '',
        warrantyMonths:  '',
        status:         'inactive',
        sortOrder:      rows.length + prev.length,
        updatedAt:      null,
        isDirty:        true,
        isNew:          true,
        showAdvanced:   false,
      }])
    }
    setCheckedMissing(next)
    void typeInternalKey
  }

  function discardChanges() {
    setRows(initialOffers.map(o => ({
      ...offerToRow(o),
      repairTypeId: repairTypeIdMap[o.type_internal_key] ?? '',
    })))
    setNewRows([])
    setCheckedMissing(new Set())
    setGlobalError(null)
    setSaveSuccess(false)
  }

  /* ── Sauvegarde ────────────────────────────────────────── */

  function handleSave() {
    const toSave = allRows.filter(r => r.isDirty || r.isNew)
    if (toSave.length === 0) return

    setGlobalError(null)
    setSaveSuccess(false)

    const payload: OfferPayload[] = toSave.map(r => ({
      offer_id:            r.id,
      repair_type_id:      r.repairTypeId,
      variant_key:         r.variantKey || 'standard',
      variant_name:        r.variantName || null,
      subtitle:            r.subtitle || null,
      pricing_mode:        r.pricingMode,
      price_chf:           r.pricingMode === 'fixed' ? r.priceChf : null,
      currency:            'CHF',
      availability:        r.availability,
      duration_minutes:    r.durationMinutes ? parseInt(r.durationMinutes) : null,
      warranty_months:     r.warrantyMonths  ? parseInt(r.warrantyMonths)  : null,
      public_note:         r.publicNote  || null,
      internal_note:       r.internalNote || null,
      status:              r.status,
      sort_order:          r.sortOrder,
      expected_updated_at: r.updatedAt,
    }))

    startTransition(async () => {
      const result = await bulkUpdateOffersAction(model.id, payload)
      if (result.success) {
        setSaveSuccess(true)
        router.refresh()
      } else {
        setGlobalError(result.message)
      }
    })
  }

  /* ── Archivage ─────────────────────────────────────────── */

  const [modelUpdatedAt] = useState(() => {
    // We approximate; server will validate
    return new Date().toISOString()
  })

  /* ── Rendu d'une ligne d'offre ─────────────────────────── */

  function OfferRow({
    row, index, isNewRow,
  }: { row: RowState; index: number; isNewRow?: boolean }) {
    const update = isNewRow
      ? (p: Partial<RowState>) => updateNewRow(index, p)
      : (p: Partial<RowState>) => updateRow(index, p)

    const isFixed = row.pricingMode === 'fixed'
    const isUnavail = row.availability === 'unavailable'

    return (
      <div className={`border-b border-white/6 ${row.isDirty && !isNewRow ? 'bg-accent/[0.03]' : ''} ${isNewRow ? 'bg-blue-400/[0.03]' : ''}`}>
        {/* Ligne principale */}
        <div className="grid grid-cols-[1fr_130px_110px_130px_100px_auto] gap-2 px-4 py-2.5 items-center">
          {/* Réparation */}
          <div className="min-w-0">
            <p className="text-sm font-rubik font-medium text-foreground truncate">{row.repairTypeName}</p>
            {row.isDirty && !isNewRow && (
              <span className="text-[10px] font-rubik text-accent/70">modifié</span>
            )}
            {isNewRow && (
              <span className="text-[10px] font-rubik text-blue-400/70">nouveau</span>
            )}
          </div>

          {/* Mode */}
          <select
            value={row.pricingMode}
            onChange={e => {
              const m = e.target.value
              update({ pricingMode: m, priceChf: m !== 'fixed' ? '' : row.priceChf })
            }}
            disabled={isPending}
            className={`${selectSm} w-full`}
            aria-label="Mode tarifaire"
          >
            <option value="fixed">Prix fixe</option>
            <option value="on_request">Sur demande</option>
            <option value="quote">Sur devis</option>
          </select>

          {/* Prix CHF */}
          <div className="relative">
            <input
              type="text"
              inputMode="decimal"
              value={row.priceChf}
              onChange={e => update({ priceChf: e.target.value })}
              disabled={isPending || !isFixed || isUnavail}
              placeholder={isFixed && !isUnavail ? '0' : '—'}
              className={`${inputSm} w-full pr-8 ${(!isFixed || isUnavail) ? 'opacity-30' : ''}`}
              aria-label="Prix CHF"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-rubik text-foreground/30 pointer-events-none">CHF</span>
          </div>

          {/* Disponibilité */}
          <select
            value={row.availability}
            onChange={e => update({ availability: e.target.value })}
            disabled={isPending}
            className={`${selectSm} w-full`}
            aria-label="Disponibilité"
          >
            <option value="available">Disponible</option>
            <option value="on_request">Sur demande</option>
            <option value="unavailable">Indisponible</option>
          </select>

          {/* Statut */}
          <select
            value={row.status}
            onChange={e => update({ status: e.target.value })}
            disabled={isPending}
            className={`${selectSm} w-full`}
            aria-label="Statut"
          >
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="archived">Archivé</option>
          </select>

          {/* Toggle options avancées */}
          <button
            type="button"
            onClick={() => update({ showAdvanced: !row.showAdvanced })}
            className="text-foreground/30 hover:text-foreground/60 transition-colors p-1 rounded"
            aria-expanded={row.showAdvanced}
            aria-label="Options avancées"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden
              className={`transition-transform duration-200 ${row.showAdvanced ? 'rotate-90' : ''}`}>
              <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Note publique obligatoire si unavailable */}
        {isUnavail && (
          <div className="px-4 pb-2">
            <label className={labelSm}>
              Note publique <span className="text-amber-400">* obligatoire</span>
            </label>
            <input type="text" value={row.publicNote}
              onChange={e => update({ publicNote: e.target.value })}
              disabled={isPending}
              className={`${inputSm} w-full`}
              placeholder="Raison de l'indisponibilité" />
          </div>
        )}

        {/* Options avancées */}
        {row.showAdvanced && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
            <div>
              <label className={labelSm}>Nom de variante</label>
              <input type="text" value={row.variantName} onChange={e => update({ variantName: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} placeholder="ex : Premium" />
            </div>
            <div>
              <label className={labelSm}>Sous-titre</label>
              <input type="text" value={row.subtitle} onChange={e => update({ subtitle: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} placeholder="ex : Changement d'écran" />
            </div>
            {!isUnavail && (
              <div>
                <label className={labelSm}>Note publique</label>
                <input type="text" value={row.publicNote} onChange={e => update({ publicNote: e.target.value })}
                  disabled={isPending} className={`${inputSm} w-full`} />
              </div>
            )}
            <div>
              <label className={labelSm}>Note interne</label>
              <input type="text" value={row.internalNote} onChange={e => update({ internalNote: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} />
            </div>
            <div>
              <label className={labelSm}>Durée (min)</label>
              <input type="number" min={1} value={row.durationMinutes}
                onChange={e => update({ durationMinutes: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} />
            </div>
            <div>
              <label className={labelSm}>Garantie (mois)</label>
              <input type="number" min={0} value={row.warrantyMonths}
                onChange={e => update({ warrantyMonths: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} />
            </div>
            <div>
              <label className={labelSm}>Clé variante</label>
              <input type="text" value={row.variantKey}
                onChange={e => update({ variantKey: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} />
            </div>
            <div>
              <label className={labelSm}>Ordre</label>
              <input type="number" min={0} value={row.sortOrder}
                onChange={e => update({ sortOrder: parseInt(e.target.value) || 0 })}
                disabled={isPending} className={`${inputSm} w-full`} />
            </div>
          </div>
        )}
      </div>
    )
  }

  /* ── Rendu principal ───────────────────────────────────── */

  return (
    <div className="space-y-8 pb-32">

      {/* Avertissement site public */}
      <div className="flex items-start gap-3 p-4 rounded-card bg-amber-400/5 border border-amber-400/15">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5" aria-hidden>
          <path d="M8 1L15 14H1L8 1z" stroke="#fbbf24" strokeWidth="1.2" strokeLinejoin="round" />
          <path d="M8 6v4M8 12h.01" stroke="#fbbf24" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <p className="text-xs font-rubik text-foreground/45">
          Les modifications sont enregistrées dans Supabase. Elles ne seront visibles sur le site public qu&apos;après l&apos;activation de la synchronisation Supabase.
        </p>
      </div>

      {/* Erreur globale */}
      {globalError && (
        <div className="p-4 rounded-card bg-red-400/8 border border-red-400/20">
          <p className="text-sm font-rubik text-red-400">{globalError}</p>
        </div>
      )}

      {/* Succès */}
      {saveSuccess && (
        <div className="p-4 rounded-card bg-green-500/8 border border-green-500/20">
          <p className="text-sm font-rubik text-green-400">Modifications enregistrées avec succès.</p>
        </div>
      )}

      {/* ── Réparations existantes ──────────────────────── */}
      <section>
        <h2 className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3">
          Réparations existantes ({rows.length})
        </h2>

        {rows.length === 0 ? (
          <p className="text-sm font-rubik text-foreground/30 py-6 text-center">
            Aucune réparation enregistrée pour ce modèle.
          </p>
        ) : (
          <div className="rounded-card border border-white/8 overflow-hidden">
            {/* En-tête tableau */}
            <div className="grid grid-cols-[1fr_130px_110px_130px_100px_auto] gap-2 px-4 py-2 border-b border-white/8 bg-white/[0.02]">
              {['Réparation', 'Mode', 'Prix CHF', 'Disponibilité', 'Statut', ''].map(h => (
                <span key={h} className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {rows.map((row, i) => (
              <OfferRow key={row.id ?? `row-${i}`} row={row} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* ── Nouvelles réparations à ajouter ─────────────── */}
      {newRows.length > 0 && (
        <section>
          <h2 className="text-xs font-rubik font-semibold text-blue-400/60 uppercase tracking-wider mb-3">
            Nouvelles réparations à ajouter ({newRows.length})
          </h2>
          <div className="rounded-card border border-blue-400/15 overflow-hidden">
            <div className="grid grid-cols-[1fr_130px_110px_130px_100px_auto] gap-2 px-4 py-2 border-b border-white/8 bg-white/[0.02]">
              {['Réparation', 'Mode', 'Prix CHF', 'Disponibilité', 'Statut', ''].map(h => (
                <span key={h} className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {newRows.map((row, i) => (
              <OfferRow key={`new-${row.repairTypeId}`} row={row} index={i} isNewRow />
            ))}
          </div>
        </section>
      )}

      {/* ── Réparations manquantes ───────────────────────── */}
      {missingTypes.length > 0 && (
        <section>
          <h2 className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3">
            Ajouter d&apos;autres réparations
          </h2>
          <div className="rounded-card border border-white/8 p-4">
            <div className="flex flex-wrap gap-2">
              {missingTypes.map(t => {
                const isChecked = checkedMissing.has(t.id)
                return (
                  <label
                    key={t.id}
                    className={[
                      'flex items-center gap-2 px-3 py-1.5 rounded-btn border cursor-pointer',
                      'text-sm font-rubik transition-colors duration-220',
                      isChecked
                        ? 'border-accent/50 bg-accent/8 text-foreground'
                        : 'border-white/10 bg-white/4 text-foreground/60 hover:border-white/20',
                    ].join(' ')}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMissing(t.id, t.name, t.internal_key)}
                      className="sr-only"
                    />
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0" aria-hidden>
                      {isChecked
                        ? <path d="M2 6l3 3 5-5" stroke="#ccff33" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        : <rect x="1" y="1" width="10" height="10" rx="2" stroke="currentColor" strokeWidth="1.2" />
                      }
                    </svg>
                    {t.name}
                  </label>
                )
              })}
            </div>
            {checkedMissing.size > 0 && (
              <p className="text-xs font-rubik text-foreground/35 mt-3">
                {checkedMissing.size} type{checkedMissing.size > 1 ? 's' : ''} sélectionné{checkedMissing.size > 1 ? 's' : ''} — renseignez les tarifs dans le tableau ci-dessus puis enregistrez.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Archivage ─────────────────────────────────────── */}
      {!archiveConfirm ? (
        <div className="pt-4 border-t border-white/8">
          <button
            type="button"
            onClick={() => setArchiveConfirm(true)}
            className="text-sm font-rubik text-red-400/50 hover:text-red-400 transition-colors"
          >
            Archiver ce modèle et toutes ses réparations
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-card bg-red-400/8 border border-red-400/20 space-y-3">
          <p className="text-sm font-rubik text-foreground/70">
            <strong className="text-red-400">Confirmer l&apos;archivage</strong>
            {' '}— Le modèle et ses réparations seront masqués dans l&apos;administration active. Les données et l&apos;historique seront conservés.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setArchiveConfirm(false)}
              className="px-4 py-1.5 rounded-btn text-sm font-rubik text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button
              onClick={async () => {
                startTransition(async () => {
                  const r = await archiveModelAction(model.id, modelUpdatedAt)
                  if (r.success) {
                    window.location.href = '/admin/modeles'
                  } else {
                    setGlobalError(r.message)
                    setArchiveConfirm(false)
                  }
                })
              }}
              disabled={isPending}
              className="px-4 py-1.5 rounded-btn text-sm font-rubik bg-red-500 text-white hover:bg-red-500/90 disabled:opacity-50 transition-colors">
              {isPending ? 'Archivage…' : 'Confirmer l\'archivage'}
            </button>
          </div>
        </div>
      )}

      {/* ── Bandeau modifications non enregistrées (sticky) ── */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 border-t border-white/12 bg-[#191919]/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-sm font-rubik text-foreground/60">
              <span className="text-accent font-medium">{dirtyCount}</span>{' '}
              modification{dirtyCount > 1 ? 's' : ''} non enregistrée{dirtyCount > 1 ? 's' : ''}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={discardChanges}
                disabled={isPending}
                className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/45 hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-40"
              >
                Annuler les changements
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="
                  h-9 px-5 rounded-btn
                  bg-accent text-primary-foreground
                  font-rubik font-semibold text-sm
                  hover:bg-accent/90
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors duration-220
                "
              >
                {isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
