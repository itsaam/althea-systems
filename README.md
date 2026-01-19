<div align="center">

# 🏥 Althea Systems

**Plateforme e-commerce B2B professionnelle pour équipements médicaux**

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/althea-systems)
[![Version](https://img.shields.io/badge/version-0.1.0-blue)](package.json)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6-2D3748)](https://www.prisma.io)

</div>

---

## 📋 Table des Matières

- [✨ Fonctionnalités](#-fonctionnalités)
- [🚀 Quick Start](#-quick-start)
- [🛠️ Stack Technique](#️-stack-technique)
- [📁 Architecture](#-architecture)
- [⚙️ Configuration](#️-configuration)
- [🗄️ Base de Données](#️-base-de-données)
- [🔐 Authentification](#-authentification)
- [🎨 State Management](#-state-management)
- [📝 Logging](#-logging)
- [🔌 API](#-api)
- [🐳 Docker](#-docker)
- [🚢 Déploiement](#-déploiement)
- [📜 Scripts](#-scripts)
- [📚 Documentation](#-documentation)
- [📄 Licence](#-licence)

---

## ✨ Fonctionnalités

### 🛒 Commerce B2B
- Catalogue produits avec gestion stock temps réel
- Panier intelligent avec persistance locale (Zustand)
- Système de commandes et facturation automatisée
- TVA multiple (5.5%, 10%, 20%) selon catégories
- Gestion adresses de livraison et facturation

### 🔐 Authentification Avancée
- NextAuth avec JWT (durée 30 jours)
- Multi-providers : Email/Password, Google OAuth, GitHub OAuth
- 2FA obligatoire (TOTP) pour administrateurs
- Vérification email à l'inscription
- Protection routes par middleware

### 👨‍💼 Administration
- Dashboard admin protégé par 2FA
- Gestion complète produits, catégories, utilisateurs
- Suivi commandes et stocks en temps réel
- Upload images vers Cloudflare R2
- Logs centralisés avec Winston

### 🚀 Performance
- Cache Redis multi-niveaux
- React Server Components par défaut
- Image optimization Next.js
- Rate limiting API
- React 19 Compiler activé

---

## 🚀 Quick Start

```bash
# 1. Cloner et installer
git clone https://github.com/votre-username/althea-systems.git
cd althea-systems
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer les services Docker
cd docker && docker-compose --profile dev up -d && cd ..

# 4. Initialiser la base de données
npm run db:migrate
npm run db:seed

# 5. Lancer l'application
npm run dev
# → http://localhost:3000
```

**Comptes de test (après seed) :**
- Admin : `admin@althea.com` / `Admin123!` (2FA requis)
- Client : `client@althea.com` / `Client123!`

---

## 🛠️ Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 16.0.7 | Framework React avec App Router |
| **React** | 19.2.0 | Library UI avec React Compiler |
| **TypeScript** | 5.x | Typage statique strict |
| **Tailwind CSS** | 4.x | Styling utilitaire |
| **shadcn/ui** | Latest | Composants UI (style "new-york") |
| **Zustand** | 5.0.9 | State management (cart, UI, auth) |
| **React Hook Form** | 7.67.0 | Gestion formulaires |
| **Zod** | 4.1.13 | Validation schemas |
| **Lucide React** | Latest | Icônes |
| **Sonner** | 2.0.7 | Toast notifications |

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js API Routes** | 16.0.7 | API REST |
| **Prisma** | 6.19.0 | ORM base de données |
| **NextAuth.js** | 4.24.13 | Authentification (JWT + OAuth) |
| **Winston** | 3.18.3 | Logging structuré |
| **Redis (ioredis)** | 5.8.2 | Cache + sessions |
| **bcryptjs** | 3.x | Hashing passwords |
| **otplib** | 12.0.1 | 2FA (TOTP) |

### Bases de Données
| Service | Usage |
|---------|-------|
| **PostgreSQL** | Base principale (users, products, orders) |
| **Redis** | Cache, rate limiting, sessions 2FA |

### Services Externes
| Service | Usage |
|---------|-------|
| **Stripe** | Paiements |
| **Cloudflare R2** | Stockage images + CDN |
| **Resend** | Emails transactionnels |
| **Google OAuth** | Connexion Google |
| **GitHub OAuth** | Connexion GitHub |

### DevOps
| Outil | Usage |
|-------|-------|
| **Docker** | Containerisation |
| **Dokploy** | Déploiement production |
| **Nixpacks** | Build automatique |
| **GitHub Actions** | CI/CD |

---

## 📁 Architecture

### Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 🔐 Pages authentification
│   │   ├── login/         # Connexion (email, OAuth)
│   │   ├── register/      # Inscription + vérification email
│   │   └── verify-email/  # Page de vérification
│   ├── (site)/            # 🌐 Pages publiques (SSR/SSG)
│   │   ├── page.tsx       # Accueil
│   │   ├── products/      # Catalogue produits
│   │   ├── cart/          # Panier
│   │   └── checkout/      # Tunnel de commande
│   ├── (account)/         # 👤 Espace client (protégé)
│   │   ├── profile/       # Profil utilisateur
│   │   ├── orders/        # Historique commandes
│   │   └── addresses/     # Adresses de livraison
│   ├── admin/             # 🛡️ Back-office (ADMIN + 2FA)
│   │   ├── dashboard/     # Statistiques
│   │   ├── products/      # Gestion produits
│   │   ├── orders/        # Gestion commandes
│   │   └── users/         # Gestion utilisateurs
│   └── api/               # 🔌 API Routes REST
│       ├── auth/          # Authentification (register, 2FA)
│       ├── products/      # CRUD produits
│       ├── orders/        # Gestion commandes
│       └── profile/       # Profil utilisateur
│
├── components/
│   ├── ui/                # shadcn/ui (Button, Dialog, Input, etc.)
│   ├── admin/             # Composants admin (tables, stats)
│   ├── products/          # Composants produits (cards, filters)
│   ├── layout/            # Header, Footer, Sidebar
│   └── forms/             # Formulaires réutilisables
│
├── lib/
│   ├── auth.ts            # NextAuth config (providers, callbacks)
│   ├── prisma.ts          # Prisma client singleton
│   ├── redis.ts           # Redis client + helpers cache
│   ├── r2.ts              # Upload Cloudflare R2
│   ├── logger/            # Winston logger (api, auth, product, etc.)
│   │   ├── config.ts      # Configuration Winston
│   │   ├── messages.ts    # Messages logs centralisés
│   │   ├── api-wrapper.ts # HOC withApiLogger
│   │   └── exports.ts     # Export loggers par section
│   └── validators/        # Schemas Zod (product, user, order)
│
├── stores/                # Zustand state management
│   ├── cart-store.ts      # Panier (persist localStorage)
│   ├── ui-store.ts        # État UI (modals, sidebar)
│   └── auth-store.ts      # État auth côté client
│
├── hooks/                 # React hooks personnalisés
│   ├── use-auth.ts        # Hook authentification
│   ├── use-cart.ts        # Hook panier
│   ├── use-debounce.ts    # Debounce recherche
│   └── use-toast.ts       # Toast notifications
│
├── types/                 # Types TypeScript
│   ├── auth.d.ts          # Augmentation NextAuth
│   ├── product.ts         # Types produits
│   └── order.ts           # Types commandes
│
└── middleware.ts          # Protection routes + headers sécurité

prisma/
├── schema.prisma          # Schema Prisma (models, relations)
├── seed.ts                # Seed données de test
└── migrations/            # Migrations SQL

docker/
├── Dockerfile             # Build multi-stage Next.js
└── docker-compose.yml     # Services dev (PostgreSQL, Redis, Adminer, etc.)
```

### Diagramme d'Architecture

```mermaid
graph TB
    subgraph Client
        Browser[🌐 Navigateur]
    end

    subgraph Application
        NextJS[⚡ Next.js App Router]
        API[🔌 API Routes]
        Auth[🔐 NextAuth.js]
        Cache[💾 Redis Cache]
        Logger[📝 Winston Logger]
    end

    subgraph State["State Management"]
        Zustand[🗂️ Zustand Stores]
    end

    subgraph Databases
        PostgreSQL[(🐘 PostgreSQL)]
        Redis[(⚡ Redis)]
    end

    subgraph External["Services Externes"]
        Stripe[💳 Stripe]
        R2[🖼️ Cloudflare R2]
        OAuth[🔑 Google/GitHub OAuth]
        Resend[📧 Resend]
    end

    Browser --> NextJS
    NextJS --> Zustand
    NextJS --> API
    API --> Auth
    API --> Logger
    Auth --> PostgreSQL
    Auth --> Redis
    API --> Cache
    Cache --> Redis
    API --> PostgreSQL
    API --> Stripe
    API --> R2
    API --> Resend
    Auth --> OAuth
```

Pour les diagrammes complets (flux de données, ERD, séquences), voir [docs/DIAGRAMMES_TECHNIQUES.md](./docs/DIAGRAMMES_TECHNIQUES.md).

---

## ⚙️ Configuration

### Prérequis

- **Node.js** >= 20.0.0
- **npm** >= 10.x
- **Docker** + **Docker Compose**
- **PostgreSQL** 16+ (via Docker ou local)
- **Redis** 7+ (via Docker ou local)

### Installation Complète

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/althea-systems.git
cd althea-systems

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (voir ci-dessous)

# 4. Démarrer les services Docker
cd docker && docker-compose --profile dev up -d && cd ..

# 5. Générer le client Prisma
npx prisma generate

# 6. Initialiser la base de données
npm run db:migrate
npm run db:seed

# 7. Lancer le serveur de développement
npm run dev
```

### Variables d'Environnement

Créer un fichier `.env` à la racine :

```env
# 🗄️ Base de données
DATABASE_URL="postgresql://althea:password@localhost:5432/althea"
REDIS_URL="redis://localhost:6379"

# 🔐 NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-min-32-caracteres-genere-avec-openssl"

# 🔑 OAuth (optionnel)
GOOGLE_CLIENT_ID="votre-google-client-id"
GOOGLE_CLIENT_SECRET="votre-google-client-secret"
GITHUB_CLIENT_ID="votre-github-client-id"
GITHUB_CLIENT_SECRET="votre-github-client-secret"

# 💳 Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# 🖼️ Cloudflare R2 (S3-compatible)
R2_ACCESS_KEY_ID="votre-r2-access-key"
R2_SECRET_ACCESS_KEY="votre-r2-secret-key"
R2_BUCKET_NAME="althea-images"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
R2_ENDPOINT="https://xxxxx.r2.cloudflarestorage.com"

# 📧 Email (Resend)
RESEND_API_KEY="re_..."
```

**Générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

---

## 🗄️ Base de Données

### PostgreSQL

**Base principale** pour toutes les données métier :

| Entité | Description |
|--------|-------------|
| **Users** | Utilisateurs (ADMIN, CLIENT, GUEST) + status (ACTIVE, SUSPENDED, PENDING) |
| **Addresses** | Adresses livraison/facturation (n-n User) |
| **Products** | Produits (stock, prix HT, TVA, images) |
| **Categories** | Catégories produits (hiérarchie) |
| **Orders** | Commandes (statut, paiement, livraison) |
| **OrderItems** | Lignes de commande (product, quantity, price) |
| **Invoices** | Factures générées (PDF) |
| **Sessions** | Sessions NextAuth |
| **VerificationTokens** | Tokens email + 2FA |

**Enums Prisma :**
- `Role` : ADMIN, CLIENT, GUEST
- `UserStatus` : ACTIVE, SUSPENDED, PENDING
- `ProductStatus` : AVAILABLE, OUT_OF_STOCK, DISCONTINUED
- `OrderStatus` : PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
- `PaymentStatus` : PENDING, PAID, FAILED, REFUNDED
- `TvaRate` : TVA_5_5, TVA_10, TVA_20

### Redis

**Utilisation :**

| Cas d'usage | Pattern de clé | TTL |
|-------------|----------------|-----|
| Cache produit | `product:{id}` | 3600s |
| Cache catégorie | `category:{id}` | 7200s |
| Session 2FA | `2fa:pending:{userId}` | 300s |
| Rate limiting | `rate:{ip}:{route}` | 60s |
| Cache API | `cache:{route}:{params}` | Variable |

**Helpers disponibles :**
```typescript
import { getCache, setCache, deleteCache } from "@/lib/redis";

// Lecture cache
const product = await getCache<Product>(`product:${id}`);

// Écriture cache (TTL optionnel)
await setCache(`product:${id}`, product, 3600);

// Suppression cache
await deleteCache(`product:${id}`);
```

### Schéma ERD

Voir le diagramme complet : [docs/DIAGRAMMES_TECHNIQUES.md](./docs/DIAGRAMMES_TECHNIQUES.md#4-schema-de-la-base-de-donnees-erd)

---

## 🔐 Authentification

### Architecture NextAuth

**Configuration** : `src/lib/auth.ts`
- **Strategy** : JWT avec durée de 30 jours
- **Adapter** : Prisma Adapter pour persistance sessions
- **Callbacks** : Enrichissement JWT avec `role`, `status`, `twoFactorVerified`

### Providers Supportés

| Provider | Type | Description |
|----------|------|-------------|
| **Credentials** | Email/Password | Inscription + vérification email obligatoire |
| **Google** | OAuth 2.0 | Connexion via compte Google |
| **GitHub** | OAuth 2.0 | Connexion via compte GitHub |

### 2FA (Two-Factor Authentication)

**Obligatoire pour les administrateurs** avant d'accéder à `/admin/*`

**Flow :**
1. Connexion classique (email/OAuth)
2. Redirection `/admin` → vérification 2FA
3. Si non configuré : affichage QR code (TOTP)
4. Si configuré : demande du code 6 chiffres
5. Vérification via `otplib` + session Redis temporaire
6. Accès autorisé après validation

**Configuration** :
```typescript
import { authenticator } from "otplib";

// Génération secret
const secret = authenticator.generateSecret();

// Génération URI pour QR code
const otpauth = authenticator.keyuri(user.email, "Althea Systems", secret);

// Vérification code
const isValid = authenticator.verify({ token: code, secret });
```

### Protection des Routes

**Middleware** : `src/middleware.ts`

| Route | Protection |
|-------|------------|
| `/admin/*` | Role = ADMIN + 2FA vérifié |
| `/profile`, `/orders`, `/addresses` | Utilisateur connecté |
| `/login`, `/register` | Redirection si déjà connecté → `/` |

**Exemple vérification API :**
```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  
  // Traitement...
}
```

### Statuts Utilisateurs

| Status | Description |
|--------|-------------|
| `PENDING` | Email non vérifié (connexion bloquée) |
| `ACTIVE` | Compte actif |
| `SUSPENDED` | Compte suspendu (admin peut réactiver) |

---

## 🎨 State Management

### Zustand Stores

**Localisation** : `src/stores/`

Tous les stores utilisent la persistance `localStorage` pour conservation entre sessions.

#### Cart Store (`cart-store.ts`)

**Gestion du panier client**

```typescript
import { useCartStore } from "@/stores/cart-store";

const {
  items,           // CartItem[]
  addItem,         // (product: Product, quantity: number) => void
  removeItem,      // (productId: string) => void
  updateQuantity,  // (productId: string, quantity: number) => void
  clearCart,       // () => void
  totalItems,      // number
  totalPrice,      // number
} = useCartStore();
```

**Fonctionnalités :**
- Ajout/suppression produits
- Mise à jour quantités
- Calcul prix total (TTC avec TVA)
- Persistance localStorage
- Hydratation SSR-safe

#### UI Store (`ui-store.ts`)

**Gestion état interface**

```typescript
import { useUIStore } from "@/stores/ui-store";

const {
  sidebarOpen,        // boolean
  modalOpen,          // boolean
  toggleSidebar,      // () => void
  openModal,          // () => void
  closeModal,         // () => void
} = useUIStore();
```

#### Auth Store (`auth-store.ts`)

**État authentification côté client**

```typescript
import { useAuthStore } from "@/stores/auth-store";

const {
  user,               // User | null
  isAuthenticated,    // boolean
  setUser,            // (user: User) => void
  logout,             // () => void
} = useAuthStore();
```

**Note** : Synchronisé avec NextAuth session côté serveur.

### Hooks Personnalisés

**Localisation** : `src/hooks/`

| Hook | Usage |
|------|-------|
| `use-auth.ts` | Wrapper NextAuth `useSession` + helpers |
| `use-cart.ts` | Logique métier panier (validation stock, etc.) |
| `use-debounce.ts` | Debounce recherche/filtres (300ms) |
| `use-toast.ts` | Wrapper Sonner pour notifications |

**Exemple :**
```typescript
import { useAuth } from "@/hooks/use-auth";

function ProfilePage() {
  const { user, isLoading, isAdmin } = useAuth();
  
  if (isLoading) return <Spinner />;
  if (!user) redirect("/login");
  
  return <div>Bonjour {user.name}</div>;
}
```

---

## 📝 Logging

### Winston Logger

**Configuration** : `src/lib/logger/config.ts`

Logging structuré avec **Winston** :
- Fichiers : `logs/combined.log` (tous) + `logs/error.log` (erreurs uniquement)
- Format : JSON avec timestamp, niveau, message, metadata
- Rotation : Pas encore configurée (à venir)

### Loggers par Section

**Export** : `src/lib/logger/exports.ts`

```typescript
import {
  apiLogger,      // API Routes
  authLogger,     // Authentification
  productLogger,  // Produits
  orderLogger,    // Commandes
  dbLogger,       // Base de données
} from "@/lib/logger/exports";
```

### Messages Centralisés

**Localisation** : `src/lib/logger/messages.ts`

Tous les messages de logs sont centralisés dans `LogMessages` pour cohérence :

```typescript
import { apiLogger, LogMessages } from "@/lib/logger/exports";

// ✅ Bon
apiLogger.info(LogMessages.api.requeteRecue("GET", "/api/products"));
apiLogger.error(LogMessages.api.erreurServeur("Connection timeout"));

// ❌ Éviter
apiLogger.info("Requête GET reçue"); // Non standardisé
```

**Catégories disponibles :**
- `LogMessages.api.*` → API Routes
- `LogMessages.auth.*` → Authentification
- `LogMessages.product.*` → Produits
- `LogMessages.order.*` → Commandes
- `LogMessages.db.*` → Base de données

### Pattern API Routes

**HOC withApiLogger** : Wrapper automatique pour logging

```typescript
import { NextRequest } from "next/server";
import {
  withApiLogger,
  loggedSuccessResponse,
  loggedErrorResponse,
} from "@/lib/logger/exports";

export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const products = await prisma.product.findMany();
    return loggedSuccessResponse({ products });
  } catch (error) {
    return loggedErrorResponse("Erreur récupération produits", 500);
  }
});
```

**Avantages :**
- Logging automatique requête/réponse
- Mesure temps d'exécution
- Gestion erreurs standardisée
- Metadata enrichie (IP, user-agent, etc.)

### Commandes Logs

```bash
# Visualiser logs en temps réel
tail -f logs/combined.log

# Filtrer erreurs uniquement
tail -f logs/error.log

# Nettoyer les logs
npm run logs:clear

# Tester le logger
npm run test:logs
```

---

## 🔌 API

### Documentation Complète

📖 Voir [docs/API.md](./docs/API.md) pour la documentation exhaustive des endpoints.

### Endpoints Principaux

#### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/api/auth/register` | Inscription utilisateur + email vérification | Public |
| `POST` | `/api/auth/2fa/setup` | Configuration 2FA (TOTP) | User |
| `POST` | `/api/auth/2fa/verify` | Vérification code 2FA | User |
| `GET` | `/api/auth/verify-email?token=xxx` | Vérification email | Public |

#### Produits

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/products` | Liste produits (pagination, filtres) | Public |
| `GET` | `/api/products/[id]` | Détail produit | Public |
| `POST` | `/api/products` | Créer produit | Admin |
| `PUT` | `/api/products/[id]` | Modifier produit | Admin |
| `DELETE` | `/api/products/[id]` | Supprimer produit | Admin |

#### Commandes

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/orders` | Liste commandes (filtre user) | User |
| `GET` | `/api/orders/[id]` | Détail commande | User/Admin |
| `POST` | `/api/orders` | Créer commande | User |
| `PUT` | `/api/orders/[id]/status` | Modifier statut | Admin |

#### Profil

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/profile` | Profil utilisateur | User |
| `PUT` | `/api/profile` | Modifier profil | User |
| `GET` | `/api/profile/addresses` | Adresses utilisateur | User |
| `POST` | `/api/profile/addresses` | Ajouter adresse | User |

### Pattern API Routes

**Structure type** :

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { withApiLogger, loggedSuccessResponse, loggedErrorResponse } from "@/lib/logger/exports";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSchema } from "@/lib/validators/product";

// GET - Liste
export const GET = withApiLogger(async (req: NextRequest) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "AVAILABLE" },
    });
    return loggedSuccessResponse({ products });
  } catch (error) {
    return loggedErrorResponse("Erreur récupération produits", 500);
  }
});

// POST - Création (protégé ADMIN)
export const POST = withApiLogger(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }
  
  try {
    const body = await req.json();
    const validated = productSchema.parse(body);
    
    const product = await prisma.product.create({ data: validated });
    return loggedSuccessResponse({ product }, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return loggedErrorResponse("Erreur création produit", 500);
  }
});
```

### Validation Zod

**Localisation** : `src/lib/validators/`

Tous les inputs API sont validés avec **Zod** :

```typescript
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  price: z.number().positive("Prix invalide"),
  stock: z.number().int().nonnegative("Stock invalide"),
  categoryId: z.string().uuid("ID catégorie invalide"),
});

export type ProductInput = z.infer<typeof productSchema>;
```

### Gestion Erreurs

| Code | Description | Usage |
|------|-------------|-------|
| `400` | Bad Request | Validation Zod échouée |
| `401` | Unauthorized | Pas de session |
| `403` | Forbidden | Session OK mais rôle insuffisant |
| `404` | Not Found | Ressource introuvable |
| `429` | Too Many Requests | Rate limiting dépassé |
| `500` | Internal Server Error | Erreur serveur/BDD |

---

## 🐳 Docker

### Services Disponibles

**Localisation** : `docker/docker-compose.yml`

| Service | Port | Description | Profile |
|---------|------|-------------|---------|
| **postgres** | 5432 | PostgreSQL 16 | default |
| **redis** | 6379 | Redis 7 | default |
| **adminer** | 8080 | UI PostgreSQL | dev |
| **redis-commander** | 8081 | UI Redis | dev |
| **mailhog** | 8025 | SMTP test + UI | dev |

### Commandes Docker

```bash
# Démarrer services de base (PostgreSQL + Redis)
cd docker && docker-compose up -d

# Démarrer avec outils dev (+ Adminer, Redis Commander, MailHog)
cd docker && docker-compose --profile dev up -d

# Arrêter services
cd docker && docker-compose down

# Reset complet (⚠️ supprime volumes = perte données)
cd docker && docker-compose down -v

# Voir les logs
cd docker && docker-compose logs -f postgres
cd docker && docker-compose logs -f redis

# Rebuild image
cd docker && docker-compose build --no-cache
```

### Accès Interfaces Dev

| Interface | URL | Identifiants |
|-----------|-----|--------------|
| **Adminer** | http://localhost:8080 | Serveur: `postgres`<br>User: `althea`<br>Pass: `password`<br>DB: `althea` |
| **Redis Commander** | http://localhost:8081 | Aucun |
| **MailHog** | http://localhost:8025 | Aucun |

### Dockerfile Production

**Multi-stage build** pour optimisation :

```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
# ... installation dependencies

# Stage 2: Builder
FROM node:20-alpine AS builder
# ... build Next.js + Prisma

# Stage 3: Runner (image finale)
FROM node:20-alpine AS runner
# ... copie artifacts + démarrage
```

**Optimisations :**
- Utilisation `.dockerignore`
- Standalone output Next.js
- Layer caching optimal
- Image finale < 500MB

---

## 🚢 Déploiement

### Production (Dokploy + Nixpacks)

**Plateforme** : Dokploy (auto-hébergé)

**Pipeline CI/CD** :
1. Push branche `main`
2. GitHub Actions → Lint + TypeCheck + Build
3. Déclenchement Dokploy webhook
4. Build automatique via **Nixpacks**
5. Déploiement production avec zero-downtime

**Configuration** :
- Build : `npm run build` (génère `.next/standalone`)
- Databases : PostgreSQL + Redis hébergés sur Dokploy
- Variables d'environnement : Injectées via Dokploy dashboard
- SSL : Automatique via Let's Encrypt

### GitHub Actions CI

**Fichier** : `.github/workflows/ci.yml`

**Jobs** :
```yaml
1. Lint (ESLint)
2. TypeCheck (tsc --noEmit)
3. Prisma Validate (schema.prisma)
4. Build (npm run build)
```

**Trigger** : Push sur `main` + Pull Requests

### Variables Production

```env
# ⚠️ À configurer dans Dokploy
NODE_ENV=production
DATABASE_URL=postgresql://...        # URL production
REDIS_URL=redis://...                # Redis production
NEXTAUTH_URL=https://althea.com      # Domaine production
NEXTAUTH_SECRET=...                  # Secret 64+ chars
STRIPE_SECRET_KEY=sk_live_...        # Clés LIVE Stripe
R2_PUBLIC_URL=https://cdn.althea.com # CDN production
```

### Checklist Déploiement

- [ ] Variables d'environnement configurées
- [ ] Migrations Prisma appliquées
- [ ] Seed données initiales (si nouveau)
- [ ] Stripe webhooks configurés
- [ ] DNS configuré (A/CNAME records)
- [ ] SSL actif (Let's Encrypt)
- [ ] Monitoring configuré (Sentry/LogTail)
- [ ] Backup BDD automatisé

---

## 📜 Scripts

### Développement

```bash
npm run dev              # Serveur dev (http://localhost:3000)
npm run build            # Build production (prisma generate + next build)
npm run start            # Démarrer serveur production
npm run lint             # ESLint (auto-fix avec --fix)
npx tsc --noEmit         # Vérification TypeScript (pas dans package.json)
```

### Base de Données

```bash
npm run db:migrate       # Créer/appliquer migrations
npm run db:push          # Push schema sans migration (dev uniquement)
npm run db:seed          # Seed données de test
npm run db:studio        # Ouvrir Prisma Studio (GUI)
npm run db:reset         # Reset complet + migrations + seed
```

**Prisma Studio** : Interface graphique pour explorer/modifier la BDD
→ `http://localhost:5555`

### Logging

```bash
npm run test:logs        # Tester le logger Winston
npm run logs:clear       # Supprimer logs/*.log

# Visualisation temps réel
tail -f logs/combined.log
tail -f logs/error.log
```

### Utilitaires

```bash
npm install              # Installer dépendances + postinstall (prisma generate)
npm run postinstall      # Générer client Prisma (auto après install)

# Mise à jour dépendances
npx npm-check-updates -u # Mise à jour package.json
npm install              # Installer nouvelles versions
```

---

## 📚 Documentation

### Documents Techniques

| Document | Description |
|----------|-------------|
| **[API.md](./docs/API.md)** | Documentation complète des endpoints API REST |
| **[DIAGRAMMES_TECHNIQUES.md](./docs/DIAGRAMMES_TECHNIQUES.md)** | Architecture, flux, ERD, séquences |
| **[CAHIER_DES_CHARGES_SUIVI.md](./docs/CAHIER_DES_CHARGES_SUIVI.md)** | Suivi du cahier des charges + roadmap |
| **[RAPPORT_SOUTENANCE_SAMY.md](./docs/RAPPORT_SOUTENANCE_SAMY.md)** | Rapport technique Auth & Infrastructure |
| **[AGENTS.md](./AGENTS.md)** | Guide pour agents IA (conventions, patterns) |

### Standards de Code

**TypeScript** :
- Mode strict activé
- Éviter `any` → utiliser `unknown` + type guards
- Imports type-only : `import type { ... }`

**React** :
- Server Components par défaut (sauf hooks/events → `"use client"`)
- shadcn/ui pour composants UI (style "new-york")
- Nommage fichiers : kebab-case (`product-card.tsx`)

**API Routes** :
- Validation Zod obligatoire
- Logging avec `withApiLogger`
- Gestion erreurs standardisée
- Rate limiting sur routes sensibles

**Prisma** :
- Singleton client (`@/lib/prisma`)
- Transactions pour opérations multiples
- Cache Redis pour lectures fréquentes

---

## 📄 Licence

**MIT License**

Copyright (c) 2026 Althea Systems

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

---

<div align="center">

**Construit avec ❤️ par l'équipe Althea Systems**

[Documentation](./docs) • [API Reference](./docs/API.md) • [Contributing](./CONTRIBUTING.md)

</div>
