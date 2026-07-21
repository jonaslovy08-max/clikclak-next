/*
  CrawlableModelIndex — index de liens SEO vers les pages modèles.

  SERVER COMPONENT (pas de 'use client').
  But : rendre crawlables toutes les pages modèles d'une marque via de vrais
  <Link href> présents dans le HTML statique, SANS toucher au sélecteur client
  (dropdown + scroll GSAP), qui reste inchangé.

  - Réutilise les données déjà chargées par getPublicRepairBrand() : aucune
    requête Supabase supplémentaire.
  - basePath = brand.public_base_path (FR canonique). L'équivalent EN est
    résolu via getAlternatePath (i18n/routes.ts), mécanisme centralisé existant.
  - Aucun lien masqué (pas de display:none). Les modèles secondaires sont
    dans des <details> natifs, fermés par défaut : liens présents dans le HTML
    initial, sans JavaScript.
  - Chaque modèle apparaît une seule fois (populaires OU famille), déduplié par slug.
*/

import Link from 'next/link'
import { getAlternatePath } from '@/i18n/routes'
import type { PublicRepairBrand } from '@/lib/repair/publicCatalog'

interface Props {
  brandName:     string
  families:      PublicRepairBrand['families']
  /** Chemin de base FR canonique (brand.public_base_path), ex: /services/reparation-iphone */
  basePath:      string
  locale?:       'fr' | 'en'
  /** Nombre de modèles mis en avant dans la grille « populaires » */
  popularCount?: number
}

type ModelItem = { slug: string; name: string }
type FamilyBlock = { name: string; items: ModelItem[] }

export default function CrawlableModelIndex({
  brandName,
  families,
  basePath,
  locale = 'fr',
  popularCount = 8,
}: Props) {
  // Chemin de base localisé, sans slash final
  const rawBase = locale === 'en' ? getAlternatePath(basePath, 'en') : basePath
  const base = (rawBase ?? '').replace(/\/+$/, '')
  if (!base) return null

  // Familles triées par sort_order ; modèles triés par sort_order ; dédup par slug
  const seen = new Set<string>()
  const allItems: ModelItem[] = []
  const familyBlocks: FamilyBlock[] = []

  for (const fam of [...families].sort((a, b) => a.sort_order - b.sort_order)) {
    const items: ModelItem[] = []
    for (const m of [...fam.models].sort((a, b) => a.sort_order - b.sort_order)) {
      const slug = (m.slug ?? '').trim()
      const name = (m.name ?? '').trim()
      if (!slug || !name) continue        // ignore modèles sans slug ou sans nom
      if (seen.has(slug)) continue        // déduplication par slug
      seen.add(slug)
      const item = { slug, name }
      items.push(item)
      allItems.push(item)
    }
    if (items.length > 0) familyBlocks.push({ name: fam.name, items })
  }

  if (allItems.length === 0) return null

  // Populaires = N premiers dans l'ordre déterministe (familles récentes d'abord).
  const popular = allItems.slice(0, popularCount)
  const popularSlugs = new Set(popular.map(p => p.slug))

  // Chaque modèle une seule fois : les accordéons excluent les modèles populaires.
  const secondaryBlocks = familyBlocks
    .map(b => ({ name: b.name, items: b.items.filter(it => !popularSlugs.has(it.slug)) }))
    .filter(b => b.items.length > 0)

  const t = locale === 'en'
    ? {
        title:       `All ${brandName} models repaired in Lausanne`,
        intro:       'Select your model to view available repairs and prices.',
        navLabel:    `${brandName} models`,
        popular:     'Most requested models',
        anchor:      (name: string) => `${name} repair`,
        outro:       'Can’t find your model? Contact us for a diagnostic.',
        contactHref: '/en/contact',
        contactLbl:  'Contact',
        diagHref:    '/en/services/diagnostics',
        diagLbl:     'Diagnostic',
      }
    : {
        title:       `Tous les modèles ${brandName} réparés à Lausanne`,
        intro:       'Sélectionnez votre modèle pour consulter les réparations et les tarifs disponibles.',
        navLabel:    `Modèles ${brandName}`,
        popular:     'Modèles les plus demandés',
        anchor:      (name: string) => `Réparation ${name}`,
        outro:       'Vous ne trouvez pas votre modèle ? Contactez-nous pour un diagnostic.',
        contactHref: '/contact-clik-clak-lausanne',
        contactLbl:  'Contact',
        diagHref:    '/services/diagnostic',
        diagLbl:     'Diagnostic',
      }

  const modelHref = (slug: string) => `${base}/${slug}`

  return (
    <section
      aria-labelledby="all-models-title"
      className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

        <div className="flex flex-col gap-2">
          <h2
            id="all-models-title"
            className="text-[1.5rem] md:text-[2rem] font-light leading-tight"
          >
            {t.title}
          </h2>
          <p className="font-light text-sm" style={{ color: '#909090' }}>
            {t.intro}
          </p>
        </div>

        <nav aria-label={t.navLabel} className="flex flex-col gap-6">

          {/* Modèles les plus demandés */}
          <div className="flex flex-col gap-3">
            <h3
              className="text-xs font-rubik font-semibold uppercase tracking-wider"
              style={{ color: 'rgba(242,242,242,0.5)' }}
            >
              {t.popular}
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-1">
              {popular.map(it => (
                <li key={it.slug}>
                  <Link
                    href={modelHref(it.slug)}
                    className="block text-sm font-light py-1.5 hover:text-accent transition-colors"
                    style={{ color: '#b0b0b0' }}
                  >
                    {t.anchor(it.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Autres modèles — accordéons natifs fermés par défaut, sans JS */}
          {secondaryBlocks.length > 0 && (
            <div className="flex flex-col">
              {secondaryBlocks.map(block => (
                <details key={block.name} className="border-t border-white/[0.08]">
                  <summary
                    className="cursor-pointer py-3 text-sm font-light select-none marker:text-accent"
                    style={{ color: '#c8c8c8' }}
                  >
                    {block.name}
                  </summary>
                  <ul className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 pb-4 pt-1">
                    {block.items.map(it => (
                      <li key={it.slug}>
                        <Link
                          href={modelHref(it.slug)}
                          className="block text-sm font-light py-1 hover:text-accent transition-colors"
                          style={{ color: '#909090' }}
                        >
                          {t.anchor(it.name)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </details>
              ))}
            </div>
          )}
        </nav>

        <p className="font-light text-sm" style={{ color: '#909090' }}>
          {t.outro}{' '}
          <Link href={t.contactHref} className="text-accent hover:underline">
            {t.contactLbl}
          </Link>
          {' · '}
          <Link href={t.diagHref} className="text-accent hover:underline">
            {t.diagLbl}
          </Link>
        </p>

      </div>
    </section>
  )
}
