/*
  lib/admin/types.ts

  Types TypeScript pour l'interface admin.
  Uniquement utilisé côté serveur (Server Components, Server Actions, lib/admin/).
*/

export type AdminRole = 'admin' | 'editor'

export interface AdminProfile {
  id:    string
  email: string
  role:  AdminRole
}

export interface DashboardStats {
  brands:      number
  families:    number
  models:      number
  types:       number
  offers:      number
  fixed:       number
  on_request:  number
  quote:       number
  unavailable: number
}

export interface BrandRow {
  id:                  string
  internal_key:        string
  name:                string
  slug:                string
  h1_prefix:           string
  h1_brand:            string
  brand_icon:          string | null
  breadcrumb_label:    string
  public_base_path:    string
  status:              string
  sort_order:          number
  familyCount?:        number
  modelCount?:         number
}

export interface FamilyRow {
  id:                 string
  brand_id:           string
  brand_name:         string
  brand_internal_key: string
  internal_key:       string
  name:               string
  short_label:        string
  button_prefix:      string | null
  status:             string
  sort_order:         number
}

export interface ModelRow {
  id:                  string
  internal_key:        string
  name:                string
  slug:                string
  status:              string
  sort_order:          number
  family_name:         string
  brand_name:          string
  brand_internal_key:  string
  category_name:       string
  offerCount?:         number
}

export interface RepairTypeRow {
  id:           string
  internal_key: string
  name:         string
  short_name:   string | null
  slug:         string
  category:     string
  status:       string
  sort_order:   number
  offerCount?:  number
}

export interface OfferRow {
  id:                  string
  origin:              string   // 'import' | 'admin'
  variant_key:         string
  variant_name:        string | null
  subtitle:            string | null
  pricing_mode:        string
  price_cents:         number | null
  currency:            string
  availability:        string
  public_note:         string | null
  internal_note:       string | null
  duration_minutes?:   number | null
  warranty_months?:    number | null
  status:              string
  sort_order:          number
  model_name:          string
  model_internal_key:  string
  model_slug:          string
  family_name:         string
  brand_name:          string
  brand_internal_key:  string
  type_name:           string
  type_internal_key:   string
  type_category:       string
}

export interface PaginatedResult<T> {
  data:  T[]
  count: number
  page:  number
  pageSize: number
}
