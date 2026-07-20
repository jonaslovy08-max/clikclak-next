/*
  app/not-found.tsx — fallback racine pour les routes hors route-groups.

  Exemples : /wp-login.php, /produit/*, /wp-admin/*, chemins WordPress inconnus.

  En architecture multi-root-layout, ce fichier ne peut pas utiliser les
  layouts (fr) / (en) — il doit fournir son propre <html> et <body>.
  Retourne HTTP 404 (comportement natif de not-found.tsx dans Next.js App Router).
  Ne redirige PAS vers l'accueil : un soft-404 vers / serait interprété comme
  une redirection permanente par Google.
*/
import Link from 'next/link'

export default function GlobalNotFound() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>404 — Page introuvable | Clik Clak Repair</title>
        <meta name="robots" content="noindex,nofollow" />
      </head>
      <body style={{
        margin: 0,
        background: '#191919',
        color: '#f2f2f2',
        fontFamily: 'sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        boxSizing: 'border-box',
      }}>
        <main style={{ textAlign: 'center', maxWidth: 480 }}>
          <p style={{
            fontSize: 'clamp(4rem,12vw,7rem)',
            fontWeight: 300,
            lineHeight: 1,
            color: '#ccff33',
            opacity: 0.15,
            margin: '0 0 2rem',
          }}>404</p>
          <h1 style={{ fontSize: 'clamp(1.5rem,4vw,2.5rem)', fontWeight: 300, margin: '0 0 1rem' }}>
            Page introuvable
          </h1>
          <p style={{ opacity: 0.6, margin: '0 0 2rem', lineHeight: 1.6 }}>
            Cette page n&apos;existe pas ou a été déplacée.
          </p>
          <Link href="/" style={{ color: '#ccff33', textDecoration: 'none', fontSize: '0.9rem' }}>
            ← Retour à l&apos;accueil
          </Link>
        </main>
      </body>
    </html>
  )
}
