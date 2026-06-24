/*
  app/admin/(dashboard)/page.tsx → /admin

  Tableau de bord admin avec compteurs réels depuis Supabase.
*/

import type { Metadata } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { getDashboardStats } from '@/lib/admin/queries'
import { StatCard } from '@/components/admin/StatCard'

export const metadata: Metadata = { title: 'Tableau de bord' }

export default async function AdminDashboardPage() {
  const supabase = await createSupabaseServerClient()
  const stats    = await getDashboardStats(supabase)

  const priceTotal = stats.fixed + stats.on_request + stats.quote + stats.unavailable

  return (
    <div className="space-y-8">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-rubik font-bold text-foreground">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm font-rubik text-foreground/40">
          Vue d&apos;ensemble du catalogue réparations ClikClak
        </p>
      </div>

      {/* Alerte lecture seule */}
      <div className="flex items-start gap-3 p-4 rounded-card bg-amber-400/5 border border-amber-400/20">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden className="shrink-0 mt-0.5">
          <path d="M9 2L16 15H2L9 2z" stroke="#fbbf24" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M9 7v4M9 13h.01" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <div>
          <p className="text-sm font-rubik font-medium text-amber-300">
            Mode lecture seule — Phase 2A
          </p>
          <p className="text-xs font-rubik text-foreground/40 mt-0.5">
            Aucune modification des données n&apos;est possible dans cette phase.
            Les prix affichés proviennent directement de Supabase.
          </p>
        </div>
      </div>

      {/* Catalogue */}
      <section aria-labelledby="catalogue-heading">
        <h2
          id="catalogue-heading"
          className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3"
        >
          Catalogue
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Marques"         value={stats.brands}   />
          <StatCard label="Familles"         value={stats.families} />
          <StatCard label="Modèles"          value={stats.models}   />
          <StatCard label="Types"            value={stats.types}    />
          <StatCard label="Offres"           value={stats.offers}   accent />
        </div>
      </section>

      {/* Prix */}
      <section aria-labelledby="prix-heading">
        <h2
          id="prix-heading"
          className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3"
        >
          Répartition des prix
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Prix fixes disponibles"
            value={stats.fixed}
            sublabel={priceTotal > 0 ? `${Math.round(stats.fixed / priceTotal * 100)} %` : undefined}
          />
          <StatCard
            label="Sur demande"
            value={stats.on_request}
            sublabel={priceTotal > 0 ? `${Math.round(stats.on_request / priceTotal * 100)} %` : undefined}
          />
          <StatCard
            label="Sur devis"
            value={stats.quote}
            sublabel={priceTotal > 0 ? `${Math.round(stats.quote / priceTotal * 100)} %` : undefined}
          />
          <StatCard
            label="Indisponibles"
            value={stats.unavailable}
            sublabel={priceTotal > 0 ? `${Math.round(stats.unavailable / priceTotal * 100)} %` : undefined}
          />
        </div>
      </section>

      {/* Liens rapides */}
      <section aria-labelledby="nav-heading">
        <h2
          id="nav-heading"
          className="text-xs font-rubik font-semibold text-foreground/35 uppercase tracking-wider mb-3"
        >
          Navigation rapide
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: '/admin/reparations',     label: 'Réparations',        sub: `${stats.offers} offres` },
            { href: '/admin/modeles',          label: 'Modèles',            sub: `${stats.models} modèles` },
            { href: '/admin/marques',          label: 'Marques',            sub: `${stats.brands} marques` },
            { href: '/admin/types-reparation', label: 'Types réparation',   sub: `${stats.types} types` },
          ].map(item => (
            <a
              key={item.href}
              href={item.href}
              className="
                flex flex-col gap-1 p-4 rounded-card
                bg-white/[0.04] border border-white/8
                hover:bg-white/[0.07] hover:border-white/15
                transition-colors duration-220
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
              "
            >
              <span className="text-sm font-rubik font-medium text-foreground">{item.label}</span>
              <span className="text-xs font-rubik text-foreground/35">{item.sub}</span>
            </a>
          ))}
        </div>
      </section>

    </div>
  )
}
