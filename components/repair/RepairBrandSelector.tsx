'use client'

import { useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import gsap from 'gsap'

/*
  RepairBrandSelector — grille de sélection de marques smartphone.

  Logos : technique CSS mask-image.
    - La forme du SVG sert de masque (alpha).
    - La couleur visible vient du background-color de l'élément masqué.
    - État normal : fond sombre + logo blanc (#f2f2f2).
    - État hover  : fond lime #ccff33 + logo noir (#191919) via GSAP.
    - Aucun filter, aucun opacity, aucun invert sur les SVG.

  Animation GSAP :
    - scale 1.03 au hover (transformOrigin: center bottom)
    - fond → #ccff33, bordure → #ccff33
    - logo backgroundColor → #191919
    - label color → #f2f2f2
    - durée 0.3 s, ease power2.out
    - retour : timeScale(1.8).reverse()
    - prefers-reduced-motion : color change instantané, pas de scale
*/

type Brand = {
  id:    string
  label: string
  icon:  string
  href:  string
}

/* Tunnel réparation : Réparation → Smartphone → Marque → Modèle → Tarifs
   Apple  : données structurées dans data/iphoneRepairs.ts → page sélection modèle
   Autres : pages marques existantes (stub → contact/diagnostic tant que prix non structurés) */
const brands: Brand[] = [
  { id: 'apple',   label: 'Apple',        icon: '/assets/icons/icon-iphone.svg',       href: '/services/reparation-iphone'           },
  { id: 'samsung', label: 'Samsung',      icon: '/assets/icons/icon-samsung.svg',      href: '/services/reparation-samsung-lausanne' },
  { id: 'huawei',  label: 'Huawei',       icon: '/assets/icons/icon-huawei.svg',       href: '/services/reparation-huawei-lausanne'  },
  { id: 'pixel',   label: 'Google Pixel', icon: '/assets/icons/icon-google-pixel.svg', href: '/services/reparation-google-pixel'     },
  { id: 'oppo',    label: 'Oppo',         icon: '/assets/icons/icon-oppo.svg',         href: '/services/reparation-oppo'             },
  { id: 'xiaomi',  label: 'Xiaomi',       icon: '/assets/icons/icon-xiaomi.svg',       href: '/services/reparation-xiaomi'           },
  { id: 'sony',    label: 'Sony Xperia',  icon: '/assets/icons/icon-sony-xperia.svg',  href: '/services/reparation-sony-xperia'      },
]

function BrandCard({ brand }: { brand: Brand }) {
  const linkRef  = useRef<HTMLAnchorElement>(null)
  const frameRef = useRef<HTMLDivElement>(null)
  const logoRef  = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const tlRef    = useRef<gsap.core.Timeline | null>(null)
  const reduced  = useRef(false)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const link  = linkRef.current
    const frame = frameRef.current
    const logo  = logoRef.current
    const label = labelRef.current
    if (!link || !frame || !logo) return

    if (!reduced.current) {
      gsap.set(link, { scale: 1, transformOrigin: 'center bottom' })

      tlRef.current = gsap.timeline({ paused: true })
        .to(link, {
          scale: 1.03, duration: 0.3, ease: 'power2.out',
        }, 0)
        .to(frame, {
          backgroundColor: '#ccff33',
          borderColor:     '#ccff33',
          duration:        0.3, ease: 'power2.out',
        }, 0)
        .to(logo, {
          backgroundColor: '#191919',
          duration:        0.3, ease: 'power2.out',
        }, 0)
        .to(label ?? [], {
          color:    '#f2f2f2',
          duration: 0.3, ease: 'power2.out',
        }, 0)
    }

    return () => { tlRef.current?.kill(); tlRef.current = null }
  }, [])

  const show = useCallback(() => {
    if (!reduced.current) {
      tlRef.current?.timeScale(1).play()
    } else {
      if (frameRef.current) {
        frameRef.current.style.backgroundColor = '#ccff33'
        frameRef.current.style.borderColor = '#ccff33'
      }
      if (logoRef.current)  logoRef.current.style.backgroundColor  = '#191919'
      if (labelRef.current) labelRef.current.style.color = '#f2f2f2'
    }
  }, [])

  const hide = useCallback(() => {
    if (!reduced.current) {
      tlRef.current?.timeScale(1.8).reverse()
    } else {
      if (frameRef.current) {
        frameRef.current.style.backgroundColor = 'rgba(255,255,255,0.02)'
        frameRef.current.style.borderColor = 'rgba(242,242,242,0.18)'
      }
      if (logoRef.current)  logoRef.current.style.backgroundColor  = '#f2f2f2'
      if (labelRef.current) labelRef.current.style.color = 'rgba(242,242,242,0.65)'
    }
  }, [])

  const maskBase: React.CSSProperties = {
    maskImage:          `url('${brand.icon}')`,
    maskSize:           'contain',
    maskRepeat:         'no-repeat',
    maskPosition:       'center',
    WebkitMaskImage:    `url('${brand.icon}')`,
    WebkitMaskSize:     'contain',
    WebkitMaskRepeat:   'no-repeat',
    WebkitMaskPosition: 'center',
  }

  return (
    <Link
      ref={linkRef}
      href={brand.href}
      aria-label={`Réparation ${brand.label}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      className="flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm"
    >
      {/* Cadre carte */}
      <div
        ref={frameRef}
        className="choice-card-frame w-full aspect-square flex items-center justify-center p-5"
        style={{
          backgroundColor: 'rgba(255,255,255,0.02)',
          border:          '1px solid rgba(242,242,242,0.18)',
          borderRadius:    12,
        }}
      >
        {/* Masque SVG — backgroundColor = couleur du logo */}
        <div
          ref={logoRef}
          className="w-[68%] h-[68%]"
          style={{ backgroundColor: '#f2f2f2', ...maskBase }}
        />
      </div>

      {/* Label */}
      <span
        ref={labelRef}
        className="text-sm font-light text-center"
        style={{ color: 'rgba(242,242,242,0.65)' }}
      >
        {brand.label}
      </span>
    </Link>
  )
}

export default function RepairBrandSelector() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 lg:gap-6">
      {brands.map(brand => (
        <BrandCard key={brand.id} brand={brand} />
      ))}
    </div>
  )
}
