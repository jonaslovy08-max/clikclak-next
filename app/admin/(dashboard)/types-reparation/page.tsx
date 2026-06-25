/*
  app/admin/(dashboard)/types-reparation/page.tsx → /admin/types-reparation

  Liste des types de réparation en lecture seule.
*/

import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getRepairTypes } from '@/lib/admin/queries'
import { FilterBar } from '@/components/admin/FilterBar'

export const metadata: Metadata = { title: 'Types de réparation' }

const CATEGORY_LABEL: Record<string, string> = {
  screen:  'Écran',
  battery: 'Batterie',
  other:   'Autre',
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Actif',   color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  inactive: { label: 'Brouillon', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  archived: { label: 'Archivé', color: 'text-foreground/30 bg-white/5 border-white/10' },
}

export default async function TypesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params   = await searchParams
  const supabase = await createSupabaseServerClient()

  const types = await getRepairTypes(supabase, {
    category: params.category,
    status:   params.status,
    search:   params.search,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-rubik font-bold text-foreground">Types de réparation</h1>
        <p className="mt-1 text-sm font-rubik text-foreground/40">
          {types.length} type{types.length > 1 ? 's' : ''} au catalogue
        </p>
      </div>

      <FilterBar
        searchPlaceholder="Rechercher un type…"
        selects={[
          {
            name:    'category',
            label:   'Catégorie',
            options: [
              { value: 'screen',  label: 'Écran' },
              { value: 'battery', label: 'Batterie' },
              { value: 'other',   label: 'Autre' },
            ],
          },
          {
            name:    'status',
            label:   'Statut',
            options: [
              { value: 'active',   label: 'Actif' },
              { value: 'inactive', label: 'Brouillon' },
              { value: 'archived', label: 'Archivé' },
            ],
          },
        ]}
      />

      {types.length === 0 ? (
        <p className="text-foreground/35 text-sm font-rubik py-12 text-center">
          Aucun type trouvé avec ces filtres.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-card border border-white/8">
          <table className="w-full min-w-[600px] text-sm font-rubik">
            <thead>
              <tr className="border-b border-white/8">
                {['Nom', 'Slug', 'Catégorie', 'Offres', 'Statut', 'Ordre'].map(col => (
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
              {types.map(t => {
                const status = STATUS_LABEL[t.status] ?? { label: t.status, color: 'text-foreground/40 bg-white/5 border-white/8' }
                return (
                  <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs text-foreground/45">{t.slug}</code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-foreground/55 bg-white/6 px-2 py-0.5 rounded-badge">
                        {CATEGORY_LABEL[t.category] ?? t.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-foreground/70 text-center">
                      {t.offerCount ?? 0}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-foreground/35 tabular-nums text-center">{t.sort_order}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
