/*
  app/not-found.tsx — fallback racine minimal.
  En architecture multi-root-layout, les 404 normales sont gérées par :
    - app/(fr)/not-found.tsx  → routes françaises
    - app/(en)/en/not-found.tsx → routes anglaises /en/*
  Ce fichier ne s'applique qu'aux routes hors route-groups (cas très rare).
*/
import { redirect } from 'next/navigation'

export default function GlobalNotFound() {
  redirect('/')
}
