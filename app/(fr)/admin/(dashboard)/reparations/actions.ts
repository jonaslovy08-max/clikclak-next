'use server'
/*
  app/admin/(dashboard)/reparations/actions.ts

  Server Actions de mutation des offres de réparation.
  Chaque action :
    1. Vérifie la session et exige role = 'admin'
    2. Valide avec Zod
    3. Convertit CHF → centimes
    4. Appelle la fonction RPC sécurisée (jamais d'écriture directe sur la table)
    5. Retourne un résultat structuré

  Aucune utilisation de SUPABASE_SECRET_KEY.
  Aucune écriture directe via .insert() .update() .delete() .upsert().
*/

import { revalidatePath }        from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdminProfile }   from '@/lib/admin/auth'
import {
  createOfferSchema,
  updateOfferSchema,
  archiveOfferSchema,
  parsePriceCHF,
} from '@/lib/admin/validation/repairOffer'

/* ── Type de résultat unifié ─────────────────────────────── */

export interface AdminActionResult {
  success:      boolean
  message:      string
  fieldErrors?: Record<string, string[]>
  conflict?:    boolean
}

/* ── Helpers ─────────────────────────────────────────────── */

function parseRpcError(message: string): { field?: string; conflict?: boolean; message: string } {
  // Le format des exceptions SQL : 'prefix: message'
  if (message.startsWith('auth_required:'))   return { message: 'Authentification requise.' }
  if (message.startsWith('forbidden:'))       return { message: 'Action non autorisée. Rôle admin requis.' }
  if (message.startsWith('not_found:'))       return { message: 'Offre introuvable.' }
  if (message.startsWith('conflict:'))        return { conflict: true, message: message.replace('conflict:', '').trim() }

  const validationMatch = message.match(/^validation:([^:]+):(.+)$/)
  if (validationMatch) {
    return { field: validationMatch[1].trim(), message: validationMatch[2].trim() }
  }

  // Erreur générique — ne pas exposer les détails SQL
  console.error('[admin/reparations/actions] RPC error:', message)
  return { message: 'Une erreur est survenue. Veuillez réessayer.' }
}

function formDataToObj(formData: FormData): Record<string, string> {
  const obj: Record<string, string> = {}
  formData.forEach((value, key) => {
    if (typeof value === 'string') obj[key] = value
  })
  return obj
}

/* ── Création d'une offre ────────────────────────────────── */

export async function createRepairOfferAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  // 1. Vérifier session et rôle admin
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis pour créer une offre.' }
  }

  // 2. Parser et valider avec Zod
  const raw = formDataToObj(formData)
  const parsed = createOfferSchema.safeParse({
    ...raw,
    duration_minutes: raw.duration_minutes || null,
    warranty_months:  raw.warranty_months  || null,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      if (!fieldErrors[field]) fieldErrors[field] = []
      fieldErrors[field].push(issue.message)
    }
    return { success: false, message: 'Erreurs de validation.', fieldErrors }
  }

  const data = parsed.data

  // 3. Convertir CHF → centimes
  let priceCents: number | null = null
  if (data.pricing_mode === 'fixed') {
    try {
      priceCents = parsePriceCHF(data.price_chf ?? '')
      if (priceCents === null || priceCents < 0) {
        return { success: false, message: 'Erreurs de validation.', fieldErrors: { price_chf: ['Prix invalide.'] } }
      }
    } catch {
      return { success: false, message: 'Erreurs de validation.', fieldErrors: { price_chf: ['Prix invalide (ex: 249 ou 249.90).'] } }
    }
  }

  // 4. Appel RPC
  const supabase = await createSupabaseServerClient()
  const { data: rpcResult, error } = await supabase.rpc('admin_create_repair_offer', {
    p_device_model_id:  data.device_model_id,
    p_repair_type_id:   data.repair_type_id,
    p_variant_key:      data.variant_key.trim(),
    p_variant_name:     data.variant_name?.trim() || null,
    p_subtitle:         data.subtitle?.trim() || null,
    p_pricing_mode:     data.pricing_mode,
    p_price_cents:      priceCents,
    p_currency:         'CHF',
    p_availability:     data.availability,
    p_duration_minutes: data.duration_minutes ?? null,
    p_warranty_months:  data.warranty_months  ?? null,
    p_public_note:      data.public_note?.trim()   || null,
    p_internal_note:    data.internal_note?.trim() || null,
    p_status:           data.status,
    p_sort_order:       data.sort_order,
  })

  if (error) {
    const parsed2 = parseRpcError(error.message)
    if (parsed2.field) {
      return { success: false, message: 'Erreurs de validation.', fieldErrors: { [parsed2.field]: [parsed2.message] } }
    }
    return { success: false, message: parsed2.message, conflict: parsed2.conflict }
  }

  void rpcResult

  // 5. Revalider la page admin uniquement
  revalidatePath('/admin/reparations')

  return { success: true, message: 'Offre créée avec succès.' }
}

