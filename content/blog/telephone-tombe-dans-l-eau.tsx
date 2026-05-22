import type { BlogMeta } from '@/lib/blog'
import Link from 'next/link'

export const meta: BlogMeta = {
  title:       "Que faire si votre téléphone tombe dans l'eau ?",
  description: "Les bons réflexes après un dégât d'eau sur smartphone, avant diagnostic chez un technicien.",
  slug:        'telephone-tombe-dans-l-eau',
  date:        '2026-05-22',
  updatedAt:   '2026-05-22',
  category:    'Conseils',
  author:      'ClikClak',
  tags:        ["dégât d'eau", 'smartphone', 'diagnostic'],
  published:   true,
  image:       '/assets/images/blog/telephone-tombe-dans-l-eau.webp',
  imageAlt:    "Téléphone tombé dans l'eau avant diagnostic",
}

export default function Article() {
  return (
    <div className="blog-content">
      <p>
        Un smartphone immergé dans l'eau, renversé dans un verre ou tombé dans
        les toilettes — c'est une situation fréquente. Les premières minutes
        sont décisives. Voici ce qu'il faut faire, et ce qu'il faut éviter.
      </p>

      <h2>Ce qu'il faut faire immédiatement</h2>

      <h3>Éteignez l'appareil si ce n'est pas encore fait</h3>
      <p>
        Si votre téléphone est encore allumé, éteignez-le sans attendre. Un
        appareil sous tension en présence d'eau augmente le risque de
        court-circuit et de dommages irréversibles sur la carte mère.
      </p>

      <h3>Séchez l'extérieur avec un tissu propre et sec</h3>
      <p>
        Essuyez délicatement la surface, les boutons, le port de charge et les
        haut-parleurs. Évitez de frotter vigoureusement.
      </p>

      <h3>Retirez la coque et la carte SIM</h3>
      <p>
        Si votre modèle le permet, ouvrez le tiroir SIM et retirez la carte.
        Laissez le compartiment ouvert pour favoriser l'aération.
      </p>

      <h3>Faites contrôler l'appareil rapidement</h3>
      <p>
        Ne patientez pas plusieurs jours en espérant que l'appareil sèche de
        lui-même. L'oxydation interne progresse même à l'air libre. Un
        diagnostic technique permet d'évaluer les dégâts réels et d'intervenir
        avant que la corrosion ne s'étende.
      </p>

      <h2>Ce qu'il ne faut surtout pas faire</h2>

      <h3>Ne branchez pas l'appareil</h3>
      <p>
        Mettre un appareil mouillé en charge est l'une des causes les plus
        fréquentes de dommages définitifs. Attendez qu'un technicien ait
        contrôlé l'appareil.
      </p>

      <h3>Ne secouez pas et ne soufflez pas</h3>
      <p>
        Ces gestes peuvent faire pénétrer l'eau plus profondément dans
        l'appareil, vers des composants encore secs.
      </p>

      <h3>Ne chauffez pas l'appareil</h3>
      <p>
        Séchoir, four, plaque chauffante — la chaleur endommage les composants
        internes et peut faire gonfler la batterie. À éviter absolument.
      </p>

      <h3>Le riz ne sert à rien</h3>
      <p>
        La technique du riz est inefficace pour éliminer l'humidité à
        l'intérieur d'un smartphone. Elle fait surtout perdre un temps précieux
        pendant lequel l'oxydation progresse.
      </p>

      <h2>Et après ?</h2>
      <p>
        Même si l'appareil semble fonctionner normalement après un contact avec
        l'eau, un contrôle reste conseillé. Certains dommages — notamment sur
        la batterie ou la carte mère — peuvent apparaître plusieurs jours plus
        tard.
      </p>
      <p>
        Chez ClikClak à Lausanne, nous réalisons un diagnostic des dégâts
        d'eau pour évaluer l'état réel de votre appareil avant de proposer une
        intervention.
      </p>

      <div className="blog-cta">
        <Link href="/reparation-degat-eau-lausanne">
          Voir la page réparation dégâts d'eau
        </Link>
      </div>
    </div>
  )
}
