/*
  lib/admin/validation/deletion.ts

  Schémas Zod pour les suppressions définitives.
*/

import { z } from 'zod'

export const deleteRepairOfferSchema = z.object({
  offer_id:            z.string().uuid('ID offre invalide.'),
  expected_updated_at: z.string().min(1, 'Timestamp manquant.'),
  confirmation:        z.literal('SUPPRIMER').refine(v => v === 'SUPPRIMER', {
    message: 'Saisissez exactement SUPPRIMER pour confirmer.',
  }),
})

export const deleteDeviceModelSchema = z.object({
  model_id:             z.string().uuid('ID modèle invalide.'),
  expected_updated_at:  z.string().min(1, 'Timestamp manquant.'),
  confirmation_name:    z.string().min(1, 'Confirmation obligatoire.'),
  model_name:           z.string().min(1),
  delete_empty_family:  z.boolean().default(false),
}).refine(
  data => data.confirmation_name === data.model_name,
  { message: 'Le nom saisi ne correspond pas au nom du modèle.', path: ['confirmation_name'] },
)
