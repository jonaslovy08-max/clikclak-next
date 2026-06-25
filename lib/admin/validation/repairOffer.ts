/*
  lib/admin/validation/repairOffer.ts

  Schémas Zod pour la validation des offres de réparation.
  Utilisé côté serveur uniquement (Server Actions).

  Règles de prix :
    fixed      → price_chf obligatoire, converti en centimes côté serveur
    on_request → price_chf = null/vide
    quote      → price_chf = null/vide

  Indisponibilité :
    availability = unavailable → public_note obligatoire, price_chf null
*/

import { z } from 'zod'

/* ── Constantes ──────────────────────────────────────────── */

export const PRICING_MODES    = ['fixed', 'on_request', 'quote'] as const
export const AVAILABILITIES   = ['available', 'on_request', 'unavailable'] as const
export const OFFER_STATUSES   = ['active', 'inactive', 'archived'] as const
export const VARIANT_KEY_RE   = /^[a-z0-9][a-z0-9-]*$/

/* ── Helpers ─────────────────────────────────────────────── */

/**
 * Convertit une valeur CHF saisie dans le formulaire en centimes.
 * Accepte "249", "249.90", "249,90".
 * Retourne null si la valeur est vide ou null.
 * Lance une erreur si la valeur est invalide.
 */
export function parsePriceCHF(value: string | null | undefined): number | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.trim().replace(/\s/g, '').replace(',', '.')
  const float   = parseFloat(cleaned)
  if (isNaN(float) || float < 0) {
    throw new Error('Prix invalide : doit être un nombre >= 0 (ex : 249 ou 249.90)')
  }
  return Math.round(float * 100)
}

/* ── Schéma de création ──────────────────────────────────── */

export const createOfferSchema = z.object({
  device_model_id: z.string().uuid('Modèle invalide.'),
  repair_type_id:  z.string().uuid('Type de réparation invalide.'),

  variant_key: z
    .string()
    .min(1, 'La clé de variante est obligatoire.')
    .regex(VARIANT_KEY_RE, 'Minuscules, chiffres et tirets uniquement (commence par une lettre ou un chiffre).'),

  variant_name: z.string().max(200).nullable().optional(),
  subtitle:     z.string().max(500).nullable().optional(),

  pricing_mode:  z.enum(PRICING_MODES, { error: 'Mode tarifaire invalide.' }),
  price_chf:     z.string().nullable().optional(),   // CHF string → converti en centimes
  currency:      z.literal('CHF').default('CHF'),
  availability:  z.enum(AVAILABILITIES, { error: 'Disponibilité invalide.' }),

  duration_minutes: z.coerce.number().int().positive('La durée doit être un entier positif.').nullable().optional(),
  warranty_months:  z.coerce.number().int().min(0, 'La garantie doit être >= 0.').nullable().optional(),

  public_note:   z.string().max(2000).nullable().optional(),
  internal_note: z.string().max(2000).nullable().optional(),

  status:     z.enum(OFFER_STATUSES, { error: 'Statut invalide.' }).default('active'),
  sort_order: z.coerce.number().int().min(0).default(0),
}).superRefine((data, ctx) => {
  const mode  = data.pricing_mode
  const avail = data.availability
  const price = data.price_chf ? data.price_chf.trim() : ''

  // Cohérence prix / mode
  if (mode === 'fixed' && !price) {
    ctx.addIssue({ code: 'custom', path: ['price_chf'], message: 'Prix obligatoire pour le mode Fixe.' })
  }
  if (mode !== 'fixed' && price) {
    ctx.addIssue({ code: 'custom', path: ['price_chf'], message: 'Le prix doit être vide pour Sur demande ou Sur devis.' })
  }

  // Cohérence indisponibilité
  if (avail === 'unavailable' && price) {
    ctx.addIssue({ code: 'custom', path: ['price_chf'], message: 'Pas de prix pour une offre indisponible.' })
  }
  if (avail === 'unavailable' && !(data.public_note?.trim())) {
    ctx.addIssue({ code: 'custom', path: ['public_note'], message: 'Note publique obligatoire pour une offre indisponible.' })
  }
})

export type CreateOfferInput = z.input<typeof createOfferSchema>

/* ── Schéma de modification ──────────────────────────────── */

export const updateOfferSchema = z.object({
  offer_id:             z.string().uuid('ID offre invalide.'),
  expected_updated_at:  z.string().min(1, 'Timestamp de contrôle manquant.'),

  // device_model_id, repair_type_id, variant_key : non modifiables dans Phase 2B
  variant_name: z.string().max(200).nullable().optional(),
  subtitle:     z.string().max(500).nullable().optional(),

  pricing_mode:  z.enum(PRICING_MODES),
  price_chf:     z.string().nullable().optional(),
  currency:      z.literal('CHF').default('CHF'),
  availability:  z.enum(AVAILABILITIES),

  duration_minutes: z.coerce.number().int().positive('Durée entière positive requise.').nullable().optional(),
  warranty_months:  z.coerce.number().int().min(0, 'Garantie >= 0 requise.').nullable().optional(),

  public_note:   z.string().max(2000).nullable().optional(),
  internal_note: z.string().max(2000).nullable().optional(),

  status:     z.enum(OFFER_STATUSES).default('active'),
  sort_order: z.coerce.number().int().min(0).default(0),
}).superRefine((data, ctx) => {
  const mode  = data.pricing_mode
  const avail = data.availability
  const price = data.price_chf ? data.price_chf.trim() : ''

  if (mode === 'fixed' && !price) {
    ctx.addIssue({ code: 'custom', path: ['price_chf'], message: 'Prix obligatoire pour le mode Fixe.' })
  }
  if (mode !== 'fixed' && price) {
    ctx.addIssue({ code: 'custom', path: ['price_chf'], message: 'Le prix doit être vide pour Sur demande ou Sur devis.' })
  }
  if (avail === 'unavailable' && price) {
    ctx.addIssue({ code: 'custom', path: ['price_chf'], message: 'Pas de prix pour une offre indisponible.' })
  }
  if (avail === 'unavailable' && !(data.public_note?.trim())) {
    ctx.addIssue({ code: 'custom', path: ['public_note'], message: 'Note publique obligatoire pour une offre indisponible.' })
  }
})

export type UpdateOfferInput = z.input<typeof updateOfferSchema>

/* ── Schéma d'archivage ──────────────────────────────────── */

export const archiveOfferSchema = z.object({
  offer_id:            z.string().uuid('ID offre invalide.'),
  expected_updated_at: z.string().min(1, 'Timestamp de contrôle manquant.'),
})

export type ArchiveOfferInput = z.input<typeof archiveOfferSchema>
