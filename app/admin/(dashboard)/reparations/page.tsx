/*
  app/admin/(dashboard)/reparations/page.tsx → /admin/reparations

  Parcours : Marque → (boutons modèles groupés par famille) → Réparations

  URL : /admin/reparations?brand=iphone&model=iphone-16-pro
  Modales : &mode=edit|create|archive  &offer=<uuid>
*/

import type { Metadata } from 'next'
import Link              from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import {
  getBrands,
  getSelectorFamilies,
  getSelectorModels,
  getModelBySlug,
  getOffersByModelId,
  getOfferById,
  getAllModelsForSelect,
  getAllTypesForSelect,
} from '@/lib/admin/queries'
import { PriceDisplay }         from '@/components/admin/PriceDisplay'
import { RepairModelSelector }  from '@/components/admin/RepairModelSelector'
import { OfferEditModal }       from '@/components/admin/OfferEditModal'
import { OfferCreateModal }     from '@/components/admin/OfferCreateModal'
import { ArchiveConfirmDialog } from '@/components/admin/ArchiveConfirmDialog'

export const metadata: Metadata = { title: 'Réparations' }

/* ── Helpers URL ─────────────────────────────────────────── */

function buildCloseHref(params: Record<string, string>): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mode, offer, ...rest } = params
  const q = new URLSearchParams(rest)
  const qs = q.toString()
  return `/admin/reparations${qs ? '?' + qs : ''}`
}

function buildModalHref(
  params: Record<string, string>,
  mode: string,
  offerId?: string,
): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mode: _m, offer: _o, ...rest } = params
  const q = new URLSearchParams({ ...rest, mode })
  if (offerId) q.set('offer', offerId)
  return `/admin/reparations?${q.toString()}`
}

/* ── Badges statut / disponibilité ─────────────────────── */

const STATUS_COLOR: Record<string, string> = {
  active:   'text-green-400 bg-green-400/10 border-green-400/20',
  inactive: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  archived: 'text-foreground/30 bg-white/5 border-white/10',
}
const STATUS_LABEL: Record<string, string> = {
  active: 'Actif', inactive: 'Inactif', archived: 'Archivé',
}

const AVAIL_COLOR: Record<string, string> = {
  available:   'text-green-400 bg-green-400/10 border-green-400/20',
  on_request:  'text-blue-400 bg-blue-400/10 border-blue-400/20',
  unavailable: 'text-red-400 bg-red-400/10 border-red-400/20',
}
const AVAIL_LABEL: Record<string, string> = {
  available: 'Disponible', on_request: 'Sur demande', unavailable: 'Indisponible',
}

/* ── Composant menu "..." pour archivage ─────────────────── */

