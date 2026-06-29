'use client'

/*
  RepairFAQ — accordéon Questions fréquentes.
  Animation : GSAP height 0 ↔ auto + opacity, même approche que les autres
  sections du site. Une seule question ouverte à la fois.
  Pas d'overflow:hidden sur le wrapper — uniquement sur le panneau animé.
*/

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'

type FaqItem = { q: string; a: string }

const FAQ_ITEMS_FR: FaqItem[] = [
  {
    q: "Combien de temps dure une réparation d'iPhone ?",
    a: "La plupart des réparations courantes, comme un écran ou une batterie, peuvent être réalisées rapidement selon la disponibilité des pièces. Certains cas demandent plus de temps, notamment les dégâts liquides, les diagnostics complexes ou les réparations nécessitant une commande spécifique.",
  },
  {
    q: "Les prix affichés sont-ils définitifs ?",
    a: "Les prix affichés correspondent aux réparations standards pour le modèle sélectionné. Si un autre dommage est constaté lors du diagnostic, un devis complémentaire est proposé avant toute intervention supplémentaire.",
  },
  {
    q: "Dois-je sauvegarder mes données avant la réparation ?",
    a: "Oui. La sauvegarde des données reste sous la responsabilité du client. Avant toute intervention, il est recommandé de sauvegarder photos, contacts, messages, fichiers et contenus importants. ClikClak ne peut pas garantir la conservation des données pendant une intervention technique.",
  },
  {
    q: "Est-ce que mes données seront consultées ?",
    a: "Non. ClikClak n'a pas vocation à consulter vos contenus personnels. Certains tests peuvent toutefois nécessiter l'allumage de l'appareil ou la vérification de fonctions de base. Si un code est nécessaire, il sert uniquement aux tests techniques.",
  },
  {
    q: "La réparation est-elle garantie ?",
    a: "Oui, selon le type de pièce choisie. Les pièces originales ou d'origine constructeur bénéficient d'une garantie plus longue que les pièces compatibles. La garantie couvre les défauts de pièce ou de montage, mais pas les chocs, chutes, oxydation, casse ou mauvaise utilisation après réparation.",
  },
  {
    q: "La garantie couvre-t-elle un écran cassé après réparation ?",
    a: "Non. Une vitre fissurée, une dalle OLED/LCD endommagée, des lignes colorées, des taches noires ou un écran noir après un choc ne sont pas couverts par la garantie. Ces dommages sont considérés comme physiques.",
  },
  {
    q: "Mon iPhone reste-t-il étanche après réparation ?",
    a: "Non. Après ouverture d'un appareil, l'étanchéité d'origine ne peut pas être garantie, même si des joints sont remplacés. Il faut éviter tout contact avec l'eau ou l'humidité après réparation.",
  },
  {
    q: "Réparez-vous les téléphones tombés dans l'eau ?",
    a: "Oui, un diagnostic peut être effectué. En cas d'oxydation ou de contact liquide, l'objectif principal est souvent la récupération des données ou une remise en fonctionnement temporaire. Aucune garantie de durée de vie ne peut être donnée sur un appareil oxydé.",
  },
  {
    q: "Est-ce que Face ID ou Touch ID peut être affecté ?",
    a: "Certaines fonctions comme Face ID, Touch ID ou True Tone peuvent dépendre de composants liés à la carte mère et aux restrictions du constructeur. Selon l'état de l'appareil ou la réparation effectuée, leur maintien ne peut pas toujours être garanti.",
  },
  {
    q: "Que se passe-t-il si mon appareil est irréparable ?",
    a: "Si l'appareil est irréparable ou si le client refuse le devis après diagnostic, des frais de diagnostic peuvent être facturés selon les conditions générales. Le client peut ensuite récupérer son appareil.",
  },
  {
    q: "Utilisez-vous des pièces originales ?",
    a: "Selon le modèle et la disponibilité, différentes qualités de pièces peuvent être proposées : originales, d'origine constructeur, compatibles ou reconditionnées. Le choix de la pièce influence le prix, le rendu et la durée de garantie.",
  },
  {
    q: "Puis-je venir sans rendez-vous ?",
    a: "Selon l'organisation du jour, certaines réparations peuvent être prises sans rendez-vous. Pour garantir la disponibilité de la pièce et réduire l'attente, il est recommandé de contacter ClikClak avant de se déplacer.",
  },
  {
    q: "Que faire avant de déposer mon smartphone ?",
    a: "Il est conseillé de sauvegarder vos données, retirer les accessoires inutiles, noter les problèmes constatés, et désactiver temporairement les blocages si cela est nécessaire au diagnostic. Ne communiquez jamais vos mots de passe de comptes Apple, Google ou Samsung.",
  },
  {
    q: "Que deviennent les appareils non récupérés ?",
    a: "Un appareil prêt ou diagnostiqué doit être récupéré dans les délais indiqués par ClikClak. Les appareils non réclamés peuvent être soumis aux conditions prévues dans les CGV, notamment frais de stockage, recyclage ou traitement selon le droit applicable.",
  },
]

