export type HeroSlide = {
  image:    string
  imageAlt: string
  isH1:     boolean
  title:    string
  desc:     string
  ctaPrimary:   { label: string; href: string }
  ctaSecondary: { label: string; href: string }
}

export const heroSlides: HeroSlide[] = [
  {
    image:    '/assets/hero/01_hero_slide_rep_smartphone.webp',
    imageAlt: 'Technicien Clik Clak Repair effectuant une réparation de smartphone à Lausanne',
    isH1:     true,
    title:    'Réparation smartphone Lausanne',
    desc:     "Écran, batterie ou connecteur de charge : vos données restent intactes dans la quasi-totalité des cas. ClikClak répare votre smartphone à Lausanne avec précision.",
    ctaPrimary:   { label: 'Réparer !', href: '#selection-service' },
    ctaSecondary: { label: 'Contact',   href: '#contact' },
  },
  {
    image:    '/assets/hero/02_hero_slide_ordinateur.webp',
    imageAlt: 'Réparation d\'ordinateur — Clik Clak Repair Lausanne',
    isH1:     false,
    title:    'Réparation ordinateur Lausanne',
    desc:     "Lenteur, panne de démarrage, clavier ou batterie défaillante — une panne d'ordinateur ne signifie pas la perte de vos fichiers. Diagnostic clair, solution adaptée.",
    ctaPrimary:   { label: 'Réparer !',      href: '#selection-service' },
    ctaSecondary: { label: 'En savoir plus', href: '/reparation' },
  },
  {
    image:    '/assets/hero/03_hero_slide_tablette.webp',
    imageAlt: 'Réparation de tablette — Clik Clak Repair Lausanne',
    isH1:     false,
    title:    'Réparation tablette Lausanne',
    desc:     "Votre tablette mérite d'être réparée plutôt que remplacée. Écran cassé, batterie fatiguée ou panne tactile : vos photos, applications et documents restent préservés.",
    ctaPrimary:   { label: 'Réparer !', href: '#selection-service' },
    ctaSecondary: { label: 'Contact',   href: '#contact' },
  },
  {
    image:    '/assets/hero/04_hero_slide_recup-donnees.webp',
    imageAlt: 'Récupération de données — Clik Clak Repair Lausanne',
    isH1:     false,
    title:    'Récupération de données Lausanne',
    desc:     "Même lorsqu'un appareil ne s'allume plus, vos données ne sont pas forcément perdues. Smartphone, ordinateur ou support endommagé — nous analysons les possibilités avant toute décision.",
    ctaPrimary:   { label: 'Récupérer', href: '/services/recuperation-donnees' },
    ctaSecondary: { label: 'Contact',               href: '#contact' },
  },
]
