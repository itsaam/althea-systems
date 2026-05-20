# Althea Systems

Plateforme e-commerce B2B de matériel médical — application Next.js 16 monolithique modulaire (frontend public + espace client + back-office + API), PostgreSQL + Redis, paiement Stripe, hébergement européen sur VPS Dokploy.

[![Node](https://img.shields.io/badge/node-%E2%89%A520.0.0-43853d)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-000000)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2d3748)](https://www.prisma.io)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

> Projet fil rouge Bachelor 3 CPI — Sup de Vinci 2025-2026, titre RNCP34581. Équipe de 4 : Samy Abdelmalek, Tristan Sanjuan, Rayan Menkar, Kelvin Chauvel.

---

## Sommaire

1. [Périmètre fonctionnel](#périmètre-fonctionnel)
2. [Architecture](#architecture)
3. [Modèle de données](#modèle-de-données)
4. [Stack technique](#stack-technique)
5. [Démarrage rapide](#démarrage-rapide)
6. [Configuration](#configuration)
7. [Structure du projet](#structure-du-projet)
8. [Authentification](#authentification)
9. [API](#api)
10. [Logs](#logs)
11. [Docker](#docker)
12. [Déploiement](#déploiement)
13. [Scripts](#scripts)
14. [Documentation](#documentation)
15. [Licence](#licence)

---

## Périmètre fonctionnel

Périmètre détaillé : [`docs/backlog.md`](./docs/backlog.md) — 61 user stories réparties en 8 epics (43 Must, 17 Should, 1 Could).

| Domaine | Contenu |
|---|---|
| **Authentification & sécurité** | Inscription email/password, OAuth Google et GitHub, vérification email obligatoire, 2FA TOTP obligatoire pour les admins, codes de secours, reset mot de passe |
| **Catalogue** | Catégories arborescentes, fiches produit, stock temps réel, recherche full-text, filtres prix/dispo, mise en avant, carrousel éditorial |
| **Panier & checkout** | Panier persistant (Zustand + localStorage), checkout 4 étapes, paiement Stripe (Checkout Session + webhook signé), email + facture PDF |
| **Espace client** | Profil, carnet d'adresses, historique commandes, téléchargement facture et avoir PDF, changement mot de passe |
| **Back-office admin** | Dashboard ventes, CRUD produits / catégories / utilisateurs / commandes, upload images R2, gestion factures et avoirs, carrousel d'accueil (Tiptap), export CSV/XLSX |
| **Contact & chatbot** | Formulaire de contact (rate-limité), chatbot OpenAI persisté en base, gestion des conversations côté admin (active / escaladée / fermée) |
| **Multilingue** | Français, anglais, arabe (RTL) via `next-intl`, préférence mémorisée |
| **Accessibilité & perf** | WCAG 2.1 AA, navigation clavier, lecteur d'écran, cache Redis, images servies via CDN R2 (WebP/AVIF) |

---

## Architecture

Application Next.js unique organisée en compartiments logiques (frontend public, back-office, API Routes) plutôt qu'en micro-services : un seul conteneur à déployer, coût d'hébergement maîtrisé (~30 €/mois), équipe de 4 personnes. Justification complète : [`docs/DOCUMENT_CADRAGE.md`](./docs/DOCUMENT_CADRAGE.md) §6.

```mermaid
graph TD
    subgraph Clients["Clients (navigateur)"]
        Mobile["Mobile<br/>iOS / Android"]
        Desktop["Desktop<br/>Windows / macOS / Linux"]
    end

    CF["Cloudflare<br/>(DNS + protection)"]
    Traefik["Traefik<br/>(reverse proxy + TLS)"]

    subgraph VPS["VPS européen (Dokploy)"]
        subgraph NextApp["Next.js (conteneur Docker)"]
            Public["Frontend public<br/>SSR + ISR"]
            Admin["Back-office admin<br/>SSR protégé"]
            ApiRoutes["API Routes<br/>/api/*"]
            NextAuth["NextAuth.js<br/>sessions + OAuth + TOTP"]
        end
        Postgres[("PostgreSQL 16<br/>données métier")]
        Redis[("Redis 7<br/>cache + rate limit")]
    end

    subgraph External["Services externes"]
        Stripe["Stripe<br/>paiement + webhook"]
        R2["Cloudflare R2<br/>images produits"]
        Resend["Resend<br/>emails transactionnels"]
        Google["Google OAuth"]
        GitHub["GitHub OAuth"]
        OpenAI["OpenAI<br/>chatbot"]
    end

    subgraph CI["CI/CD"]
        GHActions["GitHub Actions<br/>lint + test + build"]
        GHRepo["GitHub Repo"]
    end

    Mobile -- HTTPS --> CF
    Desktop -- HTTPS --> CF
    CF --> Traefik
    Traefik --> Public
    Traefik --> Admin
    Traefik --> ApiRoutes

    Public -- "Prisma" --> Postgres
    Admin -- "Prisma" --> Postgres
    ApiRoutes -- "Prisma" --> Postgres
    Public -- "cache" --> Redis
    ApiRoutes -- "cache + rate limit" --> Redis
    NextAuth --> Postgres

    NextAuth -- OAuth2 --> Google
    NextAuth -- OAuth2 --> GitHub

    ApiRoutes -- "Checkout Session" --> Stripe
    Stripe -- "webhook signé" --> ApiRoutes

    Admin -- "upload signé" --> R2
    Mobile -- "GET CDN" --> R2
    Desktop -- "GET CDN" --> R2

    ApiRoutes --> Resend
    ApiRoutes <--> OpenAI

    GHRepo --> GHActions
    GHActions -- "webhook deploy" --> VPS

    classDef client fill:#e0f2fe,stroke:#0369a1,color:#0c4a6e
    classDef app fill:#fef3c7,stroke:#b45309,color:#78350f
    classDef data fill:#dcfce7,stroke:#15803d,color:#14532d
    classDef external fill:#fce7f3,stroke:#be185d,color:#831843
    classDef ci fill:#ede9fe,stroke:#6d28d9,color:#4c1d95

    class Mobile,Desktop client
    class Public,Admin,ApiRoutes,NextAuth app
    class Postgres,Redis data
    class Stripe,R2,Resend,Google,GitHub,OpenAI external
    class GHActions,GHRepo ci
```

Diagramme source et tableau des flux : [`docs/architecture-diagram.md`](./docs/architecture-diagram.md).

### Tableau des flux critiques

| Source | Destination | Type | Description |
|---|---|---|---|
| Navigateur | Cloudflare | HTTPS | DNS + protection anti-DDoS |
| Cloudflare | Traefik | HTTPS | TLS terminé sur Traefik |
| Traefik | Next.js | HTTP interne | Reverse proxy dans le réseau Docker |
| Next.js | PostgreSQL | TCP (Prisma) | Données métier |
| Next.js | Redis | TCP | Cache, rate limiting, sessions chiffrées |
| Next.js | Stripe | HTTPS sortant | Création de Checkout Session |
| Stripe | Next.js | HTTPS entrant (webhook signé) | `payment_intent.succeeded`, mise à jour commande |
| Next.js | Cloudflare R2 | HTTPS (S3) | Upload signé depuis le back-office |
| Navigateur | Cloudflare R2 | HTTPS (CDN) | Lecture directe des images produits |
| Next.js | Resend | HTTPS REST | Emails transactionnels |
| Next.js | OpenAI | HTTPS REST | Prompts du chatbot |
| GitHub Actions | VPS | Webhook | Déclenchement du déploiement Dokploy |

---

## Modèle de données

17 modèles Prisma regroupés en 5 domaines. Schéma source : [`prisma/schema.prisma`](./prisma/schema.prisma). Diagramme complet et décisions de modélisation : [`docs/erd.md`](./docs/erd.md).

```mermaid
erDiagram
    User ||--o{ Account              : "compte OAuth"
    User ||--o{ Session              : "session NextAuth"
    User ||--o{ BackupCode           : "codes 2FA secours"
    User ||--o{ Address              : "carnet d'adresses"
    User ||--o{ Order                : "passe commande"
    User ||--o{ ChatbotConversation  : "initie"

    Category ||--o{ Category         : "sous-catégorie"
    Category ||--o{ Product          : "regroupe"
    Product  ||--o{ OrderItem        : "vendu dans"
    Address  ||--o{ Order            : "livraison / facturation"

    Order    ||--o{ OrderItem            : "contient"
    Order    ||--o{ OrderStatusHistory   : "historise"
    Order    ||--|| Invoice              : "facturée par"
    Order    ||--o{ CreditNote           : "remboursée par"
    Invoice  ||--o{ CreditNote           : "annule / corrige"

    ChatbotConversation ||--o{ ChatbotMessage : "contient"
```

### Énumérations Prisma

| Enum | Valeurs |
|---|---|
| `Role` | `USER`, `ADMIN` |
| `UserStatus` | `PENDING`, `ACTIVE`, `INACTIVE` |
| `ProductStatus` | `DRAFT`, `PUBLISHED` |
| `TvaRate` | `TVA_20`, `TVA_10`, `TVA_5_5`, `TVA_0` |
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `InvoiceStatus` | `PENDING`, `PAID`, `CANCELLED` |
| `CreditNoteReason` | `CANCELLATION`, `REFUND`, `ERROR` |
| `ChatbotRole` | `USER`, `ASSISTANT`, `SYSTEM` |
| `ChatbotStatus` | `ACTIVE`, `ESCALATED`, `CLOSED` |

### Décisions de modélisation

- **Instantané des prix** : `OrderItem.price` et `OrderItem.name` sont dupliqués depuis `Product` — une commande reste cohérente même si le produit est modifié ou supprimé ensuite.
- **Conservation de l'historique chatbot** : `onDelete: SetNull` sur `ChatbotConversation.userId` — la suppression d'un utilisateur conserve l'historique des échanges (traçabilité support, CDC §XV).
- **Catégorie auto-référente** : `Category.parentId` autorise une arborescence (CDC §VI).
- **TVA portée par le produit** : `Product.tva` est un enum, recalculée au moment de la commande.

---

## Stack technique

### Frontend

| Outil | Version | Rôle |
|---|---|---|
| Next.js | 16.0.7 | Framework React, App Router, RSC, Server Actions |
| React | 19.2.0 | UI, React Compiler activé |
| TypeScript | 5.x | Typage strict |
| Tailwind CSS | 4.x | Styling utilitaire |
| shadcn/ui | new-york | Composants accessibles (Radix sous-jacent) |
| Tiptap | 3.x | Éditeur riche back-office (carrousel) |
| Framer Motion + GSAP + Lenis | — | Animations |
| Zustand | 5.0.9 | Stores client (cart, UI) |
| React Hook Form + Zod | 7.71 / 4.1 | Formulaires et validation |
| next-intl | 4.5 | i18n FR / EN / AR + RTL |
| Recharts | 3.6 | Graphiques dashboard admin |
| Sonner | 2.0 | Toasts |

### Backend

| Outil | Version | Rôle |
|---|---|---|
| Next.js API Routes | 16.0.7 | API REST |
| Prisma | 6.19 | ORM + migrations |
| NextAuth.js | 4.24 | Sessions JWT + OAuth + adapter Prisma |
| ioredis | 5.8 | Client Redis (cache, rate limit, 2FA pending) |
| Winston | 3.18 | Logging structuré |
| bcryptjs | 3.x | Hash mots de passe |
| otplib | 12.0 | TOTP (2FA) |
| @react-pdf/renderer | 4.3 | Génération factures / avoirs PDF |
| ExcelJS | 4.4 | Export CSV / XLSX |
| Stripe SDK | 20.1 | Paiement |
| Resend SDK | 6.5 | Emails transactionnels |
| OpenAI SDK | 6.34 | Chatbot |
| AWS SDK v3 (S3) | 3.946 | Client S3 vers Cloudflare R2 |

### Données et services

| Service | Rôle |
|---|---|
| PostgreSQL 16 | Base principale (users, products, orders, invoices…) |
| Redis 7 | Cache pages catalogue, sessions 2FA, rate limiting |
| Cloudflare R2 | Stockage S3-compatible (images produits), CDN intégré |
| Stripe | Encaissement + webhooks signés |
| Resend | Emails transactionnels (templates React Email) |
| OpenAI | Chatbot client |

### DevOps

| Outil | Rôle |
|---|---|
| Docker + docker-compose | Conteneurisation locale (Postgres, Redis, Adminer, Redis Commander, MailHog) |
| Dokploy | Orchestrateur PaaS auto-hébergé sur VPS |
| Traefik | Reverse proxy + TLS automatique (Let's Encrypt) |
| Cloudflare | DNS + WAF |
| GitHub Actions | CI (lint, typecheck, tests, build) |
| Vitest + Testing Library | Tests unitaires et d'intégration |
| Playwright | Tests E2E |

---

## Démarrage rapide

```bash
# 1. Cloner et installer
git clone <repo>
cd althea-systems
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env (voir section Configuration)

# 3. Lancer Postgres + Redis (+ Adminer, Redis Commander, MailHog)
cd docker && docker compose --profile dev up -d && cd ..

# 4. Migrer + seeder la base
npm run db:migrate
npm run db:seed

# 5. Lancer l'app
npm run dev
# http://localhost:3000
```

Comptes de seed :

- Admin : `admin@althea.com` / `Admin123!` — 2FA à configurer à la première connexion.
- Client : `client@althea.com` / `Client123!`.

---

## Configuration

### Prérequis

- Node.js ≥ 20
- npm ≥ 10
- Docker + Docker Compose (ou Postgres 16 / Redis 7 locaux)

### Variables d'environnement

Fichier `.env` à la racine. Les clés sensibles **ne sont jamais commitées**.

```env
# Base de données
DATABASE_URL="postgresql://althea:password@localhost:5432/althea"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."   # openssl rand -base64 32

# OAuth (optionnel mais recommandé)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Cloudflare R2 (S3-compatible)
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="althea-images"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
R2_ENDPOINT="https://xxxxx.r2.cloudflarestorage.com"

# Email
RESEND_API_KEY="re_..."

# Chatbot
OPENAI_API_KEY="sk-..."
```

---

## Structure du projet

```
src/
├── app/                       # Next.js App Router
│   ├── (auth)/                # Login, register, verify-email, reset password
│   ├── (site)/                # Pages publiques : accueil, catalogue, fiche produit, panier, checkout, contact
│   ├── (account)/             # Espace client : profil, adresses, commandes, factures
│   ├── admin/                 # Back-office (Role=ADMIN + 2FA)
│   ├── api/                   # API Routes REST
│   ├── docs/                  # Swagger UI (next-swagger-doc)
│   ├── layout.tsx             # Layout racine + providers
│   └── globals.css
│
├── components/
│   ├── ui/                    # shadcn/ui (Button, Dialog, Input, …)
│   ├── admin/                 # Tables, stats, éditeur Tiptap
│   ├── products/              # Cards, filtres, galerie
│   ├── layout/                # Header, Footer, Sidebar
│   └── forms/                 # Formulaires réutilisables
│
├── lib/
│   ├── auth.ts                # NextAuth config (providers, callbacks, JWT)
│   ├── prisma.ts              # Singleton Prisma
│   ├── redis.ts               # Client Redis + helpers cache
│   ├── r2.ts                  # Upload Cloudflare R2 (AWS SDK)
│   ├── stripe.ts              # Client Stripe
│   ├── resend.ts              # Client Resend
│   ├── openai.ts              # Client OpenAI
│   ├── logger/                # Winston (config, messages, withApiLogger)
│   └── validators/            # Schémas Zod
│
├── stores/                    # Zustand (cart, ui)
├── hooks/                     # Hooks personnalisés (useAuth, useCart, useDebounce…)
├── types/                     # Types TS (augmentation NextAuth, dto…)
├── i18n/                      # next-intl (messages FR/EN/AR)
└── middleware.ts              # Protection routes + headers de sécurité

prisma/
├── schema.prisma              # 17 modèles, 10 enums
├── seed.ts                    # Données de test
└── migrations/

docker/
├── Dockerfile                 # Multi-stage Next.js standalone
└── docker-compose.yml         # postgres, redis, adminer, redis-commander, mailhog

__tests__/                     # Vitest (unit + integration)
e2e/                           # Playwright
docs/                          # Document de cadrage, ERD, backlog, A11Y, etc.
.claude/knowledge/             # Knowledge base interne (roadmap, archi, deploy, incidents)
```

---

## Authentification

Implémentation NextAuth (`src/lib/auth.ts`), stratégie JWT (30 jours), adapter Prisma pour persister sessions et comptes OAuth.

### Providers

| Provider | Mode | Particularité |
|---|---|---|
| Credentials | Email + mot de passe | Email vérifié obligatoire avant activation |
| Google | OAuth 2.0 | Connexion 1-clic |
| GitHub | OAuth 2.0 | Connexion 1-clic |

### 2FA (TOTP) — obligatoire pour les administrateurs

Flux : connexion classique → redirection `/admin` → vérification 2FA. Si non configuré, QR code (otplib + `qrcode.react`) à scanner avec Google Authenticator / 1Password / Authy. Vérification du code 6 chiffres puis session 2FA stockée dans Redis (TTL court).

Codes de secours à usage unique persistés dans `BackupCode` (hashés, marqués `used` après consommation).

### Protection des routes (middleware)

| Route | Règle |
|---|---|
| `/admin/*` | `session.user.role === "ADMIN"` ET `twoFactorVerified === true` |
| `/account`, `/orders`, `/addresses`, `/profile` | session active |
| `/login`, `/register` | redirection vers `/` si déjà connecté |

### Statuts utilisateurs

| Status | Effet |
|---|---|
| `PENDING` | Email non vérifié — connexion bloquée |
| `ACTIVE` | Compte opérationnel |
| `INACTIVE` | Désactivé par un administrateur |

---

## API

Documentation détaillée endpoint par endpoint : [`docs/api.md`](./docs/api.md) (knowledge base) et Swagger UI live sur `/docs`.

### Endpoints principaux

| Méthode | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | public | Inscription + envoi email de vérification |
| `GET`  | `/api/auth/verify-email` | public | Confirmation email |
| `POST` | `/api/auth/2fa/setup` | user | Génère secret TOTP + QR code |
| `POST` | `/api/auth/2fa/verify` | user | Vérifie code TOTP |
| `GET`  | `/api/products` | public | Liste paginée + filtres |
| `GET`  | `/api/products/[id]` | public | Détail produit |
| `POST` `PUT` `DELETE` | `/api/products[/id]` | admin | CRUD catalogue |
| `GET`  | `/api/categories` | public | Catégories arborescentes |
| `POST` | `/api/orders` | user | Création commande + Checkout Session Stripe |
| `POST` | `/api/stripe/webhook` | Stripe (signature) | Validation paiement, MAJ commande |
| `GET`  | `/api/orders/[id]/invoice.pdf` | user/admin | Téléchargement facture |
| `GET`  | `/api/orders/[id]/credit-note.pdf` | user/admin | Téléchargement avoir |
| `POST` | `/api/contact` | public (rate-limité) | Formulaire de contact |
| `POST` | `/api/chatbot/message` | public/user | Envoi message au chatbot OpenAI |
| `GET`  | `/api/admin/exports/orders.xlsx` | admin | Export Excel commandes |

### Pattern HOC `withApiLogger`

Toutes les routes API sont wrappées pour logger automatiquement requête, durée et statut.

```ts
import { withApiLogger, loggedSuccessResponse, loggedErrorResponse } from "@/lib/logger/exports";

export const GET = withApiLogger(async (req) => {
  try {
    const products = await prisma.product.findMany({ where: { status: "PUBLISHED" } });
    return loggedSuccessResponse({ products });
  } catch (error) {
    return loggedErrorResponse("Erreur récupération produits", 500);
  }
});
```

### Codes d'erreur standardisés

| Code | Usage |
|---|---|
| 400 | Validation Zod échouée |
| 401 | Pas de session |
| 403 | Session OK, rôle insuffisant |
| 404 | Ressource introuvable |
| 429 | Rate limit dépassé |
| 500 | Erreur serveur / BDD |

---

## Logs

Winston, sortie console + `logs/combined.log` + `logs/error.log`, format JSON.

Loggers par domaine (`src/lib/logger/exports.ts`) : `apiLogger`, `authLogger`, `productLogger`, `orderLogger`, `dbLogger`.

Messages centralisés (`src/lib/logger/messages.ts`) pour rester cohérent :

```ts
import { apiLogger, LogMessages } from "@/lib/logger/exports";

apiLogger.info(LogMessages.api.requeteRecue("GET", "/api/products"));
apiLogger.error(LogMessages.api.erreurServeur("Connection timeout"));
```

```bash
tail -f logs/combined.log     # tous les logs
tail -f logs/error.log        # erreurs uniquement
npm run logs:clear            # vider les logs
npm run test:logs             # test du logger
```

---

## Docker

Stack locale dans [`docker/docker-compose.yml`](./docker/docker-compose.yml).

| Service | Port | Profile |
|---|---|---|
| postgres (Postgres 16) | 5432 | default |
| redis (Redis 7) | 6379 | default |
| adminer (UI Postgres) | 8080 | dev |
| redis-commander (UI Redis) | 8081 | dev |
| mailhog (SMTP de test) | 8025 | dev |

```bash
cd docker
docker compose up -d                       # base
docker compose --profile dev up -d         # + outils dev
docker compose logs -f postgres            # logs
docker compose down                        # arrêt
docker compose down -v                     # arrêt + suppression volumes (perte de données)
```

Interfaces dev :

- Adminer — `http://localhost:8080` (serveur `postgres`, user `althea`, pass `password`, db `althea`)
- Redis Commander — `http://localhost:8081`
- MailHog — `http://localhost:8025`

L'image de production est construite par **Nixpacks** au moment du déploiement Dokploy (Next.js standalone, image finale < 500 MB).

---

## Déploiement

Production hébergée sur un VPS européen (~10 €/mois), orchestré par **Dokploy** (PaaS auto-hébergé), reverse-proxy **Traefik** avec TLS automatique (Let's Encrypt), DNS et WAF **Cloudflare**. Procédure complète : [`docs/deploy.md`](./.claude/knowledge/deploy.md).

Pipeline :

1. Push sur `main`.
2. GitHub Actions — lint, typecheck, build, tests.
3. Webhook Dokploy déclenche un build Nixpacks.
4. Migration Prisma au démarrage (`npm run start` exécute `prisma migrate deploy` puis `next start`).
5. Bascule du conteneur avec zero-downtime.

Domaine : `althea.vjuya.me`.

Checklist pré-déploiement :

- [ ] Variables d'environnement renseignées dans Dokploy (`STRIPE_SECRET_KEY=sk_live_…`, `R2_PUBLIC_URL=https://cdn.althea…`, etc.)
- [ ] Webhook Stripe configuré et `STRIPE_WEBHOOK_SECRET` à jour
- [ ] DNS A/CNAME alignés sur le VPS, Cloudflare en mode proxy
- [ ] Backup Postgres planifié côté Dokploy
- [ ] Monitoring / alerting opérationnel

---

## Scripts

### Application

```bash
npm run dev               # serveur de dev
npm run build             # prisma generate + next build
npm run start             # prisma migrate deploy + next start (prod)
npm run lint              # ESLint
npx tsc --noEmit          # vérification TypeScript
```

### Base de données

```bash
npm run db:migrate        # créer/appliquer une migration (dev)
npm run db:push           # push schema sans migration (prototypage)
npm run db:seed           # données de test
npm run db:studio         # Prisma Studio (http://localhost:5555)
npm run db:reset          # reset complet + migrations + seed
```

### Tests

```bash
npm run test                    # Vitest (watch)
npm run test:integration        # tests d'intégration uniquement
npm run test:coverage           # couverture
npm run test:e2e                # Playwright
npm run test:e2e:ui             # Playwright en mode UI
```

### Sécurité et logs

```bash
npm run security:audit          # audit (scripts/security-audit.ts)
npm run test:logs               # test du logger Winston
npm run logs:clear              # vider logs/*.log
```

---

## Documentation

### Documents projet (`docs/`)

| Document | Description |
|---|---|
| [`DOCUMENT_CADRAGE.md`](./docs/DOCUMENT_CADRAGE.md) | Document de cadrage complet (besoin, périmètre, archi, outils, planning, risques) |
| [`DOCUMENT_CADRAGE.pdf`](./docs/DOCUMENT_CADRAGE.pdf) | Version PDF du document de cadrage |
| [`architecture-diagram.md`](./docs/architecture-diagram.md) | Diagramme d'architecture détaillé + tableau des flux |
| [`erd.md`](./docs/erd.md) | Diagramme entité-relation + décisions de modélisation |
| [`backlog.md`](./docs/backlog.md) | Backlog produit complet (8 epics, 61 user stories) |
| [`DCT.md`](./docs/DCT.md) | Dossier de Conception Technique |
| [`A11Y_AUDIT.md`](./docs/A11Y_AUDIT.md) | Audit accessibilité WCAG 2.1 AA |
| [`RESPONSIVE_AUDIT.md`](./docs/RESPONSIVE_AUDIT.md) | Audit responsive |
| [`security-report.md`](./docs/security-report.md) | Rapport audit sécurité |
| [`RAPPORT_SOUTENANCE_SAMY.md`](./docs/RAPPORT_SOUTENANCE_SAMY.md) | Rapport technique individuel — Auth & Infrastructure |
| [`INSTALLATION.md`](./docs/INSTALLATION.md) | Guide d'installation détaillé |
| [`CHANGELOG.md`](./CHANGELOG.md) | Historique des changements |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Conventions de contribution |

### Knowledge base interne (`.claude/knowledge/`)

| Fichier | Description |
|---|---|
| [`roadmap.md`](./.claude/knowledge/roadmap.md) | Roadmap par phase (Auth → Admin → Front → Checkout → …) |
| [`architecture.md`](./.claude/knowledge/architecture.md) | Décisions architecturales détaillées |
| [`api.md`](./.claude/knowledge/api.md) | Référence API exhaustive |
| [`deploy.md`](./.claude/knowledge/deploy.md) | Procédure de déploiement |
| [`incidents.md`](./.claude/knowledge/incidents.md) | Historique des bugs et fixes |

---

## Licence

MIT — voir [`LICENSE`](./LICENSE).

Copyright (c) 2026 — Samy Abdelmalek, Tristan Sanjuan, Rayan Menkar, Kelvin Chauvel.
