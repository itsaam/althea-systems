# Audit accessibilité — WCAG 2.1 AA

**Scope** : pages publiques (home, categories, product detail, cart, checkout, login, register, contact) et composants partagés (Header, Footer, MobileMenu, layout racine).

**Date** : 2026-04-10
**Référentiel** : [WCAG 2.1 niveau AA](https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aa)

---

## Fixes appliqués dans cette PR

### Structure & navigation

| Élément | Problème | Fix | Critère WCAG |
|---|---|---|---|
| Layout racine `(site)/layout.tsx` | Aucun skip link, pas d'ID sur `<main>` | Ajout d'un lien "Aller au contenu principal" visible au focus (`sr-only focus:not-sr-only`), `<main id="main-content" tabIndex={-1}>` comme cible | 2.4.1 Contourner des blocs |
| `Header` — `<nav>` desktop | Pas de `aria-label`, pas d'indication de page active | `aria-label="Navigation principale"` + `aria-current="page"` sur le lien actif (via `usePathname`), styling `aria-[current=page]` | 2.4.8, 4.1.2 |
| `MobileMenu` — trigger | `<span class="sr-only">Menu</span>` + SVG inline sans titre | `aria-label="Ouvrir le menu principal"` sur le Button, `aria-expanded={open}`, icône Lucide `<Menu aria-hidden>` | 4.1.2, 2.4.4 |
| `MobileMenu` — Sheet | Pas de titre accessible sur le dialog | `<SheetTitle className="sr-only">Menu principal</SheetTitle>` | 4.1.2, 2.4.6 |
| `MobileMenu` — `<nav>` | Pas de `aria-label`, pas de `aria-current` | `aria-label="Navigation mobile"`, `aria-current` sur lien actif | 2.4.8 |
| `Footer` | `<h3>` orphelins sans `<nav>`, sections non rattachées | Passage des 3 blocs nav en `<nav aria-labelledby>`, `<h2 id="footer-heading" className="sr-only">`, `<address>` pour les coordonnées | 1.3.1, 2.4.6 |

### Boutons icônes — aria-label manquants

| Bouton | Avant | Après |
|---|---|---|
| Header — Recherche | Icône seule, aucun label | `aria-label={searchOpen ? "Fermer la recherche" : "Ouvrir la recherche"}`, `aria-expanded`, `aria-controls="site-search"` |
| Header — Panier | `<Link><Button>` avec icône seule (+ anchor>button nesting invalide) | Restructuré en `<Button asChild><Link aria-label="Panier, N articles">`, plus de nesting invalide |
| Header — Avatar user | Icon-only trigger sans label | `aria-label="Menu utilisateur de {name}"` |
| Header — Skeleton loading | `<div>` muet | `role="status" aria-label="Chargement de la session"` |

### Images

