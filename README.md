# Althea Systems

Application e-commerce complète construite avec Next.js 16, TypeScript, Prisma, et intégration Stripe.

## 🚀 Stack Technique

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de données**: PostgreSQL (principal), MongoDB (logs/sessions), Redis (cache)
- **Authentification**: NextAuth.js avec OAuth (Google, GitHub, Apple) + Email/Password + 2FA Admin
- **Paiement**: Stripe
- **Email**: Nodemailer avec templates HTML
- **i18n**: next-intl (FR/EN/AR)

## 📁 Structure du Projet

```
althea-systems/
├── docker/                 # Configuration Docker
│   ├── docker-compose.yml  # Services (PostgreSQL, MongoDB, Redis)
│   └── Dockerfile          # Build de l'application
├── docs/                   # Documentation
│   ├── API.md              # Documentation API
│   └── DEPLOYMENT.md       # Guide de déploiement
├── prisma/
│   ├── schema.prisma       # Schéma de base de données
│   ├── migrations/         # Migrations
│   └── seed.ts             # Données initiales
├── public/                 # Assets statiques
├── src/
│   ├── app/                # App Router Next.js
│   │   ├── (auth)/         # Pages authentification
│   │   ├── (site)/         # Pages publiques
│   │   ├── (account)/      # Pages compte utilisateur
│   │   ├── admin/          # Pages administration
│   │   └── api/            # API Routes
│   ├── components/         # Composants React
│   │   ├── ui/             # Composants UI (shadcn/ui)
│   │   ├── layout/         # Header, Footer, Sidebars
│   │   ├── auth/           # Formulaires auth
│   │   └── ...
│   ├── hooks/              # Custom hooks
│   ├── i18n/               # Internationalisation
│   │   ├── config.ts       # Configuration
│   │   ├── locales/        # Fichiers de traduction (fr, en, ar)
│   │   └── ...
│   ├── lib/                # Utilitaires
│   │   ├── auth.ts         # Configuration NextAuth
│   │   ├── prisma.ts       # Client Prisma
│   │   ├── redis.ts        # Client Redis + cache
│   │   ├── email.ts        # Templates email
│   │   └── ...
│   ├── stores/             # Zustand stores
│   └── types/              # Types TypeScript
└── ...
```

## 🛠️ Installation

### Prérequis

- Node.js 20+
- Docker et Docker Compose
- npm ou pnpm

### 1. Cloner le projet

```bash
git clone https://github.com/itsaam/althea-systems.git
cd althea-systems
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

### 4. Démarrer les services Docker

```bash
# Services de base (PostgreSQL, MongoDB, Redis)
docker compose -f docker/docker-compose.yml up -d

# Avec outils de dev (Adminer, Redis Commander, MailHog)
docker compose -f docker/docker-compose.yml --profile dev up -d
```

### 5. Initialiser la base de données

```bash
npm run db:migrate
npm run db:seed
```

### 6. Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000)

## 🔐 Authentification

### Providers supportés

- **Email/Password**: Inscription avec vérification email
- **Google OAuth**: Connexion via Google
- **GitHub OAuth**: Connexion via GitHub
- **Apple OAuth**: Connexion via Apple

### 2FA pour les administrateurs

L'authentification à deux facteurs peut être activée pour les routes admin :

```env
ADMIN_2FA_REQUIRED=true
```

## 🌐 Internationalisation (i18n)

L'application supporte 3 langues :

- 🇫🇷 Français (par défaut)
- 🇬🇧 Anglais
- 🇸🇦 Arabe (RTL)

Les fichiers de traduction sont dans `src/i18n/locales/`.

## 🗄️ Base de données

### PostgreSQL (Principal)

Utilisé pour toutes les données métier :

- Utilisateurs, Adresses
- Produits, Catégories
- Commandes, Factures
- Sessions NextAuth

### MongoDB

Utilisé pour :

- Logs applicatifs
- Données non structurées

### Redis

Utilisé pour :

- Cache de recherche (<100ms)
- Sessions utilisateur
- Rate limiting
- Cache produits/catégories

## 📧 Emails

Templates HTML professionnels pour :

- Vérification d'email
- Réinitialisation de mot de passe
- Confirmation de commande
- Expédition de commande
- Bienvenue
- Code 2FA

En développement, utilisez MailHog pour tester :

- SMTP: `localhost:1025`
- Web UI: [http://localhost:8025](http://localhost:8025)

## 🐳 Docker

### Services disponibles

| Service         | Port  | Description                |
| --------------- | ----- | -------------------------- |
| PostgreSQL      | 5432  | Base de données principale |
| MongoDB         | 27017 | Base de données documents  |
| Redis           | 6379  | Cache et sessions          |
| Adminer         | 8080  | UI PostgreSQL (dev)        |
| Redis Commander | 8081  | UI Redis (dev)             |
| MailHog         | 8025  | UI Emails (dev)            |

### Commandes utiles

```bash
# Démarrer les services
docker compose -f docker/docker-compose.yml up -d

# Arrêter les services
docker compose -f docker/docker-compose.yml down

# Voir les logs
docker compose -f docker/docker-compose.yml logs -f

# Réinitialiser les données
docker compose -f docker/docker-compose.yml down -v
```

## 📜 Scripts

```bash
# Développement
npm run dev           # Serveur de développement

# Build
npm run build         # Build production
npm run start         # Démarrer en production

# Base de données
npm run db:migrate    # Appliquer les migrations
npm run db:push       # Push le schema (dev)
npm run db:seed       # Seed les données
npm run db:studio     # Ouvrir Prisma Studio
npm run db:reset      # Reset complet

# Qualité
npm run lint          # Linter ESLint

# Logs
npm run logs:clear    # Nettoyer les logs
```

## 🔒 Middleware & Protection des routes

Les routes sont protégées automatiquement :

- `/admin/*` → Requiert rôle ADMIN + 2FA (si activé)
- `/profile`, `/orders`, `/addresses`, `/payments` → Requiert authentification
- `/login`, `/register`, etc. → Redirige si déjà connecté

## 📚 Documentation

- [Documentation API](./docs/API.md)
- [Guide de déploiement](./docs/DEPLOYMENT.md)

## 📄 Licence

MIT
