# Rapport Technique - Authentification et Infrastructure

**Projet** : Althea Systems - Plateforme e-commerce B2B  
**Auteur** : Samy  
**Role** : DevOps - Auth et Infrastructure  
**Date** : 19 decembre 2025

---

## Table des matieres

1. [Contexte et responsabilites](#1-contexte-et-responsabilites)
2. [Configuration NextAuth](#2-configuration-nextauth)
3. [Middleware de protection](#3-middleware-de-protection)
4. [Authentification a deux facteurs](#4-authentification-a-deux-facteurs)
5. [Infrastructure Docker](#5-infrastructure-docker)
6. [Systeme de cache Redis](#6-systeme-de-cache-redis)
7. [Stockage des images (Cloudflare R2)](#7-stockage-des-images-cloudflare-r2)
8. [Validation des variables d'environnement](#8-validation-des-variables-denvironnement)
9. [Decisions techniques et justifications](#9-decisions-techniques-et-justifications)
10. [Temps de developpement](#10-temps-de-developpement)
11. [Difficultes rencontrees](#11-difficultes-rencontrees)
12. [Pistes d'amelioration](#12-pistes-damelioration)

---

## 1. Contexte et responsabilites

### 1.1 Presentation du projet

Althea Systems est une plateforme e-commerce destinee a la vente de materiel medical pour cabinets medicaux. Le projet necessite une architecture robuste, securisee et scalable pour repondre aux exigences du secteur medical.

### 1.2 Perimetre de mon intervention

En tant que responsable Auth et Infrastructure, mes missions etaient :

- Configurer le systeme d'authentification complet (OAuth, credentials, 2FA)
- Proteger les routes sensibles via un middleware
- Mettre en place l'infrastructure Docker pour le deploiement
- Implementer un systeme de cache Redis pour les performances

### 1.3 Stack technique utilisee

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js | 16.x |
| Auth | NextAuth.js | 4.x |
| ORM | Prisma | 5.x |
| Cache | Redis / ioredis | 7.x |
| Container | Docker | 24.x |
| Base de donnees | PostgreSQL | 16 |
| Base NoSQL | MongoDB | 7 |

---

## 2. Configuration NextAuth

### 2.1 Architecture choisie

Le fichier `src/lib/auth.ts` centralise toute la configuration d'authentification. Cette approche permet de maintenir un point unique de verite pour la gestion des sessions.

### 2.2 Providers implementes

#### OAuth Providers

Deux providers OAuth ont ete configures pour offrir une connexion simplifiee :

```
- Google OAuth 2.0
- GitHub OAuth
```

Note : Apple Sign In a ete retire car il necessitait un compte Apple Developer payant (99$/an). Cette decision a ete prise pour simplifier la maintenance et eviter des couts inutiles pour un projet de fin d'etudes.

Chaque provider utilise l'option `allowDangerousEmailAccountLinking: true` pour permettre aux utilisateurs de lier plusieurs methodes de connexion au meme compte email. Ce choix a ete fait pour ameliorer l'experience utilisateur tout en acceptant le compromis de securite associe.

#### Credentials Provider

L'authentification par email/mot de passe est geree via le Credentials Provider avec :

- Validation des identifiants contre la base PostgreSQL
- Hashage des mots de passe avec bcrypt
- Verification de l'email avant autorisation de connexion
- Logging des tentatives de connexion (reussies et echouees)

### 2.3 Strategie de session

La strategie JWT a ete privilegiee pour plusieurs raisons :

1. **Scalabilite** : Pas de stockage de session en base de donnees
2. **Stateless** : Chaque requete est autonome
3. **Performance** : Pas de requete base de donnees pour valider la session

Configuration appliquee :
- Duree de session : 30 jours
- Les informations utilisateur (id, role, statut 2FA) sont encodees directement dans le token JWT, qui est stocke cote client (cookie httpOnly)

### 2.4 Callbacks personnalises

Trois callbacks ont ete implementes :

**signIn** : Log des connexions OAuth pour tracabilite

**jwt** : Enrichissement du token avec les donnees utilisateur (role, statut 2FA). Gestion des mises a jour de session via le trigger "update".

**session** : Propagation des informations du token vers l'objet session accessible cote client.

### 2.5 Logging

Integration d'un systeme de logging personnalise pour tracer :
- Les connexions reussies
- Les echecs d'authentification
- Les deconnexions

---

## 3. Middleware de protection

### 3.1 Fichier concerne

`src/middleware.ts` - Execute sur l'Edge Runtime de Next.js

### 3.2 Routes protegees

Le middleware definit trois categories de routes :

| Categorie | Routes | Protection |
|-----------|--------|------------|
| Admin | `/admin/*` | Role ADMIN + 2FA obligatoire |
| Compte | `/profile`, `/orders`, `/addresses`, `/payments` | Utilisateur connecte |
| Auth | `/login`, `/register`, `/forgot-password`, etc. | Redirection si deja connecte |

### 3.3 Logique de protection

Pour les routes admin, le middleware applique une verification en cascade :

1. Verification de la presence d'un token JWT
2. Verification du role ADMIN
3. Verification de l'activation du 2FA
4. Verification de la validation du 2FA dans la session courante

Si l'une de ces conditions echoue, l'utilisateur est redirige vers la page appropriee (login, accueil, configuration 2FA, ou verification 2FA).

### 3.4 Headers de securite

Trois headers sont ajoutes a chaque reponse :

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
```

Ces headers protegent contre :
- Le clickjacking (X-Frame-Options)
- Le MIME type sniffing (X-Content-Type-Options)
- Les fuites de referrer (Referrer-Policy)

### 3.5 Exclusions du middleware

Le matcher exclut les chemins suivants pour eviter les traitements inutiles :
- `/api/*` (routes API)
- `/_next/*` (assets Next.js)
- Fichiers statiques (images, fonts, favicon)

---

## 4. Authentification a deux facteurs

### 4.1 Implementation technique

Le 2FA utilise le standard TOTP (Time-based One-Time Password) via la librairie `otplib`.

### 4.2 Flux de configuration

**Etape 1 - Generation du secret** (`/api/auth/2fa/setup`)
- Generation d'un secret Base32 avec `authenticator.generateSecret()`
- Stockage temporaire dans Redis avec expiration de 10 minutes
- Generation de l'URL otpauth pour le QR code

**Etape 2 - Verification et activation** (`/api/auth/2fa/verify`)
- Recuperation du secret depuis Redis
- Verification du code TOTP saisi
- Si valide : sauvegarde du secret en base et activation du 2FA
- Suppression du secret temporaire de Redis

### 4.3 Flux de verification a la connexion

Lorsqu'un administrateur avec 2FA active se connecte :
1. Le middleware detecte que le 2FA n'est pas verifie pour cette session
2. Redirection vers `/admin/verify-2fa`
3. L'utilisateur saisit le code de son application d'authentification
4. Verification du code contre le secret stocke en base
5. Mise a jour de la session avec `twoFactorVerified: true`

### 4.4 Justification de l'obligation pour les admins

Le 2FA est obligatoire pour les administrateurs car ils ont acces :
- A la gestion des produits et du catalogue
- Aux donnees clients et commandes
- Aux parametres de l'application

Cette contrainte renforce la securite du back-office sans impacter l'experience des clients.

---

## 5. Infrastructure Docker et Deploiement

### 5.1 Contexte de deploiement

L'infrastructure de deploiement repose sur deux environnements distincts :

| Environnement | Outil | Usage |
|---------------|-------|-------|
| Local | Docker Compose | Developpement et tests |
| Production | Dokploy + Nixpacks | Deploiement automatise |

En production, le deploiement est gere par Dokploy avec les caracteristiques suivantes :
- Autodeploy declenche a chaque push sur la branche main
- Build automatique via Nixpacks (detection automatique du framework Next.js)
- Bases de donnees (PostgreSQL, MongoDB, Redis) hebergees sur Dokploy avec monitoring integre

Le Dockerfile et docker-compose.yml servent donc exclusivement a l'environnement de developpement local.

### 5.2 Architecture locale (Docker Compose)

Le fichier `docker/docker-compose.yml` definit les services pour le developpement :

| Service | Image | Port | Role |
|---------|-------|------|------|
| app | Build custom | 3000 | Application Next.js |
| postgres | postgres:16-alpine | 5432 | Base de donnees principale |
| mongodb | mongo:7 | 27017 | Base de donnees logs/sessions |
| redis | redis:7-alpine | 6379 | Cache et rate limiting |

### 5.3 Dockerfile pour le developpement local

Le Dockerfile utilise une approche multi-stage pour optimiser la taille de l'image :

**Stage 1 - deps** : Installation des dependances npm

**Stage 2 - builder** : 
- Copie des node_modules
- Generation du client Prisma
- Build de l'application Next.js

**Stage 3 - runner** :
- Image de production minimale
- Utilisateur non-root (nextjs:nodejs)
- Copie des fichiers strictement necessaires

Cette approche reduit la surface d'attaque et la taille de l'image.

Note : En production, Nixpacks genere sa propre image optimisee. Ce Dockerfile sert uniquement pour les tests locaux ou si l'equipe souhaite migrer vers un deploiement Docker classique.

### 5.4 Configuration des services locaux

#### PostgreSQL
- Volume persistant pour les donnees
- Healthcheck configure pour verifier la disponibilite
- Scripts d'initialisation dans `/docker-entrypoint-initdb.d`

#### MongoDB
- Authentification activee
- Volume persistant
- Healthcheck via commande ping

#### Redis
- Mode appendonly pour la persistance
- Limite memoire de 256MB
- Politique d'eviction allkeys-lru

### 5.5 Reseau local

Tous les services partagent un reseau bridge `althea-network` permettant la communication inter-conteneurs par nom de service.

L'application depend des trois bases de donnees avec condition `service_healthy` pour s'assurer qu'elles sont pretes avant le demarrage.

### 5.6 Outils de developpement

Trois services supplementaires sont disponibles en profil "dev" :
- Adminer : Interface web pour PostgreSQL
- Redis Commander : Interface web pour Redis
- Mailhog : Serveur SMTP de test avec interface web

### 5.7 Deploiement production (Dokploy)

La production utilise une approche differente :

| Composant | Solution |
|-----------|----------|
| Build | Nixpacks (detection automatique Next.js) |
| Hosting | Dokploy |
| Trigger | Push sur branche main (autodeploy) |
| PostgreSQL | Instance Dokploy avec monitoring |
| MongoDB | Instance Dokploy avec monitoring |
| Redis | Instance Dokploy avec monitoring |

Cette separation permet :
- Un environnement de dev identique pour toute l'equipe via Docker
- Un deploiement simplifie sans gestion manuelle d'images Docker
- Un monitoring centralise des bases de donnees en production

---

## 6. Systeme de cache Redis

### 6.1 Architecture du module

Le fichier `src/lib/redis.ts` implemente un systeme de cache complet avec plusieurs fonctionnalites.

### 6.2 Initialisation lazy

L'instance Redis utilise un pattern Proxy pour une initialisation differee :
- Evite les erreurs au build time
- Connection etablie uniquement a la premiere utilisation
- Configuration avec retry et ready check

### 6.3 Fonctionnalites implementees

#### Cache generique
- `getCache<T>` : Recuperation avec typage generique
- `setCache<T>` : Stockage avec TTL configurable
- `deleteCache` : Suppression unitaire
- `clearCachePattern` : Suppression par pattern

#### Cache de recherche
- Cle construite a partir de la requete et des filtres
- TTL de 5 minutes
- Invalidation globale disponible

#### Gestion des sessions
- Stockage des donnees de session utilisateur
- TTL de 24 heures
- Mise a jour de l'activite
- Invalidation de toutes les sessions d'un utilisateur

#### Rate limiting
- Implementation basee sur INCR/EXPIRE
- Retourne le nombre de requetes restantes
- Reset automatique a la fin de la fenetre

#### Cache produits et categories
- TTL de 10 minutes pour les produits
- TTL de 30 minutes pour les categories
- Invalidation automatique du cache recherche lors de la modification

### 6.4 Gestion des erreurs

Toutes les fonctions encapsulent les erreurs Redis :
- Logging des erreurs
- Retour de valeurs par defaut
- Pas de crash de l'application si Redis est indisponible

---

## 7. Stockage des images (Cloudflare R2)

### 7.1 Choix de Cloudflare R2 vs Base64/MongoDB

Le cahier des charges mentionnait l'utilisation de MongoDB pour le stockage des images. Cependant, apres analyse technique approfondie, cette approche presente plusieurs inconvenients majeurs :

**Pourquoi pas le stockage en base64 dans MongoDB ?**

| Critere | Base64 MongoDB | Cloudflare R2 |
|---------|----------------|---------------|
| Taille stockage | +33% (encodage base64) | Taille originale |
| Performance requetes | Lente (documents lourds) | Instantanee (CDN) |
| Bande passante DB | Elevee | Nulle |
| Backup/Restore | Complexe et long | Independant |
| CDN integre | Non | Oui (mondial) |
| Cout | Stockage DB cher | Gratuit < 10GB |
| Scalabilite | Limitee | Illimitee |

**Exemple concret** : Une image de 1MB en base64 devient 1.33MB. Avec 1000 images, la base MongoDB grossit de 1.33GB au lieu de stocker juste les URLs (quelques KB).

**Problemes techniques du base64** :
- Les images encodees en base64 augmentent de 33% en taille
- Chaque requete de page charge les donnees binaires depuis MongoDB
- Les index MongoDB deviennent inefficaces sur des documents volumineux
- Le temps de serialisation/deserialisation JSON impacte les performances
- Pas de mise en cache CDN possible

**Avantages de Cloudflare R2** :
- Stockage objet compatible S3, gratuit jusqu'a 10GB/mois
- CDN mondial integre pour des temps de chargement optimaux (< 50ms)
- Pas de frais de bande passante sortante (contrairement a AWS S3)
- Separation des responsabilites : PostgreSQL stocke les metadonnees, R2 stocke les fichiers binaires
- Images servies directement depuis les edge servers Cloudflare

### 7.2 Implementation technique

Le module `src/lib/r2.ts` utilise le SDK AWS S3 (compatible avec R2) :

```javascript
const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});
```

### 7.3 Fonctionnalites implementees

**Upload d'image** :
- Validation du type de fichier (JPEG, PNG, WebP, GIF)
- Limite de taille a 5MB
- Generation d'un nom unique avec timestamp
- Retour de l'URL publique

**Suppression d'image** :
- Extraction de la cle depuis l'URL
- Suppression du fichier sur R2

### 7.4 Integration avec le back-office

L'API `/api/upload` permet aux administrateurs d'uploader des images directement depuis le back-office. Les images sont stockees sur R2 et l'URL est sauvegardee en base de donnees (PostgreSQL).

Cette architecture permet :
- Un chargement rapide des images via le CDN Cloudflare
- Une gestion simplifiee des metadonnees en base relationnelle
- Une scalabilite sans impact sur les performances de la base

### 7.5 Variables d'environnement requises

```
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=althea-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

---

## 8. Validation des variables d'environnement

### 8.1 Implementation

Le fichier `src/lib/config/env.ts` utilise Zod pour valider les variables d'environnement au demarrage.

### 7.2 Schema de validation

Les variables sont categorisees par importance :

**Obligatoires** :
- DATABASE_URL, MONGODB_URI, REDIS_URL
- NEXTAUTH_URL, NEXTAUTH_SECRET (minimum 32 caracteres)
- NEXT_PUBLIC_APP_URL

**Optionnelles** :
- Credentials OAuth (Google, GitHub, Apple)
- Configuration Stripe
- Configuration SMTP

### 7.3 Comportement selon l'environnement

- **Production** : Erreur fatale si variables invalides
- **Developpement** : Warning avec continuation
- **Build** : Skip de la validation (variable SKIP_ENV_VALIDATION)

### 7.4 Helper de fonctionnalites

Un objet `features` expose l'etat des integrations :
- `hasOAuth.google/github/apple` : OAuth configure
- `hasStripe` : Paiement disponible
- `hasEmail` : Envoi d'emails possible

Cela permet d'adapter l'interface selon les fonctionnalites disponibles.

---

## 9. Decisions techniques et justifications

### 8.1 Choix de NextAuth.js

**Avantages** :
- Integration native avec Next.js
- Support de multiples providers
- Gestion automatique des sessions JWT
- Communaute active et documentation complete

**Alternative consideree** : Clerk, Auth0
**Raison du rejet** : Dependance a un service tiers, cout potentiel

### 8.2 Choix de JWT vs Sessions base de donnees

**Avantages du JWT** :
- Pas de requete BDD pour valider une session
- Scalabilite horizontale sans partage d'etat
- Fonctionne avec l'Edge Runtime

**Inconvenient accepte** : Revocation de session moins immediate

### 8.3 Choix de Redis pour le cache

**Avantages** :
- Performance (operations en memoire)
- Support des structures de donnees complexes
- TTL natif sur les cles
- Persistence optionnelle

**Alternative consideree** : Cache en memoire Node.js
**Raison du rejet** : Pas de partage entre instances, perte au redemarrage

### 8.4 Choix de Dokploy et Nixpacks pour la production

**Avantages** :
- Deploiement automatise sans configuration manuelle
- Nixpacks detecte automatiquement le framework et optimise le build
- Monitoring integre pour les bases de donnees
- Pas de gestion d'images Docker en production

**Alternative consideree** : Deploiement Docker classique, Vercel
**Raison du rejet** : Vercel impose des limites sur les fonctions serverless. Docker classique demande plus de maintenance.

### 8.5 Docker Compose pour le developpement local

**Avantages** :
- Environnement identique pour tous les developpeurs
- Isolation des services
- Demarrage en une commande

### 8.6 2FA obligatoire pour les admins

**Justification** :
- Le back-office contient des donnees sensibles (clients, commandes)
- Le secteur medical impose des standards de securite eleves
- Impact minimal sur l'experience (une seule configuration)

---

## 10. Temps de developpement

| Tache | Duree estimee | Commentaire |
|-------|---------------|-------------|
| Configuration NextAuth de base | 4h | Providers, callbacks, types |
| Integration OAuth (Google, GitHub, Apple) | 3h | Configuration console dev, tests |
| Middleware de protection | 3h | Logique de redirection, edge runtime |
| Implementation 2FA | 6h | Setup, verify, integration session |
| Docker compose | 4h | Services, healthchecks, volumes |
| Dockerfile multi-stage | 2h | Optimisation, debug |
| Systeme de cache Redis | 5h | Helpers, patterns, tests |
| Validation environnement | 2h | Schema Zod, comportement dev/prod |
| Debug et corrections | 4h | Edge runtime, compatibilites |
| Documentation | 3h | Ce rapport |

**Total estime** : 36 heures

---

## 11. Difficultes rencontrees

### 10.1 Compatibilite Edge Runtime

**Probleme** : Le middleware Next.js s'execute sur l'Edge Runtime qui ne supporte pas toutes les APIs Node.js. Le rate limiting via ioredis causait une erreur `Cannot read properties of undefined (reading 'charCodeAt')`.

**Solution** : Retrait du rate limiting du middleware. Cette fonctionnalite reste disponible pour les routes API classiques qui s'executent sur le Node.js runtime.

### 10.2 Gestion du 2FA dans la session

**Probleme** : Apres verification du code 2FA, la session devait etre mise a jour sans deconnecter l'utilisateur.

**Solution** : Utilisation du trigger "update" de NextAuth avec `session.update()` cote client pour rafraichir les informations de session.

### 10.4 Bug Redis Proxy en production

**Probleme** : En production sur Dokploy, le 2FA retournait une erreur 500. Les logs montraient `connect ETIMEDOUT` et `Cannot read properties of undefined (reading 'select')`.

**Diagnostic** :
1. Verification des logs applicatifs sur Dokploy
2. Confirmation que Redis etait bien lance et accessible (logs Redis OK)
3. Test de connectivite entre les containers
4. Identification du probleme dans le code Redis lui-meme

**Cause racine** : Le pattern Proxy JavaScript utilise pour l'initialisation lazy de Redis ne preservait pas correctement le contexte `this` de l'instance ioredis.

```javascript
// Code problematique
export const redis = new Proxy({} as Redis, {
  get(_, prop) {
    return getRedisInstance()[prop as keyof Redis];
  },
});
```

Le Proxy interceptait les appels de methodes mais retournait des fonctions non bindees, causant la perte du contexte de l'instance Redis.

**Solution** : Remplacement du Proxy par un objet avec des methodes wrapper explicites qui appellent directement l'instance Redis.

```javascript
// Code corrige
export const redis = {
  get: async (key: string) => getRedis().get(key),
  set: async (key: string, value: string, mode?: string, duration?: number) => {
    if (mode === "EX" && duration) {
      return getRedis().set(key, value, "EX", duration);
    }
    return getRedis().set(key, value);
  },
  del: async (...keys: string[]) => getRedis().del(...keys),
  // ... autres methodes
};
```

**Lecon apprise** : Les patterns JavaScript avances (Proxy, Reflect) peuvent causer des problemes subtils avec des librairies tierces qui dependent du contexte `this`. En production, privilegier des solutions explicites et testables.

### 11.5 Mapping des champs API Carrousel

**Probleme** : Apres avoir configure l'upload d'images sur Cloudflare R2, les images du carrousel ne s'affichaient pas sur le site. Le composant affichait le titre mais pas l'image.

**Diagnostic** :
1. Verification que l'image etait bien uploadee sur R2 (OK)
2. Verification de l'URL stockee en base de donnees (OK)
3. Inspection du composant `hero-carousel.tsx`

**Cause racine** : Le composant front-end utilisait le champ `imageUrl` alors que l'API retournait `image`. Incompatibilite entre le schema de l'API et l'interface TypeScript du composant.

**Solution** : Mise a jour de l'interface TypeScript pour correspondre au schema de l'API :

```typescript
// Avant
interface CarouselSlide {
  imageUrl?: string;
  ctaLink?: string;
}

// Apres
interface CarouselSlide {
  image?: string;
  link?: string | null;
}
```

**Lecon apprise** : Toujours valider la coherence entre le schema de l'API et les interfaces TypeScript cote client. Un typage strict aurait detecte cette erreur a la compilation.

### 11.6 Emojis dans les noms de fichiers images

**Probleme** : Les images uploadees dans le carrousel ne s'affichaient pas lorsque le nom du fichier original contenait des emojis ou des caracteres speciaux. L'URL generee par Cloudflare R2 etait invalide.

**Diagnostic** :
1. Upload d'une image avec emoji dans le nom (ex: `photo 📸 test.jpg`)
2. L'image etait stockee sur R2 mais l'URL contenait des caracteres non encodes
3. Le navigateur ne pouvait pas charger l'image

**Cause racine** : Les noms de fichiers avec emojis ou caracteres speciaux ne sont pas compatibles avec les URLs et causent des erreurs de chargement.

**Solution** : Ajout d'une regex de nettoyage dans `src/lib/r2.ts` avant l'upload :

```javascript
// Nettoyer le nom de fichier (retirer emojis/caracteres speciaux)
const cleanFileName = fileName.replace(/[^\w.-]/g, '_');
const key = `${Date.now()}-${cleanFileName}`;
```

La regex `/[^\w.-]/g` remplace tous les caracteres qui ne sont pas des lettres, chiffres, underscores, points ou tirets par un underscore.

**Lecon apprise** : Toujours sanitizer les noms de fichiers uploades par les utilisateurs avant de les stocker. Les caracteres Unicode (emojis, accents) peuvent causer des problemes d'encodage dans les URLs.

### 11.7 Suppression du provider Apple OAuth

**Probleme** : Le provider Apple Sign In etait configure mais necessitait un compte Apple Developer payant (99$/an) pour fonctionner en production.

**Decision** : Suppression complete du provider Apple pour eviter des erreurs de configuration et simplifier la maintenance.

**Fichiers modifies** :
- `src/lib/auth.ts` : Suppression du provider Apple de la configuration NextAuth
- `src/lib/config/env.ts` : Suppression des variables d'environnement Apple (APPLE_ID, APPLE_SECRET)
- `src/app/(auth)/login/page.tsx` : Suppression du bouton de connexion Apple
- `src/app/(auth)/register/page.tsx` : Suppression du bouton d'inscription Apple

**Lecon apprise** : Avant d'implementer une integration tierce, verifier les couts et prerequis (compte developer, certificats, etc.).

### 11.8 Correction de l'affichage du nom dans le dropdown profil

**Probleme** : Apres une connexion OAuth (Google), le nom/prenom de l'utilisateur n'apparaissait plus dans le dropdown du header, seul l'email s'affichait.

**Diagnostic** :
1. Verification du composant `UserDropdown`
2. Verification que les donnees firstName/lastName etaient bien presentes en session

**Cause racine** : Le composant affichait `session.user.name` qui pouvait etre vide si les champs firstName/lastName etaient remplis separement.

**Solution** : Modification du composant pour construire le nom complet a partir de firstName et lastName :

```typescript
const fullName = session.user.firstName && session.user.lastName
  ? `${session.user.firstName} ${session.user.lastName}`
  : session.user.name;
```

### 11.9 Nettoyage du code mort

**Probleme** : Plusieurs fonctions dans `src/lib/redis.ts` n'etaient jamais utilisees dans le projet, rendant le code plus difficile a maintenir.

**Analyse** : Utilisation de grep pour identifier les fonctions non appelees :
- `invalidateAllUserSessions` : 0 usages
- `getCachedProduct` : 0 usages
- `setCachedProduct` : 0 usages
- `invalidateProductCache` : 0 usages
- `getCachedCategories` : 0 usages
- `setCachedCategories` : 0 usages
- `invalidateCategoriesCache` : 0 usages
- `getCachedSearchResults` : 0 usages
- `setCachedSearchResults` : 0 usages
- `invalidateSearchCache` : 0 usages

**Decision** : Suppression de toutes les fonctions non utilisees, en gardant uniquement :
- `invalidateSession` : Utilisee pour la gestion des sessions
- Les fonctions de base du cache (getCache, setCache, deleteCache)

**Benefice** : Reduction de ~100 lignes de code, meilleure lisibilite, moins de maintenance.

**Lecon apprise** : Appliquer le principe YAGNI (You Aren't Gonna Need It) - ne pas implementer de fonctionnalites "au cas ou".

---

## 12. Pistes d'amelioration

### 12.1 Court terme

- Ajouter un rate limiting compatible Edge Runtime (via Vercel KV ou Upstash)
- Implementer la rotation des tokens JWT
- Ajouter des backup codes pour le 2FA

### 12.2 Moyen terme

- Mettre en place un monitoring centralise (Sentry, Datadog)
- Ajouter des tests d'integration pour l'authentification
- Implementer la detection de connexions suspectes

### 12.3 Long terme

- Migration vers une solution de secrets management (Vault, AWS Secrets Manager)
- Implementation d'un WAF (Web Application Firewall)
- Audit de securite par un tiers

---

## Conclusion

L'infrastructure d'authentification mise en place pour Althea Systems repond aux exigences de securite d'une plateforme e-commerce B2B dans le secteur medical. L'architecture choisie privileggie la scalabilite et la maintenabilite tout en offrant une experience utilisateur fluide.

Les choix techniques (NextAuth, JWT, Redis, Docker) constituent une stack moderne et eprouvee qui facilitera l'evolution de la plateforme.
