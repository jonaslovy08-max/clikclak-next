/*
  /admin/modeles/nouveau

  Page de création d'un nouveau modèle avec ses réparations initiales.
*/

import type { Metadata }              from 'next'
import Link                           from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import {
  getBrands,
  getFamiliesWithId,
  getCategories,
  getAllTypesForSelect,
  getSelectorModels,
} from '@/lib/admin/queries'
import { NewModelWizard }            from './NewModelWizard'
import { UnpublishedChangesNotice } from '@/components/admin/UnpublishedChangesNotice'

export const metadata: Metadata = { title: 'Nouveau modèle' }

export default async function NouveauModelePage() {
  const supabase = await createSupabaseServerClient()
  const profile  = await requireAdminProfile()

  if (profile.role !== 'admin') {
    return (
      <div className="py-12 text-center space-y-4">
        <p className="text-sm font-rubik text-foreground/40">Accès réservé aux administrateurs.</p>
        <Link href="/admin/modeles" className="text-sm font-rubik text-accent hover:underline">← Retour</Link>
      </div>
    )
  }

  const [brands, families, categoriesRaw, types, allModels] = await Promise.all([
    getBrands(supabase),
    getFamiliesWithId(supabase),
    getCategories(supabase),
    getAllTypesForSelect(supabase),
    getSelectorModels(supabase),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/modeles" className="text-sm font-rubik text-foreground/40 hover:text-foreground/70 transition-colors">
          ← Retour aux modèles
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-rubik font-bold text-foreground">Ajouter un modèle</h1>
        <p className="mt-1 text-sm font-rubik text-foreground/40">
          Créez un nouveau modèle et ses réparations initiales en 3 étapes.
        </p>
      </div>

      <UnpublishedChangesNotice />

      <NewModelWizard
        brands={brands.map(b => ({ id: b.id, internal_key: b.internal_key, name: b.name }))}
        families={families}
        categories={categoriesRaw}
        types={types}
        allModels={allModels}
      />
    </div>
  )
}
