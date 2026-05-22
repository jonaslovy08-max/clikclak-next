# Git workflow — ClikClak.ch

## Règle principale

Ne jamais travailler directement sur `main`.

- `main` = version stable validée
- `dev` = branche de travail
- toutes les modifications doivent être faites sur `dev`
- `main` ne doit recevoir que du code déjà testé, buildé et validé

---

## Avant toute modification

Toujours vérifier la branche active :

```bash
git branch
```

Si la branche active n’est pas `dev`, basculer sur `dev` :

```bash
git switch dev
```

Ne jamais modifier le code sur `main`.

---

## Après une modification sur dev

Quand une tâche est terminée :

```bash
npm run build
```

Si le build est propre :

```bash
git status
```

Puis attendre validation avant commit si l’utilisateur n’a pas demandé explicitement de committer.

Si l’utilisateur demande de committer sur `dev` :

```bash
git add -A
git commit -m "fix: description courte"
git push
```

La description du commit doit être courte, claire et spécifique.

Exemples :

```bash
git commit -m "fix: corrige affichage mobile du footer"
git commit -m "feat: ajoute section conseils blog"
git commit -m "chore: nettoie composants inutilisés"
```

---

## Quand l’utilisateur dit “valider sur main”

Cela ne signifie pas committer directement sur `main`.

Cela signifie :

1. vérifier que `dev` est propre
2. build sur `dev`
3. commit/push sur `dev` si nécessaire
4. fusionner `dev` dans `main`
5. build final sur `main`
6. push `main`
7. revenir sur `dev`

Workflow exact :

```bash
git switch dev
git status
npm run build
```

Si des changements sont présents sur `dev` :

```bash
git add -A
git commit -m "chore: validation avant merge main"
git push
```

Puis fusion vers `main` :

```bash
git switch main
git pull origin main
git merge dev
npm run build
git push origin main
git switch dev
```

Après cela, vérifier :

```bash
git branch -vv
git status
```

---

## Interdictions

Ne jamais utiliser sans demande explicite :

```bash
git reset --hard
git push --force
git clean -fd
git rebase
git checkout -- .
```

Ne jamais supprimer une branche sans validation.

Ne jamais modifier `.env.local`.

Ne jamais committer :

- `.env`
- `.env.local`
- `.env.production`
- `.next`
- `node_modules`
- `.vercel`

---

## Si erreur Git

Si une commande Git échoue :

- arrêter immédiatement
- ne pas tenter de corriger avec reset ou force push
- afficher l’erreur complète à l’utilisateur
- attendre instruction

---

## Règle de sécurité

Avant tout push vers `main`, le build doit être propre :

```bash
npm run build
```

Aucun warning critique.  
Aucune erreur.  
Aucun secret exposé.