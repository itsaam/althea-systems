# Guide de Déploiement Production — Althea Systems

## 1. Architecture de Déploiement

```mermaid
graph TB
    subgraph "Cloudflare"
        DNS[DNS + CDN]
        R2[R2 Storage<br/>Images produits]
    end

    subgraph "Vercel"
        APP[Next.js App<br/>SSR + API Routes]
        EDGE[Edge Functions<br/>Middleware]
    end

    subgraph "Services managés"
        DB[(Neon PostgreSQL)]
        REDIS[(Upstash Redis)]
    end

    subgraph "Services tiers"
        STRIPE[Stripe<br/>Paiements]
        RESEND[Resend<br/>Emails]
    end

    DNS --> APP
    APP --> DB
    APP --> REDIS
    APP --> R2
    APP --> STRIPE
    APP --> RESEND
    EDGE --> APP
```

## 2. Configuration Vercel

### Import du projet
1. Aller sur [vercel.com](https://vercel.com)
2. "Import Project" → sélectionner le repo `itsaam/althea-systems`
3. Framework Preset : **Next.js** (détection automatique)
4. Root Directory : `.` (racine)
5. Build Command : `prisma generate && next build`
6. Install Command : `npm install`

### Settings Vercel
| Paramètre | Valeur |
|-----------|--------|
| Node.js Version | 20.x |
| Build Command | `prisma generate && next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

---

## 3. Variables d'Environnement Production

Configurer dans **Vercel → Settings → Environment Variables** :

### Base de données
```
DATABASE_URL=postgresql://user:password@host:5432/althea_db?sslmode=require
```

### Authentification
```
NEXTAUTH_SECRET=<générer avec: openssl rand -base64 32>
NEXTAUTH_URL=https://althea-systems.fr
```

### OAuth Providers
```
GOOGLE_CLIENT_ID=<Google Cloud Console>
GOOGLE_CLIENT_SECRET=<Google Cloud Console>
GITHUB_CLIENT_ID=<GitHub OAuth App>
GITHUB_CLIENT_SECRET=<GitHub OAuth App>
```

### Stripe (Paiements)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Redis
```
REDIS_URL=rediss://default:password@host:6379
```

### Cloudflare R2 (Images)
```
R2_ACCOUNT_ID=<Cloudflare Dashboard>
R2_ACCESS_KEY_ID=<R2 API Token>
R2_SECRET_ACCESS_KEY=<R2 API Token>
```

### Emails
```
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@althea-systems.fr
```

### Logging
```
LOG_LEVEL=warn
LOG_DIR=logs
```

---

## 4. Base de Données — Neon PostgreSQL

### Setup
1. Créer un compte sur [neon.tech](https://neon.tech)
2. Créer un nouveau projet "althea-systems"
3. Copier la connection string dans `DATABASE_URL`
4. Exécuter les migrations :
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
DATABASE_URL="postgresql://..." npx prisma db seed
```

### Avantages Neon
- Serverless (scale to zero)
- Branching pour tester les migrations
- Point-in-time recovery
- Auto-suspend quand inactif (économies)

### Alternative : Supabase
- PostgreSQL managé + dashboard
- Auth intégré (pas utilisé ici, on a NextAuth)
- Connection string compatible Prisma

---

## 5. Redis — Upstash

### Setup
1. Créer un compte sur [upstash.com](https://upstash.com)
2. Créer une base Redis, région `eu-west-1` (Europe)
3. Copier l'URL TLS dans `REDIS_URL`
4. Format : `rediss://default:TOKEN@host:6379`

### Usage dans le projet
- Rate limiting API
- Cache produits/catégories/recherche
- Sessions (optionnel)

---

## 6. Cloudflare R2 — Stockage Images

### Setup
1. Dashboard Cloudflare → R2 → Créer bucket `althea-images`
2. Créer un API Token (R2 read/write)
3. Configurer les variables `R2_*`
4. Activer le domaine public pour le bucket (CDN automatique)

### Structure des dossiers
```
althea-images/
├── products/       # Images produits
├── categories/     # Images catégories
├── carousel/       # Slides homepage
└── users/          # Avatars utilisateurs
```

---

## 7. SSL/TLS

### Vercel (automatique)
- Certificat SSL gratuit automatique
- Renouvellement automatique
- HTTP/2 + HTTP/3 activés
- Redirection HTTP → HTTPS automatique

### Domaine custom
1. Vercel → Settings → Domains → Ajouter `althea-systems.fr`
2. Configurer les DNS :
   - `A` → `76.76.21.21`
   - `CNAME www` → `cname.vercel-dns.com`
3. Attendre la propagation DNS (quelques minutes à 48h)

---

## 8. Backups BDD Automatiques

### Neon (inclus)
- Backups automatiques quotidiens
- Point-in-time recovery (7 jours sur Free, 30 jours sur Pro)
- Branching pour tester avant migration

### Backup manuel supplémentaire (recommandé)
```bash
# Script cron hebdomadaire
pg_dump $DATABASE_URL -F c -f backup_$(date +%Y%m%d).dump

# Upload vers R2
aws s3 cp backup_*.dump s3://althea-backups/ \
  --endpoint-url https://$R2_ACCOUNT_ID.r2.cloudflarestorage.com
```

---

## 9. Monitoring Uptime

### UptimeRobot (gratuit)
1. Créer un compte sur [uptimerobot.com](https://uptimerobot.com)
2. Ajouter les monitors :

| Monitor | Type | URL | Intervalle |
|---------|------|-----|-----------|
| Site | HTTPS | `https://althea-systems.fr` | 5 min |
| API | HTTPS | `https://althea-systems.fr/api/products` | 5 min |
| Health | HTTPS | `https://althea-systems.fr/api/health` | 2 min |

3. Configurer alertes : Email + SMS

### Status page
- UptimeRobot fournit une page de statut publique gratuite
- URL : `https://stats.uptimerobot.com/althea-systems`

---

## 10. Rollback Strategy

### Vercel Instant Rollback
1. Dashboard Vercel → Deployments
2. Trouver le dernier déploiement stable
3. Cliquer "..." → "Promote to Production"
4. **Temps de rollback : < 30 secondes**

### Rollback BDD
```bash
# Si migration problématique
npx prisma migrate resolve --rolled-back <migration_name>

# Restauration backup
pg_restore -d $DATABASE_URL backup_YYYYMMDD.dump
```

### Procédure complète
1. Rollback app via Vercel (immédiat)
2. Si BDD impactée : restaurer le backup
3. Investiguer la cause
4. Fix + redéploiement normal

---

## 11. Checklist Pré-Déploiement

- [ ] Toutes les variables d'environnement configurées dans Vercel
- [ ] `npm run build` passe en local
- [ ] `npx prisma validate` OK
- [ ] Migrations appliquées sur la BDD production
- [ ] Seed data (si premier déploiement)
- [ ] Stripe webhook configuré avec l'URL production
- [ ] OAuth providers mis à jour avec l'URL production
- [ ] DNS configuré et propagé
- [ ] SSL actif
- [ ] Monitoring configuré (UptimeRobot)
- [ ] Backup BDD vérifié
- [ ] Tests critiques passent (auth, checkout, admin)

---

## 12. Commandes Utiles

```bash
# Déployer manuellement
vercel --prod

# Voir les logs production
vercel logs --follow

# Vérifier le build
npm run build

# Appliquer migrations en production
DATABASE_URL="..." npx prisma migrate deploy

# Vérifier la santé de l'app
curl -s https://althea-systems.fr/api/products | head -c 200
```
