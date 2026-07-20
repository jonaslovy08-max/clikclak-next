import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import RelatedBlogPosts from '@/components/blog/RelatedBlogPosts'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Diagnostic smartphone, tablette et ordinateur à Lausanne | ClikClak',
  description:
    'ClikClak réalise le diagnostic de smartphones, tablettes, iPad, ordinateurs et MacBook à Lausanne pour identifier l\'origine d\'une panne avant réparation.',
  alternates: { canonical: `${SITE_URL}/services/diagnostic` },
  openGraph: {
    title: 'Diagnostic smartphone, tablette et ordinateur à Lausanne — ClikClak',
    description: 'Diagnostic smartphones, tablettes, iPad, ordinateurs et MacBook à Lausanne : panne inconnue, écran noir, batterie, charge. Estimation avant intervention.',
    url: `${SITE_URL}/services/diagnostic`,
    locale: 'fr_CH', type: 'website',
  },
}

const FAQ = [
  {
    q: 'Quand demander un diagnostic ?',
    a: "Lorsque l'origine de la panne n'est pas claire, que l'appareil ne s'allume plus ou que plusieurs symptômes apparaissent simultanément.",
  },
  {
    q: 'Le diagnostic est-il toujours gratuit ?',
    a: "Non. Selon le cas, des frais de diagnostic peuvent s'appliquer, notamment si le devis est refusé ou si l'appareil est irréparable.",
  },
  {
    q: 'Combien de temps prend un diagnostic ?',
    a: "Cela dépend de la panne, du modèle et de l'état de l'appareil.",
  },
  {
    q: 'Suis-je obligé de réparer après le diagnostic ?',
    a: "Non. Vous pouvez accepter ou refuser la réparation après avoir reçu l'estimation.",
  },
  {
    q: "Que se passe-t-il si l'appareil est irréparable ?",
    a: "Nous vous informons du résultat et des options possibles, notamment la récupération de données si elle est pertinente.",
  },
]

export default function DiagnosticPage() {
  return (
    <InterventionPageLayout
      pill="Diagnostic"
      h1="Diagnostic smartphone, tablette et ordinateur à Lausanne"
      intro="Votre appareil présente une panne, un comportement instable ou un problème difficile à identifier ? ClikClak analyse smartphones, tablettes et ordinateurs afin de déterminer l'origine du problème avant toute intervention."
      interventionItems={[
        'Contrôle visuel',
        'Test charge / batterie',
        'Test écran / tactile',
        'Test connecteur',
        'Test caméra, micro, haut-parleur si nécessaire',
        'Contrôle oxydation',
        'Estimation avant réparation',
      ]}
      faqItems={FAQ}
      heroImage={{
        src:       '/assets/images/homepage/service-sections/diagnostic.webp',
        mobileSrc: '/assets/images/homepage/service-sections/diagnostic-mobile.webp',
        alt:       'Diagnostic smartphone ClikClak Lausanne',
      }}
      bottomSlot={<RelatedBlogPosts postSlugs={['connaitre-modele-iphone', 'telephone-tombe-dans-l-eau', 'batterie-smartphone-fatiguee']} />}
    />
  )
}
