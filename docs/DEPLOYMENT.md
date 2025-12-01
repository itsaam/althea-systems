# Guide de Déploiement - Althea Systems

Ce guide détaille les étapes pour déployer Althea Systems en production.

## 📋 Prérequis

- Serveur Linux (Ubuntu 22.04 recommandé)
- Docker et Docker Compose
- Nom de domaine configuré
- Certificat SSL (Let's Encrypt recommandé)
- Comptes pour les services tiers :
  - Stripe
  - OAuth providers (Google, GitHub, Apple)
  - Service email (SendGrid, Mailgun, etc.)

## 🚀 Option 1 : Déploiement Docker (Recommandé)

### 1. Préparer le serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Installer Docker Compose
sudo apt install docker-compose-plugin -y

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER
```

### 2. Cloner le projet

```bash
git clone https://github.com/itsaam/althea-systems.git
cd althea-systems
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
nano .env
```

**Variables importantes pour la production :**

```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://votre-domaine.com

# Générer un secret sécurisé
NEXTAUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL=https://votre-domaine.com

# Base de données (utiliser des mots de passe forts)
DATABASE_URL=postgresql://user:PASSWORD@postgres:5432/althea_db

# Redis
REDIS_URL=redis://redis:6379

# Email (production)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your_sendgrid_api_key
SMTP_FROM=noreply@votre-domaine.com

# Stripe (clés live)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 4. Créer le fichier docker-compose.prod.yml

```yaml
services:
  app:
    build:
      context: .
      dockerfile: docker/Dockerfile
    container_name: althea-app
    restart: always
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    networks:
      - althea-network

  postgres:
    image: postgres:16-alpine
    container_name: althea-postgres
    restart: always
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: althea_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - althea-network

  redis:
    image: redis:7-alpine
    container_name: althea-redis
    restart: always
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - althea-network

  nginx:
    image: nginx:alpine
    container_name: althea-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - app
    networks:
      - althea-network

  certbot:
    image: certbot/certbot
    container_name: althea-certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"

volumes:
  postgres_data:
  redis_data:

networks:
  althea-network:
    driver: bridge
```

### 5. Configurer Nginx

Créer `nginx.conf` :

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name votre-domaine.com;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://$host$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name votre-domaine.com;

        ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Cache static files
        location /_next/static {
            proxy_pass http://app;
            proxy_cache_valid 60m;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        location /images {
            proxy_pass http://app;
            proxy_cache_valid 60m;
            add_header Cache-Control "public, max-age=86400";
        }
    }
}
```

### 6. Obtenir le certificat SSL

```bash
# Démarrer nginx temporairement
docker compose -f docker-compose.prod.yml up -d nginx

# Obtenir le certificat
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d votre-domaine.com

# Redémarrer nginx avec SSL
docker compose -f docker-compose.prod.yml restart nginx
```

### 7. Déployer

```bash
# Build et démarrer
docker compose -f docker-compose.prod.yml up -d --build

# Appliquer les migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Vérifier les logs
docker compose -f docker-compose.prod.yml logs -f
```

---

## 🌐 Option 2 : Déploiement Vercel

### 1. Préparer le projet

```bash
# Installer Vercel CLI
npm i -g vercel

# Login
vercel login
```

### 2. Configurer les services externes

Vous aurez besoin de :

- **PostgreSQL** : Vercel Postgres, Supabase, ou Railway
- **Redis** : Upstash Redis
- **MongoDB** : MongoDB Atlas

### 3. Configurer les variables d'environnement sur Vercel

Dans le dashboard Vercel :

1. Aller dans Settings > Environment Variables
2. Ajouter toutes les variables de `.env.example`

### 4. Déployer

```bash
vercel --prod
```

---

## 🔧 Configuration Post-Déploiement

### 1. Configurer Stripe Webhooks

1. Aller sur [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Ajouter un endpoint : `https://votre-domaine.com/api/stripe/webhook`
3. Sélectionner les événements :
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
4. Copier le Webhook Secret dans `.env`

### 2. Configurer OAuth

#### Google

1. [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services > Credentials
3. Ajouter URI de redirection : `https://votre-domaine.com/api/auth/callback/google`

#### GitHub

1. [GitHub Developer Settings](https://github.com/settings/developers)
2. OAuth Apps > New OAuth App
3. Callback URL : `https://votre-domaine.com/api/auth/callback/github`

### 3. Configurer les emails

Pour la production, utilisez un service comme :

- SendGrid
- Mailgun
- Amazon SES
- Postmark

Exemple avec SendGrid :

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxx
```

---

## 📊 Monitoring

### Logs

```bash
# Voir les logs en temps réel
docker compose -f docker-compose.prod.yml logs -f app

# Logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Healthcheck

L'application expose un endpoint de santé :

```
GET /api/health
```

### Recommandations

- Utilisez un service de monitoring (Datadog, New Relic, Sentry)
- Configurez des alertes pour les erreurs 5xx
- Surveillez l'utilisation Redis/PostgreSQL

---

## 🔄 Mises à jour

### Déployer une mise à jour

```bash
# Pull les changements
git pull origin main

# Rebuild et redéployer
docker compose -f docker-compose.prod.yml up -d --build

# Appliquer les nouvelles migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### Rollback

```bash
# Revenir à une version précédente
git checkout <commit-hash>
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 Sécurité

### Checklist

- [ ] Variables d'environnement sécurisées (pas dans le code)
- [ ] HTTPS activé
- [ ] Mots de passe forts pour les bases de données
- [ ] Rate limiting activé
- [ ] Headers de sécurité configurés (CSP, HSTS, etc.)
- [ ] Backups automatiques des bases de données
- [ ] Mises à jour régulières des dépendances
- [ ] 2FA activé pour les admins

### Backups

```bash
# Backup PostgreSQL
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U althea althea_db > backup_$(date +%Y%m%d).sql

# Restore
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U althea althea_db < backup_20240101.sql
```

---

## 🆘 Troubleshooting

### L'application ne démarre pas

```bash
# Vérifier les logs
docker compose -f docker-compose.prod.yml logs app

# Vérifier les variables d'environnement
docker compose -f docker-compose.prod.yml exec app env

# Reconstruire l'image
docker compose -f docker-compose.prod.yml build --no-cache app
```

### Problèmes de base de données

```bash
# Vérifier la connexion
docker compose -f docker-compose.prod.yml exec postgres pg_isready

# Vérifier les migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate status
```

### Problèmes de mémoire

```bash
# Vérifier l'utilisation
docker stats

# Augmenter les limites dans docker-compose.yml
services:
  app:
    deploy:
      resources:
        limits:
          memory: 1G
```
