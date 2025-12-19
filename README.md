# Althea Systems

Plateforme e-commerce B2B pour la vente de materiel medical, construite avec Next.js 16.

---

## Table of Contents

- [Stack Technique](#stack-technique)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Base de donnees](#base-de-donnees)
- [Authentification](#authentification)
- [API](#api)
- [Deploiement](#deploiement)
- [Documentation](#documentation)
- [Licence](#licence)

---

## Stack Technique

| Categorie | Technologies |
|-----------|--------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Base de donnees | PostgreSQL (principal), Redis (cache) |
| Authentification | NextAuth.js (OAuth Google/GitHub + Credentials + 2FA) |
| Paiement | Stripe |
| Stockage images | Cloudflare R2 (CDN) |
| Email | Resend |
| Containerisation | Docker, Docker Compose |
| Deploiement | Dokploy + Nixpacks |

---

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages authentification (login, register, etc.)
│   ├── (main)/            # Pages publiques (accueil, produits, etc.)
│   ├── admin/             # Back-office (protege ADMIN + 2FA)
│   └── api/               # API Routes
├── components/            # Composants React reutilisables
│   └── ui/               # Composants UI (shadcn/ui)
├── lib/                  # Utilitaires et configurations
│   ├── auth.ts          # Configuration NextAuth
│   ├── prisma.ts        # Client Prisma
│   ├── redis.ts         # Client Redis + helpers cache
│   └── r2.ts            # Upload Cloudflare R2
└── middleware.ts        # Protection des routes

prisma/
└── schema.prisma        # Schema base de donnees

docker/
├── Dockerfile           # Build multi-stage
└── docker-compose.yml   # Services dev local
```

### Diagramme d'Architecture

```mermaid
graph TB
    subgraph Client
        Browser[Navigateur]
    end

    subgraph Application
        NextJS[Next.js App]
        API[API Routes]
        Auth[NextAuth.js]
    end

    subgraph Databases
        PostgreSQL[(PostgreSQL)]
        Redis[(Redis)]
    end

    subgraph External
        Stripe[Stripe]
        R2[Cloudflare R2]
        OAuth[Google/GitHub OAuth]
    end

    Browser --> NextJS
    NextJS --> API
    API --> Auth
    Auth --> PostgreSQL
    Auth --> Redis
    API --> PostgreSQL
    API --> Redis
    API --> Stripe
    API --> R2
    Auth --> OAuth
```

Pour les diagrammes complets (flux de donnees, ERD, sequences), voir [docs/DIAGRAMMES_TECHNIQUES.md](./docs/DIAGRAMMES_TECHNIQUES.md).

---

## Installation

### Prerequisites

- Node.js 20+
- Docker et Docker Compose
- npm

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/althea-systems.git
cd althea-systems
```

### 2. Installer les dependances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Editer `.env` avec vos valeurs (voir [Configuration](#configuration)).

### 4. Demarrer les services Docker

```bash
# Services de base (PostgreSQL, Redis)
docker compose -f docker/docker-compose.yml up -d

# Avec outils de dev (Adminer, Redis Commander, MailHog)
docker compose -f docker/docker-compose.yml --profile dev up -d
```

### 5. Initialiser la base de donnees

```bash
npm run db:migrate
npm run db:seed
```

### 6. Lancer le serveur de developpement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

---

## Configuration

### Variables d'environnement requises

```env
# Base de donnees
DATABASE_URL="postgresql://user:password@localhost:5432/althea"
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-min-32-caracteres"

# OAuth (optionnel)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# Cloudflare R2
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME=""
R2_PUBLIC_URL=""

# Email (Resend)
RESEND_API_KEY=""
```

---

## Base de donnees

### PostgreSQL

Base de donnees principale pour toutes les donnees metier :
- Utilisateurs, Adresses
- Produits, Categories
- Commandes, Factures
- Sessions NextAuth

### Redis

Utilise pour :
- Cache applicatif
- Sessions 2FA temporaires
- Rate limiting

### Schema ERD

Voir le diagramme complet dans [docs/DIAGRAMMES_TECHNIQUES.md](./docs/DIAGRAMMES_TECHNIQUES.md#4-schema-de-la-base-de-donnees-erd).

---

## Authentification

### Providers supportes

| Provider | Description |
|----------|-------------|
| Credentials | Email/password avec verification email |
| Google OAuth | Connexion via compte Google |
| GitHub OAuth | Connexion via compte GitHub |

### 2FA pour les administrateurs

L'authentification a deux facteurs (TOTP) est obligatoire pour acceder au back-office `/admin`.

Configuration via application d'authentification (Google Authenticator, Authy, etc.).

### Protection des routes

| Route | Protection |
|-------|------------|
| `/admin/*` | Role ADMIN + 2FA verifie |
| `/profile`, `/orders`, `/addresses` | Utilisateur connecte |
| `/login`, `/register` | Redirection si deja connecte |

---

## API

Documentation complete des endpoints : [docs/API.md](./docs/API.md)

### Endpoints principaux

| Methode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/register` | Inscription |
| POST | `/api/auth/2fa/setup` | Configuration 2FA |
| GET | `/api/products` | Liste des produits |
| POST | `/api/orders` | Creer une commande |
| GET | `/api/profile` | Profil utilisateur |

---

## Deploiement

### Production (Dokploy + Nixpacks)

Le deploiement est automatise via Dokploy :
- Autodeploy sur push branche `main`
- Build automatique via Nixpacks
- Bases de donnees hebergees sur Dokploy

### Docker (local)

```bash
# Build et demarrer tous les services
docker compose -f docker/docker-compose.yml up -d

# Arreter les services
docker compose -f docker/docker-compose.yml down

# Reset complet (supprime les volumes)
docker compose -f docker/docker-compose.yml down -v
```

### Services Docker

| Service | Port | Description |
|---------|------|-------------|
| PostgreSQL | 5432 | Base de donnees principale |
| Redis | 6379 | Cache |
| Adminer | 8080 | UI PostgreSQL (dev) |
| Redis Commander | 8081 | UI Redis (dev) |
| MailHog | 8025 | UI Emails (dev) |

---

## Scripts

```bash
# Developpement
npm run dev              # Serveur de developpement

# Build
npm run build            # Build production
npm run start            # Demarrer en production

# Base de donnees
npm run db:migrate       # Appliquer les migrations
npm run db:push          # Push le schema (dev)
npm run db:seed          # Seed les donnees
npm run db:studio        # Ouvrir Prisma Studio
npm run db:reset         # Reset complet

# Qualite
npm run lint             # Linter ESLint
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [API.md](./docs/API.md) | Documentation des endpoints API |
| [DIAGRAMMES_TECHNIQUES.md](./docs/DIAGRAMMES_TECHNIQUES.md) | Diagrammes d'architecture, ERD, flux |
| [CAHIER_DES_CHARGES_SUIVI.md](./docs/CAHIER_DES_CHARGES_SUIVI.md) | Suivi du cahier des charges |
| [RAPPORT_SOUTENANCE_SAMY.md](./docs/RAPPORT_SOUTENANCE_SAMY.md) | Rapport technique Auth & Infra |

---

## Licence

MIT
