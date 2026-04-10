# Audit responsive mobile-first

Date : 10 avril 2026
Périmètre : pages publiques principales (home, catalogue, fiche produit,
panier, checkout, auth, compte, contact, search).

## Méthode

Audit manuel du code Tailwind de chaque page et de ses composants. Les
points bloquants ont été corrigés dans le même patch. Les pages déjà
strictement mobile-first (rebuildées récemment dans #42, #43, #44, #77,
#39, #45) sont conformes et ne sont pas listées.

Breakpoints Tailwind utilisés comme référence :

- `sm` : 640 px
- `md` : 768 px
- `lg` : 1024 px
- `xl` : 1280 px

Le test visuel cible a été effectué à 360 px (petit mobile), 414 px
(mobile standard), 768 px (tablette portrait) et 1280 px (desktop).

## Fixes appliqués

### Header / navigation mobile

- **`src/components/layout/mobile-menu.tsx`** — le menu burger affichait
  systématiquement `Connexion` même pour un utilisateur authentifié, et
  ne donnait aucun accès direct à `/profile`, `/orders` ou à la
  déconnexion. Réécrit en session-aware : liens publics, bloc compte
  avec nom/email quand connecté, lien Administration pour les admins,
  bouton Déconnexion. États `loading` gérés avec des skeletons.

### Panier

- **`src/components/cart/cart-item.tsx`** — en dessous de 400 px
  l'image, le bloc texte, le prix et le bouton Supprimer étaient
  compressés sur une seule ligne. Passage à `flex-col sm:flex-row`,
  l'image et les infos restent groupées sur la première rangée, le
  prix et le bouton basculent en seconde ligne sur mobile. Bouton
  Supprimer rendu avec icône seule sur mobile, label complet à partir
  de `sm`. Ajout d'`aria-label` précis sur les boutons +/−/retirer et
  d'`aria-live` sur la quantité.

- **`src/app/(site)/cart/page.tsx`** — titre passé de `text-3xl`
  figé à `text-2xl sm:text-3xl md:text-4xl`, padding vertical passé à
  `py-8 md:py-12` pour aérer sur desktop.

### Catalogue catégories

- **`src/app/(site)/categories/page.tsx`** — titre responsive
  `text-2xl sm:text-3xl md:text-4xl`, grille passée à
  `grid gap-5 sm:grid-cols-2 lg:grid-cols-3` (avant : `grid-cols-1
  md:grid-cols-2 lg:grid-cols-3` — une seule colonne à 640 px alors
  que deux tiennent largement). Hauteur des visuels réduite à `h-40`
  sur mobile pour limiter le scroll (`sm:h-48` au-dessus).

### Fiche produit

- **`src/app/(site)/products/[id]/page.tsx`** — h1 passé à
  `text-2xl sm:text-3xl lg:text-4xl` (évitait un débordement sur
  écrans très étroits pour les noms longs). Prix + prix barré encapsulés
  dans `flex-wrap` pour éviter l'overflow. `gap-8` du grid devient
  `gap-6 md:gap-8 lg:gap-12`. Padding vertical `py-8 md:py-12`.

### Home — top produits

- **`src/components/home/featured-products.tsx`** — header en
  `flex items-end justify-between` sur mobile serrait le titre contre
  le lien "Voir tout" masqué. Passage à
  `flex-col md:flex-row md:items-end`. Titre passe à
  `text-2xl sm:text-3xl md:text-4xl`. Grid gap réduit sur mobile
  (`gap-x-4 sm:gap-x-6`). Skeleton aligné sur les mêmes breakpoints.

## Points vérifiés — déjà conformes

Ces pages ont été inspectées et ne nécessitent pas de changement. Elles
utilisent déjà des grilles responsive explicites et respectent le
principe mobile-first.

- `src/app/(site)/page.tsx` et `src/components/home/categories-grid.tsx`
- `src/app/(site)/search/page.tsx` (refait dans #39)
- `src/app/(site)/contact/page.tsx` (refait dans #45)
- `src/app/(site)/about/page.tsx`, `/cgu`, `/mentions-legales`
  (refaits dans #77)
- `src/app/(site)/checkout/page.tsx` et
  `src/components/checkout/checkout-form.tsx` (refait dans #41,
  `lg:grid-cols-[minmax(0,1fr)_360px]`)
- `src/app/(auth)/layout.tsx` — layout split dark hero + form, avec
  le panneau de gauche masqué en dessous de `lg`
- `src/components/layout/header.tsx` — nav cachée en dessous de `md`,
  MobileMenu prend le relais
- `src/components/layout/footer.tsx` — `md:grid-cols-2 lg:grid-cols-4`,
  barre du bas `flex-col md:flex-row`
- `src/components/account/*` (refaits dans #43, #44)

## Admin

Les tableaux admin (`/admin/orders`, `/admin/users`, `/admin/products`,
`/admin/invoices`) reposent tous sur le composant partagé `DataTable`
qui gère déjà son propre scroll horizontal via
`overflow-x-auto` sur le wrapper. Aucun débordement constaté à 360 px.
Non modifié dans ce patch.

## Recommandations de suivi

- Ajouter un test Playwright visuel multi-viewport sur `/cart`,
  `/products/[id]` et `/categories` pour capter les régressions
  futures (déjà sur la liste E2E #75, hors scope ici).
- Envisager un `container` Tailwind configuré avec `max-width` explicite
  pour éviter les multiples `mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`
  dupliqués dans certains composants.

Refs #83
