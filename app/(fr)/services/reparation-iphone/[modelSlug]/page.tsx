import type { Metadata } from 'next'
import { iphoneModels } from '@/data/iphoneRepairs'
import IphoneModelPage from '@/components/repair/IphoneModelPage'
import { SITE_URL } from '@/lib/seo'

/* ── Génération statique de toutes les pages modèle ──────────────────────── */
export function generateStaticParams() {
  return iphoneModels.map(m => ({ modelSlug: m.id }))
}

/* ── Metadata dynamique ───────────────────────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}): Promise<Metadata> {
  const { modelSlug } = await params
  const model = iphoneModels.find(m => m.id === modelSlug)
  if (!model) return {}

  return {
    title: `Réparation ${model.label} Lausanne | Prix écran, batterie | ClikClak`,
    description: `Consultez les prix de réparation pour ${model.label} à Lausanne : écran, batterie, caméra, connecteur de charge et diagnostic chez ClikClak.`,
    alternates: {
      canonical: `${SITE_URL}/services/reparation-iphone/${modelSlug}/`,
      languages: {
        'fr-CH':     `${SITE_URL}/services/reparation-iphone/${modelSlug}/`,
        'en-CH':     `${SITE_URL}/en/services/iphone-repair/${modelSlug}/`,
        'x-default': `${SITE_URL}/services/reparation-iphone/${modelSlug}/`,
      },
    },
    openGraph: {
      title: `Réparation ${model.label} Lausanne — ClikClak`,
      description: `Prix de réparation ${model.label} à Lausanne. Écran, batterie, caméra et plus. Pièces de qualité, garantie incluse.`,
      url: `${SITE_URL}/services/reparation-iphone/${modelSlug}/`,
      locale: 'fr_CH',
      type: 'website',
    },
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   Page dédiée — /services/reparation-iphone/[modelSlug]
══════════════════════════════════════════════════════════════════════════ */
export default async function IphoneModelSlugPage({
  params,
}: {
  params: Promise<{ modelSlug: string }>
}) {
  const { modelSlug } = await params
  return <IphoneModelPage modelSlug={modelSlug} locale="fr" />
}
