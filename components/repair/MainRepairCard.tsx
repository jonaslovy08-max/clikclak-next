/* eslint-disable @next/next/no-img-element */
/*
  MainRepairCard + MaskedIcon — composants partagés réparation.
  Utilisés sur :
    /services/reparation-iphone            (page sélection + tarifs)
    /services/reparation-iphone/[modelSlug] (page dédiée par modèle)

  Server Component — aucun hook, aucun effet.
  Ne pas ajouter 'use client' : ces composants fonctionnent dans les deux contextes.
*/
import { stripCents } from '@/data/repairTypes'
import PriceInfoTooltip from '@/components/ui/PriceInfoTooltip'
import { getPricePrefix, getRepairLabel, type RepairLocale } from '@/i18n/repairLabels'

/* ── CSS mask-image — colorise un SVG asset sans filter ni opacity ──────── */
export function MaskedIcon({
  src,
  w,
  h,
  color,
  style: extraStyle,
}: {
  src:    string
  w:      number | string
  h:      number | string
  color:  string
  style?: React.CSSProperties
}) {
  const W = typeof w === 'number' ? `${w}px` : w
  const H = typeof h === 'number' ? `${h}px` : h
  return (
    <span
      aria-hidden="true"
      style={{
        display:            'inline-block',
        flexShrink:         0,
        width:              W,
        height:             H,
        backgroundColor:    color,
        maskImage:          `url('${src}')`,
        maskSize:           'contain',
        maskRepeat:         'no-repeat',
        maskPosition:       'center',
        WebkitMaskImage:    `url('${src}')`,
        WebkitMaskSize:     'contain',
        WebkitMaskRepeat:   'no-repeat',
        WebkitMaskPosition: 'center',
        ...extraStyle,
      }}
    />
  )
}

/* ── Carte réparation principale (Écran ou Batterie) ─────────────────────
   Écran   : fond #c8c8c8, icône screen (mask dark), prix lime sur fond sombre.
   Batterie: fond #2a2a2a, icône battery lime native, même structure prix.     */
export function MainRepairCard({
  repair,
  modelLabel,
  variant,
  locale,
}: {
  repair:     { name: string; subtitle: string; price: string }
  modelLabel: string
  variant:    'screen' | 'battery'
  locale?:    RepairLocale
}) {
  const effectiveLocale: RepairLocale = locale ?? 'fr'
  const isScreen = variant === 'screen'

  return (
    <div
      className="flex flex-col"
      style={{
        backgroundColor: isScreen ? '#c8c8c8' : '#2a2a2a',
        border:          `1px solid ${isScreen ? 'rgba(0,0,0,0.08)' : 'rgba(242,242,242,0.08)'}`,
        borderRadius:    12,
        /* overflow: hidden retiré — PriceInfoTooltip doit pouvoir dépasser vers le haut */
        position:        'relative',
      }}
    >
      {/* ── Ligne principale ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-5 py-4 flex-1">
        <div className="flex items-center gap-4 flex-1" style={{ minWidth: 160 }}>
          <div style={{ width: 36, height: isScreen ? 48 : 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isScreen ? (
              <MaskedIcon src="/assets/icons/icon-screen-repair_2.svg" w={36} h={48} color="#1a1a1a" />
            ) : (
              <img src="/assets/icons/icon_battery_change.svg" alt="" aria-hidden style={{ height: 36, width: 36, objectFit: 'contain' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold leading-tight" style={{ fontSize: 'clamp(20px, 2.8vw, 34px)', color: isScreen ? '#1a1a1a' : '#b4b4b4' }}>
              {getRepairLabel(repair.name, effectiveLocale)}
            </p>
            <p className="font-light" style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: isScreen ? '#5a5a5a' : '#b4b4b4' }}>
              {getPricePrefix(effectiveLocale)}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center shrink-0 px-5 py-3" style={{ backgroundColor: '#141414', minWidth: 'clamp(80px, 8vw, 120px)', borderRadius: 10 }}>
          <span className="font-semibold text-accent whitespace-nowrap" style={{ fontSize: 'clamp(16px, 1.8vw, 24px)' }}>
            {stripCents(repair.price)}
          </span>
        </div>
      </div>

      {/* ── Ligne de détail bas ── */}
      <div
        className="flex items-center justify-between px-5 py-3 gap-3"
        style={{
          borderTop:            `1px solid ${isScreen ? 'rgba(0,0,0,0.12)' : 'rgba(242,242,242,0.1)'}`,
          backgroundColor:      isScreen ? 'rgba(0,0,0,0.07)' : 'rgba(0,0,0,0.3)',
          /* border-radius bas pour compenser la suppression de overflow:hidden sur le parent */
          borderBottomLeftRadius:  12,
          borderBottomRightRadius: 12,
        }}
      >
        <div className="flex items-center gap-4 min-w-0">
          <div style={{ width: 36, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/assets/ui/icon-repair-action.svg" alt="" aria-hidden style={{ height: 26, width: 26, objectFit: 'contain' }} />
          </div>
          <div className="min-w-0">
            <p className="font-light leading-tight" style={{ fontSize: 'clamp(13px, 1.3vw, 18px)', color: isScreen ? '#1a1a1a' : '#b4b4b4' }}>
              {getRepairLabel(repair.subtitle, effectiveLocale)}
            </p>
            <p className="font-light" style={{ fontSize: 'clamp(13px, 1.3vw, 18px)', color: isScreen ? '#1a1a1a' : '#b4b4b4' }}>
              {modelLabel}
            </p>
          </div>
        </div>
        <PriceInfoTooltip isScreen={isScreen} locale={effectiveLocale} />
      </div>
    </div>
  )
}
