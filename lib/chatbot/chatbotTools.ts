/*
  chatbotTools.ts — définitions Anthropic tool_use + exécuteurs.
  Server-side uniquement — ne jamais importer dans un composant client.
*/

import type Anthropic from '@anthropic-ai/sdk'
import { searchRepairPrices } from './repairPricesIndex'
import { searchShopProducts } from './shopProductsIndex'
import { searchServices }     from './servicesIndex'
import { getContactInfo }     from './contactInfo'

/* ── Tool definitions ──────────────────────────────────────────── */

export const CHATBOT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'search_repair_prices',
    description:
      'Recherche les tarifs de réparation dans la base de données ClikClak. ' +
      'Utiliser pour toute question sur un prix de réparation. ' +
      'Ne jamais deviner un prix sans utiliser cet outil.',
    input_schema: {
      type:       'object' as const,
      properties: {
        brand: {
          type:        'string',
          description: 'Marque de l\'appareil : iPhone, Samsung, iPad, MacBook, Huawei, OPPO',
        },
        model_query: {
          type:        'string',
          description: 'Nom partiel ou complet du modèle, ex: "iPhone 15 Pro", "Galaxy S24"',
        },
        repair_type: {
          type:        'string',
          description: 'Type de réparation : ecran, batterie, connecteur, diagnostic, camera, autre',
        },
      },
    },
  },
  {
    name: 'search_shop_products',
    description:
      'Recherche des produits dans le shop ClikClak (smartphones occasion/neuf, pièces, accessoires). ' +
      'Utiliser pour toute question sur les produits disponibles.',
    input_schema: {
      type:       'object' as const,
      properties: {
        query: {
          type:        'string',
          description: 'Terme de recherche pour le produit, ex: "iPhone 15 Pro", "coque", "batterie iPhone"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_services',
    description:
      'Recherche des services et pages ClikClak (réparation, récupération données, rachat, etc.). ' +
      'Utiliser pour orienter vers la bonne page.',
    input_schema: {
      type:       'object' as const,
      properties: {
        query: {
          type:        'string',
          description: 'Service recherché, ex: "récupération données", "dépannage", "coursier"',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_contact_info',
    description: 'Retourne les informations de contact ClikClak (adresse, page contact, formulaire).',
    input_schema: {
      type:       'object' as const,
      properties: {},
    },
  },
]

/* ── Tool executors ─────────────────────────────────────────────── */

type ToolInput = Record<string, unknown>

export function executeTool(name: string, input: ToolInput): unknown {
  switch (name) {
    case 'search_repair_prices':
      return searchRepairPrices({
        brand:       input.brand       as string | undefined,
        modelQuery:  input.model_query as string | undefined,
        repairType:  input.repair_type as string | undefined,
      })

    case 'search_shop_products':
      return searchShopProducts((input.query as string) ?? '', 3)

    case 'search_services':
      return searchServices((input.query as string) ?? '', 4)

    case 'get_contact_info':
      return getContactInfo()

    default:
      return { error: `Outil inconnu : ${name}` }
  }
}
