/*
  lib/admin/validation/deviceModel.ts

  Schémas Zod pour la création et la gestion des modèles.
*/

import { z } from 'zod'
import { parsePriceCHF } from './repairOffer'

export { parsePriceCHF }

/* ── Schéma d'une offre dans le tableau groupé ───────────── */

export const bulkOfferSchema = z.object({
  offer_id:             z.string().uuid().nullable().optional(),
  repair_type_id:       z.string().uuid('Type de réparation invalide.'),
  variant_key:          z.string().regex(/^[a-z0-9][a-z0-9-]*$/).default('standard'),
  variant_name:         z.string().max(200).nullable().optional(),
  subtitle:             z.string().max(500).nullable().optional(),
  pricing_mode:         z.enum(['fixed', 'on_request', 'quote']),
  price_chf:            z.string().nullable().optional(),
  currency:             z.literal('CHF').default('CHF'),
  availability:         z.enum(['available', 'on_request', 'unavailable']).default('available'),
  duration_minutes:     z.coerce.number().int().positive().nullable().optional(),
  warranty_months:      z.coerce.number().int().min(0).nullable().optional(),
  public_note:          z.string().max(2000).nullable().optional(),
  internal_note:        z.string().max(2000).nullable().optional(),
  status:               z.enum(['active', 'inactive', 'archived']).default('active'),
  sort_order:           z.coerce.number().int().min(0).default(0),
  expected_updated_at:  z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  const mode  = data.pricing_mode
  const avail = data.availability
  const price = data.price_chf?.trim() ?? ''

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

/* ── Schéma de création du modèle ────────────────────────── */

export const createModelSchema = z.object({
  family_id:    z.string().uuid('Famille invalide.'),
  category_id:  z.string().uuid('Catégorie invalide.'),
  internal_key: z.string()
    .regex(/^[a-z0-9][a-z0-9-]*:[a-z0-9][a-z0-9-]*$/, 'Format : marque:slug (ex: iphone:iphone-17e)'),
  name:         z.string().min(1, 'Nom obligatoire.').max(200),
  slug:         z.string().regex(/^[a-z0-9][a-z0-9-]*$/, 'Minuscules, chiffres et tirets uniquement.'),
  status:       z.enum(['active', 'inactive']).default('inactive'),
  sort_order:   z.coerce.number().int().min(0).default(0),
  offers:       z.array(bulkOfferSchema).default([]),
})

export type CreateModelInput = z.input<typeof createModelSchema>

/* ── Schéma d'archivage du modèle ────────────────────────── */

export const archiveModelSchema = z.object({
  model_id:            z.string().uuid(),
  expected_updated_at: z.string().min(1),
})
