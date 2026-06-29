'use client'

/*
  RepairFAQGeneric — accordéon FAQ adapté au type d'appareil.
  Même structure GSAP que RepairFAQ.tsx.
  deviceType :
    'smartphone' → Samsung, OPPO, Huawei, Sony Xperia
    'tablet'     → iPad
    'laptop'     → MacBook / iMac
  locale : 'fr' | 'en'
*/

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'

type FaqItem    = { q: string; a: string }
type DeviceType = 'smartphone' | 'tablet' | 'laptop'

/* ── Questions smartphone Android — FR ─────────────────────────────────────── */
const FAQ_SMARTPHONE_FR: FaqItem[] = [
  {
    q: 'Combien de temps dure une réparation ?',
    a: "La durée dépend du modèle et de la disponibilité des pièces. Les réparations courantes comme un écran ou une batterie peuvent être effectuées rapidement. Les diagnostics complexes, dégâts liquides ou commandes de pièces spécifiques demandent plus de temps.",
  },
  {
    q: 'Les prix affichés sont-ils définitifs ?',
    a: "Les prix correspondent aux réparations standards pour le modèle sélectionné. Si un autre dommage est constaté lors du diagnostic, un devis complémentaire est proposé avant toute intervention supplémentaire.",
  },
  {
    q: 'Dois-je sauvegarder mes données avant la réparation ?',
    a: "Oui. La sauvegarde des données reste sous la responsabilité du client. Avant toute intervention, il est recommandé de sauvegarder photos, contacts, messages et fichiers importants. ClikClak ne peut pas garantir la conservation des données pendant une intervention technique.",
  },
  {
    q: 'Est-ce que mes données seront consultées ?',
    a: "Non. ClikClak n'a pas vocation à consulter vos contenus personnels. Certains tests peuvent toutefois nécessiter l'allumage de l'appareil ou la vérification de fonctions de base.",
  },
  {
    q: 'La réparation est-elle garantie ?',
    a: "Oui, selon le type de pièce. Les pièces originales ou d'origine constructeur bénéficient d'une garantie plus longue. La garantie couvre les défauts de pièce ou de montage, mais pas les chocs, chutes, oxydation ou mauvaise utilisation après réparation.",
  },
  {
    q: 'Les capteurs biométriques sont-ils préservés après réparation ?',
    a: "Selon le modèle, certaines fonctions comme le lecteur d'empreinte ou la reconnaissance faciale peuvent dépendre de composants liés à la carte mère. Leur maintien ne peut pas toujours être garanti après une intervention, selon l'état de l'appareil.",
  },
  {
    q: 'Mon smartphone reste-t-il étanche après réparation ?',
    a: "Non. Après ouverture d'un appareil, l'étanchéité d'origine ne peut pas être garantie, même si des joints sont remplacés. Il est conseillé d'éviter tout contact prolongé avec l'eau après réparation.",
  },
  {
    q: "Réparez-vous les téléphones tombés dans l'eau ?",
    a: "Oui, un diagnostic peut être effectué. En cas d'oxydation ou de contact liquide, l'objectif principal est souvent la récupération des données ou une remise en fonctionnement. Aucune garantie de durée de vie ne peut être donnée sur un appareil oxydé.",
  },
  {
    q: "Que se passe-t-il si mon appareil est irréparable ?",
    a: "Si l'appareil est irréparable ou si le client refuse le devis après diagnostic, des frais de diagnostic peuvent être facturés selon les conditions générales. Le client récupère ensuite son appareil.",
  },
  {
    q: 'Utilisez-vous des pièces originales ?',
    a: "Selon le modèle et la disponibilité, différentes qualités de pièces peuvent être proposées : originales, d'origine constructeur, compatibles ou reconditionnées. Le choix de la pièce influence le prix, le rendu et la durée de garantie.",
  },
  {
    q: 'Puis-je venir sans rendez-vous ?',
    a: "Certaines réparations peuvent être prises en charge sans rendez-vous. Pour garantir la disponibilité de la pièce et réduire l'attente, il est recommandé de contacter ClikClak avant de se déplacer.",
  },
]

