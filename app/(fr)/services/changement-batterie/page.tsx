import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Changement batterie smartphone Lausanne | iPhone, Samsung & Android | ClikClak',
  description:
    'Batterie qui se vide vite, smartphone qui s\'éteint ou charge instable ? ClikClak remplace les batteries de smartphones à Lausanne selon le modèle et la disponibilité des pièces.',
  alternates: { canonical: `${SITE_URL}/services/changement-batterie/` },
  openGraph: {
    title: 'Changement batterie smartphone Lausanne — ClikClak',
    description: 'Remplacement de batterie à Lausanne : iPhone, Samsung, OPPO, Huawei, Sony Xperia. Tarif selon modèle.',
    url: `${SITE_URL}/services/changement-batterie/`,
    locale: 'fr_CH', type: 'website',
  },
}

const FAQ = [
  {
    q: 'Comment savoir si ma batterie est usée ?',
    a: "Autonomie très faible, extinction soudaine, charge instable, surchauffe ou batterie gonflée sont des signes fréquents.",
  },
  {
    q: 'Une batterie gonflée est-elle dangereuse ?',
    a: "Oui, il faut éviter de continuer à utiliser l'appareil et le faire contrôler rapidement.",
  },
  {
    q: 'Le remplacement efface-t-il mes données ?',
    a: "Non en principe, mais une sauvegarde est toujours recommandée avant toute intervention.",
  },
  {
    q: 'La batterie est-elle garantie ?',
    a: "Les batteries sont généralement considérées comme des consommables. La durée de garantie dépend des conditions applicables et du type de pièce utilisée.",
  },
  {
    q: 'Faut-il changer aussi le connecteur de charge ?',
    a: "Pas forcément. Si le problème vient de la charge, un diagnostic permet de distinguer batterie, connecteur ou chargeur.",
  },
]

export default function ChangementBatteriePage() {
  return (
    <InterventionPageLayout
      pill="Changement de batterie"
      h1="Changement de batterie smartphone à Lausanne"
      intro="Une batterie usée peut provoquer une autonomie faible, des arrêts soudains, une charge lente ou un appareil qui chauffe. ClikClak contrôle votre smartphone et vous indique le prix adapté à votre modèle."
      interventionItems={[
        'Contrôle de l\'état de charge',
        'Vérification de la batterie',
        'Contrôle du connecteur si nécessaire',
        'Remplacement batterie selon modèle',
        'Test de charge après intervention',
      ]}
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/replace-battery.webp',
        mobileSrc: '/assets/images/homepage/service-sections/replace-battery-mobile.webp',
        alt:       'Changement de batterie smartphone ClikClak Lausanne',
      }}
      bottomSlot={<RelatedBlogPosts postSlugs={['batterie-smartphone-fatiguee', 'connaitre-modele-iphone']} />}
    />
  )
}