const FAQ_ITEMS_EN: FaqItem[] = [
  { q: 'How long does an iPhone repair take?', a: 'Most common repairs, such as a screen or battery, can be completed quickly depending on parts availability. Some cases take longer, including liquid damage, complex diagnostics or repairs requiring a special order.' },
  { q: 'Are the displayed prices final?', a: 'Displayed prices correspond to standard repairs for the selected model. If additional damage is found during the diagnostic, a supplementary quote is offered before any further intervention.' },
  { q: 'Should I back up my data before the repair?', a: 'Yes. Data backup remains the client\'s responsibility. Before any intervention, it is recommended to back up photos, contacts, messages, files and important content. ClikClak cannot guarantee data preservation during a technical intervention.' },
  { q: 'Will my data be accessed?', a: 'No. ClikClak does not access your personal content. Some tests may however require powering on the device or checking basic functions. If a code is needed, it is used solely for technical testing.' },
  { q: 'Is the repair covered by a warranty?', a: 'Yes, depending on the type of part chosen. Original or manufacturer parts come with a longer warranty than compatible parts. The warranty covers part or assembly defects, but not shocks, drops, oxidation, breakage or misuse after repair.' },
  { q: 'Does the warranty cover a broken screen after repair?', a: 'No. A cracked glass, damaged OLED/LCD panel, colour lines, black spots or a black screen after an impact are not covered by the warranty. These are considered physical damages.' },
  { q: 'Will my iPhone remain waterproof after repair?', a: 'No. After opening a device, the original waterproofing cannot be guaranteed, even if seals are replaced. Avoid all contact with water or humidity after repair.' },
  { q: 'Do you repair phones dropped in water?', a: 'Yes, a diagnostic can be performed. In case of oxidation or liquid contact, the main objective is often data recovery or temporary restoration. No lifetime guarantee can be given on an oxidised device.' },
  { q: 'Can Face ID or Touch ID be affected?', a: 'Some functions such as Face ID, Touch ID or True Tone may depend on components linked to the motherboard and manufacturer restrictions. Depending on the device\'s condition or the repair carried out, their preservation cannot always be guaranteed.' },
  { q: 'What happens if my device is beyond repair?', a: 'If the device is beyond repair or the client refuses the quote after diagnosis, a diagnostic fee may be charged in accordance with the general terms and conditions. The client can then retrieve their device.' },
  { q: 'Do you use original parts?', a: 'Depending on the model and availability, different part qualities may be offered: original, manufacturer-equivalent, compatible or refurbished. The choice of part affects the price, result and warranty duration.' },
  { q: 'Can I come without an appointment?', a: 'Depending on the day\'s schedule, some repairs can be taken without an appointment. To ensure parts availability and reduce waiting time, it is recommended to contact ClikClak before visiting.' },
  { q: 'What should I do before dropping off my smartphone?', a: 'It is advised to back up your data, remove unnecessary accessories, note the problems observed, and temporarily disable any locks if needed for the diagnostic. Never share your Apple, Google or Samsung account passwords.' },
  { q: 'What happens to uncollected devices?', a: 'A ready or diagnosed device must be collected within the timeframe indicated by ClikClak. Unclaimed devices may be subject to the conditions set out in the general terms and conditions, including storage fees, recycling or processing under applicable law.' },
]

