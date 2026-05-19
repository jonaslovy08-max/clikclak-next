/*
  ServiceIcons — SVG inlinés pour les 5 items de ServiceSelector.

  Chaque composant reçoit drawRef (ref sur le path/polyline animé au hover)
  et un id unique pour le gradient linearGradient (évite les collisions DOM).

  Structure des SVG originaux (262.02×262.02) :
    cls-1 : stroke #fff   (contour appareil)
    cls-2 : stroke gradient lime→blanc (outil de réparation) — ANIMÉ pour sp/co/ta/cr
    data-recovery : cls-2 = blanc, drawRef sur l'arc circulaire

  Couleurs 100% originales conservées. Aucune modification de couleur.
*/

import React from 'react'

/* ── Types ─────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrawRef = React.Ref<any>
type Props = { drawRef?: DrawRef; className?: string }

/* ── Stroke props communs ──────────────────────────────────────── */
const sw = {
  fill:           'none',
  strokeLinecap:  'round'  as const,
  strokeLinejoin: 'round'  as const,
  strokeWidth:    2,
}
const W = { ...sw, stroke: '#fff' }

/* ── Dégradé lime → blanc (commun aux 4 premiers) ─────────────── */
function LimeGrad({ id, x1, y1, x2, y2 }: { id: string; x1: number; y1: number; x2: number; y2: number }) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2} gradientUnits="userSpaceOnUse">
      <stop offset="0"   stopColor="#ccff26"/>
      <stop offset=".32" stopColor="#ccff28"/>
      <stop offset=".47" stopColor="#ceff2f"/>
      <stop offset=".57" stopColor="#d1ff3b"/>
      <stop offset=".66" stopColor="#d5ff4d"/>
      <stop offset=".74" stopColor="#daff65"/>
      <stop offset=".81" stopColor="#e1ff82"/>
      <stop offset=".88" stopColor="#e9ffa4"/>
      <stop offset=".94" stopColor="#f3ffcc"/>
      <stop offset=".99" stopColor="#fdfff7"/>
      <stop offset="1"   stopColor="#fff"/>
    </linearGradient>
  )
}

/* ── Smartphones ───────────────────────────────────────────────── */
export function IconSmartphone({ drawRef, className }: Props) {
  return (
    <svg viewBox="0 0 262.02 262.02" className={className} aria-hidden>
      <defs><LimeGrad id="sp-g" x1={112.23} y1={109.75} x2={112.23} y2={172.44}/></defs>
      <path {...W} d="M91.54,145.93v37.03c0,2.76,2.24,5,5,5h57.25c2.76,0,5-2.24,5-5v-108.59c0-2.76-2.24-5-5-5h-57.25c-2.76,0-5,2.24-5,5v28.87"/>
      <path {...sw} stroke="url(#sp-g)" ref={drawRef}
        d="M107.58,145c6.6,2.99,14.65,1.77,20.08-3.66,4.99-4.99,6.43-12.21,4.29-18.48-.27-.79-1.28-1.01-1.87-.42l-9.47,9.47c-.79.79-2,.96-2.97.42l-7.78-4.29c-1.01-.55-1.2-1.92-.39-2.73l11.31-11.31c.81-.81.45-2.18-.65-2.51-6.11-1.83-13.01-.32-17.83,4.5-5.44,5.44-6.65,13.51-3.64,20.13h0s-7.14,7.14-7.14,7.14v28.19"/>
      <line {...W} x1="116.18" y1="177.96" x2="134.15" y2="177.96"/>
      <line {...W} x1="116.18" y1="79.38"  x2="124.14" y2="79.38"/>
      <line {...W} x1="134.15" y1="79.38"  x2="134.15" y2="79.38"/>
    </svg>
  )
}

/* ── Ordinateurs ───────────────────────────────────────────────── */
export function IconComputer({ drawRef, className }: Props) {
  return (
    <svg viewBox="0 0 262.02 262.02" className={className} aria-hidden>
      <defs><LimeGrad id="co-g" x1={81.23} y1={106.5} x2={81.23} y2={169.2}/></defs>
      <g>
        <line {...W} x1="124.05" y1="86.34"  x2="132.75" y2="86.34"/>
        <line {...W} x1="143.7"  y1="86.34"  x2="143.7"  y2="86.34"/>
        <path {...W} d="M60.3,141.39v33.78c0,3.02,2.45,5.47,5.47,5.47h131.88c3.02,0,5.47-2.45,5.47-5.47v-94.29c0-3.02-2.45-5.47-5.47-5.47H65.77c-3.02,0-5.47,2.45-5.47,5.47v19.78"/>
        <line {...W} x1="52.03"  y1="187.97" x2="209.99" y2="187.97"/>
      </g>
      <path {...sw} stroke="url(#co-g)" ref={drawRef}
        d="M76.59,141.76c6.6,2.99,14.65,1.77,20.08-3.66,4.99-4.99,6.43-12.21,4.29-18.48-.27-.79-1.28-1.01-1.87-.42l-9.47,9.47c-.79.79-2,.96-2.97.42l-7.78-4.29c-1.01-.55-1.2-1.92-.39-2.73l11.31-11.31c.81-.81.45-2.18-.65-2.51-6.11-1.83-13.01-.32-17.83,4.5-5.44,5.44-6.65,13.51-3.64,20.13h0s-7.14,7.14-7.14,7.14v28.19"/>
    </svg>
  )
}

