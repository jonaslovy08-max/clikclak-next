/*
  app/admin/(dashboard)/reparations/page.tsx → /admin/reparations

  Liste des offres de réparation avec pagination et filtres.
  - admin : peut créer, modifier, dupliquer, archiver
  - editor : lecture seule

  Les modales s'ouvrent via URL params (?mode=create, ?mode=edit&offer=<id>, ?mode=archive&offer=<id>).
*/

import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import {
  getOffers, getBrandNames, getRepairTypeNames,
  getOfferById, getAllModelsForSelect, getAllTypesForSelect,
} from '@/lib/admin/queries'
import { PriceDisplay }         from '@/components/admin/PriceDisplay'
import { FilterBar }            from '@/components/admin/FilterBar'
import { Pagination }           from '@/components/admin/Pagination'
import { OfferEditModal }       from '@/components/admin/OfferEditModal'
import { OfferCreateModal }     from '@/components/admin/OfferCreateModal'
import { ArchiveConfirmDialog } from '@/components/admin/ArchiveConfirmDialog'
import Link                     from 'next/link'

export const metadata: Metadata = { title: 'Réparations' }

const PAGE_SIZE = 50

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Actif',   color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  inactive: { label: 'Inactif', color: 'text-amber-400 bg-amber-400/10 border-amber-400/20' },
  archived: { label: 'Archivé', color: 'text-foreground/30 bg-white/5 border-white/10' },
}

