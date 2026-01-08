---
stepsCompleted: [1]
inputDocuments:
  - "_bmad-output/planning-artifacts/prd.md"
  - "_bmad-output/planning-artifacts/architecture.md"
  - "docs/PROJET Bachelor CPI.md"
  - "docs/Cahier-des-charges-Projet-Etude-2025-2026 (1).pdf"
---

# althea-systems - Epic Breakdown

## Overview

Ce document fournit la décomposition complète des epics et stories pour Althea Systems, transformant les exigences du PRD, de l'Architecture et du Cahier des Charges en stories implémentables. Le projet est une plateforme e-commerce B2B pour matériel médical avec front-office public et back-office admin.

## Requirements Inventory

### Functional Requirements

**FR1**: Affichage d'un carrousel homepage avec 3 slides maximum, modifiable depuis le back-office (images, textes, ordre, redirection)

**FR2**: Affichage d'une grille de catégories de produits sur la homepage, personnalisable via back-office (images, noms, ordre)

**FR3**: Affichage d'une section "Top Produits du moment" avec sélection et ordre modifiables via back-office

**FR4**: Navigation par catégories avec image principale, description et liste de produits (format liste sur mobile, grille sur desktop)

**FR5**: Tri dynamique des produits par priorité (définie back-office), puis par disponibilité (produits épuisés en dernier)

**FR6**: Page produit avec carrousel d'illustrations, nom, description, caractéristiques techniques, prix, disponibilité

**FR7**: Affichage de 6 produits similaires aléatoires de la même catégorie (priorité produits disponibles)

**FR8**: Recherche avancée multi-facettes (titre, description, caractéristiques techniques, prix min/max, catégorie, disponibilité)

**FR9**: Résultats de recherche avec règles de correspondance (exacte > 1 caractère différent > commence par > contient)

**FR10**: Tri des résultats de recherche par prix, nouveauté, ou disponibilité (ascendant/descendant)

**FR11**: Performance de recherche < 100ms avec mises à jour en temps réel depuis back-office

**FR12**: Panier accessible à tous (connectés et non-connectés) avec liste produits, quantité modifiable, calcul total temps réel

**FR13**: Gestion produits indisponibles dans le panier avec messages d'alerte

**FR14**: Processus checkout en étapes : connexion/inscription, adresse facturation/livraison, paiement, confirmation

**FR15**: Possibilité de continuer en tant qu'invité lors du checkout

**FR16**: Choix parmi adresses et cartes enregistrées ou ajout de nouvelles

**FR17**: Intégration paiement sécurisé Stripe avec PaymentIntent et webhooks

**FR18**: Inscription utilisateur avec formulaire (nom, email, mot de passe), validation email de confirmation

**FR19**: Connexion utilisateur avec credentials (email + mot de passe) ou OAuth (Google, GitHub)

**FR20**: Réinitialisation mot de passe avec lien email sécurisé (validité 24h)

**FR21**: Gestion compte utilisateur : modification infos personnelles, adresses, méthodes de paiement

**FR22**: Historique commandes regroupé par année avec recherche, filtres, téléchargement factures PDF

**FR23**: Formulaire de contact avec champs email, sujet, message

**FR24**: Chatbot "Contact Me" interactif pour réponses instantanées et escalade vers agent humain

**FR25**: Back-office avec dashboard : CA jour/semaine/mois, nombre commandes, alertes stock, messages non traités

**FR26**: Graphique camembert ventes par catégorie (7 derniers jours modifiable à 5 dernières semaines)

**FR27**: CRUD complet produits avec gestion images, catégories, prix HT/TTC, TVA, stock, statut, slug SEO

**FR28**: Actions groupées produits : suppression, modification statut, modification catégorie, export CSV/Excel

**FR29**: CRUD complet catégories avec gestion hiérarchique, images, description, ordre affichage, statut

**FR30**: Gestion utilisateurs : liste avec tri/recherche, actions (email, reset password, désactiver, supprimer RGPD)

**FR31**: Gestion commandes : liste avec statuts (en attente, en cours, terminée, annulée), détail commande, historique modifications

**FR32**: Gestion factures : génération automatique à validation paiement, téléchargement PDF, renvoi email, modification

**FR33**: Génération automatique d'avoir lors suppression facture

**FR34**: Gestion avoirs : liste avec facture liée, date, client, montant négatif, motif, téléchargement PDF

**FR35**: Menu burger responsive adapté statut connexion (connecté : paramètres, commandes, déconnexion / non-connecté : connexion, inscription)

**FR36**: Pagination fluide pour toutes listes produits (navigation par lots et page précise)

**FR37**: Support RTL (arabe, hébreu) avec sélection langue dans menu

**FR38**: 2FA obligatoire pour administrateurs avec TOTP (otplib, QR code setup)

