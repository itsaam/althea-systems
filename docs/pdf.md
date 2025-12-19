29

100 %

20
Résumé des fonctionnalités principales :

1. Historique par année : Les commandes sont regroupées par année, avec un accès facile
   aux commandes passées et actives.
2. Détail de chaque commande : L’utilisateur peut consulter les détails complets de chaque
   commande, y compris les informations sur le produit, le mode de paiement, et télécharger
   les factures associées.
3. Filtres et recherche : L'utilisateur peut filtrer les commandes par année, type de produit, ou
   rechercher une commande spécifique.
4. Téléchargement des factures : Un lien de téléchargement pour chaque facture est
   disponible, permettant un archivage et une gestion des commandes simplifiée.

XV. Page Outils – Formulaire de contact avec Chatbot
Cette page permet à tous les utilisateurs, qu'ils soient connectés ou non, de nous contacter via un
formulaire de contact classique, ainsi qu'un service de chatbot pour des réponses instantanées. Les
messages envoyés via le formulaire seront accessibles depuis le backoffice, tandis que le chatbot
pourra traiter certaines demandes automatiquement.

Fonctionnalités du formulaire de contact :

1. Champs du formulaire :
   o Le formulaire comprend les champs suivants :
   ▪ Adresse e-mail : Le champ obligatoire pour entrer une adresse e-mail valide,
   pour que nous puissions répondre à l'utilisateur.
   ▪ Sujet du message : Un champ où l’utilisateur peut indiquer le sujet de sa
   demande (par exemple, « Problème technique », « Question sur la commande
   », « Assistance générale »).
   ▪ Texte du message : Un champ texte libre où l’utilisateur peut écrire sa
   demande ou question.
2. Validation et soumission :
   o Tous les champs obligatoires doivent être remplis avant de soumettre le formulaire.
   o Une confirmation visuelle sera affichée après soumission, informant l’utilisateur que
   son message a bien été envoyé et que nous le contacterons sous peu.
   o Les messages seront accessibles dans le backoffice pour un traitement par l'équipe de
   support.

Ajout du bouton « Contact Me » avec chatbot :

1. Bouton « Contact Me » :
   o Un bouton « Contact Me » sera présent sur la page. Ce bouton déclenchera un chatbot
   qui apparaîtra sous forme de fenêtre de chat en temps réel.
   o Le chatbot permettra à l’utilisateur d’interagir immédiatement pour des questions
   courantes, l’assistance technique de base, ou pour guider l’utilisateur à travers
   certaines fonctionnalités du site.
2. Fonctionnalités du chatbot :
   o Réponses instantanées : Le chatbot sera capable de répondre immédiatement aux
   questions fréquentes (par exemple, « Comment modifier mon adresse ? », « Quelles
   sont les méthodes de paiement acceptées ? »).
   o Escalade vers un humain : Si le chatbot ne peut pas répondre à une question complexe
   ou si l’utilisateur souhaite parler à un agent humain, le chatbot proposera de transférer

