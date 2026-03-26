# Plan de Maintenance et Évolutivité — Althea Systems

## 1. Procédures de Mise à Jour

### Dépendances npm
```bash
# Audit sécurité hebdomadaire
npm audit
npm audit fix

# Mise à jour mineures (safe)
npm update

# Mise à jour majeures (avec review)
npx npm-check-updates -u
npm install
npm run build  # Vérifier que le build passe
npm test       # Vérifier que les tests passent
```

**Fréquence :** Audit sécurité hebdomadaire, mises à jour mineures bimensuelles, majeures trimestrielles.

### Framework Next.js
1. Lire les release notes de la nouvelle version
2. Créer une branche `chore/upgrade-nextjs-XX`
3. `npm install next@latest react@latest react-dom@latest`
4. Tester toutes les routes critiques (auth, checkout, admin)
5. Vérifier le build production : `npm run build`
6. Merger après validation complète

### Base de données Prisma
```bash
# Mettre à jour Prisma
npm install prisma@latest @prisma/client@latest
npx prisma generate
npx prisma validate
```

---

## 2. Stratégie de Backup BDD

### PostgreSQL (Production)

| Paramètre | Valeur |
|-----------|--------|
| **Fréquence** | Backup complet quotidien à 3h00 UTC |
| **Rétention** | 30 jours (backups quotidiens), 12 mois (backups mensuels) |
| **Type** | pg_dump (logique) + WAL archiving (point-in-time recovery) |
| **Stockage** | Cloudflare R2 (bucket dédié `althea-backups`) |

### Commandes backup
```bash
# Backup manuel
pg_dump -h $DB_HOST -U $DB_USER -d althea_db -F c -f backup_$(date +%Y%m%d).dump

# Restauration
pg_restore -h $DB_HOST -U $DB_USER -d althea_db backup_YYYYMMDD.dump
```

### Si Neon/Supabase (recommandé)
- Backups automatiques inclus dans le plan
- Point-in-time recovery disponible
- Branching pour tester les migrations

---

## 3. Plan de Rollback

### Rollback Application (Vercel)
1. **Instant Rollback** : Dashboard Vercel → Deployments → cliquer "Redeploy" sur le déploiement précédent
2. Temps de rollback : **< 30 secondes**

### Rollback Base de Données
1. Identifier la migration problématique
2. `npx prisma migrate resolve --rolled-back <migration_name>`
3. Restaurer le backup si nécessaire
4. Redéployer la version précédente de l'application

### Rollback Git
```bash
# Identifier le commit stable
git log --oneline -10

# Revert du commit problématique
git revert <commit-hash>
git push origin main
# Vercel redéploie automatiquement
```

### Procédure d'urgence
1. 🔴 **Détection** : Alerte monitoring (UptimeRobot, Sentry)
2. 🟡 **Évaluation** : < 5 min pour identifier la cause
3. 🟢 **Rollback** : Instant rollback Vercel si nécessaire
4. 📋 **Post-mortem** : Documenter l'incident dans `docs/reports/`

---

## 4. Monitoring Uptime et Alertes

### UptimeRobot (recommandé — gratuit jusqu'à 50 monitors)
| Monitor | URL | Intervalle | Alerte |
|---------|-----|-----------|--------|
| Homepage | `https://althea-systems.fr` | 5 min | Email + SMS |
| API Health | `https://althea-systems.fr/api/health` | 2 min | Email + SMS |
| Admin | `https://althea-systems.fr/admin` | 5 min | Email |
| Stripe Webhook | `https://althea-systems.fr/api/stripe/webhook` | 10 min | Email |

### Sentry (erreurs applicatives)
- Capture automatique des erreurs JS côté client et serveur
- Alertes si taux d'erreur > 1%
- Source maps pour debug en production

### Vercel Analytics
- Web Vitals (LCP, FID, CLS)
- Temps de réponse API
- Alertes si dégradation performance

---

## 5. Stratégie de Scaling

