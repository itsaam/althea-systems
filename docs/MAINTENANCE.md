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
npm install prisma@latest @prisma/client@latest
npx prisma generate
npx prisma validate
```

---

## 2. Stratégie de Backup BDD

### PostgreSQL (Container Docker)

| Paramètre | Valeur |
|-----------|--------|
| **Fréquence** | Backup complet quotidien à 3h00 UTC |
| **Rétention** | 30 jours (quotidiens), 12 mois (mensuels) |
| **Type** | pg_dump (logique) |
| **Stockage** | `/opt/backups/althea/` sur le VPS |

### Script backup
```bash
#!/bin/bash
# /opt/scripts/backup-althea.sh
DATE=$(date +%Y%m%d_%H%M)
BACKUP_DIR=/opt/backups/althea
mkdir -p $BACKUP_DIR

docker exec althea-postgres pg_dump -U althea althea_db -F c > $BACKUP_DIR/althea_$DATE.dump

# Garder les 30 derniers
ls -t $BACKUP_DIR/*.dump | tail -n +31 | xargs rm -f 2>/dev/null
```

### Cron
```bash
0 3 * * * /opt/scripts/backup-althea.sh >> /var/log/althea-backup.log 2>&1
```

### Restauration
```bash
docker exec -i althea-postgres pg_restore -U althea -d althea_db --clean < backup.dump
```

---

## 3. Plan de Rollback

### Rollback Application (Docker/Dokploy)
1. **Via Dokploy** : Redeploy sur le déploiement précédent
2. **Via Docker** :
```bash
docker compose -f docker/docker-compose.yml down
git checkout <commit-stable>
docker compose -f docker/docker-compose.yml up -d --build
```
3. Temps de rollback : **< 5 min**

### Rollback Base de Données
1. Identifier la migration problématique
2. `docker exec althea-app npx prisma migrate resolve --rolled-back <migration_name>`
3. Restaurer le backup si nécessaire

### Procédure d'urgence
1. 🔴 **Détection** : Alerte monitoring (UptimeRobot)
2. 🟡 **Évaluation** : < 5 min pour identifier la cause
3. 🟢 **Rollback** : Redeploy Dokploy ou git checkout + rebuild
4. 📋 **Post-mortem** : Documenter l'incident dans `docs/reports/`

---

## 4. Monitoring Uptime et Alertes

### UptimeRobot (gratuit)
| Monitor | URL | Intervalle | Alerte |
|---------|-----|-----------|--------|
| Homepage | `https://althea.vjuya.me` | 5 min | Email + SMS |
| API Health | `https://althea.vjuya.me/api/products` | 5 min | Email |

### Vérification VPS
```bash
# Status containers
docker compose -f docker/docker-compose.yml ps

# Logs temps réel
docker compose -f docker/docker-compose.yml logs -f app

# Espace disque
df -h

# RAM/CPU
htop
```

### Logs applicatifs
- Winston écrit dans `/logs/` (combined.log, error.log)
- Rotation automatique (max 20MB par fichier)
- Accès : `docker exec althea-app cat logs/error.log`

---

## 5. Stratégie de Scaling

### Scaling Vertical (le plus simple)
| Ressource | Actuel | Si besoin |
|-----------|--------|-----------|
| VPS RAM | 2 GB | 4-8 GB |
| VPS CPU | 2 vCPU | 4 vCPU |
| VPS Disque | 20 GB | 50 GB |
| PostgreSQL | Container local | VPS dédié ou managed (Neon) |
| Redis | Container local | VPS dédié ou Upstash |

### Scaling Horizontal (si forte croissance)
- Load balancer (Nginx/HAProxy) devant plusieurs instances app
- PostgreSQL : replica read-only pour les requêtes de lecture
- Redis : Cluster mode (ou migration vers Upstash)

### CDN pour Assets Statiques
- **Cloudflare** : Proxy DNS activé → CDN automatique
- **Cloudflare R2** : CDN mondial pour les images produits
- **next/image** : Optimisation automatique des images

---

## 6. Roadmap Features Futures

### Court terme (Q2 2026)
- [ ] Système de wishlist utilisateur
- [ ] Notifications push (commandes, promotions)
- [ ] Multi-devises (EUR, USD, GBP)
- [ ] Avis et notes produits

### Moyen terme (Q3-Q4 2026)
- [ ] Programme fidélité (points, récompenses)
- [ ] Recommandations produits
- [ ] Chat en temps réel support client
- [ ] Application mobile (PWA)

### Long terme (2027)
- [ ] Marketplace multi-vendeurs
- [ ] API publique partenaires
- [ ] BI Dashboard avancé

---

## 7. Budget Infrastructure Prévisionnel

### Phase Développement (actuelle)
| Service | Coût mensuel |
|---------|-------------|
| VPS (déjà existant) | ~5-10 €/mois |
| Cloudflare R2 (10GB) | Gratuit |
| GitHub (Free) | Gratuit |
| UptimeRobot (Free) | Gratuit |
| **Total** | **~5-10 €/mois** |

### Phase Production (lancement)
| Service | Coût mensuel |
|---------|-------------|
| VPS (2GB RAM) | ~10 €/mois |
| Cloudflare R2 (100GB) | ~5 €/mois |
| Resend (emails) | ~20 €/mois |
| Domaine vjuya.me | ~10 €/an |
| **Total** | **~35-40 €/mois** |

### Phase Croissance
| Service | Coût mensuel |
|---------|-------------|
| VPS (8GB RAM) | ~30 €/mois |
| Cloudflare R2 (1TB) | ~15 €/mois |
| Managed PostgreSQL (Neon) | ~19 €/mois |
| Upstash Redis | ~10 €/mois |
| **Total** | **~80 €/mois** |

---

## 8. SLA (Service Level Agreement)

| Métrique | Objectif | Mesure |
|----------|---------|--------|
| **Uptime** | 99.9% (max 8.7h downtime/an) | UptimeRobot |
| **Temps réponse API** | < 200ms (P95) | Logs Winston |
| **Temps chargement page** | < 2s (LCP) | Lighthouse |
| **Temps de rollback** | < 5 min | Dokploy redeploy |
| **RTO** (Recovery Time Objective) | < 30 min | Procédure rollback |
| **RPO** (Recovery Point Objective) | < 24h | Backup quotidien BDD |
| **Résolution bug critique** | < 4h | Process incident |
| **Résolution bug mineur** | < 48h | Process standard |
