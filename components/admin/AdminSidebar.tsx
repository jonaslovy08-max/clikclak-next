'use client'
/*
  components/admin/AdminSidebar.tsx

  Sidebar de navigation admin.
  Fixe sur desktop, drawer sur mobile.
*/

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { AdminSignOutButton } from './AdminSignOutButton'
import type { AdminProfile } from '@/lib/admin/types'

interface NavItem {
  href:  string
  label: string
  icon:  React.ReactNode
}

function NavIcon({ d }: { d: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_ITEMS: NavItem[] = [
  {
    href:  '/admin',
    label: 'Tableau de bord',
    icon:  <NavIcon d="M2 2h5.5v5.5H2zM2 10.5h5.5V16H2zM10.5 2H16v5.5h-5.5zM10.5 10.5H16V16h-5.5z" />,
  },
  {
    href:  '/admin/marques',
    label: 'Marques',
    icon:  <NavIcon d="M9 1.5L2 5v8l7 3.5L16 13V5L9 1.5zM9 1.5V9M2 5l7 4M16 5l-7 4" />,
  },
  {
    href:  '/admin/modeles',
    label: 'Modèles',
    icon:  <NavIcon d="M3 4.5h12M3 9h12M3 13.5h7" />,
  },
  {
    href:  '/admin/types-reparation',
    label: 'Types de réparation',
    icon:  <NavIcon d="M9 2v14M5 6l4-4 4 4M5 12l4 4 4-4" />,
  },
  {
    href:  '/admin/reparations',
    label: 'Réparations',
    icon:  <NavIcon d="M2 4h14v10H2zM5 4V2M13 4V2M2 8h14" />,
  },
]

interface Props {
  profile: AdminProfile
}

export function AdminSidebar({ profile }: Props) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  function isActive(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  const sidebarContent = (
    <div className="flex flex-col h-full py-6">

      {/* Logo */}
      <div className="px-4 mb-8">
        <Link href="/admin" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-accent font-rubik font-bold text-lg tracking-tight">ClikClak</span>
          <span className="text-foreground/30 font-rubik text-xs font-medium uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 space-y-0.5" aria-label="Navigation admin">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={[
              'flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm font-rubik',
              'transition-colors duration-220',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
              isActive(item.href)
                ? 'text-accent bg-accent/10 border-l-2 border-accent font-medium'
                : 'text-foreground/55 hover:text-foreground hover:bg-white/5 border-l-2 border-transparent',
            ].join(' ')}
          >
            <span className="shrink-0">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Badge lecture seule — editor uniquement */}
      {profile.role === 'editor' && (
        <div className="px-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-btn bg-white/4 border border-white/8">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground/25 shrink-0" aria-hidden />
            <span className="text-xs font-rubik text-foreground/40">Lecture seule</span>
          </div>
        </div>
      )}

      {/* Profil + déconnexion */}
      <div className="px-2 border-t border-white/8 pt-4 space-y-1">
        <div className="px-3 py-2">
          <p className="text-xs font-rubik text-foreground/35 truncate">{profile.email}</p>
          <span className={[
            'inline-block mt-1 px-1.5 py-0.5 rounded-badge text-[10px] font-rubik font-medium uppercase tracking-wide',
            profile.role === 'admin'
              ? 'bg-accent/15 text-accent'
              : 'bg-white/10 text-foreground/50',
          ].join(' ')}>
            {profile.role}
          </span>
        </div>
        <AdminSignOutButton />
      </div>

    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-[#111111] border-r border-white/8 z-40"
        aria-label="Barre de navigation admin"
      >
        {sidebarContent}
      </aside>

      {/* Mobile — bouton burger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center h-14 px-4 bg-[#111111] border-b border-white/8">
        <button
          onClick={() => setMobileOpen(prev => !prev)}
          className="p-2 rounded-btn text-foreground/60 hover:text-foreground hover:bg-white/5 transition-colors"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          aria-expanded={mobileOpen}
          aria-controls="mobile-sidebar"
        >
          {mobileOpen ? (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          )}
        </button>
        <Link href="/admin" className="flex items-center gap-2 ml-3">
          <span className="text-accent font-rubik font-bold text-base tracking-tight">ClikClak</span>
          <span className="text-foreground/30 font-rubik text-xs font-medium uppercase tracking-widest">Admin</span>
        </Link>
      </div>

      {/* Mobile — drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside
            id="mobile-sidebar"
            className="lg:hidden fixed inset-y-0 left-0 w-72 bg-[#111111] border-r border-white/8 z-50"
          >
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  )
}
