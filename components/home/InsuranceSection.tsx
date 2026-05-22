import Link from 'next/link'

/*
  InsuranceSection — Assurance & devis.
  Section homepage : attestations et devis pour compagnies d'assurance.
  Server component — aucun hook.
*/

const PRICES = [
  { device: 'Smartphone',         price: 'CHF 40.–' },
  { device: 'Tablette',           price: 'CHF 50.–' },
  { device: 'Ordinateur / MacBook', price: 'CHF 60.–' },
] as const

export default function InsuranceSection() {
  return (
    <section
      id="assurance-devis"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Devis et attestations pour assurance"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 items-start">

        {/* ── Texte ── */}
        <div className="flex-1 flex flex-col gap-5">

          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Assurance <span className="text-accent">&amp; devis</span>
          </h2>

          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/70">
            Après un dommage, ClikClak peut établir une attestation ou un devis écrit pour votre compagnie d&apos;assurance.
          </p>

          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
            Passez simplement en magasin avec votre appareil. Nous contrôlons son état réel, identifions la panne et préparons un document clair, utilisable pour votre dossier d&apos;assurance.
          </p>

          <p className="text-sm font-light leading-relaxed text-foreground/50">
            Le devis est facturé selon le type d&apos;appareil. Si la réparation est ensuite effectuée chez ClikClak, ce montant est déduit du total de la réparation.
          </p>

          <p
            className="text-sm font-light leading-relaxed pl-4 max-w-md"
            style={{ color: 'rgba(242,242,242,0.4)', borderLeft: '2px solid rgba(204,255,51,0.3)' }}
          >
            Le contrôle de l&apos;appareil en magasin est nécessaire pour établir un diagnostic précis et un devis conforme à la situation réelle.
          </p>

          <div className="mt-2">
            <Link
              href="/contact-clik-clak-lausanne"
              className="self-start inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-11 px-6 text-base"
            >
              Voir plus…
            </Link>
          </div>
        </div>

        {/* ── Tarifs ── */}
        <div
          className="w-full md:w-[38%] shrink-0 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          {/* En-tête */}
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid rgba(242,242,242,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <p className="text-xs font-light tracking-wide" style={{ color: 'rgba(204,255,51,0.7)' }}>
              Tarif du devis par type d&apos;appareil
            </p>
          </div>

          {/* Lignes */}
          <div className="flex flex-col">
            {PRICES.map((item, idx) => (
              <div
                key={item.device}
                className="flex items-center justify-between px-6 py-4"
                style={idx > 0 ? { borderTop: '1px solid rgba(242,242,242,0.07)' } : undefined}
              >
                <span className="text-base font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>
                  {item.device}
                </span>
                <span className="text-xl font-light" style={{ color: '#ccff33' }}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          {/* Note bas de card */}
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid rgba(242,242,242,0.08)' }}
          >
            <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.35)' }}>
              Montant déduit du total si la réparation est réalisée chez ClikClak.
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