**FR39**: Protection routes middleware : /admin/* (ADMIN + 2FA), /profile, /orders, /addresses, /payments (auth)

**FR40**: Upload images vers Cloudflare R2 avec validation (max 5MB, JPEG/PNG/WebP/GIF, sanitization noms)

### Non-Functional Requirements

**NFR1**: Performance recherche < 100ms même après modifications back-office

**NFR2**: Mise à jour temps réel des modifications back-office dans résultats recherche

**NFR3**: Architecture stateless scalable avec cache Redis distribué

**NFR4**: Cache Redis multi-niveaux : produits 10min, catégories 30min, recherche 5min, sessions 24h

**NFR5**: Sécurité : chiffrement données, validation double niveau (client + serveur), protection XSS/CSRF/SQL injection

**NFR6**: Conformité PCI-DSS via Stripe (pas de stockage cartes)

**NFR7**: Conformité RGPD : gestion données personnelles, droit suppression, avertissements

**NFR8**: Authentification forte : JWT sessions stateless, 2FA TOTP admins, OAuth multi-providers

**NFR9**: Headers sécurité : X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin

**NFR10**: SSL/TLS pour toutes communications

**NFR11**: Accessibilité WCAG 2.1 : navigation clavier, lecteurs écran, contrastes optimisés

**NFR12**: Design responsive mobile-first (liste sur mobile, grille sur desktop)

**NFR13**: Support i18n multi-langues avec RTL (arabe, hébreu)

**NFR14**: Type-safety bout-en-bout : TypeScript + Prisma

**NFR15**: Logging systematique : fichiers locaux /logs avec tracking connexions/erreurs

**NFR16**: Rate limiting via Redis INCR/EXPIRE sur API Routes

**NFR17**: Validation variables environnement Zod au démarrage (erreur fatale prod, warning dev)

**NFR18**: Code propre : nomenclature claire, architecture modulaire, respect SOLID

**NFR19**: Tests : unitaires co-localisés, intégration, E2E Playwright/Cypress

**NFR20**: CI/CD automatique : autodeploy Dokploy sur push main

### Additional Requirements

**ARCH1**: Stack Next.js 16.x App Router + TypeScript + Tailwind CSS + shadcn/ui

**ARCH2**: Backend Next.js API Routes + Prisma 5.x ORM + NextAuth.js 4.x

**ARCH3**: Base de données PostgreSQL 16 + Redis 7.x + Cloudflare R2 (S3-compatible)

**ARCH4**: Structure projet avec groupes routes : (auth)/, (main)/, admin/

**ARCH5**: Middleware Edge Runtime pour protection routes et headers sécurité

**ARCH6**: Validation Zod systématique client-side et server-side

**ARCH7**: Invalidation cache Redis automatique lors mutations back-office

**ARCH8**: Stratégie session JWT stateless (cookies httpOnly, durée 30 jours)

**ARCH9**: Docker Compose pour dev local (PostgreSQL, Redis, Adminer, Redis Commander, Mailhog)

**ARCH10**: Conventions naming : Tables PascalCase singulier, colonnes camelCase, endpoints pluriel kebab-case

**UX1**: Charte graphique : CTA #00a8b5, Backgrounds #d4f4f7/#33bfc9, Hover #33bfc9, Titres #003d5c

**UX2**: Statuts colorés : En stock #10b981, Stock faible #F59E0B, Rupture #ef4444, Nouveau #00a8b5

**UX3**: Typographie : Titres Poppins semibold, Corps Inter Regular 400

**UX4**: Logo responsive : version mobile et desktop

**CDC1**: Livrables Git : repository avec code propre, commits descriptifs, tests sans erreurs

**CDC2**: Documentation technique complète : guide installation, documentation API (Swagger), structure code, tests, DCT

**CDC3**: Diagrammes techniques : architecture globale, flux données, communication services

**CDC4**: Maquettage et prototypes front-office et back-office

### FR Coverage Map

| Epic | Stories | Covered FRs | Covered NFRs |
|------|---------|-------------|--------------|
| Epic 1: Homepage & Navigation | 1.1 - 1.3 | FR1, FR2, FR3, FR35 | NFR12, NFR13, UX1-4 |
| Epic 2: Catalogue & Recherche Produits | 2.1 - 2.4 | FR4, FR5, FR8, FR9, FR10, FR11, FR36 | NFR1, NFR2, NFR12 |
| Epic 3: Page Produit & Détails | 3.1 - 3.2 | FR6, FR7 | NFR12, UX1-4 |
| Epic 4: Panier & Gestion Articles | 4.1 - 4.2 | FR12, FR13 | NFR12 |
| Epic 5: Processus Checkout & Paiement | 5.1 - 5.5 | FR14, FR15, FR16, FR17 | NFR6, NFR8 |
| Epic 6: Authentification & Sécurité | 6.1 - 6.4 | FR18, FR19, FR20, FR38, FR39 | NFR5, NFR8, NFR9, NFR10 |
| Epic 7: Compte Utilisateur & Profil | 7.1 - 7.3 | FR21, FR22 | NFR7, NFR12 |
| Epic 8: Contact & Support Client | 8.1 - 8.2 | FR23, FR24 | - |
| Epic 9: Back-office Dashboard & Analytics | 9.1 - 9.2 | FR25, FR26 | NFR15 |
| Epic 10: Gestion Produits & Catégories | 10.1 - 10.3 | FR27, FR28, FR29, FR40 | NFR4, NFR7, ARCH7 |
| Epic 11: Gestion Commandes & Utilisateurs | 11.1 - 11.2 | FR30, FR31 | NFR7, NFR15 |
| Epic 12: Gestion Factures & Avoirs | 12.1 - 12.3 | FR32, FR33, FR34 | NFR7 |
| Epic 13: Internationalisation & Accessibilité | 13.1 - 13.2 | FR37 | NFR11, NFR13 |
| Epic 14: Documentation & Tests (GAPS) | 14.1 - 14.3 | CDC2 | NFR19, CDC2, CDC3 |

## Epic List

1. **Epic 1: Homepage & Navigation** - Interface d'accueil attractive avec carrousel, catégories et produits vedettes
2. **Epic 2: Catalogue & Recherche Produits** - Navigation et recherche avancée performante des produits
3. **Epic 3: Page Produit & Détails** - Présentation détaillée des produits avec recommandations
4. **Epic 4: Panier & Gestion Articles** - Gestion du panier d'achat avant checkout
5. **Epic 5: Processus Checkout & Paiement** - Processus de commande sécurisé avec Stripe
6. **Epic 6: Authentification & Sécurité** - Système d'authentification robuste avec 2FA admins
7. **Epic 7: Compte Utilisateur & Profil** - Gestion complète du compte et historique
8. **Epic 8: Contact & Support Client** - Canaux de communication avec formulaire et chatbot (GAP)
9. **Epic 9: Back-office Dashboard & Analytics** - Tableau de bord avec indicateurs clés et graphiques
10. **Epic 10: Gestion Produits & Catégories** - CRUD complet produits et catégories avec upload images
11. **Epic 11: Gestion Commandes & Utilisateurs** - Administration des commandes et utilisateurs
12. **Epic 12: Gestion Factures & Avoirs** - Génération et gestion factures/avoirs PDF (GAP partiel)
13. **Epic 13: Internationalisation & Accessibilité** - Support multi-langues RTL et accessibilité WCAG 2.1
14. **Epic 14: Documentation & Tests (GAPS)** - Documentation API Swagger et suites de tests complètes

## Epic 1: Homepage & Navigation

**Goal**: Offrir une interface d'accueil attractive et responsive qui met en avant les produits et catégories, facilite la navigation et engage les visiteurs B2B.

### Story 1.1: Carrousel Homepage Dynamique

As a **visiteur du site**,
I want **voir un carrousel avec 3 slides promotionnelles sur la homepage**,
So that **je peux découvrir les offres et produits mis en avant par Althea Systems**.

**Acceptance Criteria:**

**Given** je suis sur la homepage
**When** la page se charge
**Then** je vois un carrousel avec maximum 3 slides
**And** chaque slide affiche une image, un texte et un lien de redirection
**And** le carrousel défile automatiquement avec navigation manuelle (points, flèches)
**And** le design est responsive (mobile et desktop)

**Given** un administrateur a modifié le carrousel depuis le back-office
**When** je rafraîchis la homepage
**Then** je vois les modifications immédiatement (images, textes, ordre)

---

### Story 1.2: Grille Catégories de Produits

As a **visiteur du site**,
I want **voir une grille visuelle des catégories de produits**,
So that **je peux naviguer rapidement vers le type de matériel médical qui m'intéresse**.

**Acceptance Criteria:**

**Given** je suis sur la homepage sous le carrousel
**When** je scroll vers le bas
**Then** je vois une grille de catégories avec image et nom pour chaque catégorie
**And** l'ordre des catégories correspond à celui défini dans le back-office
**And** la grille est responsive (nombre de colonnes adapté mobile/desktop)
**And** chaque catégorie est cliquable et mène vers la page catégorie correspondante

**Given** je clique sur une catégorie
**When** la navigation s'effectue
**Then** je suis redirigé vers la page de cette catégorie avec ses produits

---

### Story 1.3: Section "Top Produits du Moment"

As a **visiteur du site**,
I want **voir une sélection de produits vedettes sur la homepage**,
So that **je peux découvrir rapidement les meilleurs produits ou promotions en cours**.

**Acceptance Criteria:**

**Given** je suis sur la homepage après la grille catégories
**When** je continue à scroller
**Then** je vois un titre "Les Top Produits du moment"
**And** je vois une grille de produits sélectionnés depuis le back-office
**And** chaque produit affiche une image et son nom
**And** l'ordre des produits correspond à celui défini dans le back-office
**And** chaque produit est cliquable et mène vers sa page détail

---

## Epic 2: Catalogue & Recherche Produits

**Goal**: Permettre aux utilisateurs de naviguer efficacement dans le catalogue et de trouver rapidement les produits recherchés via une recherche avancée performante (<100ms).

### Story 2.1: Navigation Catégorie avec Affichage Produits

As a **visiteur du site**,
I want **accéder à une page catégorie avec liste de produits**,
So that **je peux explorer tous les produits d'un type spécifique de matériel médical**.

**Acceptance Criteria:**

**Given** je clique sur une catégorie depuis la homepage
**When** la page catégorie se charge
**Then** je vois une image principale avec surimpression du nom de la catégorie
**And** je vois une description de la catégorie sous l'image
**And** je vois la liste des produits de cette catégorie
**And** l'affichage est en liste verticale sur mobile et grille sur desktop
**And** chaque produit affiche : nom, prix, statut disponibilité ("En rupture de stock" si indisponible)

---

### Story 2.2: Tri Dynamique Produits par Priorité et Disponibilité

As a **visiteur du site**,
I want **que les produits soient triés intelligemment par priorité puis disponibilité**,
So that **je vois d'abord les produits les plus importants et disponibles**.

**Acceptance Criteria:**

**Given** je suis sur une page catégorie avec produits
**When** la liste s'affiche
**Then** les produits prioritaires (définis back-office) sont affichés en premier
**And** les produits non prioritaires sont affichés ensuite
**And** les produits épuisés sont affichés en dernier
**And** les produits épuisés sont grisés ou différenciés visuellement

---

### Story 2.3: Recherche Avancée Multi-Facettes

As a **utilisateur du site**,
I want **utiliser une recherche avancée avec multiples filtres**,
So that **je peux trouver précisément le produit médical dont j'ai besoin parmi un large catalogue**.

**Acceptance Criteria:**

**Given** je suis sur la page de recherche accessible depuis le header
**When** j'utilise les filtres de recherche
**Then** je peux filtrer par : texte du titre, texte description, caractéristiques techniques, prix min/max, catégorie(s), uniquement disponibles
**And** les résultats appliquent les règles de correspondance dans l'ordre : exacte > 1 caractère différent > commence par > contient
**And** les résultats apparaissent en moins de 100ms
**And** les résultats reflètent immédiatement les modifications back-office

---

### Story 2.4: Tri et Pagination Résultats Recherche

As a **utilisateur du site**,
I want **trier les résultats de recherche selon mes critères et naviguer par pages**,
So that **je peux organiser et parcourir efficacement les résultats trouvés**.

**Acceptance Criteria:**

**Given** j'ai des résultats de recherche affichés
**When** je sélectionne un critère de tri
**Then** je peux trier par prix (ascendant/descendant), nouveauté (date ajout/MAJ), ou disponibilité
**And** les résultats se réorganisent immédiatement selon le tri choisi

**Given** j'ai plus de produits que la limite d'affichage par page
**When** je navigue dans les résultats
**Then** je dispose d'une pagination fluide avec navigation par lots et saut page précise

---

## Epic 3: Page Produit & Détails

**Goal**: Présenter les produits de manière détaillée et attractive pour faciliter la décision d'achat, avec recommandations de produits similaires.

### Story 3.1: Page Détail Produit Complète

As a **visiteur du site**,
I want **consulter une page détaillée pour chaque produit**,
So that **je peux évaluer si le produit correspond à mes besoins avant de l'ajouter au panier**.

**Acceptance Criteria:**

**Given** je clique sur un produit depuis une liste ou catégorie
**When** la page produit se charge
**Then** je vois un carrousel avec plusieurs illustrations du produit
**And** je vois le nom du produit en grand et gras
**And** je vois une description complète du produit
**And** je vois une section caractéristiques techniques détaillées
**And** je vois le prix bien visible
**And** je vois le statut de disponibilité ("Rupture de Stock" si indisponible)
**And** je vois un bouton "Ajouter au panier" (ou "Acheter maintenant")

**Given** le produit est en rupture de stock
**When** je consulte la page produit
**Then** le bouton d'achat est désactivé avec mention "En rupture de stock"

---

### Story 3.2: Produits Similaires Recommandés

As a **visiteur du site**,
I want **voir des produits similaires en bas de la page produit**,
So that **je peux découvrir des alternatives ou compléments intéressants**.

**Acceptance Criteria:**

**Given** je suis sur une page produit
**When** je scroll vers le bas
**Then** je vois une section "Produits similaires"
**And** je vois 6 produits aléatoires de la même catégorie
**And** les produits disponibles sont affichés en priorité
**And** chaque produit affiche image et nom
**And** chaque produit est cliquable pour accéder à sa page détail

---

## Epic 4: Panier & Gestion Articles

**Goal**: Permettre à tous les utilisateurs (connectés ou non) de gérer leur panier d'achat avec calcul temps réel du total et gestion des produits indisponibles.

### Story 4.1: Gestion Panier Universelle

As a **utilisateur du site (connecté ou non)**,
I want **ajouter des produits à mon panier et gérer les quantités**,
So that **je peux préparer ma commande avant de passer au checkout**.

**Acceptance Criteria:**

**Given** je clique sur "Ajouter au panier" depuis une page produit
**When** le produit est ajouté
**Then** je peux accéder à ma page panier depuis l'icône header
**And** je vois la liste de tous les produits ajoutés avec : nom, quantité, prix unitaire, prix total
**And** je peux modifier la quantité de chaque produit
**And** je peux supprimer des produits du panier
**And** je vois le montant total à payer mis à jour en temps réel
**And** le total inclut toutes les taxes applicables et promotions éventuelles

**Given** je ne suis pas connecté
**When** je consulte mon panier
**Then** un rappel m'encourage à me connecter ou créer un compte pour sauvegarder mon panier
**And** je peux quand même continuer comme invité vers le checkout

---

### Story 4.2: Gestion Produits Indisponibles dans Panier

As a **utilisateur avec produits dans le panier**,
I want **être alerté si un produit devient indisponible**,
So that **je peux ajuster ma commande avant de finaliser**.

**Acceptance Criteria:**

**Given** un produit dans mon panier devient indisponible
**When** j'accède à ma page panier
**Then** le produit indisponible est marqué avec message "Indisponible"
**And** le total du panier est ajusté en conséquence
**And** je peux retirer le produit indisponible
**And** un message d'alerte m'informe que je ne peux pas finaliser tant que des produits sont indisponibles

---

## Epic 5: Processus Checkout & Paiement

**Goal**: Offrir un processus de commande simple, sécurisé et efficace avec intégration Stripe, gestion des adresses et confirmation de commande.

### Story 5.1: Connexion ou Inscription au Checkout

As a **utilisateur avec panier validé**,
I want **me connecter, m'inscrire ou continuer en invité au checkout**,
So that **je peux finaliser ma commande selon ma préférence**.

**Acceptance Criteria:**

**Given** je clique sur "Passer à la caisse" depuis mon panier
**When** je ne suis pas connecté
**Then** je suis invité à me connecter à mon compte existant
**And** je peux m'inscrire rapidement avec un formulaire inline
**And** je peux choisir de continuer en tant qu'invité
**And** si je m'inscris, je reçois un email de confirmation (mais peux continuer le checkout)

---

### Story 5.2: Sélection Adresse Facturation/Livraison

As a **utilisateur au checkout**,
I want **saisir ou sélectionner mon adresse de facturation/livraison**,
So that **ma commande soit livrée à la bonne adresse**.

**Acceptance Criteria:**

**Given** je suis connecté ou ai fourni mes infos
**When** j'arrive à l'étape adresse du checkout
**Then** je peux choisir parmi mes adresses enregistrées (si connecté)
**And** je peux entrer une nouvelle adresse avec : prénom, nom, adresse 1, adresse 2 (optionnel), ville, région, code postal, pays, téléphone mobile
**And** la nouvelle adresse est validée côté client et serveur (Zod)
**And** la nouvelle adresse peut être sauvegardée sur mon compte (si connecté)

---

### Story 5.3: Sélection Méthode de Paiement

As a **utilisateur au checkout**,
I want **saisir ou sélectionner ma méthode de paiement**,
So that **je peux payer ma commande de manière sécurisée**.

**Acceptance Criteria:**

**Given** j'ai validé mon adresse
**When** j'arrive à l'étape paiement
**Then** je peux choisir parmi mes cartes enregistrées (si connecté)
**And** je peux ajouter une nouvelle carte avec : nom sur carte, numéro carte (16 chiffres), date expiration (mois/année), CVV (3 chiffres)
**And** les informations de paiement sont validées côté client et serveur
**And** les données de carte sont traitées via Stripe (PCI-DSS conforme)
**And** la nouvelle carte peut être sauvegardée sur mon compte (si connecté)

---

### Story 5.4: Page Confirmation Commande

As a **utilisateur au checkout**,
I want **voir un récapitulatif complet avant de confirmer ma commande**,
So that **je peux vérifier tous les détails avant paiement final**.

**Acceptance Criteria:**

**Given** j'ai saisi adresse et paiement
**When** j'arrive à la page confirmation
**Then** je vois un récapitulatif complet avec : produits achetés (nom, quantité, prix), taxes appliquées, total final, adresse de facturation, informations de paiement (4 derniers chiffres carte)
**And** je vois un bouton "Confirmer l'achat" clairement visible
**And** je peux revenir aux étapes précédentes pour modifier si besoin

---

### Story 5.5: Traitement Paiement Stripe et Confirmation

As a **utilisateur ayant confirmé ma commande**,
I want **que mon paiement soit traité de manière sécurisée et recevoir une confirmation**,
So that **je sais que ma commande est validée et en cours de traitement**.

**Acceptance Criteria:**

**Given** je clique sur "Confirmer l'achat"
**When** le paiement est traité
**Then** un PaymentIntent Stripe est créé
**And** le paiement est confirmé côté client
**And** un webhook Stripe valide la transaction côté serveur
**And** la commande est créée dans la base de données avec statut "En attente"
**And** une facture est générée automatiquement
**And** je reçois un email de confirmation avec détails complets de la commande
**And** je suis redirigé vers une page de succès ou mon historique commandes

---

## Epic 6: Authentification & Sécurité

**Goal**: Fournir un système d'authentification robuste et sécurisé avec support multi-providers OAuth, 2FA obligatoire pour admins, et protection des routes sensibles.

### Story 6.1: Inscription Utilisateur avec Validation Email

As a **visiteur du site**,
I want **créer un compte utilisateur**,
So that **je peux sauvegarder mes informations, suivre mes commandes et passer des commandes futures plus rapidement**.

**Acceptance Criteria:**

**Given** je clique sur "S'inscrire" depuis le menu
**When** je remplis le formulaire d'inscription
**Then** je dois fournir : nom complet (prénom + nom), adresse email valide, mot de passe (critères CNIL/RGPD)
**And** la validation se fait côté client (UX) et serveur (sécurité) avec Zod
**And** le mot de passe est chiffré avant stockage (bcrypt)
**And** je reçois un email de confirmation avec lien unique sécurisé (validité 24h)
**And** je peux naviguer sur le site mais certaines fonctionnalités nécessitent confirmation email

**Given** je clique sur le lien de confirmation dans l'email
**When** le lien est validé
**Then** je suis redirigé vers le site et connecté automatiquement
**And** mon compte est activé complètement
**And** je peux compléter mon profil avec infos supplémentaires

---

### Story 6.2: Connexion Multi-Providers (Credentials + OAuth)

As a **utilisateur inscrit**,
I want **me connecter avec mes credentials ou via Google/GitHub**,
So that **je peux accéder à mon compte facilement avec ma méthode préférée**.

**Acceptance Criteria:**

**Given** je clique sur "Se connecter" depuis le menu
**When** j'arrive sur la page de connexion
**Then** je peux me connecter avec email + mot de passe (credentials)
**And** je peux me connecter via Google OAuth
**And** je peux me connecter via GitHub OAuth
**And** une option "Se souvenir de moi" permet de garder la session

**Given** je saisis des identifiants incorrects
**When** je tente de me connecter
**Then** un message d'erreur indique que l'email ou mot de passe est incorrect
**And** un lien vers "Mot de passe oublié" est proposé

**Given** je tente d'accéder à une page privée sans être connecté
**When** je suis redirigé vers la connexion
**Then** après connexion réussie, je suis redirigé vers la page privée initialement demandée

---

### Story 6.3: Réinitialisation Mot de Passe

As a **utilisateur ayant oublié son mot de passe**,
I want **recevoir un lien sécurisé pour réinitialiser mon mot de passe**,
So that **je peux retrouver l'accès à mon compte**.

**Acceptance Criteria:**

**Given** je clique sur "Mot de passe oublié" depuis la page connexion
**When** je saisis mon adresse email
**Then** je reçois un email avec un lien de réinitialisation sécurisé
**And** le lien est valide pendant 24 heures maximum
**And** je clique sur le lien et accède à une page de réinitialisation
**And** je saisis un nouveau mot de passe (validation critères sécurité)
**And** mon mot de passe est mis à jour et chiffré
**And** je peux me connecter immédiatement avec le nouveau mot de passe

---

### Story 6.4: 2FA Obligatoire Administrateurs avec TOTP

As a **administrateur Althea Systems**,
I want **configurer et utiliser l'authentification à deux facteurs (2FA)**,
So that **l'accès au back-office est sécurisé avec une couche supplémentaire de protection**.

**Acceptance Criteria:**

**Given** je suis un utilisateur avec role ADMIN
**When** je me connecte pour la première fois ou que 2FA n'est pas configuré
**Then** je suis redirigé vers la page de configuration 2FA
**And** je vois un QR code à scanner avec mon application TOTP (Google Authenticator, Authy)
**And** je saisis un code de vérification à 6 chiffres pour valider le setup
**And** mon secret TOTP est stocké en base de données (Base32, chiffré)

**Given** j'ai configuré 2FA et je me connecte au back-office
**When** je fournis mes credentials corrects
**Then** je suis redirigé vers la page de vérification 2FA
**And** je dois saisir le code à 6 chiffres actuel de mon app TOTP
**And** je ne peux pas accéder au back-office tant que le code 2FA n'est pas validé
**And** après validation 2FA réussie, ma session inclut le statut "2FA vérifié"

**Given** je tente d'accéder à /admin/* sans 2FA vérifié
**When** le middleware détecte l'absence de 2FA
**Then** je suis redirigé vers /admin/verify-2fa
**And** je reçois un status HTTP 403 Forbidden si je tente d'accéder directement à l'API

---

## Epic 7: Compte Utilisateur & Profil

**Goal**: Permettre aux utilisateurs de gérer leurs informations personnelles, adresses, méthodes de paiement et consulter l'historique de leurs commandes.

### Story 7.1: Gestion Informations Personnelles

As a **utilisateur connecté**,
I want **modifier mes informations personnelles**,
So that **je peux maintenir mes données à jour (nom, email, mot de passe)**.

**Acceptance Criteria:**

**Given** je suis connecté et accède à "Mes paramètres"
**When** je modifie mes informations
**Then** je peux changer mon nom complet (utilisé pour personnalisation emails)
**And** je peux changer mon adresse email (un email de confirmation est envoyé à la nouvelle adresse pour valider)
**And** je peux changer mon mot de passe en saisissant d'abord mon mot de passe actuel
**And** toutes modifications sont validées côté client et serveur (Zod)
**And** un message de confirmation s'affiche après modification réussie

---

### Story 7.2: Gestion Adresses et Méthodes de Paiement

As a **utilisateur connecté**,
I want **gérer mes adresses de facturation/livraison et mes cartes de paiement**,
So that **je peux passer commande rapidement lors de mes prochains achats**.

**Acceptance Criteria:**

**Given** je suis connecté et accède à mon compte
**When** je consulte ma section "Adresses"
**Then** je vois la liste de mes adresses enregistrées
**And** je peux ajouter une nouvelle adresse (prénom, nom, adresse 1/2, ville, région, code postal, pays, téléphone)
**And** je peux modifier une adresse existante
**And** je peux supprimer une adresse non utilisée

**Given** je consulte ma section "Méthodes de paiement"
**When** je gère mes cartes
**Then** je vois la liste de mes cartes enregistrées (masquées sauf 4 derniers chiffres)
**And** je peux ajouter une nouvelle carte (nom, numéro, expiration, CVV) via Stripe
**And** je peux supprimer une carte
**And** je peux définir une carte comme méthode de paiement par défaut
**And** toutes informations de paiement sont conformes PCI-DSS (gérées via Stripe)

---

### Story 7.3: Historique Commandes avec Factures PDF

As a **utilisateur connecté**,
I want **consulter l'historique de mes commandes et télécharger mes factures**,
So that **je peux suivre mes achats passés et gérer ma comptabilité**.

**Acceptance Criteria:**

**Given** je suis connecté et accède à "Mes commandes"
**When** la page se charge
**Then** je vois mes commandes regroupées par année (de la plus récente à la plus ancienne)
**And** chaque commande affiche : nom produit, date, montant total, statut (terminée, active, annulée)
**And** je peux cliquer sur une commande pour voir le détail complet
**And** le détail inclut : produit commandé, mode de paiement (4 derniers chiffres), adresse facturation, lien téléchargement facture PDF
**And** je peux filtrer les commandes par année ou type de produit
**And** je peux rechercher une commande spécifique par nom produit ou date
**And** je peux télécharger les factures au format PDF pour archivage

---

## Epic 8: Contact & Support Client

**Goal**: Offrir plusieurs canaux de communication aux clients avec un formulaire de contact et un chatbot interactif pour réponses instantanées (chatbot = GAP à implémenter).

### Story 8.1: Formulaire de Contact

As a **utilisateur du site (connecté ou non)**,
I want **contacter Althea Systems via un formulaire**,
So that **je peux poser mes questions ou signaler un problème**.

**Acceptance Criteria:**

**Given** j'accède à la page "Contact"
**When** je remplis le formulaire
**Then** je dois fournir : adresse email valide, sujet du message, texte du message
**And** tous les champs obligatoires sont validés avant soumission
**And** une confirmation visuelle s'affiche après envoi
**And** le message est accessible dans le back-office pour traitement par l'équipe support
**And** je reçois un email de confirmation que mon message a bien été reçu

---

### Story 8.2: Chatbot "Contact Me" Interactif (GAP)

As a **utilisateur du site**,
I want **interagir avec un chatbot pour obtenir des réponses instantanées**,
So that **je peux résoudre rapidement mes questions courantes sans attendre une réponse humaine**.

**Acceptance Criteria:**

**Given** je suis sur la page Contact ou n'importe quelle page
**When** je clique sur le bouton "Contact Me"
**Then** une fenêtre de chat s'ouvre en temps réel
**And** le chatbot me salue et me demande comment il peut m'aider
**And** je peux poser des questions courantes (ex: "Comment modifier mon adresse?", "Quelles méthodes de paiement acceptez-vous?")
**And** le chatbot répond immédiatement avec des informations pertinentes

**Given** le chatbot ne peut pas répondre à ma question complexe
**When** j'exprime mon insatisfaction ou demande un humain
**Then** le chatbot propose de transférer ma demande vers un agent humain
**And** une notification est envoyée à l'équipe support via le back-office
**And** le chatbot capture mes informations (email, sujet) pour accélérer la gestion

**Given** toutes mes interactions avec le chatbot
**When** la conversation se termine
**Then** l'historique de conversation est enregistré et accessible dans le back-office
**And** un lien vers le formulaire de contact est proposé si je veux soumettre un message détaillé

**Note**: Cette story est un GAP identifié - le chatbot n'est pas implémenté malgré mention dans CDC.

---

## Epic 9: Back-office Dashboard & Analytics

**Goal**: Fournir aux administrateurs un tableau de bord avec indicateurs clés de performance (KPI) et graphiques pour suivre l'activité commerciale.

### Story 9.1: Dashboard avec Indicateurs Clés (Cards)

As a **administrateur Althea Systems**,
I want **voir des indicateurs clés en un coup d'œil sur le dashboard**,
So that **je peux suivre la performance commerciale quotidienne rapidement**.

**Acceptance Criteria:**

**Given** je suis connecté en tant qu'admin avec 2FA vérifié
**When** j'accède au dashboard back-office (/admin)
**Then** je vois des cards affichant :
  - Chiffre d'affaires du jour / semaine / mois (sélectionnable)
  - Nombre de commandes du jour
  - Alertes produits en rupture de stock (badge rouge si >0)
  - Messages de contact non traités (badge avec nombre)
**And** chaque card affiche les données en temps réel depuis la base de données
**And** je peux cliquer sur les cards pour accéder aux sections détaillées

---

### Story 9.2: Graphiques Analytics Ventes

As a **administrateur Althea Systems**,
I want **visualiser les ventes par catégorie et dans le temps via des graphiques**,
So that **je peux analyser les tendances et prendre des décisions stratégiques**.

**Acceptance Criteria:**

**Given** je suis sur le dashboard back-office
**When** je consulte la section graphiques
**Then** je vois un graphique camembert "Répartition ventes par catégorie"
**And** le graphique affiche les ventes des 7 derniers jours par défaut
**And** je peux changer la période à 5 dernières semaines
**And** le graphique montre la répartition en % du CA par catégorie
**And** au survol d'une tranche, j'affiche le montant € exact

**Given** je consulte la section tendances
**When** je vois l'histogramme des ventes
**Then** je vois un histogramme affichant le total des ventes par jour sur 7 derniers jours
**And** je peux modifier la période pour afficher les ventes par semaine sur 5 dernières semaines
**And** l'histogramme permet de visualiser les pics d'activité

**Given** je consulte les paniers moyens
**When** je vois l'histogramme multi-couches
**Then** je vois le total des ventes par catégories selon paniers moyens sur 7 derniers jours
**And** je peux modifier la période à 5 dernières semaines
**And** le graphique permet de comparer les performances des différentes catégories

---

## Epic 10: Gestion Produits & Catégories

**Goal**: Fournir aux administrateurs un CRUD complet pour gérer les produits et catégories avec upload images vers Cloudflare R2 et invalidation cache automatique.

### Story 10.1: CRUD Complet Produits avec Upload Images

As a **administrateur Althea Systems**,
I want **créer, lire, modifier et supprimer des produits avec gestion d'images**,
So that **je peux maintenir le catalogue à jour facilement**.

**Acceptance Criteria:**

**Given** je suis sur la page "Gestion des Produits" du back-office
**When** je consulte la liste des produits
**Then** je vois un tableau avec colonnes : image (miniature), nom, description, catégorie(s), prix HT, TVA, prix TTC (calculé auto), stock, statut (publié/brouillon), date création, quantité en stock
**And** je peux trier par n'importe quelle colonne (ascendant/descendant)
**And** je peux rechercher globalement dans le tableau
**And** je peux filtrer par catégorie (liste déroulante), disponibilité (rupture), statut
**And** je dispose d'une pagination (25/50/100 produits par page)
**And** je peux exporter la sélection en CSV/Excel
**And** chaque ligne a des actions rapides (icônes) : voir, éditer, supprimer

**Given** je veux créer un nouveau produit
**When** je clique sur "Ajouter un produit"
**Then** je vois un formulaire avec tous champs nécessaires : nom, description, catégorie, caractéristiques techniques, prix HT, TVA (sélection 20%/10%/5.5%/0%), quantité stock, statut, slug SEO personnalisé
**And** je peux uploader plusieurs images en drag & drop (validation : max 5MB, JPEG/PNG/WebP/GIF)
**And** les images sont uploadées vers Cloudflare R2
**And** les noms de fichiers sont sanitizés (emojis retirés)
**And** les URLs R2 sont stockées dans PostgreSQL
**And** après création, le produit apparaît dans la liste
**And** le cache Redis produits est invalidé automatiquement

**Given** je veux modifier un produit existant
**When** je clique sur "Éditer" ou accède à la page détail produit
**Then** je peux ajuster toutes les informations du produit
**And** je peux réorganiser l'ordre des images par glisser-déposer
**And** je peux définir une image principale (*)
**And** je peux supprimer des images individuellement
**And** après modification, le cache Redis est invalidé pour ce produit

**Given** je veux supprimer un produit
**When** je clique sur "Supprimer"
**Then** une confirmation est demandée pour éviter suppressions accidentelles
**And** après confirmation, le produit est supprimé de la base
**And** les images R2 associées sont supprimées
**And** le cache Redis est invalidé

---

### Story 10.2: Actions Groupées Produits

As a **administrateur Althea Systems**,
I want **effectuer des actions groupées sur plusieurs produits simultanément**,
So that **je peux gagner du temps lors de modifications en masse**.

**Acceptance Criteria:**

**Given** je suis sur la liste des produits
**When** je sélectionne plusieurs produits (checkboxes)
**Then** je peux effectuer les actions groupées suivantes :
  - Supprimer la sélection (avec confirmation)
  - Modifier le statut (publier/dépublier)
  - Modifier la catégorie
  - Exporter la sélection (CSV/Excel)
**And** après chaque action groupée, le cache Redis est invalidé pour tous produits concernés
**And** un message de confirmation affiche le nombre de produits modifiés

---

### Story 10.3: CRUD Complet Catégories avec Hiérarchie

As a **administrateur Althea Systems**,
I want **gérer les catégories de produits avec support hiérarchique**,
So that **je peux organiser le catalogue de manière logique et intuitive**.

**Acceptance Criteria:**

**Given** je suis sur la page "Gestion des Catégories"
**When** je consulte la liste
**Then** je vois un tableau hiérarchique avec colonnes : image (miniature), nom, description, nombre de produits, ordre d'affichage, statut (Active/Inactive)
**And** je peux trier par nom, nombre de produits, ordre
**And** je peux voir/éditer/supprimer chaque catégorie (actions rapides)

**Given** je veux créer une nouvelle catégorie
**When** je clique sur "Ajouter une catégorie"
**Then** je remplis un formulaire avec : nom, description, image (upload R2), statut, URL personnalisée (slug SEO)
**And** l'image est uploadée vers Cloudflare R2 avec validation (max 5MB, formats acceptés)
**And** après création, la catégorie apparaît dans la liste
**And** le cache Redis catégories est invalidé automatiquement

**Given** je veux réorganiser les catégories
**When** je les glisse-dépose (drag & drop)
**Then** l'ordre d'affichage frontend est mis à jour immédiatement
**And** le cache Redis est invalidé

**Given** je sélectionne plusieurs catégories
**When** j'utilise les actions groupées
**Then** je peux activer/désactiver les catégories sélectionnées en masse

**Given** je consulte le détail d'une catégorie
**When** j'accède à la page détail
**Then** je vois la liste des produits associés
**And** je peux éditer la catégorie directement depuis cette vue

---

## Epic 11: Gestion Commandes & Utilisateurs

**Goal**: Permettre aux administrateurs de gérer les commandes (suivi statuts, paiements) et les utilisateurs (liste, actions administratives).

### Story 11.1: Gestion Commandes avec Statuts

As a **administrateur Althea Systems**,
I want **consulter et gérer toutes les commandes clients**,
So that **je peux suivre le statut des commandes et intervenir si nécessaire**.

**Acceptance Criteria:**

**Given** je suis sur la page "Gestion des Commandes"
**When** je consulte la liste
**Then** je vois un tableau avec colonnes : N° commande, date et heure, client (nom/email), montant TTC, statut, mode de paiement, statut du paiement
**And** je peux trier par n'importe quelle colonne
**And** je peux rechercher par N° commande, nom/email client
**And** je peux filtrer par statut commande (En attente, En cours, Terminée, Annulée) et statut paiement (Validé, En attente, Échoué, Remboursé)
**And** les statuts sont affichés avec codes couleur : En attente (jaune), En cours (bleu), Terminée (vert), Annulée (rouge)

**Given** je clique sur une commande
**When** j'accède au détail
**Then** je vois toutes les informations : N° commande, date/heure, statut actuel (modifiable), historique changements statut (avec date et utilisateur), informations paiement (mode, date, statut), produits commandés, adresse livraison, lien vers facture
**And** je peux modifier le statut de la commande (ex: passer de "En attente" à "En cours")
**And** l'historique des changements est automatiquement enregistré avec timestamp et utilisateur admin

---

### Story 11.2: Gestion Utilisateurs avec Actions Administratives

As a **administrateur Althea Systems**,
I want **gérer les utilisateurs de la plateforme**,
So that **je peux administrer les comptes, assister les clients et respecter le RGPD**.

**Acceptance Criteria:**

**Given** je suis sur la page "Gestion des Utilisateurs"
**When** je consulte la liste
**Then** je vois un tableau avec colonnes : nom complet, email, date d'inscription, statut compte (actif/inactif/en attente validation), nombre de commandes, CA total généré, dernière connexion, liste adresses facturation
**And** je peux trier par nom, email, date d'inscription, statut, nombre commandes, CA total
**And** je peux rechercher par nom ou email
**And** je peux filtrer par statut compte

**Given** je sélectionne un utilisateur
**When** j'accède aux actions administratives
**Then** je peux :
  - Envoyer un email à l'utilisateur
  - Réinitialiser le mot de passe (génère un lien de reset envoyé par email)
  - Désactiver le compte (l'utilisateur ne peut plus se connecter)
  - Supprimer le compte (avec avertissement RGPD et confirmation)
**And** toutes actions sont loggées avec timestamp et admin ayant effectué l'action

---

## Epic 12: Gestion Factures & Avoirs

**Goal**: Gérer la génération automatique des factures au format PDF, leur modification, et la création automatique d'avoirs en cas de suppression (GAP partiel sur PDF avancé).

### Story 12.1: Génération Automatique Factures PDF

As a **système Althea Systems**,
I want **générer automatiquement une facture PDF lors de la validation d'un paiement**,
So that **chaque commande dispose d'une facture officielle pour le client et la comptabilité**.

**Acceptance Criteria:**

**Given** un paiement Stripe est validé (webhook confirmation)
**When** la commande passe au statut "Validé"
**Then** une facture est créée automatiquement dans la base de données
**And** un numéro de facture unique est généré (format : FAC-YYYY-NNNN)
**And** un fichier PDF de la facture est généré avec template HTML
**And** le PDF inclut : logo Althea Systems, numéro facture, date émission, infos client (nom, adresse), détail produits (nom, quantité, prix unitaire, total), montant HT, TVA, montant TTC, mentions légales
**And** le PDF est stocké accessible depuis back-office et compte client

**Note**: Le PDF existe partiellement (`lib/pdf.ts`), mais fonctionnalités complètes à vérifier/compléter = GAP partiel.

---

### Story 12.2: Gestion Factures avec Actions Admin

As a **administrateur Althea Systems**,
I want **gérer les factures émises avec différentes actions**,
So that **je peux télécharger, renvoyer, modifier ou supprimer des factures si nécessaire**.

**Acceptance Criteria:**

**Given** je suis sur la page "Gestion des Factures"
**When** je consulte la liste
**Then** je vois un tableau avec colonnes : N° facture, date d'émission, client, N° commande associée (lien cliquable), montant TTC, statut (payée, en attente, annulée)
**And** je peux trier par n'importe quelle colonne
**And** je peux rechercher par N° facture, client, N° commande
**And** je peux filtrer par statut

**Given** je clique sur une facture
**When** j'accède aux actions
**Then** je peux :
  - Télécharger la facture au format PDF
  - Renvoyer la facture par email au client
  - Modifier la facture via un formulaire de modification
  - Supprimer la facture (génère automatiquement un avoir)

---

### Story 12.3: Génération Automatique Avoirs

As a **système Althea Systems**,
I want **créer automatiquement un avoir lorsqu'une facture est supprimée**,
So that **la comptabilité reste conforme et traçable**.

**Acceptance Criteria:**

**Given** un administrateur supprime une facture
**When** la suppression est confirmée
**Then** un avoir est créé automatiquement dans la base de données
**And** l'avoir a un numéro unique (format : AVO-YYYY-NNNN)
**And** l'avoir est lié à la facture supprimée
**And** l'avoir affiche un montant négatif égal à celui de la facture
**And** l'avoir capture le motif (annulation, remboursement, erreur)
**And** un PDF de l'avoir est généré avec template similaire à la facture
**And** le PDF d'avoir inclut mention "AVOIR" et référence facture annulée

**Given** je suis sur la page "Gestion des Avoirs"
**When** je consulte la liste
**Then** je vois un tableau avec colonnes : N° avoir, facture liée (lien cliquable), date émission, client, montant (négatif), motif
**And** je peux trier, rechercher et filtrer les avoirs
**And** je peux télécharger le PDF de l'avoir et l'envoyer par email

---

## Epic 13: Internationalisation & Accessibilité

**Goal**: Garantir que la plateforme est accessible à tous les utilisateurs (WCAG 2.1) et supporte le multi-langues avec RTL pour arabe et hébreu.

### Story 13.1: Support Multi-Langues avec RTL

As a **utilisateur international**,
I want **changer la langue du site et bénéficier d'un affichage adapté au sens de lecture**,
So that **je peux utiliser la plateforme dans ma langue maternelle confortablement**.

**Acceptance Criteria:**

**Given** j'accède au site pour la première fois
**When** je consulte le menu
**Then** je vois un sélecteur de langue (drapeau ou dropdown)
**And** les langues disponibles incluent au minimum le français, anglais, arabe, hébreu
**And** je peux changer de langue à tout moment

**Given** je sélectionne l'arabe ou l'hébreu
**When** la langue change
**Then** le layout devient RTL (right-to-left)
**And** tous les textes sont traduits dans la langue sélectionnée
**And** les composants UI s'adaptent au sens de lecture (menus, formulaires, etc.)
**And** ma préférence de langue est sauvegardée (cookie ou compte utilisateur)

**Given** je suis administrateur au back-office
**When** j'accède au back-office
**Then** le back-office est en anglais uniquement (pour simplifier la gestion)

---

### Story 13.2: Accessibilité WCAG 2.1

As a **utilisateur avec handicap**,
I want **que le site soit accessible avec technologies d'assistance**,
So that **je peux naviguer, consulter et acheter les produits sans barrière**.

**Acceptance Criteria:**

**Given** je navigue sur le site avec lecteur d'écran
**When** j'utilise le lecteur
**Then** tous les éléments interactifs (boutons, liens, formulaires) ont des labels appropriés
**And** les images ont des attributs alt descriptifs
**And** la structure sémantique HTML est correcte (headings h1-h6, nav, main, footer)
**And** les annonces ARIA sont utilisées pour les changements dynamiques (panier mis à jour, messages d'erreur)

**Given** je navigue au clavier uniquement (sans souris)
**When** j'utilise Tab, Enter, Espace
**Then** je peux accéder à tous les éléments interactifs dans un ordre logique
**And** le focus est visible clairement (outline)
**And** je peux fermer les modales et dropdowns avec Escape
**And** les menus dropdown sont accessibles au clavier

**Given** je consulte le site avec déficience visuelle
**When** je vérifie les contrastes
**Then** tous les contrastes texte/arrière-plan respectent WCAG 2.1 niveau AA minimum
**And** les couleurs ne sont pas le seul moyen de transmettre l'information (ex: statuts ont aussi des icônes)

**Given** je remplis des formulaires
**When** je fais une erreur de validation
**Then** les messages d'erreur sont clairs, visibles et associés aux champs concernés
**And** les champs requis sont indiqués avec aria-required
**And** les erreurs sont annoncées aux lecteurs d'écran

---

## Epic 14: Documentation & Tests (GAPS)

**Goal**: Combler les gaps identifiés du CDC concernant la documentation API Swagger et l'implémentation de suites de tests complètes (unitaires, intégration, E2E).

### Story 14.1: Documentation API avec Swagger/OpenAPI (GAP)

As a **développeur frontend ou intégrateur tiers**,
I want **consulter une documentation API interactive Swagger**,
So that **je peux comprendre et tester tous les endpoints disponibles facilement**.

**Acceptance Criteria:**

**Given** je veux consulter la documentation API
**When** j'accède à l'URL /api/docs
**Then** je vois une interface Swagger UI interactive
**And** tous les endpoints API sont documentés : méthodes HTTP, paramètres, corps requête, réponses possibles, codes statut
**And** les endpoints sont organisés par ressources : /products, /categories, /orders, /users, /auth, /stripe, /upload, /carousel-slides, /invoices, /contact
**And** je peux tester les endpoints directement depuis Swagger UI
**And** l'authentification est documentée (JWT Bearer token pour routes protégées)
**And** les schémas de données (types, modèles) sont définis clairement

**Given** je suis développeur back-end
**When** je crée ou modifie un endpoint
**Then** je documente l'endpoint avec des annotations swagger-jsdoc dans le code
**And** la documentation Swagger se met à jour automatiquement au rebuild

**Note**: Cette story est un GAP identifié - Swagger n'est pas implémenté malgré mention dans CDC (livrables).

---

### Story 14.2: Tests Unitaires et d'Intégration (GAP)

As a **développeur Althea Systems**,
I want **disposer de suites de tests unitaires et d'intégration complètes**,
So that **je peux garantir la qualité du code et éviter les régressions**.

**Acceptance Criteria:**

**Given** le projet est configuré pour les tests
**When** je lance `npm run test`
**Then** les tests unitaires s'exécutent avec Vitest + Testing Library
**And** tous les composants React ont des tests unitaires co-localisés (*.test.tsx)
**And** les tests couvrent les comportements clés : rendu, interactions utilisateur, props, états
**And** un rapport de couverture est généré (objectif > 80%)

**Given** je développe des API Routes
**When** je lance `npm run test:integration`
**Then** les tests d'intégration s'exécutent avec mock Prisma
**And** tous les endpoints critiques ont des tests : GET, POST, PATCH, DELETE
**And** les tests vérifient : codes HTTP corrects, validation Zod, gestion erreurs, authentification/autorisation

**Given** les tests échouent
**When** je lance la CI/CD
**Then** le build échoue et le déploiement est bloqué
**And** je reçois une notification des tests en échec

**Note**: Cette story est un GAP identifié - les tests ne sont pas implémentés malgré structure définie et mention CDC.

---

### Story 14.3: Tests End-to-End (E2E) avec Playwright (GAP)

As a **développeur Althea Systems**,
I want **exécuter des tests E2E automatisés sur les flows critiques**,
So that **je peux valider que l'application fonctionne correctement du point de vue utilisateur**.

**Acceptance Criteria:**

**Given** le projet est configuré pour Playwright E2E
**When** je lance `npm run test:e2e`
**Then** les tests E2E s'exécutent en mode headless (ou headed si spécifié)
**And** les tests couvrent les flows critiques :
  - Inscription utilisateur avec confirmation email
  - Connexion credentials et OAuth
  - Parcours complet : homepage → catégorie → produit → ajouter panier → checkout → paiement Stripe (mode test) → confirmation
  - Gestion compte : modification profil, ajout adresse, ajout carte
  - Back-office : connexion admin avec 2FA → dashboard → CRUD produit → CRUD catégorie → gestion commande
**And** les tests utilisent des fixtures de données pour isolation
**And** les tests prennent des screenshots en cas d'échec pour debugging
**And** un rapport HTML est généré avec résultats détaillés

**Given** je configure la CI/CD
**When** un PR est créé
**Then** les tests E2E s'exécutent automatiquement
**And** le merge est bloqué si les tests échouent

**Note**: Cette story est un GAP identifié - Playwright/Cypress E2E non implémentés malgré mention CDC.

---

## 🚨 ANALYSE DES GAPS CDC

### Gap 1: Chatbot "Contact Me" (Epic 8, Story 8.2)

**Statut**: ⚠️ **NON IMPLÉMENTÉ**

**Description CDC**:
- Bouton "Contact Me" déclenchant un chatbot en temps réel
- Réponses instantanées aux questions fréquentes
- Escalade vers agent humain si question complexe
- Capture informations utilisateur (email, sujet)
- Interactions enregistrées et accessibles dans back-office

**Architecture**:
- Structure prévue : `components/shared/chatbot.tsx`
- Technologie suggérée : OpenAI/Anthropic API
- Persistence : PostgreSQL ou Redis

**Actions requises**:
1. Intégration API chatbot (OpenAI/Anthropic)
2. Composant UI chatbot avec historique conversation
3. Système d'escalade vers support humain
4. Enregistrement conversations en base de données
5. Interface back-office pour consulter conversations

---

### Gap 2: Documentation API Swagger/OpenAPI (Epic 14, Story 14.1)

**Statut**: ⚠️ **NON IMPLÉMENTÉ**

**Description CDC**:
- Documentation complète de tous les endpoints API
- Méthodes HTTP, paramètres, réponses possibles
- Outil Swagger ou Postman pour tests interactifs
- Livrable essentiel pour développeurs et intégrateurs

**Architecture**:
- Endpoints API définis et opérationnels
- Manque : documentation auto-générée

**Actions requises**:
1. Setup swagger-jsdoc + swagger-ui-express
2. Annotations JSDoc sur tous les endpoints API Routes
3. Définition schémas de données (types, modèles)
4. Documentation authentification (JWT, OAuth)
5. Interface Swagger UI accessible à `/api/docs`
6. Export OpenAPI spec pour intégrations tierces

---

### Gap 3: Tests (Epic 14, Stories 14.2 & 14.3)

**Statut**: ⚠️ **NON IMPLÉMENTÉS**

**Description CDC**:
- Tests unitaires pour garantir qualité code
- Tests d'intégration pour valider API
- Tests E2E pour valider flows utilisateur
- Tests automatisés dans CI/CD
- Frameworks mentionnés : Jest, Mocha (ou similaires)

**Architecture**:
- Structure définie : `__tests__/unit/`, `__tests__/integration/`, `e2e/`
- Tests co-localisés : `*.test.ts` à côté des fichiers source
- Manque : suites de tests complètes

**Actions requises**:

**Tests Unitaires** :
1. Setup Vitest + Testing Library
2. Tests composants React (rendu, interactions, props)
3. Tests fonctions utilitaires (lib/)
4. Couverture > 80%

**Tests Intégration** :
1. Tests API Routes avec mock Prisma
2. Validation endpoints : auth, products, orders, users
3. Tests validations Zod
4. Tests gestion erreurs et codes HTTP

**Tests E2E** :
1. Setup Playwright ou Cypress
2. Tests flows critiques : inscription, connexion, checkout, admin
3. Fixtures données pour isolation
4. Screenshots en cas d'échec
5. Intégration CI/CD

---

### Gap 4: Génération PDF Factures/Avoirs Avancée (Epic 12, Stories 12.1 & 12.3)

**Statut**: 🟡 **PARTIELLEMENT IMPLÉMENTÉ**

**Description CDC**:
- Génération automatique factures PDF à validation paiement
- Template HTML professionnel avec logo, détails commande
- Téléchargement et envoi par email
- Génération automatique avoirs lors suppression facture
- Possibilité d'imprimer et stocker

**Architecture**:
- `lib/pdf.ts` existe
- Manque : vérification/complétion fonctionnalités complètes
- Template HTML → PDF via Puppeteer ou similaire

**Actions requises**:
1. Vérifier implémentation actuelle `lib/pdf.ts`
2. Créer templates HTML professionnels factures/avoirs
3. Générer PDF via Puppeteer/PDFKit
4. Intégrer génération automatique lors validation paiement (webhook Stripe)
5. Intégrer génération automatique avoir lors suppression facture
6. Téléchargement/envoi email depuis back-office et compte client
7. Tests génération PDF

---

## RÉCAPITULATIF GAPS CDC

| Gap | Epic | Story | Priorité | Effort | Impact Business |
|-----|------|-------|----------|--------|-----------------|
| **Chatbot "Contact Me"** | Epic 8 | 8.2 | Haute | Moyen | Élevé - Améliore support client |
| **Documentation API Swagger** | Epic 14 | 14.1 | Moyenne | Faible | Moyen - Facilite intégrations |
| **Tests Unitaires/Intégration** | Epic 14 | 14.2 | Haute | Élevé | Élevé - Garantit qualité |
| **Tests E2E** | Epic 14 | 14.3 | Haute | Élevé | Élevé - Évite régressions |
| **PDF Factures/Avoirs Complet** | Epic 12 | 12.1, 12.3 | Moyenne | Faible | Moyen - Conformité comptable |

---

## RECOMMANDATIONS D'IMPLÉMENTATION

### Phase 1 : Fondations (Priorité Haute)
1. **Tests Unitaires & Intégration** (Story 14.2) - Garantir qualité code
2. **Tests E2E** (Story 14.3) - Éviter régressions sur flows critiques
3. **PDF Factures Complet** (Stories 12.1, 12.3) - Conformité légale/comptable

### Phase 2 : Expérience Utilisateur (Priorité Haute)
4. **Chatbot "Contact Me"** (Story 8.2) - Améliorer support client instantané

### Phase 3 : Intégrations (Priorité Moyenne)
5. **Documentation API Swagger** (Story 14.1) - Faciliter développements futurs

---

**Date de création**: 2026-01-08
**Auteur**: Saam (avec Claude Code)
**Version**: 1.0