| Lieu | Fix |
|---|---|
| `Header` Avatar | `AvatarImage alt=""` (décoratif, le label est porté par le trigger parent) au lieu de dupliquer le nom |
| Icônes décoratives | `aria-hidden="true"` systématique sur les `<Mail />`, `<Phone />`, `<ShoppingBag />`, `<Search />`, `<User />`, `<Package />`, `<LogOut />`, `<Settings />`, `<Menu />`, `<MapPin />` |
| Badges paiement Footer | Groupe `<div aria-hidden="true">` (décoratif, l'info est déjà dans le texte "Paiement sécurisé") |

### Contrastes

| Élément | Avant | Après | Ratio approx. |
|---|---|---|---|
| Header — nav links | `text-muted-foreground` (oklch 0.556) sur background blanc (~4.5:1 borderline) | `text-foreground/70` (oklch 0.145 @ 70% = plus contrasté) | ≥ 5.3:1 |
| Header — search/cart icon buttons | `text-muted-foreground` | `text-foreground/70` | ≥ 5.3:1 |
| Footer — tout le texte `text-white/70` sur `#003d5c` | ~3.8:1 (échec AA) | `text-white/85` | ~5.5:1 |
| Footer — "Suivez-nous" label `text-white/60` | ~3.1:1 (échec) | `text-white/75` | ~4.7:1 |
| Footer — border `border-white/10` | Invisible | `border-white/15` | Visible |
| Footer — badges VISA/MC `bg-white/10 text-white/70` | Invisibles | `bg-white/15 text-white/85` | Contraste décoratif acceptable + `aria-hidden` |

### Focus visible

- Nouveau `:focus-visible` global dans `globals.css` avec `outline-2 outline-offset-2 outline-ring`
- Focus rings explicites sur tous les liens Footer (offset sur le `#003d5c` via `focus-visible:ring-offset-[#003d5c]`)
- Focus rings sur les nav items Header (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`)
- Focus ring sur les liens MobileMenu

### Mouvement

- `globals.css` : media query `@media (prefers-reduced-motion: reduce)` qui force `animation-duration`, `transition-duration` à 0.01ms et `scroll-behavior: auto` sur `*`, `*::before`, `*::after` — respecte 2.3.3 Animation from interactions

### Sémantique

- `<address>` dans le footer pour les coordonnées (email/téléphone/adresse)
- `<nav>` au lieu de `<div>` autour des listes de liens footer
- `<main id="main-content" tabIndex={-1}>` pour permettre le focus programmatique depuis le skip link

---

## Pages publiques auditées — état

| Page | Statut | Notes |
|---|---|---|
| `/` (home) | OK via layout parent | Header/Footer/main fixés ici, hero et sections n'ont pas été touchés (hors scope design refonte antérieure) |
| `/categories` | OK via layout | Composant `categories-grid` déjà audité lors du redesign (PR #152) |
| `/products/[slug]` | **À revoir** | Voir ci-dessous |
| `/cart` | **À revoir** | Quantité inputs, boutons +/-, suppression |
| `/checkout` | **À revoir** | Formulaire multi-step livré récemment (PR #150) — un audit ciblé recommandé |
| `/contact` | Probablement OK | Formulaire avec labels attendus, à confirmer |
| `/login`, `/register` | Probablement OK | Formulaires shadcn avec `<Label>` natifs |

---

## Reste à faire (hors scope de cette PR)

Ces points sont identifiés mais n'entrent pas dans le mandat "fixes critiques" de l'issue #68. À ouvrir en tickets de suivi.

### Haute priorité

1. **Product detail page** (`/products/[slug]`)
   - Vérifier `alt` sur les images produits (doit décrire le produit, pas "image")
   - Les thumbnails de galerie doivent être des `<button>` avec `aria-label="Voir l'image N"` et `aria-pressed` sur la thumbnail active
   - Le prix et la disponibilité doivent être annoncés via `aria-live="polite"` si mis à jour dynamiquement

2. **Cart page** (`/cart`)
   - Boutons +/- quantité : `aria-label="Augmenter la quantité"` / `"Diminuer la quantité"`
   - Input quantité : `<label>` associé, `aria-describedby` sur les erreurs min/max
   - Bouton supprimer : `aria-label="Supprimer {nom du produit} du panier"` (pas juste "Supprimer")
   - Annoncer les mises à jour de total via `aria-live="polite"`

3. **Checkout multi-step** (`/checkout`)
   - Vérifier l'indicateur de progression : doit avoir `role="list"`, `aria-current="step"` sur l'étape active
   - Transitions entre étapes : focus management (focus sur le `<h1>` de la nouvelle étape)
   - Champs CB (Stripe Elements) : vérifier que les frames sont bien labellisées

4. **Formulaires génériques**
   - Audit des messages d'erreur Zod : doivent être liés aux champs via `aria-describedby` et `aria-invalid`
   - Hint : le composant `<FormField>` de shadcn le fait déjà correctement — vérifier qu'il est utilisé partout

### Moyenne priorité

5. **Landmark `<main>` sur pages `(auth)` et `(account)`** — Ces layouts n'ont pas été touchés, vérifier qu'ils ont aussi un `<main>` sémantique
6. **Breadcrumbs** — `src/components/shared/breadcrumb.tsx` : vérifier `<nav aria-label="Fil d'Ariane">` et `aria-current="page"` sur le dernier item
7. **Pagination** — `src/components/shared/pagination.tsx` : `<nav aria-label="Pagination">`, `aria-label="Page N"` sur chaque bouton, `aria-current="page"` sur la page courante
8. **SearchBar** — Vérifier que l'input a un `<label>` (visible ou sr-only) et que les résultats annoncent leur nombre via live region
9. **Language switcher** — Boutons doivent avoir `aria-label="Changer la langue en {langue}"`
10. **Theme toggle** — Actuellement `<span class="sr-only">Changer le thème</span>` + emoji, pas assez explicite. Devrait indiquer l'état courant (`aria-pressed` ou `aria-label="Activer le mode sombre"`)

### Faible priorité / qualité

11. **Heading hierarchy** — Vérifier sur chaque page qu'il n'y a qu'un seul `<h1>` et que la hiérarchie ne saute pas de niveau
12. **Color contrast** du texte sur les images de catégorie feature card — dépend des images uploadées par l'admin, à surveiller
13. **Langue des pages** — `<html lang="fr">` présent dans `layout.tsx` racine ✓
14. **Tests automatisés** — Ajouter `@axe-core/react` en dev ou intégrer axe dans Vitest pour catcher les régressions a11y
15. **Audit screen reader** — Tester manuellement avec NVDA (Windows) ou VoiceOver (Mac) sur les parcours critiques : ajout au panier, checkout, login

### Points vérifiés sans changement nécessaire

- `<html lang="fr">` défini au niveau racine ✓
- Composants shadcn (Button, Input, Label, Dialog, Dropdown) — construits sur Radix UI qui gère correctement ARIA par défaut ✓
- Pas de `onClick` sur `<div>` détecté dans le scope public ✓
- Pas d'auto-play de vidéo/audio ✓

---

## Ressources

- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [axe DevTools](https://www.deque.com/axe/devtools/)
