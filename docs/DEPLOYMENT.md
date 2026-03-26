# Guide de deploiement - Althea Systems

## Plateformes supportees

| Plateforme | Type | Recommandation |
|------------|------|----------------|
| Vercel | PaaS | Production recommandee |
| Docker | Self-hosted | Serveur dedie / VPS |
| Dokploy | Self-hosted | Alternative Docker simplifiee |

## Deploiement Vercel (recommande)

### 1. Configuration initiale

```bash
# Installer Vercel CLI
npm i -g vercel

# Lier le projet
vercel link
```

### 2. Variables d'environnement

Configurer dans le dashboard Vercel (Settings > Environment Variables) :

**Obligatoires :**
```
DATABASE_URL=postgresql://...         # Neon ou Supabase
REDIS_URL=redis://...                 # Upstash
NEXTAUTH_URL=https://votre-domaine.com
NEXTAUTH_SECRET=...                   # openssl rand -base64 32
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=no-reply@votre-domaine.com
```

**Cloudflare R2 :**
```
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=althea-images
R2_PUBLIC_URL=https://...r2.dev
```

**OAuth (optionnel) :**
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
```

### 3. Configuration build

Le fichier `next.config.ts` est deja configure avec `output: "standalone"` pour des builds optimises.

Le script `build` dans `package.json` execute `prisma generate && next build`.

### 4. Deployer

```bash
# Preview
vercel

# Production
vercel --prod
```

Ou via push sur la branche `main` (deploy automatique si connecte a GitHub).

### 5. Post-deploiement

```bash
# Appliquer les migrations en production
npx prisma migrate deploy
```

## Deploiement Docker

### 1. Build de l'image

```bash
docker build -f docker/Dockerfile -t althea-systems .
```

L'image utilise un build multi-stage :
- **deps** : Installation des dependances (`npm ci`)
- **builder** : Generation Prisma + build Next.js
- **runner** : Image minimale Alpine avec output standalone

### 2. Lancer avec Docker Compose

```bash
cd docker
docker compose up -d
```

Services :
- `althea-app` : port 3000
- `althea-postgres` : port 5432
- `althea-redis` : port 6379

### 3. Appliquer les migrations

```bash
docker exec althea-app npx prisma migrate deploy
docker exec althea-app npm run db:seed  # Premiere installation uniquement
```

## Base de donnees production

### Option 1 : Neon (recommande)

1. Creer un projet sur [neon.tech](https://neon.tech)
2. Copier la connection string
3. Configurer `DATABASE_URL` avec le parametre `?sslmode=require`

Avantages : serverless, autoscaling, branching, gratuit jusqu'a 0.5GB.

### Option 2 : Supabase

1. Creer un projet sur [supabase.com](https://supabase.com)
2. Aller dans Settings > Database > Connection string
3. Utiliser le mode "Transaction" pour les serverless functions

### Migrations

```bash
# Generer une migration
npx prisma migrate dev --name description_changement

# Appliquer en production (pas de prompt interactif)
npx prisma migrate deploy
```

## Redis production

### Upstash (recommande pour Vercel)

1. Creer une base sur [upstash.com](https://upstash.com)
2. Copier l'URL Redis (format `rediss://...`)
3. Configurer `REDIS_URL`

Avantages : serverless, pay-per-request, compatible TLS.

### Redis Cloud

1. Creer une instance sur [redis.io/cloud](https://redis.io/cloud)
2. Configurer le endpoint et le mot de passe

## SSL / TLS

### Vercel
SSL automatique avec certificat Let's Encrypt. Rien a configurer.

### Docker (auto-heberge)
Utiliser un reverse proxy (Nginx, Caddy, Traefik) avec Let's Encrypt :

```nginx
server {
    listen 443 ssl;
    server_name votre-domaine.com;

    ssl_certificate /etc/letsencrypt/live/votre-domaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votre-domaine.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## DNS

1. Ajouter un enregistrement A ou CNAME vers votre hebergeur
2. Si Vercel : ajouter le domaine dans Project Settings > Domains
3. Attendre la propagation DNS (jusqu'a 48h)

## Monitoring

### UptimeRobot (gratuit)
1. Creer un moniteur HTTP(S) vers `https://votre-domaine.com`
2. Intervalle de verification : 5 minutes
3. Configurer les alertes email/SMS

### Vercel Analytics
Active par defaut. Dashboard disponible dans le projet Vercel.

### Logs
- **Vercel** : onglet Logs dans le dashboard (temps reel)
- **Docker** : `docker logs -f althea-app`
- **Winston** : fichiers dans `logs/combined.log` et `logs/error.log`

## Backups BDD

### Neon
Backups automatiques inclus (point-in-time recovery jusqu'a 7 jours sur le plan gratuit).

### Supabase
Backups automatiques quotidiens (7 jours de retention sur le plan gratuit).

### Docker (auto-heberge)
Script de backup automatique :

```bash
#!/bin/bash
# backup-db.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
docker exec althea-postgres pg_dump -U althea althea_db | gzip > "$BACKUP_DIR/althea_$DATE.sql.gz"
# Garder les 30 derniers backups
ls -t $BACKUP_DIR/althea_*.sql.gz | tail -n +31 | xargs rm -f
```

Ajouter en crontab :
```
0 2 * * * /path/to/backup-db.sh
```

## Rollback

### Vercel
1. Aller dans Deployments
2. Trouver le deploiement stable precedent
3. Cliquer "Promote to Production"

### Docker
```bash
# Lister les images disponibles
docker images althea-systems

# Revenir a une version precedente
docker compose down
docker tag althea-systems:previous althea-systems:latest
docker compose up -d
```

### Base de donnees
```bash
# Voir l'historique des migrations
npx prisma migrate status

# En cas de probleme, restaurer un backup
gunzip < backup_file.sql.gz | docker exec -i althea-postgres psql -U althea althea_db
```

## Checklist pre-deploiement

- [ ] Variables d'environnement configurees
- [ ] `NEXTAUTH_SECRET` genere de maniere securisee
- [ ] `NEXTAUTH_URL` pointe vers le bon domaine
- [ ] Stripe en mode live (pas test)
- [ ] Webhook Stripe configure avec l'URL de production
- [ ] Domaine email configure dans Resend
- [ ] Bucket R2 cree et accessible
- [ ] Migrations appliquees
- [ ] Seed admin execute (premiere installation)
- [ ] SSL/TLS actif
- [ ] Monitoring configure
- [ ] Backups BDD actifs
