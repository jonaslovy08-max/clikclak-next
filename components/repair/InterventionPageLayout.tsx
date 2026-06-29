/*
  InterventionPageLayout — structure commune aux pages d'intervention.
  Server Component.

  Pages utilisatrices :
    /services/reparation-ecran
    /services/changement-batterie
    /services/connecteur-de-charge
    /reparation-degat-eau-lausanne
    /services/diagnostic
    + équivalents EN
*/

import type React from 'react'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import SiteFooter from '@/components/home/SiteFooter'
import SectionPinning from '@/components/ui/SectionPinning'
import ContactPopover from '@/components/home/ContactPopover'
import RepairEngagements from '@/components/repair/RepairEngagements'
import InterventionDeviceSelector from '@/components/repair/InterventionDeviceSelector'
import FAQAccordion, { type FaqItem } from '@/components/repair/FAQAccordion'

interface HeroImage { src: string; mobileSrc?: string; alt: string }

interface Props {
  pill:               string
  h1:                 string
  intro:              string
  interventionItems:  string[]
  faqItems:           FaqItem[]
  note?:              string
  heroImage?:         HeroImage
  bottomSlot?:        React.ReactNode
  locale?:            'fr' | 'en'
}

const PROCESS_STEPS_FR = [
  { num: '01', title: 'Diagnostic ou confirmation', text: 'Nous vérifions l\'origine de la panne avant toute intervention.' },
  { num: '02', title: 'Devis selon modèle', text: 'Le tarif est communiqué selon votre modèle et la disponibilité des pièces.' },
  { num: '03', title: 'Intervention', text: 'La réparation est réalisée avec les précautions nécessaires.' },
  { num: '04', title: 'Test et restitution', text: 'L\'appareil est testé avant restitution.' },
]

const PROCESS_STEPS_EN = [
  { num: '01', title: 'Diagnostic / confirmation', text: 'We verify the cause of the issue before any intervention.' },
  { num: '02', title: 'Quote by model', text: 'The price is communicated based on your model and parts availability.' },
  { num: '03', title: 'Repair', text: 'The repair is carried out with the necessary care.' },
  { num: '04', title: 'Testing & return', text: 'The device is tested before handover.' },
]

const REASSURANCE_FR = [
  'Diagnostic clair avant intervention',
  'Réparation locale à Lausanne',
  'Garantie selon type de pièce',
  'Données à sauvegarder avant intervention',
  'Pièces selon disponibilité',
]

const REASSURANCE_EN = [
  'Clear diagnostic before intervention',
  'Local repair in Lausanne',
  'Warranty depending on part type',
  'Data should be backed up before intervention',
  'Parts subject to availability',
]

const STRINGS = {
  fr: {
    interventionTitle: 'Ce que comprend',
    interventionAccent: 'l\'intervention',
    processTitle: 'Comment se passe',
    processAccent: 'la réparation ?',
    processAriaLabel: 'Comment se passe la réparation',
    whyTitle: 'Pourquoi choisir',
    whyAccent: 'ClikClak ?',
    whyAriaLabel: 'Nos engagements',
    faqTitle: 'Questions',
    faqAccent: 'fréquentes',
    faqAriaLabel: 'Questions fréquentes',
    ctaTitle: 'Besoin d\'une',
    ctaAccent: 'réparation ?',
    ctaDesc: 'Identifiez votre modèle pour consulter le tarif adapté ou contactez-nous directement.',
    ctaAriaLabel: 'Demander une réparation',
    interventionAriaLabel: 'Ce que comprend l\'intervention',
  },
  en: {
    interventionTitle: 'What the repair',
    interventionAccent: 'includes',
    processTitle: 'How the repair',
    processAccent: 'works',
    processAriaLabel: 'How the repair works',
    whyTitle: 'Why choose',
    whyAccent: 'ClikClak?',
    whyAriaLabel: 'Our commitments',
    faqTitle: 'Frequently asked',
    faqAccent: 'questions',
    faqAriaLabel: 'Frequently asked questions',
    ctaTitle: 'Need a',
    ctaAccent: 'repair?',
    ctaDesc: 'Identify your model to check the right price, or contact us directly.',
    ctaAriaLabel: 'Request a repair',
    interventionAriaLabel: 'What the repair includes',
  },
} as const

