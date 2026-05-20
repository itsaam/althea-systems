# Backlog initial — Althea Systems

Annexe au document de cadrage (section 11). Livrable du kick-off, dérivé du périmètre MoSCoW (section 4.2).

## Conventions

- **ID** : `US-XXX` (séquentiel, par epic).
- **Format** : *En tant que [rôle], je peux/dois [action] afin de [bénéfice].*
- **Priorité MoSCoW** : `M` (Must), `S` (Should), `C` (Could).
- **Estimation** : suite de Fibonacci tronquée — 1, 2, 3, 5, 8 (story points).
- **Rôles** : *visiteur* (non connecté), *client* (connecté USER), *administrateur* (connecté ADMIN).

---

## Epic 1 — Authentification & Sécurité

- [ ] **US-001** — En tant que visiteur, je peux créer un compte avec email et mot de passe afin d'accéder à mon espace client. *(M, 3)*
- [ ] **US-002** — En tant que visiteur, je peux me connecter via Google ou GitHub afin d'éviter de gérer un nouveau mot de passe. *(M, 3)*
- [ ] **US-003** — En tant qu'administrateur, je dois valider un code TOTP à chaque connexion afin de protéger le back-office contre le vol de mot de passe. *(M, 5)*
- [ ] **US-004** — En tant qu'administrateur, je peux utiliser un code de secours à usage unique si je perds mon téléphone afin de récupérer l'accès au back-office. *(M, 3)*
- [ ] **US-005** — En tant qu'utilisateur, je peux réinitialiser mon mot de passe par email afin de récupérer l'accès à mon compte. *(M, 3)*
- [ ] **US-006** — En tant que visiteur, je dois confirmer mon email avant que mon compte ne soit activé afin d'éviter les inscriptions frauduleuses. *(M, 2)*
- [ ] **US-007** — En tant que client, je peux me déconnecter depuis n'importe quelle page afin de protéger ma session sur un poste partagé. *(M, 1)*
- [ ] **US-008** — En tant qu'administrateur, je peux activer ou désactiver la double authentification depuis mon profil afin de gérer mon niveau de sécurité. *(S, 3)*

---

## Epic 2 — Catalogue

- [ ] **US-101** — En tant que visiteur, je peux parcourir la liste des catégories sur la page d'accueil afin de découvrir l'offre. *(M, 2)*
- [ ] **US-102** — En tant que visiteur, je peux ouvrir une page de catégorie listant tous ses produits afin de comparer les références. *(M, 3)*
- [ ] **US-103** — En tant que visiteur, je peux consulter la fiche détaillée d'un produit (description, caractéristiques techniques, prix, stock, images) afin de prendre une décision d'achat. *(M, 5)*
- [ ] **US-104** — En tant que visiteur, je peux rechercher un produit par mot-clé depuis la barre de recherche globale afin de trouver rapidement une référence précise. *(M, 5)*
- [ ] **US-105** — En tant que visiteur, je peux filtrer les résultats de recherche par catégorie, prix et disponibilité afin d'affiner ma sélection. *(S, 5)*
- [ ] **US-106** — En tant que visiteur, je vois les produits mis en avant sur la page d'accueil afin de découvrir les nouveautés et best-sellers. *(M, 2)*
- [ ] **US-107** — En tant que visiteur, je vois un carrousel éditorial en haut de la page d'accueil afin d'avoir un aperçu des opérations en cours. *(S, 2)*
- [ ] **US-108** — En tant que visiteur, je vois la mention « rupture de stock » sur un produit indisponible afin d'éviter une tentative d'achat inutile. *(M, 1)*

---

## Epic 3 — Panier & Checkout

