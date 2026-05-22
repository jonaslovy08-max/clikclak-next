/*
  lib/blog.ts — Registre central des articles du blog ClikClak.

  Chaque article est un module TypeScript dans content/blog/ qui exporte :
    - meta  : BlogMeta
    - default : React component (contenu de l'article)

  Ajouter un article : créer le fichier dans content/blog/ et l'enregistrer
  dans ARTICLE_REGISTRY ci-dessous.
*/

import type { ComponentType } from 'react'

export interface BlogMeta {
  title:       string
  description: string
  slug:        string
  date:        string        /* ISO YYYY-MM-DD */
  updatedAt:   string
  category:    string
  author:      string
  tags:        string[]
  published:   boolean
  image?:      string        /* chemin /assets/... */
  imageAlt?:   string
}

export interface BlogPost {
  meta:      BlogMeta
  Component: ComponentType
}

/* ── Imports statiques ──────────────────────────────────────────────────── */
import { meta as metaDegat, default as ArticleDegat }       from '@/content/blog/telephone-tombe-dans-l-eau'
import { meta as metaIphone, default as ArticleIphone }     from '@/content/blog/connaitre-modele-iphone'
import { meta as metaBatterie, default as ArticleBatterie } from '@/content/blog/batterie-smartphone-fatiguee'

// Les articles sont listés du plus récent au plus ancien.
// Ajouter les nouveaux articles en tête de liste.
const ALL_POSTS: BlogPost[] = [
  { meta: metaBatterie, Component: ArticleBatterie },
  { meta: metaIphone,   Component: ArticleIphone   },
  { meta: metaDegat,    Component: ArticleDegat    },
]

/* ── API publique ───────────────────────────────────────────────────────── */

export function getPublishedPosts(): BlogPost[] {
  return ALL_POSTS.filter(p => p.meta.published)
}

export function getPostBySlug(slug: string): BlogPost | undefined {
  return ALL_POSTS.find(p => p.meta.slug === slug && p.meta.published)
}
