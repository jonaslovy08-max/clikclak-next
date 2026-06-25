'use server'
/*
  Création d'un nouveau modèle avec ses offres initiales.
  Lecture des offres d'un modèle existant pour la fonctionnalité "copier depuis".
*/

import { redirect }                   from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import { parsePriceCHF }              from '@/lib/admin/validation/repairOffer'
import type { OfferForTarifs }        from '@/lib/admin/queries'
import { getModelWithOffers }         from '@/lib/admin/queries'

export interface ModelCreateResult {
  success:      boolean
  message:      string
  modelSlug?:   string
  brandKey?:    string
  fieldErrors?: Record<string, string[]>
}

/* ── Copier les offres d'un modèle existant ─────────────── */

export async function getModelOffersForCopyAction(
  modelSlug: string,
): Promise<OfferForTarifs[] | null> {
  const profile = await requireAdminProfile()
  if (!profile) return null

  const supabase = await createSupabaseServerClient()
  const result   = await getModelWithOffers(supabase, modelSlug)
  return result?.offers ?? null
}

/* ── Créer un modèle avec ses offres ────────────────────── */

interface OfferInput {
  repair_type_id:  string
  variant_key:     string
  pricing_mode:    string
  price_chf:       string | null
  availability:    string
  status:          string
  sort_order:      number
}

export async function createDeviceModelAction(
  modelData: {
    family_id:    string
    category_id:  string
    internal_key: string
    name:         string
    slug:         string
    status:       string
    sort_order:   number
  },
  offersData: OfferInput[],
): Promise<ModelCreateResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis.' }
  }

  // Convertir CHF → centimes
  const offersJson = offersData.map(o => {
    let priceCents: number | null = null
    if (o.pricing_mode === 'fixed') {
      try {
        priceCents = parsePriceCHF(o.price_chf ?? '')
      } catch {
        priceCents = null
      }
    }
    return {
      repair_type_id: o.repair_type_id,
      variant_key:    o.variant_key || 'standard',
      pricing_mode:   o.pricing_mode,
      price_cents:    priceCents,
      currency:       'CHF',
      availability:   o.availability,
      status:         o.status,
      sort_order:     o.sort_order,
    }
  })

  const supabase = await createSupabaseServerClient()

  // Récupérer brand_key depuis la famille pour la redirection
  const { data: familyData } = await supabase
    .from('device_families')
    .select('id, brands!inner(internal_key)')
    .eq('id', modelData.family_id)
    .single()

  const fam   = familyData as { id: string; brands: unknown } | null
  const brand = (Array.isArray((fam?.brands as unknown[])) ? (fam?.brands as unknown[])[0] : fam?.brands) as { internal_key: string } | null
  const brandKey = brand?.internal_key ?? ''

  const { data: rpcResult, error } = await supabase.rpc('admin_create_device_model_with_offers', {
    p_family_id:    modelData.family_id,
    p_category_id:  modelData.category_id,
    p_internal_key: modelData.internal_key,
    p_name:         modelData.name,
    p_slug:         modelData.slug,
    p_legacy_slug:  modelData.slug,
    p_status:       modelData.status,
    p_sort_order:   modelData.sort_order,
    p_offers:       JSON.stringify(offersJson),
  })

  if (error) {
    // Analyser l'erreur
    const msg = error.message
    if (msg.includes('conflict:slug:'))         return { success: false, message: msg.replace('conflict:slug:', '').trim(), fieldErrors: { slug: [msg.replace('conflict:slug:', '').trim()] } }
    if (msg.includes('conflict:internal_key:')) return { success: false, message: msg.replace('conflict:internal_key:', '').trim(), fieldErrors: { internal_key: [msg.replace('conflict:internal_key:', '').trim()] } }
    if (msg.startsWith('forbidden:'))           return { success: false, message: 'Rôle admin requis.' }
    if (msg.startsWith('validation:'))          return { success: false, message: msg.replace(/^validation:[^:]*:/, '').trim() }
    console.error('[modeles/nouveau/actions] createDeviceModel:', msg)
    return { success: false, message: 'Erreur lors de la création. Vérifiez les données.' }
  }

  const result = rpcResult as { model_slug?: string; model_id?: string } | null
  const newSlug = result?.model_slug ?? modelData.slug

  redirect(`/admin/reparations?brand=${brandKey}&model=${newSlug}`)
}