21
la demande vers un membre de l’équipe de support. Dans ce cas, une notification sera
envoyée à l’équipe via le backoffice.
o Saisie des informations utilisateur : Le chatbot peut aussi capturer certaines
informations de base (par exemple, l'adresse e-mail, le sujet de la question) pour
accélérer la gestion de la demande. 3. Interaction avec le backoffice :
o Les interactions avec le chatbot seront également enregistrées et accessibles dans le
backoffice pour permettre à l’équipe de support de suivre les conversations et
d’apporter un suivi, si nécessaire.
o Si un utilisateur utilise le chatbot mais souhaite soumettre un message plus détaillé,
un lien vers le formulaire de contact sera proposé directement depuis la conversation
du chatbot.

Résumé des fonctionnalités principales :

1. Formulaire de contact classique : Les utilisateurs peuvent entrer leur e-mail, sujet, et
   message pour envoyer une demande.
2. Bouton « Contact Me » avec chatbot : Un chatbot interactif est accessible via un bouton,
   permettant aux utilisateurs de recevoir des réponses instantanées.
3. Escalade vers un agent humain : Si le chatbot ne peut pas répondre à une demande
   complexe, il propose de transférer la conversation vers un membre de l'équipe de support.
4. Intégration au backoffice : Les messages soumis via le formulaire ou les conversations
   avec le chatbot sont centralisés dans le backoffice pour un suivi par l’équipe.

XVI. Backoffice  
Le back-office est un outil réservé aux administrateurs et gestionnaires d'Althéa Systems, leur
permettant de gérer l'ensemble de la plateforme e-commerce. Il doit être fonctionnel, intuitif, sécurisé,
et offrir une gestion complète des ressources avec des tableaux de bord pour visualiser les
performances.

1. Indicateurs clés en chiffres (cards) :  
   ▪ Chiffre d’affaires du jour / semaine /mois
   ▪ Nombre de commandes du jour
   ▪ Alertes produits en rupture de stock (badge rouge si >0)
   ▪ Messages de contact non traités(badge)
2. Histogramme camembert des ventes par catégorie :  
   Un graphique camembert présentera la répartition des ventes par catégorie sur les 7 derniers jours,
   avec une possibilité de modification de la période sur les 5 dernières semaines.
   Cela permet de voir facilement quelle catégorie de produits est la plus performante en termes de
   volume de ventes.
   ▪ Affichage : 7 derniers jours
   ▪ Données : Répartition % du CA par catégorie

22
▪ Affichage du montant € au survol 3. Actions rapides : Bouton d’accès direct :  
▪ « Nouvelle commande »
▪ « Ajouter un produit »
▪ « Voir les messages »

4. Gestion des Produits :
   Liste des produits : Vue tableau avec les colonnes suivantes :  
   ▪ Image(miniature)
   ▪ Nom du produit (tri, recherche)
   ▪ Description
   ▪ Catégorie(s) (tri, filtre par liste déroulante)
   ▪ Prix en € HT (tri, filtre)
   ▪ TVA (sélection : 20%,10%, 5,5%, 0%)
   ▪ Prix TTC (calculé automatiquement)
   ▪ Stock (tri, filtre : disponibilité/rupture)
   ▪ Statut (tri, filtre : publié/brouillon)
   ▪ Date de création (tri, filtre)
   ▪ Quantité en stock
   Actions groupées :  
   ▪ Supprimer la sélection (avec confirmation)
   ▪ Modifier le statut (publier/dépublier)
   ▪ Modifier la catégorie
   ▪ Export de la sélection

Le backoffice doit inclure des pages de gestion pour chaque produit, avec les fonctionnalités suivantes

a) Lister les produits :
o Les produits sont listés dans un tableau (tri, filtre e recherche).
o Il doit permettre une sélection multiple pour des actions groupées telles que la
suppression de plusieurs produits en une seule fois.
b) Voir les détails d’un produit :
o Pour chaque produit, les administrateurs peuvent accéder à une page de détails avec
toutes les informations du produit (nom, description, prix, quantité disponible, etc.).
c) Créer un nouveau produit :
o Un formulaire de création permet aux administrateurs d’ajouter de nouveaux produits
avec tous les champs nécessaires (nom, description, catégorie, prix, etc.).
d) Modifier un produit précis :
o Chaque produit peut être modifié directement via une page dédiée. Les
administrateurs peuvent ajuster les informations (par exemple, modifier le prix d'un
produit ou sa quantité disponible).

23
e) Supprimer un produit :
o Les administrateurs peuvent supprimer un produit spécifique, avec une confirmation
pour éviter les suppressions accidentelles.

