type Props = {
  current:    number
  total:      number
  onDotClick: (index: number) => void
}

export default function HeroPagination({ current, total, onDotClick }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`Aller au slide ${i + 1}`}
          aria-current={i === current ? 'true' : undefined}
          onClick={() => onDotClick(i)}
          className="
            block h-[3px] rounded-full hero-pagination-dot
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
          "
          style={{
            width:      '48px',
            background: i === current ? '#ffffff' : 'rgba(255,255,255,0.3)',
          }}
        />
      ))}
    </div>
  )
}
