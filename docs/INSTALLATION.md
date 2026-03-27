# Guide d'installation - Althea Systems

## Prerequis

| Outil | Version minimale | Verification |
|-------|-----------------|--------------|
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| PostgreSQL | 16.x | `psql --version` |
| Redis | 7.x | `redis-cli --version` |
| Git | 2.x | `git --version` |

## Installation rapide (developpement)

### 1. Cloner le projet

```bash
git clone https://github.com/itsaam/althea-systems.git
cd althea-systems
```

### 2. Installer les dependances

```bash
nvm use           # Utilise Node.js 20 via .nvmrc
npm ci            # Installation deterministe
```

### 3. Configurer les variables d'environnement

Creer un fichier `.env` a la racine du projet :

```env
# Base de donnees PostgreSQL
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/althea_db"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="votre-secret-genere-avec-openssl-rand-base64-32"

# OAuth Google (optionnel en dev)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# OAuth GitHub (optionnel en dev)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Emails (Resend)
RESEND_API_KEY="re_..."
RESEND_FROM_EMAIL="onboarding@resend.dev"

# Cloudflare R2 (stockage images)
R2_ACCOUNT_ID=""
R2_ACCESS_KEY_ID=""
R2_SECRET_ACCESS_KEY=""
R2_BUCKET_NAME="althea-images"
R2_PUBLIC_URL="https://pub-578e3fbcadaa433fb571ec293b300e3c.r2.dev"

# Application
NEXT_PUBLIC_APP_NAME="Althea Systems"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Initialiser la base de donnees

```bash
# Generer le client Prisma
npx prisma generate

# Appliquer les migrations
npx prisma migrate dev

# Peupler avec les donnees de test
npm run db:seed
```

Le seed cree :
- Un compte admin : `admin@althea.com` / `Admin123!` (2FA active)
- Des comptes utilisateurs B2B de test
- Des categories de materiel medical
- Des produits avec images

### 5. Lancer le serveur de developpement

```bash
npm run dev
```

L'application est accessible sur `http://localhost:3000`.

## Installation avec Docker

### 1. Lancer l'infrastructure complete

```bash
cd docker
docker compose up -d
```

Services demarres :
| Service | Port | Description |
|---------|------|-------------|
| `althea-app` | 3000 | Application Next.js |
| `althea-postgres` | 5432 | PostgreSQL 16 Alpine |
| `althea-redis` | 6379 | Redis 7 Alpine (AOF, 256MB) |

### 2. Avec les outils de developpement

```bash
docker compose --profile dev up -d
```

Services supplementaires :
| Service | Port | Description |
|---------|------|-------------|
| `althea-adminer` | 8080 | Interface BDD |
| `althea-redis-commander` | 8081 | Interface Redis |

## Commandes disponibles

### Developpement

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de dev Next.js (hot reload) |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build de production |
| `npm run lint` | Linter ESLint |

### Base de donnees

| Commande | Description |
|----------|-------------|
| `npm run db:migrate` | Appliquer les migrations Prisma |
| `npm run db:push` | Push schema sans migration |
| `npm run db:seed` | Peupler la BDD avec les donnees de test |
| `npm run db:studio` | Interface Prisma Studio (port 5555) |
| `npm run db:reset` | Reset complet + re-seed |

### Tests

| Commande | Description |
|----------|-------------|
| `npm run test` | Lancer les tests Vitest |
| `npm run test:ui` | Interface UI Vitest |
| `npm run test:watch` | Mode watch |
| `npm run test:coverage` | Rapport de couverture |

### Logs

| Commande | Description |
|----------|-------------|
| `npm run test:logs` | Tester la configuration des logs |
| `npm run logs:clear` | Supprimer les fichiers de logs |

## Verification de l'installation

1. Acceder a `http://localhost:3000` -- page d'accueil
2. Se connecter avec `admin@althea.com` / `Admin123!`
3. Configurer le 2FA (obligatoire pour l'admin)
4. Acceder au dashboard admin : `http://localhost:3000/admin`

## Resolution des problemes courants

### Erreur Prisma "Cannot find module"
```bash
npx prisma generate
```

### Erreur Redis connection refused
Verifier que Redis est lance :
```bash
redis-cli ping    # Doit repondre PONG
```

### Erreur PostgreSQL authentication
Verifier les identifiants dans `DATABASE_URL` et que la base existe :
```bash
psql -U postgres -c "CREATE DATABASE althea_db;"
```

### Port 3000 deja utilise
```bash
npx kill-port 3000
npm run dev
```