/* ── Questions tablette — FR ───────────────────────────────────────────────── */
const FAQ_TABLET_FR: FaqItem[] = [
  {
    q: 'Combien de temps dure une réparation de tablette ?',
    a: "La durée dépend du type de réparation et de la disponibilité des pièces. Le remplacement d'une vitre ou d'une batterie peut être réalisé assez rapidement. Les diagnostics complexes ou commandes spécifiques demandent plus de temps.",
  },
  {
    q: 'Les prix affichés sont-ils définitifs ?',
    a: "Les prix correspondent aux réparations standards pour le modèle sélectionné. Si un autre dommage est constaté lors du diagnostic, un devis complémentaire est proposé avant toute intervention supplémentaire.",
  },
  {
    q: 'Dois-je sauvegarder mes données avant la réparation ?',
    a: "Oui. La sauvegarde des données reste sous la responsabilité du client. Avant toute intervention, il est recommandé de sauvegarder les photos, documents, notes et fichiers importants sur iCloud ou un ordinateur.",
  },
  {
    q: 'La réparation est-elle garantie ?',
    a: "Oui, selon le type de pièce. Les pièces originales ou d'origine constructeur bénéficient d'une garantie plus longue. La garantie couvre les défauts de pièce ou de montage, pas les chocs, chutes ou mauvaise utilisation après réparation.",
  },
  {
    q: "La vitre et l'écran sont-ils deux composants distincts ?",
    a: "Sur certains modèles, la vitre et l'écran sont solidaires et doivent être remplacés ensemble. Sur d'autres, seule la vitre peut être remplacée séparément. Un diagnostic permet de préciser ce point avant toute intervention.",
  },
  {
    q: 'Mon iPad reste-t-il étanche après réparation ?',
    a: "Non. Après ouverture d'un appareil, l'étanchéité d'origine ne peut pas être garantie, même si des joints sont remplacés. Il est conseillé d'éviter tout contact prolongé avec l'eau après réparation.",
  },
  {
    q: "Réparez-vous les tablettes tombées dans l'eau ?",
    a: "Oui, un diagnostic peut être effectué. En cas d'oxydation ou de contact liquide, l'objectif est souvent la récupération des données ou une remise en fonctionnement. Aucune garantie de durée de vie ne peut être donnée sur un appareil oxydé.",
  },
  {
    q: 'Est-ce que mes données seront consultées ?',
    a: "Non. ClikClak n'a pas vocation à consulter vos contenus personnels. Certains tests peuvent nécessiter l'allumage de l'appareil ou la vérification de fonctions de base.",
  },
  {
    q: "Que se passe-t-il si ma tablette est irréparable ?",
    a: "Si l'appareil est irréparable ou si le client refuse le devis, des frais de diagnostic peuvent être facturés selon les conditions générales. Le client récupère ensuite sa tablette.",
  },
  {
    q: 'Utilisez-vous des pièces originales ?',
    a: "Selon le modèle et la disponibilité, différentes qualités de pièces peuvent être proposées : originales, compatibles ou reconditionnées. Le choix de la pièce influence le prix, le rendu et la durée de garantie.",
  },
]

