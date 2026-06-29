import Image from 'next/image'
import Link from 'next/link'
import MobileMenu from './MobileMenu'
import DesktopNav from './DesktopNav'
import LanguageSwitcher from './LanguageSwitcher'
import { SHOP_ENABLED } from '@/lib/config/features'

export type NavSubLink = { label: string; href: string }

export type NavLink = {
  label:        string
  href:         string
  accent?:      boolean
  hasDropdown?: boolean
  dropdownId?:  'reparation' | 'services'  /* discriminateur explicite du dropdown */
  subLinks?:    NavSubLink[]
}

const navLinksFr: NavLink[] = [
  { label: 'Accueil', href: '/' },
  {
    label:       'Réparation',
    href:        '/reparation',
    hasDropdown: true,
    dropdownId:  'reparation',
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
    dropdownId:  'services',
    subLinks: [
      { label: 'Récupération de données', href: '/services/recuperation-donnees'          },
      { label: "Rachat d'appareils",      href: '/services/rachat-de-votre-smartphone'    },
      { label: 'Dépannage 7/7',           href: '/services/depannage-reparation-domicile' },
      { label: 'Service de coursier',     href: '/service-de-coursier'                    },
      { label: "Dégâts d'eau",            href: '/reparation-degat-eau-lausanne'           },
    ],
  },
]

const navLinksEn: NavLink[] = [
  { label: 'Home', href: '/en' },
  {
    label:       'Repair',
    href:        '/en/services/smartphone-repair',
    hasDropdown: true,
    dropdownId:  'reparation',
    subLinks: [
      { label: 'Smartphone repair',   href: '/en/services/smartphone-repair'  },
      { label: 'Tablet repair',       href: '/en/express-tablet-repair'        },
      { label: 'Computer repair',     href: '/en/express-computer-repair'      },
      { label: 'Home repair service', href: '/en/services/home-repair-service' },
      { label: 'View all repairs',    href: '/en/repair'                       },
    ],
  },
  {
    label:       'Services',
    href:        '/en/services/data-recovery',
    hasDropdown: true,
    dropdownId:  'services',
    subLinks: [
      { label: 'Data recovery',       href: '/en/services/data-recovery'      },
      { label: 'Sell your device',    href: '/en/services/sell-your-device'    },
      { label: 'Home repair service', href: '/en/services/home-repair-service' },
      { label: 'Courier service',     href: '/en/courier-service'              },
      { label: 'Water damage repair', href: '/en/water-damage-repair-lausanne' },
    ],
  },
]

const rightLinksFr: NavLink[] = [
  { label: 'Contact', href: '/contact-clik-clak-lausanne' },
  { label: 'Shop',    href: '/shop-reparation-smartphone-lausanne', accent: true },
]

const rightLinksEn: NavLink[] = [
  { label: 'Contact', href: '/en/contact' },
  { label: 'Shop',    href: '/shop-reparation-smartphone-lausanne', accent: true },
]

interface HeaderProps {
  /** Locale courante — détermine les labels de navigation et le sélecteur FR | EN */
  locale?: 'fr' | 'en'
}

export default function Header({ locale = 'fr' }: HeaderProps) {
  const navLinks   = locale === 'en' ? navLinksEn   : navLinksFr
  const rightLinks = locale === 'en' ? rightLinksEn : rightLinksFr
  const allLinks   = [...navLinks, ...rightLinks]

  return (
    <header className="relative z-50 w-full shrink-0">

      {/* ── Mobile ─────────────────────────────────────────────────── */}
      <div className="flex md:hidden items-center justify-between px-4 py-2">
        <Link href={locale === 'en' ? '/en' : '/'} aria-label="ClikClak Repair — Home">
          <Image
            src="/assets/logo/clikclak-logo-horizontal.svg"
            alt="ClikClak Repair"
            width={140}
            height={23}
            priority
          />
        </Link>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <MobileMenu links={allLinks} shopEnabled={SHOP_ENABLED} locale={locale} />
        </div>
      </div>

      {/* ── Desktop ────────────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-[auto_1fr_auto] items-start gap-6 px-8 lg:px-12 pt-8 pb-4">

        {/* Logo vertical */}
        <Link href={locale === 'en' ? '/en' : '/'} aria-label="ClikClak Repair — Home">
          <Image
            src="/assets/logo/clikclak-logo.svg"
            alt="ClikClak Repair"
            width={55}
            height={78}
            priority
          />
        </Link>

        {/* Nav centrale + liens droite + sélecteur de langue */}
        <DesktopNav
          navLinks={navLinks}
          rightLinks={rightLinks}
          shopEnabled={SHOP_ENABLED}
          locale={locale}
        />

      </div>

    </header>
  )
}
