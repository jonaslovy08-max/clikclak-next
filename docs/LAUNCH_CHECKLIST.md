# LAUNCH_CHECKLIST.md — ClikClak.ch

Checklist de mise en ligne. À compléter avant le go-live.  
Référence : docs/SEO_DECISIONS.md pour les décisions SEO validées.

---

## Pré-lancement (à faire avant mise en ligne)

### SEO technique
- [ ] Toutes les pages 200 ont un `<title>` unique
- [ ] Toutes les pages 200 ont une `<meta description>` unique
- [ ] Chaque page a exactement 1 `<h1>`
- [ ] Chaque page a une balise `canonical` correcte (auto-référencée, trailing slash)
- [ ] `/cgv/` est en `noindex`
- [ ] `/r-cup-ration-de-donn-es/` canonical pointe vers `/services/recuperation-donnees/`
- [ ] Sitemap généré et accessible à `/sitemap.xml`
- [ ] Robots.txt accessible à `/robots.txt` (vérifie `/admin/` et `/api/` en disallow)
- [ ] JSON-LD LocalBusiness présent sur la homepage

### Redirections (Phase 7)
- [ ] **BLOQUANT** — `301 /r-cup-ration-de-donn-es/ → /services/recuperation-donnees/` dans `next.config.ts` + dossier `app/r-cup-ration-de-donn-es/` supprimé (voir MIGRATION_SEO.md)
- [ ] Toutes les entrées `VALIDÉ` de `data/legacy-urls.ts` sont dans `next.config.ts`
- [ ] Aucune chaîne de redirection (chaque `from` pointe directement vers `to`)
- [ ] `/shop-reparation-smartphone-lausanne/` **n'est pas** dans les redirections (page 200)
- [ ] `/contact/` → `/contact-clik-clak-lausanne/` (1 saut)
- [ ] `/services/` → `/reparation/` (1 saut)
- [ ] Aucune destination `/www.smartphonereparation.ch` ne subsiste
- [ ] 301 `/r-cup-ration-de-donn-es/` → `/services/recuperation-donnees/`

### HTTPS
- [ ] Vercel HTTPS forcé activé (ou middleware HTTP→HTTPS configuré)
- [ ] Tester `http://clikclak.ch/` → redirige bien vers `https://clikclak.ch/`

### Performance
- [ ] Lighthouse score ≥ 95 sur la homepage
- [ ] Core Web Vitals dans le vert (LCP < 2.5s, CLS < 0.1, INP < 200ms)
- [ ] Images optimisées (`next/image`)
- [ ] Rubik chargé via `next/font/google` (pas de `<link>` manuel)
- [ ] Aucun JavaScript client inutile
- [ ] Aucun slider lourd

### Contenu
- [ ] Récupération de données : aucune garantie de 100 % dans le contenu
- [ ] Shop : aucun produit de réparation (écrans, vitres, batteries) dans le shop

---

## Go-live

### DNS
- [ ] TTL abaissé 48h avant
- [ ] DNS pointé vers Vercel
- [ ] Propagation vérifiée

### Search Console
- [ ] Nouvelle propriété `https://clikclak.ch/` vérifiée dans GSC
- [ ] Sitemap soumis
- [ ] Inspection URL sur les 5 pages critiques (homepage, iPhone, Samsung, MacBook, récup données)
- [ ] Demande d'indexation sur les pages principales

### Post-lancement (J+1 à J+7)
- [ ] Vérifier aucune 404 inattendue dans GSC
- [ ] Vérifier le rapport de couverture GSC
- [ ] Vérifier les impressions et clics après 48h
- [ ] Surveiller `/services/reparation-macbook/` (87 clics/mois — critique)
- [ ] Surveiller la homepage (896 clics/mois — critique)
- [ ] Vérifier que `/r-cup-ration-de-donn-es/` est bien traité en 301 par GSC

---

## Pages à surveiller en priorité absolue

| URL | Clics GSC | Risque si perdue |
|-----|-----------|------------------|
| `/` | 896 | Critique |
| `/services/reparation-macbook/` | 87 | Critique |
| `/services/reparation-iphone/` | 59 | Critique |
| `/reparation-smartphone-express/` | 3 | Haute |
| `/services/reparation-samsung-lausanne/` | 2 | Haute |
