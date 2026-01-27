# Copié-Collé Shopify App - Guide Complet

**Date de création**: 2026-01-27
**Projet**: Plugin Shopify de génération de mockups IA
**URL Production**: https://mockups-shopify-69z6.vercel.app

---

## Table des Matières

1. [Vue d'Ensemble du Plugin](#vue-densemble-du-plugin)
2. [Analyse Technique Complète](#analyse-technique-complète)
3. [Travaux Complétés](#travaux-complétés)
4. [Guide de Publication App Store](#guide-de-publication-app-store)
5. [Stratégies d'Acquisition Utilisateurs](#stratégies-dacquisition-utilisateurs)
6. [Prochaines Étapes](#prochaines-étapes)
7. [Métriques et KPIs](#métriques-et-kpis)
8. [Ressources et Références](#ressources-et-références)

---

## Vue d'Ensemble du Plugin

### Concept

**Copié-Collé** est une application Shopify qui génère des mockups de produits photorealistiques en utilisant l'intelligence artificielle. Elle permet aux marchands de créer des images professionnelles sans photographie coûteuse.

### Proposition de Valeur

- **Problème résolu**: Photographie de produits coûteuse (500-2000$/session)
- **Solution**: Génération IA instantanée de mockups professionnels
- **Cible**: Marchands Shopify (e-commerce, dropshipping, print-on-demand)
- **Pricing**: Freemium (10 crédits) + Pro ($19.99/mois unlimited)

### Fonctionnalités Principales

**Génération de Mockups**:
- 5 styles prédéfinis (Clean Studio, Urban Lifestyle, Cinematic, Vintage Vibe)
- Mode "Campaign Pack" (3 variations automatiques)
- Formats multiples: 1:1, 9:16, 16:9
- Prompts personnalisables

**Intégration Shopify**:
- Sélection de produits via resource picker natif
- Ajout direct aux médias des produits (GraphQL API)
- One-click "Add to Shopify Media"
- Download PNG

**Monétisation**:
- Système de crédits (free tier: 10 crédits)
- Abonnement Pro: $19.99/mois (unlimited)
- Shopify Billing API intégré

---

## Analyse Technique Complète

### Stack Technique

**Framework & Core**:
- Remix v2.16.1 (full-stack framework)
- React 18.2.0
- TypeScript 5.2.2
- Vite 6.2.2 (build tool)

**Shopify Integration**:
- @shopify/shopify-app-remix v4.1.0
- @shopify/app-bridge-react v4.1.6
- @shopify/polaris v12.0.0 (design system)

**Database & ORM**:
- Prisma v6.19.2
- SQLite (dev) / PostgreSQL (prod recommandé)

**Hosting**:
- Vercel (application)
- Node.js >=20.19

**Backend API**:
- Next.js API interne (génération IA)
- Endpoint: POST /api/custom/create
- Auth: Bearer token

### Architecture des Fichiers

```
mockups/
├── shopify/                              # App Shopify
│   ├── app/
│   │   ├── routes/
│   │   │   ├── app._index.tsx           # Dashboard principal (480 lignes)
│   │   │   ├── app.tsx                  # Layout wrapper
│   │   │   ├── app.additional.tsx       # Page d'aide
│   │   │   ├── auth.login/              # Authentication
│   │   │   ├── webhooks.app.*.tsx       # Webhooks app
│   │   │   └── webhooks.gdpr.tsx        # Webhooks GDPR ✅
│   │   ├── shopify.server.ts            # Config Shopify + billing
│   │   └── db.server.ts                 # Prisma client
│   ├── prisma/
│   │   └── schema.prisma                # Database schema
│   ├── shopify.app.toml                 # Configuration app ✅
│   ├── GDPR_IMPLEMENTATION.md           # Doc GDPR ✅
│   └── package.json
├── src/                                  # Next.js backend (API)
│   └── app/api/custom/create/
│       └── route.ts                      # Endpoint génération IA
├── SECURITY_CHECKLIST.md                # Checklist sécurité ✅
├── CLAUDE.MD                            # Ce fichier
└── .env.production                      # ⚠️ Local seulement (ignoré Git)
```

### Base de Données (Prisma Schema)

```prisma
model Session {
  id                  String    @id
  shop                String    // Shop domain
  state               String    // OAuth state
  isOnline            Boolean   @default(false)
  scope               String?
  expires             DateTime?
  accessToken         String    // OAuth token
  userId              BigInt?
  firstName           String?   // Shop owner first name
  lastName            String?   // Shop owner last name
  email               String?   // Shop owner email
  accountOwner        Boolean   @default(false)
  locale              String?
  collaborator        Boolean?  @default(false)
  emailVerified       Boolean?  @default(false)
  refreshToken        String?
  refreshTokenExpires DateTime?
}
```

**Données stockées**: UNIQUEMENT les sessions shop et infos propriétaire
**Données NON stockées**: Clients individuels, images générées, historique

### Routes Principales

| Route | Type | Description |
|-------|------|-------------|
| `GET /` | Public | Landing page |
| `GET/POST /auth/login` | Auth | Login OAuth |
| `GET /auth/$` | Auth | OAuth callback |
| `GET /app` | App | Dashboard principal |
| `POST /app` (action=generate) | App | Génération mockups |
| `POST /app` (action=subscribe) | App | Souscription Pro |
| `POST /app` (action=addToMedia) | App | Ajout à Shopify |
| `GET /app/additional` | App | Page d'aide |
| `POST /webhooks/app/uninstalled` | Webhook | Désinstallation |
| `POST /webhooks/app/scopes_update` | Webhook | Mise à jour scopes |
| `POST /webhooks/gdpr` | Webhook | GDPR (3 topics) ✅ |

### Webhooks Configurés

```toml
# shopify.app.toml

[[webhooks.subscriptions]]
topics = [ "app/uninstalled" ]
uri = "/webhooks/app/uninstalled"

[[webhooks.subscriptions]]
topics = [ "app/scopes_update" ]
uri = "/webhooks/app/scopes_update"

# GDPR Compliance (Required for App Store)
[[webhooks.subscriptions]]
topics = [ "customers/data_request" ]
uri = "/webhooks/gdpr"

[[webhooks.subscriptions]]
topics = [ "customers/redact" ]
uri = "/webhooks/gdpr"

[[webhooks.subscriptions]]
topics = [ "shop/redact" ]
uri = "/webhooks/gdpr"
```

### Configuration Billing

```typescript
// shopify.server.ts
billing: {
  "Monthly Subscription": {
    lineItems: [{
      amount: 19.99,
      currencyCode: "USD",
      interval: BillingInterval.Every30Days,
    }],
  },
}
```

**Note**: Passer `isTest: false` avant production

### API Externes Utilisées

**Shopify APIs**:
- Admin GraphQL API (productCreateMedia)
- Billing API (subscriptions)
- OAuth 2.0
- Webhooks API

**Services Externes** (visible dans .env.production):
- Supabase (database/backend)
- Google Cloud Vertex AI (vision/image processing)
- Gemini API (AI model)
- Replicate (AI inference)
- Resend (email)
- Lemon Squeezy (payment alternative)
- Google Analytics (tracking)

### Scopes OAuth

```toml
scopes = "write_products"
```

**Justification**: Nécessaire pour ajouter des médias aux produits via GraphQL

---

## Travaux Complétés

### ✅ 1. Sécurité - Credentials Protégées

**Date**: 2026-01-27
**Status**: ✅ SÉCURISÉ

**Vérifications effectuées**:
- `.env.production` n'a JAMAIS été commité dans Git
- `.gitignore` correctement configuré (root + shopify)
- Historique Git vérifié: aucune trace de credentials

**Fichiers de protection**:
```
Root .gitignore:
  - Ligne 34: .env*
  - Ligne 35: .env.production (explicit)

Shopify .gitignore:
  - Ligne 15: .env.*
```

**Document créé**: `SECURITY_CHECKLIST.md`

**Recommandations**:
1. Configurer environment variables dans Vercel Dashboard
2. Rotation optionnelle des API keys (best practice)
3. Supprimer fichiers .env.production locaux (ou les garder pour dev)

**Credentials présentes dans .env.production** (à configurer sur Vercel):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GOOGLE_PROJECT_ID / GOOGLE_LOCATION / GOOGLE_APPLICATION_CREDENTIALS
- GEMINI_API_KEY
- REPLICATE_API_TOKEN
- RESEND_API_KEY
- LEMONSQUEEZY_CHECKOUT_URL
- NEXT_PUBLIC_GA_ID
- CRON_SECRET
- INTERNAL_API_SECRET

### ✅ 2. Webhooks GDPR Implémentés

**Date**: 2026-01-27
**Status**: ✅ COMPLÉTÉ ET DÉPLOYÉ
**Commit**: `e2502da`

**Fichiers créés/modifiés**:
1. `shopify/app/routes/webhooks.gdpr.tsx` (97 lignes)
2. `shopify/shopify.app.toml` (+12 lignes)
3. `shopify/GDPR_IMPLEMENTATION.md` (documentation complète)

**Implémentation détaillée**:

**customers/data_request**:
```typescript
// Confirme qu'aucune donnée client n'est stockée
return new Response(JSON.stringify({
  message: "No customer data stored"
}), { status: 200 });
```

**customers/redact**:
```typescript
// Confirme qu'aucune donnée client à supprimer
return new Response(JSON.stringify({
  message: "No customer data to redact"
}), { status: 200 });
```

**shop/redact**:
```typescript
// Supprime toutes les sessions pour le shop (48h après uninstall)
const deletedSessions = await db.session.deleteMany({
  where: { shop: shop }
});

return new Response(JSON.stringify({
  message: "Shop data deleted successfully",
  deletedRecords: deletedSessions.count
}), { status: 200 });
```

**Features**:
- ✅ Error handling complet (try/catch)
- ✅ Logging détaillé avec préfixe `[GDPR]`
- ✅ Retourne toujours 200 OK (empêche retries)
- ✅ Réponses JSON structurées
- ✅ Documentation inline

**Conformité Shopify**:
- ✅ Les 3 webhooks obligatoires implémentés
- ✅ Retourne 200 OK dans tous les cas
- ✅ Supprime les données dans les 30 jours (immédiat)
- ✅ Logged pour audit trail

**Push Git**: ✅ Poussé sur `main` branch

---

## Guide de Publication App Store

### Prérequis Techniques

#### A. Conformité GDPR ✅
- [x] Webhooks GDPR implémentés
- [x] Configuration dans shopify.app.toml
- [x] Documentation complète

#### B. Sécurité ✅
- [x] Credentials non exposées dans Git
- [x] .gitignore configuré correctement
- [ ] Environment variables dans Vercel (à configurer)

#### C. Configuration App
- [x] OAuth fonctionnel
- [x] Scopes appropriés (write_products)
- [x] Billing API configuré
- [ ] Passer isTest: false en production

### Processus de Soumission

#### Étape 1: Finaliser la Configuration

**1.1 Environment Variables Vercel**

Aller sur: https://vercel.com/[votre-projet]/settings/environment-variables

Ajouter toutes les variables de `.env.production`:
- NEXTJS_API_URL
- INTERNAL_API_SECRET
- NEXT_PUBLIC_SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- REPLICATE_API_TOKEN
- RESEND_API_KEY
- Etc.

**1.2 Désactiver Mode Test Billing**

```typescript
// shopify.server.ts
billing: {
  "Monthly Subscription": {
    // ...
    // isTest: false,  // Décommenter et mettre false en production
  },
}
```

**1.3 Déployer**

```bash
cd shopify
shopify app deploy
```

#### Étape 2: Préparer le Listing App Store

**2.1 Informations Requises**

**Nom de l'app**:
- Nom principal: "Copié-Collé" ou "Copié-Collé Mockup Generator"
- Nom court (12 chars max): "Copié-Collé"

**Tagline** (70 caractères max):
```
AI-Powered Product Mockup Generator - Create Stunning Photos Instantly
```

**Description Courte** (50-100 mots):
```
Transform your product images into professional mockups with AI.
Copié-Collé uses artificial intelligence to place your products
in realistic, custom environments without expensive photography.
Generate photorealistic mockups in seconds with 5 professional
style presets and multiple aspect ratios.
```

**Description Complète** (200-500 mots):
```
# Transform Your Product Photography with AI

Copié-Collé is the ultimate AI-powered mockup generator for Shopify merchants.
Create professional, photorealistic product images without expensive photography
sessions or complex design tools.

## Key Features

### Instant Mockup Generation
Generate stunning product mockups in seconds. Simply select your product,
describe the scene you want, and let AI do the magic.

### 5 Professional Style Presets
- **Clean Studio**: Professional studio setting with neutral backgrounds
- **Urban Lifestyle**: Modern city streets with architectural details
- **Cinematic**: Dramatic lighting and moody atmosphere
- **Vintage Vibe**: Retro feel with authentic film grain
- **Custom**: Design your own unique scene

### Campaign Pack Mode
Generate 3 variations at once:
- Hero shot (standard product view)
- Close-up (macro shot with detail focus)
- Minimalist (isolated on clean background)

### Multiple Aspect Ratios
Perfect images for every platform:
- 1:1 Square (Instagram, product grids)
- 9:16 Story (Instagram Stories, TikTok)
- 16:9 Wide (website banners, YouTube)

### Seamless Shopify Integration
- One-click integration with Shopify product media
- Select products directly from your store
- Add generated mockups instantly to product pages
- Download as PNG for external use

## Perfect For

- **E-commerce stores** needing multiple product angles
- **Dropshippers** wanting professional imagery without inventory
- **Print-on-demand** sellers showcasing products in lifestyle scenes
- **New brands** building their visual identity on a budget

## Pricing

- **Free Tier**: 10 credits to try the app
- **Pro Plan**: $19.99/month for unlimited mockup generation

## Why Choose Copié-Collé?

✓ Save $500-2000 per product photography session
✓ Generate unlimited variations in minutes
✓ No design skills required
✓ Professional results guaranteed
✓ Direct integration with your Shopify store

Start creating stunning product mockups today!
```

**Catégories**:
- Primaire: "Design"
- Secondaire: "Marketing", "Product Merchandising"

**Keywords** (10 max):
```
mockup generator
product photography
AI image generator
product mockups
lifestyle photos
marketing images
product visualization
scene generator
ai mockup
photo studio
```

**2.2 Assets Visuels**

**Screenshots** (minimum 4, recommandé 6-8):
1. Dashboard principal avec sélection de produit
2. Interface de génération (prompt + styles)
3. Résultats avec options (Download/Add to Media)
4. Campaign Pack showcase (3 variations)
5. Before/After comparison
6. Integration Shopify Media (add to product)
7. Page d'aide/support
8. Pro plan pricing

**Spécifications**:
- Format: PNG ou JPG
- Résolution: 1600x1200px (4:3) recommandé
- Taille: <5MB par image
- Qualité: Haute résolution, UI claire

**Vidéo Démo** (recommandé, pas obligatoire):
- Durée: 30-90 secondes
- Format: MP4
- Résolution: 1920x1080 (Full HD)
- Contenu suggéré:
  - 0-10s: Hook (Before/After impressionnant)
  - 10-30s: Sélection produit + prompt
  - 30-50s: Génération en temps réel
  - 50-70s: Résultat + ajout à Shopify
  - 70-90s: Call to action

**Logo/Icône**:
- Format: PNG avec transparence
- Tailles: 512x512px, 1024x1024px
- Style: Simple, reconnaissable à petite taille

**2.3 Pages de Support**

**Privacy Policy** (obligatoire):

Héberger sur votre site avec URL publique. Contenu suggéré:

```markdown
# Privacy Policy - Copié-Collé

Last updated: [Date]

## Data We Collect

Copié-Collé stores minimal data required for app functionality:
- Shop owner name and email (for authentication)
- OAuth access tokens (for Shopify API access)
- Session state (for login persistence)

## Data We Don't Collect

We do NOT store:
- Individual customer data
- Generated product images (sent directly to your Shopify store)
- Payment information
- Browsing history
- Usage analytics beyond basic app metrics

## How We Use Your Data

- **Authentication**: To verify your identity and maintain login sessions
- **API Access**: To read your products and add generated images
- **Billing**: To process subscription payments via Shopify

## Data Deletion

All shop data is automatically deleted 48 hours after app uninstallation.
You can request immediate data deletion by contacting support@[yourdomain].com.

## GDPR Compliance

We fully comply with GDPR regulations. You have the right to:
- Access your data
- Request data deletion
- Export your data

Contact us at support@[yourdomain].com for data requests.

## Third-Party Services

We use the following services:
- Shopify (app hosting and billing)
- [AI Service Provider] (image generation)
- Vercel (application hosting)

## Contact

For privacy concerns, contact: privacy@[yourdomain].com
```

**Support Page** (déjà implémenté: app.additional.tsx):
- Email de support: support@[yourdomain].com
- FAQ intégré ✅
- Guide d'utilisation ✅

#### Étape 3: Soumettre l'App

**3.1 Accéder au Partners Dashboard**

1. Aller sur: https://partners.shopify.com
2. Apps > Copié-Collé
3. Distribution

**3.2 Choisir la Distribution**

Sélectionner: **Public Distribution**

Avantages:
- ✅ Accessible à tous les marchands Shopify
- ✅ Billing API disponible
- ✅ Listée dans l'App Store
- ✅ 0% commission sur premier $1M revenue

**3.3 Compléter le Formulaire**

Remplir tous les champs:
- App name ✓
- Tagline ✓
- Description courte ✓
- Description complète ✓
- Keywords ✓
- Categories ✓
- Screenshots (4-8 images) ✓
- Video (optionnel)
- Support URL ✓
- Privacy Policy URL ✓
- Pricing ✓

**3.4 Webhooks Verification**

Shopify vérifiera automatiquement:
- ✅ app/uninstalled
- ✅ customers/data_request
- ✅ customers/redact
- ✅ shop/redact

**3.5 Submit for Review**

Cliquer sur "Submit for Review"

**Délai d'approbation**: 5-10 jours ouvrables (généralement)

#### Étape 4: Critères d'Approbation

**Qualité Technique**:
- [x] OAuth fonctionnel
- [x] Webhooks GDPR implémentés
- [ ] Pas de crashes ou erreurs critiques
- [ ] Performance acceptable (<3s load time)
- [ ] Tests sur plusieurs boutiques dev

**Design & UX**:
- [x] Utilise Shopify Polaris
- [x] Interface intuitive et responsive
- [x] Messages d'erreur clairs
- [ ] Onboarding fluide (première utilisation)

**Conformité**:
- [x] GDPR compliant
- [ ] Privacy Policy publiée
- [ ] Support email fonctionnel
- [x] Scopes limités aux besoins réels

**Contenu**:
- [ ] Description claire et précise
- [ ] Screenshots de qualité professionnelle
- [ ] Pas de fautes d'orthographe
- [ ] Keywords pertinents (pas de spam)

### Raisons de Rejet Courantes

❌ **Webhooks GDPR manquants** → ✅ Résolu
❌ **Credentials exposées** → ✅ Résolu
❌ **Privacy Policy manquante** → ⚠️ À créer
❌ **Screenshots de mauvaise qualité** → ⚠️ À créer
❌ **Description vague ou avec fautes** → ⚠️ À vérifier
❌ **App crash lors du test** → ⚠️ À tester
❌ **OAuth ne fonctionne pas** → ✅ Fonctionne
❌ **Billing non fonctionnel** → ✅ Configuré (passer isTest: false)

---

## Stratégies d'Acquisition Utilisateurs

### Phase 1: Optimisation App Store (ASO)

**1.1 Keywords Strategy**

**Primary Keywords** (High Volume):
- "mockup generator" (CPC: $2-4)
- "product photography" (CPC: $3-6)
- "AI product images" (CPC: $3-6)

**Secondary Keywords**:
- "lifestyle product photos"
- "product mockup creator"
- "scene generator shopify"
- "ai image generator"

**Long-tail Keywords** (Lower Competition):
- "automatic product photography shopify"
- "ai mockup generator for ecommerce"
- "create product lifestyle shots"
- "mockup generator without photoshop"

**Implementation**:
- Utiliser dans: App name, tagline, description
- Densité naturelle (pas de keyword stuffing)
- Recherche avec Google Ads Keyword Planner

**1.2 Reviews Strategy**

**Objectif**: 20+ reviews avec 4.5+ étoiles dans les 3 premiers mois

**Tactiques**:
1. **In-app prompt** (après 3ème génération réussie):
   ```
   "Loving Copié-Collé? 🎨
   Leave us a review and get +2 bonus credits!"
   ```

2. **Email post-installation** (Jour 7):
   ```
   Subject: How's Copié-Collé working for you?

   Hi [Name],

   You've generated [X] mockups this week - that's awesome!

   If you're enjoying the app, would you mind leaving a quick review?
   It takes 30 seconds and helps other merchants discover AI mockups.

   [Leave a Review Button]

   Thanks,
   [Your Name]
   ```

3. **Répondre à TOUTES les reviews**:
   - Reviews positives: Remerciement + feature roadmap
   - Reviews négatives: Excuses + solution + suivi privé

4. **Incentive**:
   - +2 crédits gratuits pour review honnête
   - Pas de review conditionnelle (conforme Shopify policy)

### Phase 2: Content Marketing

**2.1 Blog Posts (SEO)**

**Objectif**: 2 posts/semaine pendant 3 mois

**Thèmes**:
1. **How-to Guides**:
   - "How to Create Professional Product Mockups Without Photography"
   - "10 AI Tools Every Shopify Merchant Needs in 2026"
   - "Product Photography on a Budget: Complete Guide"

2. **Case Studies**:
   - "How [Brand] Increased CTR by 43% with AI Mockups"
   - "From $2000 to $20: Our Product Photography Journey"
   - "Dropshipping Success: 100 Products, Zero Photoshoots"

3. **Comparisons**:
   - "AI Mockups vs Traditional Photography: Cost Analysis"
   - "Copié-Collé vs Competitors: Feature Comparison"
   - "Shopify Product Photography Apps: Complete Review 2026"

4. **Lists**:
   - "15 Creative Product Photography Ideas (AI-Generated)"
   - "Best Practices for E-commerce Product Images"
   - "Mockup Styles That Convert Best: Data Analysis"

**Distribution**:
- Blog sur votre site web
- Medium (crosspost)
- LinkedIn articles
- Dev.to (si aspects techniques)

**2.2 Video Marketing (YouTube)**

**Objectif**: 1 vidéo/semaine

**Types de contenu**:
1. **Tutorials**:
   - "Generate 10 Product Mockups in 5 Minutes"
   - "Complete Copié-Collé Tutorial for Beginners"
   - "Advanced Tips: Getting Perfect AI Mockups"

2. **Before/After**:
   - "Transforming Products with AI: 10 Examples"
   - "Bad Product Photos → Professional Mockups"
   - Time-lapse de génération

3. **Business**:
   - "How I Saved $5000 on Product Photography"
   - "Scaling Shopify Store with AI Tools"
   - "My E-commerce Tech Stack 2026"

**Optimisation YouTube**:
- Thumbnails accrocheuses (Before/After split)
- Titres avec keywords ("Shopify", "Product Photography")
- Description avec liens vers app
- CTA dans vidéo: "Try free - link below"
- Playlists: "Shopify Tutorials", "AI Tools", "E-commerce Tips"

**2.3 Social Media**

**Twitter/X**:
- 3-5 posts/jour
- Before/After impressionnants
- Tips & tricks
- Engagement dans #shopify, #ecommerce threads
- Threads sur process de création

**Instagram**:
- Carousel posts (Before/After/Process)
- Reels: Time-lapse génération
- Stories: Behind-the-scenes, polls, Q&A
- Hashtags: #shopify #ecommerce #productphotography #aitools

**LinkedIn**:
- Posts professionnels (case studies)
- Articles longs (strategy)
- Engagement dans groupes e-commerce
- Networking avec Shopify Partners/Agencies

**TikTok** (optionnel mais fort potentiel):
- Short form génération videos
- "POV: You're a dropshipper with $0 budget"
- Trending sounds + votre app
- Hashtags: #shopifytips #ecommercetips #dropshipping

### Phase 3: Community Engagement

**3.1 Reddit Strategy**

**Subreddits cibles**:
- r/shopify (1.2M members)
- r/ecommerce (300k members)
- r/dropship (100k members)
- r/Entrepreneur (3M members)
- r/SideProject (200k members)

**Approche**:
- ⚠️ PAS de spam ou promo directe
- Apporter de la valeur d'abord
- Répondre aux questions sur product photography
- Mentionner l'app naturellement dans contexte
- Partager learnings et challenges
- 90% value / 10% promo

**Exemple de post**:
```
Title: I analyzed 1000 product pages - here's what converts best

[Data-driven post avec insights]

P.S. I built an AI tool to help with this, happy to share
```

**3.2 Shopify Community**

**Forum**: community.shopify.com

**Tactiques**:
- Répondre aux questions "Product Photography" tags
- Partager tips sur visual merchandising
- Créer guides complets
- Badge "Expert" via contributions
- Mentionner app dans signature

**3.3 Facebook Groups**

**Groupes cibles**:
- "Shopify Entrepreneurs" (100k+ members)
- "E-commerce & Dropshipping Mastery"
- "Shopify Store Owners"
- "Print on Demand Entrepreneurs"

**Engagement**:
- Commentaires utiles sur posts
- Partager success stories (avec permission)
- Répondre aux questions
- Offrir reviews gratuites de product pages

### Phase 4: Partnerships & Influenceurs

**4.1 Shopify Experts & Agencies**

**Stratégie**:
1. Identifier top Shopify agencies (Shopify Partners directory)
2. Offrir comptes Pro gratuits
3. Programme d'affiliation (15-20% commission récurrente)
4. Co-marketing:
   - Guest posts sur leur blog
   - Featured in leur newsletter
   - Webinaires conjoints

**Outreach template**:
```
Subject: Partnership Opportunity - AI Mockup Tool for Your Clients

Hi [Name],

I'm the founder of Copié-Collé, an AI mockup generator for Shopify.

I noticed your agency specializes in [niche]. Many of your clients
probably struggle with product photography costs.

I'd love to offer:
- Free Pro accounts for your team
- 15% recurring commission on referrals
- Co-marketing opportunities

Would you be interested in a quick demo?

Best,
[Your Name]
```

**4.2 Influenceurs E-commerce**

**Tiers**:

**Tier 1 (Nano: 1k-10k subs)**:
- Budget: $50-200 par vidéo
- ROI: 5-20 installs par vidéo
- Approche: Gifted (free Pro account)

**Tier 2 (Micro: 10k-100k subs)**:
- Budget: $200-1000 par vidéo
- ROI: 20-100 installs
- Approche: Paid sponsorship

**Tier 3 (Macro: 100k-1M subs)**:
- Budget: $1000-5000 par vidéo
- ROI: 100-500 installs
- Approche: Revenue share + flat fee

**Channels cibles**:
- Shopify tutorials (YouTube)
- E-commerce coaches
- Dropshipping educators
- Print-on-demand channels

**Creators à contacter**:
- Wholesale Ted
- Ac Hampton (e-commerce)
- Austin Rabin (Shopify)
- Beast of Ecom
- [Rechercher "shopify tutorial" sur YouTube, filtrer par subscribers]

**Pitch deck** (slides):
1. Problem: Product photography is expensive
2. Solution: Copié-Collé AI mockups
3. Demo: Before/After examples
4. Offer: Free Pro account + commission
5. CTA: Unique discount code for audience

**4.3 Podcast Appearances**

**Podcasts e-commerce**:
- Shopify Masters
- The My Wife Quit Her Job Podcast
- eCommerce Influence
- The eCommerce Marketing Podcast

**Pitch angle**:
- "How AI is Disrupting E-commerce Photography"
- "From $0 to $XXXMRR: Building a Shopify App"
- "Technical Founder Journey in Shopify Ecosystem"

### Phase 5: Paid Acquisition

**5.1 Google Ads**

**Budget initial**: $500-1000/mois

**Campagnes**:

**Campaign 1: Search - High Intent**
- Keywords: "shopify mockup generator", "product photography app"
- Match type: Exact + Phrase
- Budget: $300/mois
- Target CPA: $30-50

**Campaign 2: Search - Broad**
- Keywords: "product photography", "mockup generator"
- Match type: Broad
- Budget: $200/mois
- Target CPA: $40-60

**Campaign 3: Display - Remarketing**
- Audience: Visited site but didn't install
- Budget: $200/mois
- Images: Before/After, testimonials

**Ad copy**:
```
Headline 1: AI Product Mockups in Seconds
Headline 2: Save $2000 on Photography
Headline 3: Free Trial - 10 Credits

Description: Generate professional product mockups with AI.
No photoshoot needed. Integrates with Shopify. Try free today.

CTA: Try Free | Get Started
```

**Landing page**: Page dédiée (pas direct vers App Store)
- Hero: Before/After slider
- Value props: Cost savings, speed, quality
- Demo video (60s)
- Social proof (reviews)
- CTA: "Install Free App"

**5.2 Facebook/Instagram Ads**

**Budget initial**: $300-500/mois

**Audiences**:

**Cold Audience**:
- Interests: Shopify, E-commerce, Dropshipping, Product Design
- Age: 25-45
- Behavior: Small business owners
- Lookalike: Website visitors (1%)

**Warm Audience**:
- Engaged with content (video views 75%+)
- Website visitors (30 days)
- Add to cart but didn't install

**Retargeting**:
- Visited App Store listing
- Installed but not subscribed

**Créatifs**:

**Format 1: Carousel (5 slides)**
- Slide 1: Hook "Stop paying $500 per product shoot"
- Slides 2-5: Before/After examples
- CTA: "Try Free"

**Format 2: Video (15s)**
- 0-3s: Problem (expensive photography)
- 3-10s: Solution (AI generation time-lapse)
- 10-15s: Result + CTA

**Format 3: UGC (User Generated Content)**
- Merchant testimonial: "This saved me $5000"
- Screen recording de génération
- Authentic feel

**Ad copy**:
```
Tired of expensive product photoshoots? 😫

Copié-Collé uses AI to create stunning mockups in seconds.
No photographer. No studio. No editing.

✅ 5 professional styles
✅ Unlimited variations
✅ Direct Shopify integration
✅ 10 free credits to start

Try it free 👇
```

**5.3 TikTok Ads** (Optionnel, high growth potential)

**Budget**: $200-300/mois (test)

**Format**:
- Native TikTok style (not polished ads)
- Vertical 9:16
- Trending sounds
- Text overlays
- Hook in first 2 seconds

**Exemple de script**:
```
[0-2s] "POV: You're launching a Shopify store with $0 budget"
[2-5s] "You need product photos but photographer wants $2000"
[5-8s] "So you use AI instead" [show app]
[8-12s] Time-lapse génération
[12-15s] Final result + "Link in bio"
```

### Phase 6: Freemium Optimization

**6.1 Onboarding Sequence**

**Email 1: Welcome (Day 0)**
```
Subject: Welcome to Copié-Collé! 🎨 Here's your quick start guide

Hi [Name],

Welcome to Copié-Collé! You have 10 free credits to create stunning
AI-powered product mockups.

Here's how to get started:
1. Select a product from your store
2. Choose an image to transform
3. Describe your scene (e.g., "on a wooden table with plants")
4. Click Generate!

[Quick Start Video - 2 min]

Pro tip: Start with "Campaign Pack" to get 3 variations at once.

Questions? Hit reply anytime.

Happy creating!
[Your Name]

P.S. Need inspiration? Check out our [Mockup Gallery]
```

**Email 2: Tutorial (Day 2)**
```
Subject: Pro tip: Get better mockups with these prompts 💡

Hi [Name],

Want to level up your mockups? Here are proven prompt formulas:

1. "Product on [surface] with [props] in [lighting]"
   Example: "Mug on marble counter with flowers in soft morning light"

2. "Product in [location] with [atmosphere]"
   Example: "Shoes in urban street with cinematic mood"

3. "Product styled for [occasion]"
   Example: "Candle styled for cozy winter evening"

[See 10 More Examples]

You have [X] credits left - try these out!

Questions? Just reply to this email.

[Your Name]
```

**Email 3: Social Proof (Day 5)**
```
Subject: See how merchants are using Copié-Collé ⭐

Hi [Name],

You've generated [X] mockups so far - awesome!

Here's what other Shopify merchants are saying:

"Saved me $2000 on my first product line. This app is insane!"
- Sarah, Fashion Store

"I generated 50 mockups in an afternoon. Game changer for dropshipping."
- Mike, Electronics Store

[Read More Reviews]

You have [Y] credits remaining. Need more?
[Upgrade to Pro for unlimited generations →]

Keep creating!
[Your Name]
```

**Email 4: Urgency (Day 9)**
```
Subject: ⚠️ You have 3 credits left

Hi [Name],

Just a heads up - you've used 7 of your 10 free credits!

Don't let your creative flow stop. Upgrade to Pro for:
✅ Unlimited mockup generations
✅ Priority processing (faster results)
✅ Campaign Pack mode (3 variations at once)
✅ All future features included

$19.99/month - Cancel anytime.

[Upgrade to Pro →]

Or need more free credits?
Leave us a review and get +2 bonus credits!

[Leave a Review →]

Thanks for using Copié-Collé!
[Your Name]
```

**Email 5: Conversion Push (Day 14)**
```
Subject: 🎁 Special offer: 20% off Pro (48h only)

Hi [Name],

I noticed you haven't upgraded to Pro yet.

To celebrate our launch, I'm offering you 20% off your first month:
~~$19.99~~ → $15.99

Code: LAUNCH20 (expires in 48 hours)

What you get:
✅ Unlimited mockup generations
✅ All professional styles
✅ Campaign Pack mode
✅ Priority support

[Claim Your Discount →]

This offer expires [Date] at midnight.

Questions? Reply to this email!

[Your Name]
```

**Email 6: Re-engagement (Day 30)**
```
Subject: We miss you! Here's what's new 👋

Hi [Name],

We noticed you haven't generated mockups in a while.

We've added new features you'll love:
🆕 New style preset: "Natural Outdoor"
🆕 Aspect ratio: 4:5 (perfect for Instagram)
🆕 Batch mode: Generate multiple products at once

Your 10 free credits are still waiting!

[Generate Your Next Mockup →]

And if you had any issues, please let me know by replying to this email.

Hope to see you back!
[Your Name]
```

**6.2 In-App Upgrade Prompts**

**After exhausting free credits**:
```
[Modal]
You've used all 10 free credits! 🎉

You've generated [X] professional mockups.
Ready to unlock unlimited generations?

[Upgrade to Pro - $19.99/month] [Maybe Later]

Or get +2 free credits by leaving a review:
[Leave a Review →]
```

**After 5 generations in one session** (power user signal):
```
[Banner at top]
Loving Copié-Collé? 💚
Upgrade to Pro for unlimited generations + priority processing.
[Upgrade] [Dismiss]
```

**When selecting Campaign Pack** (gated for Pro):
```
[Info box]
Campaign Pack generates 3 variations at once - perfect for
complete product launches!

This feature requires Pro. [Upgrade Now] [Learn More]
```

**6.3 Referral Program** (Future Implementation)

```
Refer a merchant → Both get +5 bonus credits
Referred merchant upgrades to Pro → You get $10 credit or 1 month free
```

### Phase 7: Launch Strategy

**Week 1: Soft Launch**

**Day 1-2: Product Hunt**
- Post on Product Hunt (#1 Product of the Day goal)
- Title: "Copié-Collé - AI Product Mockups for Shopify"
- Tagline: "Transform product photos into professional mockups with AI"
- Description: Focus on value prop, demo GIF
- First comment: Founder story + offer (free Pro for first 50 upvoters)
- Engage with every comment

**Day 3: Reddit**
- r/SideProject: "I built an AI mockup generator for Shopify"
- r/shopify: "Feedback wanted: AI product photography tool"
- Genuine ask for feedback, not sales pitch

**Day 4-5: Social Media Blitz**
- Twitter thread: Building journey + launch
- LinkedIn post: Professional announcement
- Instagram: Before/After showcase
- TikTok: Demo video

**Day 6-7: Outreach**
- Email to existing network
- DM to Shopify influencers (heads up on launch)
- Post in Facebook groups

**Week 2-3: Content Push**

- Publish 3 blog posts
- Upload 2 YouTube videos
- Daily social media posts
- Engage in communities

**Week 4: Paid Ads Test**

- Start Google Ads (small budget: $30/day)
- A/B test landing pages
- Track conversion metrics

**Month 2-3: Scale What Works**

- Double down on best performing channels
- Increase ad spend if ROAS > 2:1
- Reach out to bigger influencers
- Publish case studies

### Phase 8: Viral Loops & Growth Hacks

**8.1 Watermark Strategy** (Subtle Branding)

Option: Add small "Made with Copié-Collé" watermark on free tier mockups
- Removable on Pro tier
- Drives word-of-mouth

**Pros**: Organic discovery
**Cons**: May reduce conversion if too prominent

**8.2 Gallery/Showcase**

Create public gallery: colle-colie.com/gallery
- Best mockups from users (with permission)
- Categorized by industry/style
- "Create similar" CTA
- Sharable on social
- SEO benefits (image search)

**8.3 Templates/Presets**

"Popular prompts" library:
- "Beach sunset with palm trees"
- "Minimalist studio with shadows"
- "Cozy coffee shop morning"
- One-click apply → Drives generations

**8.4 Shopify App Store Badges**

Add to your website:
"As featured in Shopify App Store"
"4.8★ Rating on Shopify"
"Trusted by 500+ merchants"

**8.5 Comparison Pages** (SEO)

Create pages:
- "Copié-Collé vs [Competitor]"
- "Copié-Collé vs Traditional Photography"
- "Best Shopify Mockup Apps 2026"

Target SEO traffic from comparison searchers.

---

## Prochaines Étapes

### Priorité HAUTE (Avant Soumission App Store)

**1. Privacy Policy**
- [ ] Rédiger privacy policy complète
- [ ] Héberger sur site web public
- [ ] Ajouter URL dans App Store listing

**2. Assets Visuels**
- [ ] Créer 6-8 screenshots haute qualité
- [ ] (Optionnel) Enregistrer vidéo démo 60s
- [ ] Créer logo/icône app (512x512px)

**3. Configuration Vercel**
- [ ] Ajouter environment variables dans Vercel Dashboard
- [ ] Tester app en production après config
- [ ] Vérifier logs déploiement

**4. Tests Pre-Launch**
- [ ] Installer sur 2-3 boutiques de dev
- [ ] Tester full user flow (signup → generate → subscribe)
- [ ] Tester webhooks GDPR manuellement
- [ ] Vérifier billing flow (mode test ok)

**5. Finaliser Config**
- [ ] Passer `isTest: false` dans shopify.server.ts
- [ ] Déployer: `shopify app deploy`
- [ ] Vérifier webhooks enregistrés dans Partners Dashboard

### Priorité MOYENNE (Post-Soumission)

**6. Landing Page**
- [ ] Créer landing page dédiée (pas juste App Store)
- [ ] Sections: Hero, Features, Pricing, FAQ, CTA
- [ ] Optimiser pour SEO (keywords)
- [ ] Setup Google Analytics

**7. Content Creation**
- [ ] Écrire 3 premiers blog posts
- [ ] Enregistrer 2 tutorial videos YouTube
- [ ] Créer 20 posts social media (buffer)

**8. Email Sequences**
- [ ] Setup email service (Resend déjà dans .env)
- [ ] Créer 6 emails onboarding
- [ ] Templates transactionnels (welcome, upgrade, etc.)

**9. Monitoring**
- [ ] Setup Sentry (error tracking)
- [ ] Configure alerts (Vercel + email)
- [ ] Dashboard analytics (Mixpanel ou similaire)

### Priorité BASSE (Post-Launch)

**10. Partnerships**
- [ ] Liste 20 Shopify agencies target
- [ ] Outreach template + pitch deck
- [ ] Programme d'affiliation (tracking system)

**11. Influenceurs**
- [ ] Liste 50 YouTubers e-commerce (tier 1-3)
- [ ] Pitch deck créé
- [ ] Outreach campaign

**12. Paid Ads**
- [ ] Google Ads account setup
- [ ] Facebook Ads account setup
- [ ] Créer 10 ad variations (A/B test)
- [ ] Landing page optimized for conversion

**13. Features Roadmap**
- [ ] Referral system
- [ ] Public gallery
- [ ] Batch mode (multiple products)
- [ ] API access (pour agencies)
- [ ] Shopify Theme Extension (generate from storefront)

---

## Métriques et KPIs

### Acquisition Metrics

**App Store**:
- Impressions (vues listing)
- Install rate (installs / impressions)
- Total installs/month
- Source tracking (organic search, paid, referral)

**Target**:
- Month 1: 50 installs
- Month 3: 200 installs
- Month 6: 500 installs

**Website**:
- Traffic (visitors/month)
- Bounce rate (<60%)
- Time on site (>2min)
- Conversion to install (>10%)

### Activation Metrics

**Onboarding**:
- % users generating first mockup (<5min after install)
- % users using all 10 free credits
- Time to first value

**Target**: >70% complete first generation

### Retention Metrics

**Daily/Weekly/Monthly Active Users**:
- DAU / MAU ratio (stickiness)
- 7-day retention
- 30-day retention
- 90-day retention

**Target**:
- 7-day: >40%
- 30-day: >20%
- 90-day: >10%

### Monetization Metrics

**Conversion**:
- Free → Pro conversion rate
- Time to conversion (days)
- MRR (Monthly Recurring Revenue)
- ARPU (Average Revenue Per User)

**Target**:
- Conversion: 10-15%
- MRR Month 3: $1,500 (75 Pro users)
- MRR Month 6: $5,000 (250 Pro users)

**Unit Economics**:
- CAC (Customer Acquisition Cost): <$30
- LTV (Lifetime Value): $200+ (10 months average)
- LTV:CAC ratio: >3:1
- Payback period: <3 months

**Churn**:
- Monthly churn rate: <5%
- Reasons for churn (survey)
- Win-back campaigns

### Engagement Metrics

**Usage**:
- Avg mockups generated/user/month
- Most popular styles
- Most popular aspect ratios
- Campaign Pack adoption rate

**Support**:
- Response time (<24h)
- Resolution time (<48h)
- CSAT (Customer Satisfaction): >4.5/5

### Growth Metrics

**Viral Coefficient (K-factor)**:
- Invites sent per user
- Invite conversion rate
- K-factor (>1 = viral growth)

**Channel Performance**:

| Channel | CAC | Conversion | LTV | ROI |
|---------|-----|------------|-----|-----|
| Organic Search | $5 | 15% | $200 | 40x |
| Google Ads | $40 | 10% | $200 | 5x |
| Facebook Ads | $35 | 12% | $200 | 6x |
| Content/SEO | $10 | 18% | $200 | 20x |
| Referral | $15 | 20% | $200 | 13x |
| Influencer | $25 | 14% | $200 | 8x |

**Track weekly** in spreadsheet ou dashboard.

### Dashboard Tools Recommandés

**Analytics**:
- Google Analytics (traffic)
- Mixpanel ou Amplitude (product analytics)
- Shopify Partners Dashboard (app metrics)

**Monitoring**:
- Vercel Analytics (performance)
- Sentry (errors)
- Better Uptime (availability)

**Business**:
- Stripe Dashboard (revenue si outside Shopify)
- Shopify Billing API (subscriptions)
- Spreadsheet pour unit economics

---

## Ressources et Références

### Documentation Shopify

**App Development**:
- [Shopify App Development Docs](https://shopify.dev/docs/apps)
- [Remix App Tutorial](https://shopify.dev/docs/apps/build/scaffold-app)
- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)
- [Polaris Design System](https://polaris.shopify.com)

**Distribution & Launch**:
- [App Distribution Guide](https://shopify.dev/docs/apps/launch/distribution)
- [App Store Listing Best Practices](https://shopify.dev/docs/apps/launch/marketing)
- [Privacy Compliance](https://shopify.dev/docs/apps/build/privacy-law-compliance)
- [Built for Shopify Program](https://shopify.dev/docs/apps/launch/built-for-shopify)

**Billing & Monetization**:
- [Billing API Reference](https://shopify.dev/docs/apps/build/billing)
- [Pricing Models Guide](https://shopify.dev/docs/apps/launch/pricing)

### Tools & Services

**Development**:
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Prisma Docs](https://www.prisma.io/docs)
- [Remix Docs](https://remix.run/docs)
- [Vercel Docs](https://vercel.com/docs)

**AI/ML**:
- [Replicate API Docs](https://replicate.com/docs)
- [Google Vertex AI](https://cloud.google.com/vertex-ai/docs)
- [Gemini API](https://ai.google.dev/docs)

**Marketing Tools**:
- [Google Ads Keyword Planner](https://ads.google.com/home/tools/keyword-planner/)
- [Product Hunt Launch Guide](https://www.producthunt.com/launch)
- [Buffer](https://buffer.com) (social scheduling)
- [Mailchimp](https://mailchimp.com) ou [Resend](https://resend.com) (email)

**Analytics**:
- [Google Analytics 4](https://analytics.google.com)
- [Mixpanel](https://mixpanel.com)
- [Amplitude](https://amplitude.com)

**Monitoring**:
- [Sentry](https://sentry.io) (error tracking)
- [Better Uptime](https://betteruptime.com) (uptime monitoring)
- [Vercel Analytics](https://vercel.com/analytics)

### Community & Support

**Forums**:
- [Shopify Community](https://community.shopify.com)
- [Shopify Partners Slack](https://shopifypartners.slack.com)
- [r/shopify](https://reddit.com/r/shopify)

**Learning**:
- [Shopify Partner Academy](https://www.shopify.com/partners/academy)
- [YouTube: Shopify Devs Channel](https://www.youtube.com/@ShopifyDevs)

### Competitors & Inspiration

**Similar Apps** (Competitor Analysis):
- Mockup Studio (Shopify App Store)
- Placeit by Envato
- Smartmockups
- Canva (indirect competitor)

**Study leur**:
- Pricing models
- Features offered
- Reviews (pain points à résoudre)
- Screenshots (UX inspiration)
- Marketing copy

### Books & Resources

**Product & Growth**:
- "Traction" by Gabriel Weinberg (19 acquisition channels)
- "The Lean Startup" by Eric Ries
- "Hooked" by Nir Eyal (product engagement)

**Marketing**:
- "Content Inc." by Joe Pulizzi
- "Influence" by Robert Cialdini
- "Made to Stick" by Chip & Dan Heath

**E-commerce**:
- Shopify Blog: shopify.com/blog
- eCommerce Fuel Podcast
- My Wife Quit Her Job Podcast

---

## Changelog

**2026-01-27**:
- ✅ Analyse complète du plugin Shopify
- ✅ Vérification sécurité credentials
- ✅ Implémentation webhooks GDPR
- ✅ Configuration shopify.app.toml
- ✅ Création SECURITY_CHECKLIST.md
- ✅ Création GDPR_IMPLEMENTATION.md
- ✅ Git push commit GDPR (e2502da)
- ✅ Création de ce document CLAUDE.MD

---

## Notes Importantes

### Fichiers Critiques

**Ne JAMAIS commiter**:
- `.env`
- `.env.production`
- `.env.local`
- Fichiers avec API keys
- `dev.sqlite` (database locale)

**Toujours commiter**:
- `shopify.app.toml`
- `prisma/schema.prisma`
- Tous les fichiers `/app`
- Documentation (.md)

### Commandes Utiles

```bash
# Development
cd shopify
npm install
npm run dev

# Build
npm run build

# Deploy
shopify app deploy

# Webhooks test
shopify app webhook trigger --topic=shop/redact

# Database
npx prisma migrate dev
npx prisma studio

# Git
git status
git add .
git commit -m "message"
git push
```

### Support

**Créateur de ce document**: Claude Code (AI Assistant)
**Date**: 2026-01-27
**Contact Projet**: [Votre email]
**Repository**: https://github.com/fran6will/mockups

---

**Status Actuel**: 🟢 Ready for App Store Submission (pending assets & privacy policy)

**Next Milestone**: First 50 installs 🎯

---

*Ce document sera mis à jour au fur et à mesure de l'évolution du projet.*
