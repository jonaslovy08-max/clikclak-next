/*
  InterventionPageLayout — structure commune aux 5 pages d'intervention.
  Server Component.

  Pages utilisatrices :
    /services/reparation-ecran
    /services/changement-batterie
    /services/connecteur-de-charge
    /reparation-degat-eau-lausanne
    /services/diagnostic
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
  pill:               string      /* label du bouton/pill en haut de page */
  h1:                 string      /* H1 de la page */
  intro:              string      /* texte d'introduction */
  interventionItems:  string[]    /* ce que comprend l'intervention */
  faqItems:           FaqItem[]   /* FAQ spécifique */
  note?:              string      /* note d'avertissement (dégât d'eau, etc.) */
  heroImage?:         HeroImage   /* image optionnelle dans le hero */
  bottomSlot?:        React.ReactNode  /* section optionnelle avant le footer */
}

const PROCESS_STEPS = [
  { num: '01', title: 'Diagnostic ou confirmation', text: 'Nous vérifions l\'origine de la panne avant toute intervention.' },
  { num: '02', title: 'Devis selon modèle', text: 'Le tarif est communiqué selon votre modèle et la disponibilité des pièces.' },
  { num: '03', title: 'Intervention', text: 'La réparation est réalisée avec les précautions nécessaires.' },
  { num: '04', title: 'Test et restitution', text: 'L\'appareil est testé avant restitution.' },
]

const REASSURANCE = [
  'Diagnostic clair avant intervention',
  'Réparation locale à Lausanne',
  'Garantie selon type de pièce',
  'Données à sauvegarder avant intervention',
  'Pièces selon disponibilité',
]

export default function InterventionPageLayout({
  pill, h1, intro, interventionItems, faqItems, note, heroImage, bottomSlot,
}: Props) {
  return (
    <>
      <Header />

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
                {h1.includes('à Lausanne')
                  ? <>
                      {h1.replace(' à Lausanne', '')}{' '}
                      <span className="text-accent">à Lausanne</span>
                    </>
                  : h1
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
                <ContactPopover />
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
          aria-label="Ce que comprend l'intervention"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Ce que comprend{' '}
              <span className="text-accent">l&apos;intervention</span>
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
          aria-label="Comment se passe la réparation"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Comment se passe{' '}
              <span className="text-accent">la réparation ?</span>
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
          aria-label="Nos engagements"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Pourquoi choisir{' '}
              <span className="text-accent">ClikClak ?</span>
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
          aria-label="Questions fréquentes"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col gap-8">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              Questions{' '}
              <span className="text-accent">fréquentes</span>
            </h2>

            <FAQAccordion items={faqItems} />

          </div>
        </section>

        {/* ══ CTA FINAL ══════════════════════════════════════════════════ */}
        <section
          className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
          aria-label="Demander une réparation"
        >
          <div className="w-full max-w-6xl mx-auto flex flex-col items-center gap-6 text-center">

            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight max-w-xl">
              Besoin d&apos;une{' '}
              <span className="text-accent">réparation ?</span>
            </h2>

            <p
              className="font-light max-w-xl"
              style={{ fontSize: 'clamp(14px, 1.4vw, 18px)', color: 'rgba(242,242,242,0.6)' }}
            >
              Identifiez votre modèle pour consulter le tarif adapté ou contactez-nous directement.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <ContactPopover />
            </div>

          </div>
        </section>

        {/* ══ SÉLECTION APPAREIL ═════════════════════════════════════════ */}
        <InterventionDeviceSelector />

      </main>

      <RepairEngagements />
      {bottomSlot}
      <SiteFooter />
      <SectionPinning />
    </>
  )
}
