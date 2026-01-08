# 🗺️ Althea Systems - Roadmap Développement

**Projet:** Plateforme e-commerce B2B pour matériel médical
**Stack:** Next.js 16 + TypeScript + Prisma + PostgreSQL + Redis + Stripe

---

## 👥 Équipe & Responsabilités

| Dev | Spécialité | Scope |
|-----|------------|-------|
| **DEV-1** | Frontend Public | Pages site, composants produits, panier/checkout, recherche |
| **DEV-2** | Frontend Admin | Dashboard admin, tableaux CRUD, formulaires, graphiques stats |
| **DEV-3** | Backend & API | API Routes, Prisma schema, Stripe, génération PDF |
| **Samy** | Auth & Infra | NextAuth config, middleware protection, Docker, Redis cache |
| **TEAM** | Collaboratif | Stories nécessitant frontend + backend |

---

## 🎯 Ordre d'Implémentation Recommandé

> **💡 Note:** Pour les détails complets (acceptance criteria, requirements), consultez [`_bmad-output/planning-artifacts/epics.md`](_bmad-output/planning-artifacts/epics.md)

---

### 🔐 Phase 1: Fondations - Authentification & Sécurité (CRITIQUE)

**Responsable:** Samy
**Epic 6:** Authentification & Sécurité
**Durée estimée:** 1-2 semaines

**Pourquoi commencer par ça:** L'auth est la **fondation** de tout le projet. Sans ça, impossible de:
- Protéger les routes admin
- Gérer les sessions utilisateurs
- Implémenter le checkout
- Sécuriser les API

#### Stories à implémenter (dans l'ordre):

- [ ] **6.1** - Inscription utilisateur avec validation email `[Samy]`
  - Formulaire inscription (nom, email, password)
  - Validation Zod client + serveur
  - Hashing bcrypt
  - Email de confirmation avec lien sécurisé (validité 24h)
  - Activation du compte

- [ ] **6.2** - Connexion multi-providers (Credentials + OAuth) `[Samy]`
  - Connexion email/password
  - OAuth Google
  - OAuth GitHub
  - Session JWT stateless (cookies httpOnly, 30 jours)
  - Gestion "Se souvenir de moi"

- [ ] **6.3** - Réinitialisation mot de passe `[Samy]`
  - Page "Mot de passe oublié"
  - Génération lien sécurisé (validité 24h)
  - Email avec lien reset
  - Page réinitialisation avec nouveau password
  - Validation critères sécurité