5. Fonctionnalités transversales du tableau des produits :  
   ▪ Tri par n’importe quelle colonne (ascendant / descendant)
   ▪ Recherche globale dans le tableau
   ▪ Pagination (25/50/10 produits par pages)
   ▪ Export CSV/Excel
   Actions rapides (icônes : voir, éditer, supprimer.

Gestion du carrousel sur la page d’accueil (3 slides maximum).
▪ Upload multiple d’images en drag & drop (miniature)
▪ Réorganisation par glisser-déposer (définir l’ordre pour le carrousel front)
▪ Définir l’image principale (\*)
▪ Suppression individuelle
▪ Lien de redirection
▪ Texte avec formatage (gras, italique, liens, couleurs) sous le carrousel

6. Tableau de bord de suivi des ventes :

Le backoffice inclura également un tableau de bord pour afficher les données de vente et de
performance des produits. Ce tableau de bord comportera plusieurs types de graphiques pour une vue
d’ensemble rapide et efficace :
a) Histogramme des ventes par jour :
o Un histogramme affichera le total des ventes par jour sur les 7 derniers jours. Cette
période pourra être modifiée pour afficher les ventes par semaine sur les 5 dernières
semaines.
o Ce graphique permet de suivre les tendances de vente sur une période donnée et de
visualiser les pics d’activité.
b) Histogramme multi-couches des paniers moyens :
o Un histogramme multi-couches affichera le total des ventes par catégories en
fonction des paniers moyens sur les 7 derniers jours. La période pourra également être
modifiée pour afficher les paniers moyens sur les 5 dernières semaines.
o Ce graphique permet de comparer les performances des différentes catégories de
produits.

24 7. Paramètres avancés :
URL personnalisée (slug SEO)

