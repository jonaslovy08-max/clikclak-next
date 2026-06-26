/*
  app/layout.tsx — passthrough minimal.

  En architecture multi-root-layout :
    - app/(fr)/layout.tsx → fournit <html lang="fr"> pour les routes françaises
    - app/(en)/layout.tsx → fournit <html lang="en"> pour les routes anglaises
    - app/layout.tsx (ce fichier) → n'est utilisé que pour les Route Handlers
      (api/, auth/, sitemap.ts, robots.ts) qui ne rendent pas de HTML.

  Ce fichier NE doit PAS contenir de balise <html> ou <body> :
  les Route Handlers n'en ont pas besoin, et les pages sont servies
  par leurs propres root layouts de groupe de routes.
*/
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
