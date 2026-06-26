/* eslint-disable @next/next/no-img-element */
/*
  RepairEngagements — Section "Our commitments / Nos engagements".
  Server component — pas d'interactivité.
  Supports locale prop: 'fr' | 'en'
*/

const STRINGS = {
  fr: {
    label:  'Nos engagements',
    h2a:    'Nos ',
    h2b:    'engagements',
    c1h:    ['Réparation express,', '20 minutes'],
    c1p:    'Réparations rapides de votre smartphone, sous réserve de pièce en stock votre appareil sera réparé en 20 minutes en moyenne.',
    c2h:    'Garanti 1 an',
    c2p:    "Jouissez d'une garantie d'1 an sur les pièces originales.",
    c2sub:  '(Hors batteries, consommables, qui sont garantis 3 mois tout comme les écrans génériques.)',
    c3h:    'Technicien Pro',
    c3p:    'Votre appareil est entre de bonnes mains. Nos techniciens formés réparent votre appareil avec un soin tout particulier.',
  },
  en: {
    label:  'Our commitments',
    h2a:    'Our ',
    h2b:    'commitments',
    c1h:    ['Express repair,', '20 minutes'],
    c1p:    'Fast smartphone repairs — subject to parts availability, most repairs are completed in 20 minutes on average.',
    c2h:    '1-year warranty',
    c2p:    'Enjoy a 1-year warranty on original parts.',
    c2sub:  '(Batteries and consumables are warranted for 3 months, as are generic screens.)',
    c3h:    'Expert technician',
    c3p:    'Your device is in good hands. Our trained technicians repair your device with great care.',
  },
} as const

interface Props { locale?: 'fr' | 'en' }

export default function RepairEngagements({ locale = 'fr' }: Props) {
  const T = STRINGS[locale]
  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
      aria-label={T.label}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          {T.h2a}<span className="text-accent">{T.h2b}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          {/* Card 1 */}
          <div className="flex flex-col items-center gap-6 p-8 border border-[rgba(242,242,242,0.18)] bg-white/[0.02] text-center" style={{ borderRadius: 12 }}>
            <img src="/assets/icons/icon-fast-repair.svg" alt="" aria-hidden style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <div className="flex flex-col gap-3">
              <h3 className="text-base md:text-lg font-light leading-snug" style={{ color: '#ededed' }}>
                {T.c1h[0]}<br />{T.c1h[1]}
              </h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: '#b4b4b4' }}>{T.c1p}</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col items-center gap-6 p-8 border border-[rgba(242,242,242,0.18)] bg-white/[0.02] text-center" style={{ borderRadius: 12 }}>
            <img src="/assets/ui/icon-check.svg" alt="" aria-hidden style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <div className="flex flex-col gap-3">
              <h3 className="text-base md:text-lg font-light leading-snug" style={{ color: '#ededed' }}>{T.c2h}</h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: '#b4b4b4' }}>
                {T.c2p}<br />
                <span style={{ color: '#7a7a7a' }}>{T.c2sub}</span>
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col items-center gap-6 p-8 border border-[rgba(242,242,242,0.18)] bg-white/[0.02] text-center" style={{ borderRadius: 12 }}>
            <img src="/assets/ui/icon-repair-action.svg" alt="" aria-hidden style={{ width: 24, height: 24, objectFit: 'contain' }} />
            <div className="flex flex-col gap-3">
              <h3 className="text-base md:text-lg font-light leading-snug" style={{ color: '#ededed' }}>{T.c3h}</h3>
              <p className="text-sm font-light leading-relaxed" style={{ color: '#b4b4b4' }}>{T.c3p}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
