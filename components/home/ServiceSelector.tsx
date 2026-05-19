'use client'

import { useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { cn } from '@/lib/utils'
import {
  IconSmartphone,
  IconComputer,
  IconTablet,
  IconCourier,
  IconDataRecovery,
} from './ServiceIcons'
import RepairModelSearch     from '@/components/RepairModelSearch'
import RotatingRepairCapsule from '@/components/home/RotatingRepairCapsule'

const devices = [
  { id: 'smartphones',  label: 'Smartphones',                  icon: IconSmartphone,  href: '/reparation-smartphone-express/' },
  { id: 'ordinateurs',  label: 'Ordinateurs',                  icon: IconComputer,    href: '/reparation-ordinateur-express'  },
  { id: 'tablette',     label: 'Tablette',                     icon: IconTablet,      href: '/reparation-tablette-express'    },
  { id: 'depannage',    label: 'Dépannage 7/7',                icon: IconCourier,     href: '/services/depannage-reparation-domicile' },
  { id: 'recuperation', label: ['Récupération', 'de données'], icon: IconDataRecovery,href: '/services/recuperation-donnees'  },
] as const

type Device = typeof devices[number]

/*
  DeviceCard — animation GSAP BUTTON HOVER + stroke drawing.

  Trois refs :
    cardRef  → <button>    — scale 1→1.05
    boxRef   → cadre <div> — borderColor lime + glow
    drawRef  → path SVG inliné — strokeDashoffset draw effect

  Stroke animation :
    - Au repos : trait entier visible (dashoffset = 0)
    - Au hover : fromTo strokeDashoffset -len→0 en 0.75s, power2.inOut
    - Au départ : scale/glow reverse, trait reste complet

  Couleurs SVG : jamais modifiées. drawRef anime uniquement la position du trait.
  prefers-reduced-motion : gsap.set() instantané, pas d'animation.
*/
function DeviceCard({ device }: { device: Device }) {
  const cardRef    = useRef<HTMLAnchorElement>(null)
  const boxRef     = useRef<HTMLDivElement>(null)
  const drawRef    = useRef<SVGGeometryElement>(null)
  const tlRef      = useRef<gsap.core.Timeline | null>(null)
  const reducedRef = useRef(false)
  const labelLines = Array.isArray(device.label) ? device.label : [device.label]
  const Icon = device.icon

  useEffect(() => {
    reducedRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const card = cardRef.current
    const box  = boxRef.current
    const draw = drawRef.current
    if (!card || !box) return

    /* État initial — boxShadow transparent pour interpolation fluide */
    gsap.set(card, { scale: 1, transformOrigin: 'center bottom' })
    gsap.set(box, {
      boxShadow: '0 0 0px rgba(204,255,51,0), inset 0 0 0px rgba(204,255,51,0)',
    })

    /* Initialise stroke à trait complet au repos */
    if (draw && !reducedRef.current) {
      const len = draw.getTotalLength()
      gsap.set(draw, { strokeDasharray: len, strokeDashoffset: 0 })
    }

    if (!reducedRef.current) {
      tlRef.current = gsap.timeline({ paused: true })
        /* Scale wrapper complet — clairement visible */
        .to(card, {
          scale:    1.05,
          duration: 0.45,
          ease:     'power2.out',
        }, 0)
        /* Border + glow sur le cadre uniquement */
        .to(box, {
          borderColor: '#ccff33',
          boxShadow:   '0 0 24px rgba(204,255,51,0.22), inset 0 0 24px rgba(204,255,51,0.04)',
          duration:    0.45,
          ease:        'power2.out',
        }, 0)
    }

    return () => {
      tlRef.current?.kill()
      tlRef.current = null
      if (draw) gsap.killTweensOf(draw)
    }
  }, [])

  const show = useCallback(() => {
    if (!reducedRef.current) {
      /* Stroke draw — repart de 0, dessine jusqu'à totalLength */
      const draw = drawRef.current
      if (draw) {
        gsap.killTweensOf(draw)
        const len = draw.getTotalLength()
        gsap.fromTo(
          draw,
          { strokeDashoffset: -len },
          { strokeDashoffset: 0, strokeDasharray: len, duration: 0.75, ease: 'power2.inOut' }
        )
      }
      tlRef.current?.timeScale(1).play()
    } else {
      if (boxRef.current) gsap.set(boxRef.current, { borderColor: '#ccff33' })
    }
  }, [])

  const hide = useCallback(() => {
    if (!reducedRef.current) {
      /* Scale/glow reverse — stroke reste complet */
      tlRef.current?.timeScale(1.8).reverse()
    } else {
      if (boxRef.current) gsap.set(boxRef.current, {
        borderColor: 'rgba(242,242,242,0.25)',
        boxShadow:   '0 0 0px rgba(204,255,51,0), inset 0 0 0px rgba(204,255,51,0)',
      })
    }
  }, [])

  return (
    <Link
      ref={cardRef}
      href={device.href}
      aria-label={labelLines.join(' ')}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="service-card flex flex-col items-center gap-3 cursor-pointer focus-visible:outline-none"
    >
      {/* Cadre — boxRef pour border/glow GSAP */}
      <div
        ref={boxRef}
        className={cn(
          'choice-card-frame',
          'w-full aspect-square flex items-center justify-center rounded-xl',
          'border border-[rgba(242,242,242,0.25)]',
        )}
      >
        {/* SVG inliné — drawRef sur le path animé */}
        <Icon
          drawRef={drawRef as React.Ref<SVGGeometryElement>}
          className="w-[82%]"
        />
      </div>

      {/* Label — CSS via .service-card-label dans globals.css */}
      <span className="service-card-label text-sm md:text-base font-light text-center leading-snug">
        {labelLines.map((line, i) => (
          <span key={i} className="block">{line}</span>
        ))}
      </span>
    </Link>
  )
}

export default function ServiceSelector() {
  return (
    <section
      id="selection-service"
      className="px-6 md:px-14 lg:px-20 py-32 md:py-40 lg:py-48 border-t border-white/10"
      aria-label="Sélection du service"
    >
      <div className="w-full max-w-6xl mx-auto flex flex-col gap-16">

        {/* ── Titre + Recherche ── */}
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-14">
          <div className="flex-1">
            <h2 className="text-[1.75rem] md:text-[2.25rem] font-light leading-tight">
              <span className="text-accent">Quel appareil</span>
              <br />
              <span className="text-foreground">souhaitez-vous réparer&nbsp;?</span>
            </h2>
          </div>
          <div className="flex-1">
            <RepairModelSearch inputId="device-search" />
          </div>
        </div>

        {/* ── Séparateur ── */}


        {/* ── Sous-titre ── */}
        <p className="text-center text-sm text-foreground/40 tracking-wide">
          Ou sélectionnez votre appareil ici
        </p>

        {/* ── Cartes appareils ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {devices.map((device) => (
            <DeviceCard key={device.id} device={device} />
          ))}
        </div>

        {/* ── Réassurance rotatif ── */}
        <RotatingRepairCapsule />

      </div>
    </section>
  )
}