8. Gestion des Catégories :
   Liste des catégories : Vu tableau hiérarchique avec les colonnes :  
   ▪ Image(miniature)
   ▪ Nom(tri)
   ▪ Description
   ▪ Nombre de produits(tri)
   ▪ Ordre d’affichage(tri)
   ▪ Statut (Active/Inactive)
   Actions :  
   ▪ Voir, Éditer, supprimer,  
   ▪ Ajouter une catégorie par un formulaire (nom, description, image, statut, URL personnalisée
   (slug)
   ▪ Réorganiser par drag & drop
   ▪ Activer / Désactiver les catégories sélectionnées
   Détail d’une catégorie :  
   Page de consultation avec vue sur les produits associés avec possibilité d’édition.

9. Accès réservé aux administrateurs :
   • Le backoffice sera accessible uniquement aux administrateurs avec les autorisations
   appropriées.
   • Une authentification forte sera nécessaire pour accéder à cette section, incluant des
   fonctionnalités de sécurité telles que l’authentification à deux facteurs.

10. Gestion des utilisateurs :
    • Nom complet (tri, recherche)
    • Email (tri, recherche)
    • Date d’inscription (tri)
    • Statut du compte (tri, filtre : actif / inactif/en attente de validation)
    • Nombre de commandes
    • CA total généré
    • Dernière connexion
    • Liste des adresses de facturation
    Actions administratives :  
    Envoyer un mail  
    Réinitialiser le mot de passe  
    Désactiver le compte  
    Supprimer le compte (avec avertissement RGPD)

25
11.Gestion des commandes :  
• N° de commande (tri, recherche)
• Date et heure(tri)
• Client (tri, recherche par nom/email)
• Montant TTC (tri)
• Statut (tri, filtre)
• Mode de paiement (tri, filtre)
• Statut du paiement (validé/en attente/Échoué)
Statuts avec code couleur
En attente – Commande créée, paiement en attente
En cours – Paiement validé, traitement en cours
Terminée – commande finalisée
Annulée – Commande annulée

Détail d’une commande :  
• N° de commande
• Date et heure
• Statut actuel(modifiable)
• Historique des changements de statut (avec date et utilisateur)
• Informations de paiement
• Mode de paiement utilisé
• Date du paiement
• Statut :  
Validé,
En attente,
Échoué,
Remboursé 12. Gestion de la facture :  
• N° de la facture (généré automatiquement à la validation du paiement)
• Téléchargement de la facture au format PDF
• Renvoyer la facture par mail au client  
• Modifier la facture (formulaire de modification)
• Supprimer la facture (génère automatiquement un avoir)

26
13.Gestion des factures et avoirs :
Liste des factures  
• N° de facture (tri, recherche)
• Date d’émission (tri, filtre)
• Client (tri, recherche)
• N° de commande associée (lien cliquable)
• Montant TTC (tri)
• Statut (tri, filtre : payée, en attente, annulée)
Liste des avoirs
• N° de l’avoir (tri, recherche)
• Facture liée (lien cliquable)
• Date d’émission (tri, filtre)
• Client (tri, filtre)
• Montant (négatif) (tri)
• Motif (annulation, remboursement, erreur)
Actions disponibles :  
• Télécharger PDF de l’avoir
• Envoyer par email

XVII. EN COMPLEMENT :
Pagination :
Toutes les listes de produits, que ce soit sur mobile ou desktop, devront être paginées de manière à
offrir une navigation fluide et rapide à travers les différents produits. Bien que nous ne précisions pas
de système de pagination particulier, celui-ci doit permettre aux utilisateurs de naviguer rapidement
vers une page précise ou d'utiliser une navigation par lots (pages suivantes et précédentes).

Menu :
Le menu de navigation sera un menu burger disponible à la fois pour les utilisateurs connectés et non
connectés. Ce menu diffère en fonction de l’état de connexion de l’utilisateur :
• Connecté :
o Mes paramètres
o Mes commandes
o CGU
o Mentions légales
o Contact
o À propos de Althea Systems
o Se déconnecter
• Non connecté :
o Se connecter
o S’inscrire
o CGU

27
o Mentions légales
o Contact
o À propos de Althea Systems

Ce menu doit être réactif et s'adapter à la taille de l'écran (mobile et desktop).

i18n (Internationalisation) :
Le site web devra être multilingue et offrir une expérience utilisateur adaptée pour les langues qui
s’écrivent de droite à gauche comme l’arabe ou l’hébreu. Les utilisateurs pourront changer de langue
facilement via un bouton de sélection de langue dans le menu. Le backoffice peut être uniquement en
anglais pour simplifier la gestion par les administrateurs.

a11y (Accessibilité) :
Nous accordons une grande importance à l’accessibilité afin de garantir que tous les utilisateurs, y
compris ceux ayant des handicaps. Cela implique le respect des normes d’accessibilité telles que
WCAG 2.1. Les éléments interactifs (boutons, formulaires, menus) doivent être utilisables avec des
technologies d’assistance (lecteurs d’écran, navigation clavier) et les contrastes des couleurs doivent
être optimisés pour les personnes malvoyantes.

Sécurité :
La sécurité est une priorité. Nous nous attendons à ce que les normes de sécurité les plus strictes soient
mises en œuvre. Cela inclut :
• Chiffrement des données utilisateur (en particulier les données sensibles comme les
informations de paiement).
• Gestion des sessions sécurisée (authentification, autorisation).
• Protection contre les failles telles que les attaques par injection SQL, les attaques XSS et CSRF.
• Mise en place de certificats SSL pour sécuriser les communications.
• Tests de sécurité réguliers avant et après livraison.

Choix techniques :
Nous laissons une grande liberté en ce qui concerne les choix techniques, à l'exception des contraintes
techniques suivantes :  
• 1 frameworks FrontEnd
• 1 frameworks BackEnd
• 1 Base de données nosql pour le stockage des images
• 1 base de données relationnelle pour le reste
Nous attendons cependant de pouvoir valider les piles technologiques choisies (frameworks,
bibliothèques, langages) afin de garantir la compatibilité avec notre infrastructure et l'atteinte des
performances attendues. Les solutions devront privilégier la maintenabilité, la scalabilité, et la
sécurité.
XVIII.Livrables - GIT, SPA, et Documentation Technique :
Pour la gestion et la livraison du projet, les éléments suivants doivent être fournis :

1. Repository GIT pour le site web (web desktop et mobile) et le backoffice :
   • Un repository GIT sera utilisé pour héberger le code du site web, ainsi que le backoffice utilisé
   par les administrateurs.

28
• Le repository contiendra tout le code source lié à ces interfaces et permettra un suivi de
version détaillé, assurant une traçabilité des modifications à chaque étape du projet.
• Chaque commit devra inclure des descriptions claires, expliquant les changements apportés
pour faciliter les revues de code et garantir la cohérence du projet.
• Le code sera testé et ne devra comporter aucune erreur ou bugs avant livraison finale.

2. Code propre et bien architecturé :
   • Le code livré devra être propre, bien organisé et conforme aux standards de l'industrie. Cela
   inclut :
   o Nomenclature claire des variables, fonctions et composants.
   o Architecture modulaire pour assurer une maintenabilité et une extensibilité à long
   terme.
   o Respect des principes SOLID et autres bonnes pratiques de conception de logiciels.
   • Le code devra également être documenté de manière adéquate, pour permettre aux
   développeurs futurs de comprendre facilement les choix de conception.

3. Documentation technique complète :
   Une documentation technique détaillée doit être fournie pour accompagner les repositories GIT, et
   elle devra inclure les éléments suivants :
4. Guide d'installation :
   o Dépendances nécessaires.
   o Instructions pour configurer l'environnement de développement, le déploiement et la
   production.
   o Étapes détaillées pour installer et déployer le site web (versions desktop et mobile)
   ainsi que l’application mobile.
5. Documentation des API :
   o Tous les endpoints API utilisés ou créés dans le cadre du projet devront être
   documentés, y compris les méthodes HTTP, les paramètres attendus, et les réponses
   possibles.
   o Un outil comme Swagger ou Postman pourra être utilisé pour faciliter cette
   documentation et permettre des tests interactifs.
6. Structure du code :
   o Explication de l'architecture du code : comment les composants sont organisés,
   comment les modules interagissent entre eux, etc.
   o Description des principaux composants, services, et systèmes (backend, frontend,
   services API).
   o Justification des choix technologiques, par exemple l’utilisation d’un framework
   particulier (React, Angular, etc.), des bibliothèques ou des outils de gestion d’état.
7. Tests :
   o Instructions sur les tests unitaires, tests d’intégration et tests fonctionnels à effectuer.
   o Explication de la mise en place des tests automatisés pour garantir la qualité continue
   du produit.
   o Utilisation de frameworks de test comme Jest, Mocha, ou similaires pour tester les
   différents aspects du code.
8. Document de Conception Technique (DCT) : Le Document de Conception Technique (DCT)
   comprendra :
   o Architecture du système : Vue d'ensemble de l’infrastructure technique, décrivant les
   interactions entre le frontend, le backend, les bases de données, les services API, et les
   systèmes d'authentification.

29
o Diagrammes techniques :
▪ Diagramme d'architecture globale illustrant la structure des composants
principaux du site web, de l'application mobile, et du backoffice.
▪ Diagramme de flux de données montrant comment les données sont traitées
et circulent entre les différents systèmes.
▪ Diagramme de communication des services (API, interactions front-back).
o Choix technologiques : Justification des piles technologiques sélectionnées pour
répondre aux objectifs de performance, de scalabilité et de sécurité.
o Plan de sécurité (Bonus) :
▪ Détail des mesures de sécurité mises en place, incluant le chiffrement des
données sensibles, la gestion des sessions utilisateur, et la protection contre
les menaces comme les attaques XSS, CSRF, etc.
▪ Conformité aux normes de sécurité telles que le RGPD pour garantir la
protection des données personnelles.
o Plan de maintenance et évolutivité :
▪ Recommandations pour la maintenance continue du produit, incluant la
gestion des mises à jour et des correctifs de sécurité.
▪ Stratégies pour assurer la scalabilité du site web et de l’application mobile,
avec une extension possible de l’infrastructure pour répondre à une
augmentation du nombre d’utilisateurs. 6. Suivi de l’évolution des livrables :
• Les étapes de développement du projet devront être visibles et accessibles via les repositories
GIT tout au long du processus.
• Chaque sprint devra être documenté et inclure des rapports de progression, afin que
l’ensemble des parties prenantes puisse suivre l’évolution du projet.
• Les mises à jour régulières et les revues de code permettront de garantir la transparence du
développement.

7. Maquettage et prototype des 2 parties front office et backoffice.
