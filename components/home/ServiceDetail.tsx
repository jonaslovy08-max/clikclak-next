'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import AnimatedScreenRepairIcon    from '@/components/icons/AnimatedScreenRepairIcon'
import AnimatedBatteryRepairIcon   from '@/components/icons/AnimatedBatteryRepairIcon'
import AnimatedChargeConnectorIcon from '@/components/icons/AnimatedChargeConnectorIcon'
import AnimatedDiagnosticIcon      from '@/components/icons/AnimatedDiagnosticIcon'

/*
  RepairCard — port exact du pattern DeviceCard (ServiceSelector.tsx).

  Animation GSAP BUTTON HOVER identique à la section 1 :
    cardRef  → <button>    — scale 1→1.05, power2.out, 0.45s
    boxRef   → cadre <div> — borderColor lime + glow
    reverse  : timeScale×1.8
  prefers-reduced-motion respecté.

  Structure du cadre :
    mainIcon   : icône principale centrée, w-[82%] (même proportion que section 1)
    actionIcon : petite icône en haut à droite, ~40-42px (null si absente)
*/

/*
  mainIconSize : override de taille pour les SVG au viewBox non carré.
  icon-screen-repair.svg (80.93×120.59, portrait) remplit ~94% de son viewBox
  → à w-[82%] le rendu est plus grand visuellement que les icônes 262×262.
  Compensation : w-[64%] h-[64%] uniquement pour ce fichier.
*/
const repairs: { label: string; href: string; mainIcon: string; actionIcon: string | null; mainIconSize?: string; rainEffect?: boolean; animated?: 'screen' | 'battery' | 'charge' | 'diagnostic' }[] = [
  { label: 'Réparation écran',       href: '/services/reparation-ecran',       mainIcon: '/assets/icons/icon-screen-repair.svg',   actionIcon: '/assets/ui/icon-repair-action.svg',       animated: 'screen'     },
  { label: 'Changement de batterie', href: '/services/changement-batterie',    mainIcon: '/assets/icons/icon-battery.svg',          actionIcon: '/assets/ui/icon-battery-action.svg',      animated: 'battery'    },
  { label: 'Connecteur de charge',   href: '/services/connecteur-de-charge',   mainIcon: '/assets/icons/icon-charging-port.svg',    actionIcon: '/assets/ui/icon-battery-action.svg',      animated: 'charge'     },
  { label: 'Dégâts d\'eau',           href: '/reparation-degat-eau-lausanne',  mainIcon: '/assets/icons/icon-water-damage.svg', actionIcon: '/assets/ui/icon-water-damage-action.svg', rainEffect: true },
  { label: 'Diagnostic',             href: '/services/diagnostic',             mainIcon: '/assets/icons/icon-diagnostic.svg',       actionIcon: '/assets/ui/icon-diagnostic-action.svg',   animated: 'diagnostic' },
]


/*
  Rain drops — pré-calculés (pas de Math.random → pas d'hydration mismatch).
  Port de Omar Khaled (CodePen XWJZaeG), adapté pour une card carrée.
  18 gouttes réparties sur toute la largeur (~5% d'intervalle).
*/
const RAIN_DROPS = [
  { left:  4, delay: 0.42, duration: 0.572 },
  { left:  9, delay: 0.07, duration: 0.547 },
  { left: 15, delay: 0.83, duration: 0.583 },
  { left: 20, delay: 0.31, duration: 0.561 },
  { left: 26, delay: 0.65, duration: 0.595 },
  { left: 31, delay: 0.18, duration: 0.538 },
  { left: 37, delay: 0.74, duration: 0.574 },
  { left: 43, delay: 0.52, duration: 0.552 },
  { left: 49, delay: 0.29, duration: 0.589 },
  { left: 55, delay: 0.87, duration: 0.541 },
  { left: 61, delay: 0.13, duration: 0.567 },
  { left: 67, delay: 0.96, duration: 0.578 },
  { left: 72, delay: 0.44, duration: 0.554 },
  { left: 78, delay: 0.61, duration: 0.592 },
  { left: 83, delay: 0.28, duration: 0.536 },
  { left: 89, delay: 0.77, duration: 0.563 },
  { left: 94, delay: 0.55, duration: 0.581 },
  { left: 98, delay: 0.39, duration: 0.549 },
] as const