const AVAIL_LABEL: Record<string, { label: string; color: string }> = {
  available:   { label: 'Disponible',   color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  on_request:  { label: 'Sur demande',  color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  unavailable: { label: 'Indisponible', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

function buildCloseHref(params: Record<string, string>): string {
  // Supprime les params de modal mais garde les filtres/pagination
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mode, offer, ...rest } = params
  const q = new URLSearchParams(rest)
  const qs = q.toString()
  return `/admin/reparations${qs ? '?' + qs : ''}`
}

function buildActionHref(params: Record<string, string>, mode: string, offerId?: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { mode: _m, offer: _o, ...rest } = params
  const q = new URLSearchParams({ ...rest, mode })
  if (offerId) q.set('offer', offerId)
  return `/admin/reparations?${q.toString()}`
}

export default async function ReparationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params   = await searchParams
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))
  const supabase = await createSupabaseServerClient()
  const profile  = await requireAdminProfile()
  const isAdmin  = profile.role === 'admin'

  const closeHref = buildCloseHref(params)

  // ── Données pour les modales ──────────────────────────────────────────────

  let editOffer = null
  let archiveOffer = null
  let createModels  = null
  let createTypes   = null

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
  }

  // ── Liste des offres ──────────────────────────────────────────────────────

  const [result, brandNames, typeNames] = await Promise.all([
    getOffers(supabase, page, PAGE_SIZE, {
      brand:        params.brand,
      type:         params.type,
      availability: params.availability,
      status:       params.status,
      search:       params.search,
    }),
    getBrandNames(supabase),
    getRepairTypeNames(supabase),
  ])

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-rubik font-bold text-foreground">Réparations</h1>
            <p className="mt-1 text-sm font-rubik text-foreground/40">
              {result.count.toLocaleString('fr-CH')} offre{result.count > 1 ? 's' : ''} au total
            </p>
          </div>

          {isAdmin ? (
            <Link
              href={buildActionHref(params, 'create')}
              className="
                flex items-center gap-2 h-9 px-4 rounded-btn shrink-0
                bg-accent text-primary-foreground
                font-rubik font-semibold text-sm
                hover:bg-accent/90 transition-colors duration-220
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
              "
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Ajouter
            </Link>
          ) : (
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-btn text-xs font-rubik text-amber-400 bg-amber-400/8 border border-amber-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" aria-hidden />
              Lecture seule
            </span>
          )}
        </div>

        <FilterBar
          searchPlaceholder="Rechercher un modèle…"
          selects={[
            {
              name:    'brand',
              label:   'Marque',
              options: brandNames.map(b => ({ value: b.internal_key, label: b.name })),
            },
            {
              name:    'type',
              label:   'Type',
              options: typeNames.map(t => ({ value: t.internal_key, label: t.name })),
            },
            {
              name:    'availability',
              label:   'Disponibilité',
              options: [
                { value: 'available',   label: 'Disponible' },
                { value: 'on_request',  label: 'Sur demande' },
                { value: 'unavailable', label: 'Indisponible' },
              ],
            },
            {
              name:    'status',
              label:   'Statut',
              options: [
                { value: 'active',   label: 'Actif' },
                { value: 'inactive', label: 'Inactif' },
                { value: 'archived', label: 'Archivé' },
              ],
            },
          ]}
        />

        {result.data.length === 0 ? (
          <p className="text-foreground/35 text-sm font-rubik py-12 text-center">
            Aucune offre trouvée avec ces filtres.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto rounded-card border border-white/8">
              <table className="w-full min-w-[900px] text-sm font-rubik">
                <thead>
                  <tr className="border-b border-white/8">
                    {['Marque', 'Famille', 'Modèle', 'Type', 'Prix', 'Disponibilité', 'Statut', ...(isAdmin ? ['Actions'] : [])].map(col => (
                      <th
                        key={col}
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-semibold text-foreground/35 uppercase tracking-wide"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.data.map(o => {
                    const status = STATUS_LABEL[o.status] ?? { label: o.status, color: 'text-foreground/40 bg-white/5 border-white/8' }
                    const avail  = AVAIL_LABEL[o.availability]
                    const editHref    = buildActionHref(params, 'edit', o.id)
                    const dupHref     = buildActionHref(params, 'create')
                    const archiveHref = buildActionHref(params, 'archive', o.id)
                    void dupHref // duplication préparera le form create — voir commentaire

                    return (
                      <tr key={o.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs text-accent/70 font-medium">{o.brand_name}</span>
                        </td>
                        <td className="px-4 py-3 text-foreground/50">{o.family_name}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-foreground">{o.model_name}</div>
                          {o.subtitle && (
                            <div className="text-[11px] text-foreground/35 italic mt-0.5">{o.subtitle}</div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-foreground/70">{o.type_name}</td>
                        <td className="px-4 py-3">
                          <PriceDisplay
                            pricingMode={o.pricing_mode}
                            priceCents={o.price_cents}
                            availability={o.availability}
                            publicNote={o.public_note}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {avail ? (
                            <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${avail.color}`}>
                              {avail.label}
                            </span>
                          ) : (
                            <span className="text-foreground/30 text-xs">{o.availability}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${status.color}`}>
                            {status.label}
                          </span>
                        </td>

                        {isAdmin && (
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <Link
                                href={editHref}
                                className="px-2 py-1 text-xs rounded font-rubik text-foreground/55 hover:text-foreground hover:bg-white/8 transition-colors"
                                aria-label={`Modifier ${o.model_name} — ${o.type_name}`}
                              >
                                Modifier
                              </Link>
                              {o.status !== 'archived' && (
                                <Link
                                  href={archiveHref}
                                  className="px-2 py-1 text-xs rounded font-rubik text-red-400/60 hover:text-red-400 hover:bg-red-400/8 transition-colors"
                                  aria-label={`Archiver ${o.model_name} — ${o.type_name}`}
                                >
                                  Archiver
                                </Link>
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

            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={result.count}
              baseUrl="/admin/reparations"
              searchParams={params}
            />
          </>
        )}
      </div>

      {/* ── Modales (admin uniquement) ──────────────────────────────────────── */}

      {isAdmin && params.mode === 'edit' && editOffer && (
        <OfferEditModal offer={editOffer} closeHref={closeHref} />
      )}
      {isAdmin && params.mode === 'edit' && params.offer && !editOffer && (
        // Offre introuvable
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" />
          <div className="relative z-10 bg-[#1a1a1a] border border-white/12 rounded-card p-8 text-center space-y-4">
            <p className="text-sm font-rubik text-foreground/60">Offre introuvable.</p>
            <Link href={closeHref} className="text-sm font-rubik text-accent hover:underline">Retour</Link>
          </div>
        </div>
      )}

      {isAdmin && params.mode === 'create' && createModels && createTypes && (
        <OfferCreateModal
          models={createModels}
          types={createTypes}
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