function MoreMenuLink({ archiveHref }: { archiveHref: string }) {
  return (
    <div className="relative group">
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center rounded-btn text-foreground/35 hover:text-foreground hover:bg-white/8 transition-colors"
        aria-label="Plus d'options"
      >
        ⋯
      </button>
      <div className="
        absolute right-0 top-full mt-1 z-20
        min-w-[110px] rounded-btn
        bg-[#1e1e1e] border border-white/12
        shadow-xl
        invisible group-hover:visible
        opacity-0 group-hover:opacity-100
        transition-all duration-150
      ">
        <a
          href={archiveHref}
          className="block px-4 py-2.5 text-sm font-rubik text-red-400 hover:bg-red-400/8 rounded-btn transition-colors"
        >
          Archiver
        </a>
      </div>
    </div>
  )
}

/* ── Page principale ─────────────────────────────────────── */

export default async function ReparationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params   = await searchParams
  const supabase = await createSupabaseServerClient()
  const profile  = await requireAdminProfile()
  const isAdmin  = profile.role === 'admin'

  const selectedBrand  = params.brand ?? ''
  const selectedModel  = params.model ?? ''   // slug
  const closeHref      = buildCloseHref(params)

  /* ── Données pour le sélecteur (léger, filtré client-side) */
  const [brands, allFamilies, allModels] = await Promise.all([
    getBrands(supabase),
    getSelectorFamilies(supabase),
    getSelectorModels(supabase),
  ])

  /* ── Contexte du modèle sélectionné ──────────────────────  */
  let modelCtx  = null
  let offers: Awaited<ReturnType<typeof getOffersByModelId>> = []

  if (selectedModel) {
    modelCtx = await getModelBySlug(supabase, selectedModel)
    if (modelCtx) {
      offers = await getOffersByModelId(supabase, modelCtx.id, modelCtx)
    }
  }

  /* ── Données des modales ─────────────────────────────────── */
  let editOffer    = null
  let archiveOffer = null
  let createModels = null
  let createTypes  = null
  let prefilledModelId: string | undefined

  if (isAdmin && params.mode === 'edit' && params.offer) {
    editOffer = await getOfferById(supabase, params.offer)
  }
  if (isAdmin && params.mode === 'archive' && params.offer) {
    archiveOffer = await getOfferById(supabase, params.offer)
  }
  if (isAdmin && params.mode === 'create') {
    ;[createModels, createTypes] = await Promise.all([
      getAllModelsForSelect(supabase),
      getAllTypesForSelect(supabase),
    ])
    if (modelCtx) {
      prefilledModelId = createModels?.find(m => m.internal_key === modelCtx.internal_key)?.id
    }
  }

  const createHref = isAdmin ? buildModalHref(params, 'create') : '#'

  return (
    <>
      <div className="space-y-6">

        {/* ── En-tête ───────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-rubik font-bold text-foreground">Réparations</h1>
            {modelCtx ? (
              <p className="mt-1 text-sm font-rubik text-foreground/40">
                {offers.length} réparation{offers.length > 1 ? 's' : ''} pour{' '}
                <span className="text-foreground/70">{modelCtx.name}</span>
              </p>
            ) : (
              <p className="mt-1 text-sm font-rubik text-foreground/40">
                Sélectionnez un modèle pour voir ses réparations
              </p>
            )}
          </div>

          {isAdmin && modelCtx && (
            <Link
              href={createHref}
              className="
                flex items-center gap-2 h-9 px-4 rounded-btn shrink-0
                bg-accent text-primary-foreground
                font-rubik font-semibold text-sm
                hover:bg-accent/90 transition-colors duration-220
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
              "
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Ajouter
            </Link>
          )}

          {!isAdmin && (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-btn text-xs font-rubik text-amber-400 bg-amber-400/8 border border-amber-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
              Lecture seule
            </span>
          )}
        </div>

        {/* ── Sélecteur en cascade ──────────────────────── */}
        <div className="p-4 rounded-card bg-white/[0.03] border border-white/8">
          <RepairModelSelector
            brands={brands.map(b => ({ internal_key: b.internal_key, name: b.name }))}
            allFamilies={allFamilies}
            allModels={allModels}
            initialBrand={selectedBrand}
            initialModel={selectedModel}
            baseUrl="/admin/reparations"
          />
        </div>

        {/* ── Contenu selon sélection ───────────────────── */}

        {!selectedModel && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-4 text-foreground/12" aria-hidden>
              <rect x="4" y="4" width="32" height="32" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M14 20h12M14 14h8M14 26h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-rubik text-foreground/25">
              Choisissez un appareil pour voir ses réparations
            </p>
          </div>
        )}

        {selectedModel && !modelCtx && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm font-rubik text-foreground/35">Modèle introuvable.</p>
          </div>
        )}

        {selectedModel && modelCtx && (
          <>
            {/* ── Bandeau modèle ─────────────────────── */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-card bg-white/[0.04] border border-white/8">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-rubik text-foreground/35">{modelCtx.brand_name} · {modelCtx.family_name}</p>
                <p className="text-base font-rubik font-semibold text-foreground mt-0.5">{modelCtx.name}</p>
              </div>
              <span className="text-xs font-rubik text-foreground/30 shrink-0">
                {offers.length} réparation{offers.length !== 1 ? 's' : ''}
              </span>
            </div>

            {offers.length === 0 ? (
              <p className="text-center text-sm font-rubik text-foreground/30 py-8">
                Aucune réparation enregistrée pour ce modèle.
              </p>
            ) : (
              <>
                {/* ── Table desktop (md+) ───────────────── */}
                <div className="hidden md:block overflow-x-auto rounded-card border border-white/8">
                  <table className="w-full text-sm font-rubik">
                    <thead>
                      <tr className="border-b border-white/8">
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-foreground/30 uppercase tracking-wide w-[35%]">Réparation</th>
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-foreground/30 uppercase tracking-wide">Prix</th>
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-foreground/30 uppercase tracking-wide">Disponibilité</th>
                        <th scope="col" className="px-5 py-3 text-left text-xs font-semibold text-foreground/30 uppercase tracking-wide">Statut</th>
                        {isAdmin && <th scope="col" className="px-5 py-3 text-right text-xs font-semibold text-foreground/30 uppercase tracking-wide">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {offers.map(o => {
                        const editHref    = isAdmin ? buildModalHref(params, 'edit', o.id) : '#'
                        const archiveHref = isAdmin ? buildModalHref(params, 'archive', o.id) : '#'
                        return (
                          <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="px-5 py-4">
                              <span className="font-medium text-foreground">{o.type_name}</span>
                              {o.subtitle && (
                                <span className="block text-[11px] text-foreground/35 italic mt-0.5">{o.subtitle}</span>
                              )}
                              {o.public_note && o.availability === 'unavailable' && (
                                <span className="block text-[11px] text-red-400/60 mt-0.5">{o.public_note}</span>
                              )}
                            </td>
                            <td className="px-5 py-4">
                              <PriceDisplay
                                pricingMode={o.pricing_mode}
                                priceCents={o.price_cents}
                                availability={o.availability}
                                publicNote={o.public_note}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${AVAIL_COLOR[o.availability] ?? ''}`}>
                                {AVAIL_LABEL[o.availability] ?? o.availability}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${STATUS_COLOR[o.status] ?? ''}`}>
                                {STATUS_LABEL[o.status] ?? o.status}
                              </span>
                            </td>
                            {isAdmin && (
                              <td className="px-5 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <Link
                                    href={editHref}
                                    className="px-3 py-1.5 text-xs rounded-btn font-rubik text-foreground/55 hover:text-foreground hover:bg-white/8 transition-colors"
                                    aria-label={`Modifier ${o.type_name}`}
                                  >
                                    Modifier
                                  </Link>
                                  {o.status !== 'archived' && (
                                    <MoreMenuLink archiveHref={archiveHref} />
                                  )}
                                </div>
                              </td>
                            )}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* ── Cartes mobile (<md) ───────────────── */}
                <div className="md:hidden space-y-3">
                  {offers.map(o => {
                    const editHref = isAdmin ? buildModalHref(params, 'edit', o.id) : '#'
                    return (
                      <div key={o.id} className="rounded-card border border-white/8 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-rubik font-medium text-foreground text-sm">{o.type_name}</p>
                            {o.subtitle && (
                              <p className="text-[11px] text-foreground/35 italic mt-0.5">{o.subtitle}</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <PriceDisplay
                              pricingMode={o.pricing_mode}
                              priceCents={o.price_cents}
                              availability={o.availability}
                              publicNote={o.public_note}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${AVAIL_COLOR[o.availability] ?? ''}`}>
                            {AVAIL_LABEL[o.availability] ?? o.availability}
                          </span>
                          <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${STATUS_COLOR[o.status] ?? ''}`}>
                            {STATUS_LABEL[o.status] ?? o.status}
                          </span>
                        </div>
                        {isAdmin && (
                          <Link href={editHref}
                            className="mt-3 block w-full h-9 rounded-btn text-center text-sm font-rubik font-medium text-foreground/60 hover:text-foreground border border-white/10 hover:border-white/20 hover:bg-white/5 leading-[36px] transition-colors">
                            Modifier
                          </Link>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

      </div>

      {/* ── Modales (admin uniquement) ───────────────────── */}

      {isAdmin && params.mode === 'edit' && editOffer && (
        <OfferEditModal offer={editOffer} closeHref={closeHref} />
      )}

      {isAdmin && params.mode === 'create' && createModels && createTypes && (
        <OfferCreateModal
          models={createModels}
          types={createTypes}
          prefilledModel={prefilledModelId}
          closeHref={closeHref}
        />
      )}

      {isAdmin && params.mode === 'archive' && archiveOffer && (
        <ArchiveConfirmDialog
          offerId={archiveOffer.id}
          offerLabel={`${archiveOffer.model_name} — ${archiveOffer.type_name}`}
          updatedAt={archiveOffer.updated_at}
          closeHref={closeHref}
        />
      )}
    </>
  )
}
