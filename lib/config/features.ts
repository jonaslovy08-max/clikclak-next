/*
  Feature flags ClikClak — lecture côté serveur uniquement.

  Valeur par défaut sécurisée : toute valeur autre que la chaîne exacte "true"
  maintient le shop désactivé (absent, vide, "false", "1"… → false).

  Utilisation :
    - Server Components : import direct
    - Client Components : recevoir en prop depuis un Server Component parent
    - Ne jamais importer dans DesktopNav, MobileMenu ou tout autre Client Component.
      La protection repose sur : pas de NEXT_PUBLIC_, prop-drilling depuis Header.tsx (Server)
      et TypeScript. Le package server-only est intentionnellement absent — Next.js 15
      peut faire remonter une erreur de bundler sur les imports non-client via le trace graph.

  Réactivation : SHOP_ENABLED=true dans .env.local + redéploiement
*/

export const SHOP_ENABLED = process.env.SHOP_ENABLED === 'true'

/*
  Chatbot ClikClak — désactivé par défaut.
  Toute valeur autre que la chaîne exacte "true" maintient le chatbot désactivé.
  Réactivation : CHATBOT_ENABLED=true dans .env.local + redéploiement.
*/
export const CHATBOT_ENABLED = process.env.CHATBOT_ENABLED === 'true'
