# Changelog - Althea Systems

Toutes les modifications notables du projet sont documentees dans ce fichier.

Le format est base sur [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)
et ce projet adhère au [Versioning Semantique](https://semver.org/lang/fr/).

---

## [Non publie]

### En cours
- Gestion images produits avec Cloudflare R2 (#80)
- Notifications email transactionnels (#93)
- Documentation technique complète (#76)
- CI/CD GitHub Actions (#85)
- Deploiement production (#96)

---

## [0.5.0] - 2026-03-12

### Ajoute
- Generation factures PDF automatique avec React-PDF (#52)
  - Templates facture avec logo, TVA, totaux
  - Generation a la creation de commande
  - Stockage PDF sur Cloudflare R2
- Gestion stock avec alertes de rupture (#95)
  - Decrementation automatique a la commande
  - Alertes seuil bas configurable
  - Blocage commande si stock insuffisant

### Modifie
- Schema Prisma mis a jour pour les factures et avoirs

---

## [0.4.0] - 2026-03-03

### Ajoute
- Calculs TVA automatiques avec affichage HT/TTC (#92)
  - Support des taux TVA francais (20%, 10%, 5.5%, 0%)
  - Utilitaires de conversion HT/TTC
  - Affichage dynamique selon le contexte
- API Contact avec stockage des messages (#55)
  - Endpoint CRUD pour messages de contact
  - Marquage lu/non-lu
  - Validation Zod des entrees

---

## [0.3.0] - 2026-02-24

### Ajoute
- API Products CRUD complet (#47)
  - Listing avec pagination, filtres, tri
  - Creation, modification, suppression
  - Gestion des images (tableau)
  - Recherche par nom, SKU
- API Categories CRUD complet (#48)
  - Categories arborescentes (parent/enfant)
  - Slug unique auto-genere
  - Tri par ordre personnalisable
- API Users avec gestion adresses (#50)
  - CRUD utilisateurs (admin)
  - Gestion des adresses de livraison
  - Changement de role/statut

---

## [0.2.0] - 2026-02-09

### Ajoute
- Integration Stripe paiement securise (#51)
  - Creation PaymentIntent
  - Webhooks Stripe (payment_intent.succeeded, etc.)
  - Gestion des remboursements
- API Orders avec validation stock (#49)
  - Creation de commande avec verification stock
  - Historique des statuts de commande
  - Calcul automatique des totaux (sous-total, TVA, livraison)

---

## [0.1.0] - 2026-01-20

### Ajoute
- **Setup initial du projet** (#27)
  - Next.js 16 avec App Router et React Compiler
  - TypeScript 5, Tailwind CSS 4
  - ESLint, Vitest configure
  - Node.js >= 20.0.0
- **Infrastructure Docker** (#28)
  - Docker Compose avec PostgreSQL 16, Redis 7
  - Adminer et Redis Commander en profil dev
  - Healthchecks sur tous les services
  - Network bridge dedie `althea-network`
- **Schema Prisma complet** (#29)
  - 15 modeles (User, Product, Order, Invoice, etc.)
  - 8 enums (Role, OrderStatus, PaymentStatus, etc.)
  - Relations completes avec cascade delete
  - Index sur les colonnes de recherche
- **Seeder BDD** (#30)
  - Donnees de test pour tous les modeles
  - Utilisateur admin par defaut
  - Produits et categories de demonstration
- **Authentification NextAuth** (#31)
  - Providers : Credentials, Google, GitHub
  - JWT avec rotation de tokens
  - PrismaAdapter pour la persistence
- **2FA TOTP pour admins** (#32)
  - Activation/desactivation par admin
  - QR code pour Google Authenticator
  - Verification obligatoire a chaque session admin
- **Backup codes 2FA** (ajout ulterieur)
  - 10 codes de secours generes
  - Usage unique avec tracking
- **Middleware de protection** (#33)
  - Routes admin protegees (role ADMIN + 2FA)
  - Routes compte protegees (authentification requise)
  - Redirection intelligente avec callbackUrl
  - Headers de securite (X-Frame-Options, X-Content-Type-Options)
- **Cache Redis** (#34)
  - Singleton Redis avec ioredis
  - Helpers `getCache`, `setCache`, `deleteCache`, `clearCachePattern`
  - TTL explicite sur chaque set
  - Rate limiting par IP et type de route
- **Dashboard admin** (#57)
  - KPIs en temps reel (CA, commandes, clients)
  - Graphiques Recharts
- **Gestion produits admin** (#58, #59)
  - Tableau CRUD avec filtres et pagination
  - Formulaires creation/modification
  - Upload images multiples
- **Logging Winston** (configuration)
  - Logger structure avec niveaux
  - Rotation des fichiers de log

---

## Conventions

### Types de changements
- **Ajoute** : nouvelles fonctionnalites
- **Modifie** : changements dans les fonctionnalites existantes
- **Deprecie** : fonctionnalites bientot supprimees
- **Supprime** : fonctionnalites supprimees
- **Corrige** : corrections de bugs
- **Securite** : corrections de vulnerabilites

### Process de release
1. Mettre a jour ce fichier avec les changements
2. Creer un tag Git `vX.Y.Z`
3. Generer les release notes depuis le changelog
4. Deployer via Vercel (auto-deploy sur merge main)
