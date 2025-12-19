# Diagrammes Techniques - Althea Systems

**Projet** : Althea Systems - Plateforme e-commerce B2B  
**Date** : 19 decembre 2025

---

## 1. Diagramme d'Architecture Globale

Vue d'ensemble de l'infrastructure technique du projet.

```mermaid
graph TB
    subgraph Client["🖥️ Client (Navigateur)"]
        UI[Interface Next.js<br/>React Components]
        LocalStorage[(LocalStorage<br/>Panier)]
    end

    subgraph Vercel["☁️ Production (Dokploy)"]
        subgraph NextJS["Next.js Application"]
            Pages[Pages & Layouts<br/>/app/*]
            API[API Routes<br/>/api/*]
            Middleware[Middleware<br/>Auth & Protection]
            Auth[NextAuth.js<br/>JWT Sessions]
        end
    end

    subgraph Databases["🗄️ Bases de Données"]
        PostgreSQL[(PostgreSQL<br/>Données principales)]
        MongoDB[(MongoDB<br/>Logs & Sessions)]
        Redis[(Redis<br/>Cache & Rate Limit)]
    end

    subgraph External["🌐 Services Externes"]
        Stripe[Stripe<br/>Paiements]
        R2[Cloudflare R2<br/>Images CDN]
        SMTP[SMTP<br/>Emails]
        OAuth[OAuth Providers<br/>Google & GitHub]
    end

    UI --> Pages
    UI --> API
    LocalStorage --> UI
    Pages --> Middleware
    API --> Middleware
    Middleware --> Auth
    Auth --> PostgreSQL
    Auth --> Redis
    API --> PostgreSQL
    API --> MongoDB
    API --> Redis
    API --> Stripe
    API --> R2
    API --> SMTP
    Auth --> OAuth
```

---

## 2. Diagramme de Flux de Données

Comment les données circulent entre les différents systèmes.

```mermaid
flowchart LR
    subgraph Frontend["Frontend"]
        User((Utilisateur))
        Browser[Navigateur]
    end

    subgraph API["API Routes"]
        AuthAPI[/api/auth/*]
        ProductAPI[/api/products]
        OrderAPI[/api/orders]
        CartAPI[/api/cart]
        ProfileAPI[/api/profile]
        UploadAPI[/api/upload]
    end

    subgraph Cache["Cache Layer"]
        Redis[(Redis)]
    end

    subgraph Storage["Stockage"]
        PG[(PostgreSQL)]
        R2[(Cloudflare R2)]
    end

    subgraph External["Externe"]
        Stripe[Stripe API]
        Email[SMTP]
    end

    User --> Browser
    Browser -->|1. Requête| AuthAPI
    Browser -->|2. Navigation| ProductAPI
    Browser -->|3. Ajout panier| CartAPI
    Browser -->|4. Commande| OrderAPI
    Browser -->|5. Upload image| UploadAPI

    AuthAPI -->|Vérification| Redis
    AuthAPI -->|CRUD User| PG

    ProductAPI -->|Cache hit?| Redis
    ProductAPI -->|Données| PG
    Redis -.->|Cache miss| PG

    CartAPI -->|Session| Redis
    
    OrderAPI -->|Créer commande| PG
    OrderAPI -->|Paiement| Stripe
    OrderAPI -->|Confirmation| Email

    ProfileAPI -->|Update| PG

    UploadAPI -->|Stocker image| R2
    UploadAPI -->|Sauver URL| PG
```

---

## 3. Diagramme de Communication des Services (API)

Interactions entre le frontend et le backend via les API.

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant F as Frontend (React)
    participant M as Middleware
    participant A as API Routes
    participant Auth as NextAuth
    participant DB as PostgreSQL
    participant R as Redis
    participant S as Stripe

    Note over U,S: 🔐 Flux d'Authentification
    U->>F: Clic "Se connecter"
    F->>Auth: POST /api/auth/signin
    Auth->>DB: Vérifier credentials
    DB-->>Auth: User data
    Auth->>R: Stocker session
    Auth-->>F: JWT Token (cookie)
    F-->>U: Redirection dashboard

    Note over U,S: 🛒 Flux de Commande
    U->>F: Ajouter au panier
    F->>F: Stocker localStorage
    U->>F: Checkout
    F->>M: Vérifier auth
    M->>R: Valider session
    R-->>M: Session OK
    M-->>F: Autorisé
    F->>A: POST /api/orders
    A->>DB: Créer commande
    A->>S: Create PaymentIntent
    S-->>A: clientSecret
    A-->>F: Commande + clientSecret
    F->>S: Confirmer paiement
    S-->>F: Paiement réussi
    F->>A: PATCH /api/orders/{id}
    A->>DB: Mettre à jour statut
    A-->>F: Confirmation
    F-->>U: Page succès

    Note over U,S: 🔒 Flux Admin (2FA)
    U->>F: Accès /admin
    F->>M: Vérifier role + 2FA
    M->>R: Check session
    R-->>M: Role=ADMIN, 2FA=false
    M-->>F: Redirect /admin/verify-2fa
    F-->>U: Saisir code TOTP
    U->>F: Code 123456
    F->>A: POST /api/auth/2fa/verify
    A->>DB: Vérifier secret TOTP
    DB-->>A: Valid
    A->>R: Update session (2FA=true)
    A-->>F: Success
    F-->>U: Accès admin autorisé
