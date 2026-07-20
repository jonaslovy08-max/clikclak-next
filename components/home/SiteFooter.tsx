import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import ContactPopover from '@/components/home/ContactPopover'
import GoogleMapFooter from '@/components/GoogleMapFooter'
import CookiePreferencesButton from '@/components/ui/CookiePreferencesButton'

const MAPS_URL =
  'https://www.google.com/maps/search/?api=1&query=Clik%20Clak%20Repair%20Rue%20du%20Petit-Ch%C3%AAne%209b%201003%20Lausanne'

const navLinksFr = [
  { label: 'Accueil',                 href: '/'                               },
  { label: 'Réparation',              href: '/reparation'                     },
  { label: 'Récupération de données', href: '/services/recuperation-donnees'  },
  { label: 'Entreprises',             href: '/services/entreprises'           },
  { label: 'Conseils',                href: '/blog'                           },
  { label: 'CGV',                     href: '/cgv'                            },
  { label: 'Confidentialité',         href: '/politique-confidentialite'      },
]

const navLinksEn = [
  { label: 'Home',             href: '/en'                               },
  { label: 'iPhone Repair',    href: '/en/services/iphone-repair'        },
  { label: 'Samsung Repair',   href: '/en/services/samsung-repair'       },
  { label: 'Sell your device', href: '/en/services/sell-your-device'     },
  { label: 'Business',         href: '/en/services/business'             },
  { label: 'Contact',          href: '/en/contact'                       },
  { label: 'Terms',            href: '/en/terms-and-conditions'          },
  { label: 'Privacy',          href: '/en/privacy-policy'                },
]

/*
  SiteFooter — footer principal ClikClak.

  Structure :
    1. Contenu padded (3 colonnes) + barre de copyright
    2. Carte Google Maps full-width en bas du footer

  data-pin-section : ciblé par SectionPinning (single-panel entrance animation).
*/
export default function SiteFooter({ locale = 'fr' }: { locale?: 'fr' | 'en' }) {
  const navLinks = locale === 'en' ? navLinksEn : navLinksFr
  const followLabel = locale === 'en' ? 'Follow us' : 'Suivez-nous'
  const mapsLabel   = locale === 'en' ? 'Open in Maps' : 'Ouvrir dans Maps'
  const rights      = locale === 'en' ? '© ClikClak Sàrl 2026 — All rights reserved' : '© ClikClak Sàrl 2026 — Tous droits réservés'
  const credit      = locale === 'en' ? 'Website by' : 'Site web créé par :'
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

              {/* Logo + nom — logo x2 */}
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/assets/logo/clikclak-logo.svg"
                  alt=""
                  aria-hidden
                  width={80}
                  height={80}
                  className="w-20 h-20 shrink-0"
                />
                <span className="text-base font-light text-foreground tracking-wide">
                  Clik Clak Repair
                </span>
              </div>

              {/* Adresse */}
              <address className="not-italic font-light text-foreground/70 leading-tight text-2xl md:text-sm">
                Rue du Petit-Chêne 9b<br />
                1003 Lausanne
              </address>

              {/* Email */}
              <a
                href="mailto:info@clikclak.ch"
                className="text-2xl md:text-sm font-light text-foreground/70 hover:text-accent transition-colors duration-200 focus-visible:outline-none leading-tight"
              >
                info@clikclak.ch
              </a>

              {/* Téléphone */}
              <a
                href="tel:+41213204477"
                aria-label="Numéro de téléphone Clik Clak Repair"
                className="text-accent text-2xl md:text-xl font-light tracking-wide hover:brightness-110 transition-[filter] duration-200 focus-visible:outline-none"
              >
                021 320 44 77
              </a>

              {/* Bouton Contact */}
              <div>
                <ContactPopover locale={locale} />
              </div>
            </div>

            {/* ── Col 2 — Navigation ───────────────────────────────── */}
            <div className="flex flex-col gap-6">
              {/* En-tête section — uppercase retiré, taille mobile augmentée */}
              <span className="text-base md:text-xs text-foreground/40 tracking-wide">
                Navigation
              </span>
              <nav aria-label="Navigation footer">
                <ul className="flex flex-col gap-3">
                  {navLinks.map(({ label, href }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        className="inline-flex items-center gap-2 text-2xl md:text-sm font-light leading-tight text-foreground/70 hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                      >
                        <span className="text-accent" aria-hidden>–</span>
                        {label}
                      </Link>
                    </li>
                  ))}
                  <li>
                    <CookiePreferencesButton locale={locale} />
                  </li>
                </ul>
              </nav>
            </div>

            {/* ── Col 3 — Réseaux + Maps ───────────────────────────── */}
            <div className="flex flex-col gap-6">
              {/* En-tête section — uppercase retiré */}
              <span className="text-base md:text-xs text-foreground/40 tracking-wide">
                {followLabel}
              </span>

              <div className="flex flex-col gap-3">
                <a
                  href="https://www.instagram.com/clikclak_repair/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="ClikClak sur Instagram"
                  className="inline-flex items-center gap-2 text-2xl md:text-sm font-light leading-tight text-foreground/50 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
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
                  className="inline-flex items-center gap-2 text-2xl md:text-sm font-light leading-tight text-foreground/50 hover:text-foreground transition-colors duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent rounded-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/assets/icons/icon-facebook.svg" alt="" aria-hidden width={18} height={18} />
                  <span>Facebook</span>
                </a>
              </div>

              <Button href={MAPS_URL} size="lg" external className="w-full justify-center">
                {mapsLabel}
              </Button>
            </div>
          </div>

          {/* ── Barre de copyright — opacity 0.5 ── */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-t border-[rgba(242,242,242,0.1)] pt-6">
            <p className="text-base md:text-xs text-foreground font-light opacity-50">
              {rights}
            </p>
            <p className="text-base md:text-xs text-foreground font-light opacity-50">
              {credit}&nbsp;{' '}
              <a
                href="https://jonaslovy.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground/80 transition-colors duration-200 focus-visible:outline-none"
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
