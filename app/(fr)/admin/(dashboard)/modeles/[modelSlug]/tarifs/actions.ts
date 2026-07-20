'use server'
/*
  Gérer les tarifs d'un modèle : mise à jour groupée + archivage.
  Toutes les mutations passent par les RPC sécurisées.
  Aucun insert/update/delete direct.
*/

import { revalidatePath }             from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }        from '@/lib/admin/auth'
import { parsePriceCHF }              from '@/lib/admin/validation/repairOffer'
import { archiveModelSchema }         from '@/lib/admin/validation/deviceModel'

export interface TarifsActionResult {
  success:   boolean
  message:   string
  conflict?: boolean
}

/* ── Payload d'une offre dans la mise à jour groupée ───── */
export interface OfferPayload {
  offer_id?:           string | null
  repair_type_id:      string
  variant_key:         string
  variant_name?:       string | null
  subtitle?:           string | null
  pricing_mode:        string
  price_chf?:          string | null   // CHF string → centimes côté serveur
  currency:            string
  availability:        string
  duration_minutes?:   number | null
  warranty_months?:    number | null
  public_note?:        string | null
  internal_note?:      string | null
  status:              string
  sort_order:          number
  expected_updated_at?: string | null
}

function parseRpcError(message: string): { conflict?: boolean; message: string } {
  if (message.startsWith('auth_required:'))  return { message: 'Authentification requise.' }
  if (message.startsWith('forbidden:'))      return { message: 'Rôle admin requis.' }
  if (message.startsWith('not_found:'))      return { message: 'Ressource introuvable.' }
  if (message.startsWith('conflict:'))       return { conflict: true, message: message.replace('conflict:', '').trim() }
  const vm = message.match(/^validation:[^:]+:(.+)$/)
  if (vm) return { message: vm[1].trim() }
  console.error('[tarifs/actions] RPC:', message)
  return { message: 'Une erreur est survenue. Veuillez réessayer.' }
}

/* ── Mise à jour groupée ─────────────────────────────────── */

export async function bulkUpdateOffersAction(
  modelId: string,
  offers:  OfferPayload[],
): Promise<TarifsActionResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis.' }
  }
  if (!modelId) {
    return { success: false, message: 'ID de modèle manquant.' }
  }

  // Convertir CHF → centimes
  const offersJson = offers.map((o, idx) => {
    let priceCents: number | null = null
    if (o.pricing_mode === 'fixed') {
      try {
        priceCents = parsePriceCHF(o.price_chf ?? '')
        if (priceCents === null || priceCents < 0) {
          throw new Error(`Offre ${idx + 1}: prix invalide.`)
        }
      } catch {
        throw new Error(`Offre ${idx + 1}: prix invalide.`)
      }
    }
    return {
      offer_id:            o.offer_id ?? null,
      repair_type_id:      o.repair_type_id,
      variant_key:         o.variant_key || 'standard',
      variant_name:        o.variant_name?.trim() || null,
      subtitle:            o.subtitle?.trim() || null,
      pricing_mode:        o.pricing_mode,
      price_cents:         priceCents,
      currency:            'CHF',
      availability:        o.availability,
      duration_minutes:    o.duration_minutes ?? null,
      warranty_months:     o.warranty_months  ?? null,
      public_note:         o.public_note?.trim()  || null,
      internal_note:       o.internal_note?.trim() || null,
      status:              o.status,
      sort_order:          o.sort_order,
      expected_updated_at: o.expected_updated_at ?? null,
    }
  })

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.rpc(
    "admin_bulk_update_model_offers",
    {
      p_model_id: modelId,
      p_offers: offersJson,
    }
  )

  if (error) {
    const parsed = parseRpcError(error.message)
    return { success: false, ...parsed }
  }

  revalidatePath(`/admin/modeles`, 'layout')

  return { success: true, message: 'Modifications enregistrées.' }
}

/* ── Archivage du modèle ─────────────────────────────────── */

export async function archiveModelAction(
  modelId:         string,
  expectedUpdatedAt: string,
): Promise<TarifsActionResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis.' }
  }

  const parsed = archiveModelSchema.safeParse({
    model_id: modelId,
    expected_updated_at: expectedUpdatedAt,
  })
  if (!parsed.success) {
    return { success: false, message: 'Données invalides.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('admin_archive_device_model', {
    p_model_id:            parsed.data.model_id,
    p_expected_updated_at: parsed.data.expected_updated_at,
  })

  if (error) {
    const p = parseRpcError(error.message)
    return { success: false, ...p }
  }

  revalidatePath('/admin/modeles', 'layout')
  revalidatePath('/admin/reparations', 'layout')

  return { success: true, message: 'Modèle archivé.' }
}

/* ── Suppression définitive d'un modèle ─────────────────── */

export async function deleteModelAction(
  modelId:           string,
  expectedUpdatedAt: string,
  confirmationName:  string,
  modelName:         string,
  deleteEmptyFamily: boolean,
): Promise<TarifsActionResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis.' }
  }

  if (confirmationName !== modelName) {
    return { success: false, message: 'Le nom saisi ne correspond pas.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('admin_delete_device_model', {
    p_model_id:            modelId,
    p_expected_updated_at: expectedUpdatedAt,
    p_confirmation_name:   confirmationName,
    p_delete_empty_family: deleteEmptyFamily,
  })

  if (error) {
    const p = parseRpcError(error.message)
    return { success: false, ...p }
  }

  revalidatePath('/admin/modeles', 'layout')
  revalidatePath('/admin/reparations', 'layout')

  return { success: true, message: 'Modèle supprimé définitivement.' }
}

/* ── Suppression définitive d'une réparation ─────────────── */

export async function deleteOfferAction(
  offerId:           string,
  expectedUpdatedAt: string,
  confirmation:      string,
): Promise<TarifsActionResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis.' }
  }

  if (confirmation !== 'SUPPRIMER') {
    return { success: false, message: 'Saisissez exactement SUPPRIMER pour confirmer.' }
  }

  const supabase = await createSupabaseServerClient()
  const { error } = await supabase.rpc('admin_delete_repair_offer', {
    p_offer_id:            offerId,
    p_expected_updated_at: expectedUpdatedAt,
    p_confirmation:        confirmation,
  })

  if (error) {
    const p = parseRpcError(error.message)
    return { success: false, ...p }
  }

  revalidatePath('/admin/reparations', 'layout')

  return { success: true, message: 'Réparation supprimée définitivement.' }
}