/* ── Modification d'une offre ────────────────────────────── */

export async function updateRepairOfferAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis pour modifier une offre.' }
  }

  const raw = formDataToObj(formData)
  const parsed = updateOfferSchema.safeParse({
    ...raw,
    duration_minutes: raw.duration_minutes || null,
    warranty_months:  raw.warranty_months  || null,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path.join('.')
      if (!fieldErrors[field]) fieldErrors[field] = []
      fieldErrors[field].push(issue.message)
    }
    return { success: false, message: 'Erreurs de validation.', fieldErrors }
  }

  const data = parsed.data

  let priceCents: number | null = null
  if (data.pricing_mode === 'fixed') {
    try {
      priceCents = parsePriceCHF(data.price_chf ?? '')
      if (priceCents === null || priceCents < 0) {
        return { success: false, message: 'Erreurs de validation.', fieldErrors: { price_chf: ['Prix invalide.'] } }
      }
    } catch {
      return { success: false, message: 'Erreurs de validation.', fieldErrors: { price_chf: ['Prix invalide (ex: 249 ou 249.90).'] } }
    }
  }

  const supabase = await createSupabaseServerClient()
  const { data: rpcResult, error } = await supabase.rpc('admin_update_repair_offer', {
    p_offer_id:            data.offer_id,
    p_expected_updated_at: data.expected_updated_at,
    p_variant_name:        data.variant_name?.trim() || null,
    p_subtitle:            data.subtitle?.trim() || null,
    p_pricing_mode:        data.pricing_mode,
    p_price_cents:         priceCents,
    p_currency:            'CHF',
    p_availability:        data.availability,
    p_duration_minutes:    data.duration_minutes ?? null,
    p_warranty_months:     data.warranty_months  ?? null,
    p_public_note:         data.public_note?.trim()   || null,
    p_internal_note:       data.internal_note?.trim() || null,
    p_status:              data.status,
    p_sort_order:          data.sort_order,
  })

  if (error) {
    const parsed2 = parseRpcError(error.message)
    if (parsed2.conflict) {
      return { success: false, message: parsed2.message, conflict: true }
    }
    if (parsed2.field) {
      return { success: false, message: 'Erreurs de validation.', fieldErrors: { [parsed2.field]: [parsed2.message] } }
    }
    return { success: false, message: parsed2.message }
  }

  void rpcResult

  revalidatePath('/admin/reparations')

  return { success: true, message: 'Offre mise à jour avec succès.' }
}

/* ── Archivage d'une offre ───────────────────────────────── */

export async function archiveRepairOfferAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const profile = await requireAdminProfile()
  if (profile.role !== 'admin') {
    return { success: false, message: 'Rôle admin requis pour archiver une offre.' }
  }

  const raw    = formDataToObj(formData)
  const parsed = archiveOfferSchema.safeParse(raw)

  if (!parsed.success) {
    return { success: false, message: 'Données invalides.' }
  }

  const supabase = await createSupabaseServerClient()
  const { data: rpcResult, error } = await supabase.rpc('admin_archive_repair_offer', {
    p_offer_id:            parsed.data.offer_id,
    p_expected_updated_at: parsed.data.expected_updated_at,
  })

  if (error) {
    const parsed2 = parseRpcError(error.message)
    return { success: false, message: parsed2.message, conflict: parsed2.conflict }
  }

  void rpcResult

  revalidatePath('/admin/reparations')

  return { success: true, message: 'Offre archivée.' }
}
