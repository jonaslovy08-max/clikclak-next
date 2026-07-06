import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'
import { getIndexableProducts } from '@/lib/products'
import { SHOP_ENABLED } from '@/lib/config/features'
import { iphoneModels } from '@/data/iphoneRepairs'
import { samsungBrandData } from '@/data/samsungRepairs'
import { huaweiBrandData } from '@/data/huaweiRepairs'
import { ipadBrandData } from '@/data/ipadRepairs'
import { macbookBrandData } from '@/data/macbookRepairs'
import { oppoBrandData } from '@/data/oppoRepairs'
import { sonyXperiaBrandData } from '@/data/sonyXperiaRepairs'

const BASE = 'https://clikclak.ch'

/* ── Model slugs ──────────────────────────────────────────────── */
const samsungModels  = samsungBrandData.families.flatMap(f => f.models)
const huaweiModels   = huaweiBrandData.families.flatMap(f => f.models)
const ipadModels     = ipadBrandData.families.flatMap(f => f.models)
const macbookModels  = macbookBrandData.families.flatMap(f => f.models)
const oppoModels     = oppoBrandData.families.flatMap(f => f.models)
const sonyModels     = sonyXperiaBrandData.families.flatMap(f => f.models)

/* ── Pages anglaises complètes ───────────────────────────────────────
   Uniquement les pages effectivement traduites et indexables.
─────────────────────────────────────────────────────────────────── */
const EN_STATIC_PAGES: MetadataRoute.Sitemap = [
  /* Core */
  { url: `${BASE}/en/`,                                          priority: 1.0, changeFrequency: 'weekly'  },
  { url: `${BASE}/en/contact/`,                                  priority: 0.6, changeFrequency: 'monthly' },
  { url: `${BASE}/en/repair/`,                                   priority: 0.8, changeFrequency: 'weekly'  },
  { url: `${BASE}/en/services/business/`,                        priority: 0.7, changeFrequency: 'monthly' },

  /* Repair — type */
  { url: `${BASE}/en/services/smartphone-repair/`,               priority: 0.9, changeFrequency: 'weekly'  },
  { url: `${BASE}/en/express-tablet-repair/`,                    priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/express-computer-repair/`,                  priority: 0.7, changeFrequency: 'monthly' },

  /* Repair — brands */
  { url: `${BASE}/en/services/iphone-repair/`,                   priority: 0.9, changeFrequency: 'weekly'  },
  { url: `${BASE}/en/services/samsung-repair/`,                  priority: 0.8, changeFrequency: 'weekly'  },
  { url: `${BASE}/en/services/huawei-repair/`,                   priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/ipad-repair/`,                     priority: 0.8, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/macbook-repair/`,                  priority: 0.8, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/oppo-repair/`,                     priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/sony-xperia-repair/`,              priority: 0.6, changeFrequency: 'monthly' },

  /* Services */
  { url: `${BASE}/en/services/screen-repair/`,                   priority: 0.8, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/battery-replacement/`,             priority: 0.8, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/charging-port-repair/`,            priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/diagnostics/`,                     priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/data-recovery/`,                   priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/home-repair-service/`,             priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/courier-service/`,                          priority: 0.6, changeFrequency: 'monthly' },
  { url: `${BASE}/en/water-damage-repair-lausanne/`,             priority: 0.7, changeFrequency: 'monthly' },
  { url: `${BASE}/en/services/sell-your-device/`,                priority: 0.5, changeFrequency: 'monthly' },

  /*
    Exclusions intentionnelles EN (noindex ou stubs) :
      /en/services/google-pixel-repair/  → noindex (stub)
      /en/services/xiaomi-repair/        → noindex (stub)
      /en/services/tablet-repair/        → noindex (stub)
      /en/services/device-cleaning/      → noindex (stub)
      /en/services/data-transfer/        → stub
      /en/terms-and-conditions/          → noindex
      /en/privacy-policy/                → noindex
  */
]

/* ── Model pages EN — iPhone ────────────────────────────────────── */
const EN_IPHONE_MODELS: MetadataRoute.Sitemap = iphoneModels.map(m => ({
  url:             `${BASE}/en/services/iphone-repair/${m.id}/`,
  priority:        0.6 as const,
  changeFrequency: 'monthly' as const,
}))

/* ── Model pages EN — Samsung ────────────────────────────────────── */
const EN_SAMSUNG_MODELS: MetadataRoute.Sitemap = samsungModels.map(m => ({
  url:             `${BASE}/en/services/samsung-repair/${m.id}/`,
  priority:        0.5 as const,
  changeFrequency: 'monthly' as const,
}))

/* ── Model pages EN — Huawei ─────────────────────────────────────── */
const EN_HUAWEI_MODELS: MetadataRoute.Sitemap = huaweiModels.map(m => ({
  url:             `${BASE}/en/services/huawei-repair/${m.id}/`,
  priority:        0.5 as const,
  changeFrequency: 'monthly' as const,
}))

/* ── Model pages EN — iPad ───────────────────────────────────────── */
const EN_IPAD_MODELS: MetadataRoute.Sitemap = ipadModels.map(m => ({
  url:             `${BASE}/en/services/ipad-repair/${m.id}/`,
  priority:        0.5 as const,
  changeFrequency: 'monthly' as const,
}))

/* ── Model pages EN — MacBook ────────────────────────────────────── */
const EN_MACBOOK_MODELS: MetadataRoute.Sitemap = macbookModels.map(m => ({
  url:             `${BASE}/en/services/macbook-repair/${m.id}/`,
  priority:        0.5 as const,
  changeFrequency: 'monthly' as const,
}))

/* ── Model pages EN — OPPO ───────────────────────────────────────── */
const EN_OPPO_MODELS: MetadataRoute.Sitemap = oppoModels.map(m => ({
  url:             `${BASE}/en/services/oppo-repair/${m.id}/`,
  priority:        0.5 as const,
  changeFrequency: 'monthly' as const,
}))

/* ── Model pages EN — Sony ───────────────────────────────────────── */
const EN_SONY_MODELS: MetadataRoute.Sitemap = sonyModels.map(m => ({
  url:             `${BASE}/en/services/sony-xperia-repair/${m.id}/`,
  priority:        0.5 as const,
  changeFrequency: 'monthly' as const,
}))

/*
  Sitemap ClikClak — règles d'inclusion :
    ✓ pages finales avec contenu réel
    ✓ priorités calées sur la hiérarchie business
    ✗ pages noindex exclues (CGV, politique, stubs)
    ✗ anciennes URLs redirigées exclues
    ✗ placeholders exclus (reparation-xiaomi, reparation-google-pixel,
      reparation-tablette, nettoyage → noindex sur ces pages)
*/
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    /* ── Priorité maximale ──────────────────────────────────── */
    { url: `${BASE}/`,                                          priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${BASE}/services/reparation-iphone/`,              priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${BASE}/services/reparation-samsung-lausanne/`,    priority: 0.9, changeFrequency: 'weekly'  },
    { url: `${BASE}/reparation-smartphone-express/`,           priority: 0.9, changeFrequency: 'weekly'  },

    /* ── Réparation — marques complètes ─────────────────────── */
    { url: `${BASE}/reparation/`,                              priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${BASE}/services/reparation-macbook/`,             priority: 0.8, changeFrequency: 'weekly'  },
    { url: `${BASE}/services/reparation-ipad/`,                priority: 0.8, changeFrequency: 'monthly' },
    { url: `${BASE}/reparation-tablette-express/`,             priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/reparation-ordinateur-express/`,           priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/services/reparation-huawei-lausanne/`,     priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/services/reparation-oppo/`,                priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/services/reparation-sony-xperia/`,         priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/reparation-degat-eau-lausanne/`,           priority: 0.7, changeFrequency: 'monthly' },

    /* ── Services spécialisés ───────────────────────────────── */
    { url: `${BASE}/services/recuperation-donnees/`,           priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/services/entreprises/`,                    priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/services/depannage-reparation-domicile/`,  priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/service-de-coursier/`,                     priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/services/transfert-donnees/`,              priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/services/rachat-de-votre-smartphone/`,     priority: 0.6, changeFrequency: 'monthly' },

    /* ── FR Model pages — iPhone ─────────────────────────────── */
    ...iphoneModels.map(m => ({
      url:             `${BASE}/services/reparation-iphone/${m.id}/`,
      priority:        0.6 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── FR Model pages — Samsung ────────────────────────────── */
    ...samsungModels.map(m => ({
      url:             `${BASE}/services/reparation-samsung-lausanne/${m.id}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── FR Model pages — Huawei ─────────────────────────────── */
    ...huaweiModels.map(m => ({
      url:             `${BASE}/services/reparation-huawei-lausanne/${m.id}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── FR Model pages — iPad ───────────────────────────────── */
    ...ipadModels.map(m => ({
      url:             `${BASE}/services/reparation-ipad/${m.id}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── FR Model pages — MacBook ────────────────────────────── */
    ...macbookModels.map(m => ({
      url:             `${BASE}/services/reparation-macbook/${m.id}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── FR Model pages — OPPO ───────────────────────────────── */
    ...oppoModels.map(m => ({
      url:             `${BASE}/services/reparation-oppo/${m.id}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── FR Model pages — Sony ───────────────────────────────── */
    ...sonyModels.map(m => ({
      url:             `${BASE}/services/reparation-sony-xperia/${m.id}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
    })),

    /* ── Shop (exclu si boutique désactivée) ───────────────── */
    ...(SHOP_ENABLED ? [
      { url: `${BASE}/shop-reparation-smartphone-lausanne/`, priority: 0.7 as const, changeFrequency: 'weekly' as const },
      ...getIndexableProducts().map(p => ({
        url:             `${BASE}/shop-reparation-smartphone-lausanne/${p.slug}/`,
        priority:        0.5 as const,
        changeFrequency: 'weekly' as const,
      })),
    ] : []),

    /* ── Blog ──────────────────────────────────────────────── */
    { url: `${BASE}/blog/`,                                    priority: 0.6, changeFrequency: 'weekly'  },
    ...getPublishedPosts().map(({ meta }) => ({
      url:             `${BASE}/blog/${meta.slug}/`,
      priority:        0.5 as const,
      changeFrequency: 'monthly' as const,
      lastModified:    meta.updatedAt,
    })),

    /* ── Pages institutionnelles ────────────────────────────── */
    { url: `${BASE}/contact-clik-clak-lausanne/`,              priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/clik-clak-repair-lausanne/`,               priority: 0.5, changeFrequency: 'monthly' },

    /* ── Pages anglaises statiques ─────────────────────────── */
    ...EN_STATIC_PAGES,

    /* ── Pages anglaises — modèles dynamiques ──────────────── */
    ...EN_IPHONE_MODELS,
    ...EN_SAMSUNG_MODELS,
    ...EN_HUAWEI_MODELS,
    ...EN_IPAD_MODELS,
    ...EN_MACBOOK_MODELS,
    ...EN_OPPO_MODELS,
    ...EN_SONY_MODELS,

    /*
      Exclusions intentionnelles :
        /r-cup-ration-de-donn-es/ → redirigée (301) vers /services/recuperation-donnees/
        /services/depannage/       → redirigée (301) vers /services/depannage-reparation-domicile/
        /cgv/                      → noindex
        /politique-confidentialite/ → noindex
        /services/reparation-google-pixel/ → noindex (stub)
        /services/reparation-xiaomi/       → noindex (stub)
        /services/reparation-tablette/     → noindex (stub, remplacée par /reparation-tablette-express/)
        /services/nettoyage/               → noindex (stub)
        /en/services/google-pixel-repair/  → noindex (stub)
        /en/services/xiaomi-repair/        → noindex (stub)
        /en/services/tablet-repair/        → noindex (stub)
        /en/services/device-cleaning/      → noindex (stub)
        /en/terms-and-conditions/          → noindex
        /en/privacy-policy/                → noindex
    */
  ]
}
