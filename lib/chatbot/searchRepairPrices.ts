import { iphoneModels } from '@/data/iphoneRepairs'

export type BrandKey = 'iphone' | 'samsung' | 'ipad' | 'macbook' | 'huawei' | 'oppo' | 'other'

export const BRAND_LABELS: Record<BrandKey, string> = {
  iphone:  'iPhone',
  samsung: 'Samsung',
  ipad:    'iPad',
  macbook: 'MacBook',
  huawei:  'Huawei',
  oppo:    'OPPO',
  other:   'Autre appareil',
}

export const BRAND_PAGE_HREFS: Record<BrandKey, string> = {
  iphone:  '/services/reparation-iphone',
  samsung: '/services/reparation-samsung-lausanne',
  ipad:    '/services/reparation-ipad',
  macbook: '/services/reparation-macbook',
  huawei:  '/services/reparation-huawei-lausanne',
  oppo:    '/services/reparation-oppo',
  other:   '/reparation-smartphone-express',
}

export interface ModelResult {
  id:    string
  label: string
  brand: BrandKey
  href:  string
}

export interface RepairResult {
  label: string
  price: string
}

function norm(s: string): string {
  return s.toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
}

export function searchIphoneModels(query: string, limit = 8): ModelResult[] {
  const q = norm(query)
  return iphoneModels
    .filter(m => !q || norm(m.label).includes(q))
    .slice(0, limit)
    .map(m => ({
      id:    m.id,
      label: m.label,
      brand: 'iphone' as BrandKey,
      href:  `/services/reparation-iphone/${m.id}`,
    }))
}

export function getIphoneRepairs(modelId: string): RepairResult[] {
  const model = iphoneModels.find(m => m.id === modelId)
  if (!model) return []
  return [
    ...model.mainRepairs.map(r => ({ label: r.name, price: r.price })),
    ...model.otherRepairs.map(r => ({ label: r.name, price: r.price })),
  ]
}
