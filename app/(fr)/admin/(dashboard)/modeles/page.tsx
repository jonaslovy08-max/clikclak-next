/*
  app/admin/(dashboard)/modeles/page.tsx → /admin/modeles

  Liste des modèles avec pagination, recherche et filtre marque/statut.
*/

import type { Metadata } from 'next'
import Link              from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import { getModels, getBrandNames }   from '@/lib/admin/queries'
import { FilterBar }    from '@/components/admin/FilterBar'
import { Pagination }   from '@/components/admin/Pagination'

export const metadata: Metadata = { title: 'Modèles' }

const PAGE_SIZE = 50

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Actif',     color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  inactive: { label: 'Brouillon', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  archived: { label: 'Archivé',  color: 'text-foreground/30 bg-white/5 border-white/10' },
}

export default async function ModelesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params   = await searchParams
  const page     = Math.max(1, parseInt(params.page ?? '1', 10))
  const supabase = await createSupabaseServerClient()
  const profile  = await requireAdminProfile()
  const isAdmin  = profile.role === 'admin'

  const [result, brandNames] = await Promise.all([
    getModels(supabase, page, PAGE_SIZE, {
      brand:  params.brand,
      status: params.status,
      search: params.search,
    }),
    getBrandNames(supabase),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-rubik font-bold text-foreground">Modèles</h1>
          <p className="mt-1 text-sm font-rubik text-foreground/40">
            {result.count.toLocaleString('fr-CH')} modèle{result.count > 1 ? 's' : ''} au total
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/modeles/nouveau"
            className="
              flex items-center gap-2 h-9 px-4 rounded-btn shrink-0
              bg-accent text-primary-foreground
              font-rubik font-semibold text-sm
              hover:bg-accent/90 transition-colors duration-220
            "
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden>
              <path d="M6.5 2v9M2 6.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            Ajouter un modèle
          </Link>
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
            name:    'status',
            label:   'Actifs et brouillons',
            options: [
              { value: 'active',   label: 'Actifs seulement' },
              { value: 'inactive', label: 'Brouillons seulement' },
              { value: 'archived', label: 'Archivés' },
              { value: 'all',      label: 'Tous' },
            ],
          },
        ]}
      />

      {result.data.length === 0 ? (
        <p className="text-foreground/35 text-sm font-rubik py-12 text-center">
          Aucun modèle trouvé avec ces filtres.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-card border border-white/8">
            <table className="w-full min-w-[700px] text-sm font-rubik">
              <thead>
                <tr className="border-b border-white/8">
                  {['Nom', 'Slug', 'Marque', 'Famille', 'Catégorie', 'Statut', 'Ordre', ...(isAdmin ? ['Actions'] : [])].map(col => (
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
                {result.data.map(m => {
                  const status = STATUS_LABEL[m.status] ?? { label: m.status, color: 'text-foreground/40 bg-white/5 border-white/8' }
                  return (
                    <tr key={m.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{m.name}</td>
                      <td className="px-4 py-3">
                        <code className="text-xs text-foreground/45">{m.slug}</code>
                      </td>
                      <td className="px-4 py-3 text-foreground/70">{m.brand_name}</td>
                      <td className="px-4 py-3 text-foreground/50">{m.family_name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-foreground/40 bg-white/5 px-2 py-0.5 rounded-badge">
                          {m.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-foreground/35 tabular-nums text-center">{m.sort_order}</td>
                      {isAdmin && (
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/modeles/${m.slug}/tarifs`}
                            className="text-xs font-rubik px-2 py-1 rounded text-accent/70 hover:text-accent hover:bg-accent/8 transition-colors"
                          >
                            Gérer les tarifs
                          </Link>
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
            baseUrl="/admin/modeles"
            searchParams={params}
          />
        </>
      )}
    </div>
  )
}