/* ── Tablette ──────────────────────────────────────────────────── */
export function IconTablet({ drawRef, className }: Props) {
  return (
    <svg viewBox="0 0 262.02 262.02" className={className} aria-hidden>
      <defs><LimeGrad id="ta-g" x1={102.26} y1={106.82} x2={102.26} y2={169.52}/></defs>
      <g>
        <path {...W} d="M81.58,92.64v-29.11c0-3.03,2.45-5.48,5.48-5.48h87.91c3.03,0,5.48,2.45,5.48,5.48v118.96c0,3.03-2.45,5.48-5.48,5.48h-87.91c-3.03,0-5.48-2.45-5.48-5.48v-32.69"/>
        <line {...W} x1="121.98" y1="177.01" x2="141.66" y2="177.01"/>
        <g>
          <line {...W} x1="121.98" y1="69.01" x2="130.69" y2="69.01"/>
          <line {...W} x1="141.66" y1="69.01" x2="141.66" y2="69.01"/>
        </g>
      </g>
      <path {...sw} stroke="url(#ta-g)" ref={drawRef}
        d="M97.62,142.08c6.6,2.99,14.65,1.77,20.08-3.66,4.99-4.99,6.43-12.21,4.29-18.48-.27-.79-1.28-1.01-1.87-.42l-9.47,9.47c-.79.79-2,.96-2.97.42l-7.78-4.29c-1.01-.55-1.2-1.92-.39-2.73l11.31-11.31c.81-.81.45-2.18-.65-2.51-6.11-1.83-13.01-.32-17.83,4.5-5.44,5.44-6.65,13.51-3.64,20.13h0s-7.14,7.14-7.14,7.14v28.19"/>
    </svg>
  )
}

/* ── Dépannage 7/7 (coursier) ──────────────────────────────────── */
export function IconCourier({ drawRef, className }: Props) {
  return (
    <svg viewBox="0 0 262.02 262.02" className={className} aria-hidden>
      <defs><LimeGrad id="cr-g" x1={72.46} y1={104.76} x2={72.46} y2={167.46}/></defs>
      <g>
        <g>
          <path {...W} d="M163.34,171.37c-1.11,2-3.25,3.35-5.72,3.35h-66.5"/>
          <path {...W} d="M51.77,110.55v-21.41c0-3.27,2.65-5.92,5.92-5.92h100.58c3.27,0,5.92,2.65,5.92,5.92v79.03"/>
          <path {...W} d="M51.77,141v27.81c0,3.27,2.65,5.92,5.92,5.92h6.96"/>
        </g>
        <path {...W} d="M189.4,174.72h14.93c3.27,0,5.92-2.65,5.92-5.92v-25.28c0-3.27-2.65-5.92-5.92-5.92h-40.15v31.46"/>
        <circle {...W} cx="77.88" cy="174.72" r="13.24"/>
        <circle {...W} cx="176.16" cy="174.72" r="13.24"/>
        <path {...W} d="M164.19,113.27h6.9c1.23,0,2.34.77,2.77,1.92l8.78,13.88"/>
      </g>
      <path {...sw} stroke="url(#cr-g)" ref={drawRef}
        d="M67.81,140.02c6.6,2.99,14.65,1.77,20.08-3.66,4.99-4.99,6.43-12.21,4.29-18.48-.27-.79-1.28-1.01-1.87-.42l-9.47,9.47c-.79.79-2,.96-2.97.42l-7.78-4.29c-1.01-.55-1.2-1.92-.39-2.73l11.31-11.31c.81-.81.45-2.18-.65-2.51-6.11-1.83-13.01-.32-17.83,4.5-5.44,5.44-6.65,13.51-3.64,20.13h0s-7.14,7.14-7.14,7.14v28.19"/>
    </svg>
  )
}

