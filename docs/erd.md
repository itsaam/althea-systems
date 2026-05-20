# Diagramme entité-relation — Althea Systems

Annexe au document de cadrage (section 8). Diagramme généré à partir de `prisma/schema.prisma`.

## Vue d'ensemble

17 modèles, regroupés en 5 domaines :

- **Identité et authentification** : `User`, `Account`, `Session`, `VerificationToken`, `BackupCode`
- **Catalogue** : `Category`, `Product`, `CarouselSlide`
- **Commande et facturation** : `Order`, `OrderItem`, `OrderStatusHistory`, `Invoice`, `CreditNote`
- **Carnet d'adresses** : `Address`
- **Relation client** : `ContactMessage`, `ChatbotConversation`, `ChatbotMessage`

## Diagramme Mermaid (erDiagram)

```mermaid
erDiagram
    User ||--o{ Account              : "compte OAuth"
    User ||--o{ Session              : "session NextAuth"
    User ||--o{ BackupCode           : "codes 2FA secours"
    User ||--o{ Address              : "carnet d'adresses"
    User ||--o{ Order                : "passe commande"
    User ||--o{ ChatbotConversation  : "initie"

    Category ||--o{ Category         : "sous-catégorie"
    Category ||--o{ Product          : "regroupe"

    Product  ||--o{ OrderItem        : "vendu dans"

    Address  ||--o{ Order            : "livraison / facturation"

    Order    ||--o{ OrderItem            : "contient"
    Order    ||--o{ OrderStatusHistory   : "historise"
    Order    ||--|| Invoice              : "facturée par"
    Order    ||--o{ CreditNote           : "remboursée par"
    Invoice  ||--o{ CreditNote           : "annule / corrige"

    ChatbotConversation ||--o{ ChatbotMessage : "contient"

    User {
        string  id PK
        string  email UK
        string  password
        string  name
        string  firstName
        string  lastName
        string  phone
        string  stripeCustomerId UK
        Role    role
        UserStatus status
        DateTime emailVerified
        string  image
        string  twoFactorSecret
        boolean twoFactorEnabled
        DateTime lastLoginAt
        DateTime createdAt
        DateTime updatedAt
    }

    Account {
        string  id PK
        string  userId FK
        string  provider
        string  providerAccountId
        string  type
        string  refresh_token
        string  access_token
        int     expires_at
        string  token_type
        string  scope
        string  id_token
        string  session_state
    }

    Session {
        string  id PK
        string  sessionToken UK
        string  userId FK
        DateTime expires
    }

    VerificationToken {
        string  identifier
        string  token UK
        DateTime expires
    }

    BackupCode {
        string  id PK
        string  code
        boolean used
        DateTime usedAt
        string  userId FK
        DateTime createdAt
    }

    Address {
        string  id PK
        string  userId FK
        string  firstName
        string  lastName
        string  street
        string  street2
        string  city
        string  region
        string  postalCode
        string  country
        string  phone
        boolean isDefault
    }

    Category {
        string  id PK
        string  name
        string  slug UK
        string  description
        string  image
        string  parentId FK
        int     order
        boolean active
        DateTime createdAt
        DateTime updatedAt
    }

    Product {
        string  id PK
        string  name
        string  slug UK
        string  description
        string  technicalSpecs
        decimal price
        decimal comparePrice
        TvaRate tva
        string  sku UK
        int     stock
        int     priority
        string  images
        boolean featured
        int     featuredOrder
        ProductStatus status
        string  categoryId FK
        DateTime createdAt
        DateTime updatedAt
    }

    Order {
        string  id PK
        string  orderNumber UK
        string  userId FK
        string  addressId FK
        OrderStatus status
        PaymentStatus paymentStatus
        string  paymentMethod
        string  paymentIntentId
        DateTime paymentDate
        decimal subtotal
        decimal shippingCost
        decimal tax
        decimal total
        string  notes
        DateTime createdAt
        DateTime updatedAt
    }

    OrderItem {
        string  id PK
        string  orderId FK
        string  productId FK
        string  name
        decimal price
        int     quantity
    }

    OrderStatusHistory {
        string  id PK
        string  orderId FK
        OrderStatus status
        string  changedBy
        DateTime createdAt
    }

    Invoice {
        string  id PK
        string  invoiceNumber UK
        string  orderId FK
        string  userId
        decimal amount
        InvoiceStatus status
        string  pdfUrl
        DateTime createdAt
    }

    CreditNote {
        string  id PK
        string  creditNumber UK
        string  orderId FK
        string  invoiceId FK
        decimal amount
        CreditNoteReason reason
        DateTime createdAt
    }

    CarouselSlide {
        string  id PK
        string  title
        string  subtitle
        string  image
        string  link
        int     order
        boolean active
        DateTime createdAt
        DateTime updatedAt
    }

    ContactMessage {
        string  id PK
        string  name
        string  email
        string  subject
        string  message
        boolean read
        DateTime createdAt
    }

    ChatbotConversation {
        string  id PK
        string  sessionId UK
        string  userId FK
        string  userEmail
        ChatbotStatus status
        DateTime createdAt
        DateTime updatedAt
    }

    ChatbotMessage {
        string  id PK
        string  conversationId FK
        ChatbotRole role
        string  content
        DateTime createdAt
    }
```

## Énumérations

| Enum | Valeurs |
|------|---------|
| `Role` | `USER`, `ADMIN` |
| `UserStatus` | `PENDING`, `ACTIVE`, `INACTIVE` |
| `ProductStatus` | `DRAFT`, `PUBLISHED` |
| `TvaRate` | `TVA_20`, `TVA_10`, `TVA_5_5`, `TVA_0` |
| `OrderStatus` | `PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `InvoiceStatus` | `PENDING`, `PAID`, `CANCELLED` |
| `CreditNoteReason` | `CANCELLATION`, `REFUND`, `ERROR` |
| `ChatbotRole` | `USER`, `ASSISTANT`, `SYSTEM` |
| `ChatbotStatus` | `ACTIVE`, `ESCALATED`, `CLOSED` |

## Décisions de modélisation

- **Instantané des prix** : `OrderItem.price` et `OrderItem.name` sont dupliqués depuis `Product`, pour que les commandes restent cohérentes même si le produit est modifié ou supprimé ensuite.
- **Suppression douce des conversations chatbot** : `onDelete: SetNull` sur `ChatbotConversation.userId` — la suppression d'un utilisateur conserve l'historique des échanges (traçabilité support, conformément au CDC §XV).
- **Cascade stricte sur les sous-éléments** : `Account`, `Session`, `BackupCode`, `OrderItem`, `OrderStatusHistory`, `ChatbotMessage` sont supprimés en cascade avec leur entité parente.
- **Catégorie auto-référente** : `Category.parentId` permet une arborescence de catégories (CDC §VI).
- **TVA par produit** : `Product.tva` est un enum (4 taux français), recalculée au moment de la commande.
- **Index métier** : index composites sur `(featured, featuredOrder)`, `(userId, used)` pour les codes de secours, `(conversationId)` et `(createdAt)` sur les messages chatbot pour les requêtes du back-office.
