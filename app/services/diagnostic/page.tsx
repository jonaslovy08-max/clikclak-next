import type { Metadata } from 'next'
import InterventionPageLayout from '@/components/repair/InterventionPageLayout'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Diagnostic smartphone Lausanne | Panne, écran, batterie, charge | ClikClak',
  description:
    'Smartphone qui ne s\'allume plus, panne inconnue, charge impossible ou écran noir ? ClikClak réalise un diagnostic à Lausanne pour identifier l\'origine du problème.',
  alternates: { canonical: `${SITE_URL}/services/diagnostic/` },
  openGraph: {
    title: 'Diagnostic smartphone Lausanne — ClikClak',
    description: 'Diagnostic smartphone à Lausanne : panne inconnue, écran noir, batterie, charge. Estimation avant intervention.',
    url: `${SITE_URL}/services/diagnostic/`,
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
      h1="Diagnostic smartphone à Lausanne"
      intro="Lorsqu'une panne n'est pas évidente, un diagnostic permet d'identifier si le problème vient de l'écran, de la batterie, du connecteur, de la carte mère, d'un dégât liquide ou d'un autre composant."
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
    />
  )
}
