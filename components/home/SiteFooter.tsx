import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import ContactPopover from '@/components/home/ContactPopover'
import GoogleMapFooter from '@/components/GoogleMapFooter'
import CookiePreferencesButton from '@/components/ui/CookiePreferencesButton'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Clik%20Clak%20Repair%20Rue%20du%20Petit-Ch%C3%AAne%209b%201003%20Lausanne'

const navLinks = [
  { label: 'Accueil',                 href: '/'                                },
  { label: 'Réparation',              href: '/reparation/'                     },
  { label: 'Récupération de données', href: '/services/recuperation-donnees/'  },
  { label: 'CGV',                     href: '/cgv'                             },
  { label: 'Confidentialité',         href: '/politique-confidentialite'       },
]

/*
  SiteFooter — footer principal ClikClak.

  Structure :
    1. Contenu padded (3 colonnes) + barre de copyright
    2. Carte Google Maps full-width en bas du footer

  data-pin-section : ciblé par SectionPinning (single-panel entrance animation).
*/
export default function SiteFooter() {
  return (
    <footer
      id="contact"
      data-pin-section
      aria-label="Contact et pied de page"
    >
      {/* ── Contenu padded ────────────────────────────────────────────── */}
      <div className="border-t border-white/10 px-6 md:px-14 lg:px-20 pt-16 pb-8">
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-12">

          {/* ── 3 colonnes ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-16">

            {/* ── Col 1 — Contact ──────────────────────────────────── */}
            <div className="flex flex-col gap-6">

              {/* Logo + nom */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo/clikclak-logo.svg"
                  alt=""
                  aria-hidden
                  width={40}
                  height={40}
                  className="w-10 h-10 shrink-0"
                />
                <span className="text-base font-light text-foreground tracking-wide">
                  Clik Clak Repair
                </span>
              </div>

              {/* Adresse */}
              <address className="not-italic font-light text-foreground/70 leading-relaxed text-sm">
                Rue du Petit-Chêne 9b<br />
                1003 Lausanne
              </address>

              {/* Email */}
              <a
                href="mailto:info@clikclak.ch"
                className="text-sm font-light text-foreground/70 hover:text-accent transition-colors duration-200 focus-visible:outline-none"
              >
                info@clikclak.ch
              </a>

              {/* Téléphone */}
              <a
                href="tel:+41213204477"
                aria-label="Numéro de téléphone Clik Clak Repair"
                className="text-accent text-xl font-light tracking-wide hover:brightness-110 transition-[filter] duration-200 focus-visible:outline-none"
              >
                021 320 44 77
              </a>

              {/* Bouton Contact */}
              <div>
                <ContactPopover />
              </div>
            </div>

            {/* ── Col 2 — Navigation ───────────────────────────────── */}
            <div className="flex flex-col gap-6">
              <span className="text-xs text-foreground/40 uppercase tracking-[0.2em]">
                Navigation
              </span>
              <nav aria-label="Navigation footer">
                <ul className="flex flex-col gap-3">
                  {navLinks.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-sm font-light text-foreground/70 hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                      >
                        <span className="text-accent" aria-hidden>–</span>
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <CookiePreferencesButton />
                  </li>
                </ul>
              </nav>
            </div>

            {/* ── Col 3 — Réseaux + Maps ───────────────────────────── */}
            <div className="flex flex-col gap-6">
              <span className="text-xs text-foreground/40 uppercase tracking-[0.2em]">
                Suivez-nous
              </span>

              <div className="flex flex-col gap-3">
                <a
                  href="https://www.instagram.com/clikclak_repair/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ClikClak sur Instagram"
                  className="inline-flex items-center gap-2 text-sm font-light text-foreground/50 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/icon-instagram.svg" alt="" aria-hidden width={18} height={18} />
                  <span>Instagram</span>
                </a>
                <a
                  href="https://www.facebook.com/clikclakrepair/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ClikClak sur Facebook"
                  className="inline-flex items-center gap-2 text-sm font-light text-foreground/50 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/icon-facebook.svg" alt="" aria-hidden width={18} height={18} />
                  <span>Facebook</span>
                </a>
              </div>

              <Button href={MAPS_URL} size="lg" external className="w-full justify-center">
                Ouvrir dans Maps
              </Button>
            </div>
          </div>

          {/* ── Barre de copyright ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-t border-[rgba(242,242,242,0.1)] pt-6">
            <p className="text-xs text-foreground/35 font-light">
              © ClikClak Sàrl 2026 — Tous droits réservés
            </p>
            <p className="text-xs text-foreground/35 font-light">
              Site web créé par&nbsp;:{' '}
              <a
                href="https://jonaslovy.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground/60 transition-colors duration-200 focus-visible:outline-none"
              >
                Jonas Lovy
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* ── Carte Google Maps — pleine largeur, sans padding ─────── */}
      <GoogleMapFooter />

    </footer>
  )
}
