/*
  components/seo/JsonLd.tsx — Server Component minimal d'injection JSON-LD.

  - Pas de 'use client' : rendu 100 % serveur, aucun JavaScript client ajouté.
  - Accepte un objet OU un tableau d'objets JSON-LD.
  - Ne rend rien si data est null/undefined.
  - Sécurise la sérialisation : les '<' sont échappés en '<' pour empêcher
    toute rupture accidentelle du <script> (ex. « </script> » dans une valeur).
*/

import type { JsonLdValue } from '@/lib/structured-data'

interface Props {
  data: JsonLdValue | JsonLdValue[] | null | undefined
}

export default function JsonLd({ data }: Props) {
  if (data == null) return null

  const json = JSON.stringify(data).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: json }}
    />
  )
}
