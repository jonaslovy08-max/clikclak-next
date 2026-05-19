/* eslint-disable @next/next/no-img-element */
/*
  RepairEngagements — Section "Nos engagements" partagée entre les pages de réparation.
  Server component — pas d'interactivité.
  3 cartes : Express 20 min | Garanti 1 an | Technicien Pro
  Icônes : icon-fast-repair.svg | icon-check.svg | icon-repair-action.svg
*/

export default function RepairEngagements() {
  return (
    <section
      className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
      aria-label="Nos engagements"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

        {/* Titre */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          Nos{' '}
          <span className="text-accent">engagements</span>
        </h2>

        {/* 3 cartes */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">

          {/* Réparation express 20 minutes */}
          <div
            className="flex flex-col items-center gap-6 p-8 border border-[rgba(242,242,242,0.18)] bg-white/[0.02] text-center"
            style={{ borderRadius: 12 }}
          >
            <img
              src="/assets/icons/icon-fast-repair.svg"
              alt="" aria-hidden
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <div className="flex flex-col gap-3">
              <h3
                className="text-base md:text-lg font-light leading-snug"
                style={{ color: '#ededed' }}
              >
                Réparation express,<br />20 minutes
              </h3>
              <p
                className="text-sm font-light leading-relaxed"
                style={{ color: '#b4b4b4' }}
              >
                Réparations rapides de votre smartphone, sous réserve de pièce en stock votre appareil sera réparé en 20 minutes en moyenne.
              </p>
            </div>
          </div>

          {/* Garanti 1 an */}
          <div
            className="flex flex-col items-center gap-6 p-8 border border-[rgba(242,242,242,0.18)] bg-white/[0.02] text-center"
            style={{ borderRadius: 12 }}
          >
            <img
              src="/assets/ui/icon-check.svg"
              alt="" aria-hidden
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <div className="flex flex-col gap-3">
              <h3
                className="text-base md:text-lg font-light leading-snug"
                style={{ color: '#ededed' }}
              >
                Garanti 1 an
              </h3>
              <p
                className="text-sm font-light leading-relaxed"
                style={{ color: '#b4b4b4' }}
              >
                Jouissez d&apos;une garantie d&apos;1 an sur les pièces originales.<br />
                <span style={{ color: '#7a7a7a' }}>
                  (Hors batteries, consommables, qui sont garantis 3 mois tout comme les écrans génériques.)
                </span>
              </p>
            </div>
          </div>

          {/* Technicien Pro */}
          <div
            className="flex flex-col items-center gap-6 p-8 border border-[rgba(242,242,242,0.18)] bg-white/[0.02] text-center"
            style={{ borderRadius: 12 }}
          >
            <img
              src="/assets/ui/icon-repair-action.svg"
              alt="" aria-hidden
              style={{ width: 24, height: 24, objectFit: 'contain' }}
            />
            <div className="flex flex-col gap-3">
              <h3
                className="text-base md:text-lg font-light leading-snug"
                style={{ color: '#ededed' }}
              >
                Technicien Pro
              </h3>
              <p
                className="text-sm font-light leading-relaxed"
                style={{ color: '#b4b4b4' }}
              >
                Votre appareil est entre de bonnes mains. Nos techniciens formés réparent votre appareil avec un soin tout particulier.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
