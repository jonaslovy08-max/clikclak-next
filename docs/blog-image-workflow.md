# Workflow visuels blog ClikClak

## Format standard

| Propriété | Valeur |
|-----------|--------|
| Format    | `.webp` |
| Dimensions | 1200 × 630 px |
| Ratio | 1.91:1 |
| Nommage | `[slug].webp` |
| Dossier | `/public/assets/images/blog/` |
| Chemin dans le code | `/assets/images/blog/[slug].webp` |

Exemple :
```
/public/assets/images/blog/batterie-smartphone-fatiguee.webp
```

---

## Style visuel ClikClak

- Fond sombre #191919 / graphite / noir
- Accent lime #CCFF33 utilisé avec parcimonie
- Éclairage studio propre, contraste élevé
- Esthétique réparation smartphone / tech / atelier
- Rendu professionnel, sobre, crédible

À exclure impérativement :
- Texte visible dans l'image
- Logo ou marque reconnaissable
- Interface système visible (iOS, Android, Windows)
- Mains déformées ou artefacts IA évidents
- Visages humains
- Éléments décoratifs superflus

---

## Procédure de validation manuelle

> Aucune image générée par IA ne doit être publiée directement.
> Chaque image doit être contrôlée avant mise en ligne.

### Étapes

1. Préparer les métadonnées de l'article (`title`, `description`, `category`, `tags`).
2. Générer le prompt avec `generateBlogImagePrompt()` depuis `lib/blog/generateBlogImagePrompt.ts`.
3. Utiliser le prompt dans un outil externe (Midjourney, DALL-E 3, Stable Diffusion, Firefly, etc.).
4. Valider l'image manuellement selon la checklist ci-dessous.
5. Convertir en `.webp` 1200×630 si nécessaire.
6. Déposer le fichier dans `/public/assets/images/blog/`.
7. Mettre à jour le champ `image` et `imageAlt` dans le fichier article (`content/blog/[slug].tsx`).
8. Lancer `npm run build` et vérifier l'absence d'erreur.

---

## Checklist validation image

Avant de mettre à jour l'article avec l'image :

- [ ] Format 1200 × 630 px
- [ ] Fichier en `.webp`
- [ ] Nom du fichier = slug de l'article (`[slug].webp`)
- [ ] Aucun texte visible dans l'image
- [ ] Aucun logo, marque ou UI reconnaissable
- [ ] Style cohérent avec la charte visuelle ClikClak (sombre, lime, sobre)
- [ ] Aucune erreur IA évidente (mains, proportions, incohérence visuelle)
- [ ] Image sobre et crédible pour un site professionnel
- [ ] Image ajoutée dans `/public/assets/images/blog/`
- [ ] Article mis à jour avec `image` + `imageAlt`
- [ ] `npm run build` propre, zéro warning

---

## Exemple d'utilisation du générateur de prompt

```ts
import { generateBlogImagePrompt } from '@/lib/blog/generateBlogImagePrompt'

const prompt = generateBlogImagePrompt({
  title:       'Batterie smartphone fatiguée : les signes à surveiller',
  description: 'Comment reconnaître une batterie usée sur smartphone.',
  category:    'Conseils',
  tags:        ['batterie', 'smartphone', 'réparation'],
})

console.log(prompt)
// → Create a premium hero image for a professional smartphone repair website blog article.
//   premium cinematic dark background, deep #191919 graphite tones, subtle lime green accent color #CCFF33...
//   Topic: "Batterie smartphone fatiguée : les signes à surveiller"...
```

---

## Ajouter un article avec image

Dans `content/blog/[slug].tsx` :

```ts
export const meta: BlogMeta = {
  title:     'Titre de l\'article',
  slug:      'titre-de-l-article',
  // ...
  image:     '/assets/images/blog/titre-de-l-article.webp',
  imageAlt:  'Description courte de l\'image',
  published: true,
}
```

L'image apparaît automatiquement sur :
- La card `/blog`
- La page article `/blog/[slug]`
- Les sections "Conseils utiles" sur les pages services et la homepage

---

## Articles existants

| Slug | Image | Statut |
|------|-------|--------|
| `telephone-tombe-dans-l-eau` | `/assets/images/blog/telephone-tombe-dans-l-eau.webp` | ✅ Validée |
| `connaitre-modele-iphone` | `/assets/images/blog/connaitre-modele-iphone.webp` | ✅ Validée |
| `batterie-smartphone-fatiguee` | `/assets/images/blog/batterie-smartphone-fatiguee.webp` | ✅ Validée |