export default function InterventionPageLayout({
  pill, h1, intro, interventionItems, faqItems, note, heroImage, bottomSlot, locale = 'fr',
}: Props) {
  const T = STRINGS[locale]
  const PROCESS_STEPS = locale === 'en' ? PROCESS_STEPS_EN : PROCESS_STEPS_FR
  const REASSURANCE   = locale === 'en' ? REASSURANCE_EN   : REASSURANCE_FR

  return (
    <>
      <Header locale={locale} />

      <main>

        {/* ══ HERO ════════════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-20 border-t border-white/10"
          aria-label={h1}
        >
          <div className={`w-full max-w-6xl mx-auto ${heroImage ? 'flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-center' : 'flex flex-col gap-8'}`}>

            {/* ── Texte ── */}
            <div className={heroImage ? 'flex-1 flex flex-col gap-6' : 'flex flex-col gap-8'}>
              {/* Pill active */}
              <div>
                <span
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-light"
                  style={{ border: '1px solid rgba(204,255,51,0.4)', backgroundColor: 'rgba(204,255,51,0.06)', color: '#ccff33' }}
                >
                  {pill}
                </span>
              </div>

              <h1 className="text-[2rem] md:text-[2.75rem] font-light leading-tight">
                {locale === 'en'
                  ? (h1.includes(' in Lausanne')
                      ? <>{h1.replace(' in Lausanne', '')} <span className="text-accent">in Lausanne</span></>
                      : h1
                    )
                  : (h1.includes('à Lausanne')
                      ? <>{h1.replace(' à Lausanne', '')} <span className="text-accent">à Lausanne</span></>
                      : h1
                    )
                }
              </h1>

              {/* Image mobile (si heroImage fournie) */}
              {heroImage && (
                <div className="block md:hidden -mx-6 w-screen overflow-hidden">
                  <Image
                    src={heroImage.mobileSrc ?? heroImage.src}
                    alt={heroImage.alt}
                    width={0} height={0} sizes="100vw"
                    className="w-full h-auto"
                  />
                </div>
              )}

              <p
                className="font-light leading-relaxed max-w-2xl"
                style={{ fontSize: 'clamp(15px, 1.5vw, 19px)', color: 'rgba(242,242,242,0.65)' }}
              >
                {intro}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <ContactPopover locale={locale} />
              </div>
            </div>

            {/* ── Image desktop (si heroImage fournie) ── */}
            {heroImage && (
              <div className="hidden md:block w-[45%] shrink-0 rounded-xl overflow-hidden">
                <Image
                  src={heroImage.src}
                  alt={heroImage.alt}
                  width={0} height={0} sizes="45vw"
                  className="w-full h-auto"
                />
              </div>
            )}

          </div>
        </section>

        {/* ══ CE QUE COMPREND L'INTERVENTION ════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={T.interventionAriaLabel}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.interventionTitle}{' '}
              <span className="text-accent">{T.interventionAccent}</span>
            </h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {interventionItems.map(item => (
                <li key={item} className="flex items-start gap-3">
                  <span style={{ color: '#ccff33', flexShrink: 0, fontWeight: 300 }}>—</span>
                  <span className="text-sm font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.75)' }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>

            {note && (
              <p
                className="text-sm font-light leading-relaxed"
                style={{ color: 'rgba(242,242,242,0.5)', borderLeft: '2px solid rgba(204,255,51,0.4)', paddingLeft: 16 }}
              >
                {note}
              </p>
            )}

          </div>
        </section>

        {/* ══ COMMENT ÇA SE PASSE ════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={T.processAriaLabel}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.processTitle}{' '}
              <span className="text-accent">{T.processAccent}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
              {PROCESS_STEPS.map(step => (
                <div
                  key={step.num}
                  className="flex flex-col gap-4 p-5 rounded-xl"
                  style={{ border: '1px solid rgba(242,242,242,0.1)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  <span className="text-2xl font-light" style={{ color: 'rgba(204,255,51,0.5)' }}>{step.num}</span>
                  <p className="text-sm font-light" style={{ color: '#ededed' }}>{step.title}</p>
                  <p className="text-xs font-light leading-relaxed" style={{ color: 'rgba(242,242,242,0.5)' }}>{step.text}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ══ RÉASSURANCE ════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={T.whyAriaLabel}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.whyTitle}{' '}
              <span className="text-accent">{T.whyAccent}</span>
            </h2>

            <div className="flex flex-wrap gap-3">
              {REASSURANCE.map(item => (
                <span
                  key={item}
                  className="text-sm font-light px-4 py-2 rounded-lg"
                  style={{ border: '1px solid rgba(242,242,242,0.15)', color: 'rgba(242,242,242,0.75)', backgroundColor: 'rgba(255,255,255,0.02)' }}
                >
                  {item}
                </span>
              ))}
            </div>

          </div>
        </section>

        {/* ══ FAQ ════════════════════════════════════════════════════════ */}
        <section
          id="faq"
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={T.faqAriaLabel}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              {T.faqTitle}{' '}
              <span className="text-accent">{T.faqAccent}</span>
            </h2>

            <FAQAccordion items={faqItems} />

          </div>
        </section>

        {/* ══ CTA FINAL ══════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label={T.ctaAriaLabel}
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              {T.ctaTitle}{' '}
              <span className="text-accent">{T.ctaAccent}</span>
            </h2>

            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              {T.ctaDesc}
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <ContactPopover locale={locale} />
            </div>

          </div>
        </section>

        {/* ══ SÉLECTION APPAREIL ═════════════════════════════════════════ */}
        <InterventionDeviceSelector locale={locale} />

      </main>

      <RepairEngagements locale={locale} />
      {bottomSlot}
      <SiteFooter locale={locale} />
      <SectionPinning />
    </>
  )
}
