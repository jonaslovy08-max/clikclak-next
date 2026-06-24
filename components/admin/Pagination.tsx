/*
  components/admin/Pagination.tsx

  Contrôles de pagination basés sur les URL params.
  Server Component — les liens modifient les search params.
*/

import Link from 'next/link'

interface PaginationProps {
  page:       number
  pageSize:   number
  total:      number
  baseUrl:    string           // ex: '/admin/reparations'
  searchParams?: Record<string, string>
}

function buildUrl(
  base: string,
  params: Record<string, string>,
  page: number,
): string {
  const p = new URLSearchParams({ ...params, page: String(page) })
  return `${base}?${p.toString()}`
}

export function Pagination({ page, pageSize, total, baseUrl, searchParams = {} }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to   = Math.min(page * pageSize, total)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { page: _page, ...rest } = searchParams

  const prevUrl = page > 1          ? buildUrl(baseUrl, rest, page - 1) : null
  const nextUrl = page < totalPages  ? buildUrl(baseUrl, rest, page + 1) : null

  const linkClass = (disabled: boolean) => [
    'px-3 py-1.5 rounded-btn text-sm font-rubik',
    'border border-white/10',
    'transition-colors duration-220',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60',
    disabled
      ? 'text-foreground/20 cursor-not-allowed pointer-events-none bg-transparent'
      : 'text-foreground/70 hover:text-foreground hover:bg-white/5 hover:border-white/20',
  ].join(' ')

  return (
    <nav
      className="flex items-center justify-between gap-4 pt-4 border-t border-white/8 mt-4"
      aria-label="Pagination"
    >
      <p className="text-xs font-rubik text-foreground/35">
        {from}–{to} sur {total.toLocaleString('fr-CH')} résultats
      </p>

      <div className="flex items-center gap-2">
        {prevUrl ? (
          <Link href={prevUrl} className={linkClass(false)} aria-label="Page précédente">
            ← Précédent
          </Link>
        ) : (
          <span className={linkClass(true)} aria-disabled="true">← Précédent</span>
        )}

        <span className="text-xs font-rubik text-foreground/35 px-2">
          {page} / {totalPages}
        </span>

        {nextUrl ? (
          <Link href={nextUrl} className={linkClass(false)} aria-label="Page suivante">
            Suivant →
          </Link>
        ) : (
          <span className={linkClass(true)} aria-disabled="true">Suivant →</span>
        )}
      </div>
    </nav>
  )
}
