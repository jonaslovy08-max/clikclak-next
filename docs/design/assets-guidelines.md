# Assets guidelines — ClikClak.ch

Règles relatives aux fichiers visuels du projet.

---

## SVG animé — signature brand mark

**Fichier source validé :**
```
public/assets/animation/signature-wrench-phone.svg
```

**Ne pas modifier ce fichier sans validation explicite.**

> Dernière version validée : mise à jour manuelle du 2026-05-06 (ajustement des positions finales des formes).  
> `viewBox="0 0 263.1 666.63"` — classes CSS internes : `st0` (lime), `st1/st2` (blanc).

Ce SVG est le fichier de référence pour le brand mark animé du site.  
Toute modification du dessin, des couleurs ou de la structure des groupes doit être validée avant implémentation.

### Groupes utilisés pour l'animation

| Groupe | Rôle |
|--------|------|
| `g#wrench-top` | Partie haute de la clé — animée depuis le haut |
| `g#wrench-bottom` | Partie basse de la clé — animée depuis le bas |

Ces identifiants sont ciblés par les classes CSS `.signature-arrive-top` et `.signature-arrive-bottom` définies dans `app/globals.css`.

### Composants React

| Composant | Fichier | Usage |
|-----------|---------|-------|
| `SignatureMark` | `components/brand/SignatureMark.tsx` | Affichage statique (footer, print, no-JS) |
| `SignatureLoader` | `components/brand/SignatureLoader.tsx` | Affichage animé — animation CSS, Server Component |

### Règles d'utilisation

- Ne pas ajouter de groupes ou de formes dans le SVG sans validation.
- Ne pas modifier les couleurs (`#ccff33` lime, `#fff` blanc) — elles sont définies dans les classes CSS internes du SVG.
- Ne pas recréer le SVG dans le code — toujours utiliser les composants existants.
- L'animation respecte `prefers-reduced-motion` : si l'utilisateur a désactivé les animations système, les groupes apparaissent directement en position finale.

### Réglage de l'animation

Tous les paramètres se trouvent dans `app/globals.css`, section `Animation — SignatureLoader` :

```css
/* Distance initiale */
@keyframes signature-arrive-top    { from { transform: translateY(-28px); } }
@keyframes signature-arrive-bottom { from { transform: translateY(28px);  } }

/* Durée et easing */
.signature-arrive-top    { animation: signature-arrive-top    0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
.signature-arrive-bottom { animation: signature-arrive-bottom 0.9s cubic-bezier(0.22, 1, 0.36, 1) both; }
```