- [ ] **US-201** — En tant que visiteur, je peux ajouter un produit au panier depuis la fiche produit afin de préparer ma commande. *(M, 3)*
- [ ] **US-202** — En tant que visiteur, je peux modifier les quantités ou retirer un article depuis la page panier afin d'ajuster ma commande. *(M, 2)*
- [ ] **US-203** — En tant que visiteur, mon panier est conservé entre deux visites afin de ne pas avoir à le reconstituer. *(M, 3)*
- [ ] **US-204** — En tant que client, je dois être authentifié pour finaliser ma commande afin de garantir la traçabilité de l'achat. *(M, 2)*
- [ ] **US-205** — En tant que client, je peux saisir ou choisir une adresse de livraison lors du checkout afin de recevoir ma commande au bon endroit. *(M, 3)*
- [ ] **US-206** — En tant que client, je peux payer ma commande par carte bancaire via Stripe afin de valider mon achat en ligne. *(M, 5)*
- [ ] **US-207** — En tant que client, je reçois un email de confirmation avec la facture PDF après paiement afin d'avoir une preuve d'achat. *(M, 3)*
- [ ] **US-208** — En tant que client, je vois une page de confirmation détaillant ma commande après paiement afin d'être rassuré sur la transaction. *(M, 2)*
- [ ] **US-209** — En tant que client, mon paiement est validé par webhook Stripe afin de garantir la cohérence entre encaissement et commande enregistrée. *(M, 5)*
- [ ] **US-210** — En tant que client, je vois le détail des frais (sous-total, TVA, frais de port) avant de payer afin d'éviter toute surprise. *(M, 2)*

---

## Epic 4 — Espace client

- [ ] **US-301** — En tant que client, je peux consulter et modifier mon profil (nom, prénom, téléphone) afin de garder mes informations à jour. *(M, 2)*
- [ ] **US-302** — En tant que client, je peux gérer mon carnet d'adresses (ajout, modification, suppression, adresse par défaut) afin de simplifier mes commandes futures. *(M, 3)*
- [ ] **US-303** — En tant que client, je peux consulter l'historique de mes commandes avec leur statut afin de suivre mes achats. *(M, 3)*
- [ ] **US-304** — En tant que client, je peux télécharger la facture PDF de chacune de mes commandes afin de la conserver pour ma comptabilité. *(M, 2)*
- [ ] **US-305** — En tant que client, je peux télécharger l'avoir PDF associé à une commande remboursée afin de justifier le remboursement. *(S, 2)*
- [ ] **US-306** — En tant que client, je peux changer mon mot de passe depuis mon espace afin de renforcer la sécurité de mon compte. *(M, 2)*

---

## Epic 5 — Back-office administrateur

- [ ] **US-401** — En tant qu'administrateur, je peux consulter un tableau de bord avec ventes du jour, panier moyen et top produits afin de piloter l'activité. *(S, 5)*
- [ ] **US-402** — En tant qu'administrateur, je peux créer, modifier et supprimer un produit (nom, description, prix, stock, images, catégorie, TVA) afin de gérer le catalogue. *(M, 5)*
- [ ] **US-403** — En tant qu'administrateur, je peux uploader plusieurs images sur un produit (vers Cloudflare R2) afin d'illustrer la fiche. *(M, 3)*
- [ ] **US-404** — En tant qu'administrateur, je peux créer, modifier, supprimer et réordonner les catégories (avec arborescence) afin d'organiser le catalogue. *(M, 3)*
- [ ] **US-405** — En tant qu'administrateur, je peux consulter la liste des commandes avec filtres et tri afin de suivre les ventes. *(M, 3)*
- [ ] **US-406** — En tant qu'administrateur, je peux changer le statut d'une commande (confirmée, expédiée, livrée, annulée) afin de suivre son cycle de vie. *(M, 3)*
- [ ] **US-407** — En tant qu'administrateur, je peux émettre un avoir partiel ou total sur une commande afin de gérer un remboursement. *(S, 5)*
- [ ] **US-408** — En tant qu'administrateur, je peux consulter et désactiver un compte utilisateur afin de gérer les comportements abusifs. *(M, 2)*
- [ ] **US-409** — En tant qu'administrateur, je peux consulter la liste des factures avec leur statut afin de suivre la facturation. *(M, 2)*
- [ ] **US-410** — En tant qu'administrateur, je peux gérer le carrousel d'accueil (ajouter / modifier / réordonner les slides) avec un éditeur de texte riche afin de communiquer sur les opérations en cours. *(S, 3)*
- [ ] **US-411** — En tant qu'administrateur, je peux marquer un produit comme « mis en avant » et choisir son ordre afin de piloter la page d'accueil. *(S, 2)*
- [ ] **US-412** — En tant qu'administrateur, je peux exporter en CSV ou Excel les commandes, factures, utilisateurs ou produits afin d'alimenter mes outils externes. *(S, 3)*
- [ ] **US-413** — En tant qu'administrateur, je peux consulter les messages reçus du formulaire de contact et marquer comme lu afin de traiter le support. *(M, 2)*

