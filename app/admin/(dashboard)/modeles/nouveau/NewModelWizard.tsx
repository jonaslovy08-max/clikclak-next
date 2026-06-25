'use client'
/*
  NewModelWizard.tsx

  Wizard 3 étapes pour créer un nouveau modèle.
  Supporte la création d'une nouvelle famille ou le choix d'une existante.

  CORRECTION BUG FOCUS :
  - Le composant OfferPriceRow est déclaré AU NIVEAU DU MODULE.
  - Chaque ligne a un rowKey stable (crypto.randomUUID() généré UNE SEULE FOIS
    dans l'initialiseur d'état, jamais pendant le rendu).
  - priceChf est stocké comme chaîne brute pendant la saisie.
*/

import { useState, useTransition } from 'react'
import type {
  FamilyWithId, CategoryOption, TypeSelectOption, SelectorModel,
} from '@/lib/admin/queries'
import { getModelOffersForCopyAction, createDeviceModelAction } from './actions'

/* ── Types ───────────────────────────────────────────────── */

interface BrandOpt { id: string; internal_key: string; name: string }

interface OfferRow {
  rowKey:         string   // identifiant stable généré une seule fois
  repairTypeId:   string
  repairTypeName: string
  selected:       boolean
  pricingMode:    string
  priceChf:       string   // chaîne brute — pas de parseFloat pendant la saisie
  availability:   string
  status:         string
  sortOrder:      number
}

interface NewFamilyData {
  name:         string
  internalKey:  string
  shortLabel:   string
  buttonPrefix: string
  status:       string
  sortOrder:    number
}

