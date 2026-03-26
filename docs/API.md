# Documentation API - Althea Systems

Base URL : `http://localhost:3000/api`

Toutes les reponses suivent le format JSON. Les erreurs retournent `{ error: string, message?: string }`.

## Authentification

L'API utilise NextAuth.js avec des sessions JWT. Les routes protegees necessitent un cookie de session valide.

---

## Auth

### POST /api/auth/[...nextauth]
NextAuth.js handler (login/logout/session).

**Providers disponibles :**
- `credentials` (email + password)
- `google` (OAuth)
- `github` (OAuth)

### POST /api/auth/register
Creer un nouveau compte utilisateur.

| Champ | Type | Requis | Validation |
|-------|------|--------|------------|
| `firstName` | string | oui | min 2 caracteres |
| `lastName` | string | oui | min 2 caracteres |
| `email` | string | oui | email valide |
| `password` | string | oui | min 8 chars, 1 majuscule, 1 chiffre |
| `confirmPassword` | string | oui | doit matcher password |

**Reponses :** `201 Created` | `400 Validation Error` | `409 Email deja utilise`

### POST /api/auth/forgot-password
Envoyer un email de reinitialisation de mot de passe.

| Champ | Type | Requis |
|-------|------|--------|
| `email` | string | oui |

**Reponse :** `200` (toujours, pour eviter l'enumeration d'emails)

### POST /api/auth/reset-password
Reinitialiser le mot de passe avec un token.

| Champ | Type | Requis |
|-------|------|--------|
| `token` | string | oui |
| `password` | string | oui |
| `confirmPassword` | string | oui |

### POST /api/auth/verify-email
### GET /api/auth/verify-email?token=xxx
Verifier l'adresse email d'un utilisateur.

### POST /api/auth/2fa/setup
Configurer l'authentification a deux facteurs (TOTP). Retourne un QR code.

**Auth requise :** oui (ADMIN)

### POST /api/auth/2fa/verify
Verifier un code TOTP pour la 2FA.

| Champ | Type | Requis |
|-------|------|--------|
| `code` | string | oui |

---

## Produits

### GET /api/products
Lister les produits avec pagination et filtres.

| Parametre | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page courante |
| `limit` | number | 12 | Produits par page |
| `category` | string | - | Slug categorie |
| `status` | string | - | DRAFT / PUBLISHED |
| `search` | string | - | Recherche texte |
| `sort` | string | - | Champ de tri |
| `order` | string | asc | asc / desc |

### GET /api/products/:id
Recuperer un produit par son ID.

### POST /api/products
Creer un produit. **Auth requise : ADMIN**

### PATCH /api/products/:id
Modifier un produit. **Auth requise : ADMIN**

### GET /api/products/search
Recherche de produits (fulltext).

| Parametre | Type | Description |
|-----------|------|-------------|
| `q` | string | Terme de recherche |

### GET /api/products/featured
Produits mis en avant (featured = true).

### POST /api/products/:id/images
Upload d'images produit vers Cloudflare R2. **Auth requise : ADMIN**

---

## Produits Admin

### GET /api/admin/products
Liste des produits pour l'administration avec filtres avances.

| Parametre | Type | Description |
|-----------|------|-------------|
| `page` | number | Pagination |
| `limit` | number | Limite par page |
| `status` | string | Filtre statut |
| `category` | string | Filtre categorie |
| `search` | string | Recherche |
| `sort` | string | Champ de tri |
| `order` | string | Direction |
| `minPrice` | number | Prix minimum |
| `maxPrice` | number | Prix maximum |

### GET /api/admin/products/:id
Detail produit (admin).

### PUT /api/admin/products/:id
Mise a jour complete d'un produit. **Auth requise : ADMIN**

### DELETE /api/admin/products/:id
Supprimer un produit. **Auth requise : ADMIN**

### PATCH /api/admin/products/bulk
Actions en masse sur les produits (changer statut, categorie).

### DELETE /api/admin/products/bulk
Suppression en masse de produits.

### GET /api/admin/products/export
Exporter les produits au format XLSX (Excel).

---

## Categories

### GET /api/categories
Lister toutes les categories (avec cache Redis).

### POST /api/categories
Creer une categorie. **Auth requise : ADMIN**

### GET /api/categories/:id
Detail d'une categorie.

### PUT /api/categories/:id
Modifier une categorie. **Auth requise : ADMIN**

### PUT /api/categories/reorder
Reordonner les categories (drag & drop). **Auth requise : ADMIN**

---

## Commandes

### GET /api/orders
Lister les commandes de l'utilisateur connecte.

**Auth requise :** oui

### POST /api/orders
Creer une commande.

**Auth requise :** oui

### GET /api/orders/:id
Detail d'une commande.

**Auth requise :** oui (proprietaire ou ADMIN)

### PATCH /api/orders/:id
Modifier le statut d'une commande. **Auth requise : ADMIN**

### GET /api/orders/:id/invoice
Telecharger la facture PDF d'une commande.

---

## Factures

### GET /api/invoices
Lister les factures.

### GET /api/invoices/:id
Detail d'une facture.

