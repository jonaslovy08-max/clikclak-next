'use client'
/*
  components/admin/RepairModelSelector.tsx

  Sélecteur en cascade Brand → Family → Model.
  Filtrage client-side sur le dataset complet (7 marques, 50 familles, 212 modèles).
  Met à jour les URL params sur chaque sélection.
*/

import { useRouter }    from 'next/navigation'
import { useMemo }      from 'react'
import type { SelectorFamily, SelectorModel } from '@/lib/admin/queries'

interface BrandOption { internal_key: string; name: string }

interface Props {
  brands:       BrandOption[]
  allFamilies:  SelectorFamily[]
  allModels:    SelectorModel[]
  initialBrand:  string
  initialFamily: string
  initialModel:  string   // slug
  baseUrl:       string
}

const selectClass = `
  h-9 px-3 pr-8 rounded-btn
  bg-white/5 border border-white/12
  text-foreground text-sm font-rubik
  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
  transition-colors duration-220 cursor-pointer
  disabled:opacity-40 disabled:cursor-default
`

export function RepairModelSelector({
  brands, allFamilies, allModels,
  initialBrand, initialFamily, initialModel,
  baseUrl,
}: Props) {
  const router = useRouter()

  const families = useMemo(
    () => allFamilies.filter(f => f.brand_key === initialBrand),
    [allFamilies, initialBrand],
  )

  const models = useMemo(
    () => allModels.filter(m => m.brand_key === initialBrand && m.family_key === initialFamily),
    [allModels, initialBrand, initialFamily],
  )

  function go(params: Record<string, string>) {
    const q = new URLSearchParams(params)
    router.push(`${baseUrl}?${q.toString()}`)
  }

  function onBrand(brand: string) {
    go(brand ? { brand } : {})
  }

  function onFamily(family: string) {
    go(family ? { brand: initialBrand, family } : { brand: initialBrand })
  }

  function onModel(slug: string) {
    if (!slug) { go({ brand: initialBrand, family: initialFamily }); return }
    const m = allModels.find(m => m.slug === slug)
    if (m) {
      go({ brand: m.brand_key, family: m.family_key, model: slug })
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Marque */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wider">
          Marque
        </label>
        <select
          value={initialBrand}
          onChange={e => onBrand(e.target.value)}
          className={selectClass}
          aria-label="Sélectionner une marque"
        >
          <option value="">Toutes les marques</option>
          {brands.map(b => (
            <option key={b.internal_key} value={b.internal_key}>{b.name}</option>
          ))}
        </select>
      </div>

      {/* Flèche */}
      {initialBrand && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-4 text-foreground/25 shrink-0" aria-hidden>
          <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Famille */}
      {initialBrand && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wider">
            Famille
          </label>
          <select
            value={initialFamily}
            onChange={e => onFamily(e.target.value)}
            className={selectClass}
            aria-label="Sélectionner une famille"
          >
            <option value="">Toutes les familles</option>
            {families.map(f => (
              <option key={f.internal_key} value={f.internal_key}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Flèche */}
      {initialFamily && (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="mt-4 text-foreground/25 shrink-0" aria-hidden>
          <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}

      {/* Modèle */}
      {initialFamily && (
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wider">
            Modèle
          </label>
          <select
            value={initialModel}
            onChange={e => onModel(e.target.value)}
            className={selectClass}
            aria-label="Sélectionner un modèle"
          >
            <option value="">— Choisir —</option>
            {models.map(m => (
              <option key={m.slug} value={m.slug}>{m.name}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}
