# Issues Audit — althea-systems

> Source de vérité pour le rendu final. Dernière MAJ: 2026-04-10
> Repo: https://github.com/itsaam/althea-systems
> Branche analysée: `main` (après merge PR #144)

Chaque issue a été auditée en comparant ses critères d'acceptation au code
réellement présent dans `src/`. Le statut reflète l'état du code, pas celui
de la case cochée dans l'issue GitHub.

## Résumé

- Total issues ouvertes: **41**
- Done (à fermer): **6**
- Partial (à compléter): **22**
- Todo (à implémenter): **10**
- Non-codable (design Figma / charte): **3**

Répartition par label:
- `frontend-public` : 26 issues
- `frontend-admin` : 8 issues
- `backend-api` : 7 issues

## Tableau global

| #   | Label            | Titre                                                         | Statut        | Priorité | Branche proposée                           |
|-----|------------------|---------------------------------------------------------------|---------------|----------|--------------------------------------------|
| 35  | frontend-public  | Page d'accueil avec carrousel (3 slides)                      | Done          | P3       | (fermer)                                   |
| 36  | frontend-public  | Composants produits réutilisables (ProductCard, ProductGrid) | Done          | P3       | (fermer)                                   |
| 37  | frontend-public  | Page catégorie avec liste/grille produits                     | Done          | P3       | (fermer)                                   |
| 38  | frontend-public  | Page produit détail avec carrousel images                     | Done          | P3       | (fermer)                                   |
| 39  | frontend-public  | Page recherche avancée avec facettes et filtres               | Partial       | P2       | feat/issue-39-search-facets                |
| 40  | frontend-public  | Page panier avec gestion quantités                            | Done          | P3       | (fermer)                                   |
| 41  | frontend-public  | Processus checkout multi-étapes (4 étapes)                    | Partial       | P1       | feat/issue-41-checkout-guest                |
| 42  | frontend-public  | Pages inscription et connexion utilisateur                    | Partial       | P2       | feat/issue-42-auth-remember-me              |
| 43  | frontend-public  | Page compte utilisateur (profil, adresses, paiements)         | Partial       | P2       | feat/issue-43-account-email-confirm         |
| 44  | frontend-public  | Page historique commandes avec filtres                        | Partial       | P2       | feat/issue-44-orders-filters                |
| 45  | frontend-public  | Page contact avec formulaire et chatbot                       | Partial       | P3       | feat/issue-45-contact-chatbot               |
| 46  | frontend-public  | Layout principal (Header, Footer, Menu burger)                | Done          | P3       | (fermer)                                   |
| 54  | backend-api      | API Search avec Redis cache et règles de correspondance       | Partial       | P1       | feat/issue-54-search-redis-cache            |
| 56  | backend-api      | Système d'envoi emails                                        | Partial       | P2       | feat/issue-56-email-retry-logs              |
| 60  | frontend-admin   | Gestion catégories - Tableau + drag & drop                    | Done          | P3       | (fermer)                                   |
| 61  | frontend-admin   | Gestion commandes - Tableau avec statuts                      | Partial       | P2       | feat/issue-61-orders-history-log            |
| 62  | frontend-admin   | Gestion utilisateurs - Tableau avec actions admin             | Partial       | P2       | feat/issue-62-users-admin-actions           |
| 63  | frontend-admin   | Gestion factures et avoirs                                    | Partial       | P2       | feat/issue-63-invoices-resend-email         |
| 64  | frontend-admin   | Gestion carrousel homepage                                    | Partial       | P2       | feat/issue-64-carousel-admin-preview        |
| 65  | frontend-admin   | Gestion messages contact et chatbot                           | Partial       | P3       | feat/issue-65-messages-reply                |
| 66  | frontend-admin   | Export CSV/Excel pour tous les tableaux                       | Partial       | P2       | feat/issue-66-export-all-tables             |
| 67  | frontend-public  | i18n Multi-langues (FR, EN, AR, etc.)                         | Partial       | P2       | feat/issue-67-i18n-wire-pages               |
| 68  | frontend-public  | Accessibilité WCAG 2.1 niveau AA                              | Todo          | P2       | feat/issue-68-a11y-audit                    |
| 74  | frontend-public  | Charte graphique et système de design                         | Non-codable   | —        | (fermer / doc)                              |
| 75  | backend-api      | Tests E2E critiques (Playwright)                              | Todo          | P2       | feat/issue-75-playwright-e2e                |
| 77  | frontend-public  | Pages statiques (CGU, Mentions légales, À propos)             | Partial       | P3       | feat/issue-77-legal-content                 |
| 78  | frontend-public  | Page reset password (mot de passe oublié)                     | Done          | P3       | (fermer)                                   |
| 79  | frontend-public  | Notifications utilisateur (toasts, alertes)                   | Done          | P3       | (fermer)                                   |
| 80  | backend-api      | Gestion images produits/catégories                            | Partial       | P3       | feat/issue-80-images-thumbnails             |
| 81  | frontend-public  | Stores Zustand (cart, ui, auth)                               | Done          | P3       | (fermer)                                   |
| 82  | backend-api      | Optimisation recherche avec indexation (MeiliSearch/Algolia)  | Todo          | P3       | feat/issue-82-meilisearch                   |
| 83  | frontend-public  | Responsive design mobile-first                                | Partial       | P2       | feat/issue-83-responsive-audit              |
| 86  | frontend-admin   | Top Produits homepage (sélection backoffice)                  | Partial       | P2       | feat/issue-86-top-products-order            |
| 87  | frontend-public  | Pagination composant réutilisable                             | Done          | P3       | (fermer)                                   |
| 88  | frontend-public  | Composants shadcn/ui personnalisés                            | Done          | P3       | (fermer)                                   |
| 91  | frontend-public  | Maquettes Figma/Design                                        | Non-codable   | —        | (fermer / doc)                              |
| 93  | backend-api      | Système notifications email transactionnels (templates)      | Partial       | P2       | feat/issue-93-email-templates               |
| 94  | frontend-public  | Chatbot intégration (page contact)                            | Partial       | P3       | feat/issue-94-chatbot-backend               |
| 100 | backend-api      | Tests d'intégration API (Supertest)                           | Todo          | P2       | feat/issue-100-supertest                    |
| 104 | frontend-public  | Prototypes et maquettes interactives (Figma)                  | Non-codable   | —        | (fermer / doc)                              |
| 106 | frontend-public  | Réseaux sociaux - Liens et intégrations                       | Todo          | P2       | feat/issue-106-social-links                 |

---

## Détails par issue

### #35 - Page d'accueil avec carrousel (3 slides)
**Statut:** Done
**Fichiers existants:** `src/app/(site)/page.tsx`, `src/components/home/hero-carousel.tsx`, `src/components/home/categories-grid.tsx`, `src/components/home/featured-products.tsx`, `src/components/home/home-text.tsx`, `src/app/admin/homepage/carousel/`, `src/app/api/carousel/`
**Vérifications:** carrousel présent, grille catégories, top produits (featured), texte fixe, admin de carrousel existe.
**Todo restant:** aucun blocker. Peut être fermé.
**Priorité:** P3

### #36 - Composants produits réutilisables (ProductCard, ProductGrid)
**Statut:** Done
**Fichiers existants:** `src/components/products/product-card.tsx`, `product-grid.tsx`, `product-list.tsx`, `stock-badge.tsx`, `similar-products.tsx`
**Vérifications:** ProductCard + ProductGrid + Badge stock + responsive + next/image (à vérifier visuellement).
**Priorité:** P3

### #37 - Page catégorie avec liste/grille produits
**Statut:** Done
**Fichiers existants:** `src/app/(site)/categories/page.tsx`, `src/app/(site)/categories/[slug]/page.tsx`
**Vérifications:** route `[slug]` existe, grille + liste + filtres/sort via `product-filters.tsx`/`product-sort.tsx`.
**Priorité:** P3

### #38 - Page produit détail avec carrousel images
**Statut:** Done
**Fichiers existants:** `src/app/(site)/products/[id]/page.tsx`, `src/components/products/product-carousel.tsx`, `similar-products.tsx`, `src/components/cart/add-to-cart-button.tsx`
**Priorité:** P3

### #39 - Page recherche avancée avec facettes et filtres
**Statut:** Partial
**Fichiers existants:** `src/app/(site)/search/page.tsx`, `src/components/products/product-filters.tsx`, `src/hooks/use-search.ts`, `src/components/shared/search-bar.tsx`, `src/app/api/search/route.ts`
**Manque:**
- Pas de cache Redis côté API (voir #54), performance non garantie < 100ms.
- Règles de correspondance "exacte > 1 char diff > commence par > contient" à vérifier/implémenter.
- Slider prix min/max (composant Slider UI présent mais câblage à confirmer sur la page).
**Priorité:** P2

### #40 - Page panier avec gestion quantités
**Statut:** Done
**Fichiers existants:** `src/app/(site)/cart/page.tsx`, `src/components/cart/cart-drawer.tsx`, `cart-item.tsx`, `cart-summary.tsx`, `src/stores/cart-store.ts`, `src/lib/cart-cookie.ts`
**Vérifications:** store Zustand + persistence + calcul TVA via `src/lib/tva-utils.ts`.
**Priorité:** P3

### #41 - Processus checkout multi-étapes (4 étapes)
**Statut:** Partial
**Fichiers existants:** `src/app/(site)/checkout/page.tsx`, `src/app/(site)/checkout/confirmation/page.tsx`, `src/components/checkout/checkout-steps.tsx`, `address-form.tsx`, `payment-form.tsx`, `order-review.tsx`, `confirmation-details.tsx`, `src/lib/stripe.ts`
**Manque:**
- "Continuer en invité" (guest checkout) à confirmer.
- Indicateur de progression entre étapes à valider visuellement.
**Priorité:** P1 (parcours critique rendu)

### #42 - Pages inscription et connexion utilisateur
**Statut:** Partial
**Fichiers existants:** `src/app/(auth)/register/page.tsx`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/verify-email/page.tsx`, `src/app/api/auth/register/route.ts`, `src/app/api/auth/verify-email/route.ts`, `src/lib/auth.ts` (Google + GitHub providers présents)
**Manque:**
- Case "Se souvenir de moi" (option rememberMe côté NextAuth).
- Redirection vers page privée initiale (callbackUrl) à vérifier.
**Priorité:** P2

### #43 - Page compte utilisateur (profil, adresses, paiements)
**Statut:** Partial
**Fichiers existants:** `src/app/(account)/profile/`, `addresses/`, `payments/`, `orders/`, `src/components/account/*` (profile-form, address-list, payment-methods, password-form)
**Manque:**
- Confirmation par email lors du changement d'email sensible.
- Validation "mot de passe actuel" pour modifs sensibles à confirmer.
**Priorité:** P2

### #44 - Page historique commandes avec filtres
**Statut:** Partial
**Fichiers existants:** `src/app/(account)/orders/`, `src/components/account/order-history.tsx`, `src/app/api/orders/[id]/invoice/route.ts`, `src/app/api/invoices/[id]/pdf/route.ts`
**Manque:**
- Regroupement par année.
- Filtres (année, type produit, statut actif/résilié) à compléter.
- Barre de recherche par nom produit ou date.
**Priorité:** P2

### #45 - Page contact avec formulaire et chatbot
**Statut:** Partial
**Fichiers existants:** `src/app/(site)/contact/page.tsx`, `src/components/contact/contact-form.tsx`, `src/components/contact/chatbot.tsx`, `src/app/api/contact/route.ts`, `src/app/admin/messages/`
**Manque:**
- Chatbot: vraisemblablement UI statique sans moteur (FAQ hardcodées ou bouton visuel). Voir #94.
- Escalade vers humain à confirmer.
**Priorité:** P3

### #46 - Layout principal (Header, Footer, Menu burger)
**Statut:** Done
**Fichiers existants:** `src/components/layout/header.tsx`, `footer.tsx`, `mobile-menu.tsx`
**Remarque:** les liens réseaux sociaux du footer ne sont PAS présents — traité par issue #106.
**Priorité:** P3

### #54 - API Search avec Redis cache et règles de correspondance
**Statut:** Partial
**Fichiers existants:** `src/app/api/search/route.ts`, `src/lib/redis.ts`
**Manque:**
- `src/app/api/search/route.ts` n'importe PAS Redis — aucun cache sur la route search actuellement.
- Règles de correspondance (exacte > typo > prefix > contains) à implémenter/confirmer.
- Invalidation cache à câbler sur mutations produits.
**Priorité:** P1 (perf critique)

### #56 - Système d'envoi emails
**Statut:** Partial
**Fichiers existants:** `src/lib/email.ts`, `resend` dans package.json, templates vérification/reset/confirmation présents (cf. body issue, items cochés)
**Manque (d'après body):**
- Template facture jointe (PDF attaché).
- Logs envois emails (table Email ou fichier log).
- Retry sur erreur.
**Priorité:** P2

### #60 - Gestion catégories - Tableau + drag & drop
**Statut:** Done
**Fichiers existants:** `src/app/admin/categories/page.tsx` (utilise `@dnd-kit`), `src/app/admin/categories/[id]/`, `src/app/admin/categories/new/`, `src/components/admin/category-form.tsx`, `src/components/admin/drag-drop-list.tsx`
**Priorité:** P3

### #61 - Gestion commandes - Tableau avec statuts
**Statut:** Partial
**Fichiers existants:** `src/app/admin/orders/page.tsx`, `src/app/admin/orders/[id]/`, `src/components/admin/order-status-select.tsx`, `src/components/admin/orders/`, `src/app/api/admin/orders/route.ts`, `src/app/api/admin/orders/export/route.ts`
**Manque:**
- Historique des changements de statut avec date + utilisateur auteur.
**Priorité:** P2

### #62 - Gestion utilisateurs - Tableau avec actions admin
**Statut:** Partial
**Fichiers existants:** `src/app/admin/users/page.tsx`, `[id]/`, `src/app/api/admin/users/route.ts`, `export/`
**Manque:**
- Actions admin complètes : envoi mail, reset MDP forcé, désactivation compte, suppression avec avertissement RGPD.
- CA total, nb commandes, dernière connexion affichés dans le tableau.
**Priorité:** P2

### #63 - Gestion factures et avoirs
**Statut:** Partial
**Fichiers existants:** `src/app/admin/invoices/page.tsx`, `[id]/`, `src/app/admin/credits/page.tsx`, `src/components/admin/invoices/`, `src/lib/pdf.tsx`, `src/lib/credit-note-pdf.ts`, `src/app/api/admin/invoices/`, `src/app/api/credits/`
**Manque:**
- Action "Renvoyer par email" explicite depuis l'UI.
- Action "Supprimer facture (crée avoir)" à confirmer.
**Priorité:** P2

### #64 - Gestion carrousel homepage
**Statut:** Partial
**Fichiers existants:** `src/app/admin/homepage/carousel/`, `src/app/admin/homepage/content/`, `src/components/admin/rich-text-editor.tsx`, `src/app/api/carousel/[id]/route.ts`
**Manque:**
- Preview en temps réel côté admin.
- Drag & drop réorganisation des slides (DnDContext à vérifier sur la page carousel).
**Priorité:** P2

### #65 - Gestion messages contact et chatbot
**Statut:** Partial
**Fichiers existants:** `src/app/admin/messages/page.tsx`, `[id]/`, `src/components/admin/messages/`, `src/app/api/admin/messages/`
**Manque:**
- Réponse directe depuis l'interface (envoi email).
- Historique conversation chatbot (dépend #94).
**Priorité:** P3

### #66 - Export CSV/Excel pour tous les tableaux
**Statut:** Partial
**Fichiers existants:** `src/components/admin/export-button.tsx`, `xlsx` dans package.json, routes `api/admin/{products,orders,users,invoices,credits,messages}/export/route.ts`
**Manque:**
- Vérifier que TOUS les tableaux admin exposent bien le bouton d'export (credits, invoices, messages à confirmer UI).
- Papaparse (pour CSV) absent de package.json — xlsx seul suffit si CSV généré via xlsx.
**Priorité:** P2

### #67 - i18n Multi-langues (FR, EN, AR, etc.)
**Statut:** Partial
**Fichiers existants:** `next-intl@4.5.7` installé, `src/i18n/config.ts`, `client.ts`, `request.ts`, `locales/fr.json`, `en.json`, `ar.json`, `src/components/shared/language-switcher.tsx`
**Manque (critique):**
- `next-intl` n'est importé NULLE PART dans `src/app/` — les pages ne sont pas traduites, aucune URL localisée (`/fr/...`).
- RTL pour AR non câblé (`dir` attribute sur `<html>` absent).
- Middleware locale non configuré dans `src/middleware.ts`.
**Priorité:** P2

### #68 - Accessibilité WCAG 2.1 niveau AA
**Statut:** Todo
**Fichiers existants:** shadcn/ui Radix primitives (accessibles par défaut)
**Manque:**
- Aucun audit WCAG effectué. Pas de skip links visibles, labels ARIA à auditer, contrastes à vérifier sur la charte (#00a8b5 sur blanc = risque).
- Tests Lighthouse / axe non automatisés.
**Priorité:** P2

### #74 - Charte graphique et système de design
**Statut:** Non-codable
**Remarque:** le body liste des variables CSS et composants shadcn/ui, mais c'est de la documentation design. Les couleurs sont déjà appliquées (`#003d5c` dans footer, etc.), Poppins/Inter à confirmer dans `tailwind.config` ou `globals.css`. Fermer ou traiter comme doc (README section design).
**Priorité:** —

### #75 - Tests E2E critiques (Playwright)
**Statut:** Todo
**Fichiers existants:** aucun (package `@playwright/test` ABSENT de `package.json`)
**Manque:** tout. À installer, configurer, écrire les 5 scénarios du body.
**Priorité:** P2

### #77 - Pages statiques (CGU, Mentions légales, À propos)
**Statut:** Partial
**Fichiers existants:** `src/app/(site)/cgu/page.tsx`, `src/app/(site)/mentions-legales/page.tsx`, `src/app/(site)/about/page.tsx`, `src/app/(site)/legal/privacy/`
**Manque:**
- Contenu modifiable via backoffice (hardcoded pour l'instant, pas de table Prisma `StaticPage`).
- SEO meta tags par page à confirmer.
**Priorité:** P3

### #78 - Page reset password (mot de passe oublié)
**Statut:** Done
**Fichiers existants:** `src/app/(auth)/forgot-password/page.tsx`, `src/app/(auth)/reset-password/page.tsx`, `src/app/api/auth/forgot-password/route.ts`, `src/app/api/auth/reset-password/route.ts`
**Priorité:** P3

### #79 - Notifications utilisateur (toasts, alertes)
**Statut:** Done
**Fichiers existants:** `sonner@2.0.7` installé, `src/components/ui/sonner.tsx`, `Toaster position="top-right"` dans `src/app/layout.tsx`
**Priorité:** P3

### #80 - Gestion images produits/catégories
**Statut:** Partial
**Fichiers existants:** `src/app/api/upload/route.ts`, `src/app/api/images/upload/`, `src/lib/r2.ts`, `sharp@0.34.5` installé, `src/components/admin/image-upload.tsx`, `multi-image-upload.tsx`
**Manque (body):**
- Optimisation auto WebP/AVIF (sharp présent mais à câbler).
- Génération miniatures.
- Cleanup fichiers orphelins (cron).
**Priorité:** P3

### #81 - Stores Zustand (cart, ui, auth)
**Statut:** Done
**Fichiers existants:** `src/stores/cart-store.ts`, `ui-store.ts`, `auth-store.ts`, `src/hooks/use-cart.ts`
**Priorité:** P3

### #82 - Optimisation recherche avec indexation (MeiliSearch/Algolia)
**Statut:** Todo
**Manque:** aucun service d'indexation installé. Le body est redondant avec #54 (qui lui parle de Redis cache). Soit on choisit MeiliSearch, soit on s'en tient à Prisma + Redis. Recommandation: fermer #82 au profit de #54 si perf < 100ms atteinte via cache.
**Priorité:** P3

### #83 - Responsive design mobile-first
**Statut:** Partial
**Remarque:** le code utilise Tailwind avec breakpoints, composants `mobile-menu.tsx`, hook `use-media-query.ts`. Vérification exhaustive non faite (requiert tests visuels).
**Manque:**
- Audit Lighthouse Mobile à faire.
- Pas de test automatisé de responsive.
**Priorité:** P2

### #86 - Top Produits homepage (sélection backoffice)
**Statut:** Partial
**Fichiers existants:** `src/app/admin/homepage/featured-products/`, champ `featured` dans `prisma/schema.prisma:138`, `src/components/home/featured-products.tsx`
**Manque:**
- Champ `topProductOrder` (ordre d'affichage) PAS dans le schéma — juste un bool `featured`. L'ordre déterministe n'est pas géré.
- Drag & drop côté admin featured-products à confirmer.
**Priorité:** P2

### #87 - Pagination composant réutilisable
**Statut:** Done
**Fichiers existants:** `src/components/ui/pagination.tsx`, `src/components/shared/pagination.tsx`
**Priorité:** P3

### #88 - Composants shadcn/ui personnalisés
**Statut:** Done
**Fichiers existants:** `src/components/ui/` contient button, dialog, input, select, textarea, checkbox, card, badge, avatar, separator, tabs, carousel, dropdown-menu, form, sheet, slider, sonner, switch, table, pagination, skeleton. `components.json` présent (shadcn config).
**Manque mineur:** Accordion, Alert, Command, RadioGroup non listés mais pas bloquants.
**Priorité:** P3

### #91 - Maquettes Figma/Design
**Statut:** Non-codable
**Remarque:** artefacts Figma, pas du code. Fermer ou mettre en lien Figma dans README.
**Priorité:** —

### #93 - Système notifications email transactionnels (templates)
**Statut:** Partial
**Fichiers existants:** `src/lib/email.ts` (Resend), templates basiques (body #56 cochés: vérification, reset, confirmation commande)
**Manque:**
- Template facture jointe (PDF).
- Template changement statut commande.
- Template avoir généré.
- Design responsive HTML + branding (à vérifier dans `email.ts`).
**Priorité:** P2

### #94 - Chatbot intégration (page contact)
**Statut:** Partial
**Fichiers existants:** `src/components/contact/chatbot.tsx` (UI seule)
**Manque:**
- Pas d'intégration Crisp/Botpress/Dialogflow.
- Pas de logique de FAQ ni d'escalade humain.
- Pas d'historique stocké en DB (pas de table `ChatbotConversation`).
**Priorité:** P3

### #100 - Tests d'intégration API (Supertest)
**Statut:** Todo
**Fichiers existants:** `src/tests/unit/` (currency, tva, utils, validators) — unit uniquement, pas d'intégration.
**Manque:** tout. Supertest non installé.
**Priorité:** P2

### #104 - Prototypes et maquettes interactives (Figma)
**Statut:** Non-codable
**Remarque:** doublon de #91, artefacts Figma. Fermer.
**Priorité:** —

### #106 - Réseaux sociaux - Liens et intégrations
**Statut:** Todo
**Fichiers existants:** `src/components/layout/footer.tsx` — aucun lien réseau social vérifié (grep Facebook/Twitter/LinkedIn/Instagram = 0 résultat).
**Manque:**
- Icônes + liens Facebook/Twitter/LinkedIn/Instagram dans footer.
- Boutons partage produit (Facebook/Twitter/LinkedIn/Copier lien) sur page produit.
- Meta Open Graph / Twitter Card (à vérifier dans `layout.tsx` metadata).
**Priorité:** P2

---

## Recommandations priorités P1 (à traiter en premier)

1. **#54** — API Search + Redis cache (blocker perf, mentionné dans spec < 100ms).
2. **#41** — Checkout guest + indicateur progression (parcours critique rendu).
3. **#67** — i18n non câblé alors que dépendances installées (visible pour le jury).
4. **#106** — Réseaux sociaux footer + partage produit (visuellement manquant).
5. **#68** — Audit a11y minimal (Lighthouse + axe pour montrer l'effort WCAG).
