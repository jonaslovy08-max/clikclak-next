/*
  app/admin/(dashboard)/layout.tsx

  Layout protégé des pages admin authentifiées.
  Vérifie la session et le profil admin côté serveur.
  Rend la sidebar et l'espace principal.
*/

import { requireAdminProfile } from '@/lib/admin/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireAdminProfile()

  return (
    <>
      <AdminSidebar profile={profile} />

      {/* Contenu principal — décalé de la largeur de la sidebar sur desktop */}
      <div className="lg:pl-60">
        {/* Espace pour la top bar mobile */}
        <div className="lg:hidden h-14" aria-hidden />

        <main className="min-h-screen p-6 lg:p-8">
          {children}
        </main>
      </div>
    </>
  )
}
