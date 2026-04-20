---
title: "Document de Cadrage — Projet Althea Systems"
subtitle: "Plateforme e-commerce B2B de matériel médical"
author:
  - Samy Abdelmalek
  - Tristan Sanjuan
  - Rayan Menkar
  - Kelvin Chauvel
date: "Avril 2026"
lang: fr
toc: true
toc-depth: 2
numbersections: true
geometry: margin=2cm
fontsize: 10pt
mainfont: "Calibri"
linestretch: 1.15
colorlinks: true
linkcolor: "teal"
---


# Résumé exécutif

Ce document présente la réponse de l'équipe projet à l'appel d'offre émis par **Althea Systems**, entreprise spécialisée dans la distribution de matériel médical de pointe pour cabinets médicaux. Le client souhaite se doter d'une plateforme e-commerce B2B internationale, mobile-first, sécurisée et accompagnée d'un back-office de gestion autonome.

Le projet est conduit par une équipe de **quatre étudiants de Bachelor 3 CPI parcours Développement** dans le cadre du projet fil rouge annuel, au titre RNCP34581 *Coordinateur de Projets Informatiques*.

La solution proposée s'appuie sur un **framework web moderne** permettant à la fois la rapidité du rendu côté serveur, une excellente expérience mobile, et une forte maintenabilité. Elle intègre un paiement sécurisé par un prestataire certifié (Stripe), une authentification renforcée par double facteur pour les administrateurs, et une internationalisation complète couvrant le français, l'anglais et l'arabe (y compris l'écriture de droite à gauche).

Le calendrier prévisionnel couvre neuf phases réparties de septembre 2025 à juin 2026, avec les jalons certifiants imposés par le cadre pédagogique Sup de Vinci : kick-off, rendez-vous de cadrage, document de cadrage, soutenance et livrables finaux.


# Introduction et contexte

## Présentation du client

**Althea Systems** commercialise du matériel médical haut de gamme destiné aux cabinets médicaux. Historiquement, la distribution s'effectue par un réseau de commerciaux et de distributeurs spécialisés. L'entreprise souhaite aujourd'hui **se transformer numériquement** pour :

- Faciliter l'accès à son catalogue pour les praticiens existants, qui pourront commander 24 heures sur 24.
- Capter de nouveaux marchés internationaux, notamment dans les zones francophones, anglophones et arabophones.
- Moderniser l'image de marque et aligner l'expérience client sur les standards actuels du e-commerce B2B.
- Soulager les équipes commerciales des tâches transactionnelles à faible valeur ajoutée, pour les recentrer sur le conseil.

## Cadre pédagogique

Ce projet constitue le **projet d'étude fil rouge** de la promotion Bachelor 3 CPI parcours Développement 2025-2026 de Sup de Vinci. Il permet de valider les trois blocs de compétences du titre RNCP34581 :

| Bloc | Intitulé | Validé par |
|------|----------|------------|
| BC1 | Piloter un projet informatique | Rendez-vous de cadrage (20 %) + Document de cadrage (80 %) |
| BC2 | Coordonner une équipe projet | Soutenance (80 %) + Analyse de la dynamique projet (20 %) |
| BC3 | Superviser la mise en œuvre d'un projet | Livrables finaux techniques (100 %) |

## Objet du présent document

Le Document de Cadrage a pour vocation de :

- **Reformuler** de manière précise le besoin exprimé par le client.
- **Structurer** la réponse fonctionnelle et technique à l'appel d'offre.
- **Justifier** les choix d'outils retenus au regard de critères objectifs : performance, sécurité, maintenabilité, évolutivité et coût.
- **Planifier** les étapes de réalisation avec des jalons et des livrables clairs.
- **Identifier** les rôles, responsabilités et risques du projet.

Il est rédigé dans une démarche de **recherche et de réflexion**, en évitant l'exhaustivité gratuite : chaque choix est motivé par le cahier des charges du client.


# Reformulation du besoin client

## Expression du besoin

> « *Nous souhaitons développer une plateforme e-commerce innovante pour proposer nos produits à une clientèle internationale. Cette plateforme permettra à nos clients d'acheter et de commander facilement nos produits directement depuis leur interface. Nous voulons offrir une expérience d'achat fluide et moderne, en adéquation avec les attentes actuelles du marché.* »
>
> *— Cahier des charges Althea Systems.*

Reformulé en langage projet, le besoin repose sur **quatre piliers** hiérarchisés explicitement par le client :

- **Sécurité** — plateforme et paiement sécurisés, avec une attention particulière aux données bancaires.
- **Expérience utilisateur** — fluide, responsive, mobile-first, cohérente entre desktop et mobile.
- **Back-office complet** — gestion autonome des produits, catégories, commandes, factures et contenus éditoriaux par l'équipe interne d'Althea.
- **Maintenabilité et évolutivité** — capacité à intégrer de nouvelles fonctionnalités à long terme sans remettre en cause les fondations.

## Parties prenantes

