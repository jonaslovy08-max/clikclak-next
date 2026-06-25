'use client'
/*
  components/admin/RepairModelSelector.tsx

  Nouveau parcours : Marque → boutons modèles groupés par famille.
  Le menu déroulant "famille" est supprimé.

  Après sélection d'une marque, tous ses modèles s'affichent immédiatement
  sous forme de boutons, regroupés par famille (section header).
  Une recherche filtre les boutons en temps réel.
  Le modèle actif est mis en évidence avec l'accent lime.
*/

import { useRouter }    from 'next/navigation'
import { useMemo, useState } from 'react'
import type { SelectorFamily, SelectorModel } from '@/lib/admin/queries'

interface BrandOption { internal_key: string; name: string }

interface Props {
  brands:        BrandOption[]
  allFamilies:   SelectorFamily[]
  allModels:     SelectorModel[]
  initialBrand:  string
  initialModel:  string   // slug du modèle actif
  baseUrl:       string
}

export function RepairModelSelector({
  brands, allFamilies, allModels,
  initialBrand, initialModel,
  baseUrl,
}: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  /* Modèles de la marque sélectionnée */
  const brandModels = useMemo(
    () => allModels.filter(m => m.brand_key === initialBrand),
    [allModels, initialBrand],
  )

  /* Filtre par recherche */
  const filteredModels = useMemo(() => {
    if (!search.trim()) return brandModels
    const q = search.toLowerCase()
    return brandModels.filter(m => m.name.toLowerCase().includes(q))
  }, [brandModels, search])

  /* Groupement par famille — dans l'ordre de sort_order des familles */
  const groups = useMemo(() => {
    const brandFamilies = allFamilies.filter(f => f.brand_key === initialBrand)
    return brandFamilies
      .map(f => ({
        family: f,
        models: filteredModels.filter(m => m.family_key === f.internal_key),
      }))
      .filter(g => g.models.length > 0)
  }, [allFamilies, filteredModels, initialBrand])

  function onBrand(brand: string) {
    if (!brand) { router.push(baseUrl); return }
    router.push(`${baseUrl}?brand=${brand}`)
  }

  function onModel(slug: string, brandKey: string) {
    const q = new URLSearchParams({ brand: brandKey, model: slug })
    router.push(`${baseUrl}?${q.toString()}`)
  }

  return (
    <div className="space-y-4">

      {/* ── Sélecteur de marque ────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wider">
            Marque
          </label>
          <select
            value={initialBrand}
            onChange={e => onBrand(e.target.value)}
            className="
              h-9 px-3 pr-8 rounded-btn
              bg-white/5 border border-white/12
              text-foreground text-sm font-rubik
              focus:outline-none focus:ring-2 focus:ring-accent/50
              transition-colors duration-220 cursor-pointer
            "
            aria-label="Sélectionner une marque"
          >
            <option value="">Toutes les marques</option>
            {brands.map(b => (
              <option key={b.internal_key} value={b.internal_key}>{b.name}</option>
            ))}
          </select>
        </div>

        {/* Recherche rapide */}
        {initialBrand && (
          <div className="flex flex-col gap-1">
            <label className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wider">
              Recherche
            </label>
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filtrer les modèles…"
              className="
                h-9 px-3 rounded-btn
                bg-white/5 border border-white/12
                text-foreground text-sm font-rubik
                placeholder:text-foreground/25
                focus:outline-none focus:ring-2 focus:ring-accent/50
                transition-colors duration-220
              "
              aria-label="Filtrer les modèles"
            />
          </div>
        )}
      </div>

      {/* ── État initial ──────────────────────────────────── */}
      {!initialBrand && (
        <p className="text-sm font-rubik text-foreground/25 py-4">
          Choisissez une marque pour afficher ses modèles.
        </p>
      )}

      {/* ── Grille de modèles groupés par famille ─────────── */}
      {initialBrand && groups.length === 0 && (
        <p className="text-sm font-rubik text-foreground/25 py-4">
          {search.trim()
            ? `Aucun résultat pour « ${search} ».`
            : 'Aucun modèle disponible pour cette marque.'}
        </p>
      )}

      {initialBrand && groups.length > 0 && (
        <div className="space-y-5">
          {groups.map(({ family, models }) => (
            <div key={family.internal_key}>
              {/* En-tête de famille */}
              <p className="text-[10px] font-rubik font-semibold text-foreground/30 uppercase tracking-wider mb-2">
                {family.name}
              </p>

              {/* Boutons de modèles */}
              <div className="flex flex-wrap gap-2">
                {models.map(m => {
                  const isActive = m.slug === initialModel
                  return (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => onModel(m.slug, m.brand_key)}
                      aria-pressed={isActive}
                      className={[
                        'px-3 py-1.5 rounded-btn text-sm font-rubik font-medium',
                        'border transition-colors duration-220',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
                        isActive
                          ? 'bg-accent text-primary-foreground border-accent'
                          : 'bg-white/5 text-foreground/70 border-white/10 hover:text-foreground hover:border-accent/50 hover:bg-accent/8',
                      ].join(' ')}
                    >
                      {m.name}
                      {m.status === 'inactive' && !isActive && (
                        <span className="ml-1.5 text-[9px] font-rubik font-normal text-sky-400/60 uppercase tracking-wide">
                          Brouillon
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
