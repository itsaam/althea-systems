export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Althea Systems API",
    version: "1.0.0",
    description: "Documentation de l'API Althea Systems",
  },
  servers: [
    { url: "http://localhost:3000", description: "Développement" },
    { url: "https://althea.vjuya.me", description: "Production" },
  ],
  components: {
    securitySchemes: {
      sessionAuth: {
        type: "apiKey",
        in: "cookie",
        name: "next-auth.session-token",
        description: "Session NextAuth (cookie)",
      },
    },
    schemas: {
      Pagination: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 20 },
          total: { type: "integer", example: 100 },
          totalPages: { type: "integer", example: 5 },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Message d'erreur" },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: { type: "string", example: "clx1234" },
          name: { type: "string", example: "Électronique" },
          slug: { type: "string", example: "electronique" },
          description: { type: "string", nullable: true },
          image: { type: "string", nullable: true },
          parentId: { type: "string", nullable: true },
          order: { type: "integer", example: 0 },
          active: { type: "boolean", example: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string", example: "MacBook Pro 14" },
          slug: { type: "string", example: "macbook-pro-14" },
          description: { type: "string", nullable: true },
          price: { type: "number", example: 1999.99 },
          comparePrice: { type: "number", nullable: true },
          tva: { type: "string", enum: ["TVA_20", "TVA_10", "TVA_5_5", "TVA_0"] },
          sku: { type: "string", nullable: true },
          stock: { type: "integer", example: 10 },
          featured: { type: "boolean" },
          status: { type: "string", enum: ["DRAFT", "PUBLISHED"] },
          images: { type: "array", items: { type: "string" } },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          orderNumber: { type: "string", example: "ORD-202603-1234" },
          userId: { type: "string" },
          status: {
            type: "string",
            enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
          },
          paymentStatus: { type: "string", enum: ["PENDING", "PAID", "FAILED", "REFUNDED"] },
          subtotal: { type: "number" },
          shippingCost: { type: "number" },
          tax: { type: "number" },
          total: { type: "number" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Invoice: {
        type: "object",
        properties: {
          id: { type: "string" },
          invoiceNumber: { type: "string", example: "INV-202603-0001" },
          orderId: { type: "string" },
          userId: { type: "string" },
          amount: { type: "number" },
          status: { type: "string", enum: ["PENDING", "PAID", "CANCELLED"] },
          pdfUrl: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      CreditNote: {
        type: "object",
        properties: {
          id: { type: "string" },
          creditNumber: { type: "string", example: "AVOIR-2603-1410" },
          orderId: { type: "string" },
          invoiceId: { type: "string", nullable: true },
          amount: { type: "number" },
          reason: { type: "string", enum: ["CANCELLATION", "REFUND", "ERROR"] },
          createdAt: { type: "string", format: "date-time" },
        },
      },
    },
  },
  paths: {
    // ─── CATEGORIES ───────────────────────────────────────────
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Liste toutes les catégories",
        responses: {
          200: {
            description: "Liste des catégories",
            content: {
              "application/json": {
                example: { categories: [{ id: "clx1234", name: "Électronique", slug: "electronique", active: true }] },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Créer une catégorie",
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "slug"],
                properties: {
                  name: { type: "string", example: "Électronique" },
                  slug: { type: "string", example: "electronique" },
                  description: { type: "string" },
                  image: { type: "string" },
                  active: { type: "boolean", default: true },
                  parentId: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Catégorie créée" },
          400: { description: "Données invalides" },
          403: { description: "Non autorisé" },
        },
      },
    },
    "/api/categories/reorder": {
      put: {
        tags: ["Categories"],
        summary: "Réordonner les catégories",
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: { type: "object", properties: { id: { type: "string" }, order: { type: "integer" } } },
                  },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Ordre mis à jour" } },
      },
    },
    "/api/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Récupérer une catégorie",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Catégorie trouvée" }, 404: { description: "Non trouvée" } },
      },
      put: {
        tags: ["Categories"],
        summary: "Modifier une catégorie",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  slug: { type: "string" },
                  description: { type: "string" },
                  active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Catégorie mise à jour" }, 404: { description: "Non trouvée" } },
      },
      delete: {
        tags: ["Categories"],
        summary: "Supprimer une catégorie",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Supprimée" }, 404: { description: "Non trouvée" } },
      },
    },

    // ─── PRODUCTS ─────────────────────────────────────────────
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Liste les produits",
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "featured", in: "query", schema: { type: "boolean" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["DRAFT", "PUBLISHED"] } },
          { name: "categoryId", in: "query", schema: { type: "string" } },
        ],
        responses: {
          200: {
            description: "Liste des produits",
            content: {
              "application/json": {
                example: { products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Créer un produit",
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                name: "MacBook Pro 14",
                slug: "macbook-pro-14",
                description: "Laptop Apple M3",
                price: 1999.99,
                comparePrice: 2199.99,
                sku: "MBP-14-M3",
                stock: 10,
                images: [],
                featured: true,
                status: "PUBLISHED",
                tva: "TVA_20",
                priority: 1,
              },
            },
          },
        },
        responses: { 200: { description: "Produit créé" }, 400: { description: "Données invalides" } },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Récupérer un produit",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Produit trouvé" }, 404: { description: "Non trouvé" } },
      },
      patch: {
        tags: ["Products"],
        summary: "Modifier un produit",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: { type: "object", properties: { name: { type: "string" }, price: { type: "number" }, stock: { type: "integer" } } },
            },
          },
        },
        responses: { 200: { description: "Produit mis à jour" }, 404: { description: "Non trouvé" } },
      },
      delete: {
        tags: ["Products"],
        summary: "Supprimer un produit",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Supprimé" }, 404: { description: "Non trouvé" } },
      },
    },
    "/api/products/{id}/images": {
      post: {
        tags: ["Products"],
        summary: "Upload une image produit",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "multipart/form-data": { schema: { type: "object", properties: { file: { type: "string", format: "binary" } } } } },
        },
        responses: { 200: { description: "Image uploadée" } },
      },
    },

    // ─── ORDERS ───────────────────────────────────────────────
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Liste les commandes",
        parameters: [
          { name: "userId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Liste des commandes" } },
      },
      post: {
        tags: ["Orders"],
        summary: "Créer une commande",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                userId: "cmlhx3vsf0000fwa8uxs9shol",
                addressId: "addr-test-99",
                items: [{ productId: "prod-test-99", quantity: 1 }],
                paymentMethod: "card",
              },
            },
          },
        },
        responses: { 200: { description: "Commande créée" }, 400: { description: "Stock insuffisant ou données invalides" } },
      },
    },
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Récupérer une commande",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Commande trouvée" }, 404: { description: "Non trouvée" } },
      },
      patch: {
        tags: ["Orders"],
        summary: "Modifier le statut d'une commande",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              example: { status: "CONFIRMED" },
            },
          },
        },
        responses: { 200: { description: "Commande mise à jour" } },
      },
      delete: {
        tags: ["Orders"],
        summary: "Annuler une commande (restaure le stock)",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Commande annulée" }, 400: { description: "Impossible d'annuler" } },
      },
    },

    // ─── STRIPE ───────────────────────────────────────────────
    "/api/stripe/checkout": {
      post: {
        tags: ["Stripe"],
        summary: "Créer une session de paiement Stripe",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                userId: "cmlhx3vsf0000fwa8uxs9shol",
                orderId: "ORDER_ID",
                items: [
                  {
                    price_data: {
                      currency: "eur",
                      unit_amount: 19999,
                      product_data: { name: "MacBook Pro 14", metadata: { productId: "prod-id" } },
                    },
                    quantity: 1,
                  },
                ],
              },
            },
          },
        },
        responses: {
          200: {
            description: "URL de paiement Stripe",
            content: { "application/json": { example: { url: "https://checkout.stripe.com/...", currency: "eur" } } },
          },
          400: { description: "Stock insuffisant ou commande déjà payée" },
          404: { description: "Commande ou user non trouvé" },
        },
      },
    },
    "/api/stripe/webhook": {
      post: {
        tags: ["Stripe"],
        summary: "Webhook Stripe (usage interne)",
        description: "Endpoint appelé par Stripe après paiement. Crée la facture et génère le PDF.",
        responses: { 200: { description: "OK" } },
      },
    },

    // ─── INVOICES ─────────────────────────────────────────────
    "/api/invoices": {
      get: {
        tags: ["Invoices"],
        summary: "Liste les factures",
        parameters: [
          { name: "userId", in: "query", schema: { type: "string" } },
          { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "PAID", "CANCELLED"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Liste des factures" } },
      },
    },
    "/api/invoices/{id}": {
      get: {
        tags: ["Invoices"],
        summary: "Récupérer une facture",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Facture trouvée" }, 404: { description: "Non trouvée" } },
      },
      delete: {
        tags: ["Invoices"],
        summary: "Annuler une facture et créer un avoir automatiquement",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              example: { reason: "CANCELLATION" },
              schema: {
                type: "object",
                properties: { reason: { type: "string", enum: ["CANCELLATION", "REFUND", "ERROR"], default: "CANCELLATION" } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Facture annulée et avoir créé",
            content: {
              "application/json": {
                example: {
                  message: "Facture annulée et avoir créé",
                  creditNote: { id: "cn_id", creditNumber: "AVOIR-2603-1410", amount: 239.99, reason: "CANCELLATION" },
                },
              },
            },
          },
          400: { description: "Facture déjà annulée ou avoir existant" },
          404: { description: "Non trouvée" },
        },
      },
    },
    "/api/invoices/{id}/download": {
      get: {
        tags: ["Invoices"],
        summary: "Télécharger le PDF de la facture",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Fichier PDF", content: { "application/pdf": {} } },
          404: { description: "Facture non trouvée" },
        },
      },
    },

    // ─── CREDITS ──────────────────────────────────────────────
    "/api/credits": {
      get: {
        tags: ["Credits (Avoirs)"],
        summary: "Liste les avoirs",
        parameters: [
          { name: "userId", in: "query", schema: { type: "string" } },
          { name: "reason", in: "query", schema: { type: "string", enum: ["CANCELLATION", "REFUND", "ERROR"] } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Liste des avoirs" } },
      },
    },
    "/api/credits/{id}": {
      get: {
        tags: ["Credits (Avoirs)"],
        summary: "Récupérer un avoir",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Avoir trouvé" }, 404: { description: "Non trouvé" } },
      },
      patch: {
        tags: ["Credits (Avoirs)"],
        summary: "Modifier un avoir",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  amount: { type: "number" },
                  reason: { type: "string", enum: ["CANCELLATION", "REFUND", "ERROR"] },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Avoir mis à jour" } },
      },
      delete: {
        tags: ["Credits (Avoirs)"],
        summary: "Supprimer un avoir",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Avoir supprimé" } },
      },
    },
    "/api/credits/{id}/download": {
      get: {
        tags: ["Credits (Avoirs)"],
        summary: "Télécharger le PDF de l'avoir",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Fichier PDF avoir", content: { "application/pdf": {} } },
          404: { description: "Avoir non trouvé" },
        },
      },
    },

    // ─── ADDRESSES ────────────────────────────────────────────
    "/api/addresses": {
      get: {
        tags: ["Addresses"],
        summary: "Liste les adresses de l'utilisateur connecté",
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: "userId", in: "query", description: "Admin seulement", schema: { type: "string" } },
        ],
        responses: {
          200: { description: "Liste des adresses" },
          401: { description: "Non authentifié" },
        },
      },
      post: {
        tags: ["Addresses"],
        summary: "Créer une adresse",
        security: [{ sessionAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: {
                firstName: "Jean",
                lastName: "Dupont",
                street: "12 rue de la Paix",
                city: "Paris",
                postalCode: "75001",
                country: "France",
                isDefault: true,
              },
            },
          },
        },
        responses: {
          201: { description: "Adresse créée" },
          400: { description: "Données invalides" },
          401: { description: "Non authentifié" },
        },
      },
    },
    "/api/addresses/{id}": {
      get: {
        tags: ["Addresses"],
        summary: "Récupérer une adresse",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Adresse trouvée" }, 403: { description: "Accès interdit" }, 404: { description: "Non trouvée" } },
      },
      patch: {
        tags: ["Addresses"],
        summary: "Modifier une adresse",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  street: { type: "string" },
                  city: { type: "string" },
                  postalCode: { type: "string" },
                  isDefault: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: { 200: { description: "Adresse mise à jour" }, 403: { description: "Accès interdit" } },
      },
      delete: {
        tags: ["Addresses"],
        summary: "Supprimer une adresse",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          200: { description: "Adresse supprimée" },
          400: { description: "Adresse utilisée dans des commandes" },
          403: { description: "Accès interdit" },
        },
      },
    },
    "/api/addresses/{id}/default": {
      post: {
        tags: ["Addresses"],
        summary: "Définir une adresse par défaut",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Adresse définie par défaut" }, 404: { description: "Non trouvée" } },
      },
    },

    // ─── USERS ────────────────────────────────────────────────
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Liste les utilisateurs (Admin)",
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
        ],
        responses: { 200: { description: "Liste des utilisateurs" }, 403: { description: "Non autorisé" } },
      },
      post: {
        tags: ["Users"],
        summary: "Créer un utilisateur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { email: "user@example.com", password: "password123", firstName: "Jean", lastName: "Dupont" },
            },
          },
        },
        responses: { 201: { description: "Utilisateur créé" }, 400: { description: "Email déjà utilisé" } },
      },
    },
    "/api/users/me": {
      get: {
        tags: ["Users"],
        summary: "Profil de l'utilisateur connecté",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Profil utilisateur avec adresses et moyens de paiement",
            content: {
              "application/json": {
                example: { id: "user_id", email: "user@example.com", firstName: "Jean", paymentMethods: [], currency: "eur" },
              },
            },
          },
          401: { description: "Non autorisé" },
        },
      },
      put: {
        tags: ["Users"],
        summary: "Modifier le profil",
        security: [{ sessionAuth: [] }],
        requestBody: {
          content: {
            "application/json": {
              example: { firstName: "Jean", lastName: "Dupont", phone: "+33612345678" },
            },
          },
        },
        responses: { 200: { description: "Profil mis à jour" }, 400: { description: "Mot de passe incorrect" } },
      },
    },
    "/api/users/me/payment-methods": {
      post: {
        tags: ["Users"],
        summary: "Initier l'ajout d'une carte (Setup Intent Stripe)",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Setup Intent créé",
            content: { "application/json": { example: { clientSecret: "seti_...", setupIntentId: "seti_..." } } },
          },
        },
      },
    },
    "/api/users/me/payment-methods/{id}": {
      delete: {
        tags: ["Users"],
        summary: "Supprimer une carte de paiement",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Payment Method ID Stripe" }],
        responses: { 200: { description: "Carte supprimée" }, 404: { description: "Carte non trouvée" } },
      },
    },
    "/api/users/me/payment-methods/{id}/default": {
      put: {
        tags: ["Users"],
        summary: "Définir une carte comme défaut",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { 200: { description: "Carte définie par défaut" } },
      },
    },

    // ─── STATS ────────────────────────────────────────────────
    "/api/stats": {
      get: {
        tags: ["Stats"],
        summary: "Statistiques dashboard admin",
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: "period", in: "query", description: "Nombre de jours", schema: { type: "integer", default: 30 } },
        ],
        responses: {
          200: {
            description: "Vue d'ensemble, ventes par jour, top produits, commandes par statut",
            content: {
              "application/json": {
                example: {
                  overview: { totalUsers: 100, totalOrders: 50, totalRevenue: 9999.99, pendingOrders: 5 },
                  salesByDay: [],
                  topProducts: [],
                  ordersByStatus: [],
                  recentOrders: [],
                },
              },
            },
          },
          403: { description: "Non autorisé" },
        },
      },
    },
    "/api/stats/revenue": {
      get: {
        tags: ["Stats"],
        summary: "Statistiques de revenus",
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: "period", in: "query", schema: { type: "string", enum: ["week", "month", "year"], default: "month" } },
        ],
        responses: {
          200: {
            description: "Revenus par période avec comparaison",
            content: {
              "application/json": {
                example: {
                  revenue: [],
                  comparison: { current: { revenue: 0, orders: 0 }, previous: { revenue: 0, orders: 0 }, growth: { revenue: 0, orders: 0 } },
                },
              },
            },
          },
          403: { description: "Non autorisé" },
        },
      },
    },
    "/api/stats/customers": {
      get: {
        tags: ["Stats"],
        summary: "Statistiques clients",
        security: [{ sessionAuth: [] }],
        responses: {
          200: {
            description: "Top clients, nouveaux clients par mois, taux de rétention",
            content: {
              "application/json": {
                example: {
                  topCustomers: [],
                  newCustomersByMonth: [],
                  retention: { total: 0, repeat: 0, rate: 0 },
                },
              },
            },
          },
          403: { description: "Non autorisé" },
        },
      },
    },

    // ─── CONTACT ──────────────────────────────────────────────
    "/api/contact": {
      get: {
        tags: ["Contact"],
        summary: "Liste les messages de contact (Admin)",
        security: [{ sessionAuth: [] }],
        parameters: [
          { name: "read", in: "query", schema: { type: "boolean" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
        ],
        responses: { 200: { description: "Liste des messages" }, 403: { description: "Non autorisé" } },
      },
      post: {
        tags: ["Contact"],
        summary: "Envoyer un message de contact",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { name: "Jean Dupont", email: "jean@example.com", subject: "Question", message: "Bonjour, j'ai une question..." },
            },
          },
        },
        responses: {
          201: { description: "Message envoyé" },
          400: { description: "Données invalides" },
          429: { description: "Trop de messages envoyés" },
        },
      },
    },
    "/api/contact/{id}": {
      put: {
        tags: ["Contact"],
        summary: "Marquer un message comme lu/non lu (Admin)",
        security: [{ sessionAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          content: { "application/json": { example: { read: true } } },
        },
        responses: { 200: { description: "Statut mis à jour" }, 403: { description: "Non autorisé" } },
      },
    },
  },
};