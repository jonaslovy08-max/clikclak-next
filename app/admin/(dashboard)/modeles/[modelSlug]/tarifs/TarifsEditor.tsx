'use client'
/*
  TarifsEditor.tsx

  Éditeur groupé des tarifs d'un modèle.

  CORRECTION BUG FOCUS :
  - ModelOfferRow est déclaré AU NIVEAU DU MODULE, jamais à l'intérieur
    du composant TarifsEditor. Si déclaré à l'intérieur, React crée une
    nouvelle référence à chaque render → démontage/remontage → perte de focus.
  - Chaque ligne possède un rowKey stable (UUID DB ou UUID client généré
    UNE SEULE FOIS dans l'événement d'ajout, jamais pendant le rendu).
  - Le prix est stocké comme chaîne (priceChf: string) pendant la saisie ;
    la conversion en centimes se fait uniquement avant l'appel à la Server Action.
*/

import { useState, useTransition } from 'react'
import { useRouter }                from 'next/navigation'
import type { OfferForTarifs, MissingRepairType, ModelContext } from '@/lib/admin/queries'
import {
  bulkUpdateOffersAction,
  archiveModelAction,
  type OfferPayload,
} from './actions'

/* ── Types ───────────────────────────────────────────────── */

export interface RowState {
  rowKey:         string   // identifiant stable côté client (JAMAIS changé)
  id:             string | null
  repairTypeId:   string
  repairTypeName: string
  variantKey:     string
  variantName:    string
  subtitle:       string
  pricingMode:    string
  priceChf:       string   // chaîne brute — pas de conversion pendant la saisie
  availability:   string
  publicNote:     string
  internalNote:   string
  durationMinutes: string
  warrantyMonths:  string
  status:         string
  sortOrder:      number
  updatedAt:      string | null
  isDirty:        boolean
  isNew:          boolean
  showAdvanced:   boolean
}

function centsToChf(cents: number): string {
  const full = Math.trunc(cents / 100)
  const frac = cents % 100
  return frac === 0 ? String(full) : `${full}.${String(frac).padStart(2, '0')}`
}

