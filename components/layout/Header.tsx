import Image from 'next/image'
import Link from 'next/link'
import MobileMenu from './MobileMenu'
import DesktopNav from './DesktopNav'
import { SHOP_ENABLED } from '@/lib/config/features'

export type NavSubLink = { label: string; href: string }

export type NavLink = {
  label:       string
  href:        string
  accent?:     boolean
  hasDropdown?: boolean
  subLinks?:   NavSubLink[]
}

const navLinks: NavLink[] = [
  { label: 'Accueil',    href: '/' },
  {
    label:       'Réparation',
    href:        '/reparation',
    hasDropdown: true,
    subLinks: [
      { label: 'Smartphone',  href: '/reparation-smartphone-express'         },
      { label: 'Tablette',    href: '/reparation-tablette-express'            },
      { label: 'Ordinateur',  href: '/reparation-ordinateur-express'          },
      { label: 'Dépannage',   href: '/services/depannage-reparation-domicile' },
      { label: 'Voir tous…',  href: '/reparation/'                            },
    ],
  },
  {
    label:       'Services',
    href:        '/services-nav',
    hasDropdown: true,
    subLinks: [
      { label: 'Récupération de données', href: '/services/recuperation-donnees'         },
      { label: "Rachat d'appareils",      href: '/services/rachat-de-votre-smartphone'   },
      { label: 'Dépannage 7/7',           href: '/services/depannage-reparation-domicile' },
      { label: 'Service de coursier',     href: '/service-de-coursier'                   },
      { label: "Dégâts d'eau",            href: '/reparation-degat-eau-lausanne'          },
    ],
  },
]

const rightLinks: NavLink[] = [
  { label: 'Contact', href: '/contact-clik-clak-lausanne' },
  { label: 'Shop',    href: '/shop-reparation-smartphone-lausanne', accent: true },
]

const allLinks = [...navLinks, ...rightLinks]

export default function Header() {
  return (
    <header className="relative z-50 w-full shrink-0">

      {/* ── Mobile ─────────────────────────────────────────────────── */}
      <div className="flex md:hidden items-center justify-between px-4 py-2">
        <Link href="/" aria-label="ClikClak Repair — Accueil">
          <Image
            src="/assets/logo/clikclak-logo-horizontal.svg"
            alt="ClikClak Repair"
            width={140}
            height={23}
            priority
          />
        </Link>
        <MobileMenu links={allLinks} shopEnabled={SHOP_ENABLED} />
      </div>

      {/* ── Desktop ────────────────────────────────────────────────── */}
      {/* grid-cols-[auto_1fr_auto] : logo | nav centré | liens droite */}
      {/* items-start : aligne le haut du logo avec le haut du texte de navigation */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-start gap-6 px-8 lg:px-12 pt-8 pb-4">

        {/* Logo vertical */}
        <Link href="/" aria-label="ClikClak Repair — Accueil">
          <Image
            src="/assets/logo/clikclak-logo.svg"
            alt="ClikClak Repair"
            width={55}
            height={78}
            priority
          />
        </Link>

        {/* Nav centrale + liens droite — client component pour la barre indicatrice */}
        <DesktopNav navLinks={navLinks} rightLinks={rightLinks} shopEnabled={SHOP_ENABLED} />
      </div>

    </header>
  )
}
