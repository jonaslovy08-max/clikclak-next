import Link from 'next/link'

const PRICES = [
  { device: 'Smartphone',           deviceEn: 'Smartphone',             price: 'CHF 40.–' },
  { device: 'Tablette',             deviceEn: 'Tablet',                 price: 'CHF 50.–' },
  { device: 'Ordinateur / MacBook', deviceEn: 'Computer / MacBook',     price: 'CHF 60.–' },
] as const

const STRINGS = {
  fr: {
    sectionLabel: 'Devis et attestations pour assurance',
    h2a: 'Assurance',
    h2b: '& devis',
    p1: 'Après un dommage, ClikClak peut établir une attestation ou un devis écrit pour votre compagnie d\'assurance.',
    p2: 'Passez simplement en magasin avec votre appareil. Nous contrôlons son état réel, identifions la panne et préparons un document clair, utilisable pour votre dossier d\'assurance.',
    p3: 'Le devis est facturé selon le type d\'appareil. Si la réparation est ensuite effectuée chez ClikClak, ce montant est déduit du total de la réparation.',
    p4: 'Le contrôle de l\'appareil en magasin est nécessaire pour établir un diagnostic précis et un devis conforme à la situation réelle.',
    cta: 'Voir plus…',
    ctaHref: '/contact-clik-clak-lausanne',
    tableLabel: 'Tarif du devis par type d\'appareil',
    tableNote: 'Montant déduit du total si la réparation est réalisée chez ClikClak.',
  },
  en: {
    sectionLabel: 'Insurance quotes and certificates',
    h2a: 'Insurance',
    h2b: '& quotes',
    p1: 'After damage, ClikClak can issue a written certificate or quote for your insurance company.',
    p2: 'Simply bring your device to the store. We check its actual condition, identify the issue and prepare a clear document for your insurance file.',
    p3: 'The quote is charged based on the device type. If the repair is then carried out at ClikClak, this amount is deducted from the total repair cost.',
    p4: 'An in-store device inspection is required to establish an accurate diagnosis and a quote that reflects the actual situation.',
    cta: 'Learn more…',
    ctaHref: '/en/contact',
    tableLabel: 'Quote fee by device type',
    tableNote: 'Amount deducted from total if repair is carried out at ClikClak.',
  },
} as const

export default function InsuranceSection({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const T = STRINGS[locale]
  return (
    <section
      id="assurance-devis"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label={T.sectionLabel}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-10 md:gap-16 items-start">

        {/* ── Texte ── */}
        <div className="flex-1 flex flex-col gap-5">

          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            {T.h2a} <span className="text-accent">{T.h2b}</span>
          </h2>

          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/70">
            {T.p1}
          </p>

          <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
            {T.p2}
          </p>

          <p className="text-sm font-light leading-relaxed text-foreground/50">
            {T.p3}
          </p>

          <p
            className="text-sm font-light leading-relaxed pl-4 max-w-md"
            style={{ color: 'rgba(242,242,242,0.4)', borderLeft: '2px solid rgba(204,255,51,0.3)' }}
          >
            {T.p4}
          </p>

          <div className="mt-2">
            <Link
              href={T.ctaHref}
              className="self-start inline-flex items-center justify-center gap-2 font-rubik font-medium leading-none whitespace-nowrap rounded-btn focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background shiny-cta shiny-cta-primary text-primary-foreground h-11 px-6 text-base"
            >
              {T.cta}
            </Link>
          </div>
        </div>

        {/* ── Tarifs ── */}
        <div
          className="w-full md:w-[38%] shrink-0 rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid rgba(242,242,242,0.08)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            <p className="text-xs font-light tracking-wide" style={{ color: 'rgba(204,255,51,0.7)' }}>
              {T.tableLabel}
            </p>
          </div>

          <div className="flex flex-col">
            {PRICES.map((item, idx) => (
              <div
                key={item.device}
                className="flex items-center justify-between px-6 py-4"
                style={idx > 0 ? { borderTop: '1px solid rgba(242,242,242,0.07)' } : undefined}
              >
                <span className="text-base font-light" style={{ color: 'rgba(242,242,242,0.75)' }}>
                  {locale === 'en' ? item.deviceEn : item.device}
                </span>
                <span className="text-xl font-light" style={{ color: '#ccff33' }}>
                  {item.price}
                </span>
              </div>
            ))}
          </div>

          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid rgba(242,242,242,0.08)' }}
          >
            <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.35)' }}>
              {T.tableNote}
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