function offerToRow(o: OfferForTarifs): RowState {
  return {
    rowKey:         o.id,   // UUID de la DB — stable pour toujours
    id:             o.id,
    repairTypeId:   o.type_internal_key ? '' : '',
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

/* ── Styles partagés ─────────────────────────────────────── */

const inputSm = `
  h-8 px-2 rounded-btn
  bg-white/5 border border-white/10
  text-foreground text-xs font-rubik
  focus:outline-none focus:ring-1 focus:ring-accent/50
  disabled:opacity-40
  transition-colors duration-220
`
const selectSm = `${inputSm} cursor-pointer`
const labelSm  = 'block text-[10px] font-rubik text-foreground/35 mb-0.5'

/* ── ModelOfferRow — DÉCLARÉ AU NIVEAU DU MODULE ─────────── */
/*
  CRITIQUE : ce composant doit rester HORS de TarifsEditor.
  S'il était déclaré dedans, chaque render de TarifsEditor créerait
  une nouvelle référence → React démonterait et remonterait ce
  composant → focus perdu après chaque frappe.
*/

interface ModelOfferRowProps {
  row:       RowState
  onUpdate:  (patch: Partial<RowState>) => void
  isPending: boolean
}

function ModelOfferRow({ row, onUpdate, isPending }: ModelOfferRowProps) {
  const isFixed   = row.pricingMode === 'fixed'
  const isUnavail = row.availability === 'unavailable'

  return (
    <div className={`border-b border-white/6 ${row.isDirty && !row.isNew ? 'bg-accent/[0.03]' : ''} ${row.isNew ? 'bg-blue-400/[0.03]' : ''}`}>
      {/* Ligne principale */}
      <div className="grid grid-cols-[1fr_130px_110px_130px_100px_auto] gap-2 px-4 py-2.5 items-center">
        {/* Réparation */}
        <div className="min-w-0">
          <p className="text-sm font-rubik font-medium text-foreground truncate">{row.repairTypeName}</p>
          {row.isDirty && !row.isNew && (
            <span className="text-[10px] font-rubik text-accent/70">modifié</span>
          )}
          {row.isNew && (
            <span className="text-[10px] font-rubik text-blue-400/70">nouveau</span>
          )}
        </div>

        {/* Mode tarifaire */}
        <select
          value={row.pricingMode}
          onChange={e => {
            const m = e.target.value
            onUpdate({ pricingMode: m, priceChf: m !== 'fixed' ? '' : row.priceChf })
          }}
          disabled={isPending}
          className={`${selectSm} w-full`}
          aria-label={`Mode tarifaire — ${row.repairTypeName}`}
        >
          <option value="fixed">Prix fixe</option>
          <option value="on_request">Sur demande</option>
          <option value="quote">Sur devis</option>
        </select>

        {/* Prix CHF — stocké comme chaîne pendant la saisie */}
        <div className="relative">
          <input
            type="text"
            inputMode="decimal"
            value={row.priceChf}
            onChange={e => onUpdate({ priceChf: e.target.value })}
            disabled={isPending || !isFixed || isUnavail}
            placeholder={isFixed && !isUnavail ? '0' : '—'}
            className={`${inputSm} w-full pr-8 ${(!isFixed || isUnavail) ? 'opacity-30' : ''}`}
            aria-label={`Prix CHF — ${row.repairTypeName}`}
          />
          <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-rubik text-foreground/30 pointer-events-none">CHF</span>
        </div>

        {/* Disponibilité */}
        <select
          value={row.availability}
          onChange={e => onUpdate({ availability: e.target.value })}
          disabled={isPending}
          className={`${selectSm} w-full`}
          aria-label={`Disponibilité — ${row.repairTypeName}`}
        >
          <option value="available">Disponible</option>
          <option value="on_request">Sur demande</option>
          <option value="unavailable">Indisponible</option>
        </select>

        {/* Statut */}
        <select
          value={row.status}
          onChange={e => onUpdate({ status: e.target.value })}
          disabled={isPending}
          className={`${selectSm} w-full`}
          aria-label={`Statut — ${row.repairTypeName}`}
        >
          <option value="active">Actif</option>
          <option value="inactive">Brouillon</option>
          <option value="archived">Archivé</option>
        </select>

        {/* Toggle options avancées */}
        <button
          type="button"
          onClick={() => onUpdate({ showAdvanced: !row.showAdvanced })}
          className="text-foreground/30 hover:text-foreground/60 transition-colors p-1 rounded"
          aria-expanded={row.showAdvanced}
          aria-label={`Options avancées — ${row.repairTypeName}`}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden
            className={`transition-transform duration-200 ${row.showAdvanced ? 'rotate-90' : ''}`}>
            <path d="M5 3l6 5-6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Note publique si unavailable */}
      {isUnavail && (
        <div className="px-4 pb-2">
          <label className={labelSm}>
            Note publique <span className="text-amber-400">* obligatoire</span>
          </label>
          <input
            type="text"
            value={row.publicNote}
            onChange={e => onUpdate({ publicNote: e.target.value })}
            disabled={isPending}
            className={`${inputSm} w-full`}
            placeholder="Raison de l'indisponibilité"
            aria-label="Note publique"
          />
        </div>
      )}

      {/* Options avancées */}
      {row.showAdvanced && (
        <div className="px-4 pb-3 grid grid-cols-2 gap-3 border-t border-white/5 pt-3">
          <div>
            <label className={labelSm}>Nom de variante</label>
            <input type="text" value={row.variantName}
              onChange={e => onUpdate({ variantName: e.target.value })}
              disabled={isPending} className={`${inputSm} w-full`} placeholder="ex : Premium" />
          </div>
          <div>
            <label className={labelSm}>Sous-titre</label>
            <input type="text" value={row.subtitle}
              onChange={e => onUpdate({ subtitle: e.target.value })}
              disabled={isPending} className={`${inputSm} w-full`} />
          </div>
          {!isUnavail && (
            <div>
              <label className={labelSm}>Note publique</label>
              <input type="text" value={row.publicNote}
                onChange={e => onUpdate({ publicNote: e.target.value })}
                disabled={isPending} className={`${inputSm} w-full`} />
            </div>
          )}
          <div>
            <label className={labelSm}>Note interne</label>
            <input type="text" value={row.internalNote}
              onChange={e => onUpdate({ internalNote: e.target.value })}
              disabled={isPending} className={`${inputSm} w-full`} />
          </div>
          <div>
            <label className={labelSm}>Durée (min)</label>
            <input type="number" min={1} value={row.durationMinutes}
              onChange={e => onUpdate({ durationMinutes: e.target.value })}
              disabled={isPending} className={`${inputSm} w-full`} />
          </div>
          <div>
            <label className={labelSm}>Garantie (mois)</label>
            <input type="number" min={0} value={row.warrantyMonths}
              onChange={e => onUpdate({ warrantyMonths: e.target.value })}
              disabled={isPending} className={`${inputSm} w-full`} />
          </div>
          <div>
            <label className={labelSm}>Clé variante</label>
            <input type="text" value={row.variantKey}
              onChange={e => onUpdate({ variantKey: e.target.value })}
              disabled={isPending} className={`${inputSm} w-full`} />
          </div>
          <div>
            <label className={labelSm}>Ordre</label>
            <input type="number" min={0} value={row.sortOrder}
              onChange={e => onUpdate({ sortOrder: parseInt(e.target.value) || 0 })}
              disabled={isPending} className={`${inputSm} w-full`} />
          </div>
        </div>
      )}
    </div>
  )
}

/* ── TarifsEditor ────────────────────────────────────────── */

interface Props {
  model:           ModelContext
  initialOffers:   OfferForTarifs[]
  missingTypes:    MissingRepairType[]
  repairTypeIdMap: Record<string, string>
}

export function TarifsEditor({ model, initialOffers, missingTypes, repairTypeIdMap }: Props) {
  const router  = useRouter()
  const [isPending, startTransition] = useTransition()

  /* Lignes des offres existantes — rowKey = id DB (stable) */
  const [rows, setRows] = useState<RowState[]>(
    () => initialOffers.map(o => ({
      ...offerToRow(o),
      repairTypeId: repairTypeIdMap[o.type_internal_key] ?? '',
    }))
  )

  /* Nouvelles lignes ajoutées — rowKey = crypto.randomUUID() créé une seule fois */
  const [newRows, setNewRows]       = useState<RowState[]>([])
  const [checkedMissing, setCheckedMissing] = useState<Set<string>>(new Set())
  const [globalError, setGlobalError]       = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess]       = useState(false)
  const [archiveConfirm, setArchiveConfirm] = useState(false)

  const allRows    = [...rows, ...newRows]
  const dirtyCount = allRows.filter(r => r.isDirty || r.isNew).length

  /* ── Mise à jour d'une ligne par rowKey (pas par index) ── */

  function updateExistingRow(rowKey: string, patch: Partial<RowState>) {
    setRows(prev => prev.map(r =>
      r.rowKey === rowKey ? { ...r, ...patch, isDirty: true } : r
    ))
  }

  function updateNewRow(rowKey: string, patch: Partial<RowState>) {
    setNewRows(prev => prev.map(r =>
      r.rowKey === rowKey ? { ...r, ...patch } : r
    ))
  }

  /* ── Ajout/suppression d'un type manquant ─────────────── */

  function toggleMissing(typeId: string, typeName: string) {
    const next = new Set(checkedMissing)
    if (next.has(typeId)) {
      next.delete(typeId)
      setNewRows(prev => prev.filter(r => r.repairTypeId !== typeId))
    } else {
      next.add(typeId)
      /* rowKey généré UNE SEULE FOIS ici, jamais pendant le rendu */
      setNewRows(prev => [...prev, {
        rowKey:         crypto.randomUUID(),
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
        sortOrder:      rows.length + newRows.length,
        updatedAt:      null,
        isDirty:        true,
        isNew:          true,
        showAdvanced:   false,
      }])
    }
    setCheckedMissing(next)
  }

  /* ── Annuler tous les changements ────────────────────────── */

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

  /* ── Sauvegarde groupée ─────────────────────────────────── */

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

  const modelUpdatedAtApprox = new Date().toISOString()

  /* ── En-tête du tableau ──────────────────────────────────── */

  const TABLE_HEADERS = ['Réparation', 'Mode', 'Prix CHF', 'Disponibilité', 'Statut', '']
  const TABLE_GRID    = 'grid-cols-[1fr_130px_110px_130px_100px_auto]'

  return (
    <div className="space-y-8 pb-32">

      {globalError && (
        <div className="p-4 rounded-card bg-red-400/8 border border-red-400/20">
          <p className="text-sm font-rubik text-red-400">{globalError}</p>
        </div>
      )}
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
            <div className={`grid ${TABLE_GRID} gap-2 px-4 py-2 border-b border-white/8 bg-white/[0.02]`}>
              {TABLE_HEADERS.map(h => (
                <span key={h} className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {rows.map(row => (
              <ModelOfferRow
                key={row.rowKey}
                row={row}
                onUpdate={patch => updateExistingRow(row.rowKey, patch)}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </section>

      {/* ── Nouvelles réparations ───────────────────────── */}
      {newRows.length > 0 && (
        <section>
          <h2 className="text-xs font-rubik font-semibold text-blue-400/60 uppercase tracking-wider mb-3">
            Nouvelles réparations à ajouter ({newRows.length})
          </h2>
          <div className="rounded-card border border-blue-400/15 overflow-hidden">
            <div className={`grid ${TABLE_GRID} gap-2 px-4 py-2 border-b border-white/8 bg-white/[0.02]`}>
              {TABLE_HEADERS.map(h => (
                <span key={h} className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {newRows.map(row => (
              <ModelOfferRow
                key={row.rowKey}
                row={row}
                onUpdate={patch => updateNewRow(row.rowKey, patch)}
                isPending={isPending}
              />
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
                  <label key={t.id}
                    className={[
                      'flex items-center gap-2 px-3 py-1.5 rounded-btn border cursor-pointer',
                      'text-sm font-rubik transition-colors duration-220',
                      isChecked
                        ? 'border-accent/50 bg-accent/8 text-foreground'
                        : 'border-white/10 bg-white/4 text-foreground/60 hover:border-white/20',
                    ].join(' ')}
                  >
                    <input type="checkbox" checked={isChecked}
                      onChange={() => toggleMissing(t.id, t.name)}
                      className="sr-only" />
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
                {checkedMissing.size} type{checkedMissing.size > 1 ? 's' : ''} sélectionné{checkedMissing.size > 1 ? 's' : ''} — renseignez les tarifs ci-dessus.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Archivage ─────────────────────────────────────── */}
      {!archiveConfirm ? (
        <div className="pt-4 border-t border-white/8">
          <button type="button" onClick={() => setArchiveConfirm(true)}
            className="text-sm font-rubik text-red-400/50 hover:text-red-400 transition-colors">
            Archiver ce modèle et toutes ses réparations
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-card bg-red-400/8 border border-red-400/20 space-y-3">
          <p className="text-sm font-rubik text-foreground/70">
            <strong className="text-red-400">Confirmer l&apos;archivage</strong>
            {' '}— Le modèle et ses réparations seront masqués. Les données et l&apos;historique seront conservés.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setArchiveConfirm(false)}
              className="px-4 py-1.5 rounded-btn text-sm font-rubik text-foreground/50 hover:text-foreground hover:bg-white/5 transition-colors">
              Annuler
            </button>
            <button
              onClick={() => {
                startTransition(async () => {
                  const r = await archiveModelAction(model.id, modelUpdatedAtApprox)
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
              {isPending ? 'Archivage…' : 'Confirmer'}
            </button>
          </div>
        </div>
      )}

      {/* ── Bandeau modifications (sticky) ─────────────────── */}
      {dirtyCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 lg:left-60 z-30 border-t border-white/12 bg-[#191919]/95 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <p className="text-sm font-rubik text-foreground/60">
              <span className="text-accent font-medium">{dirtyCount}</span>{' '}
              modification{dirtyCount > 1 ? 's' : ''} non enregistrée{dirtyCount > 1 ? 's' : ''}
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={discardChanges} disabled={isPending}
                className="px-4 py-2 rounded-btn text-sm font-rubik text-foreground/45 hover:text-foreground hover:bg-white/5 transition-colors disabled:opacity-40">
                Annuler les changements
              </button>
              <button type="button" onClick={handleSave} disabled={isPending}
                className="h-9 px-5 rounded-btn bg-accent text-primary-foreground font-rubik font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-220">
                {isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