export default function RepairFAQ({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const FAQ_ITEMS = locale === 'en' ? FAQ_ITEMS_EN : FAQ_ITEMS_FR
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const panelRefs  = useRef<(HTMLDivElement | null)[]>([])
  const prevActive = useRef<number | null>(null)
  const reduced    = useRef(false)

  /* Masque tous les panneaux avant le premier paint */
  useLayoutEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRefs.current.forEach(p => {
      if (p) gsap.set(p, { height: 0, opacity: 0, overflow: 'hidden' })
    })
  }, [])

  /* Ferme le précédent, ouvre le nouveau */
  useEffect(() => {
    const prev = prevActive.current
    prevActive.current = activeIndex

    /* Fermeture de l'ancien */
    if (prev !== null && prev !== activeIndex) {
      const panel = panelRefs.current[prev]
      if (panel) {
        gsap.killTweensOf(panel)
        gsap.set(panel, { overflow: 'hidden' })
        if (reduced.current) {
          gsap.set(panel, { height: 0, opacity: 0 })
        } else {
          gsap.to(panel, { height: 0, opacity: 0, duration: 0.22, ease: 'power2.in' })
        }
      }
    }

    /* Ouverture du nouveau */
    if (activeIndex !== null) {
      const panel = panelRefs.current[activeIndex]
      if (panel) {
        gsap.killTweensOf(panel)
        gsap.set(panel, { overflow: 'hidden' })
        if (reduced.current) {
          gsap.set(panel, { height: 'auto', opacity: 1, overflow: 'visible' })
        } else {
          gsap.to(panel, {
            height: 'auto', opacity: 1, duration: 0.32, ease: 'power2.out',
            onComplete: () => gsap.set(panel, { overflow: 'visible' }),
          })
        }
      }
    }
  }, [activeIndex])

  function toggle(i: number) {
    setActiveIndex(prev => prev === i ? null : i)
  }

  return (
    <section
      id="faq"
      className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
      aria-label={locale === 'en' ? 'Frequently asked questions — iPhone repair' : 'Questions fréquentes — réparation iPhone'}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

        {/* ── En-tête ── */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            {locale === 'en' ? 'Frequently asked ' : 'Questions '}<span className="text-accent">{locale === 'en' ? 'questions' : 'fréquentes'}</span>
          </h2>
          <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
            {locale === 'en' ? 'Essential answers before entrusting your device to ClikClak.' : 'Les réponses essentielles avant de confier votre appareil à ClikClak.'}
          </p>
        </div>

        {/* ── Liste accordéon ── */}
        <div className="flex flex-col gap-2">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = activeIndex === i
            return (
              <div
                key={i}
                style={{
                  borderRadius:    10,
                  border:          `1px solid ${isOpen ? 'rgba(204,255,51,0.28)' : 'rgba(242,242,242,0.09)'}`,
                  backgroundColor: isOpen ? 'rgba(204,255,51,0.025)' : 'rgba(255,255,255,0.025)',
                  transition:      'border-color 220ms ease, background-color 220ms ease',
                }}
              >
                {/* ── Bouton question ── */}
                <button
                  type="button"
                  onClick={() => toggle(i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 md:py-5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[10px]"
                >
                  <span
                    className="text-sm md:text-base font-light leading-snug"
                    style={{ color: isOpen ? 'rgba(242,242,242,0.95)' : 'rgba(242,242,242,0.75)' }}
                  >
                    {item.q}
                  </span>
                  {/* Icône + → × via rotation CSS */}
                  <span
                    aria-hidden
                    style={{
                      flexShrink:     0,
                      width:          20,
                      height:         20,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                      fontSize:       18,
                      fontWeight:     300,
                      lineHeight:     1,
                      color:          isOpen ? '#ccff33' : 'rgba(242,242,242,0.35)',
                      transform:      isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition:     'transform 250ms ease, color 220ms ease',
                    }}
                  >
                    +
                  </span>
                </button>

                {/* ── Panneau réponse — GSAP contrôle height/opacity ── */}
                <div
                  id={`faq-panel-${i}`}
                  ref={el => { panelRefs.current[i] = el }}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                >
                  <p
                    className="px-5 pb-5 text-sm font-light leading-relaxed"
                    style={{ color: 'rgba(242,242,242,0.55)' }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
