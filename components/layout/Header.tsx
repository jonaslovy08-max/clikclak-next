import Image from 'next/image'
import Link from 'next/link'
import MobileMenu from './MobileMenu'
import DesktopNav from './DesktopNav'

const navLinks = [
  { label: 'Accueil',                 href: '/' },
  { label: 'Réparation',              href: '/reparation', hasDropdown: true },
  { label: 'Récupération de données', href: '/services/recuperation-donnees' },
]

const rightLinks = [
  { label: 'Contact', href: '/contact-clik-clak-lausanne' },
  { label: 'Shop', href: '/shop-reparation-smartphone-lausanne', accent: true },
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
        <MobileMenu links={allLinks} />
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
        <DesktopNav navLinks={navLinks} rightLinks={rightLinks} />
      </div>

    </header>
  )
}
