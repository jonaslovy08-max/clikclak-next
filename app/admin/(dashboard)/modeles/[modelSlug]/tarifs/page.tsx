/*
  /admin/modeles/[modelSlug]/tarifs

  Éditeur groupé des tarifs d'un modèle.
  Affiche toutes les offres existantes + types manquants en un seul écran.
*/

import type { Metadata }              from 'next'
import Link                           from 'next/link'
import { notFound }                   from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import {
  getModelWithOffers,
  getMissingRepairTypes,
  getAllTypesForSelect,
} from '@/lib/admin/queries'
import { TarifsEditor } from './TarifsEditor'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params
  return { title: `Tarifs · ${modelSlug}` }
}

export default async function TarifsPage({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params
  const supabase = await createSupabaseServerClient()
  const profile  = await requireAdminProfile()

  if (profile.role !== 'admin') {
    return (
      <div className="py-12 text-center">
        <p className="text-sm font-rubik text-foreground/40">
          Accès réservé aux administrateurs.
        </p>
        <Link href="/admin/reparations" className="mt-4 inline-block text-sm font-rubik text-accent hover:underline">
          Retour aux réparations
        </Link>
      </div>
    )
  }

  const result = await getModelWithOffers(supabase, modelSlug)
  if (!result) notFound()

  const { model, offers } = result

  const [missingTypes, allTypes] = await Promise.all([
    getMissingRepairTypes(supabase, model.id),
    getAllTypesForSelect(supabase),
  ])

  // Carte internal_key → id pour résoudre les IDs des types
  const repairTypeIdMap: Record<string, string> = {}
  for (const t of allTypes) {
    repairTypeIdMap[t.internal_key] = t.id
  }

  const backHref = `/admin/reparations?brand=${model.brand_key}&model=${model.slug}`

  return (
    <div className="space-y-6">

      {/* Navigation */}
      <div>
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 text-sm font-rubik text-foreground/40 hover:text-foreground/70 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour aux réparations
        </Link>
      </div>

      {/* En-tête modèle */}
      <div>
        <h1 className="text-2xl font-rubik font-bold text-foreground">{model.name}</h1>
        <p className="mt-1 text-sm font-rubik text-foreground/40">
          {model.brand_name} · {model.family_name}
        </p>
      </div>

      {/* Éditeur */}
      <TarifsEditor
        model={model}
        initialOffers={offers}
        missingTypes={missingTypes}
        repairTypeIdMap={repairTypeIdMap}
      />
    </div>
  )
}
