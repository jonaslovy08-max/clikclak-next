/*
  app/admin/(dashboard)/reparations/page.tsx → /admin/reparations

  Liste des offres de réparation avec pagination et filtres.
  50 offres par page pour les 1308 offres totales.
*/

import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getOffers, getBrandNames, getRepairTypeNames } from '@/lib/admin/queries'
import { PriceDisplay } from '@/components/admin/PriceDisplay'
import { FilterBar } from '@/components/admin/FilterBar'
import { Pagination } from '@/components/admin/Pagination'

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

export default async function ReparationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params   = await searchParams
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))
  const supabase = await createSupabaseServerClient()

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-rubik font-bold text-foreground">Réparations</h1>
        <p className="mt-1 text-sm font-rubik text-foreground/40">
          {result.count.toLocaleString('fr-CH')} offre{result.count > 1 ? 's' : ''} au total
        </p>
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
                  {['Marque', 'Famille', 'Modèle', 'Type', 'Prix', 'Disponibilité', 'Statut'].map(col => (
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
  )
}