- [ ] **6.4** - 2FA obligatoire administrateurs avec TOTP `[Samy]`
  - Setup 2FA avec QR code (Google Authenticator, Authy)
  - Stockage secret TOTP (Base32, chiffré)
  - Page vérification code 6 chiffres
  - Middleware protection routes /admin/* (vérif 2FA)
  - Status "2FA vérifié" dans session

**✅ Validation Phase 1:** L'auth fonctionne, on peut créer des comptes, se connecter, et protéger les routes admin.

---

### 🛠️ Phase 2: Back-office Admin - Gestion Contenu

**Responsables:** DEV-2 (Frontend) + DEV-3 (Backend)
**Epic 10:** Gestion Produits & Catégories
**Durée estimée:** 2-3 semaines

**Pourquoi en 2ème:** Besoin de créer du contenu (catégories + produits) pour pouvoir tester le front public ensuite.

#### Stories à implémenter (dans l'ordre):

- [ ] **10.3** - CRUD complet catégories avec hiérarchie `[TEAM: DEV-2 + DEV-3]`
  - Page liste catégories (tableau hiérarchique)
  - Formulaire création/édition catégorie
  - Upload image catégorie vers Cloudflare R2 (max 5MB, validation formats)
  - Drag & drop pour réorganiser l'ordre d'affichage
  - Actions groupées (activer/désactiver en masse)
  - Invalidation cache Redis après mutations

- [ ] **10.1** - CRUD complet produits avec upload images `[TEAM: DEV-2 + DEV-3]`
  - Tableau produits (colonnes: image, nom, catégorie, prix HT/TTC, stock, statut)
  - Tri, recherche, filtres (catégorie, disponibilité, statut)
  - Formulaire création/édition produit complet
  - Upload multiple images (drag & drop, max 5MB, JPEG/PNG/WebP/GIF)
  - Upload vers Cloudflare R2 + sanitization noms fichiers
  - Réorganisation images par glisser-déposer
  - Calcul auto prix TTC (TVA: 20%/10%/5.5%/0%)
  - Invalidation cache Redis produits

- [ ] **10.2** - Actions groupées produits `[TEAM: DEV-2 + DEV-3]`
  - Sélection multiple (checkboxes)
  - Suppression en masse (avec confirmation)
  - Modification statut en masse (publier/dépublier)
  - Modification catégorie en masse
  - Export sélection (CSV/Excel)
  - Invalidation cache Redis pour tous produits concernés

**✅ Validation Phase 2:** Le back-office permet de créer des catégories et produits. On a du contenu pour tester le front.

---

### 🏠 Phase 3: Frontend Public - Homepage & Catalogue

**Responsable:** DEV-1 (Frontend) + DEV-3 (Backend pour API)
**Epics 1, 2, 3:** Homepage, Catalogue, Pages Produits
**Durée estimée:** 2-3 semaines

**Pourquoi en 3ème:** Maintenant qu'on a du contenu (produits/catégories), on peut construire le front public.

#### Epic 1: Homepage & Navigation

- [ ] **1.1** - Carrousel homepage dynamique `[DEV-1]`
  - Composant carrousel (max 3 slides)
  - Défilement automatique + navigation manuelle (points, flèches)
  - Fetch slides depuis back-office
  - Responsive mobile/desktop

- [ ] **1.2** - Grille catégories de produits `[DEV-1]`
  - Grille responsive (adapté mobile/desktop)
  - Fetch catégories avec ordre défini back-office
  - Chaque catégorie cliquable → page catégorie

- [ ] **1.3** - Section "Top Produits du moment" `[DEV-1]`
  - Grille produits vedettes
  - Sélection + ordre depuis back-office
  - Chaque produit cliquable → page détail

#### Epic 2: Catalogue & Recherche Produits

- [ ] **2.1** - Navigation catégorie avec affichage produits `[DEV-1]`
  - Page catégorie (image principale + nom + description)
  - Liste produits (format liste mobile, grille desktop)
  - Affichage: nom, prix, statut disponibilité

- [ ] **2.2** - Tri dynamique produits par priorité et disponibilité `[DEV-1]`
  - Tri auto: produits prioritaires → non prioritaires → épuisés (en dernier)
  - Produits épuisés grisés visuellement
  - Message "En rupture de stock"

- [ ] **2.3** - Recherche avancée multi-facettes `[TEAM: DEV-1 + DEV-3]`
  - Filtres: texte titre, description, caractéristiques, prix min/max, catégorie, disponibilité
  - Règles correspondance: exacte > 1 char diff > commence par > contient
  - Performance < 100ms
  - Résultats temps réel depuis back-office (cache Redis 5min)

- [ ] **2.4** - Tri et pagination résultats recherche `[DEV-1]`
  - Tri: prix (asc/desc), nouveauté, disponibilité
  - Pagination fluide (navigation lots + saut page précise)

#### Epic 3: Page Produit & Détails

- [ ] **3.1** - Page détail produit complète `[DEV-1]`
  - Carrousel illustrations produit
  - Nom + description + caractéristiques techniques
  - Prix + statut disponibilité
  - Bouton "Ajouter au panier" (désactivé si rupture)

- [ ] **3.2** - Produits similaires recommandés `[DEV-1]`
  - Section "Produits similaires"
  - 6 produits aléatoires même catégorie
  - Priorité produits disponibles

**✅ Validation Phase 3:** Le site public est navigable, les produits sont visibles et recherchables.

---

### 🛒 Phase 4: Parcours d'Achat - Panier & Checkout

**Responsables:** DEV-1 (Frontend) + DEV-3 (Backend Stripe) + Samy (Auth checkout)
**Epics 4, 5:** Panier & Checkout
**Durée estimée:** 2-3 semaines

**Pourquoi en 4ème:** Le parcours d'achat nécessite l'auth (Phase 1) et des produits (Phase 2-3).

#### Epic 4: Panier & Gestion Articles

- [ ] **4.1** - Gestion panier universelle `[TEAM: DEV-1 + DEV-3]`
  - Page panier accessible (connecté + non-connecté)
  - Liste produits: nom, quantité, prix unitaire, total
  - Modification quantité + suppression produits
  - Calcul total temps réel (taxes + promos)
  - Rappel connexion pour sauvegarder panier
  - Option "continuer comme invité"

- [ ] **4.2** - Gestion produits indisponibles dans panier `[DEV-1]`
  - Détection produits devenus indisponibles
  - Message d'alerte + marquage "Indisponible"
  - Ajustement total panier
  - Blocage finalisation tant qu'indisponibles présents

#### Epic 5: Processus Checkout & Paiement

- [ ] **5.1** - Connexion ou inscription au checkout `[TEAM: DEV-1 + Samy]`
  - Page checkout avec options: connexion, inscription, invité
  - Formulaire inscription inline
  - Email confirmation (continuer checkout sans attendre validation)

- [ ] **5.2** - Sélection adresse facturation/livraison `[DEV-1]`
  - Choix parmi adresses enregistrées (si connecté)
  - Formulaire nouvelle adresse (validation Zod)
  - Sauvegarde sur compte (si connecté)

- [ ] **5.3** - Sélection méthode de paiement `[TEAM: DEV-1 + DEV-3]`
  - Choix parmi cartes enregistrées (si connecté)
  - Formulaire nouvelle carte (Stripe Elements)
  - Validation PCI-DSS via Stripe
  - Sauvegarde carte (si connecté)

- [ ] **5.4** - Page confirmation commande `[DEV-1]`
  - Récapitulatif complet: produits, taxes, total
  - Adresse facturation + 4 derniers chiffres carte
  - Bouton "Confirmer l'achat"
  - Retour aux étapes précédentes possible

- [ ] **5.5** - Traitement paiement Stripe et confirmation `[DEV-3]`
  - Création PaymentIntent Stripe
  - Confirmation paiement client
  - Webhook Stripe validation serveur
  - Création commande en base (statut "En attente")
  - Génération facture automatique
  - Email confirmation commande
  - Redirection page succès

**✅ Validation Phase 4:** Le parcours d'achat complet fonctionne de bout en bout.

---

### 📊 Phase 5: Back-office Avancé - Dashboard & Gestion

**Responsables:** DEV-2 (Frontend) + DEV-3 (Backend) + Samy (Actions admin)
**Epics 9, 11, 12:** Dashboard, Gestion Commandes/Users, Factures
**Durée estimée:** 2-3 semaines

#### Epic 9: Back-office Dashboard & Analytics

- [ ] **9.1** - Dashboard avec indicateurs clés (cards) `[TEAM: DEV-2 + DEV-3]`
  - Card CA (jour/semaine/mois sélectionnable)
  - Card nombre commandes du jour
  - Card alertes stock (badge rouge si >0)
  - Card messages non traités (badge avec nombre)
  - Données temps réel depuis PostgreSQL

- [ ] **9.2** - Graphiques analytics ventes `[TEAM: DEV-2 + DEV-3]`
  - Graphique camembert ventes par catégorie (7j/5sem)
  - Histogramme ventes par jour/semaine
  - Histogramme multi-couches paniers moyens par catégorie
  - Période modifiable

#### Epic 11: Gestion Commandes & Utilisateurs

- [ ] **11.1** - Gestion commandes avec statuts `[TEAM: DEV-2 + DEV-3]`
  - Tableau commandes (tri, recherche, filtres)
  - Colonnes: N° commande, date, client, montant, statut, paiement
  - Statuts colorés (En attente/En cours/Terminée/Annulée)
  - Détail commande: historique modifications, infos paiement, facture
  - Modification statut + logging automatique

- [ ] **11.2** - Gestion utilisateurs avec actions administratives `[TEAM: DEV-2 + DEV-3 + Samy]`
  - Tableau users (tri, recherche, filtres)
  - Colonnes: nom, email, inscription, statut, commandes, CA total
  - Actions: envoyer email, reset password, désactiver, supprimer (RGPD)
  - Logging toutes actions admin

#### Epic 12: Gestion Factures & Avoirs

- [ ] **12.1** - Génération automatique factures PDF `[DEV-3]`
  - Génération auto lors validation paiement (webhook Stripe)
  - Numéro unique (FAC-YYYY-NNNN)
  - Template HTML → PDF (Puppeteer/PDFKit)
  - Contenu: logo, N° facture, date, client, produits, HT/TVA/TTC, mentions légales
  - Stockage PDF accessible back-office + compte client

- [ ] **12.2** - Gestion factures avec actions admin `[TEAM: DEV-2 + DEV-3]`
  - Tableau factures (tri, recherche, filtres)
  - Colonnes: N° facture, date, client, N° commande, montant, statut
  - Actions: télécharger PDF, renvoyer email, modifier, supprimer (→ génère avoir)

- [ ] **12.3** - Génération automatique avoirs `[DEV-3]`
  - Génération auto lors suppression facture
  - Numéro unique (AVO-YYYY-NNNN)
  - Lien vers facture annulée + motif
  - Montant négatif
  - Template PDF similaire facture (mention "AVOIR")
  - Tableau gestion avoirs (télécharger, envoyer email)

**✅ Validation Phase 5:** Le back-office est complet avec dashboard, gestion commandes/users, et factures.

---

### 👤 Phase 6: Compte Utilisateur & Profil

**Responsables:** DEV-1 (Frontend) + DEV-3 (Backend) + Samy (Auth)
**Epic 7:** Compte Utilisateur & Profil
**Durée estimée:** 1 semaine

- [ ] **7.1** - Gestion informations personnelles `[TEAM: DEV-1 + Samy]`
  - Page "Mes paramètres"
  - Modification nom, email (confirmation nouvelle adresse), password
  - Validation Zod client + serveur
  - Message confirmation

- [ ] **7.2** - Gestion adresses et méthodes de paiement `[TEAM: DEV-1 + DEV-3]`
  - Section "Mes adresses" (liste, ajouter, modifier, supprimer)
  - Section "Méthodes de paiement" (liste masquée, ajouter via Stripe, supprimer, défaut)
  - Conformité PCI-DSS

- [ ] **7.3** - Historique commandes avec factures PDF `[TEAM: DEV-1 + DEV-3]`
  - Page "Mes commandes" (regroupées par année)
  - Liste: nom produit, date, montant, statut
  - Détail commande: produits, paiement, adresse, lien PDF facture
  - Filtres: année, type produit
  - Recherche: nom produit, date

**✅ Validation Phase 6:** Les utilisateurs peuvent gérer leur compte complet.

---

### 💬 Phase 7: Contact & Support Client

**Responsables:** DEV-1 (Frontend) + DEV-3 (Backend/API)
**Epic 8:** Contact & Support Client
**Durée estimée:** 1-2 semaines

- [ ] **8.1** - Formulaire de contact `[TEAM: DEV-1 + DEV-3]`
  - Page contact avec formulaire (email, sujet, message)
  - Validation avant soumission
  - Confirmation visuelle
  - Message accessible back-office (traitement support)
  - Email confirmation envoyé

- [ ] **8.2** - Chatbot "Contact Me" interactif (GAP) `[TEAM: DEV-1 + DEV-3]`
  - Bouton "Contact Me" (fenêtre chat temps réel)
  - Intégration API chatbot (OpenAI/Anthropic)
  - Réponses instantanées questions courantes
  - Escalade vers agent humain si complexe
  - Capture infos (email, sujet)
  - Historique conversations enregistré (accessible back-office)

**⚠️ Note:** Story 8.2 = GAP (non implémenté actuellement, fonctionnalité mentionnée CDC mais manquante)

**✅ Validation Phase 7:** Les clients peuvent contacter le support via formulaire et chatbot.

---

### 🌍 Phase 8: Internationalisation & Accessibilité

**Responsables:** DEV-1 + DEV-2 (tous composants)
**Epic 13:** i18n & Accessibilité
**Durée estimée:** 1-2 semaines

- [ ] **13.1** - Support multi-langues avec RTL `[TEAM: DEV-1 + DEV-2]`
  - Sélecteur langue (drapeau/dropdown) dans menu
  - Langues disponibles: français, anglais, arabe, hébreu
  - Layout RTL (right-to-left) pour arabe/hébreu
  - Traductions tous textes
  - Composants UI adaptés au sens de lecture
  - Sauvegarde préférence langue (cookie/compte)
  - Back-office en anglais uniquement

- [ ] **13.2** - Accessibilité WCAG 2.1 `[TEAM: DEV-1 + DEV-2]`
  - Labels appropriés éléments interactifs
  - Attributs alt images descriptifs
  - Structure sémantique HTML (h1-h6, nav, main, footer)
  - Annonces ARIA (panier mis à jour, erreurs)
  - Navigation clavier complète (Tab, Enter, Espace, Escape)
  - Focus visible (outline)
  - Contrastes WCAG 2.1 niveau AA minimum
  - Couleurs + icônes (pas couleur seule pour info)
  - Messages erreur clairs + aria-required

**✅ Validation Phase 8:** Le site est accessible et multilingue (RTL inclus).

---

### 📚 Phase 9: Documentation & Tests (GAPS)

**Responsables:** Tous les devs
**Epic 14:** Documentation & Tests
**Durée estimée:** 2-3 semaines

- [ ] **14.1** - Documentation API avec Swagger/OpenAPI (GAP) `[DEV-3]`
  - Setup swagger-jsdoc + swagger-ui-express
  - Annotations JSDoc tous endpoints API Routes
  - Interface Swagger UI à /api/docs
  - Documentation: méthodes HTTP, paramètres, réponses, codes statut
  - Ressources organisées: /products, /categories, /orders, /users, /auth, /stripe, /upload, /carousel-slides, /invoices, /contact
  - Auth documentée (JWT Bearer token)
  - Schémas données (types, modèles)

- [ ] **14.2** - Tests unitaires et d'intégration (GAP) `[TEAM: Tous]`
  - Setup Vitest + Testing Library
  - Tests unitaires composants React (rendu, interactions, props, états)
  - Tests co-localisés (*.test.tsx)
  - Tests intégration API Routes (mock Prisma)
  - Tests: codes HTTP, validation Zod, erreurs, auth/autorisation
  - Couverture > 80%
  - CI/CD: build échoue si tests échouent

- [ ] **14.3** - Tests End-to-End (E2E) avec Playwright (GAP) `[TEAM: Tous]`
  - Setup Playwright
  - Tests flows critiques:
    - Inscription + confirmation email
    - Connexion credentials + OAuth
    - Parcours complet: homepage → catégorie → produit → panier → checkout → paiement (mode test) → confirmation
    - Gestion compte: profil, adresse, carte
    - Back-office: connexion admin 2FA → dashboard → CRUD produit/catégorie → gestion commande
  - Fixtures données (isolation)
  - Screenshots si échec (debugging)
  - Rapport HTML résultats
  - CI/CD: tests E2E auto sur PR (merge bloqué si échec)

**⚠️ Note:** Epic 14 = GAPS (fonctionnalités manquantes malgré mention CDC)

**✅ Validation Phase 9:** Le projet est documenté et testé complètement.

---

## 📦 Récapitulatif par Développeur

### 👨‍💻 Samy (Auth & Infra)
**Total:** 4 stories solo + participation TEAM

**Stories solo:**
- Phase 1: Epic 6 complet (4 stories) - **CRITIQUE, À FAIRE EN PREMIER**

**Stories TEAM:**
- Phase 4: 5.1 (Connexion checkout)
- Phase 5: 11.2 (Actions admin users)
- Phase 6: 7.1 (Gestion infos personnelles)

---

### 👨‍💻 DEV-1 (Frontend Public)
**Total:** 12 stories solo + participation TEAM

**Stories solo:**
- Phase 3: Epic 1 complet (3 stories), Epic 2 partiel (3 stories), Epic 3 complet (2 stories)
- Phase 4: Epic 4 partiel (1 story), Epic 5 partiel (3 stories)

**Stories TEAM:**
- Phase 3: 2.3 (Recherche avancée)
- Phase 4: 4.1 (Panier), 5.1 (Connexion checkout), 5.3 (Paiement)
- Phase 6: 7.1, 7.2, 7.3 (Profil complet)
- Phase 7: 8.1, 8.2 (Contact)
- Phase 8: 13.1, 13.2 (i18n + accessibilité)
- Phase 9: 14.2, 14.3 (Tests)

---

### 👨‍💻 DEV-2 (Frontend Admin)
**Total:** 0 stories solo + participation TEAM

**Stories TEAM:**
- Phase 2: Epic 10 complet (3 stories)
- Phase 5: Epic 9 complet (2 stories), Epic 11 complet (2 stories), Epic 12 partiel (1 story)
- Phase 8: 13.1, 13.2 (i18n + accessibilité)
- Phase 9: 14.2, 14.3 (Tests)

---

### 👨‍💻 DEV-3 (Backend & API)
**Total:** 3 stories solo + participation TEAM

**Stories solo:**
- Phase 4: 5.5 (Traitement Stripe)
- Phase 5: 12.1, 12.3 (Génération PDF factures/avoirs)

**Stories TEAM:**
- Phase 2: Epic 10 complet (3 stories)
- Phase 3: 2.3 (Recherche avancée)
- Phase 4: 4.1 (Panier), 5.3 (Paiement)
- Phase 5: Epic 9 complet (2 stories), Epic 11 complet (2 stories), 12.2 (Gestion factures)
- Phase 6: 7.2, 7.3 (Adresses/paiements, historique)
- Phase 7: 8.1, 8.2 (Contact)
- Phase 9: 14.1 (Swagger), 14.2, 14.3 (Tests)

---

## 📋 Artefacts de Documentation

**Référence complète disponible dans `_bmad-output/planning-artifacts/`:**

- ✅ **`prd.md`** - Product Requirements Document (exigences fonctionnelles/non-fonctionnelles)
- ✅ **`architecture.md`** - Décisions architecturales, stack technique, patterns
- ✅ **`epics.md`** - 14 épics + 40 stories détaillées avec acceptance criteria complets

**Ce fichier (`ROADMAP.md`) résume l'ordre d'exécution et les assignments.**

---

## ✅ Prochaine Étape

**Commencez par Phase 1 (Samy - Epic 6: Auth & Sécurité)**
C'est la **fondation critique** du projet. Sans l'auth, rien d'autre ne peut fonctionner.

**Après la Phase 1:** DEV-2 + DEV-3 peuvent attaquer la Phase 2 (Back-office) pendant que DEV-1 prépare les composants UI de base.

---

**Date de création:** 2026-01-08
**Dernière mise à jour:** 2026-01-08
