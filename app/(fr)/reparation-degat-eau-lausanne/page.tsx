import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Réparation dégât d\'eau smartphone Lausanne | Oxydation & diagnostic | ClikClak',
  description:
    'Smartphone tombé dans l\'eau ou touché par l\'humidité ? ClikClak réalise un diagnostic d\'oxydation à Lausanne et intervient selon l\'état de l\'appareil.',
  alternates: { canonical: `${SITE_URL}/reparation-degat-eau-lausanne` },
  openGraph: {
    title: 'Réparation dégât d\'eau smartphone Lausanne — ClikClak',
    description: 'Diagnostic d\'oxydation et intervention selon l\'état de l\'appareil. iPhone, Samsung et autres smartphones.',
    url: `${SITE_URL}/reparation-degat-eau-lausanne`,
    locale: 'fr_CH', type: 'website',
  },
}

const FAQ = [
  {
    q: 'Que faire si mon smartphone est tombé dans l\'eau ?',
    a: "Éteignez-le si possible, ne le rechargez pas et évitez de le rallumer. Contactez-nous rapidement.",
  },
  {
    q: 'Le riz est-il une bonne solution ?',
    a: "Non, le riz ne retire pas l'oxydation interne et peut retarder une vraie intervention. Il est préférable de déposer l'appareil rapidement.",
  },
  {
    q: 'Peut-on garantir la réparation après un dégât d\'eau ?',
    a: "Non. Un appareil oxydé peut retomber en panne même après une intervention réussie. L'objectif peut être la remise en fonctionnement ou la récupération des données, sans garantie de durée de vie.",
  },
  {
    q: 'Peut-on récupérer les données ?',
    a: "Dans certains cas oui. Cela dépend de l'état de la carte mère, du stockage et du niveau d'oxydation.",
  },
  {
    q: 'Combien de temps faut-il intervenir après un contact liquide ?',
    a: "Le plus tôt possible. L'oxydation peut continuer à progresser après le séchage apparent, même si l'appareil semble fonctionner.",
  },
]

export default function ReparationDegatEauPage() {
  return (
    <InterventionPageLayout
      pill="Dégâts d'eau"
      h1="Réparation dégâts d'eau smartphone à Lausanne"
      intro="Un smartphone exposé à l'eau, à l'humidité ou à un liquide peut subir des dégâts invisibles. Même s'il fonctionne encore, l'oxydation peut progresser et provoquer une panne plus grave."
      interventionItems={[
        "Diagnostic d'oxydation",
        'Inspection interne',
        'Nettoyage ou désoxydation selon le cas',
        'Contrôle carte mère et connecteurs',
        'Récupération de données si possible',
      ]}
      note="L'objectif peut être la remise en fonctionnement ou la récupération des données, mais aucune durée de vie ne peut être garantie après contact liquide."
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/water-damage.webp',
        mobileSrc: '/assets/images/homepage/service-sections/water-damage-mobile.webp',
        alt:       'Réparation après dégât d\'eau chez ClikClak Lausanne',
      }}
      bottomSlot={<RelatedBlogPosts postSlugs={['telephone-tombe-dans-l-eau', 'connaitre-modele-iphone']} />}
    />
  )
}