/* ── Questions ordinateur — FR ─────────────────────────────────────────────── */
const FAQ_LAPTOP_FR: FaqItem[] = [
  {
    q: 'Combien de temps dure une réparation MacBook ?',
    a: "La durée varie selon le type d'intervention. Certaines réparations peuvent être réalisées en quelques heures. Les diagnostics approfondis, réparations de carte mère, commandes de pièces ou dégâts liquides demandent généralement plus de temps. Un délai estimatif est communiqué lors du dépôt.",
  },
  {
    q: 'Les prix affichés sont-ils définitifs ?',
    a: "Les prix affichés sont indicatifs et peuvent varier selon la configuration exacte, la disponibilité des pièces et l'état de l'appareil. Un diagnostic peut être nécessaire avant confirmation du prix final.",
  },
  {
    q: 'Dois-je sauvegarder mes données avant une intervention ?',
    a: "Oui, absolument. La sauvegarde des données est fortement recommandée avant tout dépôt. ClikClak ne peut pas garantir la conservation des données lors d'une intervention technique. Pensez à utiliser Time Machine ou une sauvegarde cloud avant de déposer votre Mac.",
  },
  {
    q: "Réparez-vous les MacBook ayant subi un dégât d'eau ?",
    a: "Oui, un diagnostic est possible. En cas d'oxydation ou de contact liquide, l'objectif principal peut être la récupération des données ou une remise en fonctionnement. Aucune garantie de durée de vie ne peut être donnée sur un appareil oxydé.",
  },
  {
    q: "Peut-on récupérer les données d'un MacBook qui ne démarre plus ?",
    a: "Dans de nombreux cas, oui. Un diagnostic est nécessaire pour évaluer la cause de la panne et la faisabilité de la récupération. Si le SSD est intact, les chances de récupération sont généralement bonnes.",
  },
  {
    q: 'Les réparations MacBook sont-elles garanties ?',
    a: "Oui, selon le type de pièce utilisée. La garantie couvre les défauts de pièce ou de montage. Elle ne couvre pas les chocs, chutes, oxydation ou mauvaise utilisation après réparation.",
  },
  {
    q: 'Que faire si le diagnostic révèle une autre panne ?',
    a: "Un devis complémentaire est présenté avant toute intervention supplémentaire. Le client décide librement de poursuivre ou non. Aucune réparation n'est effectuée sans accord préalable.",
  },
  {
    q: 'Faut-il apporter le chargeur avec le MacBook ?',
    a: "Ce n'est pas obligatoire, mais cela peut faciliter certains tests, notamment pour vérifier le port de charge ou le comportement sous alimentation. En cas de doute, apportez-le.",
  },
  {
    q: 'Réparez-vous aussi les iMac ?',
    a: "Oui, ClikClak prend en charge les iMac pour des réparations d'écran, des nettoyages internes, des problèmes de surchauffe, des pannes logicielles et des récupérations de données. Contactez-nous pour un diagnostic selon votre modèle.",
  },
  {
    q: "Que se passe-t-il si la réparation n'est pas rentable ?",
    a: "Si le coût de réparation dépasse la valeur de l'appareil ou si le client refuse le devis, des frais de diagnostic peuvent être facturés selon les conditions générales. Le client récupère ensuite son appareil.",
  },
]

/* ── Questions smartphone — EN ─────────────────────────────────────────────── */
const FAQ_SMARTPHONE_EN: FaqItem[] = [
  {
    q: 'How long does a repair take?',
    a: "Duration depends on the model and parts availability. Common repairs like a screen or battery can be done quickly. Complex diagnostics, liquid damage or special part orders take longer.",
  },
  {
    q: 'Are displayed prices final?',
    a: "Prices correspond to standard repairs for the selected model. If additional damage is found during the diagnostic, a supplementary quote is offered before any further work.",
  },
  {
    q: 'Should I back up my data before the repair?',
    a: "Yes. Data backup is the client's responsibility. Before any intervention, back up photos, contacts, messages and important files. ClikClak cannot guarantee data preservation during a technical intervention.",
  },
  {
    q: 'Will my data be accessed?',
    a: "No. ClikClak does not access your personal content. Some tests may require powering on the device or checking basic functions. Any required code is used solely for technical testing.",
  },
  {
    q: 'Is the repair covered by a warranty?',
    a: "Yes, depending on the part type. Original or manufacturer parts carry a longer warranty than compatible parts. The warranty covers part or assembly defects, but not shock, drops, oxidation, breakage or misuse after repair.",
  },
  {
    q: 'What if my device is beyond repair?',
    a: "If the device is beyond repair or the client declines the quote after diagnosis, a diagnostic fee may apply per the general terms. The client can then collect their device.",
  },
  {
    q: 'Do you use original parts?',
    a: "Depending on the model and availability, different part qualities may be offered: original, manufacturer-equivalent, compatible or refurbished. Part choice affects price, result and warranty duration.",
  },
  {
    q: 'Can I come without an appointment?',
    a: "Depending on the day, some repairs can be taken without an appointment. To ensure parts availability and reduce waiting, contact ClikClak before visiting.",
  },
]