| Partie prenante | Rôle | Intérêt principal |
|------------------|------|-------------------|
| Althea Systems (direction) | Client / commanditaire | Retour sur investissement, image de marque, nouveaux marchés |
| Équipes commerciales internes | Utilisateurs du back-office | Gestion produits, suivi des commandes, relation client |
| Praticiens et cabinets médicaux | Utilisateurs finaux B2B | Rapidité, fiabilité, disponibilité du service |
| Équipe projet (4 étudiants) | Maîtrise d'œuvre | Livraison, apprentissage, validation RNCP |
| Encadrement Sup de Vinci | Sponsor académique | Évaluation et conformité au référentiel |

## Cibles utilisateurs

Deux profils principaux, avec des exigences différenciées :

- **Le client B2B** (praticien ou acheteur pour un cabinet) : recherche rapide d'un produit, fiche détaillée, processus de commande court, accès simple à son historique et à ses factures.
- **L'administrateur Althea** (gestionnaire catalogue ou service client) : pouvoir créer, modifier, supprimer des produits, suivre l'activité commerciale via un tableau de bord, traiter les messages des clients.

## Objectifs stratégiques et indicateurs de succès

| Objectif | Indicateur visé |
|----------|-----------------|
| Disponibilité du service | Taux de disponibilité supérieur à 99,9 % (environ 8 h d'interruption maximum par an) |
| Réactivité du site | Pages rapides, résultats de recherche quasi instantanés |
| Confiance | Zéro incident de sécurité majeur, conformité RGPD |
| Ouverture internationale | Trois langues opérationnelles dès la mise en production |
| Inclusion | Site accessible aux personnes en situation de handicap (norme WCAG 2.1) |


# Analyse fonctionnelle

## Périmètre global

Le cahier des charges décrit un périmètre large, réparti en trois grandes familles :

- **Frontend public** : page d'accueil, catalogue, recherche, fiche produit, panier, checkout, confirmation, contact et chatbot.
- **Espace client** : inscription, connexion, mot de passe oublié, profil, carnet d'adresses, moyens de paiement, historique des commandes et des factures.
- **Back-office administrateur** : gestion des produits, des catégories, des commandes, des utilisateurs, des factures, des avoirs, des messages, du contenu éditorial de la page d'accueil, et tableaux de bord analytiques.

## Priorisation MoSCoW

La méthode MoSCoW (*Must, Should, Could, Won't*) permet de distinguer l'indispensable du souhaitable. Elle sert de référence à l'équipe pour arbitrer en cas de dérive de planning.

### Must have — indispensable à la mise en production

| Fonction | Justification |
|----------|---------------|
| Catalogue navigable (catégories, produit, recherche) | Cœur métier e-commerce |
| Panier et checkout avec paiement en ligne | Sans paiement, pas de revenus |
| Authentification sécurisée | Prérequis à toute commande ou suivi |
| Back-office de gestion des produits, catégories et commandes | Autonomie éditoriale de l'équipe Althea |
| Facture téléchargeable | Obligation comptable pour le client B2B |
| Expérience mobile-first | Contrainte explicite du cahier des charges |
| Double authentification pour les administrateurs | Protection du back-office |
| Chatbot avec persistance des conversations en base | Support utilisateur + traçabilité exigée par le CDC §XV |

### Should have — fortement attendu

- Tableau de bord analytique (ventes par jour, par catégorie, panier moyen).
- Gestion des avoirs avec génération PDF.
- Recherche rapide à facettes (titre, description, caractéristiques techniques, prix, catégorie, disponibilité).
- Multilingue (français, anglais, arabe).
- Conformité à l'accessibilité WCAG 2.1 niveau AA.
- Export CSV ou Excel depuis l'administration.
- Carrousel d'accueil éditable avec éditeur de texte riche (gras, italique, liens, couleurs).

### Could have — nice to have

- Notifications par email enrichies.
- Liste de souhaits.
- Codes promotionnels.

### Won't have — hors périmètre

- Application mobile native (le site mobile-first couvre le besoin).
- Marketplace multi-vendeurs.
- Programme de fidélité à points.
- Paiement en plusieurs fois.


# Contraintes du projet

## Contraintes réglementaires

Le projet traite des **données personnelles** (identité, adresses, email, historique d'achat) et des **données de paiement**. Deux cadres juridiques et normatifs s'appliquent :

- **Le RGPD** (Règlement Général sur la Protection des Données). Il impose notamment une information préalable des utilisateurs, des droits d'accès, de rectification, d'effacement et de portabilité, ainsi qu'un niveau de sécurité approprié et une politique de conservation des données.
- **La norme PCI-DSS** (sécurité des données bancaires). Les données de carte bancaire n'étant jamais stockées ni manipulées directement par la plateforme — elles sont déléguées à un prestataire certifié —, le périmètre de conformité est grandement réduit. C'est un choix volontaire et structurant.

## Contraintes d'accessibilité

Le cahier des charges demande explicitement le respect de la norme **WCAG 2.1 niveau AA**. Cela signifie que la plateforme doit être utilisable par toute personne, y compris en situation de handicap visuel, moteur ou cognitif. Concrètement :

- Navigation possible entièrement au clavier.
- Contrastes de couleurs suffisants.
- Alternatives textuelles aux images.
- Compatibilité avec les lecteurs d'écran.
- Gestion du focus visible.

Un audit a déjà été engagé sur les pages et composants principaux, avec des corrections appliquées.

## Contraintes d'expérience utilisateur

- **Mobile-first** : le site doit être conçu d'abord pour les écrans mobiles, puis adapté au desktop.
- **Multilingue** : trois langues cibles, le français, l'anglais et l'arabe. L'arabe implique une gestion particulière de l'écriture de droite à gauche.
- **Cohérence visuelle** : respect de la charte graphique fournie par le client (palette teal et navy).

## Contraintes de performance

Le cahier des charges mentionne explicitement une exigence de **résultats de recherche rapides**. Plus largement, la plateforme doit offrir :

- Des pages rapides à s'afficher, y compris sur un mobile en 4G.
- Une recherche fluide, sans latence perceptible.
- Une scalabilité permettant d'absorber une croissance du trafic sans refonte.

## Contraintes de sécurité

Au-delà du RGPD et du PCI-DSS, la plateforme doit se prémunir contre les menaces web classiques (le *top 10* de l'OWASP) : injection, cross-site scripting, usurpation de session, mauvaise configuration, dépendances vulnérables. Les mesures adoptées sont décrites dans la section dédiée à l'architecture.


# Architecture cible

## Vision générale

Plutôt qu'une architecture éclatée en de multiples services indépendants, complexe à mettre en œuvre pour une équipe de quatre personnes, l'équipe retient une **architecture dite monolithique modulaire**. Cela signifie une application unique, mais organisée en domaines fonctionnels clairement séparés (authentification, catalogue, commande, paiement, administration). Cette approche permet :

- Un déploiement simple, avec un seul environnement à maintenir.
- Un coût d'infrastructure réduit (environ 30 €/mois en production).
- Une vitesse de développement soutenue.
- La possibilité d'extraire des modules en services séparés si la plateforme devait monter en charge.

## Principaux composants

La plateforme repose sur les briques suivantes :

- **Le site web** (ce que voit l'utilisateur), qui intègre à la fois les pages publiques, l'espace client et le back-office administrateur, avec un rendu optimisé côté serveur pour la rapidité et le référencement.
- **La base de données** qui stocke les comptes, produits, catégories, commandes, factures, avoirs, adresses et messages.
- **Un service de cache** pour accélérer les pages les plus consultées et pour protéger la plateforme contre les abus (limitation du nombre de requêtes par minute).
- **Un service externe de paiement** pour encaisser les commandes en toute sécurité.
- **Un service externe d'envoi d'emails** pour les confirmations de commande, validations d'inscription, réinitialisations de mot de passe.
- **Un service externe de stockage d'images** pour héberger les photos produits avec une diffusion mondiale rapide.

## Parcours d'authentification

Un utilisateur peut se créer un compte avec son email et un mot de passe, ou se connecter via Google ou GitHub. Une fois authentifié, sa session est maintenue pour une durée confortable. Pour les administrateurs, un **deuxième facteur d'authentification** est exigé : un code à six chiffres généré par une application mobile (Google Authenticator, Authy, 1Password…). Cette double protection rend le back-office inaccessible même en cas de vol du mot de passe.

## Parcours de commande

Le parcours est organisé en quatre étapes successives :

1. **Authentification** (ou poursuite en tant qu'invité).
2. **Saisie de l'adresse** de facturation et, si nécessaire, de livraison.
3. **Paiement** : l'utilisateur saisit sa carte dans un formulaire dédié du prestataire de paiement, sans que la plateforme ne voie jamais le numéro de carte.
4. **Confirmation** : la commande est enregistrée, la facture générée automatiquement au format PDF, un email de confirmation est envoyé au client.

Un mécanisme de notification automatique en provenance du prestataire de paiement permet à la plateforme d'être informée en temps réel du succès ou de l'échec du paiement, garantissant la cohérence entre ce qui a été encaissé et ce qui est enregistré.


# Choix des outils

## Démarche

Chaque outil retenu a été évalué selon cinq critères :

- **Adéquation** au besoin exprimé dans le cahier des charges.
- **Performance** ressentie par l'utilisateur final.
- **Maturité et sécurité** (âge du projet, gouvernance, historique).
- **Maintenabilité** (documentation, communauté, ressources disponibles).
- **Coût total** (licences, infrastructure, courbe d'apprentissage).

## Framework principal — Next.js

**Next.js** est un framework de développement web parmi les plus utilisés actuellement. Il permet de construire le site complet, du rendu des pages aux interactions dynamiques, avec un seul et même socle. L'intérêt pour Althea :

- Rendu optimisé pour le référencement naturel et la performance perçue.
- Excellent support du mobile.
- Écosystème très large, facilitant l'ajout de nouvelles fonctionnalités.
- Communauté active, ce qui garantit maintenance et évolutions dans la durée.

## Base de données — PostgreSQL

**PostgreSQL** est une base de données relationnelle open source, réputée pour sa fiabilité et sa richesse fonctionnelle. Elle est retenue pour :

- La cohérence des données commerciales (une commande est toujours liée à un client, à des produits, à une adresse : relations strictes).
- Sa grande maturité (plus de 25 ans).
- L'absence de coût de licence.
- Ses capacités avancées en matière de recherche et de statistiques.

Une base alternative non relationnelle (de type MongoDB) a été écartée : les données d'un e-commerce sont fortement reliées entre elles, et une base relationnelle est mieux adaptée.

## Cache et limitation — Redis

**Redis** est un outil complémentaire à la base de données principale. Il stocke temporairement les informations les plus consultées (par exemple une fiche produit) pour les restituer instantanément, sans solliciter la base. Il sert également à limiter automatiquement le nombre de requêtes qu'un utilisateur peut effectuer par minute, protégeant la plateforme contre les tentatives d'abus.

## Authentification — NextAuth

**NextAuth** est la solution de référence pour gérer les comptes utilisateurs dans l'écosystème Next.js. Elle prend en charge à la fois l'inscription classique par email et mot de passe, et la connexion via un compte Google ou GitHub. Elle est complétée par une **bibliothèque de double authentification** pour les administrateurs. Des alternatives payantes (Auth0, Clerk) ont été écartées pour leur coût récurrent, incompatible avec un projet étudiant.

## Paiement — Stripe

**Stripe** est retenu comme prestataire de paiement en ligne. Les raisons :

- Il est **certifié au plus haut niveau de sécurité bancaire** (PCI-DSS niveau 1), ce qui transfère la responsabilité de la conformité sur le prestataire.
- Il fournit des formulaires sécurisés que l'on intègre directement : la donnée de carte ne transite jamais par la plateforme.
- Il est internationalement reconnu, bien documenté, largement déployé.
- Ses frais sont transparents et standards pour un e-commerce B2B.

## Interface utilisateur — Tailwind CSS, shadcn/ui et Tiptap

**Tailwind CSS** est une bibliothèque qui accélère la mise en forme des pages en offrant des outils prêts à l'emploi. **shadcn/ui** est une collection de composants graphiques (boutons, menus, tableaux) déjà pensés pour être accessibles (compatibles WCAG). Ce duo permet de livrer une interface à la fois moderne, cohérente et conforme aux normes d'accessibilité sans repartir de zéro. **Tiptap** est ajouté pour l'éditeur de texte riche requis par le cahier des charges dans l'administration (carrousel de la page d'accueil), avec prise en charge de la mise en forme (gras, italique, liens, couleurs).

## Stockage des images — Cloudflare R2

**Cloudflare R2** est un service de stockage dans le cloud utilisé pour héberger les photos produits. Il a été retenu pour son tarif particulièrement compétitif (pas de frais de transfert de données) et sa diffusion mondiale rapide via un réseau de distribution de contenu.

## Envoi d'emails — Resend

**Resend** gère l'envoi des emails transactionnels (confirmation de commande, validation d'inscription, réinitialisation de mot de passe). Il a été préféré à d'autres prestataires pour sa simplicité d'intégration et sa tarification accessible.

## Hébergement — VPS et Dokploy

L'application est hébergée sur un **serveur virtuel privé** (VPS), piloté par un outil de déploiement nommé Dokploy. Cela offre un bon compromis entre maîtrise de l'infrastructure, coût contenu et simplicité opérationnelle. Le certificat de sécurité HTTPS est généré et renouvelé automatiquement.

## Multilingue — next-intl

**next-intl** est l'outil retenu pour gérer les traductions du site. Il supporte nativement l'écriture de droite à gauche, ce qui est essentiel pour l'arabe.

## Récapitulatif

| Besoin | Outil retenu |
|--------|--------------|
| Framework site web | Next.js |
| Base de données | PostgreSQL |
| Cache et limitation | Redis |
| Authentification | NextAuth |
| Double authentification admin | Application mobile type Google Authenticator |
| Paiement | Stripe |
| Interface utilisateur | Tailwind CSS + shadcn/ui + Tiptap (éditeur riche admin) |
| Stockage images | Cloudflare R2 |
| Envoi d'emails | Resend |
| Traductions | next-intl |
| Hébergement | VPS + Dokploy |


# Modèle de données

## Vue générale

La base de données est structurée autour de **six grands domaines**, eux-mêmes composés d'entités reliées entre elles. Elle comporte **dix-sept modèles** et sept énumérations.

- **Identité et authentification** : les comptes utilisateurs, les sessions, les tokens de validation d'email, les codes de secours pour la double authentification.
- **Catalogue** : les catégories (organisables en arborescence) et les produits, ainsi que les éléments éditoriaux de la page d'accueil (slides du carrousel).
- **Commande et facturation** : les commandes, les lignes de commande, l'historique des statuts, les factures et les avoirs.
- **Carnet d'adresses** : les adresses de facturation et de livraison enregistrées par les utilisateurs.
- **Relation client** : les messages issus du formulaire de contact, ainsi que les conversations du chatbot (deux modèles dédiés : une conversation + ses messages) pour assurer la traçabilité et le suivi par les administrateurs, conformément au CDC §XV.

## Principales entités

- **Utilisateur** : identifié par son email, avec un rôle (client ou administrateur), un statut (actif, suspendu, en attente de validation) et des paramètres de sécurité (mot de passe chiffré, double authentification).
- **Produit** : nom, description, caractéristiques techniques, prix, taux de TVA, niveau de stock, statut (disponible, rupture, retiré), images associées, catégorie de rattachement, éventuelle mise en avant.
- **Commande** : client, adresse, liste d'articles achetés, montant total, statut (en attente, confirmée, expédiée, livrée, annulée), statut de paiement (en attente, payée, échouée, remboursée). Une commande conserve un **instantané des prix** au moment de l'achat, pour être indépendante des évolutions futures du catalogue.
- **Facture** et **avoir** : documents PDF générés automatiquement, rattachés à une commande, numérotés selon une convention interne.

Le schéma relationnel complet (diagramme entité-relation) est fourni en annexe.


# Méthodologie projet

## Cadre retenu : une approche agile adaptée

L'équipe retient une **démarche agile de type Scrum**, simplifiée pour correspondre à la réalité d'une équipe de quatre personnes étudiantes :

- **Sprints de deux semaines**, avec un périmètre défini en début de sprint.
- **Revue hebdomadaire** informelle et **rétrospective** en fin de sprint.
- **Daily asynchrone** sur Discord pour partager l'avancement sans bloquer.
- **Revue de code obligatoire** par un pair avant tout apport au code principal.

## Gestion du code et des tâches

- **Git et GitHub** pour le versionnement du code.
- **GitHub Projects** pour le suivi des tâches (tableau Kanban : à faire, en cours, en revue, terminé).
- **Pull requests** systématiques, avec intégration continue qui vérifie la qualité du code (vérification de syntaxe, typage, validité de la base de données, construction du projet) avant toute fusion.

## Outils de communication

- **Discord** pour l'échange quotidien, avec des canaux dédiés (général, développement, design, alertes).
- **Figma** pour les maquettes et la charte graphique.
- **Markdown dans le dépôt Git** pour la documentation technique.

## Définitions de *prêt* et *terminé*

Une fonctionnalité est considérée comme **prête à être développée** lorsque ses critères d'acceptation sont rédigés, que la maquette est disponible s'il s'agit d'interface, et que les dépendances éventuelles sont levées.

Une fonctionnalité est considérée comme **terminée** lorsqu'elle est fusionnée dans le code principal, testée, relue par un pair, documentée si elle modifie l'API, et validée sur l'environnement de pré-production.


# Répartition des rôles

## Composition de l'équipe

L'équipe est composée de quatre étudiants du Bachelor 3 CPI parcours Développement. Chacun prend en charge un domaine principal, tout en contribuant de manière transverse via les revues de code, les tests croisés et les rituels agiles.

*Remarque sur la taille d'équipe* : le cadre pédagogique mentionne une équipe de deux à trois étudiants. Ce projet mobilise quatre membres, afin de couvrir la largeur fonctionnelle du cahier des charges (site public, back-office, authentification, paiement, internationalisation, accessibilité) dans les délais impartis.

## Matrice des responsabilités

Pour chaque grand domaine, la matrice ci-dessous indique qui est **responsable** (pilote et fait), **consulté** (donne son avis) ou **informé** (tenu au courant). La lettre R désigne le responsable principal de chaque ligne.

| Domaine | Samy | Tristan | Rayan | Kelvin |
|---------|:----:|:-------:|:-----:|:------:|
| Authentification et double facteur | **R** | | | |
| Infrastructure, hébergement, déploiement | **R** | | | |
| Intégration continue et sécurité transverse | **R** | | | |
| Pages publiques (accueil, catalogue, produit, checkout) | | **R** | | |
| Design system et charte graphique | | **R** | | |
| Accessibilité et responsive | | **R** | | |
| Back-office administrateur (tableaux, dashboard, gestion) | | | **R** | |
| Carrousel, produits mis en avant, exports CSV | | | **R** | |
| API et logique métier | | | | **R** |
| Base de données et modélisation | | | | **R** |
| Intégration du paiement | | | | **R** |
| Génération des factures et avoirs | | | | **R** |
| Multilingue | | | | **R** |

## Fiches de rôle

### Samy Abdelmalek — Authentification et infrastructure

- Mise en place de l'authentification (email / mot de passe, Google, GitHub).
- Implémentation de la double authentification pour les administrateurs, avec les codes de secours associés.
- Dockerisation de l'application et déploiement sur serveur privé.
- Configuration du cache, de la limitation de requêtes et du stockage d'images.
- Mise en place de l'intégration continue (pipeline automatique de vérification du code à chaque modification).
- Politique de sécurité globale : en-têtes de sécurité, audits de dépendances.

### Tristan Sanjuan — Frontend public et design system

- Développement des pages publiques : accueil (carrousel, grille catégories, top produits), page catégorie, fiche produit, panier, parcours de commande.
- Mise en œuvre de la charte graphique Althea (palette teal et navy).
- Conformité responsive sur toutes les tailles d'écran (mobile à desktop).
- Conformité accessibilité : navigation clavier, contrastes, libellés explicites, gestion du focus.
- Animations et micro-interactions.

### Rayan Menkar — Back-office administrateur

- Pages d'administration : tableau de bord, gestion des produits, catégories, utilisateurs, commandes, factures, avoirs, messages.
- Composants de tableau réutilisables avec tri, pagination et actions groupées.
- Exports CSV et Excel des données.
- Éditeur du carrousel d'accueil et gestion des produits vedettes.
- Écran de suivi des échanges chatbot.

### Kelvin Chauvel — Backend et intégrations

- Conception et développement de l'API (points d'entrée exposés par la plateforme).
- Modélisation de la base de données et gestion des migrations.
- Intégration du paiement : création des sessions de commande, réception des notifications de paiement, mise à jour des commandes.
- Génération automatique des factures et avoirs au format PDF.
- Envoi des emails transactionnels (confirmation, réinitialisation).
- Mise en place du multilingue.


# Planning prévisionnel

## Vue d'ensemble

Le projet s'étale sur **neuf mois**, de septembre 2025 à juin 2026, en neuf phases successives (certaines peuvent se recouvrir).

| Phase | Période | Durée | Livrable principal |
|-------|---------|-------|--------------------|
| Kick-off et cadrage | Septembre-octobre 2025 | 4 semaines | Maquettes et backlog initial |
| Authentification et sécurité | Octobre-novembre 2025 | 2-3 semaines | Inscription, connexion, double authentification |
| Back-office contenu | Novembre-décembre 2025 | 3 semaines | Gestion produits et catégories |
| Frontend public et recherche | Décembre 2025-janvier 2026 | 4 semaines | Catalogue, fiche produit, recherche |
| Checkout et paiement | Janvier-février 2026 | 3 semaines | Paiement complet, facture PDF, email |
| Back-office avancé | Février-mars 2026 | 3 semaines | Dashboard, avoirs, exports |
| Espace client | Mars 2026 | 1 semaine | Profil, adresses, historique |
| Contact et chatbot | Mars-avril 2026 | 2 semaines | Formulaire et chatbot |
| Multilingue et accessibilité | Avril 2026 | 2 semaines | Français, anglais, arabe, WCAG |
| Tests, documentation, soutenance | Mai-juin 2026 | 4 semaines | Tests, Swagger, document technique |

## Jalons certifiants

Les jalons imposés par le cadre pédagogique sont les suivants :

| Jalon | Période | Livrable |
|-------|---------|----------|
| Kick-off | Septembre 2025 | Constitution de l'équipe, prise en main du sujet |
| Rendez-vous de cadrage | Kick-off + 2 mois | Entretien client de 15 à 20 minutes |
| Document de cadrage | Rendez-vous + 3 mois | Le présent document |
| Soutenance et démonstration | Cadrage + 1 mois | Présentation orale de 60 minutes |
| Livrables finaux techniques | Soutenance + 2 semaines | Code source et documentation technique |
| Analyse de la dynamique projet | Livrables + 2 semaines | Document individuel de 2 à 4 pages |

## Dépendances clés

- La **phase d'authentification bloque tout le reste** : sans compte utilisateur fonctionnel, impossible de passer commande ou d'accéder à l'administration.
- Le **back-office de contenu précède le frontend public** : il faut pouvoir créer des produits pour pouvoir les afficher.
- Le **checkout dépend du frontend public** : la finalisation de commande s'appuie sur le panier déjà constitué.
- Le **multilingue est volontairement positionné en fin de cycle** pour éviter de devoir retraduire des textes modifiés en cours de route.

## Représentation graphique du planning

```
                Sept  Oct   Nov   Déc   Jan   Fév   Mars  Avr   Mai   Juin
Cadrage         ████████
Auth/Sécurité        ███████
BO Contenu                █████████
Frontend/Search                ███████████
Checkout                                ████████
BO Avancé                                       ████████
Espace client                                           ██
Contact/Chatbot                                           ██████
Multilingue/a11y                                                █████
Tests/Doc                                                            █████████
```


# Livrables par phase

| Phase | Livrables |
|-------|-----------|
| Cadrage | Document de cadrage PDF, maquettes Figma, backlog initial |
| Authentification et sécurité | Pages d'inscription, connexion, mot de passe oublié, double authentification admin |
| Back-office contenu | CRUD produits et catégories, upload d'images, actions groupées, export CSV |
| Frontend public | Accueil, catalogue, fiche produit, recherche, panier persisté |
| Checkout | Parcours de commande, paiement en ligne, notification automatique, facture PDF, email de confirmation |
| Back-office avancé | Tableau de bord, graphiques, gestion des commandes et utilisateurs, avoirs PDF |
| Espace client | Profil, adresses, moyens de paiement, historique des commandes |
| Contact et chatbot | Formulaire de contact, chatbot widget, escalade vers support humain |
| Multilingue et accessibilité | Trois langues, écriture de droite à gauche, audit accessibilité validé |
| Tests et documentation | Tests automatisés, documentation API, document de conception technique |


# Veille technologique

Conformément au cadre pédagogique, la veille est volontairement **ciblée sur trois axes** et non exhaustive.

## Technologie clé : les frameworks web modernes

L'évolution récente des frameworks web permet de produire des sites à la fois rapides, bien référencés et confortables à développer, avec un seul outil couvrant à la fois le rendu des pages et l'interaction dynamique. Next.js, retenu pour le projet, est aujourd'hui l'un des plus utilisés dans cette catégorie. Les bénéfices attendus pour Althea :

- Pages qui s'affichent rapidement, y compris sur mobile en 4G.
- Un meilleur référencement naturel, car les pages sont directement compréhensibles par les moteurs de recherche.
- Une équipe qui travaille avec un seul outil, donc un développement plus rapide et une maintenance simplifiée.
- Une large communauté et un écosystème riche, gages de pérennité.

## Exemple concurrentiel : Shopify

**Shopify** est la plateforme e-commerce en location (SaaS) la plus utilisée au monde, avec plus de quatre millions de boutiques actives. Elle couvre la majorité des fonctionnalités demandées par Althea : catalogue, panier, checkout, back-office, paiement sécurisé, multilingue.

La question a donc été posée : faut-il partir sur une solution sur mesure ou sur Shopify ?

| Critère | Shopify | Solution sur mesure |
|---------|---------|---------------------|
| Temps de mise en service | 1 à 2 semaines | 9 mois |
| Coût mensuel | 29 à 299 $ + commissions de transaction | Environ 30 € d'infrastructure, frais Stripe standards |
| Personnalisation du design | Limitée aux thèmes disponibles | Totale |
| Personnalisation métier | Via des modules additionnels (souvent payants) | Totale |
| Intégration au système d'information existant | Connecteurs limités | API dédiée |
| Dépendance au prestataire | Forte (données et code hébergés chez Shopify) | Faible (technologies ouvertes) |
| Conformité RGPD | Correcte, mais données hébergées hors UE | Maîtrise totale, hébergement européen |

Shopify n'a pas été retenu pour trois raisons principales :

- La **personnalisation visuelle** souhaitée par Althea dépasse ce que permettent les thèmes standards.
- La **souveraineté des données** est importante pour une clientèle internationale incluant des zones sensibles.
- Le **projet pédagogique** vise à démontrer des compétences de conception et de développement : Shopify les court-circuiterait.

## Norme essentielle : le RGPD

Le **Règlement Général sur la Protection des Données** est entré en application en mai 2018. Il s'applique à toute entité traitant les données personnelles de résidents européens. Les sanctions peuvent atteindre 4 % du chiffre d'affaires mondial ou 20 millions d'euros.

Pour Althea, cette norme structure directement plusieurs choix de conception :

- **Information préalable** : une page de politique de confidentialité et une bannière de cookies à trois niveaux (essentiels, analytiques, marketing).
- **Droit d'accès** : l'utilisateur peut exporter toutes ses données dans un fichier téléchargeable.
- **Droit à l'effacement** : l'utilisateur peut supprimer son compte, avec conservation des seules factures (obligation comptable de 10 ans).
- **Minimisation** : seules les données strictement nécessaires sont demandées.
- **Sécurité** : chiffrement des communications, mots de passe protégés, double authentification pour les administrateurs.
- **Sous-traitants** : chaque prestataire externe (Stripe, Resend, Cloudflare) fait l'objet d'un contrat spécifique de traitement de données.

Le RGPD n'est pas seulement une contrainte légale : il structure une **bonne hygiène sécurité** qui bénéficie à tous les utilisateurs.


# Gestion des risques

## Identification et évaluation

La probabilité (*Faible*, *Moyenne*, *Élevée*) et l'impact (*1* mineur à *4* critique) sont estimés pour chaque risque, et une réponse est proposée.

| Risque | Probabilité | Impact | Réponse |
|--------|:-----------:|:------:|---------|
| Fuite de données personnelles | Faible | 4 | Audits réguliers, chiffrement, double authentification, minimisation |
| Panne du paiement (notifications non reçues) | Moyenne | 3 | Mécanisme de réessai automatique, journalisation, alertes |
| Dérive de planning sur une phase critique | Moyenne | 3 | Sprints courts, rétrospectives, arbitrage en faveur du *must have* |
| Indisponibilité d'un membre de l'équipe | Faible | 3 | Documentation continue, polyvalence, pair programming ponctuel |
| Performance recherche insuffisante | Moyenne | 2 | Cache dédié, index de recherche, mesures régulières |
| Non-conformité accessibilité détectée tardivement | Moyenne | 2 | Audit intermédiaire, tests automatisés |
| Bug critique en production | Faible | 4 | Procédure de retour en arrière rapide, sauvegarde quotidienne |
| Dépendance tierce abandonnée | Moyenne | 2 | Veille mensuelle, audits de dépendances |
| Coût d'infrastructure imprévu | Faible | 2 | Budget fixe connu à l'avance |
| Tentative d'attaque (force brute, déni de service) | Moyenne | 3 | Limitation de requêtes, protection en amont (Cloudflare) |

## Plan de continuité

- **Objectif de reprise après incident** : remise en service en moins de 30 minutes.
- **Objectif de perte de données maximum** : moins de 24 heures (sauvegarde automatique quotidienne).
- **Retour en arrière** possible en quelques minutes grâce à l'outil de déploiement, qui permet de repasser à la version précédente.
- **Post-mortem** systématique en cas d'incident majeur, archivé dans la documentation du projet.


# Charte graphique

## Palette de couleurs officielle

La charte transmise par le client repose sur une palette sobre, dominée par le teal et le bleu nuit, avec des codes couleurs universels pour les statuts (vert, rouge, orange).

| Usage | Couleur |
|-------|---------|
| Boutons d'action, liens, badges | Teal `#00a8b5` |
| Survol de boutons et liens | Teal clair `#33bfc9` |
| Fonds doux d'arrière-plan | Teal très clair `#d4f4f7` |
| Titres, navigation, pied de page | Navy profond `#003d5c` |
| Statut « en stock », validation | Vert `#10b981` |
| Statut « rupture », erreurs | Rouge `#ef4444` |
| Statut « stock faible », alertes | Orange `#F59E0B` |

## Statuts produits

Quatre badges sont utilisés pour indiquer l'état d'un produit : **en stock** (vert), **stock faible** (orange), **rupture** (rouge), **nouveau** (teal).

## Typographie et iconographie

- Typographie sans serif moderne, lisible à toutes les tailles d'écran.
- Hiérarchie claire entre titres et corps de texte.
- Iconographie cohérente issue de la bibliothèque Lucide (intégrée à shadcn/ui), en ligne fine.


# Conclusion

Ce document de cadrage pose les bases d'un projet e-commerce **ambitieux mais maîtrisable**, répondant précisément aux exigences du cahier des charges d'Althea Systems, et structuré pour être mené à terme par une équipe de quatre étudiants sur neuf mois.

Les grands choix — architecture simple et robuste, framework web moderne, délégation du paiement à un prestataire certifié, internationalisation dès la conception, accessibilité intégrée, double authentification pour les administrateurs — ont été motivés par des critères clairs : valeur pour le client, sécurité, performance, maintenabilité, coût.

Les **neuf phases du projet** sont identifiées, avec des livrables précis, une **répartition des rôles** claire, une **matrice de risques** accompagnée de plans de réponse, et une **veille technologique** ciblée qui valide la pertinence de la solution au regard du marché.

L'équipe reste à disposition du client Althea Systems et de l'encadrement pédagogique pour tout approfondissement, ajustement du périmètre ou arbitrage en cours de réalisation.


# Annexes

## Annexe A — Documentation complémentaire

Le dépôt Git du projet contient la documentation suivante, qui complète le présent document :

| Document | Rôle |
|----------|------|
| Architecture | Vue d'ensemble technique |
| Document de conception technique | Livrable technique final |
| Diagrammes techniques | Schémas exportables |
| Documentation API | Points d'entrée exposés |
| Procédure de déploiement | Mise en production |
| Procédure d'installation | Développement local |
| Politique de maintenance | Sauvegardes, mises à jour, mise à l'échelle |
| Audit accessibilité | Conformité WCAG 2.1 |
| Audit responsive | Tests multi-écrans |
| Feuille de route | Découpage par phases |
| Rapport de sécurité | Vérifications automatisées |
| Audit des tickets | Suivi des issues GitHub |

## Annexe B — Glossaire

| Terme | Définition |
|-------|------------|
| **MoSCoW** | Méthode de priorisation des fonctionnalités en quatre catégories : indispensable, fortement attendu, souhaité, exclu |
| **SSR** | Rendu d'une page côté serveur plutôt que côté navigateur, pour un affichage plus rapide et un meilleur référencement |
| **Double authentification** | Mécanisme de sécurité qui ajoute une deuxième preuve d'identité à la connexion (code à six chiffres) |
| **PCI-DSS** | Norme internationale de sécurité pour les paiements par carte bancaire |
| **RGPD** | Règlement européen de protection des données personnelles |
| **WCAG** | Recommandations internationales d'accessibilité web |
| **RTL** | Écriture de droite à gauche, utilisée notamment pour l'arabe |
| **Backlog** | Liste ordonnée des fonctionnalités à développer |
| **Sprint** | Itération de travail courte (deux semaines ici), avec un périmètre défini |
| **Revue de code** | Relecture d'un apport au code par un pair avant intégration |
| **Intégration continue** | Vérification automatique de la qualité du code à chaque modification |

## Annexe C — Liens utiles

- Dépôt Git du projet : https://github.com/itsaam/althea-systems
- Cahier des charges fourni par le client (disponible dans le dépôt)
- Cadre pédagogique Sup de Vinci (disponible auprès de l'encadrement)
- Référentiel RNCP34581 (France Compétences)

---

*Fin du Document de Cadrage — Althea Systems.*
