/*
  lib/blog/generateBlogImagePrompt.ts

  Génère un prompt texte prêt à l'emploi pour la création d'un visuel blog.
  L'image générée doit ensuite être validée manuellement avant mise en ligne.

  Workflow :
    1. Appeler generateBlogImagePrompt() avec les métadonnées de l'article.
    2. Utiliser le prompt dans un outil de génération d'image externe (Midjourney, DALL-E, Stable Diffusion, etc.).
    3. Valider l'image manuellement selon la checklist dans docs/blog-image-workflow.md.
    4. Enregistrer le fichier validé dans /public/assets/images/blog/[slug].webp.
    5. Mettre à jour le champ `image` de l'article.
*/

interface BlogImagePromptInput {
  title:        string
  description?: string
  category?:    string
  tags?:        string[]
}

const STYLE_BASE = [
  'premium cinematic dark background, deep #191919 graphite tones',
  'subtle lime green accent color #CCFF33, used sparingly',
  'clean professional studio lighting, high contrast',
  'smartphone repair shop aesthetic, technical precision',
  'no text, no logo, no brand names, no visible UI, no watermark',
  'no distorted hands, no AI artifacts, photorealistic render',
  '1200x630 pixel composition, 1.91:1 aspect ratio',
].join(', ')

export function generateBlogImagePrompt({
  title,
  description,
  category,
  tags,
}: BlogImagePromptInput): string {
  const topicParts: string[] = [`Topic: "${title}"`]
  if (description) topicParts.push(`Context: ${description}`)
  if (category)    topicParts.push(`Category: ${category}`)
  if (tags?.length) topicParts.push(`Keywords: ${tags.join(', ')}`)

  const topic = topicParts.join('. ')

  return (
    `Create a premium hero image for a professional smartphone repair website blog article. ` +
    `${STYLE_BASE}. ` +
    `${topic}. ` +
    `Style: dark, technical, clean, credible, no decorative elements, no human faces.`
  )
}