/* ── Questions tablette — EN ───────────────────────────────────────────────── */
const FAQ_TABLET_EN: FaqItem[] = [
  {
    q: 'How long does a tablet repair take?',
    a: "Duration depends on the type of repair and parts availability. Screen or battery replacements can often be done quickly. Complex diagnostics or special part orders take longer.",
  },
  {
    q: 'Are displayed prices final?',
    a: "Prices correspond to standard repairs for the selected model. If additional damage is found during the diagnostic, a supplementary quote is offered before any further work.",
  },
  {
    q: 'Should I back up my data before the repair?',
    a: "Yes. Data backup is the client's responsibility. Before any intervention, back up photos, documents, notes and important files to iCloud or a computer.",
  },
  {
    q: 'Is the repair covered by a warranty?',
    a: "Yes, depending on the part type. Original or manufacturer parts carry a longer warranty. The warranty covers part or assembly defects, not shock, drops or misuse after repair.",
  },
  {
    q: 'Are the glass and screen separate components?',
    a: "On some models, the glass and screen are bonded and must be replaced together. On others, only the glass can be replaced separately. A diagnostic clarifies this before any work.",
  },
  {
    q: 'Will my tablet remain water-resistant after repair?',
    a: "No. After opening a device, the original water resistance cannot be guaranteed, even if gaskets are replaced. Avoid prolonged water contact after repair.",
  },
  {
    q: 'Do you repair tablets that have been dropped in water?',
    a: "Yes, a diagnostic can be carried out. In case of oxidation or liquid contact, the goal is often data recovery or getting the device working again. No lifespan guarantee can be given on an oxidised device.",
  },
  {
    q: 'Will my data be accessed?',
    a: "No. ClikClak does not access your personal content. Some tests may require powering on the device or checking basic functions.",
  },
  {
    q: 'What if my tablet is beyond repair?',
    a: "If the device is beyond repair or the client declines the quote, a diagnostic fee may apply per the general terms. The client can then collect their tablet.",
  },
  {
    q: 'Do you use original parts?',
    a: "Depending on the model and availability, original, compatible or refurbished parts may be offered. Part choice affects price, result and warranty duration.",
  },
]

/* ── Questions ordinateur — EN ─────────────────────────────────────────────── */
const FAQ_LAPTOP_EN: FaqItem[] = [
  {
    q: 'How long does a MacBook repair take?',
    a: "Duration varies by intervention type. Some repairs can be done in a few hours. In-depth diagnostics, motherboard repairs, part orders or liquid damage generally take longer. An estimated timeline is given at drop-off.",
  },
  {
    q: 'Are displayed prices final?',
    a: "Displayed prices are indicative and may vary depending on the exact configuration, parts availability and device condition. A diagnostic may be required before confirming the final price.",
  },
  {
    q: 'Should I back up my data before the repair?',
    a: "Yes, absolutely. Data backup is strongly recommended before any drop-off. ClikClak cannot guarantee data preservation during a technical intervention. Use Time Machine or a cloud backup before bringing in your Mac.",
  },
  {
    q: 'Do you repair MacBooks with water damage?',
    a: "Yes, a diagnostic is possible. In case of oxidation or liquid contact, the main goal may be data recovery or temporary restoration. No lifespan guarantee can be given on an oxidised device.",
  },
  {
    q: 'Can data be recovered from a MacBook that won\'t boot?',
    a: "In many cases, yes. A diagnostic is needed to assess the cause and feasibility of recovery. If the SSD is intact, recovery chances are generally good.",
  },
  {
    q: 'Are MacBook repairs covered by a warranty?',
    a: "Yes, depending on the part used. The warranty covers part or assembly defects. It does not cover shock, drops, oxidation or misuse after repair.",
  },
  {
    q: 'What if the diagnostic reveals another issue?',
    a: "A supplementary quote is presented before any additional work. The client decides freely whether to proceed. No repair is carried out without prior agreement.",
  },
  {
    q: 'Should I bring the charger with my MacBook?',
    a: "It's not required, but it can help with certain tests, particularly to check the charging port or power behaviour. If in doubt, bring it.",
  },
  {
    q: 'Do you also repair iMacs?',
    a: "Yes, ClikClak handles iMacs for screen repairs, internal cleaning, overheating issues, software faults and data recovery. Contact us for a diagnostic based on your model.",
  },
  {
    q: 'What if the repair is not cost-effective?',
    a: "If the repair cost exceeds the device's value or the client declines the quote, a diagnostic fee may apply per the general terms. The client can then collect their device.",
  },
]

