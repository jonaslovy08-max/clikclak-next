import type { MetadataRoute } from 'next'

const BASE = 'https://clikclak.ch'

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
    { url: `${BASE}/services/depannage-reparation-domicile/`,  priority: 0.7, changeFrequency: 'monthly' },
    { url: `${BASE}/service-de-coursier/`,                     priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/services/transfert-donnees/`,              priority: 0.5, changeFrequency: 'monthly' },
    { url: `${BASE}/services/rachat-de-votre-smartphone/`,     priority: 0.6, changeFrequency: 'monthly' },

    /* ── Shop ───────────────────────────────────────────────── */
    { url: `${BASE}/shop-reparation-smartphone-lausanne/`,     priority: 0.7, changeFrequency: 'weekly'  },

    /* ── Pages institutionnelles ────────────────────────────── */
    { url: `${BASE}/contact-clik-clak-lausanne/`,              priority: 0.6, changeFrequency: 'monthly' },
    { url: `${BASE}/clik-clak-repair-lausanne/`,               priority: 0.5, changeFrequency: 'monthly' },

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
    */
  ]
}
