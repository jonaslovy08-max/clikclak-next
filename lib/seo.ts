export const SITE_URL     = 'https://clikclak.ch'
export const SITE_NAME    = 'Clik Clak Repair'
export const SITE_LOCALE  = 'fr_CH'
export const SITE_ADDRESS = 'Rue du Petit-Chêne 9b, 1003 Lausanne'

/** Image OG par défaut — utilisée comme fallback sur toutes les pages sans image spécifique */
export const DEFAULT_OG_IMAGE = '/assets/images/seo/clikclak-og-home.jpg'

/** Construit l'URL canonique absolue avec trailing slash garantie */
export function canonical(path: string): string {
  const normalized = path.endsWith('/') ? path : `${path}/`
  return `${SITE_URL}${normalized}`
}

/** Construit le bloc metadata standard pour une page de service */
export function serviceMetadata(opts: {
  title: string
  description: string
  path: string
  noindex?: boolean
  ogImage?: string
}) {
  const image = opts.ogImage ?? DEFAULT_OG_IMAGE
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: canonical(opts.path) },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: canonical(opts.path),
      siteName: SITE_NAME,
      locale: SITE_LOCALE,
      type: 'website' as const,
      images: [{ url: image }],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: opts.title,
      description: opts.description,
      images: [image],
    },
    ...(opts.noindex && {
      robots: { index: false, follow: true },
    }),
  }
}
