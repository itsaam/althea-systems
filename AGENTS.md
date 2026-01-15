# Guide pour Agents IA - Althea Systems

Plateforme e-commerce B2B pour equipement medical. Next.js 16, React 19, TypeScript 5, Prisma 6, PostgreSQL, Redis.

## Commandes Principales

```bash
# Developpement
npm run dev                 # Serveur dev http://localhost:3000
npm run build               # Build production (prisma generate + next build)
npm run lint                # ESLint
npx tsc --noEmit            # Verification TypeScript

# Base de donnees
npm run db:migrate          # Creer/appliquer migrations
npm run db:push             # Push schema sans migration
npm run db:seed             # Seeder la BDD
npm run db:studio           # GUI Prisma Studio
npm run db:reset            # Reset complet + seed

# Docker (depuis docker/)
docker-compose up -d                    # Services production
docker-compose --profile dev up -d      # + outils dev (adminer, mailhog, redis-commander)
```

## Structure du Projet

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Pages auth (login, register, verify-email)
│   ├── (site)/            # Pages publiques (products, cart, checkout)
│   ├── (account)/         # Pages compte (profile, orders, addresses)
│   ├── admin/             # Dashboard admin (protege 2FA)
│   └── api/               # Routes API REST
├── components/
│   ├── ui/                # Composants shadcn/ui (Button, Dialog, etc.)
│   ├── admin/             # Composants admin
│   ├── products/          # Composants produits
│   └── layout/            # Header, Footer, Sidebar
├── lib/
│   ├── auth.ts            # Config NextAuth
│   ├── prisma.ts          # Client Prisma singleton
│   ├── redis.ts           # Client Redis + helpers cache
│   ├── logger/            # Winston logger + api-wrapper
│   └── validators/        # Schemas Zod
├── stores/                # Zustand (cart-store, ui-store, auth-store)
├── hooks/                 # Hooks React (use-auth, use-cart, use-debounce)
└── types/                 # Types TypeScript + augmentations
```

## Conventions de Code

### Nommage des Fichiers
- **Composants** : kebab-case → `product-card.tsx`, `add-to-cart-button.tsx`
- **Libs/Utils** : kebab-case → `rate-limit.ts`, `api-wrapper.ts`
- **Routes API** : `route.ts` (convention App Router)

### Organisation des Imports
```typescript
// 1. Packages externes
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

// 2. Libs internes (@/)
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { withApiLogger, loggedSuccessResponse, loggedErrorResponse } from "@/lib/logger/exports";

// 3. Composants
import { Button } from "@/components/ui/button";

// 4. Types (import type)
import type { Product } from "@/types/product";
```

### Pattern API Routes
```typescript
import { NextRequest } from "next/server";
import { withApiLogger, loggedSuccessResponse, loggedErrorResponse } from "@/lib/logger/exports";
import { prisma } from "@/lib/prisma";
import { apiLogger, LogMessages } from "@/lib/logger/exports";

export const GET = withApiLogger(async (_req: NextRequest) => {
  try {
    const data = await prisma.product.findMany();
    return loggedSuccessResponse({ products: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    return loggedErrorResponse(`Erreur: ${message}`, 500);
  }
});

export const POST = withApiLogger(async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }
  // ... validation avec Zod puis traitement
});
```

### Composants React
- **Server Components par defaut** (pas de `"use client"`)
- **Client Components** : ajouter `"use client"` uniquement si hooks/events/browser APIs
- **UI** : utiliser shadcn/ui (style "new-york", Radix primitives)

### TypeScript
- Mode strict active (`tsconfig.json`)
- Eviter `any` → utiliser `unknown` + type guards
- Schemas Zod dans `src/lib/validators/` → exporter le type avec `z.infer<>`
- Imports type-only : `import type { ... }`

### Validation Zod
```typescript
import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nom requis"),
  price: z.number().positive("Prix invalide"),
  categoryId: z.string().uuid("ID invalide"),
});

export type ProductInput = z.infer<typeof productSchema>;
```

## Authentification

- **NextAuth** avec JWT (30 jours), providers: Credentials, Google, GitHub
- **2FA obligatoire** pour admins (TOTP via `otplib`)
- **Middleware** (`src/middleware.ts`) protege `/admin/*` et `/profile`, `/orders`, etc.

```typescript
// Verification session dans API
const session = await getServerSession(authOptions);
if (!session) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Non autorise" }, { status: 403 });
```

## Base de Donnees (Prisma)

- **Singleton** : toujours importer depuis `@/lib/prisma`
- **Enums** : `Role`, `UserStatus`, `ProductStatus`, `OrderStatus`, `PaymentStatus`, `TvaRate`
- **Relations** : User → Orders → OrderItems → Products, Categories → Products

```typescript
// Requete avec relations
const order = await prisma.order.findUnique({
  where: { id },
  include: { items: { include: { product: true } }, user: true },
});

// Transaction
await prisma.$transaction([
  prisma.order.create({ data: orderData }),
  prisma.product.update({ where: { id }, data: { stock: { decrement: qty } } }),
]);
```

## Cache Redis

```typescript
import { getCache, setCache, deleteCache } from "@/lib/redis";

const cached = await getCache<Product>(`product:${id}`);
if (cached) return cached;

const product = await prisma.product.findUnique({ where: { id } });
await setCache(`product:${id}`, product, 3600); // TTL 1h
```

## Logging

- **Winston** avec fichiers `logs/combined.log` et `logs/error.log`
- **Messages centralises** dans `LogMessages` (`src/lib/logger/messages.ts`)
- **Loggers par section** : `authLogger`, `apiLogger`, `productLogger`, etc.

```typescript
import { apiLogger, LogMessages } from "@/lib/logger/exports";

apiLogger.info(LogMessages.api.requeteRecue("GET", "/api/products"));
apiLogger.error(LogMessages.api.erreurServeur("Connection failed"));
```

## State Management (Zustand)

```typescript
import { useCartStore } from "@/stores/cart-store";

const { items, addItem, removeItem, clearCart } = useCartStore();
```

Stores disponibles : `cart-store`, `ui-store`, `auth-store` (tous avec persistence localStorage).

## Securite

1. **Secrets** : `.env.local` (jamais commiter)
2. **Validation** : Zod sur toutes les entrees API
3. **Rate limiting** : Redis-based, fail-open si Redis down
4. **Headers** : X-Frame-Options, X-Content-Type-Options, Referrer-Policy (middleware)
5. **2FA** : Obligatoire pour `/admin/*`

## CI/CD (GitHub Actions)

- `ci.yml` : Lint → TypeCheck → Prisma Validate → Build
- Deploy auto sur `main` via Dokploy

## Notes Importantes

- **Pas de framework de tests** configure (prevu : Vitest + Playwright)
- **React Compiler** activé (experimental React 19)
- **Langue** : Français pour UI/logs, anglais pour commentaires techniques
- **Node.js** : >= 20.0.0 requis
- **shadcn/ui** : style "new-york", CSS variables, icônes Lucide
