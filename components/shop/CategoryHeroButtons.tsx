'use client'

import { Button } from '@/components/ui/Button'

/*
  3 boutons de catégorie pour le hero shop.
  Au clic : dispatche un CustomEvent lu par ShopProductBrowser,
  qui met à jour son filtre actif et scrolle vers #produits.
*/

const BTNS = [
  { cat: 'occasion-neuf',      label: 'Occasion / neuf'     },
  { cat: 'pieces-detachees',   label: 'Pièces détachées'    },
  { cat: 'accessoires-autres', label: 'Accessoires / autres' },
] as const

export default function CategoryHeroButtons() {
  const handleClick = (cat: string) => {
    window.dispatchEvent(
      new CustomEvent('shop-set-category', { detail: { cat } })
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      {BTNS.map(({ cat, label }) => (
        <Button
          key={cat}
          size="lg"
          onClick={() => handleClick(cat)}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}
