/*
  app/admin/(dashboard)/layout.tsx

  Layout protégé des pages admin authentifiées.
  Accepte les rôles admin|editor|instagram_reviewer via requireInstagramAccess().

  Comportement selon le rôle :
  - admin|editor          : accès complet, sidebar complète.
  - instagram_reviewer    : redirigé vers /admin/integrations/instagram si la
    page demandée n'est pas dans la liste autorisée. Sidebar filtrée.

  Les pages individuelles (marques, modèles, réparations…) appellent
  requireAdminProfile() qui exclut instagram_reviewer, assurant une double
  protection même si le redirect du layout était contourné.
*/

import { headers }  from 'next/headers'
import { redirect } from 'next/navigation'
import { requireInstagramAccess } from '@/lib/admin/auth'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

/* Pages accessibles au rôle instagram_reviewer */
const INSTAGRAM_REVIEWER_ALLOWED = [
  '/admin/integrations/instagram',
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireInstagramAccess()

  /* Redirection du reviewer vers la seule page autorisée */
  if (profile.role === 'instagram_reviewer') {
    const headersList = await headers()
    const pathname    = headersList.get('x-pathname') ?? ''

    const allowed = INSTAGRAM_REVIEWER_ALLOWED.some(p => pathname.startsWith(p))
    if (!allowed) {
      redirect('/admin/integrations/instagram')
    }
  }

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
