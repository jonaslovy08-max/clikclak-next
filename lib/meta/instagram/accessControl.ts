/*
  lib/meta/instagram/accessControl.ts

  Fonctions pures de contrôle d'accès pour le module Instagram.
  Pas de import "server-only" — importable par les tests tsx.

  IMPORTANT : ne jamais importer depuis un Client Component.
  lib/admin/auth.ts (server-only) est le point d'entrée de production.
*/

/** Rôles donnant accès à l'ensemble de l'interface admin. */
export const FULL_ADMIN_ROLES = ['admin', 'editor'] as const
export type FullAdminRole = typeof FULL_ADMIN_ROLES[number]

/** Rôles autorisés à accéder à l'intégration Instagram uniquement. */
export const INSTAGRAM_ROLES = ['admin', 'editor', 'instagram_reviewer'] as const
export type InstagramRole = typeof INSTAGRAM_ROLES[number]

/**
 * Retourne true si le rôle et le statut active autorisent l'accès
 * à la liste de rôles donnée.
 * Couvre : rôle null, rôle inconnu, active false/null.
 */
export function isAllowedRole(
  role:         string | null | undefined,
  active:       boolean | null | undefined,
  allowedRoles: readonly string[],
): boolean {
  if (!active) return false
  return allowedRoles.includes(role ?? '')
}

/** Vérifie l'accès complet admin (admin|editor). */
export function isFullAdminAllowed(
  role:   string | null | undefined,
  active: boolean | null | undefined,
): boolean {
  return isAllowedRole(role, active, FULL_ADMIN_ROLES)
}

/** Vérifie l'accès Instagram (admin|editor|instagram_reviewer). */
export function isInstagramAccessAllowed(
  role:   string | null | undefined,
  active: boolean | null | undefined,
): boolean {
  return isAllowedRole(role, active, INSTAGRAM_ROLES)
}

/** Éléments de navigation admin visibles par rôle. */
export function getVisibleAdminNavHrefs(role: string | null | undefined): string[] {
  const INSTAGRAM_NAV = ['/admin/integrations/instagram']
  const FULL_NAV = [
    '/admin',
    '/admin/marques',
    '/admin/modeles',
    '/admin/types-reparation',
    '/admin/reparations',
    '/admin/integrations/instagram',
  ]
  if (role === 'instagram_reviewer') return INSTAGRAM_NAV
  if (isFullAdminAllowed(role, true)) return FULL_NAV
  return []
}

/** Valide un UUID v4. */
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function isValidUuid(id: string): boolean {
  return UUID_RE.test(id)
}
