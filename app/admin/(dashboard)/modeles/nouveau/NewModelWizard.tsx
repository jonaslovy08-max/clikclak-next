'use client'
/*
  NewModelWizard.tsx

  Wizard en 3 étapes pour créer un nouveau modèle avec ses réparations.
  Étape 1 : Informations du modèle
  Étape 2 : Sélection des réparations et tarifs
  Étape 3 : Vérification et création
*/

import { useState, useMemo, useTransition } from 'react'
import type { FamilyWithId, CategoryOption, TypeSelectOption, SelectorModel } from '@/lib/admin/queries'
import { getModelOffersForCopyAction, createDeviceModelAction } from './actions'

/* ── Types ───────────────────────────────────────────────── */

interface BrandOpt { internal_key: string; name: string }

interface OfferRow {
  repairTypeId:   string
  repairTypeName: string
  selected:       boolean
  pricingMode:    string
  priceChf:       string
  availability:   string
  status:         string
  sortOrder:      number
}

interface Step1Data {
  brandKey:    string
  familyId:    string
  categoryId:  string
  name:        string
  internalKey: string
  slug:        string
  status:      string
  sortOrder:   number
}

/* ── Helpers ─────────────────────────────────────────────── */

function slugify(str: string): string {
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const BRAND_CATEGORY: Record<string, string> = {
  iphone: 'smartphone', samsung: 'smartphone', ipad: 'tablette',
  macbook: 'ordinateur', huawei: 'smartphone', oppo: 'smartphone', sony: 'smartphone',
}

const inputClass = `
  w-full h-9 px-3 rounded-btn
  bg-white/5 border border-white/12
  text-foreground text-sm font-rubik
  placeholder:text-foreground/25
  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
  disabled:opacity-50 transition-colors duration-220
`
const labelClass = 'block text-xs font-rubik font-medium text-foreground/50 mb-1'
const inputSm = `
  h-8 px-2 rounded-btn
  bg-white/5 border border-white/10
  text-foreground text-xs font-rubik
  focus:outline-none focus:ring-1 focus:ring-accent/50
  disabled:opacity-40 transition-colors
`

/* ── Props ───────────────────────────────────────────────── */

interface Props {
  brands:     BrandOpt[]
  families:   FamilyWithId[]
  categories: CategoryOption[]
  types:      TypeSelectOption[]
  allModels:  SelectorModel[]
}

/* ── Wizard ──────────────────────────────────────────────── */

export function NewModelWizard({ brands, families, categories, types, allModels }: Props) {
  const [step, setStep]       = useState<1 | 2 | 3>(1)
  const [error, setError]     = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition]  = useTransition()

  /* ── Étape 1 : données du modèle ─────────────────────── */
  const [s1, setS1] = useState<Step1Data>({
    brandKey: '', familyId: '', categoryId: '', name: '',
    internalKey: '', slug: '', status: 'inactive', sortOrder: 0,
  })

  const brandFamilies = useMemo(
    () => families.filter(f => f.brand_key === s1.brandKey),
    [families, s1.brandKey],
  )

  function onBrand(brandKey: string) {
    const catKey  = BRAND_CATEGORY[brandKey] ?? 'smartphone'
    const catId   = categories.find(c => c.internal_key === catKey)?.id ?? ''
    setS1(p => ({ ...p, brandKey, familyId: '', categoryId: catId }))
  }

  function onName(name: string) {
    const s = slugify(name)
    const k = s1.brandKey ? `${s1.brandKey}:${s}` : s
    setS1(p => ({ ...p, name, slug: s, internalKey: k }))
  }

  function validateStep1(): boolean {
    const errs: Record<string, string[]> = {}
    if (!s1.familyId)    errs.familyId    = ['Famille obligatoire.']
    if (!s1.categoryId)  errs.categoryId  = ['Catégorie obligatoire.']
    if (!s1.name.trim()) errs.name        = ['Nom obligatoire.']
    if (!s1.slug)        errs.slug        = ['Slug obligatoire.']
    if (!s1.internalKey) errs.internalKey = ['Clé interne obligatoire.']
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Étape 2 : réparations ───────────────────────────── */
  const [offers, setOffers] = useState<OfferRow[]>(
    () => types.map((t, i) => ({
      repairTypeId:   t.id,
      repairTypeName: t.name,
      selected:       false,
      pricingMode:    'on_request',
      priceChf:       '',
      availability:   'available',
      status:         'inactive',
      sortOrder:      i,
    }))
  )

  const [copyModelSlug, setCopyModelSlug] = useState('')
  const [copyPrices,    setCopyPrices]    = useState(false)
  const [copyLoading,   setCopyLoading]   = useState(false)

  const selectedCount = offers.filter(o => o.selected).length

  function updateOffer(idx: number, patch: Partial<OfferRow>) {
    setOffers(prev => {
      const next = [...prev]
      next[idx]  = { ...next[idx], ...patch }
      return next
    })
  }

  function selectAll()   { setOffers(prev => prev.map(o => ({ ...o, selected: true }))) }
  function deselectAll() { setOffers(prev => prev.map(o => ({ ...o, selected: false }))) }

  async function handleCopy() {
    if (!copyModelSlug) return
    setCopyLoading(true)
    try {
      const existingOffers = await getModelOffersForCopyAction(copyModelSlug)
      if (!existingOffers) return

      setOffers(prev => prev.map(o => {
        const match = existingOffers.find(e => e.type_internal_key === o.repairTypeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
          existingOffers.find(e2 => e2.type_name === o.repairTypeName))
        const found = existingOffers.find(e => e.type_name === o.repairTypeName)
        if (!found) return o
        return {
          ...o,
          selected:     true,
          pricingMode:  copyPrices ? found.pricing_mode : 'on_request',
          priceChf:     copyPrices && found.price_cents !== null
            ? String(Math.trunc(found.price_cents / 100)) + (found.price_cents % 100 ? `.${String(found.price_cents % 100).padStart(2, '0')}` : '')
            : '',
          availability: found.availability,
          status:       'inactive',
        }
        void match
      }))
    } finally {
      setCopyLoading(false)
    }
  }

  /* ── Soumission finale ───────────────────────────────── */
  function handleSubmit() {
    setError(null)
    const selectedOffers = offers.filter(o => o.selected).map((o, i) => ({
      repair_type_id: o.repairTypeId,
      variant_key:    'standard',
      pricing_mode:   o.pricingMode,
      price_chf:      o.pricingMode === 'fixed' ? o.priceChf : null,
      availability:   o.availability,
      status:         o.status,
      sort_order:     i,
    }))

    startTransition(async () => {
      try {
        await createDeviceModelAction(
          {
            family_id:    s1.familyId,
            category_id:  s1.categoryId,
            internal_key: s1.internalKey,
            name:         s1.name,
            slug:         s1.slug,
            status:       s1.status,
            sort_order:   s1.sortOrder,
          },
          selectedOffers,
        )
      } catch (e) {
        if (e instanceof Error && e.message !== 'NEXT_REDIRECT') {
          setError(e.message)
        }
      }
    })
  }

  /* ── Rendu ───────────────────────────────────────────── */

  const stepLabels = ['Modèle', 'Réparations', 'Vérification']

  return (
    <div className="max-w-3xl space-y-8">

      {/* Barre de progression */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, idx) => {
          const n = idx + 1
          const active  = step === n
          const done    = step > n
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={[
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-rubik font-bold transition-colors',
                  active ? 'bg-accent text-primary-foreground' :
                  done   ? 'bg-accent/30 text-accent' :
                           'bg-white/8 text-foreground/30',
                ].join(' ')}>
                  {done ? '✓' : n}
                </div>
                <span className={`text-sm font-rubik ${active ? 'text-foreground font-medium' : 'text-foreground/35'}`}>
                  {label}
                </span>
              </div>
              {idx < stepLabels.length - 1 && (
                <div className="flex-1 h-px bg-white/8 mx-3" />
              )}
            </div>
          )
        })}
      </div>

      {error && (
        <div className="p-4 rounded-card bg-red-400/8 border border-red-400/20">
          <p className="text-sm font-rubik text-red-400">{error}</p>
        </div>
      )}

      {/* ── Étape 1 ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-lg font-rubik font-bold text-foreground">Informations du modèle</h2>

          <div className="p-4 rounded-card bg-amber-400/5 border border-amber-400/15">
            <p className="text-xs font-rubik text-foreground/45">
              Le modèle sera créé dans Supabase avec le statut <strong>inactif</strong>. Il ne sera visible sur le site public qu&apos;après activation de la synchronisation Supabase.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marque</label>
              <select value={s1.brandKey} onChange={e => onBrand(e.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="">— Choisir —</option>
                {brands.map(b => <option key={b.internal_key} value={b.internal_key}>{b.name}</option>)}
              </select>
              {fieldErrors.brandKey && <p className="mt-1 text-xs text-red-400">{fieldErrors.brandKey[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Famille</label>
              <select value={s1.familyId} onChange={e => setS1(p => ({ ...p, familyId: e.target.value }))}
                disabled={!s1.brandKey} className={`${inputClass} cursor-pointer`}>
                <option value="">— Choisir —</option>
                {brandFamilies.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              {fieldErrors.familyId && <p className="mt-1 text-xs text-red-400">{fieldErrors.familyId[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Catégorie</label>
              <select value={s1.categoryId} onChange={e => setS1(p => ({ ...p, categoryId: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                <option value="">— Choisir —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {fieldErrors.categoryId && <p className="mt-1 text-xs text-red-400">{fieldErrors.categoryId[0]}</p>}
            </div>

            <div>
              <label className={labelClass}>Statut initial</label>
              <select value={s1.status} onChange={e => setS1(p => ({ ...p, status: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                <option value="inactive">Inactif (recommandé)</option>
                <option value="active">Actif</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Nom public <span className="text-foreground/30">(ex : iPhone 17e)</span></label>
            <input type="text" value={s1.name} onChange={e => onName(e.target.value)}
              className={inputClass} placeholder="ex : iPhone 17e" />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-400">{fieldErrors.name[0]}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <input type="text" value={s1.slug}
                onChange={e => setS1(p => ({
                  ...p, slug: e.target.value,
                  internalKey: s1.brandKey ? `${s1.brandKey}:${e.target.value}` : e.target.value,
                }))}
                className={inputClass} placeholder="ex : iphone-17e" />
              {s1.slug && (
                <p className="mt-1 text-[10px] font-rubik text-foreground/30">
                  clikclak.ch/services/reparation-{s1.brandKey}/{s1.slug}
                </p>
              )}
              {fieldErrors.slug && <p className="mt-1 text-xs text-red-400">{fieldErrors.slug[0]}</p>}
            </div>
            <div>
              <label className={labelClass}>Clé interne</label>
              <input type="text" value={s1.internalKey}
                onChange={e => setS1(p => ({ ...p, internalKey: e.target.value }))}
                className={inputClass} placeholder="ex : iphone:iphone-17e" />
              {fieldErrors.internalKey && <p className="mt-1 text-xs text-red-400">{fieldErrors.internalKey[0]}</p>}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => { if (validateStep1()) setStep(2) }}
              className="h-9 px-5 rounded-btn bg-accent text-primary-foreground font-rubik font-semibold text-sm hover:bg-accent/90 transition-colors"
            >
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 2 ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-lg font-rubik font-bold text-foreground">Réparations et tarifs</h2>

          {/* Copier depuis un modèle */}
          <div className="p-4 rounded-card bg-white/[0.03] border border-white/8 space-y-3">
            <p className="text-sm font-rubik font-medium text-foreground/60">Copier les réparations depuis un modèle existant</p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <select value={copyModelSlug} onChange={e => setCopyModelSlug(e.target.value)}
                  className={`${inputClass} cursor-pointer`}>
                  <option value="">— Choisir un modèle source —</option>
                  {allModels.map(m => (
                    <option key={m.slug} value={m.slug}>{m.name} ({m.brand_key})</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!copyModelSlug || copyLoading}
                className="h-9 px-4 rounded-btn border border-white/15 text-sm font-rubik text-foreground/60 hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors"
              >
                {copyLoading ? 'Chargement…' : 'Copier'}
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs font-rubik text-foreground/45 cursor-pointer">
              <input type="checkbox" checked={copyPrices} onChange={e => setCopyPrices(e.target.checked)}
                className="w-3.5 h-3.5 rounded" />
              Copier également les prix
              <span className="text-foreground/25">(désactivé par défaut)</span>
            </label>
          </div>

          {/* Contrôles globaux */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-rubik text-foreground/50">
              {selectedCount} réparation{selectedCount !== 1 ? 's' : ''} sélectionnée{selectedCount !== 1 ? 's' : ''}
            </span>
            <button type="button" onClick={selectAll} className="text-xs font-rubik text-accent hover:underline">Tout sélectionner</button>
            <button type="button" onClick={deselectAll} className="text-xs font-rubik text-foreground/40 hover:text-foreground/60 hover:underline">Tout désélectionner</button>
          </div>

          {/* Tableau des réparations */}
          <div className="rounded-card border border-white/8 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_110px_90px_110px_90px] gap-2 px-4 py-2 border-b border-white/8 bg-white/[0.02]">
              {['☐', 'Réparation', 'Mode', 'Prix CHF', 'Disponibilité', 'Statut'].map(h => (
                <span key={h} className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {offers.map((o, i) => (
              <div key={o.repairTypeId}
                className={`grid grid-cols-[auto_1fr_110px_90px_110px_90px] gap-2 px-4 py-2 items-center border-b border-white/5 last:border-0 ${o.selected ? 'bg-white/[0.02]' : 'opacity-50'}`}>
                <input type="checkbox" checked={o.selected} onChange={e => updateOffer(i, { selected: e.target.checked })}
                  className="w-3.5 h-3.5 rounded cursor-pointer" />
                <span className="text-sm font-rubik text-foreground truncate">{o.repairTypeName}</span>
                <select value={o.pricingMode} onChange={e => updateOffer(i, { pricingMode: e.target.value, priceChf: e.target.value !== 'fixed' ? '' : o.priceChf })}
                  disabled={!o.selected} className={`${inputSm} w-full cursor-pointer`}>
                  <option value="fixed">Prix fixe</option>
                  <option value="on_request">Sur demande</option>
                  <option value="quote">Sur devis</option>
                </select>
                <div className="relative">
                  <input type="text" inputMode="decimal" value={o.priceChf}
                    onChange={e => updateOffer(i, { priceChf: e.target.value })}
                    disabled={!o.selected || o.pricingMode !== 'fixed'}
                    placeholder={o.pricingMode === 'fixed' ? '0' : '—'}
                    className={`${inputSm} w-full pr-7 ${o.pricingMode !== 'fixed' ? 'opacity-30' : ''}`} />
                  <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-rubik text-foreground/30 pointer-events-none">CHF</span>
                </div>
                <select value={o.availability} onChange={e => updateOffer(i, { availability: e.target.value })}
                  disabled={!o.selected} className={`${inputSm} w-full cursor-pointer`}>
                  <option value="available">Disponible</option>
                  <option value="on_request">Sur demande</option>
                </select>
                <select value={o.status} onChange={e => updateOffer(i, { status: e.target.value })}
                  disabled={!o.selected} className={`${inputSm} w-full cursor-pointer`}>
                  <option value="inactive">Inactif</option>
                  <option value="active">Actif</option>
                </select>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(1)}
              className="h-9 px-4 rounded-btn border border-white/15 text-sm font-rubik text-foreground/55 hover:text-foreground hover:bg-white/5 transition-colors">
              ← Retour
            </button>
            <button type="button" onClick={() => setStep(3)}
              className="h-9 px-5 rounded-btn bg-accent text-primary-foreground font-rubik font-semibold text-sm hover:bg-accent/90 transition-colors">
              Vérifier →
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 3 ─────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-lg font-rubik font-bold text-foreground">Vérification</h2>

          {/* Résumé modèle */}
          <div className="p-5 rounded-card bg-white/[0.04] border border-white/8 space-y-2">
            <p className="text-xs font-rubik text-foreground/35 uppercase tracking-wide">Nouveau modèle</p>
            <p className="text-xl font-rubik font-bold text-foreground">{s1.name}</p>
            <div className="grid grid-cols-2 gap-2 text-sm font-rubik text-foreground/55">
              <span>Slug : <code className="text-foreground/70">{s1.slug}</code></span>
              <span>Clé : <code className="text-foreground/70">{s1.internalKey}</code></span>
              <span>Catégorie : {categories.find(c => c.id === s1.categoryId)?.name ?? '—'}</span>
              <span>Statut initial : {s1.status}</span>
            </div>
          </div>

          {/* Résumé offres */}
          <div className="p-5 rounded-card bg-white/[0.04] border border-white/8 space-y-3">
            <p className="text-xs font-rubik text-foreground/35 uppercase tracking-wide">Réparations sélectionnées ({selectedCount})</p>
            {selectedCount === 0 ? (
              <p className="text-sm font-rubik text-foreground/35 italic">Aucune réparation — le modèle sera créé sans offres.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {offers.filter(o => o.selected).map(o => (
                  <div key={o.repairTypeId} className="flex items-center justify-between py-2 text-sm font-rubik">
                    <span className="text-foreground/70">{o.repairTypeName}</span>
                    <span className="text-foreground/50">
                      {o.pricingMode === 'fixed' ? (o.priceChf ? `CHF ${o.priceChf}` : 'prix manquant') : o.pricingMode === 'on_request' ? 'Sur demande' : 'Sur devis'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 rounded-card bg-amber-400/5 border border-amber-400/15">
            <p className="text-xs font-rubik text-foreground/45">
              Les modifications seront enregistrées dans Supabase. Le modèle ne sera visible sur le site public qu&apos;après activation de la synchronisation Supabase.
            </p>
          </div>

          <div className="flex justify-between">
            <button type="button" onClick={() => setStep(2)}
              className="h-9 px-4 rounded-btn border border-white/15 text-sm font-rubik text-foreground/55 hover:text-foreground hover:bg-white/5 transition-colors">
              ← Retour
            </button>
            <button type="button" onClick={handleSubmit} disabled={isPending}
              className="h-9 px-5 rounded-btn bg-accent text-primary-foreground font-rubik font-semibold text-sm hover:bg-accent/90 disabled:opacity-50 transition-colors">
              {isPending ? 'Création en cours…' : 'Créer le modèle et les réparations'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
