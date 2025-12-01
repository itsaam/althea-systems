# API Documentation - Althea Systems

Documentation complète de l'API REST de l'application Althea Systems.

## Base URL

```
Development: http://localhost:3000/api
Production: https://???.com/api
```

## Authentification

L'API utilise NextAuth.js pour l'authentification. Les routes protégées nécessitent un cookie de session valide.

### Headers requis

```
Content-Type: application/json
```

---

## 🔐 Auth API

### POST /api/auth/register

Créer un nouveau compte utilisateur.

**Request Body:**

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean@example.com",
  "password": "MonMotDePasse123"
}
```

**Response (201):**

```json
{
  "message": "Compte créé avec succès",
  "user": {
    "id": "clx...",
    "email": "jean@example.com",
    "name": "Jean Dupont"
  }
}
```

**Errors:**

- `400`: Validation error
- `409`: Email already exists

---

### POST /api/auth/forgot-password

Demander un lien de réinitialisation de mot de passe.

**Request Body:**

```json
{
  "email": "jean@example.com"
}
```

**Response (200):**

```json
{
  "message": "Si un compte existe avec cet email, vous recevrez un lien de réinitialisation"
}
```

---

### POST /api/auth/reset-password

Réinitialiser le mot de passe avec un token valide.

**Request Body:**

```json
{
  "token": "abc123...",
  "password": "NouveauMotDePasse123"
}
```

**Response (200):**

```json
{
  "message": "Mot de passe réinitialisé avec succès"
}
```

**Errors:**

- `400`: Token invalide ou expiré

---

### POST /api/auth/verify-email

Vérifier l'email avec un token.

**Request Body:**

```json
{
  "token": "abc123..."
}
```

**Response (200):**

```json
{
  "message": "Email vérifié avec succès"
}
```

---

### GET /api/auth/verify-email?token=xxx

Vérifier l'email via lien (depuis l'email).

**Response:** Redirection vers `/verify-email?success=true` ou `/verify-email?error=xxx`

---

## 🔒 2FA API (Admin)

### POST /api/auth/2fa/setup

Initialiser la configuration 2FA. Requiert authentification admin.

**Response (200):**

```json
{
  "secret": "ABCDEF123456",
  "otpauthUrl": "otpauth://totp/AltheaSystems:user@email.com?secret=...",
  "message": "Scannez le QR code avec votre application d'authentification"
}
```

---

### POST /api/auth/2fa/verify

Vérifier un code 2FA.

**Request Body:**

```json
{
  "code": "123456",
  "isSetup": true
}
```

**Response (200):**

```json
{
  "message": "2FA activé avec succès",
  "enabled": true
}
```

---

## 👤 Users API

### GET /api/users

Liste tous les utilisateurs (Admin only).

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role (USER, ADMIN)

**Response (200):**

```json
{
  "users": [...],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

---

### GET /api/users/:id

Obtenir un utilisateur spécifique.

**Response (200):**

```json
{
  "id": "clx...",
  "email": "jean@example.com",
  "firstName": "Jean",
  "lastName": "Dupont",
  "role": "USER",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

---

### PUT /api/users/:id

Mettre à jour un utilisateur.

**Request Body:**

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+33612345678"
}
```

---

## 📦 Products API

### GET /api/products

Liste tous les produits.

**Query Parameters:**

- `page` (number): Page number
- `limit` (number): Items per page
- `search` (string): Search by name
- `category` (string): Filter by category ID
- `featured` (boolean): Filter featured products
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `sort` (string): Sort field (price, name, createdAt)
- `order` (string): Sort order (asc, desc)

**Response (200):**

```json
{
  "products": [...],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
```

---

### GET /api/products/:id

Obtenir un produit spécifique.

---

### POST /api/products (Admin)

Créer un nouveau produit.

**Request Body:**

```json
{
  "name": "Produit Test",
  "slug": "produit-test",
  "description": "Description du produit",
  "price": 29.99,
  "stock": 100,
  "categoryId": "clx...",
  "images": ["url1", "url2"],
  "featured": false
}
```

---

### PUT /api/products/:id (Admin)

Mettre à jour un produit.

---

### DELETE /api/products/:id (Admin)

Supprimer un produit.

---

## 📁 Categories API

### GET /api/categories

Liste toutes les catégories.

**Response (200):**

```json
{
  "categories": [
    {
      "id": "clx...",
      "name": "Électronique",
      "slug": "electronique",
      "children": [...]
    }
  ]
}
```

---

### POST /api/categories (Admin)

Créer une catégorie.

---

### PUT /api/categories/:id (Admin)

Mettre à jour une catégorie.

---

### DELETE /api/categories/:id (Admin)

Supprimer une catégorie.

---

## 🛒 Cart API

### GET /api/cart

Obtenir le panier de l'utilisateur connecté.

---

### POST /api/cart

Ajouter un item au panier.

**Request Body:**

```json
{
  "productId": "clx...",
  "quantity": 2
}
```

---

### PUT /api/cart/:itemId

Mettre à jour la quantité d'un item.

---

### DELETE /api/cart/:itemId

Supprimer un item du panier.

---

## 🧾 Orders API

### GET /api/orders

Liste les commandes de l'utilisateur (ou toutes pour admin).

---

### GET /api/orders/:id

Obtenir une commande spécifique.

---

### POST /api/orders

Créer une nouvelle commande.

**Request Body:**

```json
{
  "addressId": "clx...",
  "paymentMethod": "stripe",
  "notes": "Sonner à l'interphone"
}
```

---

### PUT /api/orders/:id/status (Admin)

Mettre à jour le statut d'une commande.

**Request Body:**

```json
{
  "status": "SHIPPED",
  "trackingNumber": "ABC123"
}
```

---

## 📍 Addresses API

### GET /api/addresses

Liste les adresses de l'utilisateur.

---

### POST /api/addresses

Ajouter une adresse.

**Request Body:**

```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "street": "123 Rue Example",
  "city": "Paris",
  "postalCode": "75001",
  "country": "France",
  "phone": "+33612345678",
  "isDefault": true
}
```

---

### PUT /api/addresses/:id

Mettre à jour une adresse.

---

### DELETE /api/addresses/:id

Supprimer une adresse.

---

## 💳 Stripe API

### POST /api/stripe/create-payment-intent

Créer un PaymentIntent Stripe.

**Request Body:**

```json
{
  "orderId": "clx..."
}
```

**Response (200):**

```json
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

---

### POST /api/stripe/webhook

Webhook Stripe pour les événements de paiement.

---

## 📊 Stats API (Admin)

### GET /api/stats

Obtenir les statistiques du dashboard.

**Response (200):**

```json
{
  "totalSales": 12500.00,
  "totalOrders": 150,
  "totalUsers": 500,
  "totalProducts": 75,
  "recentOrders": [...],
  "salesByMonth": [...],
  "topProducts": [...]
}
```

---

## 📞 Contact API

### POST /api/contact

Envoyer un message de contact.

**Request Body:**

```json
{
  "name": "Jean Dupont",
  "email": "jean@example.com",
  "subject": "Question",
  "message": "Mon message..."
}
```

---

## 🖼️ Upload API

### POST /api/upload

Uploader une image.

**Request:** FormData avec champ `file`

**Response (200):**

```json
{
  "url": "/images/products/xxx.jpg",
  "filename": "xxx.jpg"
}
```

---

## 🔍 Search API

### GET /api/search

Recherche globale (produits).

**Query Parameters:**

- `q` (string): Query de recherche
- `limit` (number): Nombre de résultats

**Response (200):**

```json
{
  "results": [...],
  "total": 10
}
```

---

## Codes d'erreur

| Code | Description           |
| ---- | --------------------- |
| 200  | Succès                |
| 201  | Créé avec succès      |
| 400  | Requête invalide      |
| 401  | Non authentifié       |
| 403  | Accès interdit        |
| 404  | Ressource non trouvée |
| 409  | Conflit (doublon)     |
| 500  | Erreur serveur        |

## Rate Limiting

L'API implémente un rate limiting via Redis :

- 100 requêtes par minute pour les utilisateurs authentifiés
- 20 requêtes par minute pour les utilisateurs anonymes

Headers de réponse :

```
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1699999999
```
