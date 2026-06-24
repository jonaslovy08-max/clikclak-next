'use client'
/*
  components/admin/FilterBar.tsx

  Barre de filtres/recherche pour les pages de listes admin.
  Client Component — met à jour les URL params en naviguant côté client.
*/

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback, useTransition } from 'react'

interface SelectOption {
  value: string
  label: string
}

interface FilterBarProps {
  searchPlaceholder?: string
  selects?: Array<{
    name:     string
    label:    string
    options:  SelectOption[]
  }>
}

export function FilterBar({ searchPlaceholder = 'Rechercher…', selects = [] }: FilterBarProps) {
  const router      = useRouter()
  const pathname    = usePathname()
  const params      = useSearchParams()
  const [, start]   = useTransition()

  const update = useCallback((name: string, value: string) => {
    start(() => {
      const next = new URLSearchParams(params.toString())
      if (value) {
        next.set(name, value)
      } else {
        next.delete(name)
      }
      next.delete('page') // reset pagination
      router.push(`${pathname}?${next.toString()}`)
    })
  }, [pathname, params, router])

  const inputClass = `
    h-9 px-3 rounded-btn
    bg-white/5 border border-white/10
    text-foreground/80 text-sm font-rubik
    placeholder:text-foreground/30
    focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50
    transition-colors duration-220
  `

  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      {/* Recherche texte */}
      <input
        type="search"
        placeholder={searchPlaceholder}
        defaultValue={params.get('search') ?? ''}
        onChange={e => update('search', e.target.value)}
        className={`${inputClass} min-w-[200px]`}
        aria-label={searchPlaceholder}
      />

      {/* Selects dynamiques */}
      {selects.map(sel => (
        <select
          key={sel.name}
          value={params.get(sel.name) ?? ''}
          onChange={e => update(sel.name, e.target.value)}
          className={`${inputClass} pr-7 cursor-pointer`}
          aria-label={sel.label}
        >
          <option value="">{sel.label} — tous</option>
          {sel.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  )
}
