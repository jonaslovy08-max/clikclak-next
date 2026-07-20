import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation connecteur de charge Lausanne | iPhone, Samsung & Android | ClikClak',
  description:
    'Votre smartphone ne charge plus ou le câble tient mal ? ClikClak répare les connecteurs de charge à Lausanne selon le modèle : iPhone, Samsung, OPPO, Huawei et autres appareils.',
  alternates: { canonical: `${SITE_URL}/services/connecteur-de-charge` },
  openGraph: {
    title: 'Réparation connecteur de charge Lausanne — ClikClak',
    description: 'Réparation connecteur de charge à Lausanne : iPhone, Samsung, OPPO, Huawei. Tarif selon modèle.',
    url: `${SITE_URL}/services/connecteur-de-charge`,
    locale: 'fr_CH', type: 'website',
  },
}

const FAQ = [
  {
    q: 'Pourquoi mon téléphone ne charge plus ?',
    a: "Le problème peut venir du câble, de l'adaptateur, du connecteur, de la batterie ou de la carte mère. Un diagnostic permet d'identifier l'origine.",
  },
  {
    q: 'Peut-on nettoyer le connecteur sans le remplacer ?',
    a: "Parfois oui, si le problème vient de poussière ou d'un dépôt dans le port. Un diagnostic permet de confirmer avant toute intervention.",
  },
  {
    q: 'Le connecteur de charge est-il toujours remplaçable ?',
    a: "Selon le modèle, il peut être remplacé séparément ou être lié à d'autres composants. Le tarif dépend du modèle.",
  },
  {
    q: 'Est-ce que la charge sans fil fonctionne encore ?',
    a: "Cela dépend du modèle et de la panne. Le diagnostic permet de vérifier les deux systèmes de charge.",
  },
  {
    q: "Combien de temps prend l'intervention ?",
    a: "Cela dépend du modèle, de l'état de l'appareil et de la disponibilité des pièces.",
  },
]

export default function ConnecteurDeChargePage() {
  return (
    <InterventionPageLayout
      pill="Connecteur de charge"
      h1="Réparation connecteur de charge smartphone à Lausanne"
      intro="Un connecteur de charge défectueux peut empêcher la recharge, provoquer une charge instable ou rendre la connexion avec un ordinateur impossible. ClikClak vérifie l'origine du problème avant remplacement."
      interventionItems={[
        'Contrôle du câble et de la charge',
        'Nettoyage visuel si nécessaire',
        'Vérification du port de charge',
        'Remplacement du connecteur selon modèle',
        'Test de charge et de connexion',
      ]}
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/conn-charge.webp',
        mobileSrc: '/assets/images/homepage/service-sections/conn-charge-mobile.webp',
        alt:       'Réparation connecteur de charge smartphone ClikClak Lausanne',
      }}
      bottomSlot={<RelatedBlogPosts postSlugs={['batterie-smartphone-fatiguee', 'connaitre-modele-iphone']} />}
    />
  )
}