---

## Epic 6 — Contact & Chatbot

- [ ] **US-501** — En tant que visiteur, je peux envoyer un message via le formulaire de contact (nom, email, sujet, message) afin de joindre l'équipe Althea. *(M, 2)*
- [ ] **US-502** — En tant que visiteur, je suis protégé contre le spam (rate limiting Redis + honeypot) lors de l'envoi du formulaire afin que le canal reste utilisable. *(M, 2)*
- [ ] **US-503** — En tant que visiteur, je peux ouvrir le chatbot depuis n'importe quelle page et obtenir une réponse contextuelle afin d'avoir une assistance immédiate. *(M, 5)*
- [ ] **US-504** — En tant que visiteur, mes échanges chatbot sont persistés en base afin que l'administrateur puisse en assurer le suivi (CDC §XV). *(M, 3)*
- [ ] **US-505** — En tant qu'administrateur, je peux consulter la liste des conversations chatbot et en lire le détail afin d'identifier les sujets récurrents. *(M, 3)*
- [ ] **US-506** — En tant qu'administrateur, je peux changer le statut d'une conversation (active, escaladée, fermée) afin de traiter les demandes complexes. *(S, 2)*

---

## Epic 7 — Multilingue

- [ ] **US-601** — En tant que visiteur, je peux changer la langue du site (français, anglais, arabe) depuis le sélecteur afin de naviguer dans ma langue. *(S, 5)*
- [ ] **US-602** — En tant que visiteur en arabe, l'interface s'affiche de droite à gauche (RTL) afin que la lecture soit naturelle. *(S, 5)*
- [ ] **US-603** — En tant que visiteur, ma langue préférée est mémorisée d'une visite à l'autre afin de ne pas avoir à la re-sélectionner. *(S, 2)*
- [ ] **US-604** — En tant qu'administrateur, je peux saisir les libellés produits et catégories dans les trois langues afin de couvrir tous les visiteurs. *(C, 5)*

---

## Epic 8 — Accessibilité & Performance

- [ ] **US-701** — En tant qu'utilisateur naviguant au clavier, je peux atteindre et activer tous les éléments interactifs afin d'utiliser le site sans souris. *(S, 5)*
- [ ] **US-702** — En tant qu'utilisateur de lecteur d'écran, je perçois les libellés et états des composants afin de comprendre l'interface. *(S, 5)*
- [ ] **US-703** — En tant que visiteur, les contrastes de couleurs respectent WCAG 2.1 AA afin que les textes restent lisibles. *(S, 3)*
- [ ] **US-704** — En tant qu'utilisateur sur mobile 4G, les pages s'affichent en moins de 3 secondes afin d'avoir une expérience fluide. *(M, 5)*
- [ ] **US-705** — En tant qu'utilisateur, les pages catalogue sont mises en cache (Redis) afin de garantir des temps de réponse rapides en pic. *(S, 3)*
- [ ] **US-706** — En tant qu'utilisateur, les images produits sont servies depuis Cloudflare R2 (CDN) en format optimisé (WebP/AVIF) afin d'accélérer les pages. *(M, 3)*

---

## Synthèse

| Epic | US Must | US Should | US Could | Total |
|------|:-------:|:---------:|:--------:|:-----:|
| 1 — Auth & sécurité | 7 | 1 | 0 | 8 |
| 2 — Catalogue | 6 | 2 | 0 | 8 |
| 3 — Panier & checkout | 10 | 0 | 0 | 10 |
| 4 — Espace client | 5 | 1 | 0 | 6 |
| 5 — Back-office | 8 | 5 | 0 | 13 |
| 6 — Contact & chatbot | 5 | 1 | 0 | 6 |
| 7 — Multilingue | 0 | 3 | 1 | 4 |
| 8 — Accessibilité & perf | 2 | 4 | 0 | 6 |
| **Total** | **43** | **17** | **1** | **61** |

Le backlog est vivant : il évoluera à chaque sprint via affinage en début de revue. Les estimations sont indicatives et susceptibles d'être révisées après les premiers sprints (calibrage de la vélocité d'équipe).
