# Rapport Technique - Authentification et Infrastructure

**Projet** : Althea Systems - Plateforme e-commerce B2B  
**Auteur** : Samy  
**Role** : DevOps - Auth et Infrastructure  
**Date** : 12 avril 2026 (mis a jour)

---

## Table des matieres

1. [Contexte et responsabilites](#1-contexte-et-responsabilites)
2. [Configuration NextAuth](#2-configuration-nextauth)
3. [Middleware de protection](#3-middleware-de-protection)
4. [Authentification a deux facteurs](#4-authentification-a-deux-facteurs)
5. [Infrastructure Docker](#5-infrastructure-docker)
6. [Systeme de cache Redis](#6-systeme-de-cache-redis)
7. [Stockage des images (Cloudflare R2)](#7-stockage-des-images-cloudflare-r2)
8. [Validation des variables d'environnement](#8-validation-des-variables-denvironnement)
9. [Securisation des endpoints API](#9-securisation-des-endpoints-api)
10. [Integration Continue (GitHub Actions)](#10-integration-continue-github-actions)
11. [Hero Editorial et Animations](#11-hero-editorial-et-animations)
12. [i18n Multi-langues (FR/EN/AR)](#12-i18n-multi-langues-frenar)
13. [Chatbot IA](#13-chatbot-ia)
14. [Design System Editorial](#14-design-system-editorial)
15. [Carousel Produits GSAP](#15-carousel-produits-gsap)
16. [SEO Complet](#16-seo-complet)
17. [Autocomplete Adresse](#17-autocomplete-adresse)
18. [Optimisation Performances](#18-optimisation-performances)
19. [Decisions techniques et justifications](#19-decisions-techniques-et-justifications)
20. [Temps de developpement](#20-temps-de-developpement)
21. [Difficultes rencontrees](#21-difficultes-rencontrees)
22. [Pistes d'amelioration](#22-pistes-damelioration)

---

## 1. Contexte et responsabilites

### 1.1 Presentation du projet

Althea Systems est une plateforme e-commerce destinee a la vente de materiel medical pour cabinets medicaux. Le projet necessite une architecture robuste, securisee et scalable pour repondre aux exigences du secteur medical.

### 1.2 Perimetre de mon intervention

En tant que responsable Auth et Infrastructure, mes missions etaient :

- Configurer le systeme d'authentification complet (OAuth, credentials, 2FA)
- Proteger les routes sensibles via un middleware
- Mettre en place l'infrastructure Docker pour le deploiement
- Implementer un systeme de cache Redis pour les performances

### 1.3 Stack technique utilisee

| Composant       | Technologie      | Version    |
| --------------- | ---------------- | ---------- |
| Framework       | Next.js          | 16.x       |
| Auth            | NextAuth.js      | 4.x        |
| ORM             | Prisma           | 6.x        |
| Cache           | Redis / ioredis  | 7.x        |
| Container       | Docker           | 24.x       |
| Base de donnees | PostgreSQL       | 15         |
| Runtime         | Node.js          | >=20.0.0   |
| CI/CD           | GitHub Actions   | -          |
| Stockage        | Cloudflare R2    | -          |
| Paiement        | Stripe           | 2025-11-17 |
| Animations      | Framer Motion    | 12.x       |
| Animations      | GSAP             | 3.x        |
| Smooth scroll   | Lenis            | 1.x        |
| i18n            | next-intl        | 4.x        |
| IA              | OpenAI SDK       | 6.x        |

---

## 2. Configuration NextAuth

### 2.1 Architecture choisie

Le fichier `src/lib/auth.ts` centralise toute la configuration d'authentification. Cette approche permet de maintenir un point unique de verite pour la gestion des sessions.

### 2.2 Providers implementes

#### OAuth Providers

Deux providers OAuth ont ete configures pour offrir une connexion simplifiee :

```
- Google OAuth 2.0
- GitHub OAuth
```

Note : Apple Sign In a ete retire car il necessitait un compte Apple Developer payant (99$/an). Cette decision a ete prise pour simplifier la maintenance et eviter des couts inutiles pour un projet de fin d'etudes.

Chaque provider utilise l'option `allowDangerousEmailAccountLinking: true` pour permettre aux utilisateurs de lier plusieurs methodes de connexion au meme compte email. Ce choix a ete fait pour ameliorer l'experience utilisateur tout en acceptant le compromis de securite associe.

#### Credentials Provider

L'authentification par email/mot de passe est geree via le Credentials Provider avec :

- Validation des identifiants contre la base PostgreSQL
- Hashage des mots de passe avec bcrypt
- Verification de l'email avant autorisation de connexion
- Logging des tentatives de connexion (reussies et echouees)

### 2.3 Strategie de session

La strategie JWT a ete privilegiee pour plusieurs raisons :

1. **Scalabilite** : Pas de stockage de session en base de donnees
2. **Stateless** : Chaque requete est autonome
3. **Performance** : Pas de requete base de donnees pour valider la session

Configuration appliquee :

- Duree de session : 30 jours
- Les informations utilisateur (id, role, statut 2FA) sont encodees directement dans le token JWT, qui est stocke cote client (cookie httpOnly)

### 2.4 Callbacks personnalises

Trois callbacks ont ete implementes :

**signIn** : Log des connexions OAuth pour tracabilite

**jwt** : Enrichissement du token avec les donnees utilisateur (role, statut 2FA). Gestion des mises a jour de session via le trigger "update".

**session** : Propagation des informations du token vers l'objet session accessible cote client.

### 2.5 Logging

Integration d'un systeme de logging personnalise pour tracer :

- Les connexions reussies
- Les echecs d'authentification
- Les deconnexions

---

## 3. Middleware de protection

### 3.1 Fichier concerne

`src/middleware.ts` - Execute sur l'Edge Runtime de Next.js

### 3.2 Routes protegees

Le middleware definit trois categories de routes :

| Categorie | Routes                                           | Protection                   |
| --------- | ------------------------------------------------ | ---------------------------- |
| Admin     | `/admin/*`                                       | Role ADMIN + 2FA obligatoire |
| Compte    | `/profile`, `/orders`, `/addresses`, `/payments` | Utilisateur connecte         |
| Auth      | `/login`, `/register`, `/forgot-password`, etc.  | Redirection si deja connecte |

### 3.3 Logique de protection

Pour les routes admin, le middleware applique une verification en cascade :

1. Verification de la presence d'un token JWT
2. Verification du role ADMIN
3. Verification de l'activation du 2FA
4. Verification de la validation du 2FA dans la session courante

Si l'une de ces conditions echoue, l'utilisateur est redirige vers la page appropriee (login, accueil, configuration 2FA, ou verification 2FA).

### 3.4 Headers de securite

Trois headers sont ajoutes a chaque reponse :

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Ces headers protegent contre :

- Le clickjacking (X-Frame-Options)
- Le MIME type sniffing (X-Content-Type-Options)
- Les fuites de referrer (Referrer-Policy)

### 3.5 Exclusions du middleware

Le matcher exclut les chemins suivants pour eviter les traitements inutiles :

- `/api/*` (routes API)
- `/_next/*` (assets Next.js)
- Fichiers statiques (images, fonts, favicon)

---

## 4. Authentification a deux facteurs

### 4.1 Implementation technique

Le 2FA utilise le standard TOTP (Time-based One-Time Password) via la librairie `otplib`.

### 4.2 Flux de configuration

**Etape 1 - Generation du secret** (`/api/auth/2fa/setup`)

- Generation d'un secret Base32 avec `authenticator.generateSecret()`
- Stockage temporaire dans Redis avec expiration de 10 minutes
- Generation de l'URL otpauth pour le QR code

**Etape 2 - Verification et activation** (`/api/auth/2fa/verify`)

- Recuperation du secret depuis Redis
- Verification du code TOTP saisi
- Si valide : sauvegarde du secret en base et activation du 2FA
- Suppression du secret temporaire de Redis

### 4.3 Flux de verification a la connexion

Lorsqu'un administrateur avec 2FA active se connecte :

1. Le middleware detecte que le 2FA n'est pas verifie pour cette session
2. Redirection vers `/admin/verify-2fa`
3. L'utilisateur saisit le code de son application d'authentification
4. Verification du code contre le secret stocke en base
5. Mise a jour de la session avec `twoFactorVerified: true`

### 4.4 Justification de l'obligation pour les admins

Le 2FA est obligatoire pour les administrateurs car ils ont acces :

- A la gestion des produits et du catalogue
- Aux donnees clients et commandes
- Aux parametres de l'application

Cette contrainte renforce la securite du back-office sans impacter l'experience des clients.

---

## 5. Infrastructure Docker et Deploiement

### 5.1 Contexte de deploiement

L'infrastructure de deploiement repose sur deux environnements distincts :

| Environnement | Outil                          | Usage                  |
| ------------- | ------------------------------ | ---------------------- |
| Local         | Docker Compose                 | Developpement et tests |
| Production    | Dokploy + Dockerfile custom    | Deploiement automatise |

En production, le deploiement est gere par Dokploy avec les caracteristiques suivantes :

- Autodeploy declenche a chaque push sur la branche main
- Build via un Dockerfile multi-stage custom avec BuildKit cache mounts
- Bases de donnees (PostgreSQL, Redis) hebergees sur Dokploy avec monitoring integre
- Image de production : 432 MB (contre 3.16 GB precedemment avec Nixpacks)

### 5.2 Architecture locale (Docker Compose)

Le fichier `docker/docker-compose.yml` definit les services pour le developpement :

| Service  | Image              | Port | Role                       |
| -------- | ------------------ | ---- | -------------------------- |
| app      | Build custom       | 3000 | Application Next.js        |
| postgres | postgres:15-alpine | 5432 | Base de donnees principale |
| redis    | redis:7-alpine     | 6379 | Cache et rate limiting     |

Note : MongoDB a ete initialement prevu mais finalement retire du projet car non necessaire. PostgreSQL gere toutes les donnees relationnelles et Redis gere le cache.

### 5.3 Dockerfile multi-stage (production)

Le Dockerfile utilise une approche multi-stage avec BuildKit cache mounts pour optimiser la taille de l'image et les temps de build :

**Stage 1 - deps** (node:20-alpine) :

- Installation des dependances npm
- BuildKit cache mount sur `/root/.npm` pour reutiliser le cache npm entre builds

**Stage 2 - builder** (node:20-alpine) :

- Copie des node_modules depuis le stage deps
- Generation du client Prisma
- Build de l'application Next.js (standalone output)
- BuildKit cache mount sur `/app/.next/cache` pour accelerer les rebuilds incrementaux

**Stage 3 - runner** (node:20-alpine) :

- Image de production minimale
- Utilisateur non-root `nextjs` (UID 1001) pour la securite
- Copie uniquement des fichiers necessaires : `.next/standalone`, `.next/static`, `public`
- Variables d'environnement de production (NODE_ENV, PORT, HOSTNAME)

**Resultats** :

- Taille image : 432 MB (contre 3.16 GB avec Nixpacks, soit -86%)
- Build cold : ~5m23s (contre 9m20s avec Nixpacks)
- Build cached (BuildKit) : ~2-3 min

### 5.4 Configuration des services locaux

#### PostgreSQL

- Volume persistant pour les donnees
- Healthcheck configure pour verifier la disponibilite
- Scripts d'initialisation dans `/docker-entrypoint-initdb.d`

#### Redis

- Mode appendonly pour la persistance
- Limite memoire de 256MB
- Politique d'eviction allkeys-lru

### 5.5 Reseau local

Tous les services partagent un reseau bridge `althea-network` permettant la communication inter-conteneurs par nom de service.

L'application depend des trois bases de donnees avec condition `service_healthy` pour s'assurer qu'elles sont pretes avant le demarrage.

### 5.6 Outils de developpement

Trois services supplementaires sont disponibles en profil "dev" :

- Adminer : Interface web pour PostgreSQL
- Redis Commander : Interface web pour Redis
- Mailhog : Serveur SMTP de test avec interface web

### 5.7 Deploiement production (Dokploy)

La production utilise un Dockerfile multi-stage custom :

| Composant  | Solution                                          |
| ---------- | ------------------------------------------------- |
| Build      | Dockerfile multi-stage + BuildKit cache mounts    |
| Hosting    | Dokploy                                           |
| Trigger    | Push sur branche main (autodeploy)                |
| PostgreSQL | Instance Dokploy avec monitoring                  |
| Redis      | Instance Dokploy avec monitoring                  |
| Image      | node:20-alpine, 432 MB, user non-root (UID 1001) |

Note : Le projet utilisait initialement Nixpacks (detection automatique du framework) qui generait des images de 3.16 GB sur une base Ubuntu. La migration vers un Dockerfile multi-stage custom a permis de reduire la taille de l'image de 86% et les temps de build de 60%.

Cette architecture permet :

- Un environnement de dev identique pour toute l'equipe via Docker Compose
- Un deploiement production optimise avec des images legeres
- Un monitoring centralise des bases de donnees en production

---

## 6. Systeme de cache Redis

### 6.1 Architecture du module

Le fichier `src/lib/redis.ts` implemente un systeme de cache complet avec plusieurs fonctionnalites.

### 6.2 Initialisation lazy

L'instance Redis utilise un pattern Proxy pour une initialisation differee :

- Evite les erreurs au build time
- Connection etablie uniquement a la premiere utilisation
- Configuration avec retry et ready check

### 6.3 Fonctionnalites implementees

#### Cache generique

- `getCache<T>` : Recuperation avec typage generique
- `setCache<T>` : Stockage avec TTL configurable
- `deleteCache` : Suppression unitaire
- `clearCachePattern` : Suppression par pattern

#### Cache de recherche

- Cle construite a partir de la requete et des filtres
- TTL de 5 minutes
- Invalidation globale disponible

#### Gestion des sessions

- Stockage des donnees de session utilisateur
- TTL de 24 heures
- Mise a jour de l'activite
- Invalidation de toutes les sessions d'un utilisateur

#### Rate limiting

- Implementation basee sur INCR/EXPIRE
- Retourne le nombre de requetes restantes
- Reset automatique a la fin de la fenetre

#### Cache produits et categories

- TTL de 10 minutes pour les produits
- TTL de 30 minutes pour les categories
- Invalidation automatique du cache recherche lors de la modification

### 6.4 Gestion des erreurs

Toutes les fonctions encapsulent les erreurs Redis :

- Logging des erreurs
- Retour de valeurs par defaut
- Pas de crash de l'application si Redis est indisponible

---

## 7. Stockage des images (Cloudflare R2)

### 7.1 Choix de Cloudflare R2 vs Base64/MongoDB

Le cahier des charges mentionnait l'utilisation de MongoDB pour le stockage des images. Cependant, apres analyse technique approfondie, cette approche presente plusieurs inconvenients majeurs :

**Pourquoi pas le stockage en base64 dans MongoDB ?**

| Critere              | Base64 MongoDB           | Cloudflare R2     |
| -------------------- | ------------------------ | ----------------- |
| Taille stockage      | +33% (encodage base64)   | Taille originale  |
| Performance requetes | Lente (documents lourds) | Instantanee (CDN) |
| Bande passante DB    | Elevee                   | Nulle             |
| Backup/Restore       | Complexe et long         | Independant       |
| CDN integre          | Non                      | Oui (mondial)     |
| Cout                 | Stockage DB cher         | Gratuit < 10GB    |
| Scalabilite          | Limitee                  | Illimitee         |

**Exemple concret** : Une image de 1MB en base64 devient 1.33MB. Avec 1000 images, la base MongoDB grossit de 1.33GB au lieu de stocker juste les URLs (quelques KB).

**Problemes techniques du base64** :

- Les images encodees en base64 augmentent de 33% en taille
- Chaque requete de page charge les donnees binaires depuis MongoDB
- Les index MongoDB deviennent inefficaces sur des documents volumineux
- Le temps de serialisation/deserialisation JSON impacte les performances
- Pas de mise en cache CDN possible

**Avantages de Cloudflare R2** :

- Stockage objet compatible S3, gratuit jusqu'a 10GB/mois
- CDN mondial integre pour des temps de chargement optimaux (< 50ms)
- Pas de frais de bande passante sortante (contrairement a AWS S3)
- Separation des responsabilites : PostgreSQL stocke les metadonnees, R2 stocke les fichiers binaires
- Images servies directement depuis les edge servers Cloudflare

### 7.2 Implementation technique

Le module `src/lib/r2.ts` utilise le SDK AWS S3 (compatible avec R2) :

```javascript
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

### 7.3 Fonctionnalites implementees

**Upload d'image** :

- Validation du type de fichier (JPEG, PNG, WebP, GIF)
- Limite de taille a 5MB
- Generation d'un nom unique avec timestamp
- Retour de l'URL publique

**Suppression d'image** :

- Extraction de la cle depuis l'URL
- Suppression du fichier sur R2

### 7.4 Integration avec le back-office

L'API `/api/upload` permet aux administrateurs d'uploader des images directement depuis le back-office. Les images sont stockees sur R2 et l'URL est sauvegardee en base de donnees (PostgreSQL).

Cette architecture permet :

- Un chargement rapide des images via le CDN Cloudflare
- Une gestion simplifiee des metadonnees en base relationnelle
- Une scalabilite sans impact sur les performances de la base

### 7.5 Variables d'environnement requises

```
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=althea-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## 8. Validation des variables d'environnement

Note : Le fichier de validation `src/lib/config/env.ts` a ete retire lors de la simplification du projet et de la suppression de MongoDB. La validation des variables est maintenant geree au niveau de chaque module (Redis, Stripe, etc.) avec des messages d'erreur explicites.

---

## 9. Securisation des endpoints API

### 9.1 Contexte

Lors d'une revue de securite, plusieurs endpoints API ont ete identifies comme potentiellement vulnerables car ils ne verifiaient pas les permissions de l'utilisateur.

### 9.2 Verification signature Stripe Webhook

**Probleme** : Le webhook Stripe acceptait toutes les requetes sans verification de signature.

**Commit** : `e52ef85` - 14 decembre 2025

**Solution implementee** :

```javascript
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Verification de la signature Stripe
  const event = await constructWebhookEvent(body, signature);

  // Traitement securise de l'evenement
  switch (event.type) {
    case "checkout.session.completed":
      // Traiter la commande
      break;
    case "payment_intent.succeeded":
      // Paiement reussi
      break;
  }
}
```

Cette verification empeche un attaquant d'envoyer de fausses notifications de paiement.

### 9.3 Protection des endpoints utilisateurs

**Probleme** : Les routes `/api/users` et `/api/users/[id]` etaient accessibles sans authentification.

**Commit** : `31171b6` - 14 decembre 2025

**Solution** : Ajout d'une verification admin au debut de chaque handler :

```javascript
const session = await getServerSession(authOptions);
if (!session || session.user.role !== "ADMIN") {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### 9.4 Protection de l'endpoint produits

**Probleme** : La route POST `/api/products` permettait a n'importe qui de creer des produits.

**Commit** : `248ae30` - 14 decembre 2025

**Solution** : Meme pattern de verification admin avant la creation de produit.

### 9.5 Suppression des logs sensibles

**Probleme** : Un `console.log` dans le bouton d'ajout au panier exposait des informations en production.

**Commit** : `6883c47` - 14 decembre 2025

**Solution** : Suppression du log pour eviter les fuites d'information.

---

## 10. Integration Continue (GitHub Actions)

### 10.1 Contexte

Pour garantir la qualite du code et automatiser les verifications, un pipeline CI/CD complet a ete mis en place avec GitHub Actions.

**Commit principal** : `6eda990` - 1er janvier 2026

### 10.2 Workflow CI (Build & Lint)

Fichier : `.github/workflows/ci.yml`

Le workflow s'execute sur chaque push et pull request vers les branches `main` et `develop`.

**Jobs implementes** :

| Job             | Description                    | Dependances     |
| --------------- | ------------------------------ | --------------- |
| lint            | Execute ESLint sur le code     | -               |
| typecheck       | Verifie les types TypeScript   | -               |
| build           | Build de l'application Next.js | lint, typecheck |
| prisma-validate | Valide le schema Prisma        | -               |

**Optimisations** :

- Utilisation du cache npm pour accelerer les installations
- Concurrency group pour annuler les builds obsoletes
- Variables d'environnement placeholder pour le build CI

### 10.3 Workflow Security

Fichier : `.github/workflows/security.yml`

**Fonctionnalites** :

- Audit des dependances npm (vulnerabilites high/critical)
- Analyse CodeQL pour detecter les failles de securite dans le code
- Execution hebdomadaire automatique (cron le lundi a 9h)

### 10.4 Workflow Docker

Fichier : `.github/workflows/docker.yml`

Build automatique de l'image Docker pour valider le Dockerfile.

### 10.5 Labeler automatique

Fichier : `.github/workflows/label-pr.yml` + `.github/labeler.yml`

Ajoute automatiquement des labels aux Pull Requests selon les fichiers modifies :

- `frontend` pour les modifications dans `src/components/`
- `backend` pour les modifications dans `src/app/api/`
- `database` pour les modifications dans `prisma/`
- `ci` pour les modifications dans `.github/`
- etc.

### 10.6 Difficultes rencontrees

**Probleme 1** : Le build echouait car les variables d'environnement n'etaient pas disponibles en CI.

**Commit** : `163362f`

**Solution** : Ajout de variables placeholder dans le workflow :

```yaml
env:
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET || 'ci-build-secret-placeholder' }}
  NEXTAUTH_URL: http://localhost:3000
  DATABASE_URL: ${{ secrets.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder' }}
```

**Probleme 2** : Stripe crashait au build car il tentait d'initialiser une connexion.

**Commit** : `01de9a0`

**Solution** : Implementation du lazy loading pour Stripe (voir section 19.7).

---

## 11. Hero Editorial et Animations

### 11.1 Contexte

Le composant HeroCanvasReveal initial (Canvas API, decembre 2025) a ete entierement remplace par un hero editorial utilisant Framer Motion et des SVG animes. Cette refonte s'inscrit dans la mise en place du design system editorial du projet.

### 11.2 Composants implementes

**SplitText** : Decomposition du texte caractere par caractere avec reveal anime via Framer Motion `whileInView`. Chaque caractere est enveloppe dans un `motion.span` avec un delai progressif.

**Blueprint SVG technique** : Illustration animee composee d'anneaux concentriques, d'un crosshair central et de graduations. Les animations utilisent `motion.circle` et `motion.line` avec `pathLength` anime de 0 a 1 pour un effet de dessin progressif.

**MagneticButton** : Bouton CTA avec effet magnetique au survol. Utilise `useMotionValue` et `useSpring` de Framer Motion pour suivre la position du curseur et appliquer une attraction fluide.

**ScrollReveal** : Wrapper generique pour les animations au scroll. Utilise `whileInView` avec des transitions sur `opacity`, `y` et `filter: blur()` pour un effet de revelation progressif.

**Lenis smooth scroll** : Provider global pour le defilement fluide sur l'ensemble du site. Initialise au niveau du layout racine.

### 11.3 Integration technique

Le hero utilise :

- Framer Motion 12.x pour toutes les animations (pas de CSS keyframes)
- SVG natif pour les illustrations techniques (pas de Canvas API)
- Lenis 1.x pour le smooth scroll global
- Tailwind v4 pour le styling (zero CSS Modules)

---

## 12. i18n Multi-langues (FR/EN/AR)

### 12.1 Architecture

L'internationalisation utilise next-intl 4.x avec un routing base sur les cookies (et non sur un prefixe `[locale]/` dans l'URL). Ce choix a ete fait pour eviter de casser le routing NextAuth qui ne supporte pas les segments dynamiques en prefixe.

### 12.2 Fichiers de traduction

Les traductions sont stockees dans `src/i18n/locales/` :

- `fr.json` : Francais (langue par defaut)
- `en.json` : Anglais
- `ar.json` : Arabe

### 12.3 LanguageSwitcher

Un composant compact dans le header permet de changer de langue. Le choix est persiste dans un cookie et applique immediatement sans rechargement de page.

### 12.4 Support RTL

L'arabe necessite un affichage de droite a gauche. La fonction `getDirection()` retourne `'rtl'` ou `'ltr'` selon la locale active, et l'attribut `dir` est applique sur le `<html>`.

---

## 13. Chatbot IA

### 13.1 Architecture

Le chatbot utilise l'API OpenAI avec le modele `gpt-4o-mini` pour fournir une assistance contextuelle aux utilisateurs.

### 13.2 Backend

**Endpoint** : `/api/chat/route.ts`

- Streaming des reponses via l'API OpenAI (Server-Sent Events)
- Validation des messages entrants avec Zod (structure, longueur)
- Rate limiting de 5 requetes par minute par IP via Redis

### 13.3 Frontend

- Widget client avec bubble flottante en bas a droite de l'ecran
- Historique des conversations persiste dans `localStorage`
- Interface minimaliste coherente avec le design system editorial

---

## 14. Design System Editorial

### 14.1 Palette de couleurs

Le design system utilise une palette custom definie dans Tailwind v4 :

- `shadow-grey` : Gris fonce principal
- `electric-indigo` : Couleur d'accent primaire
- `lavender-mist` : Fond clair
- `medium-slate-blue` : Accent secondaire
- `ash-grey` : Echelle de gris complete (50-950)

### 14.2 Configuration Tailwind v4

La configuration utilise l'approche CSS-first de Tailwind v4 avec `@theme` inline dans `globals.css`. Plus de fichier `tailwind.config.ts` pour les tokens de design.

### 14.3 Typography

Quatre familles typographiques :

- **Hanken Grotesk** (sans-serif) : Corps de texte et headings
- **IBM Plex Mono** (monospace) : Code, labels techniques, prix
- **Newsreader** (serif) : Citations, accents editoriaux
- **Noto Sans Arabic** : Support RTL pour la langue arabe

### 14.4 Composants UI

Les composants suivent une esthetique editoriale stricte :

- **SplitText** : Reveal caractere par caractere
- **ScrollReveal** : Animation au scroll (opacity, y, blur)
- **MagneticButton** : Attraction magnetique au survol
- **Blueprint SVG** : Illustration technique animee

### 14.5 Product cards editoriales

- Format portrait aspect 3/4
- Images en grayscale par defaut, passage en couleur au hover
- Typographie en monospace caps avec tracking espace
- Zero shadow, zero rounded-xl, tout en border outline

---

## 15. Carousel Produits GSAP

### 15.1 Implementation

Fichier : `cta-products-carousel.tsx`

Le carousel utilise GSAP 3.x avec le plugin ScrollTrigger pour creer un defilement horizontal pin avec scrub lie au scroll vertical.

### 15.2 Fonctionnalites

- **ScrollTrigger pin** : Le carousel est epingle pendant le scroll vertical, le contenu defile horizontalement
- **Drag-to-scroll** : Support du drag avec pointer capture pour une interaction tactile fluide
- **Parallax inverse** : Les images se deplacent en sens inverse du scroll pour un effet de profondeur
- **Progress bar** : Barre de progression animee synchronisee avec le scroll
- **Mobile fallback** : Sur mobile, le scroll horizontal utilise le snap-scroll natif CSS (pas de GSAP)
- **Accessibilite** : `prefers-reduced-motion` respecte, les animations sont desactivees si l'utilisateur le demande

---

## 16. SEO Complet

### 16.1 Bug critique corrige

Le fichier `sitemap.ts` utilisait `product.id` (CUID) pour construire les URLs au lieu de `product.slug`. Google crawlait donc des URLs de type `/products/clxxxxxxxxx` qui retournaient des 404. La correction utilise un `select { slug }` dans la query Prisma.

### 16.2 JSON-LD enrichi

**Pages globales** :

- `Organization` + `LocalBusiness` + `Store` pour le Knowledge Panel Google
- `sameAs` avec les liens vers les reseaux sociaux
- `address`, `telephone`, `foundingDate`

**Pages produits** :

- `Product` avec `MerchantReturnPolicy` et `OfferShippingDetails`

**Pages categories** :

- `CollectionPage` + `BreadcrumbList`

### 16.3 OG Image dynamique

Les images Open Graph sont generees dynamiquement via un screenshot Playwright, stockees sur Cloudflare R2 CDN.

### 16.4 PWA et multi-langues

- `manifest.webmanifest` pour le support PWA
- `hreflang` alternates pour `fr-FR`, `en-US`, `ar`, `x-default`
- Slots de verification Google Search Console et Bing Webmaster Tools

---

## 17. Autocomplete Adresse

### 17.1 Implementation

Hook `useAddressAutocomplete` utilisant l'API Adresse de la Base Adresse Nationale (api-adresse.data.gouv.fr).

### 17.2 Caracteristiques

- Gratuit, sans cle API, base de 34M+ adresses francaises
- Debounce de 300ms sur la saisie utilisateur
- AbortController pour annuler les requetes en cours lors d'une nouvelle saisie
- Dropdown de suggestions avec auto-fill des champs street, postalCode, city et country au clic

---

## 18. Optimisation Performances

### 18.1 Migration Nixpacks vers Dockerfile multi-stage

- Taille image : 3.16 GB (Nixpacks, Ubuntu base, single-stage) vers 432 MB (node:20-alpine, 3 stages)
- Reduction de 86% de la taille de l'image

### 18.2 Temps de build

- Cold build (Nixpacks) : 9m20s
- Cold build (Dockerfile) : 5m23s
- Cached build (BuildKit cache mounts) : ~2-3 min

### 18.3 Correction des vulnerabilites

- `npm audit fix` : 36 vulnerabilites vers 1 restante
- Mises a jour : next 16.2.3, fast-xml-parser 5.5.8, prisma 6.19.3, @aws-sdk 3.1029.0

---

## 19. Decisions techniques et justifications

### 19.1 Choix de NextAuth.js

**Avantages** :

- Integration native avec Next.js
- Support de multiples providers
- Gestion automatique des sessions JWT
- Communaute active et documentation complete

**Alternative consideree** : Clerk, Auth0
**Raison du rejet** : Dependance a un service tiers, cout potentiel

### 19.2 Choix de JWT vs Sessions base de donnees

**Avantages du JWT** :

- Pas de requete BDD pour valider une session
- Scalabilite horizontale sans partage d'etat
- Fonctionne avec l'Edge Runtime

**Inconvenient accepte** : Revocation de session moins immediate

### 19.3 Choix de Redis pour le cache

**Avantages** :

- Performance (operations en memoire)
- Support des structures de donnees complexes
- TTL natif sur les cles
- Persistence optionnelle

**Alternative consideree** : Cache en memoire Node.js
**Raison du rejet** : Pas de partage entre instances, perte au redemarrage

### 19.4 Choix de Dokploy avec Dockerfile custom pour la production

**Avantages** :

- Deploiement automatise via Dokploy avec autodeploy sur push main
- Dockerfile multi-stage custom avec BuildKit cache mounts pour des builds rapides
- Image de production legere (432 MB vs 3.16 GB avec Nixpacks)
- Monitoring integre pour les bases de donnees
- Controle total sur la configuration de l'image (user non-root, alpine base)

Note : Le projet utilisait initialement Nixpacks (detection automatique du framework). La migration vers un Dockerfile custom a ete motivee par la taille excessive des images Nixpacks (3.16 GB, base Ubuntu) et le manque de controle sur les optimisations de build.

**Alternative consideree** : Vercel, Nixpacks (solution precedente)
**Raison du rejet** : Vercel impose des limites sur les fonctions serverless. Nixpacks generait des images trop volumineuses sans possibilite d'optimisation.

### 19.5 Docker Compose pour le developpement local

**Avantages** :

- Environnement identique pour tous les developpeurs
- Isolation des services
- Demarrage en une commande

### 19.6 2FA obligatoire pour les admins

**Justification** :

- Le back-office contient des donnees sensibles (clients, commandes)
- Le secteur medical impose des standards de securite eleves
- Impact minimal sur l'experience (une seule configuration)

### 19.7 Lazy loading pour Stripe et Redis

**Probleme** : En CI et au build, les modules Stripe et Redis tentaient de s'initialiser immediatement, causant des erreurs car les variables d'environnement n'etaient pas disponibles.

**Commit** : `01de9a0` (Stripe), `8381878` (Redis)

**Solution** : Pattern singleton avec initialisation differee :

```javascript
// Stripe - Lazy loading
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not defined");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-11-17.clover",
    });
  }
  return stripeInstance;
}
```

**Avantages** :

- Pas d'erreur au build time
- Connexion etablie uniquement a la premiere utilisation
- Message d'erreur explicite si la variable manque a l'execution

### 19.8 Suppression de MongoDB

**Decision** : MongoDB a ete retire du projet.

**Commit** : `0319d87` - 19 decembre 2025

**Justification** :

- PostgreSQL couvre tous les besoins de stockage relationnel
- Redis gere le cache et les sessions temporaires
- MongoDB ajoutait de la complexite sans apporter de valeur ajoutee
- Reduction des couts d'hebergement et de maintenance

**Fichiers modifies** :

- `docker/docker-compose.yml` : Suppression du service MongoDB
- `src/lib/config/env.ts` : Suppression de MONGODB_URI
- Divers fichiers de documentation

### 19.9 Migration vers Node.js 20

**Commits** : `4e4d521`, `38e7788` - 4 decembre 2025

**Justification** :

- Node.js 20 est la version LTS actuelle
- Corrections de vulnerabilites dans les dependances
- Meilleures performances et support ES2023

**Implementation** :

- Ajout de `.nvmrc` avec la version 20
- Configuration `engines` dans `package.json` : `"node": ">=20.0.0"`
- Mise a jour des workflows CI pour utiliser Node 20

---

## 20. Temps de developpement

| Tache                                  | Duree estimee | Commentaire                          |
| -------------------------------------- | ------------- | ------------------------------------ |
| Configuration NextAuth de base         | 4h            | Providers, callbacks, types          |
| Integration OAuth (Google, GitHub)     | 2h            | Configuration console dev, tests     |
| Middleware de protection               | 3h            | Logique de redirection, edge runtime |
| Implementation 2FA                     | 6h            | Setup, verify, integration session   |
| Docker compose                         | 4h            | Services, healthchecks, volumes      |
| Dockerfile multi-stage                 | 2h            | Optimisation, debug                  |
| Systeme de cache Redis                 | 5h            | Helpers, patterns, tests             |
| Stockage images Cloudflare R2          | 3h            | Integration SDK S3, sanitization     |
| Securisation endpoints API             | 2h            | Verification auth, signature Stripe  |
| GitHub Actions CI/CD                   | 4h            | Workflows, debug variables env       |
| Lazy loading Stripe/Redis              | 2h            | Pattern singleton, fix build         |
| Suppression MongoDB                    | 1h            | Nettoyage code et config             |
| Debug et corrections                   | 4h            | Edge runtime, compatibilites         |
| Documentation                          | 4h            | Ce rapport                           |
| i18n (next-intl FR/EN/AR)             | 6h            | Cookie routing, RTL, traductions     |
| Chatbot OpenAI streaming               | 4h            | Endpoint, Zod, rate limit, widget    |
| Design system editorial + animations  | 15h           | Palette, typo, composants, Tailwind  |
| Hero Blueprint SVG + SplitText         | 8h            | Framer Motion, SVG anime, Lenis      |
| Carousel GSAP ScrollTrigger            | 6h            | Pin, drag, parallax, mobile fallback |
| SEO complet (JSON-LD, sitemap, OG)     | 5h            | Structured data, hreflang, PWA       |
| Autocomplete adresse BAN               | 2h            | Hook, debounce, dropdown             |
| Migration Nixpacks vers Dockerfile     | 3h            | Multi-stage, BuildKit, alpine        |
| Patch vulnerabilites + debug prod      | 4h            | npm audit, logger, Stripe redirect   |
| Refonte checkout/cart/2FA/search       | 8h            | Parcours utilisateur complet         |
| Product cards editoriales              | 3h            | Aspect 3/4, grayscale, mono caps     |

**Total estime** : ~120 heures

---

## 21. Difficultes rencontrees

### 21.1 Compatibilite Edge Runtime

**Probleme** : Le middleware Next.js s'execute sur l'Edge Runtime qui ne supporte pas toutes les APIs Node.js. Le rate limiting via ioredis causait une erreur `Cannot read properties of undefined (reading 'charCodeAt')`.

**Commit** : `63e707d` - 7 decembre 2025

**Solution** : Retrait du rate limiting du middleware. Cette fonctionnalite reste disponible pour les routes API classiques qui s'executent sur le Node.js runtime.

### 21.2 Gestion du 2FA dans la session

**Probleme** : Apres verification du code 2FA, la session devait etre mise a jour sans deconnecter l'utilisateur.

**Solution** : Utilisation du trigger "update" de NextAuth avec `session.update()` cote client pour rafraichir les informations de session.

### 21.3 Bug Redis Proxy en production

**Probleme** : En production sur Dokploy, le 2FA retournait une erreur 500. Les logs montraient `connect ETIMEDOUT` et `Cannot read properties of undefined (reading 'select')`.

**Diagnostic** :

1. Verification des logs applicatifs sur Dokploy
2. Confirmation que Redis etait bien lance et accessible (logs Redis OK)
3. Test de connectivite entre les containers
4. Identification du probleme dans le code Redis lui-meme

**Cause racine** : Le pattern Proxy JavaScript utilise pour l'initialisation lazy de Redis ne preservait pas correctement le contexte `this` de l'instance ioredis.

```javascript
// Code problematique
export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return getRedisInstance()[prop as keyof Redis];
  },
});
```

Le Proxy interceptait les appels de methodes mais retournait des fonctions non bindees, causant la perte du contexte de l'instance Redis.

**Solution** : Remplacement du Proxy par un objet avec des methodes wrapper explicites qui appellent directement l'instance Redis.

```javascript
// Code corrige
export const redis = {
  get: async (key: string) => getRedis().get(key),
  set: async (key: string, value: string, mode?: string, duration?: number) => {
    if (mode === "EX" && duration) {
      return getRedis().set(key, value, "EX", duration);
    }
    return getRedis().set(key, value);
  },
  del: async (...keys: string[]) => getRedis().del(...keys),
  // ... autres methodes
};
```

**Lecon apprise** : Les patterns JavaScript avances (Proxy, Reflect) peuvent causer des problemes subtils avec des librairies tierces qui dependent du contexte `this`. En production, privilegier des solutions explicites et testables.

### 21.4 Mapping des champs API Carrousel

**Probleme** : Apres avoir configure l'upload d'images sur Cloudflare R2, les images du carrousel ne s'affichaient pas sur le site. Le composant affichait le titre mais pas l'image.

**Diagnostic** :

1. Verification que l'image etait bien uploadee sur R2 (OK)
2. Verification de l'URL stockee en base de donnees (OK)
3. Inspection du composant `hero-carousel.tsx`

**Cause racine** : Le composant front-end utilisait le champ `imageUrl` alors que l'API retournait `image`. Incompatibilite entre le schema de l'API et l'interface TypeScript du composant.

**Solution** : Mise a jour de l'interface TypeScript pour correspondre au schema de l'API :

```typescript
// Avant
interface CarouselSlide {
  imageUrl?: string;
  ctaLink?: string;
}

// Apres
interface CarouselSlide {
  image?: string;
  link?: string | null;
}
```

**Lecon apprise** : Toujours valider la coherence entre le schema de l'API et les interfaces TypeScript cote client. Un typage strict aurait detecte cette erreur a la compilation.

### 21.5 Emojis dans les noms de fichiers images

**Probleme** : Les images uploadees dans le carrousel ne s'affichaient pas lorsque le nom du fichier original contenait des emojis ou des caracteres speciaux. L'URL generee par Cloudflare R2 etait invalide.

**Diagnostic** :

1. Upload d'une image avec emoji dans le nom (ex: `photo 📸 test.jpg`)
2. L'image etait stockee sur R2 mais l'URL contenait des caracteres non encodes
3. Le navigateur ne pouvait pas charger l'image

**Cause racine** : Les noms de fichiers avec emojis ou caracteres speciaux ne sont pas compatibles avec les URLs et causent des erreurs de chargement.

**Solution** : Ajout d'une regex de nettoyage dans `src/lib/r2.ts` avant l'upload :

```javascript
// Nettoyer le nom de fichier (retirer emojis/caracteres speciaux)
const cleanFileName = fileName.replace(/[^\w.-]/g, "_");
const key = `${Date.now()}-${cleanFileName}`;
```

La regex `/[^\w.-]/g` remplace tous les caracteres qui ne sont pas des lettres, chiffres, underscores, points ou tirets par un underscore.

**Lecon apprise** : Toujours sanitizer les noms de fichiers uploades par les utilisateurs avant de les stocker. Les caracteres Unicode (emojis, accents) peuvent causer des problemes d'encodage dans les URLs.

### 21.6 Suppression du provider Apple OAuth

**Probleme** : Le provider Apple Sign In etait configure mais necessitait un compte Apple Developer payant (99$/an) pour fonctionner en production.

**Decision** : Suppression complete du provider Apple pour eviter des erreurs de configuration et simplifier la maintenance.

**Fichiers modifies** :

- `src/lib/auth.ts` : Suppression du provider Apple de la configuration NextAuth
- `src/lib/config/env.ts` : Suppression des variables d'environnement Apple (APPLE_ID, APPLE_SECRET)
- `src/app/(auth)/login/page.tsx` : Suppression du bouton de connexion Apple
- `src/app/(auth)/register/page.tsx` : Suppression du bouton d'inscription Apple

**Lecon apprise** : Avant d'implementer une integration tierce, verifier les couts et prerequis (compte developer, certificats, etc.).

### 21.7 Correction de l'affichage du nom dans le dropdown profil

**Probleme** : Apres une connexion OAuth (Google), le nom/prenom de l'utilisateur n'apparaissait plus dans le dropdown du header, seul l'email s'affichait.

**Diagnostic** :

1. Verification du composant `UserDropdown`
2. Verification que les donnees firstName/lastName etaient bien presentes en session

**Cause racine** : Le composant affichait `session.user.name` qui pouvait etre vide si les champs firstName/lastName etaient remplis separement.

**Solution** : Modification du composant pour construire le nom complet a partir de firstName et lastName :

```typescript
const fullName =
  session.user.firstName && session.user.lastName
    ? `${session.user.firstName} ${session.user.lastName}`
    : session.user.name;
```

### 21.8 Nettoyage du code mort

**Probleme** : Plusieurs fonctions dans `src/lib/redis.ts` n'etaient jamais utilisees dans le projet, rendant le code plus difficile a maintenir.

**Analyse** : Utilisation de grep pour identifier les fonctions non appelees :

- `invalidateAllUserSessions` : 0 usages
- `getCachedProduct` : 0 usages
- `setCachedProduct` : 0 usages
- `invalidateProductCache` : 0 usages
- `getCachedCategories` : 0 usages
- `setCachedCategories` : 0 usages
- `invalidateCategoriesCache` : 0 usages
- `getCachedSearchResults` : 0 usages
- `setCachedSearchResults` : 0 usages
- `invalidateSearchCache` : 0 usages

**Decision** : Suppression de toutes les fonctions non utilisees, en gardant uniquement :

- `invalidateSession` : Utilisee pour la gestion des sessions
- Les fonctions de base du cache (getCache, setCache, deleteCache)

**Benefice** : Reduction de ~100 lignes de code, meilleure lisibilite, moins de maintenance.

**Lecon apprise** : Appliquer le principe YAGNI (You Aren't Gonna Need It) - ne pas implementer de fonctionnalites "au cas ou".

### 21.9 Variables d'environnement manquantes en CI

**Probleme** : Le build GitHub Actions echouait car les variables d'environnement (DATABASE_URL, NEXTAUTH_SECRET) n'etaient pas definies.

**Commit** : `163362f` - 1er janvier 2026

**Solution** : Utilisation de valeurs placeholder avec fallback :

```yaml
env:
  NEXTAUTH_SECRET: ${{ secrets.NEXTAUTH_SECRET || 'ci-build-secret-placeholder' }}
  DATABASE_URL: ${{ secrets.DATABASE_URL || 'postgresql://placeholder:placeholder@localhost:5432/placeholder' }}
```

**Lecon apprise** : Prevoir des valeurs par defaut pour le build CI, tout en s'assurant que ces placeholders ne fonctionnent pas en production.

### 21.10 Crash Stripe au build

**Probleme** : Meme apres les placeholders, le build echouait car Stripe tentait de s'initialiser et de valider sa cle API.

**Commit** : `01de9a0` - 1er janvier 2026

**Solution** : Refactoring complet de `src/lib/stripe.ts` pour utiliser le pattern lazy loading (voir section 19.7).

### 21.11 Logger EACCES en production containerisee

**Probleme** : Winston tentait de creer un repertoire `logs/` dans `/app` au demarrage, mais le user `nextjs` (UID 1001) n'avait pas les droits d'ecriture sur ce repertoire. Cela provoquait une erreur EACCES qui cascadait sur `/api/auth/session`, retournant une erreur 500 a chaque verification de session.

**Cause racine** : Le logger etait configure avec des file transports (winston-daily-rotate-file) qui necessitent un repertoire writable. En container avec un user non-root, `/app` est read-only.

**Solution** : Skip des file transports en production. Le logger n'utilise que stdout (console transport) en production, conformement au pattern 12-factor app. Les logs sont captures par le runtime Docker et accessibles via `docker logs`.

### 21.12 Sitemap URLs cassees (product.id vs product.slug)

**Probleme** : Le fichier `sitemap.ts` utilisait `product.id` (CUID) pour construire les URLs de produits. Google indexait donc des URLs de type `/products/clxxxxxxxxx` qui retournaient des 404 car les pages produits utilisent le slug.

**Solution** : Modification de la query Prisma pour selectionner `slug` au lieu de `id`, et construction des URLs avec `/products/${product.slug}`.

### 21.13 Stripe redirect vers localhost

**Probleme** : La route de checkout Stripe utilisait `process.env.NEXT_PUBLIC_URL` (variable inexistante) pour construire l'URL de retour. Le fallback etait `localhost:3000`, ce qui cassait le redirect apres paiement en production.

**Solution** : Utilisation de `NEXT_PUBLIC_APP_URL` avec fallback sur `NEXTAUTH_URL`, et path `/checkout/confirmation` pour la page de confirmation.

### 21.14 Image Docker 3.16 GB (Nixpacks)

**Probleme** : Dokploy utilisait Nixpacks par defaut, qui generait des images basees sur Ubuntu avec un single-stage build. L'image resultante pesait 3.16 GB et les builds prenaient plus de 9 minutes.

**Solution** : Migration vers un Dockerfile multi-stage custom utilisant `node:20-alpine` comme base. Trois stages (deps, builder, runner) avec BuildKit cache mounts sur `/root/.npm` et `/app/.next/cache`. Image finale : 432 MB, builds : 2-3 minutes.

### 21.15 Ticker phantom gap sur ecrans larges

**Probleme** : Le ticker (marquee de trust marks) affichait un gap visible lorsque le viewport depassait la largeur totale du contenu duplique. L'animation `translateX(-50%)` ne suffisait pas a couvrir les grands ecrans.

**Solution** : Quadrupler le repeat du contenu (2x vers 4x MARKS) et ajuster l'animation de `translateX(-50%)` a `translateX(-25%)` pour eliminer le gap visible.

### 21.16 npm audit 36 vulnerabilites dont 1 critique

**Probleme** : `npm audit` reportait 36 vulnerabilites, dont une critique dans `fast-xml-parser` (dependance transitive de `@aws-sdk/client-s3`), 9 CVEs dans Next.js 16.0.7 (DoS, CSRF), et des vulnerabilites dans Prisma 6.19.0.

**Solution** : `npm audit fix` suivi de mises a jour manuelles : next 16.2.3, fast-xml-parser 5.5.8, prisma 6.19.3, @aws-sdk 3.1029.0. Resultat : 1 vulnerabilite restante (non corrigeable).

---

## 22. Pistes d'amelioration

### 22.1 Court terme

- Ajouter un rate limiting compatible Edge Runtime (via Upstash Redis)
- Implementer la rotation des tokens JWT
- Ajouter des backup codes pour le 2FA
- Completer les traductions AR (certaines cles manquantes)
- Ajouter des tests E2E pour le parcours checkout

### 22.2 Moyen terme

- Mettre en place un monitoring centralise (Sentry pour les erreurs, logs structures)
- Ajouter des tests d'integration pour l'authentification et le chatbot
- Implementer la detection de connexions suspectes
- Cache ISR (Incremental Static Regeneration) pour les pages produits
- Optimisation des Core Web Vitals (LCP, CLS sur mobile)

### 22.3 Long terme

- Migration vers une solution de secrets management (Vault, AWS Secrets Manager)
- Implementation d'un WAF (Web Application Firewall)
- Audit de securite par un tiers
- Migration NextAuth v4 vers Auth.js v5
- Pipeline de tests visuels (Playwright screenshots) pour le design system

---

## Conclusion

L'infrastructure d'authentification, DevOps et front-end mise en place pour Althea Systems repond aux exigences de securite et de qualite d'une plateforme e-commerce B2B dans le secteur medical.

### Recapitulatif des realisations

**Authentification et securite** :

- Systeme NextAuth complet avec OAuth (Google, GitHub) et credentials
- 2FA obligatoire pour les administrateurs via TOTP
- Middleware de protection des routes avec verification des roles
- Securisation des endpoints API (signature Stripe, verification admin)

**Infrastructure** :

- Docker Compose pour l'environnement de developpement local
- Deploiement production automatise via Dokploy avec Dockerfile multi-stage custom
- Image de production optimisee : 432 MB (contre 3.16 GB avec Nixpacks)
- Systeme de cache Redis avec pattern lazy loading
- Stockage des images sur Cloudflare R2 (CDN mondial)

**DevOps et CI/CD** :

- Workflows GitHub Actions (lint, typecheck, build, security)
- Analyse CodeQL automatique pour la detection de vulnerabilites
- Labeler automatique des Pull Requests
- Correction de 36 vulnerabilites npm

**Front-end et UX** :

- Hero editorial avec SplitText, Blueprint SVG anime, MagneticButton
- Design system editorial complet (palette, typographie, composants)
- Carousel produits GSAP avec ScrollTrigger et parallax
- i18n tri-lingue (FR/EN/AR) avec support RTL
- Chatbot IA avec streaming OpenAI
- SEO complet avec JSON-LD enrichi, sitemap corrige, hreflang
- Autocomplete adresse via API BAN
- Smooth scroll Lenis

### Lecons apprises

1. **Tester en production-like** : Les problemes comme le Proxy Redis ou le logger EACCES n'apparaissent qu'en conditions reelles
2. **Lazy loading** : Initialiser les services a la demande pour eviter les crashes au build
3. **YAGNI** : Ne pas implementer de fonctionnalites "au cas ou" (MongoDB, fonctions cache inutilisees)
4. **Coherence API/Frontend** : Toujours valider les schemas entre backend et frontend (sitemap slug vs id)
5. **Optimisation Docker** : Un Dockerfile multi-stage bien configure reduit drastiquement la taille des images et les temps de build
6. **12-factor app** : En production containerisee, les logs doivent aller sur stdout, pas dans des fichiers

### Statistiques

| Metrique                | Valeur                        |
| ----------------------- | ----------------------------- |
| Commits totaux          | 205+ (vjuya 114 + itsaam 91) |
| Fichiers modifies       | ~400+                         |
| Lignes de code ajoutees | ~15000+                       |
| Temps total estime      | ~120 heures                   |

Les choix techniques (NextAuth, JWT, Redis, Docker multi-stage, GitHub Actions, Framer Motion, GSAP, next-intl) constituent une stack moderne et eprouvee qui facilitera l'evolution de la plateforme.