### GET /api/invoices/:id/pdf
Telecharger une facture au format PDF.

---

## Avoirs (Credit Notes)

### GET /api/credits
Lister les avoirs. **Auth requise : ADMIN**

### PATCH /api/credits
Creer / modifier un avoir. **Auth requise : ADMIN**

### DELETE /api/credits
Supprimer un avoir. **Auth requise : ADMIN**

---

## Adresses

### GET /api/addresses
Lister les adresses de l'utilisateur connecte.

### POST /api/addresses
Ajouter une adresse.

### GET /api/addresses/:id
Detail d'une adresse.

### PATCH /api/addresses/:id
Modifier une adresse.

### DELETE /api/addresses/:id
Supprimer une adresse.

### POST /api/addresses/:id/set-default
Definir une adresse comme adresse par defaut.

---

## Utilisateurs

### GET /api/users
Lister les utilisateurs. **Auth requise : ADMIN**

### POST /api/users
Creer un utilisateur (admin). **Auth requise : ADMIN**

### GET /api/users/:id
Detail utilisateur. **Auth requise : ADMIN**

### PATCH /api/users/:id
Modifier un utilisateur. **Auth requise : ADMIN**

### DELETE /api/users/:id
Supprimer un utilisateur. **Auth requise : ADMIN**

### GET /api/users/me
Profil de l'utilisateur connecte.

### PUT /api/users/me
Modifier son propre profil.

---

## Methodes de paiement

### POST /api/users/me/payment-methods
Enregistrer une nouvelle methode de paiement (Stripe SetupIntent).

### DELETE /api/users/me/payment-methods/:id
Supprimer une methode de paiement.

### PUT /api/users/me/payment-methods/:id/default
Definir une methode de paiement par defaut.

---

## Profil

### GET /api/profile
Recuperer le profil de l'utilisateur connecte.

### PUT /api/profile
Modifier son profil (nom, email, mot de passe).

---

## Stripe (Paiements)

### POST /api/stripe/checkout
Creer une session de checkout Stripe.

| Champ | Type | Description |
|-------|------|-------------|
| `items` | array | Produits du panier |
| `addressId` | string | Adresse de livraison |

### POST /api/stripe/payment-saved-card
Payer avec une carte enregistree.

### POST /api/stripe/webhook
Webhook Stripe (checkout.session.completed, payment_intent events).

**Note :** Ce endpoint recoit les notifications Stripe et met a jour les commandes/factures.

---

## Panier

### GET /api/cart
Recuperer le panier de l'utilisateur.

### POST /api/cart
Ajouter un produit au panier.

### PUT /api/cart
Modifier la quantite d'un article.

---

## Carousel

### GET /api/carousel
Lister les slides du carousel (page d'accueil).

### POST /api/carousel
Creer un slide. **Auth requise : ADMIN**

### GET /api/carousel/:id
Detail d'un slide.

### PUT /api/carousel/:id
Modifier un slide. **Auth requise : ADMIN**

### DELETE /api/carousel/:id
Supprimer un slide. **Auth requise : ADMIN**

---

## Contact

### GET /api/contact
Lister les messages de contact. **Auth requise : ADMIN**

### POST /api/contact
Envoyer un message de contact.

| Champ | Type | Requis |
|-------|------|--------|
| `name` | string | oui |
| `email` | string | oui |
| `subject` | string | oui |
| `message` | string | oui |

### PUT /api/contact/:id/status
Marquer un message comme lu. **Auth requise : ADMIN**

---

## Upload

### POST /api/upload
Upload de fichier vers Cloudflare R2. **Auth requise : ADMIN**

Accepte : `multipart/form-data` avec champ `file`.
Retourne : `{ url: string }` (URL publique R2).

---

## Dashboard Admin

### GET /api/admin/dashboard/kpis
KPIs du dashboard (CA, commandes, clients, panier moyen).

### GET /api/admin/dashboard/sales-chart
Donnees du graphique de ventes.

| Parametre | Type | Description |
|-----------|------|-------------|
| `period` | string | 7d, 30d, 90d, 1y |

### GET /api/admin/dashboard/category-sales
Repartition des ventes par categorie.

### GET /api/admin/dashboard/cart-analysis
Analyse des paniers (abandon, conversion).

### GET /api/admin/stock/alerts
Alertes de stock bas.

---

## Statistiques

### GET /api/stats
Statistiques generales.

### GET /api/stats/revenue
Statistiques de revenus.

### GET /api/stats/customers
Statistiques clients.

---

## Rate Limiting

Toutes les routes API sont protegees par rate limiting Redis :

| Type de route | Limite | Fenetre |
|---------------|--------|---------|
| `/api/auth/*` | 5 requetes | 60 secondes |
| `/api/admin/*` | 50 requetes | 60 secondes |
| `/api/search` | 30 requetes | 60 secondes |
| Autres `/api/*` | 100 requetes | 60 secondes |

Headers de reponse :
- `X-RateLimit-Limit` : Limite maximale
- `X-RateLimit-Remaining` : Requetes restantes
- `X-RateLimit-Reset` : Timestamp de reinitialisation

Reponse 429 :
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```
