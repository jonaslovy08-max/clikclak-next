import { cn } from '@/lib/utils'

type SignatureLoaderProps = {
  className?: string
  width?:     number | string
  height?:    number | string
  'aria-label'?: string
}

/**
 * SignatureLoader — version animée du brand mark ClikClak.
 *
 * Technique : tracé progressif des contours par stroke-dashoffset (CSS pur).
 *   - .svg-elem-1 : wrench-bottom — grand tracé principal (lime)
 *   - .svg-elem-2 : wrench-bottom — trait horizontal (lime)
 *   - .svg-elem-3 : wrench-top   — grand tracé principal (blanc)
 *   - .svg-elem-4 : wrench-top   — trait horizontal (blanc)
 *   - .svg-elem-5 : wrench-top   — point terminal (blanc)
 *
 * Longueurs des tracés (mesurées par SVG Artista) :
 *   elem-1 : 936.32px  |  elem-2 : 53.07px  |  elem-3 : 936.31px
 *   elem-4 : 27.97px   |  elem-5 : 2px
 *
 * Réglages dans globals.css, section "Animation — SignatureLoader".
 * Server Component — zéro JS client.
 * prefers-reduced-motion : traits affichés immédiatement sans animation.
 *
 * SVG source validée : public/assets/animation/signature-wrench-phone.svg
 * Ne pas modifier le dessin ni les paths — voir docs/design/assets-guidelines.md
 */
export function SignatureLoader({
  className,
  width,
  height,
  'aria-label': ariaLabel = 'ClikClak Repair',
}: SignatureLoaderProps) {
  return (
    <svg
      id="signature-wrench-phone"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 263.1 666.63"
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
      aria-label={ariaLabel}
      role="img"
    >
      <defs>
        <style>{`
          .st0 { stroke: #cf3; }
          .st0, .st1, .st2 {
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
            stroke-width: 3.5px;
          }
          .st1, .st2 { stroke: #fff; }
        `}</style>
      </defs>

      <g id="wrench-bottom">
        <path className="st0 svg-elem-1" d="M44.52,513.34c-48.1-48.1-48.1-126.1,0-174.21.37-.37.75-.74,1.12-1.11,10.78-10.51,28.98-2.51,28.98,12.54v72.89c0,9.49,7.69,17.18,17.18,17.18h79.58c9.49,0,17.18-7.69,17.18-17.18v-72.88c0-15.35,18.48-22.89,29.41-12.12,2.93,2.89,5.75,5.95,8.45,9.17,37.32,44.68,37.67,111.01.89,156.14-18.6,22.82-43.22,37.08-69.34,42.77h-.43v114.14" />
        <line className="st0 svg-elem-2" x1="106.01" y1="418.1" x2="157.08" y2="418.1" />
      </g>

      <g id="wrench-top">
        <path className="st2 svg-elem-3" d="M218.57,153.29c48.1,48.1,48.1,126.1,0,174.21-.37.37-.75.74-1.12,1.11-10.78,10.51-28.98,2.51-28.98-12.54v-72.89c0-9.49-7.69-17.18-17.18-17.18h-79.58c-9.49,0-17.18,7.69-17.18,17.18v72.88c0,15.35-18.48,22.89-29.41,12.12-2.93-2.89-5.75-5.95-8.45-9.17C-.64,274.32-.99,208,35.79,162.87c18.6-22.82,43.22-37.08,69.34-42.77h.43V5.96" />
        <line className="st2 svg-elem-4" x1="109.86" y1="248.21" x2="135.83" y2="248.21" />
        <line className="st1 svg-elem-5" x1="155.73" y1="248.21" x2="155.73" y2="248.21" />
      </g>
    </svg>
  )
}
