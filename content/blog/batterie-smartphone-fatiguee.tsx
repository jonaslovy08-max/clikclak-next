import type { BlogMeta } from '@/lib/blog'
import Link from 'next/link'

export const meta: BlogMeta = {
  title:       'Batterie smartphone fatiguée : les signes à surveiller',
  description: "Comment reconnaître une batterie usée sur smartphone et quand envisager un remplacement.",
  slug:        'batterie-smartphone-fatiguee',
  date:        '2026-05-22',
  updatedAt:   '2026-05-22',
  category:    'Conseils',
  author:      'ClikClak',
  tags:        ['batterie', 'smartphone', 'réparation'],
  published:   true,
  image:       '/assets/images/blog/batterie-smartphone-fatiguee.webp',
  imageAlt:    'Batterie smartphone fatiguée',
}

export default function Article() {
  return (
    <div className="blog-content">
      <p>
        Une batterie de smartphone se dégrade naturellement avec le temps et
        les cycles de charge. Après 500 à 800 cycles complets, l'autonomie
        disponible peut être significativement réduite. Voici les signes qui
        indiquent qu'un remplacement peut être utile.
      </p>

      <h2>Les signes d'une batterie fatiguée</h2>

      <h3>Autonomie très faible</h3>
      <p>
        Votre téléphone ne tient plus une journée alors qu'il le faisait
        facilement avant. Vous devez le recharger plusieurs fois par jour même
        avec une utilisation modérée.
      </p>

      <h3>Extinction soudaine</h3>
      <p>
        L'appareil s'éteint brusquement alors que la barre de batterie indique
        encore 20 %, 30 % ou plus. Ce comportement est caractéristique d'une
        batterie dont la capacité réelle ne correspond plus à ce qu'indique le
        logiciel.
      </p>

      <h3>Surchauffe</h3>
      <p>
        Une batterie en fin de vie peut chauffer de manière anormale pendant
        la charge ou l'utilisation. Une chaleur excessive est un signe à ne pas
        ignorer.
      </p>

      <h3>Charge lente ou instable</h3>
      <p>
        La charge prend beaucoup plus de temps qu'avant, s'interrompt seule ou
        le pourcentage monte et redescend de façon erratique. Ce comportement
        peut venir de la batterie, du connecteur de charge, ou des deux.
      </p>

      <h3>Batterie gonflée</h3>
      <p>
        Si le dos de votre téléphone commence à se décoller ou si l'écran
        présente un léger bombement, votre batterie est probablement gonflée.
        Dans ce cas, n'attendez pas : un technicien doit contrôler l'appareil
        rapidement.
      </p>

      <h2>Que faire ?</h2>
      <p>
        Ces signes ne signifient pas forcément que l'appareil est hors service.
        Un simple remplacement de batterie peut redonner une autonomie proche
        des performances d'origine.
      </p>
      <p>
        Sur iPhone, l'état de la batterie est visible dans{' '}
        <strong>Réglages &gt; Batterie &gt; État de la batterie</strong>. Un
        état inférieur à 80 % indique généralement une usure importante.
      </p>
      <p>
        Sur Android, les informations disponibles varient selon le fabricant.
        Un diagnostic en boutique permet d'évaluer l'état réel.
      </p>

      <div className="blog-cta">
        <Link href="/services/changement-batterie">
          Voir les tarifs de changement de batterie
        </Link>
      </div>
    </div>
  )
}
