/*
  components/admin/PriceDisplay.tsx

  Affiche un prix ou un statut tarifaire admin.
  Server Component.
*/

interface PriceDisplayProps {
  pricingMode:  string
  priceCents:   number | null
  availability: string
  currency?:    string
  publicNote?:  string | null
}

function fmtCents(cents: number): string {
  const full = Math.trunc(cents / 100)
  const frac = cents % 100
  if (frac === 0) return `CHF ${full}.–`
  return `CHF ${full}.${String(frac).padStart(2, '0')}`
}

export function PriceDisplay({
  pricingMode,
  priceCents,
  availability,
  publicNote,
}: PriceDisplayProps) {
  if (availability === 'unavailable') {
    return (
      <span className="inline-flex flex-col gap-0.5">
        <span className="text-xs font-rubik font-medium text-red-400 bg-red-400/10 border border-red-400/20 px-2 py-0.5 rounded-badge">
          Indisponible
        </span>
        {publicNote && (
          <span className="text-[11px] font-rubik text-foreground/35 italic">{publicNote}</span>
        )}
      </span>
    )
  }

  if (pricingMode === 'fixed' && priceCents !== null) {
    return (
      <span className="text-sm font-rubik font-medium text-foreground tabular-nums">
        {fmtCents(priceCents)}
      </span>
    )
  }

  if (pricingMode === 'on_request') {
    return (
      <span className="text-xs font-rubik text-foreground/55 bg-white/6 px-2 py-0.5 rounded-badge">
        Sur demande
      </span>
    )
  }

  if (pricingMode === 'quote') {
    return (
      <span className="text-xs font-rubik text-foreground/55 bg-white/6 px-2 py-0.5 rounded-badge">
        Sur devis
      </span>
    )
  }

  return <span className="text-foreground/30 text-xs font-rubik">—</span>
}
