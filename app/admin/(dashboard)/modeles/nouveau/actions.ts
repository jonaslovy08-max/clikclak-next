'use server'
/*
  Actions serveur pour la création d'un nouveau modèle.
  Deux chemins :
    - familyMode='existing' → admin_create_device_model_with_offers (RPC 004)
    - familyMode='new'      → admin_create_family_and_model_with_offers (RPC 005)
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
  fieldErrors?: Record<string, string[]>
}

/* ── Copier les offres d'un modèle existant ─────────────── */

export async function getModelOffersForCopyAction(
  modelSlug: string,
): Promise<OfferForTarifs[] | null> {
  await requireAdminProfile()
  const supabase = await createSupabaseServerClient()
  const result   = await getModelWithOffers(supabase, modelSlug)
  return result?.offers ?? null
}

/* ── Interfaces de saisie ────────────────────────────────── */

interface OfferInput {
  repair_type_id:  string
  variant_key:     string
  pricing_mode:    string
  price_chf:       string | null
  availability:    string
  status:          string
  sort_order:      number
}

interface NewFamilyInput {
  brand_id:      string
  name:          string
  internal_key:  string
  short_label:   string
  button_prefix: string | null
  status:        string
  sort_order:    number
}

interface ModelInput {
  family_id:    string
  category_id:  string
  internal_key: string
  name:         string
  slug:         string
  status:       string
  sort_order:   number
  family_mode:  'existing' | 'new'
  new_family?:  NewFamilyInput
}

/* ── Utilitaire d'analyse d'erreur RPC ──────────────────── */

function parseRpcError(msg: string): { message: string; fieldErrors?: Record<string, string[]> } {
  if (msg.startsWith('auth_required:'))  return { message: 'Authentification requise.' }
  if (msg.startsWith('forbidden:'))      return { message: 'Rôle admin requis.' }

  const conflictMatch = msg.match(/^conflict:([^:]+): (.+)$/)
  if (conflictMatch) {
    const field = conflictMatch[1].trim()
    const text  = conflictMatch[2].trim()
    return { message: text, fieldErrors: { [field]: [text] } }
  }

  const validationMatch = msg.match(/^validation:([^:]+): (.+)$/)
  if (validationMatch) {
    const field = validationMatch[1].trim()
    const text  = validationMatch[2].trim()
    return { message: text, fieldErrors: { [field]: [text] } }
  }

  console.error('[modeles/nouveau/actions]', msg)
  return { message: 'Erreur lors de la création. Vérifiez les données.' }
}

/* ── Création du modèle ──────────────────────────────────── */

export async function createDeviceModelAction(
  modelData:  ModelInput,
  offersData: OfferInput[],
): Promise<never> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    throw new Error('Rôle admin requis.')
  }

  // Convertir CHF → centimes
  const offersJson = offersData.map(o => {
    let priceCents: number | null = null
    if (o.pricing_mode === 'fixed') {
      try { priceCents = parsePriceCHF(o.price_chf ?? '') } catch { priceCents = null }
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

  const supabase  = await createSupabaseServerClient()
  let brandKey    = ''
  let modelSlug   = modelData.slug

  if (modelData.family_mode === 'existing') {
    // Récupérer brand_key pour la redirection
    const { data: famData } = await supabase
      .from('device_families')
      .select('brands!inner(internal_key)')
      .eq('id', modelData.family_id)
      .single()
    const fam   = famData as { brands: unknown } | null
    const brand = (Array.isArray((fam?.brands as unknown[])) ? (fam?.brands as unknown[])[0] : fam?.brands) as { internal_key: string } | null
    brandKey = brand?.internal_key ?? ''

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
      const parsed = parseRpcError(error.message)
      throw new Error(parsed.message)
    }
    modelSlug = (rpcResult as { model_slug?: string } | null)?.model_slug ?? modelData.slug

  } else {
    // Nouvelle famille → nouvelle RPC
    const nf = modelData.new_family
    if (!nf) throw new Error('Données de nouvelle famille manquantes.')

    brandKey = '' // sera récupéré depuis la marque après création
    const { data: brandData } = await supabase
      .from('brands')
      .select('internal_key')
      .eq('id', nf.brand_id)
      .single()
    brandKey = (brandData as { internal_key?: string } | null)?.internal_key ?? ''

    const { data: rpcResult, error } = await supabase.rpc('admin_create_family_and_model_with_offers', {
      p_brand_id:              nf.brand_id,
      p_family_name:           nf.name,
      p_family_internal_key:   nf.internal_key,
      p_family_short_label:    nf.short_label,
      p_family_button_prefix:  nf.button_prefix,
      p_family_status:         nf.status,
      p_family_sort_order:     nf.sort_order,
      p_category_id:           modelData.category_id,
      p_model_internal_key:    modelData.internal_key,
      p_model_name:            modelData.name,
      p_model_slug:            modelData.slug,
      p_model_legacy_slug:     modelData.slug,
      p_model_status:          modelData.status,
      p_model_sort_order:      modelData.sort_order,
      p_offers:                JSON.stringify(offersJson),
    })

    if (error) {
      const parsed = parseRpcError(error.message)
      throw new Error(parsed.message)
    }
    modelSlug = (rpcResult as { model_slug?: string } | null)?.model_slug ?? modelData.slug
  }

  redirect(`/admin/reparations?brand=${brandKey}&model=${modelSlug}`)
}
