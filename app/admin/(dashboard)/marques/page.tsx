/*
  app/admin/(dashboard)/marques/page.tsx → /admin/marques

  Liste des marques en lecture seule.
*/

import type { Metadata } from 'next'
import Image from 'next/image'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getBrands } from '@/lib/admin/queries'

export const metadata: Metadata = { title: 'Marques' }

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  active:   { label: 'Actif',    color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  inactive: { label: 'Brouillon', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' },
  archived: { label: 'Archivé',  color: 'text-foreground/30 bg-white/5 border-white/10' },
}

export default async function MarquesPage() {
  const supabase = await createSupabaseServerClient()
  const brands   = await getBrands(supabase)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-rubik font-bold text-foreground">Marques</h1>
        <p className="mt-1 text-sm font-rubik text-foreground/40">
          {brands.length} marque{brands.length > 1 ? 's' : ''} au catalogue
        </p>
      </div>

      <div className="overflow-x-auto rounded-card border border-white/8">
        <table className="w-full min-w-[700px] text-sm font-rubik">
          <thead>
            <tr className="border-b border-white/8">
              {['Logo', 'Nom', 'Clé interne', 'Chemin public', 'Familles', 'Modèles', 'Statut', 'Ordre'].map(col => (
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
            {brands.map(brand => {
              const status = STATUS_LABEL[brand.status] ?? { label: brand.status, color: 'text-foreground/40 bg-white/5 border-white/8' }
              return (
                <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    {brand.brand_icon ? (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <Image
                          src={brand.brand_icon}
                          alt={`Logo ${brand.name}`}
                          width={24}
                          height={24}
                          className="opacity-70"
                          style={{ filter: 'invert(1)' }}
                        />
                      </div>
                    ) : (
                      <span className="text-foreground/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{brand.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs text-accent/70 bg-accent/5 px-1.5 py-0.5 rounded">
                      {brand.internal_key}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-foreground/50 text-xs">{brand.public_base_path}</td>
                  <td className="px-4 py-3 text-foreground/70 tabular-nums text-center">
                    {brand.familyCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-foreground/70 tabular-nums text-center">
                    {brand.modelCount ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-badge text-xs font-medium border ${status.color}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-foreground/35 tabular-nums text-center">{brand.sort_order}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
