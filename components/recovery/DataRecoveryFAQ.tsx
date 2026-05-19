'use client'

import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import gsap from 'gsap'

type FaqItem = { q: string; a: string }

const FAQ_ITEMS: FaqItem[] = [
  {
    q: 'La récupération de données est-elle garantie ?',
    a: "Non. Les chances de récupération dépendent de l'état du support, du type de panne, du chiffrement et des manipulations déjà effectuées. Un diagnostic est nécessaire avant toute estimation.",
  },
  {
    q: 'Que faire si mon disque dur fait du bruit ?',
    a: "Éteignez-le immédiatement. Un disque qui claque ou gratte peut subir des dommages mécaniques aggravés à chaque tentative de démarrage. Ne le rallumez pas avant diagnostic.",
  },
  {
    q: "Que faire si mon téléphone est tombé dans l'eau ?",
    a: "Ne le rechargez pas. Éteignez-le si possible et contactez-nous rapidement. L'oxydation peut progresser même après séchage apparent, et chaque tentative de redémarrage aggrave le risque.",
  },
  {
    q: "Pouvez-vous récupérer les photos d'un iPhone qui ne s'allume plus ?",
    a: "Dans certains cas oui, selon l'état de la carte mère, du stockage et du système de chiffrement. Un diagnostic est nécessaire pour évaluer les possibilités.",
  },
  {
    q: 'Pouvez-vous transférer mes données vers un nouveau téléphone ?',
    a: "Oui, si l'ancien appareil est accessible ou si les données peuvent être récupérées. Nous proposons le transfert smartphone vers smartphone, Mac, PC et support externe.",
  },
  {
    q: 'Mes données seront-elles consultées ?',
    a: "Non. Les données sont traitées uniquement dans le cadre de l'intervention demandée. Certains contrôles techniques peuvent toutefois nécessiter de vérifier que les fichiers récupérés sont lisibles.",
  },
  {
    q: 'Dois-je fournir mon code ?',
    a: "Uniquement si cela est nécessaire au diagnostic ou au transfert. Les accès servent aux tests techniques et à la récupération, jamais à consulter volontairement vos contenus.",
  },
  {
    q: "Que se passe-t-il si les données ne sont pas récupérables ?",
    a: "Nous vous informons du résultat du diagnostic. Selon le cas, seuls les frais d'analyse ou de diagnostic prévus peuvent être facturés.",
  },
  {
    q: 'Est-ce possible après formatage ?',
    a: "Parfois, mais les chances diminuent fortement si de nouvelles données ont été écrites sur le support après le formatage.",
  },
  {
    q: "Puis-je continuer à utiliser l'appareil avant diagnostic ?",
    a: "Non. Il vaut mieux arrêter immédiatement l'utilisation pour éviter d'écraser des données ou d'aggraver la panne.",
  },
  {
    q: "Pouvez-vous récupérer les données d'un SSD non reconnu ?",
    a: "Oui dans certains cas, selon le contrôleur, la mémoire NAND, le firmware et le niveau de chiffrement. Un diagnostic est nécessaire.",
  },
  {
    q: 'Travaillez-vous sur les disques RAID ou NAS ?',
    a: "Oui, mais il faut éviter toute reconstruction ou réinitialisation avant diagnostic. L'ordre des disques et la configuration RAID doivent être conservés en l'état.",
  },
]

export default function DataRecoveryFAQ() {
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
      aria-label="Questions fréquentes — récupération de données"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-10">

        <div className="flex flex-col gap-3">
          <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
            Questions{' '}
            <span className="text-accent">fréquentes</span>
          </h2>
          <p className="text-sm font-light" style={{ color: 'rgba(242,242,242,0.45)' }}>
            Les réponses essentielles avant de confier vos données à ClikClak.
          </p>
        </div>

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
                <button
                  type="button"
                  onClick={() => setActiveIndex(prev => prev === i ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`dr-faq-panel-${i}`}
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
                  id={`dr-faq-panel-${i}`}
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
