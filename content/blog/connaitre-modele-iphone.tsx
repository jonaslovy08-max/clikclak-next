import type { BlogMeta } from '@/lib/blog'
import Link from 'next/link'

export const meta: BlogMeta = {
  title:       "Comment savoir quel modèle d'iPhone vous avez ?",
  description: "Retrouver facilement le modèle exact de votre iPhone pour obtenir un tarif de réparation précis.",
  slug:        'connaitre-modele-iphone',
  date:        '2026-05-22',
  updatedAt:   '2026-05-22',
  category:    'Guides',
  author:      'ClikClak',
  tags:        ['iPhone', 'modèle', 'réparation'],
  published:   true,
  image:       '/assets/images/blog/connaitre-modele-iphone.webp',
  imageAlt:    'Identifier le modèle de son iPhone',
}

export default function Article() {
  return (
    <div className="blog-content">
      <p>
        Avant de demander un tarif de réparation pour votre iPhone, il est
        utile de connaître son modèle exact. Un iPhone 15 Pro et un iPhone 15
        standard n'ont pas le même écran ni le même tarif de remplacement.
        Voici comment identifier votre modèle en moins d'une minute.
      </p>

      <h2>Via les réglages de l'iPhone</h2>

      <p>C'est la méthode la plus fiable :</p>
      <ol>
        <li>Ouvrez <strong>Réglages</strong></li>
        <li>Appuyez sur <strong>Général</strong></li>
        <li>Appuyez sur <strong>Informations</strong></li>
        <li>Repérez la ligne <strong>Nom du modèle</strong></li>
      </ol>
      <p>
        Vous verrez directement le nom commercial : par exemple{' '}
        <em>iPhone 15 Pro Max</em> ou <em>iPhone 13 Mini</em>.
      </p>

      <h2>Via le numéro de modèle</h2>
      <p>
        Sur la même page Informations, vous trouverez également un{' '}
        <strong>numéro de modèle</strong> commençant par <em>MQ</em>,{' '}
        <em>MM</em> ou similaire. Ce numéro identifie précisément la version
        (pays, capacité, couleur). Il est également gravé au dos de l'appareil
        sur certains modèles plus anciens.
      </p>

      <h2>Si l'iPhone ne s'allume plus</h2>
      <p>
        Si votre écran est cassé ou si l'appareil ne démarre plus, il est
        toujours possible d'identifier le modèle visuellement. La forme du
        boîtier, la présence ou l'absence d'une encoche, d'une Dynamic Island
        ou d'un bouton Home permettent généralement de déterminer la génération.
      </p>
      <p>
        En cas de doute, passez directement chez ClikClak avec votre appareil.
        Nous identifions le modèle et vous communiquons le tarif de réparation
        sans engagement.
      </p>

      <h2>Pourquoi le modèle exact est-il important ?</h2>
      <p>
        Chaque modèle d'iPhone utilise un écran et une batterie spécifiques.
        Les pièces ne sont pas interchangeables entre générations. Un tarif
        précis ne peut être donné qu'à partir du modèle exact.
      </p>

      <div className="blog-cta">
        <Link href="/services/reparation-iphone">
          Consulter les tarifs de réparation iPhone
        </Link>
      </div>
    </div>
  )
}