```

---

## 4. Schéma de la Base de Données (ERD)

Relations entre les entités PostgreSQL.

```mermaid
erDiagram
    User ||--o{ Address : "possede"
    User ||--o{ Order : "passe"
    User ||--o{ Account : "a"
    User ||--o{ Session : "a"
    
    Address ||--o{ Order : "livraison"
    
    Category ||--o{ Product : "contient"
    Category ||--o{ Category : "parent/enfant"
    
    Product ||--o{ OrderItem : "commande"
    
    Order ||--|{ OrderItem : "contient"
    Order ||--o| Invoice : "genere"
    Order ||--o{ CreditNote : "avoir"
    Order ||--o{ OrderStatusHistory : "historique"
    
    Invoice ||--o{ CreditNote : "avoir"
    
    User {
        string id PK
        string email UK
        string password
        string firstName
        string lastName
        enum role
        enum status
        boolean twoFactorEnabled
        datetime lastLoginAt
    }
    
    Product {
        string id PK
        string name
        string slug UK
        decimal price
        enum tva
        int stock
        enum status
        string categoryId FK
    }
    
    Category {
        string id PK
        string name
        string slug UK
        int order
        boolean active
        string parentId FK
    }
    
    Order {
        string id PK
        string orderNumber UK
        string userId FK
        string addressId FK
        enum status
        enum paymentStatus
        datetime paymentDate
        decimal total
    }
    
    OrderItem {
        string id PK
        string orderId FK
        string productId FK
        decimal price
        int quantity
    }
    
    OrderStatusHistory {
        string id PK
        string orderId FK
        enum status
        string changedBy
        datetime createdAt
    }
    
    Invoice {
        string id PK
        string invoiceNumber UK
        string orderId FK
        decimal amount
        enum status
    }
    
    Address {
        string id PK
        string userId FK
        string street
        string city
        string postalCode
        boolean isDefault
    }
    
    CarouselSlide {
        string id PK
        string title
        string image
        int order
        boolean active
    }
    
    ContactMessage {
        string id PK
        string email
        string subject
        boolean read
    }
    
    CreditNote {
        string id PK
        string creditNumber UK
        string orderId FK
        string invoiceId FK
        decimal amount
        enum reason
    }
```

---

## 5. Architecture des Dossiers

Structure du code source.

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages auth (login, register, etc.)
│   ├── (main)/            # Pages publiques (/, /products, etc.)
│   ├── admin/             # Back-office (protégé ADMIN + 2FA)
│   └── api/               # API Routes
│       ├── auth/          # NextAuth + 2FA
│       ├── products/      # CRUD produits
│       ├── orders/        # Gestion commandes
│       ├── users/         # Gestion utilisateurs
│       ├── stripe/        # Webhooks paiement
│       └── ...
├── components/            # Composants React réutilisables
│   ├── ui/               # Composants UI (shadcn)
│   └── ...
├── lib/                  # Utilitaires et configurations
│   ├── auth.ts          # Config NextAuth
│   ├── prisma.ts        # Client Prisma
│   ├── redis.ts         # Client Redis + helpers cache
│   ├── r2.ts            # Upload Cloudflare R2
│   └── config/
│       └── env.ts       # Validation variables env
└── middleware.ts        # Protection routes (auth, admin, 2FA)

prisma/
└── schema.prisma        # Schéma base de données

docker/
├── Dockerfile           # Build multi-stage
└── docker-compose.yml   # Services dev local
```

---

## Légende

| Symbole | Signification |
|---------|---------------|
| `PK` | Primary Key |
| `FK` | Foreign Key |
| `UK` | Unique Key |
| `||--o{` | One-to-Many |
| `||--|{` | One-to-Many (obligatoire) |
| `||--o|` | One-to-One (optionnel) |
