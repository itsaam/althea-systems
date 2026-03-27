# Infrastructure Docker - Althea Systems

Documentation complète de l'infrastructure Docker pour la plateforme e-commerce B2B Althea Systems.

## Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Prérequis](#prérequis)
- [Architecture des services](#architecture-des-services)
- [Commandes principales](#commandes-principales)
- [URLs des services](#urls-des-services)
- [Healthchecks](#healthchecks)
- [Variables d'environnement](#variables-denvironnement)
- [Troubleshooting](#troubleshooting)

---

## Vue d'ensemble

L'infrastructure Docker d'Althea Systems est composée de plusieurs services conteneurisés :

### Services de production
- **PostgreSQL 16** : Base de données relationnelle principale
- **Redis 7** : Cache en mémoire et gestion de sessions
- **App Next.js** : Application web frontend/backend

### Outils de développement (profil `dev`)
- **Adminer** : Interface web pour gérer PostgreSQL
- **Redis Commander** : Interface web pour gérer Redis

> **Note** : Les emails sont envoyés via Resend directement. Il n'y a pas de simulateur SMTP local.

Tous les services sont orchestrés via Docker Compose et communiquent sur un réseau privé `althea-network`.

---

## Prérequis

- **Docker** : version 24.0+ recommandée
- **Docker Compose** : version 2.20+ (inclus avec Docker Desktop)
- **Ports disponibles** : 3000, 5432, 6379, 8080, 8081

### Vérifier l'installation

```bash
docker --version
docker compose version
```

---

## Architecture des services

### PostgreSQL

**Image** : `postgres:16-alpine`  
**Container** : `althea-postgres`  
**Port** : `5432:5432`

**Configuration** :
- Utilisateur : `althea`
- Mot de passe : `Kx9mP2vL8nQwR4tY`
- Base de données : `althea_db`
- Volume persistant : `postgres_data` → `/var/lib/postgresql/data`
- Scripts d'initialisation : `./init-scripts/postgres` → `/docker-entrypoint-initdb.d`

**Healthcheck** : `pg_isready` vérifie la disponibilité toutes les 10s.

---

### Redis

**Image** : `redis:7-alpine`  
**Container** : `althea-redis`  
**Port** : `6379:6379`

**Configuration** :
- Mode AOF (Append Only File) activé pour la persistance
- Max mémoire : `256mb`
- Politique d'éviction : `allkeys-lru` (Least Recently Used)
- Volume persistant : `redis_data` → `/data`

**Healthcheck** : `redis-cli ping` vérifie la disponibilité toutes les 10s.

---

### App Next.js

**Image** : Construite depuis `../Dockerfile`  
**Container** : `althea-app`  
**Port** : `3000:3000`

**Configuration** :
- Node.js en mode production (`NODE_ENV=production`)
- Dépend de PostgreSQL et Redis (via healthchecks)
- Connexion interne aux services via le réseau Docker
- Redémarrage automatique : `unless-stopped`

---

### Adminer (dev uniquement)

**Image** : `adminer:latest`  
**Container** : `althea-adminer`  
**Port** : `8080:8080`  
**Profil** : `dev`

Interface web pour administrer PostgreSQL (créer tables, requêtes SQL, etc.).

---

### Redis Commander (dev uniquement)

**Image** : `rediscommander/redis-commander:latest`  
**Container** : `althea-redis-commander`  
**Port** : `8081:8081`  
**Profil** : `dev`

Interface web pour explorer et manipuler les clés Redis.

---

## Commandes principales

### Démarrer les services

```bash
# Services de production uniquement (app, postgres, redis)
docker-compose up -d

# Avec les outils de développement (adminer, redis-commander)
docker-compose --profile dev up -d
```

### Arrêter les services

```bash
# Arrêter sans supprimer les conteneurs
docker-compose stop

# Arrêter et supprimer les conteneurs
docker-compose down

# Arrêter et supprimer conteneurs + volumes (⚠️ perte de données)
docker-compose down -v
```

### Consulter les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis

# Dernières 100 lignes
docker-compose logs --tail=100 app
```

### Rebuild et redémarrage

```bash
# Rebuild l'image de l'app
docker-compose build app

# Rebuild et redémarrer
docker-compose up -d --build app

# Redémarrer un service spécifique
docker-compose restart redis
```

### Exécuter des commandes dans un conteneur

```bash
# Shell interactif dans l'app
docker-compose exec app sh

# Commande Prisma dans l'app
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed

# Shell PostgreSQL
docker-compose exec postgres psql -U althea -d althea_db

# CLI Redis
docker-compose exec redis redis-cli
```

### Inspecter l'état des services

```bash
# Statut des conteneurs
docker-compose ps

# Informations détaillées
docker-compose ps -a

# Utilisation des ressources
docker stats
```

---

## URLs des services

Une fois les services démarrés, accédez aux interfaces suivantes :

| Service | URL | Description |
|---------|-----|-------------|
| **App Next.js** | http://localhost:3000 | Application principale |
| **Adminer** | http://localhost:8080 | Interface PostgreSQL (dev) |
| **Redis Commander** | http://localhost:8081 | Interface Redis (dev) |

### Connexion Adminer

- **Système** : PostgreSQL
- **Serveur** : `postgres` (ou `localhost` depuis l'hôte)
- **Utilisateur** : `althea`
- **Mot de passe** : `Kx9mP2vL8nQwR4tY`
- **Base de données** : `althea_db`

---

## Healthchecks

Les services PostgreSQL et Redis intègrent des healthchecks pour garantir leur disponibilité avant le démarrage de l'app.

### Vérifier manuellement les healthchecks

```bash
# Statut détaillé (colonne "Status" affiche "healthy")
docker-compose ps

# Inspecter le healthcheck d'un service
docker inspect --format='{{json .State.Health}}' althea-postgres
docker inspect --format='{{json .State.Health}}' althea-redis
```

### Tester la connexion PostgreSQL

```bash
docker-compose exec postgres pg_isready -U althea -d althea_db
# Résultat attendu : "postgres:5432 - accepting connections"
```

### Tester la connexion Redis

```bash
docker-compose exec redis redis-cli ping
# Résultat attendu : "PONG"
```

---

## Variables d'environnement

### Variables dans `docker-compose.yml`

Les credentials de production sont définis directement dans le fichier Docker Compose :

```yaml
# PostgreSQL
POSTGRES_USER: althea
POSTGRES_PASSWORD: Kx9mP2vL8nQwR4tY
POSTGRES_DB: althea_db

# App
DATABASE_URL: postgresql://althea:Kx9mP2vL8nQwR4tY@postgres:5432/althea_db
REDIS_URL: redis://redis:6379
NODE_ENV: production
```

### Variables locales (développement)

Pour le développement en local (sans Docker), créez un fichier `.env.local` à la racine du projet :

```bash
DATABASE_URL="postgresql://althea:Kx9mP2vL8nQwR4tY@localhost:5432/althea_db?schema=public"
REDIS_URL="redis://localhost:6379"
NEXTAUTH_SECRET="votre-secret-nextauth"
NEXTAUTH_URL="http://localhost:3000"
# ... autres variables (voir .env.example)
```

**⚠️ Important** : Ne jamais commiter les fichiers `.env.local` ou `.env` contenant des secrets réels.

---

## Troubleshooting

### Port déjà utilisé

**Erreur** :
```
Error starting userland proxy: listen tcp 0.0.0.0:5432: bind: address already in use
```

**Solution** :
```bash
# Identifier le processus utilisant le port
lsof -i :5432  # ou :3000, :6379, etc.

# Arrêter le service local (exemple PostgreSQL)
brew services stop postgresql@16

# Ou modifier le port dans docker-compose.yml
ports:
  - "5433:5432"  # PostgreSQL sur port 5433 côté hôte
```

---

### Volumes corrompus

**Symptômes** : Erreurs de connexion, données manquantes, comportement erratique.

**Solution** :
```bash
# ⚠️ Attention : supprime toutes les données
docker-compose down -v

# Recréer les volumes et redémarrer
docker-compose up -d

# Réappliquer les migrations
docker-compose exec app npx prisma migrate deploy
docker-compose exec app npx prisma db seed
```

---

### Problèmes de permissions

**Erreur** :
```
permission denied while trying to connect to the Docker daemon socket
```

**Solution (Linux/macOS)** :
```bash
# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Se reconnecter ou redémarrer la session
```

**Solution (macOS avec Docker Desktop)** :
- Vérifier que Docker Desktop est lancé
- Redémarrer Docker Desktop

---

### Les migrations Prisma échouent

**Erreur** :
```
Can't reach database server at `postgres:5432`
```

**Solution** :
```bash
# Vérifier que PostgreSQL est healthy
docker-compose ps

# Vérifier les logs de PostgreSQL
docker-compose logs postgres

# Attendre que le healthcheck soit "healthy" puis réessayer
docker-compose exec app npx prisma migrate deploy
```

---

### Redis perd les données au redémarrage

**Cause** : Volume non persisté ou AOF désactivé.

**Solution** :
```bash
# Vérifier que le volume redis_data existe
docker volume ls | grep redis

# Vérifier la configuration AOF
docker-compose exec redis redis-cli CONFIG GET appendonly
# Devrait retourner : "yes"

# Si AOF est à "no", vérifier la commande dans docker-compose.yml
command: redis-server --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
```

---

### L'app ne démarre pas (dépendances)

**Erreur** :
```
app exited with code 1
```

**Solution** :
```bash
# Vérifier les logs de l'app
docker-compose logs app

# Rebuild l'image si package.json a changé
docker-compose build --no-cache app
docker-compose up -d app

# Vérifier que les migrations sont appliquées
docker-compose exec app npx prisma migrate deploy
```

---

### Nettoyer complètement Docker

**En cas de problèmes persistants** :

```bash
# Arrêter tous les conteneurs Althea
docker-compose down -v

# Supprimer les images Althea
docker images | grep althea | awk '{print $3}' | xargs docker rmi

# Nettoyer les ressources inutilisées
docker system prune -a --volumes

# Redémarrer Docker Desktop (macOS/Windows)
```

---

## Ressources supplémentaires

- [Documentation Docker](https://docs.docker.com/)
- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation PostgreSQL](https://www.postgresql.org/docs/16/)
- [Documentation Redis](https://redis.io/documentation)
- [Documentation Prisma](https://www.prisma.io/docs)

---

**Althea Systems** - Infrastructure Docker v1.0  
Dernière mise à jour : Janvier 2026
