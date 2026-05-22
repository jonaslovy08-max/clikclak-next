# Audit de sécurité — ClikClak (2026-05-22)

## Points vérifiés et état

### 1. Variables d'environnement

| Variable             | Exposition | État |
|----------------------|-----------|------|
| ANTHROPIC_API_KEY    | Serveur uniquement (`app/api/chat/route.ts`) | ✅ Sûr |
| RESEND_API_KEY       | Serveur uniquement (`app/api/contact/route.ts`) | ✅ Sûr |
| TURNSTILE_SECRET_KEY | Serveur uniquement (`app/api/contact/route.ts`) | ✅ Sûr |
| STRIPE_SECRET_KEY    | Serveur uniquement via `lib/stripe.ts` | ✅ Sûr |
| STRIPE_WEBHOOK_SECRET| Serveur uniquement (`app/api/stripe/webhook/route.ts`) | ✅ Sûr |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | Public intentionnel (Maps) | ✅ Acceptable |
| NEXT_PUBLIC_GA_ID    | Public intentionnel (GA) | ✅ Acceptable |
| NEXT_PUBLIC_GOOGLE_ADS_ID | Public intentionnel | ✅ Acceptable |
| NEXT_PUBLIC_TURNSTILE_SITE_KEY | Public intentionnel (widget) | ✅ Acceptable |
| NEXT_PUBLIC_SITE_URL | Public intentionnel | ✅ Acceptable |

Aucun secret exposé côté client. Aucune clé loggée.

### 2. API Routes

#### /api/contact (POST)
- ✅ Méthode POST uniquement
- ✅ Honeypot (`_hp`) actif
- ✅ Turnstile vérifié côté serveur (obligatoire en production, bypass dev si clé absente)
- ✅ Validation email regex
- ✅ Validation champs requis (name, email, consent)
- ✅ Taille payload limitée à 6 Mo
- ✅ Aucune stack trace côté client
- ✅ HTML échappé dans les emails (`esc()`)
- ✅ Référence rachat générée côté serveur

#### /api/chat (POST)
- ✅ ANTHROPIC_API_KEY côté serveur uniquement
- ✅ Message utilisateur limité à 1 000 caractères
- ✅ Historique limité à 6 messages
- ✅ Aucune conversation stockée
- ✅ Fallback propre si clé absente
- ✅ Aucune erreur interne exposée (401 masqué)
- ✅ Aucune demande de mot de passe ni donnée personnelle dans le prompt système

#### /api/stripe/create-checkout-session (POST)
- ✅ Prix lus côté serveur depuis `data/shopProducts.ts`
- ✅ Aucun prix envoyé depuis le client
- ✅ Validation productId + quantité (1–99, entier)
- ✅ Produit doit être `purchasable`
- ✅ Fallback propre si STRIPE_SECRET_KEY absent

#### /api/stripe/webhook (POST)
- ✅ Signature Stripe vérifiée
- ✅ Commande marquée payée uniquement après vérification webhook

### 3. Formulaires / Turnstile

- ✅ Turnstile actif sur le formulaire contact général
- ✅ Turnstile actif sur le formulaire rachat
- ✅ Token envoyé depuis le client, vérifié côté serveur
- ✅ Erreur Turnstile distincte (422)
- ✅ Bypass production désactivé (si clé absente → refus)
- ✅ Consentement obligatoire vérifié côté serveur

### 4. Headers de sécurité

Ajoutés le 2026-05-22 dans `next.config.ts` :

| Header | Valeur |
|--------|--------|
| X-Content-Type-Options | nosniff |
| X-Frame-Options | SAMEORIGIN |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=() |

**CSP intentionnellement non activée** — risque de casser Turnstile, Google Maps, GSAP.
À activer progressivement en staging avec `Content-Security-Policy-Report-Only` d'abord.

### 5. Liens internes

- ✅ Redirections 301 configurées pour les anciennes URLs
- ✅ Aucun lien vers routes noindex évident dans la navigation principale
- ✅ /services-nav non indexé (page navigation uniquement)

### 6. Dépendances

Dépendances actuelles : Next.js 15, React 19, Stripe 22, Anthropic SDK, GSAP 3.
Aucun package suspect identifié.
`npm audit` recommandé avant mise en production.

---

## Corrections appliquées ce jour

1. **Headers sécurité** ajoutés dans `next.config.ts`
2. **Blog créé** — pages publiques, articles indexables

---

## Points restants / À faire en production

- [ ] Activer CSP progressivement après tests staging
- [ ] `npm audit` complet avant déploiement
- [ ] Vérifier `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` restreinte par domaine dans Google Cloud Console
- [ ] Vérifier `NEXT_PUBLIC_GA_ID` / `NEXT_PUBLIC_GOOGLE_ADS_ID` restreintes par domaine
- [ ] Rate limiting API routes (à implémenter via middleware Vercel ou edge function)
- [ ] Rotation des clés Resend et Turnstile après go-live si elles ont été exposées en dev
- [ ] Vérifier que les logs production (Vercel) ne contiennent pas de données personnelles

---

## Variables d'environnement requises en production

```
ANTHROPIC_API_KEY
RESEND_API_KEY
TURNSTILE_SECRET_KEY
NEXT_PUBLIC_TURNSTILE_SITE_KEY
CONTACT_TO_EMAIL
CONTACT_FROM_EMAIL
CONTACT_BUYBACK_EMAIL     (optionnel, fallback CONTACT_TO_EMAIL)
CONTACT_COURIER_EMAIL     (optionnel, fallback CONTACT_TO_EMAIL)
CONTACT_DEPANNAGE_EMAIL   (optionnel, fallback CONTACT_TO_EMAIL)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
NEXT_PUBLIC_GA_ID         (optionnel)
NEXT_PUBLIC_GOOGLE_ADS_ID (optionnel)
```