interface Step1Data {
  brandKey:    string
  brandId:     string   // UUID de la marque
  familyMode:  'existing' | 'new'
  familyId:    string   // pour familyMode='existing'
  newFamily:   NewFamilyData
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

/* ── Styles ──────────────────────────────────────────────── */

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
  disabled:opacity-40 transition-colors duration-220
`

/* ── OfferPriceRow — DÉCLARÉ AU NIVEAU DU MODULE ─────────── */
/*
  Déclaré ici, hors du composant parent, pour garantir une référence stable.
  Si déclaré à l'intérieur de NewModelWizard, React le démonterait/remonterait
  à chaque frappe → focus perdu.
*/

interface OfferPriceRowProps {
  offer:    OfferRow
  onUpdate: (patch: Partial<OfferRow>) => void
}

function OfferPriceRow({ offer, onUpdate }: OfferPriceRowProps) {
  const isFixed = offer.pricingMode === 'fixed'

  return (
    <div className={`grid grid-cols-[auto_1fr_110px_90px_110px_90px] gap-2 px-4 py-2 items-center border-b border-white/5 last:border-0 ${!offer.selected ? 'opacity-50' : ''}`}>
      <input
        type="checkbox"
        checked={offer.selected}
        onChange={e => onUpdate({ selected: e.target.checked })}
        className="w-3.5 h-3.5 rounded cursor-pointer"
        aria-label={`Sélectionner ${offer.repairTypeName}`}
      />
      <span className="text-sm font-rubik text-foreground truncate">{offer.repairTypeName}</span>
      <select
        value={offer.pricingMode}
        onChange={e => onUpdate({ pricingMode: e.target.value, priceChf: e.target.value !== 'fixed' ? '' : offer.priceChf })}
        disabled={!offer.selected}
        className={`${inputSm} w-full cursor-pointer`}
        aria-label={`Mode tarifaire ${offer.repairTypeName}`}
      >
        <option value="fixed">Prix fixe</option>
        <option value="on_request">Sur demande</option>
        <option value="quote">Sur devis</option>
      </select>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          value={offer.priceChf}
          onChange={e => onUpdate({ priceChf: e.target.value })}
          disabled={!offer.selected || !isFixed}
          placeholder={isFixed ? '0' : '—'}
          className={`${inputSm} w-full pr-7 ${!isFixed ? 'opacity-30' : ''}`}
          aria-label={`Prix CHF ${offer.repairTypeName}`}
        />
        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-rubik text-foreground/30 pointer-events-none">CHF</span>
      </div>
      <select
        value={offer.availability}
        onChange={e => onUpdate({ availability: e.target.value })}
        disabled={!offer.selected}
        className={`${inputSm} w-full cursor-pointer`}
        aria-label={`Disponibilité ${offer.repairTypeName}`}
      >
        <option value="available">Disponible</option>
        <option value="on_request">Sur demande</option>
      </select>
      <select
        value={offer.status}
        onChange={e => onUpdate({ status: e.target.value })}
        disabled={!offer.selected}
        className={`${inputSm} w-full cursor-pointer`}
        aria-label={`Statut ${offer.repairTypeName}`}
      >
        <option value="inactive">Inactif</option>
        <option value="active">Actif</option>
      </select>
    </div>
  )
}

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

  /* ── Étape 1 ─────────────────────────────────────────── */

  const [s1, setS1] = useState<Step1Data>({
    brandKey: '', brandId: '', familyMode: 'existing', familyId: '',
    newFamily: { name: '', internalKey: '', shortLabel: '', buttonPrefix: '', status: 'active', sortOrder: 0 },
    categoryId: '', name: '', internalKey: '', slug: '', status: 'inactive', sortOrder: 0,
  })

  const brandFamilies = families.filter(f => f.brand_key === s1.brandKey)

  function onBrand(brandKey: string) {
    const brand     = brands.find(b => b.internal_key === brandKey)
    const catKey    = BRAND_CATEGORY[brandKey] ?? 'smartphone'
    const catId     = categories.find(c => c.internal_key === catKey)?.id ?? ''
    setS1(p => ({
      ...p, brandKey, brandId: brand?.id ?? '',
      familyId: '', categoryId: catId,
    }))
  }

  function onModelName(name: string) {
    const s = slugify(name)
    const k = s1.brandKey ? `${s1.brandKey}:${s}` : s
    setS1(p => ({ ...p, name, slug: s, internalKey: k }))
  }

  function onFamilyName(name: string) {
    const slug     = slugify(name)
    const brand    = brands.find(b => b.internal_key === s1.brandKey)
    const brandName = brand?.name ?? ''
    const short    = name.replace(new RegExp(`^${brandName}\\s*`, 'i'), '').trim() || name
    setS1(p => ({
      ...p,
      newFamily: { ...p.newFamily, name, internalKey: slug, shortLabel: short },
    }))
  }

  function validateStep1(): boolean {
    const errs: Record<string, string[]> = {}
    if (!s1.brandKey)    errs.brandKey    = ['Marque obligatoire.']
    if (!s1.categoryId)  errs.categoryId  = ['Catégorie obligatoire.']
    if (!s1.name.trim()) errs.name        = ['Nom obligatoire.']
    if (!s1.slug)        errs.slug        = ['Slug obligatoire.']
    if (!s1.internalKey) errs.internalKey = ['Clé interne obligatoire.']

    if (s1.familyMode === 'existing' && !s1.familyId) {
      errs.familyId = ['Famille obligatoire.']
    }
    if (s1.familyMode === 'new') {
      if (!s1.newFamily.name.trim())        errs.familyName       = ['Nom de famille obligatoire.']
      if (!s1.newFamily.internalKey)        errs.familyInternalKey = ['Clé interne obligatoire.']
      if (!s1.newFamily.shortLabel.trim())  errs.familyShortLabel  = ['Libellé court obligatoire.']
    }

    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  /* ── Étape 2 ─────────────────────────────────────────── */

  /* rowKey généré UNE SEULE FOIS dans l'initialiseur — jamais pendant le rendu */
  const [offers, setOffers] = useState<OfferRow[]>(
    () => types.map((t, i) => ({
      rowKey:         crypto.randomUUID(),
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

  /* Mise à jour par rowKey — stable, ne recalcule pas les rowKey des autres */
  function updateOffer(rowKey: string, patch: Partial<OfferRow>) {
    setOffers(prev => prev.map(o =>
      o.rowKey === rowKey ? { ...o, ...patch } : o
    ))
  }

  function selectAll()   { setOffers(prev => prev.map(o => ({ ...o, selected: true }))) }
  function deselectAll() { setOffers(prev => prev.map(o => ({ ...o, selected: false }))) }

  async function handleCopy() {
    if (!copyModelSlug) return
    setCopyLoading(true)
    try {
      const existing = await getModelOffersForCopyAction(copyModelSlug)
      if (!existing) return
      setOffers(prev => prev.map(o => {
        const found = existing.find(e => e.type_name === o.repairTypeName)
        if (!found) return o
        return {
          ...o,
          selected:     true,
          pricingMode:  copyPrices ? found.pricing_mode : 'on_request',
          priceChf:     copyPrices && found.price_cents !== null
            ? String(Math.trunc(found.price_cents / 100)) +
              (found.price_cents % 100 !== 0
                ? `.${String(found.price_cents % 100).padStart(2, '0')}`
                : '')
            : '',
          availability: found.availability,
          status:       'inactive',
        }
      }))
    } finally {
      setCopyLoading(false)
    }
  }

  /* ── Soumission ─────────────────────────────────────── */

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
            family_id:    s1.familyMode === 'existing' ? s1.familyId : '',
            category_id:  s1.categoryId,
            internal_key: s1.internalKey,
            name:         s1.name,
            slug:         s1.slug,
            status:       s1.status,
            sort_order:   s1.sortOrder,
            family_mode:  s1.familyMode,
            new_family:   s1.familyMode === 'new' ? {
              brand_id:      s1.brandId,
              name:          s1.newFamily.name,
              internal_key:  s1.newFamily.internalKey,
              short_label:   s1.newFamily.shortLabel,
              button_prefix: s1.newFamily.buttonPrefix || null,
              status:        s1.newFamily.status,
              sort_order:    s1.newFamily.sortOrder,
            } : undefined,
          },
          selectedOffers,
        )
      } catch (e) {
        if (e instanceof Error && !e.message.includes('NEXT_REDIRECT')) {
          setError(e.message)
        }
      }
    })
  }

  /* ── Rendu ───────────────────────────────────────────── */

  const stepLabels = ['Modèle', 'Réparations', 'Vérification']

  function FieldError({ field }: { field: string }) {
    const m = fieldErrors[field]
    if (!m?.length) return null
    return <p className="mt-1 text-xs text-red-400">{m[0]}</p>
  }

  return (
    <div className="max-w-3xl space-y-8">

      {/* Progression */}
      <div className="flex items-center gap-0">
        {stepLabels.map((label, idx) => {
          const n = idx + 1
          const active = step === n
          const done   = step > n
          return (
            <div key={n} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={['w-7 h-7 rounded-full flex items-center justify-center text-xs font-rubik font-bold transition-colors',
                  active ? 'bg-accent text-primary-foreground' :
                  done   ? 'bg-accent/30 text-accent' :
                           'bg-white/8 text-foreground/30'].join(' ')}>
                  {done ? '✓' : n}
                </div>
                <span className={`text-sm font-rubik ${active ? 'text-foreground font-medium' : 'text-foreground/35'}`}>{label}</span>
              </div>
              {idx < stepLabels.length - 1 && <div className="flex-1 h-px bg-white/8 mx-3" />}
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
              Le modèle sera créé dans Supabase. Il ne sera visible sur le site public qu&apos;après activation de la synchronisation Supabase.
            </p>
          </div>

          {/* Marque + Catégorie */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Marque</label>
              <select value={s1.brandKey} onChange={e => onBrand(e.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="">— Choisir —</option>
                {brands.map(b => <option key={b.id} value={b.internal_key}>{b.name}</option>)}
              </select>
              <FieldError field="brandKey" />
            </div>
            <div>
              <label className={labelClass}>Catégorie</label>
              <select value={s1.categoryId} onChange={e => setS1(p => ({ ...p, categoryId: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                <option value="">— Choisir —</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <FieldError field="categoryId" />
            </div>
          </div>

          {/* ── Famille ─────────────────────────────────── */}
          {s1.brandKey && (
            <div className="space-y-3">
              {/* Toggle mode famille */}
              <div className="flex gap-2">
                <button type="button"
                  onClick={() => setS1(p => ({ ...p, familyMode: 'existing', familyId: '' }))}
                  className={['px-3 py-1.5 rounded-btn text-sm font-rubik border transition-colors',
                    s1.familyMode === 'existing'
                      ? 'border-accent/50 bg-accent/8 text-foreground font-medium'
                      : 'border-white/12 text-foreground/50 hover:border-white/25'].join(' ')}>
                  Famille existante
                </button>
                <button type="button"
                  onClick={() => setS1(p => ({ ...p, familyMode: 'new', familyId: '' }))}
                  className={['px-3 py-1.5 rounded-btn text-sm font-rubik border transition-colors flex items-center gap-1.5',
                    s1.familyMode === 'new'
                      ? 'border-accent/50 bg-accent/8 text-foreground font-medium'
                      : 'border-white/12 text-foreground/50 hover:border-white/25'].join(' ')}>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Créer une nouvelle famille
                </button>
              </div>

              {/* Famille existante */}
              {s1.familyMode === 'existing' && (
                <div>
                  <label className={labelClass}>Famille</label>
                  <select value={s1.familyId} onChange={e => setS1(p => ({ ...p, familyId: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                    <option value="">— Choisir —</option>
                    {brandFamilies.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                  <FieldError field="familyId" />
                </div>
              )}

              {/* Nouvelle famille */}
              {s1.familyMode === 'new' && (
                <div className="p-4 rounded-card border border-white/10 bg-white/[0.02] space-y-4">
                  <p className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider">
                    Nouvelle famille
                  </p>

                  <div>
                    <label className={labelClass}>Nom de la famille <span className="text-foreground/30">(ex : iPhone 18)</span></label>
                    <input type="text" value={s1.newFamily.name} onChange={e => onFamilyName(e.target.value)}
                      className={inputClass} placeholder="ex : iPhone 18" />
                    <FieldError field="familyName" />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Clé interne</label>
                      <input type="text" value={s1.newFamily.internalKey}
                        onChange={e => setS1(p => ({ ...p, newFamily: { ...p.newFamily, internalKey: e.target.value } }))}
                        className={inputClass} placeholder="ex : iphone-18" />
                      <FieldError field="familyInternalKey" />
                    </div>
                    <div>
                      <label className={labelClass}>Libellé court</label>
                      <input type="text" value={s1.newFamily.shortLabel}
                        onChange={e => setS1(p => ({ ...p, newFamily: { ...p.newFamily, shortLabel: e.target.value } }))}
                        className={inputClass} placeholder="ex : 18" />
                      <FieldError field="familyShortLabel" />
                    </div>
                    <div>
                      <label className={labelClass}>Préfixe bouton <span className="text-foreground/25">(optionnel)</span></label>
                      <input type="text" value={s1.newFamily.buttonPrefix}
                        onChange={e => setS1(p => ({ ...p, newFamily: { ...p.newFamily, buttonPrefix: e.target.value } }))}
                        className={inputClass} placeholder='ex : "Galaxy " pour Samsung' />
                    </div>
                    <div>
                      <label className={labelClass}>Statut famille</label>
                      <select value={s1.newFamily.status}
                        onChange={e => setS1(p => ({ ...p, newFamily: { ...p.newFamily, status: e.target.value } }))}
                        className={`${inputClass} cursor-pointer`}>
                        <option value="active">Actif</option>
                        <option value="inactive">Inactif</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Ordre famille</label>
                    <input type="number" min={0} value={s1.newFamily.sortOrder}
                      onChange={e => setS1(p => ({ ...p, newFamily: { ...p.newFamily, sortOrder: parseInt(e.target.value) || 0 } }))}
                      className={inputClass} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Nom + Slug + Clé interne */}
          <div>
            <label className={labelClass}>Nom public du modèle</label>
            <input type="text" value={s1.name} onChange={e => onModelName(e.target.value)}
              className={inputClass} placeholder="ex : iPhone 18" />
            <FieldError field="name" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Slug (URL)</label>
              <input type="text" value={s1.slug}
                onChange={e => setS1(p => ({ ...p, slug: e.target.value, internalKey: s1.brandKey ? `${s1.brandKey}:${e.target.value}` : e.target.value }))}
                className={inputClass} placeholder="ex : iphone-18" />
              {s1.slug && <p className="mt-1 text-[10px] font-rubik text-foreground/25">clikclak.ch/services/reparation-{s1.brandKey}/{s1.slug}</p>}
              <FieldError field="slug" />
            </div>
            <div>
              <label className={labelClass}>Clé interne</label>
              <input type="text" value={s1.internalKey}
                onChange={e => setS1(p => ({ ...p, internalKey: e.target.value }))}
                className={inputClass} placeholder="ex : iphone:iphone-18" />
              <FieldError field="internalKey" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Statut initial</label>
              <select value={s1.status} onChange={e => setS1(p => ({ ...p, status: e.target.value }))} className={`${inputClass} cursor-pointer`}>
                <option value="inactive">Inactif (recommandé)</option>
                <option value="active">Actif</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Ordre</label>
              <input type="number" min={0} value={s1.sortOrder} onChange={e => setS1(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" onClick={() => { if (validateStep1()) setStep(2) }}
              className="h-9 px-5 rounded-btn bg-accent text-primary-foreground font-rubik font-semibold text-sm hover:bg-accent/90 transition-colors">
              Continuer →
            </button>
          </div>
        </div>
      )}

      {/* ── Étape 2 ─────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5">
          <h2 className="text-lg font-rubik font-bold text-foreground">Réparations et tarifs</h2>

          {/* Copie */}
          <div className="p-4 rounded-card bg-white/[0.03] border border-white/8 space-y-3">
            <p className="text-sm font-rubik font-medium text-foreground/60">Copier les réparations depuis un modèle existant</p>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <select value={copyModelSlug} onChange={e => setCopyModelSlug(e.target.value)} className={`${inputClass} cursor-pointer`}>
                  <option value="">— Choisir un modèle source —</option>
                  {allModels.map(m => <option key={m.slug} value={m.slug}>{m.name} ({m.brand_key})</option>)}
                </select>
              </div>
              <button type="button" onClick={handleCopy} disabled={!copyModelSlug || copyLoading}
                className="h-9 px-4 rounded-btn border border-white/15 text-sm font-rubik text-foreground/60 hover:text-foreground hover:bg-white/5 disabled:opacity-40 transition-colors">
                {copyLoading ? 'Chargement…' : 'Copier'}
              </button>
            </div>
            <label className="flex items-center gap-2 text-xs font-rubik text-foreground/45 cursor-pointer">
              <input type="checkbox" checked={copyPrices} onChange={e => setCopyPrices(e.target.checked)} className="w-3.5 h-3.5 rounded" />
              Copier également les prix <span className="text-foreground/25">(désactivé par défaut)</span>
            </label>
          </div>

          {/* Contrôles globaux */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-rubik text-foreground/50">{selectedCount} réparation{selectedCount !== 1 ? 's' : ''} sélectionnée{selectedCount !== 1 ? 's' : ''}</span>
            <button type="button" onClick={selectAll} className="text-xs font-rubik text-accent hover:underline">Tout sélectionner</button>
            <button type="button" onClick={deselectAll} className="text-xs font-rubik text-foreground/40 hover:underline">Tout désélectionner</button>
          </div>

          {/* Tableau des réparations */}
          <div className="rounded-card border border-white/8 overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_110px_90px_110px_90px] gap-2 px-4 py-2 border-b border-white/8 bg-white/[0.02]">
              {['', 'Réparation', 'Mode', 'Prix CHF', 'Disponibilité', 'Statut'].map(h => (
                <span key={h} className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wide">{h}</span>
              ))}
            </div>
            {offers.map(o => (
              <OfferPriceRow
                key={o.rowKey}
                offer={o}
                onUpdate={patch => updateOffer(o.rowKey, patch)}
              />
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

          {/* Résumé famille */}
          {s1.familyMode === 'new' && (
            <div className="p-4 rounded-card bg-blue-400/5 border border-blue-400/15 space-y-1">
              <p className="text-xs font-rubik text-blue-400/60 uppercase tracking-wide">Nouvelle famille créée</p>
              <p className="text-sm font-rubik font-semibold text-foreground">{s1.newFamily.name}</p>
              <p className="text-xs font-rubik text-foreground/40">Clé : {s1.newFamily.internalKey} · Libellé court : {s1.newFamily.shortLabel}</p>
            </div>
          )}

          {/* Résumé modèle */}
          <div className="p-5 rounded-card bg-white/[0.04] border border-white/8 space-y-2">
            <p className="text-xs font-rubik text-foreground/35 uppercase tracking-wide">Nouveau modèle</p>
            <p className="text-xl font-rubik font-bold text-foreground">{s1.name}</p>
            <div className="grid grid-cols-2 gap-2 text-sm font-rubik text-foreground/55">
              <span>Slug : <code className="text-foreground/70">{s1.slug}</code></span>
              <span>Clé : <code className="text-foreground/70">{s1.internalKey}</code></span>
              <span>Catégorie : {categories.find(c => c.id === s1.categoryId)?.name ?? '—'}</span>
              <span>Statut : {s1.status}</span>
            </div>
          </div>

          {/* Résumé offres */}
          <div className="p-5 rounded-card bg-white/[0.04] border border-white/8 space-y-3">
            <p className="text-xs font-rubik text-foreground/35 uppercase tracking-wide">Réparations sélectionnées ({selectedCount})</p>
            {selectedCount === 0 ? (
              <p className="text-sm font-rubik text-foreground/35 italic">Aucune — le modèle sera créé sans offres.</p>
            ) : (
              <div className="divide-y divide-white/5">
                {offers.filter(o => o.selected).map(o => (
                  <div key={o.rowKey} className="flex items-center justify-between py-2 text-sm font-rubik">
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
              Les données seront enregistrées dans Supabase. Elles ne seront visibles sur le site public qu&apos;après activation de la synchronisation Supabase.
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