/* ── Récupération de données ───────────────────────────────────── */
/* drawRef sur la polyline lime (élément coloré, animé au hover) */
export function IconDataRecovery({ drawRef, className }: Props) {
  return (
    <svg viewBox="0 0 262.02 262.02" className={className} aria-hidden>
      <defs>
        <clipPath id="dr-cp1">
          <path fill="none" d="M133.12,101.82l-.12-.28h0c-.22-.51,0-1.1.51-1.33s1.1,0,1.32.51l.14.31-1.84.78Z"/>
        </clipPath>
        <clipPath id="dr-cp2">
          <path fill="none" d="M126.35,91.52l.3.17c.48.27.66.88.39,1.36-.27.48-.88.66-1.36.39h-.02s-.27-.16-.27-.16l.96-1.75Z"/>
        </clipPath>
      </defs>

      {/* Arc circulaire — statique */}
      <path {...W}
        d="M127.75,140.19c-8.93,3.07-19.11,2.34-27.87-2.87-15.8-9.4-20.98-29.83-11.58-45.62,9.4-15.8,29.83-20.98,45.62-11.58,15.8,9.4,20.98,29.83,11.58,45.62"/>

      {/* Flèche lime — drawRef ici (élément coloré, animé au hover) */}
      <polyline {...sw} stroke="#cf3" ref={drawRef} points="128.07 106.35 134.09 100.33 140.12 106.35"/>

      {/* Images PNG embarquées */}
      <g>
        <g clipPath="url(#dr-cp1)">
          <image width="5" height="6" transform="translate(131.01 97.01)"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAGCAYAAAAL+1RLAAAACXBIWXMAAAsSAAALEgHS3X78AAAAKElEQVQImWM881/tPwMUmDDeYmRgYGBgYsACUARhurCrhJmDUztMAQDhuAkcE8iv6AAAAABJRU5ErkJggg=="/>
        </g>
        <image width="40" height="40" transform="translate(97.01 89.01)"
          href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAAACXBIWXMAAAsSAAALEgHS3X78AAACn0lEQVRYhc2Wv27TUBSHv3PjpBG8ABNSAaWUAipNX6ILEysLAxIDE3tHxMKGhNiQWNl4C5S0CEFLK0BCDLDwAFUa/xiu3diu4zgpxfdElq6t43u//M4/GwvYL72So4tjCaOTXK3kauPoYrRwXMTRwYjo2rItclY0j/NPPZVjCRDiGNECwOjk/DxoB8NOnoz0R2AYXSK7UBu2FuAPbcuIsARIjDAcYoxN3UIIYYDRTTDbGI5YsZy5WpCVgN/1RI4OYgxAjNEiAmIu2cPaKhzpd6JeG/9H60d7quc3PVaaU37TCKPNZdteKJcAxjqSo4OZ1d6j1PGrHgkcjnbi1GXZni0MdhZrFR8c6oHAB0T41RV73ggcFHLwQPflk9vnnAFX7UVjcAAufztGjAAB4pq9bBQOMiHe1z35NuID27PXjcNBTkERc4QQK/YmCDhIAPd0V+IYIAlxczZQTwP1lN7nFBRjVu1tY+plwdJ19Flb8qoZJV2ncXNpSwFYs3eN5t6mHZ46P0q/TE51nEDMiThZxpWOTdhAPbm0OBQIYDHM0US5YFpfznJtJkSLfGjDhANwIcMBROmIC6XNZKcJ5KjCqOKsbdqhRdlJEqLlqviD+sElpFu39+bD23yIi/kHJwrq5LerO0GomE6UCDzepN00w1emHmTm267WEwev5IZ9/G+zrwiXnceFUTfx29GtIEKdU2lHt1UM9YZ9Olclq9SDwviYhHXyzlBr56bkLDiY8o21o5uCtHj8qm97/0zJsoIog5sKCFnl8iHv2/6ZQOeBqwQEGOpGZrPsvqJvX+YCHWhFZS2sCm4mIMBQqyU5mH9UBuuBqt+bBVcLMLU86PS60cxGr1pgqc2dT0NdrySoAty0g7nPO3NlFoGzgIsAFe0v4dgKvpzx3jAAAAAASUVORK5CYII="/>
        <g clipPath="url(#dr-cp2)">
          <image width="7" height="5" transform="translate(124.01 91.01)"
            href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAFCAYAAACJmvbYAAAACXBIWXMAAAsSAAALEgHS3X78AAAALUlEQVQImXXLMQoAIBDEwFn//2Ab0epADk2ZEGvPXWjkKZPA6AFqSBf3+b3gACNXG+i7zxuOAAAAAElFTkSuQmCC"/>
        </g>
      </g>

      <path {...W} d="M63.84,161.75v12.79c0,3.28,2.66,5.94,5.94,5.94h132.52c3.28,0,5.94-2.66,5.94-5.94v-76.02c0-3.28-2.66-5.94-5.94-5.94h-55.89"/>
      <line {...W} x1="55.8"  y1="187.97" x2="215.43" y2="187.97"/>
      <path {...W} d="M46.59,100.05v-22.36c0-1.64,1.33-2.97,2.97-2.97h38.15c1.64,0,2.97,1.33,2.97,2.97v10.53"/>
      <path {...W} d="M90.68,128.84v19.77c0,1.64-1.33,2.97-2.97,2.97h-38.15c-1.64,0-2.97-1.33-2.97-2.97v-56.45"/>
      <line {...W} x1="62.46" y1="142.81" x2="74.8"   y2="142.81"/>
    </svg>
  )
}
