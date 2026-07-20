import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import ScreenCrackOverlay from '@/components/repair/ScreenCrackOverlay'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation écran smartphone Lausanne | iPhone, Samsung & Android | ClikClak',
  description:
    'Écran fissuré, tactile défectueux ou affichage noir ? ClikClak répare les écrans de smartphones à Lausanne : iPhone, Samsung, OPPO, Huawei, Sony Xperia et autres modèles.',
  alternates: { canonical: `${SITE_URL}/services/reparation-ecran` },
  openGraph: {
    title: 'Réparation écran smartphone Lausanne — ClikClak',
    description: 'Réparation d\'écran à Lausanne : iPhone, Samsung, OPPO, Huawei, Sony Xperia. Tarif selon modèle.',
    url: `${SITE_URL}/services/reparation-ecran`,
    locale: 'fr_CH', type: 'website',
  },
}

const FAQ = [
  {
    q: 'Quand faut-il remplacer l\'écran ?',
    a: "Lorsque la vitre est fissurée, que le tactile ne répond plus correctement, que l'affichage présente des lignes, des taches noires ou un écran noir persistant.",
  },
  {
    q: 'Un écran noir est-il toujours couvert par la garantie ?',
    a: "Non. Si l'écran noir apparaît après un choc, une chute ou une pression externe, il s'agit généralement d'un dommage physique non couvert.",
  },
  {
    q: 'Est-ce que mes données sont supprimées ?',
    a: "Normalement non, mais une sauvegarde est recommandée avant toute intervention technique.",
  },
  {
    q: 'Combien de temps dure une réparation écran ?',
    a: "Cela dépend du modèle, de la disponibilité de la pièce et de l'état de l'appareil. Certaines réparations peuvent être rapides, d'autres nécessitent plus de temps.",
  },
  {
    q: "L'étanchéité reste-t-elle garantie après réparation ?",
    a: "Non. Après ouverture d'un appareil, l'étanchéité d'origine ne peut pas être garantie.",
  },
]

export default function ReparationEcranPage() {
  return (
    <>
      <ScreenCrackOverlay />
      <InterventionPageLayout
      pill="Réparation écran"
      h1="Réparation écran smartphone à Lausanne"
      intro="Un écran fissuré, un tactile qui répond mal ou un affichage noir peut rendre votre smartphone difficile à utiliser. ClikClak vous aide à identifier votre modèle et à consulter le tarif adapté pour le remplacement de l'écran."
      interventionItems={[
        'Contrôle de l\'affichage',
        'Contrôle du tactile',
        'Vérification du châssis',
        'Remplacement écran / vitre selon modèle',
        'Test complet après réparation',
      ]}
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/screen-change.webp',
        mobileSrc: '/assets/images/homepage/service-sections/screen-change-mobile.webp',
        alt:       'Réparation écran smartphone ClikClak Lausanne',
      }}
      bottomSlot={<RelatedBlogPosts postSlugs={['connaitre-modele-iphone', 'telephone-tombe-dans-l-eau', 'batterie-smartphone-fatiguee']} />}
    />
    </>
  )
}
