/*
  lib/migration/repairMigrationTypes.ts

  Types du plan de migration des données de réparation vers Supabase.
  Aucun UUID généré ici — les relations utilisent des internal_key stables.
  Le script d'exécution réelle résoudra les UUIDs lors de l'écriture.
*/

/* ── Modes et statuts ─────────────────────────────────────────── */

export type PricingMode  = 'fixed' | 'on_request' | 'quote'
export type Availability = 'available' | 'on_request' | 'unavailable'
export type Status       = 'active' | 'inactive' | 'archived'
export type RepairCat    = 'screen' | 'battery' | 'other'

/* ── Entités du plan ─────────────────────────────────────────── */

export interface PlannedBrand {
  internal_key:         string
  name:                 string
  slug:                 string
  h1_prefix:            string
  h1_brand:             string
  brand_icon:           string | null
  breadcrumb_label:     string
  breadcrumb_href:      string
  public_base_path:     string           // route publique racine unique
  default_model_slug:   string | null
  initial_family_count: number | null
  repair_note:          string | null
  search_placeholder:   string | null
  status:               Status
  sort_order:           number
}

export interface PlannedDeviceCategory {
  internal_key: string
  name:         string
  slug:         string
  status:       Status
  sort_order:   number
}

export interface PlannedDeviceFamily {
  brand_internal_key: string
  internal_key:       string             // unique dans le périmètre de la marque
  name:               string
  short_label:        string
  button_prefix:      string | null
  status:             Status
  sort_order:         number
}

export interface PlannedDeviceModel {
  family_internal_key:   string
  brand_internal_key:    string
  category_internal_key: string
  internal_key:          string          // globalement unique : "brandKey:modelId"
  name:                  string
  slug:                  string          // = identifiant public URL (inchangé)
  legacy_slug:           string          // = slug source au moment de la migration
  status:                Status
  sort_order:            number
}

export interface PlannedRepairType {
  internal_key: string                   // déterministe depuis le label slugifié
  name:         string                   // label source exact (non fusionné)
  short_name:   string | null
  slug:         string
  category:     RepairCat
  description:  string | null
  status:       Status
  sort_order:   number
}

export interface PlannedRepairOffer {
  device_model_internal_key:  string
  repair_type_internal_key:   string
  variant_key:                string      // "standard" par défaut
  variant_name:               string | null
  subtitle:                   string | null  // sous-titre iPhone mainRepairs
  pricing_mode:               PricingMode
  price_cents:                number | null  // null pour on_request / quote
  currency:                   'CHF'
  availability:               Availability
  duration_minutes:           number | null
  warranty_months:            number | null
  public_note:                string | null
  internal_note:              string | null  // note si prix spécial signalé
  status:                     Status
  sort_order:                 number
}

/* ── Issues (erreurs et avertissements) ──────────────────────── */

export type IssueSeverity = 'error' | 'warning'

export interface MigrationIssue {
  severity:    IssueSeverity
  code:        string
  message:     string
  context?: {
    brand?:       string
    family?:      string
    model?:       string
    repair?:      string
    value?:       string
    detail?:      string
  }
}

/* ── Plan complet ────────────────────────────────────────────── */

export interface RepairMigrationPlan {
  brands:          PlannedBrand[]
  deviceCategories: PlannedDeviceCategory[]
  deviceFamilies:  PlannedDeviceFamily[]
  deviceModels:    PlannedDeviceModel[]
  repairTypes:     PlannedRepairType[]
  repairOffers:    PlannedRepairOffer[]
  warnings:        MigrationIssue[]
  errors:          MigrationIssue[]
  fingerprint:     string          // SHA-256 déterministe du plan sérialisé
}

/* ── Résultat de conversion de prix ──────────────────────────── */

export interface PriceResult {
  mode:  PricingMode
  cents: number | null
}
