/*
  components/admin/StatCard.tsx

  Carte de statistique pour le tableau de bord.
  Server Component.
*/

interface StatCardProps {
  label:     string
  value:     number | string
  accent?:   boolean
  sublabel?: string
}

export function StatCard({ label, value, accent, sublabel }: StatCardProps) {
  return (
    <div className="bg-white/[0.04] border border-white/8 rounded-card p-5 flex flex-col gap-2">
      <span className="text-xs font-rubik font-medium text-foreground/45 uppercase tracking-wide">
        {label}
      </span>
      <span className={[
        'text-3xl font-rubik font-bold tabular-nums',
        accent ? 'text-accent' : 'text-foreground',
      ].join(' ')}>
        {typeof value === 'number' ? value.toLocaleString('fr-CH') : value}
      </span>
      {sublabel && (
        <span className="text-xs font-rubik text-foreground/30">{sublabel}</span>
      )}
    </div>
  )
}