### Horizontal Scaling (Load Balancer)
- **Vercel** : Scaling automatique serverless (aucune config nécessaire)
- Les fonctions API sont déployées en Edge/Serverless
- Auto-scaling selon le trafic

### Vertical Scaling
| Service | Plan actuel | Upgrade si besoin |
|---------|------------|-------------------|
| Vercel | Hobby/Pro | Enterprise |
| PostgreSQL (Neon) | Free → Pro | Scale (auto-scaling) |
| Redis (Upstash) | Free | Pay-as-you-go |
| Cloudflare R2 | Free (10GB) | Pay-as-you-go |

### CDN pour Assets Statiques
- **Vercel Edge Network** : CDN intégré pour les pages et assets statiques
- **Cloudflare R2** : CDN mondial pour les images produits
- **next/image** : Optimisation automatique des images (WebP, AVIF, lazy loading)

### Redis Cluster (si croissance)
- **Phase 1** (actuel) : Instance unique Upstash (suffisant jusqu'à ~10K req/s)
- **Phase 2** : Redis cluster Upstash (scaling automatique)
- **Phase 3** : Redis cluster dédié si > 100K req/s

---

## 6. Roadmap Features Futures

### Court terme (Q2 2026)
- [ ] Système de wishlist utilisateur
- [ ] Notifications push (commandes, promotions)
- [ ] Multi-devises (EUR, USD, GBP)
- [ ] Avis et notes produits

### Moyen terme (Q3-Q4 2026)
- [ ] Programme fidélité (points, récompenses)
- [ ] Recommandations produits (ML basique)
- [ ] Chat en temps réel support client (WebSocket)
- [ ] Application mobile (React Native ou PWA)

### Long terme (2027)
- [ ] Marketplace multi-vendeurs
- [ ] API publique partenaires
- [ ] BI Dashboard avancé (analytics métier)

---

## 7. Budget Infrastructure Prévisionnel

### Phase Développement (actuelle)
| Service | Coût mensuel |
|---------|-------------|
| Vercel (Hobby) | Gratuit |
| Neon PostgreSQL (Free) | Gratuit |
| Upstash Redis (Free) | Gratuit |
| Cloudflare R2 (10GB) | Gratuit |
| UptimeRobot (Free) | Gratuit |
| GitHub (Free) | Gratuit |
| **Total** | **0 €/mois** |

### Phase Production (lancement)
| Service | Coût mensuel |
|---------|-------------|
| Vercel Pro | ~20 €/mois |
| Neon Pro (PostgreSQL) | ~19 €/mois |
| Upstash Pro (Redis) | ~10 €/mois |
| Cloudflare R2 (100GB) | ~5 €/mois |
| Resend (emails) | ~20 €/mois |
| Sentry (erreurs) | Gratuit (tier dev) |
| Domaine + DNS | ~15 €/an |
| **Total** | **~75 €/mois** |

### Phase Croissance
| Service | Coût mensuel |
|---------|-------------|
| Vercel Enterprise | ~150 €/mois |
| Neon Scale | ~69 €/mois |
| Upstash Pay-as-you-go | ~30 €/mois |
| Cloudflare R2 (1TB) | ~15 €/mois |
| Sentry Business | ~26 €/mois |
| **Total** | **~300 €/mois** |

---

## 8. SLA (Service Level Agreement)

| Métrique | Objectif | Mesure |
|----------|---------|--------|
| **Uptime** | 99.9% (max 8.7h downtime/an) | UptimeRobot |
| **Temps réponse API** | < 200ms (P95) | Vercel Analytics |
| **Temps chargement page** | < 2s (LCP) | Lighthouse / Web Vitals |
| **Temps de rollback** | < 5 min | Procédure Vercel |
| **RTO** (Recovery Time Objective) | < 30 min | Procédure rollback |
| **RPO** (Recovery Point Objective) | < 24h | Backup quotidien BDD |
| **Résolution bug critique** | < 4h | Process incident |
| **Résolution bug mineur** | < 48h | Process standard |