const FAQ_MAP_FR = {
  smartphone: FAQ_SMARTPHONE_FR,
  tablet:     FAQ_TABLET_FR,
  laptop:     FAQ_LAPTOP_FR,
}

const FAQ_MAP_EN = {
  smartphone: FAQ_SMARTPHONE_EN,
  tablet:     FAQ_TABLET_EN,
  laptop:     FAQ_LAPTOP_EN,
}

const HEADER_FR = {
  h2a:      'Questions',
  h2accent: 'fréquentes',
  sub:      'Les réponses essentielles avant de confier votre appareil à ClikClak.',
  ariaLabel: 'Questions fréquentes',
}

const HEADER_EN = {
  h2a:      'Frequently asked',
  h2accent: 'questions',
  sub:      'Key answers before entrusting your device to ClikClak.',
  ariaLabel: 'Frequently asked questions',
}

/* ══════════════════════════════════════════════════════════════════════════════
   Composant accordéon — identique à RepairFAQ.tsx
══════════════════════════════════════════════════════════════════════════════ */
export default function RepairFAQGeneric({
  deviceType,
  locale = 'fr',
}: {
  deviceType: DeviceType
  locale?: 'fr' | 'en'
}) {
  const FAQ_MAP = locale === 'en' ? FAQ_MAP_EN : FAQ_MAP_FR
  const HEADER  = locale === 'en' ? HEADER_EN  : HEADER_FR
  const items = FAQ_MAP[deviceType]

  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const panelRefs  = useRef<(HTMLDivElement | null)[]>([])
  const prevActive = useRef<number | null>(null)
  const reduced    = useRef(false)

  useLayoutEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRefs.current.forEach(p => {
      if (p) gsap.set(p, { height: 0, opacity: 0, overflow: 'hidden' })
    })
  }, [])

  useEffect(() => {
    const prev = prevActive.current
    prevActive.current = activeIndex

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

  return (
    <section
      id="faq"
      className="px-6 md:px-14 lg:px-20 py-16 border-t border-white/10"
      aria-label={HEADER.ariaLabel}
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            {HEADER.h2a}{' '}
            <span className="text-accent">{HEADER.h2accent}</span>
          </h2>
          <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
            {HEADER.sub}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {items.map((item, i) => {
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
                <button
                  type="button"
                  onClick={() => setActiveIndex(prev => prev === i ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-g-panel-${i}`}
                  className="w-full flex items-center justify-between gap-4 px-5 py-4 md:py-5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-[10px]"
                >
                  <span
                    className="text-sm md:text-base font-light leading-snug"
                    style={{ color: isOpen ? 'rgba(242,242,242,0.95)' : 'rgba(242,242,242,0.75)' }}
                  >
                    {item.q}
                  </span>
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0, width: 20, height: 20,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 300, lineHeight: 1,
                      color:     isOpen ? '#ccff33' : 'rgba(242,242,242,0.35)',
                      transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                      transition: 'transform 250ms ease, color 220ms ease',
                    }}
                  >
                    +
                  </span>
                </button>

                <div
                  id={`faq-g-panel-${i}`}
                  ref={el => { panelRefs.current[i] = el }}
                  role="region"
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