function RepairCard({ label, href, mainIcon, actionIcon, mainIconSize = 'w-[82%] h-[82%]', rainEffect = false, animated }: {
  label: string
  href: string
  mainIcon: string
  actionIcon: string | null
  mainIconSize?: string
  rainEffect?: boolean
  animated?: 'screen' | 'battery' | 'charge' | 'diagnostic'
}) {
  const cardRef    = useRef<HTMLAnchorElement>(null)
  const boxRef     = useRef<HTMLDivElement>(null)
  const tlRef      = useRef<gsap.core.Timeline | null>(null)
  const reducedRef = useRef(false)
  const labelLines = label.split('\n')

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const card = cardRef.current
    const box  = boxRef.current
    if (!card || !box) return

    gsap.set(card, { scale: 1, transformOrigin: 'center bottom' })
    gsap.set(box, {
      boxShadow: '0 0 0px rgba(204,255,51,0), inset 0 0 0px rgba(204,255,51,0)',
    })

    if (!reducedRef.current) {
      tlRef.current = gsap.timeline({ paused: true })
        .to(card, {
          scale:    1.05,
          duration: 0.45,
          ease:     'power2.out',
        }, 0)
        .to(box, {
          borderColor: '#ccff33',
          boxShadow:   '0 0 24px rgba(204,255,51,0.22), inset 0 0 24px rgba(204,255,51,0.04)',
          duration:    0.45,
          ease:        'power2.out',
        }, 0)
    }

    return () => { tlRef.current?.kill(); tlRef.current = null }
  }, [])

  const show = useCallback(() => {
    if (!reducedRef.current) {
      tlRef.current?.timeScale(1).play()
    } else if (boxRef.current) {
      gsap.set(boxRef.current, { borderColor: '#ccff33' })
    }
  }, [])

  const hide = useCallback(() => {
    if (!reducedRef.current) {
      tlRef.current?.timeScale(1.8).reverse()
    } else if (boxRef.current) {
      gsap.set(boxRef.current, {
        borderColor: 'rgba(242,242,242,0.18)',
        boxShadow:   '0 0 0px rgba(204,255,51,0), inset 0 0 0px rgba(204,255,51,0)',
      })
    }
  }, [])

  return (
    <Link
      ref={cardRef}
      href={href}
      aria-label={label}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="service-card flex flex-col items-center gap-3 cursor-pointer focus-visible:outline-none"
    >
      {/* Cadre — icône principale centrée + icône action haut-droit */}
      <div
        ref={boxRef}
        className={cn(
          'choice-card-frame',
          'relative w-full aspect-square flex items-center justify-center rounded-xl',
          'border border-[rgba(242,242,242,0.18)]',
          /* overflow-hidden : clippe les gouttes aux bords du cadre.
             Les icônes passent à z-index:2 → au-dessus de la pluie (z-index:1). */
          rainEffect && 'overflow-hidden',
        )}
      >
        {/* Icône principale — SVG inline animé ou <img> selon le type */}
        {animated === 'screen' ? (
          <AnimatedScreenRepairIcon
            className={`${mainIconSize} object-contain${rainEffect ? ' relative z-[2]' : ''}`}
          />
        ) : animated === 'battery' ? (
          <AnimatedBatteryRepairIcon
            className={`${mainIconSize} object-contain${rainEffect ? ' relative z-[2]' : ''}`}
          />
        ) : animated === 'charge' ? (
          <AnimatedChargeConnectorIcon
            className={`${mainIconSize} object-contain${rainEffect ? ' relative z-[2]' : ''}`}
          />
        ) : animated === 'diagnostic' ? (
          <AnimatedDiagnosticIcon
            className={`${mainIconSize} object-contain${rainEffect ? ' relative z-[2]' : ''}`}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mainIcon}
            alt=""
            aria-hidden
            width={200}
            height={200}
            className={`${mainIconSize} object-contain${rainEffect ? ' relative z-[2]' : ''}`}
          />
        )}
        {/* Icône action — haut droit, z-index:2 quand rainEffect */}
        {actionIcon && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={actionIcon}
            alt=""
            aria-hidden
            width={42}
            height={42}
            className={`absolute top-3 right-3 w-7 h-7 md:w-[30px] md:h-[30px] object-contain${rainEffect ? ' z-[2]' : ''}`}
          />
        )}
        {/* Effet pluie — uniquement sur la card Dégâts d'eau.
            z-index:1, icônes à z-index:2, pointer-events:none. */}
        {rainEffect && (
          <div className="wd-rain-container" aria-hidden="true">
            {RAIN_DROPS.map((d, i) => (
              <div
                key={i}
                className="wd-drop"
                style={{
                  left:              `${d.left}%`,
                  animationDelay:    `${d.delay}s`,
                  animationDuration: `${d.duration}s`,
                }}
              >
                <div
                  className="wd-stem"
                  style={{
                    animationDelay:    `${d.delay}s`,
                    animationDuration: `${d.duration}s`,
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Label sous le cadre */}
      <span className="service-card-label text-xs md:text-sm font-light text-center leading-snug">
        {labelLines.map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </span>
    </Link>
  )
}

export default function ServiceDetail() {
  return (
    <section
      id="services-detail"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Réparation smartphone Lausanne"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-5">

        {/* ── Grande accroche — mêmes réglages que section 1 ── */}
        <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
          <span className="text-accent">Réparation</span>{' '}smartphone
          <br />Lausanne
        </h2>

        {/* ── Séparateur — identique à section 1 ── */}


        {/* ── Photo + texte ── */}
        <div className="flex flex-col md:flex-row gap-5 md:gap-8 items-start">

          {/* Photo */}
          <div className="w-full md:w-[48%] shrink-0 rounded-xl overflow-hidden">
            <Image
              src="/assets/images/homepage/service-sections/reparation-smartphone.webp"
              alt="Réparation smartphone chez Clik Clak Lausanne"
              width={0}
              height={0}
              sizes="(max-width: 768px) 100vw, 44vw"
              className="w-full h-auto"
            />
          </div>

          {/* Contenu textuel */}
          <div className="flex-1 flex flex-col gap-5 md:pt-2">
            <span className="text-foreground/35 text-[11px] tracking-[0.22em] uppercase">
              Lausanne
            </span>

            {/* Titre avec barre lime */}
            <div className="flex items-start gap-3">
              <span className="mt-[5px] block w-[3px] min-h-[18px] self-stretch bg-accent shrink-0" aria-hidden />
              <h3 className="text-base md:text-lg font-light text-foreground leading-snug">
                Réparation smartphone Lausanne
              </h3>
            </div>

            <p className="text-base md:text-[0.9375rem] font-light leading-relaxed text-foreground/60">
              Écran cassé, batterie faible ou connecteur instable. Diagnostic clair, réparation soignée et prix affichés selon votre modèle.
            </p>

            <div className="mt-2">
              <Button href="/reparation-smartphone-express" size="lg">
                Voir les réparations
              </Button>
            </div>
          </div>
        </div>

        {/* ── Séparateur ── */}


        {/* ── 5 types de réparation avec hover GSAP ── */}
        <div className="mt-16 md:mt-24 lg:mt-32 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {repairs.map(({ label, href, mainIcon, actionIcon, mainIconSize, rainEffect, animated }) => (
            <RepairCard key={label} label={label} href={href} mainIcon={mainIcon} actionIcon={actionIcon} mainIconSize={mainIconSize} rainEffect={rainEffect} animated={animated} />
          ))}
        </div>

      </div>
    </section>
  )
}
