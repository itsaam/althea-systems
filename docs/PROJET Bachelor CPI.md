# PROJET Bachelor CPI

# Développement

## 2025 - 2026

## Table des matières

- I. Introduction
- II. SITEMAP
- III. LAYOUT
- IV. Charte Graphique
- V. Page d'accueil
- VI. Page d’accès au catalogue de produits
- VII. Page produit
- VIII. Page de recherche
- IX. Page du panier
- X. Étapes du checkout
- XI. Inscription pour les utilisateurs du site Althea Systems
- XII. Connexion pour les utilisateurs de Althea Systems
- XIII. Modification du compte utilisateur
- XIV. Historique des commandes
- XV. Page Outils – Formulaire de contact avec Chatbot
- XVI. Backoffice
- XVII. EN COMPLEMENT :
- XVIII. Livrables - GIT, SPA, et Documentation Technique :

## I. Introduction

**Althea Systems** est une entreprise spécialisée dans la vente de **matériel de pointe pour cabinet
médicaux**. Jusqu'à présent, nos produits étaient commercialisés directement via notre réseau de
distribution et nos équipes commerciales. Cependant, nous avons pris conscience de la nécessité de

nous lancer dans l’ère du numérique afin de faciliter l’accès à nos produits pour nos clients actuels et
de capter de nouveaux marchés.

Nous souhaitons développer une **plateforme e-commerce** innovante pour proposer nos produits à une

clientèle internationale. Cette plateforme permettra à nos clients d'acheter et de commander
facilement nos produits directement depuis leur interface. En outre, nous voulons offrir une expérience

d'achat fluide et moderne, en adéquation avec les attentes actuelles du marché.
Le projet consistera à créer un site e-commerce **mobile-first**. Le site sera accompagné d’un **back-office**
web pour la gestion des produits, des utilisateurs, et des commandes, avec un **système de paiement**

**sécurisé** et évolutif, capable de s'adapter aux besoins de l'entreprise sur le long terme.
Un premier site e-commerce avait été développé, mais nous souhaiterions une refonte complète avec
les éléments indiqués ci-après. https://www.althea-group.com/fr/

Dans ce cadre, les principaux défis consisteront à :

1. **Mettre en place une plateforme sécurisée** intégrant des solutions de paiement en ligne
   robustes.
2. **Développer une expérience utilisateur fluide** sur desktop & mobile pour garantir une
   accessibilité optimale à nos clients.
3. **Créer un back-office complet** qui permettra à l’équipe interne de **Althea Systems** de gérer
   les produits proposés, les commandes, ainsi que la facturation des produits.
4. **Garantir la scalabilité et la maintenabilité** de la solution sur le long terme, afin d'intégrer
   de nouvelles fonctionnalités à l'avenir sans remettre en cause l'architecture de la plateforme.

## II. SITEMAP

L'organigramme se divise en trois grandes catégories principales :

1. **Pages principales :**
   o Accueil
   o Catégories
   o Recherche
   o Produits
   o Contact
   o ChatBot
2. **Pages de commande :**
   o Panier
   o Checkout
   o Confirmation
3. **Pages liées au compte utilisateur :**
   o Mon compte
   ▪ Paramètres
   ▪ Mes commandes
   o Créer un compte
   o Se connecter / Se deconnecter
   ▪ Mot de passe oublié

Ce tableau montre les interconnexions et les flux entre les différentes sections du site, à l'exception
des pages statiques :

```
Catégorie Page Sous-pages/Actions
```

```
Pages principales Accueil -
```

```
Catégories Produit
```

```
Recherche^ -^
```

```
Chatbot
```

```
Pages de commande Panier -
```

```
Checkout -
```

```
Confirmation^ -^
```

```
Pages liées au compte utilisateur Mon compte Paramètres, Mes commandes
```

```
Créer un compte^ -^
```

```
Se connecter Mot de passe oublié
```

## III. LAYOUT

Pour organiser la structure du projet en incluant toutes les fonctionnalités mentionnées dans votre
description, voici un tableau détaillant les éléments présents sur chaque page du site, que ce soit sur
la version mobile ou desktop.

```
Élément Description
```

```
En-tête Visible sur toutes les pages, avec les éléments suivants :
```

- Logo Logo de l'entreprise placé à gauche de l'en-tête.
- Barre de recherche
  Une barre de recherche permettant aux utilisateurs de trouver des produits
  rapidement.
- Accès au panier
  d'achat

```
Un bouton menant au panier d’achat, avec un indicateur (point) si le panier
contient des articles.
```

- Menu de
  navigation

```
Un menu principal permettant de naviguer entre les différentes sections du
site (Accueil, Catégories, etc.).
```

```
Zone de contenu
```

```
La zone principale de chaque page où sont affichés les produits, informations
ou formulaires associés.
```

```
Pied de page
(Desktop)
```

```
Visible uniquement sur la version desktop. Sur mobile, le contenu du pied de
page sera déplacé dans le menu de l'en-tête.
```

- CGU Un lien vers les Conditions Générales d'Utilisation du site.
- Mentions légales Un lien vers la page des Mentions Légales.
- Contact

```
Un lien vers la page de contact pour obtenir de l’aide ou des informations
supplémentaires.
```

- Liens vers réseaux
  sociaux

```
Des liens vers les profils de l'entreprise sur les différents réseaux sociaux
(Facebook, Twitter, LinkedIn, etc.).
```

Ce tableau récapitule la structure générale des pages du site, y compris les composants qui apparaîtront
sur chaque page, en particulier l'en-tête, la zone de contenu principale et le pied de page, selon les

différentes versions (mobile/desktop).

## IV. Charte Graphique

```
Couleurs Principales
```

```
Statuts
```

CTA, liens, badges

#00a8b

Backgrounds

#d4f4f7 #33bfc^

Hover states

Disponibilité

#10b

Erreurs

#ef

Alerte

#F59E0B

```
Titres, navigation,
footer
```

#003d5c

```
✓ En stock ⚠ Stock Faible Rupture^ Nouveau
```

**Typographie :**

- Titres: **Poppins semibold**
- Corps: Inter Regular 400

### LOGOS

**Mobile Desktop**

## V. Page d'accueil

**Carrousel en trois parties :**

- La page d’accueil comporte un **carrousel** en trois sections, affichant des images et des liens
  promotionnels. Chaque section du carrousel doit être **modifiable via le back-office** (défini plus
  loin dans le cahier des charges fonctionnel - CDCF). Les administrateurs pourront :
  o Modifier les images et les textes.
  o Changer l’ordre des parties du carrousel.
  o Ajouter ou supprimer des sections en fonction des besoins.
  **Texte fixe :**
- Sous le carrousel, un texte fixe sera affiché. Ce texte doit également être **modifiable via le back-
  office** pour permettre la mise à jour régulière des messages importants ou des descriptions
  spécifiques.
  **Grille de catégories :**
- La page d'accueil contiendra ensuite une **grille de liens visuels** représentant les différentes
  **catégories de produits** proposés par la société.
  o Chaque image de catégorie sera **personnalisable** via le back-office, tout comme le **nom
  de la catégorie**.
  o L’ordre d’affichage des catégories dans la grille doit pouvoir être modifié, permettant
  de mettre en avant certaines catégories en fonction des promotions ou des saisons.
  **Les Top Produits du moment :**
- Juste en dessous de la grille des catégories, un titre intitulé **« Les Top Produits du moment »**
  introduira une sélection de produits vedettes.
  o Cette section affichera une **grille de produits sélectionnés** via le back-office. Les
  produits mis en avant pourront être choisis et leur ordre modifié dans cette grille,
  permettant à l’équipe de gestion de promouvoir certains articles.
  o Chaque produit sera représenté par une **image** et un **nom** dans un format simple et
  cohérent avec la grille des catégories.
  **Pied de page (Desktop) :**
- Le pied de page inclura les éléments suivants :
  o **Mentions légales** , **CGU** , **Contact** , et **liens vers les réseaux sociaux**.
  o Le contenu du pied de page restera accessible via un menu dans l’en-tête en mode
  mobile.

```
Résumé des fonctionnalités principales :
```

- **Personnalisation via le back-office** : Les images, textes, et l’ordre des catégories et
  produits affichés sur la page d’accueil doivent être entièrement modifiables par les
  administrateurs depuis un back-office intuitif.
- **Grille dynamique** : Tant pour les catégories que pour les produits vedettes, une grille
  simple et esthétique permettra aux utilisateurs de naviguer facilement entre les offres
  proposées.
  **Optimisation pour desktop et mobile** : La page d’accueil et son pied de page doivent être adaptés
  aux formats desktop et mobile, offrant une expérience utilisateur optimale sur les deux plateformes.

## VI. Page d’accès au catalogue de produits

Cette page servira de **point d’accès principal** au catalogue de produits, en mettant en avant les
différentes catégories disponibles. Elle présentera les éléments suivants :
**Image principale de la catégorie**

- En haut de la page, une **image principale** sera affichée, reprenant celle utilisée dans la grille de
  catégories sur la page d'accueil.
- Cette image sera surmontée d’une **surimpression** affichant le **nom de la catégorie**.
- Sous l’image, une **description** de la catégorie sera fournie, permettant aux utilisateurs de
  comprendre le type de produits disponibles dans cette section.
  **Affichage des produits**
- Les produits seront affichés sous la description de la catégorie, avec un format qui varie selon
  le type de terminal utilisé :
  o **Mobile** : Les produits seront présentés sous forme de **liste** verticale, permettant une
  navigation simplifiée sur les petits écrans.
  o **Desktop** : Les produits seront disposés sous forme de **grille** , similaire à celles déjà
  présentes sur la page d’accueil, avec quelques modifications d’affichage pour s’adapter
  à la navigation desktop.
  **Informations des produits**
  Chaque produit affiché dans la catégorie devra inclure les informations suivantes :
- **Nom du produit** : Affiché de manière claire, en tant qu’élément principal.
- **Prix** : Visible juste sous le nom du produit pour une consultation rapide.
- **Indisponibilité du produit** : Cette information devra être affichée sous le prix avec une mention
  explicite du type **« En rupture de stock »**. Les produits concernés apparaîtront dans une couleur
  différente ou légèrement grisée pour signaler leur indisponibilité, tout en restant accessibles
  pour information.
  **Tri des produits**
- Les produits devront être triés par **priorité** dans l’ordre défini via le back-office. Les produits
  jugés prioritaires par les administrateurs seront affichés en premier.
- Les produits **épuisés** seront automatiquement placés **en dernier** dans la liste ou la grille.
- Les produits qui n’ont pas été priorisés explicitement via le back-office apparaîtront **entre** les
  produits prioritaires et ceux qui sont épuisés. Cela assure une meilleure visibilité des articles
  les plus importants, tout en permettant aux utilisateurs de voir les produits disponibles avant
  ceux qui sont en rupture de stock.

```
Résumé des fonctionnalités principales :
```

- **Image principale et description** : Affichage d'une image représentative de la catégorie,
  avec une description pertinente en-dessous pour introduire les produits.
- **Affichage adapté au terminal** : La page sera responsive, avec un affichage en **liste** pour les
  appareils mobiles et une **grille** sur desktop.
- **Informations sur les produits** : Chaque produit affichera son nom, son prix, et un
  indicateur de stock épuisé si nécessaire.
  **Tri dynamique des produits** : Les produits sont triés par priorité (définie via le back-office), puis
  par disponibilité, avec les articles épuisés placés en fin de liste ou grille.

## VII. Page produit

Cette page est cruciale car elle permet aux clients de découvrir et d'acheter les **produits** proposés par
**Althea Systems**. L'expérience utilisateur sur cette page doit être fluide et centrée sur les bénéfices des
produits proposés, avec des informations détaillées sur les fonctionnalités, la sécurité, et les avantages
pour les entreprises.

**Éléments présents sur la page produit :**

1. **Carrousel d’illustrations** :
   o Un **carrousel d’illustrations** représentant les produits offerts, comme des
   photographies ou différentes vues pour les produits.
2. **Nom du produit** :
   o Le **nom du produit** sera affiché en grand et en gras, pour permettre une identification
   rapide du produit.
3. **Description du produit :**
   o Une **description complète** du produit expliquera ses fonctionnalités principales.
4. **Caractéristiques techniques** :
   o Une section dédiée aux **caractéristiques techniques** détaillera les spécificités du
   produit.
5. **Prix** :
   o Le **prix** sera affiché de manière bien visible.
6. **Disponibilité** :
   o Si le produit est indisponible, cela devra être clairement indiqué avec une mention du
   type "Rupture de Stock".
7. **Produits similaires** :
   o En bas de la page, une **liste de 6 produits similaires** sera proposée. Ces produits seront
   tirés aléatoirement de la même catégorie, et seront en **priorité** ceux qui sont
   disponibles à l'achat immédiat.
   **Call-to-action (CTA) :**

- Le **call-to-action principal** sur cette page sera un bouton **« Ajouter au panier »** ou **« Acheter
  maintenant ».**
- Si les produit est en rupture de stock, le bouton sera désactivé avec la mention **« En rupture
  de stock »**.
- Le CTA devra être visible et intuitif, de manière à inciter les utilisateurs à s’abonner rapidement
  ou à entamer une période d’essai.

```
Résumé des fonctionnalités principales :
```

- **Carrousel d’illustrations** : Affichage des différentes vues du produit.
- **Informations détaillées** : Nom, description, caractéristiques techniques, prix.
- **CTA dynamique** : Un bouton d'appel à l'action clairement visible, modifiable selon la
  disponibilité du produit.
  **Produits similaires** : Une liste de produits similaires pour encourager l'exploration d'autres
  solutions de sécurité.

## VIII. Page de recherche

Afin de faciliter la recherche de produits spécifiques pour notre clientèle, nous mettons en place une
page de **recherche avancée** , accessible à tout moment depuis l’en-tête du site. Cette page permettra
aux utilisateurs de filtrer et de trier les produits en fonction de plusieurs critères, pour trouver
rapidement la solution adaptée à leurs besoins.

**Facettes de recherche :**
La recherche avancée offrira plusieurs **facettes** que les utilisateurs pourront utiliser pour affiner leur
recherche. Ces facettes incluent :

1. **Texte du titre** :
   o Permet de rechercher un produit par son **nom** ou son titre. Ce champ est conçu pour
   offrir des résultats rapides et précis, avec des règles de priorité définies (voir plus bas).
2. **Texte de la description** :
   o Les utilisateurs pourront rechercher des produits basés sur les **descriptions** associées
   à ces derniers. Ce critère est utile pour trouver des produits en fonction de
   fonctionnalités spécifiques mentionnées dans les descriptions.
3. **Caractéristiques techniques du produit** :
   o Ce filtre permet de sélectionner les produits en fonction de leurs **caractéristiques**
   **techniques** spécifiques.
4. **Prix minimum et prix maximum** :
   o Les utilisateurs pourront définir un **intervalle de prix** pour afficher uniquement les
   produits correspondant à leur budget.
5. **Catégorie(s)** :
   o Un filtre basé sur les **catégories** de produits, permettant aux utilisateurs de restreindre
   leur recherche à un type de produit particulier.
6. **Uniquement produits disponibles** :
   o Ce filtre affichera uniquement les produits **disponibles à l’achat immédiat** , masquant
   les produits actuellement non disponibles.

**Règles de correspondance de recherche :**
Pour les facettes de texte (titre et description), la correspondance de recherche doit respecter les
priorités suivantes :

1. **Correspondance exacte** : Les résultats qui correspondent exactement au texte de recherche de
   l’utilisateur seront prioritaires.
2. **Un caractère de différent** : Les résultats qui contiennent une légère variation (une seule lettre
   différente) apparaîtront ensuite.

3. **Commence par** : Les produits dont le titre ou la description commence par le texte recherché
   seront affichés après.
4. **Contient** : Les résultats qui contiennent le texte recherché quelque part dans le titre ou la
   description apparaîtront ensuite.

**Tri des résultats :**

Les utilisateurs pourront également trier les résultats de recherche selon plusieurs critères, chacun avec
une option de tri **ascendant** ou **descendant** :

1. **Prix** : Tri basé sur le prix des produits, soit du plus bas au plus élevé, soit inversement.
2. **Nouveauté** : Les produits peuvent être triés selon leur **date d’ajout** ou de mise à jour, pour
   afficher en premier les produits les plus récents ou les plus anciens.
3. **Disponibilité** : Tri basé sur l’état du **stock** , pour afficher en premier les produits disponibles,
   puis ceux indisponibles.

**Propriétés dynamiques depuis le back-office :**
Toutes les facettes de recherche et les options de tri sont basées sur les propriétés des produits, telles
qu’elles sont définies et modifiées via le **back-office**. Toute modification effectuée depuis le back-office
sera intégrée instantanément dans les résultats de recherche pour garantir une **mise à jour en temps
réel**.

**Performance de la recherche :**
La rapidité des résultats de recherche est une priorité. Les résultats doivent apparaître **en moins de
100 ms** , même lorsque des modifications sont effectuées dans le back-office. Cela garantit une
**expérience utilisateur fluide** , où les résultats reflètent immédiatement les mises à jour et changements
effectués sur les produits disponibles.

```
Résumé des fonctionnalités principales :
```

- **Recherche avec facettes** : Les utilisateurs peuvent affiner leur recherche avec plusieurs
  filtres (titre, description, caractéristiques techniques, prix, catégories, disponibilité).
- **Tri dynamique** : Les résultats peuvent être triés par prix, nouveauté, ou disponibilité, avec
  un contrôle sur l’ordre ascendant ou descendant.
- **Mises à jour en temps réel** : Toute modification apportée dans le back-office est
  immédiatement intégrée dans les résultats de recherche, garantissant la pertinence des
  informations.
  **Performances optimisées** : Les résultats doivent apparaître en moins de 100 ms, offrant une
  expérience utilisateur fluide et réactive.

## IX. Page du panier

Le panier est une composante essentielle de l’expérience utilisateur. Il est accessible à tous, qu’ils soient
connectés ou non, et permet de récapituler les produits ajoutés par les utilisateurs avant de finaliser
leur commande.
**Fonctionnalités de la page du panier :**

1. **Liste des produits ajoutés** :
   o La page du panier affiche une **liste récapitulative** des produits que l’utilisateur a
   ajoutés. Chaque produit est affiché avec les détails suivants :
   ▪ **Nom du produit**
   ▪ **Quantité**
   ▪ **Prix unitaire et prix total** : Le prix total est calculé en fonction de la quantité
   choisie.
   o Les utilisateurs peuvent **modifier la quantité** ou **supprimer** des produits directement
   depuis le panier.
2. **Total à payer** :
   o Un calcul en temps réel du **montant total** à payer est affiché en bas de la liste des
   produits. Ce montant inclut toutes les **taxes applicables** et tient compte des
   **promotions éventuelles**.
   o Le total à payer est **mis à jour automatiquement** à chaque modification dans le panier
   (ajout/suppression de produit, changement de quantité).
3. **Accessibilité pour tous les utilisateurs** :
   o Le panier est accessible à **tous les utilisateurs** , qu’ils soient connectés ou non. Un
   utilisateur non connecté pourra continuer à **ajouter des produits** à son panier et
   consulter le total à payer.
   o Si l’utilisateur n’est pas connecté, un **rappel** sera affiché pour encourager la création
   d’un compte ou la connexion avant de passer à l’étape de paiement, afin de
   sauvegarder son panier.
4. **Appel à l’action (CTA) - Passer à la caisse** :
   o Un bouton **« Passer à la caisse »** sera visible en bas du panier, permettant aux
   utilisateurs de **finaliser leur commande**. Ce bouton incitera les utilisateurs non
   connectés à se **connecter** ou à **créer un compte** pour poursuivre, tout en leur
   permettant de continuer comme invités s'ils le préfèrent.
   o Si un produit est temporairement **indisponible** , un message d’alerte sera affiché et
   l'utilisateur ne pourra pas finaliser la commande tant que ce problème n'est pas résolu.
5. **Gestion des produits indisponibles** :
   o Si un produit dans le panier devient **indisponible** , il sera marqué clairement avec un
   message **« Indisponible »** à côté de son nom.
   o Le total du panier sera ajusté en conséquence, et les utilisateurs auront la possibilité
   de **retirer** ou de **remplacer** le produit indisponible avant de passer à la caisse.

```
Résumé des fonctionnalités principales :
```

- **Liste des produits ajoutés** : Le panier affiche les produits avec leurs détails (nom,
  quantité, prix).
- **Calcul automatique du total** : Le total à payer est mis à jour en temps réel en
  fonction des modifications apportées au panier.
- **Accessibilité universelle** : Le panier est accessible aux utilisateurs connectés ou
  non, avec un rappel pour la connexion avant le paiement.
- **Appel à l’action clair** : Un bouton « Passer à la caisse » permet de finaliser
  l'achat, tout en gérant les produits temporairement indisponibles.

## X. Étapes du checkout

Une fois le panier validé, l’utilisateur est dirigé vers le processus de **checkout** , qui se décompose en
plusieurs étapes. Ce processus est conçu pour être simple et efficace, tout en garantissant la sécurité
des informations de l’utilisateur.

**1. Connexion ou inscription (si non connecté) :** - **Connexion** : Si l’utilisateur n’est pas encore connecté, il sera invité à se **connecter** à son compte. - **Inscription** : Si l’utilisateur ne dispose pas encore d’un compte, il aura la possibilité de **s'inscrire**
rapidement. Il pourra fournir les informations nécessaires pour la création de compte
directement pendant le processus de checkout.
o Si l'utilisateur préfère, il pourra également continuer le processus en tant qu’ **invité** ,
mais il devra créer un compte pour la gestion de ses achats plus tard.
**2. Adresse de facturation/livraison :** - Une fois connecté ou inscrit, l’utilisateur devra entrer ses informations d’adresse.
L'utilisateur pourra :
o **Entrer une nouvelle adresse** ou
o **Choisir parmi les adresses déjà enregistrées** dans son compte.
Les informations d’adresse demandées sont les suivantes : - **Prénom** - **Nom** - **Adresse 1** (rue, numéro) - **Adresse 2** (optionnel, complément d'adresse) - **Ville** - **Région** - **Code postal** - **Pays** - **Numéro de téléphone mobile** (pour d'éventuelles notifications liées aux achats ou la
facturation)
**3. Informations de paiement :** - L’utilisateur devra entrer ses informations de paiement. Il aura également la possibilité de
**choisir parmi les cartes déjà enregistrées** s’il a déjà effectué un achat ou enregistré des
informations de paiement.
Les informations de paiement demandées incluent : - **Nom sur la carte** (nom du détenteur) - **Numéro de carte** (16 chiffres) - **Date d’expiration** (mois et année) - **CVV** (code de sécurité à 3 chiffres au dos de la carte)

Un système de paiement sécurisé sera utilisé pour garantir la confidentialité des informations fournies
par l'utilisateur (par exemple, via des **solutions de paiement sécurisé comme Stripe ou PayPal** ).

**4. Page de confirmation :** - Une fois les informations de paiement saisies, l’utilisateur sera dirigé vers une **page de**
**confirmation**. Cette page affichera :
o **Un récapitulatif complet** de la commande, incluant les produits achetés, leur prix, et
les éventuelles taxes appliquées.
o **L’adresse de facturation** choisie par l’utilisateur.
o **Les informations de paiement** sélectionnées ou ajoutées.
Un bouton **« Confirmer l’achat »** permettra à l’utilisateur de finaliser la commande. Une fois cliqué, la
transaction sera traitée, et l’utilisateur recevra un **e-mail de confirmation** de son achat avec tous les
détails pertinents.

**5. Possibilité de modifier**

**6. Si la facture est supprimée, un avoir sera automatiquement créé.**

**7. Possibilité de générer une facture au format PDF afin de pouvoir l’imprimer et le stocker.**

```
Résumé des étapes du checkout :
```

1. **Connexion ou inscription** : L'utilisateur devra se connecter ou créer un compte, avec la
   possibilité de continuer en tant qu’inviter pour finaliser la commande.
2. **Adresse de facturation/livraison** : L’utilisateur pourra ajouter une nouvelle adresse ou choisir
   une adresse existante, en remplissant les champs de base (prénom, nom, adresse, téléphone).
3. **Informations de paiement** : Les informations de paiement (nom sur la carte, numéro de carte,
   expiration, CVV) devront être saisies ou choisies parmi celles déjà enregistrées.
   **Page de confirmation** : Un récapitulatif complet de la commande et des informations sera
   affiché avant de finaliser l'achat via le bouton « Confirmer l’achat ».
4. **Modification d’une facture**
5. Création d’un avoir en cas de suppression d’une facture
6. Format PDF des factures.

## XI. Inscription pour les utilisateurs du site Althea Systems

Tout visiteur peut créer un compte sur le site de **Althea Systems** pour accéder aux produits. Le
processus d’inscription doit être simple, intuitif et sécurisé, tout en garantissant la validation correcte
des informations.
**Étapes d’inscription :**

1. **Formulaire d’inscription** :
   o Le visiteur devra remplir un **formulaire d’inscription** contenant les informations
   suivantes :
   ▪ **Nom complet** (prénom et nom)
   ▪ **Adresse e-mail valide**
   ▪ **Mot de passe** (doit respecter les critères de sécurité régis par la CNIL et le
   RGPD.
   ▪ La **validation des formulaires** devra suivre les meilleures pratiques de sécurité
   et d’expérience utilisateur, assurant que toutes les données sont valides avant
   de soumettre le formulaire.
2. **Validation des informations** :
   o Une fois le formulaire soumis, des vérifications automatiques doivent être effectuées
   pour garantir que :
   ▪ **Le nom complet** est présent et valide.
   ▪ **L’adresse e-mail** suit un format valide (ex. : email@domaine.com).
   ▪ **Le mot de passe** respecte les règles de sécurité
   Si une information est manquante ou incorrecte, l’utilisateur sera
   immédiatement averti via des **messages d’erreur clairs
   Confirmation de l’inscription par e-mail** :
   o Une fois le formulaire d’inscription validé, un e-mail de **confirmation** sera
   automatiquement envoyé à l’adresse e-mail fournie par l’utilisateur. Cet e-mail
   contient un lien de validation unique que l’utilisateur devra cliquer pour **confirmer son**
   **inscription**.
   o Tant que l’inscription n’a pas été confirmée via l’e-mail, l’utilisateur ne pourra pas
   accéder à certaines fonctionnalités de gestion de compte, mais il pourra toujours
   naviguer sur le site.
3. **Accès au compte après confirmation** :
   o Après avoir cliqué sur le lien de confirmation dans l’e-mail, l’utilisateur sera **redirigé**
   **vers le site** et connecté automatiquement à son compte.
   o Il pourra ensuite **compléter son profil** , **ajouter des informations supplémentaires**
   (telles que des adresses de facturation ou des méthodes de paiement), et accéder à
   son tableau de bord.
   **Best practices de sécurité et validation des formulaires :**

- Les informations du formulaire (notamment l'e-mail et le mot de passe) devront être **chiffrées**
  et sécurisées avant l’envoi.
- La **validation des données** se fera côté client (pour une expérience utilisateur fluide) et côté
  serveur (pour éviter les failles de sécurité).
- Des règles de **force du mot de passe** seront appliquées pour assurer un niveau de sécurité
  élevé.
- L'e-mail de confirmation inclura un lien unique et sécurisé, valide pendant un **temps limité**
  (par exemple, 24 heures) pour valider l’inscription.

```
Résumé des fonctionnalités principales :
Formulaire d’inscription : Simple et efficace, demandant le nom complet, l’e-mail, et un mot de
passe, avec validation en temps réel.
Vérification des informations : Les informations saisies sont vérifiées automatiquement, et les
erreurs sont signalées immédiatement à l’utilisateur.
Confirmation par e-mail : Un e-mail de validation est envoyé après l’inscription, et l’utilisateur
doit cliquer sur un lien pour activer son compte.
Sécurité : Les meilleures pratiques de sécurité sont appliquées pour la validation du mot de passe et
le traitement des informations sensibles.
```

## XII. Connexion pour les utilisateurs de Althea Systems

Seuls les utilisateurs qui ont validé leur inscription via l’e-mail de confirmation peuvent accéder à leur
compte et se connecter au site. La page de connexion doit être simple, sécurisée, et offrir une
expérience utilisateur fluide, notamment en cas de perte de mot de passe ou de tentative d'accès à
des pages privées.
**Fonctionnalités de la page de connexion :**

1. **Connexion standard** :
   o L’utilisateur devra fournir les informations suivantes pour se connecter :
   ▪ **Adresse e-mail** : celle utilisée lors de l’inscription.
   ▪ **Mot de passe** : celui défini lors de la création du compte.
   Si l’e-mail et le mot de passe sont corrects, l’utilisateur sera redirigé vers son **tableau de bord** ou la
   **page privée** qu’il tentait d’accéder.
2. **Gestion des erreurs de connexion** :
   o **Mot de passe ou/et identifiant incorrect** : Si l’utilisateur entre un **mot de passe ou/et
   un identifiant incorrect** , un message d’erreur doit apparaître. Ce message indiquera
   que le mot de passe et/ou l’identifiant est incorrect. Il sera proposé un lien vers la page
   **« Mot de passe oublié »** pour récupérer un nouveau mot de passe.
   o **Utilisateur non inscrit ou non confirmé** : Si un utilisateur tente de se connecter sans
   avoir **validé son inscription** via l’e-mail de confirmation, un message d’erreur l’invitera
   à vérifier sa boîte e-mail pour confirmer son compte ou à contacter le support en cas
   de problème.
3. **Page de redirection pour accès à des pages privées** :
   o Si un utilisateur essaie d’accéder à une **page privée** (c’est-à-dire une page nécessitant
   une connexion, comme la gestion des commandes), il sera automatiquement **redirigé
   vers la page de connexion**.
   o Une fois que l’utilisateur s’est **connecté avec succès** , il sera **redirigé vers la page privée**
   qu’il tentait d’accéder initialement, pour assurer une continuité de la navigation.
   o Cette redirection est essentielle pour garantir que les utilisateurs puissent revenir
   directement à la page souhaitée sans avoir à la rechercher manuellement.
4. **Gestion de la session utilisateur** :
   o Pour les utilisateurs qui souhaitent rester connectés, une option **« Se souvenir de moi
   »** sera disponible sur la page de connexion. Cela permet de sauvegarder la session et
   d'éviter de demander une nouvelle connexion lors de chaque visite.
   o En cas de session expirée ou déconnexion manuelle, l'utilisateur devra se reconnecter
   pour accéder aux pages privées.

**Mot de passe oublié :**

- Si l'utilisateur a oublié son mot de passe, un lien **« Mot de passe oublié »** sera disponible sur
  la page de connexion.
- En cliquant sur ce lien, l'utilisateur sera redirigé vers une page dédiée où il devra entrer son
  **adresse e-mail** pour recevoir un e-mail contenant un lien sécurisé de **réinitialisation de mot**
  **de passe**.
- Ce lien sera valide pour une période limitée (par exemple, 24 heures), garantissant que la
  réinitialisation du mot de passe se fasse de manière sécurisée.

```
Résumé des fonctionnalités principales :
```

1. **Connexion réservée aux utilisateurs inscrits** : Seuls les utilisateurs ayant validé leur
   inscription peuvent se connecter.
2. **Gestion des erreurs de mot de passe** : En cas de mot de passe incorrect, un lien vers la
   page « Mot de passe oublié » sera proposé.
3. **Redirection pour les pages privées** : Si un utilisateur essaie d’accéder à une page privée
   sans être connecté, il sera redirigé vers la page de connexion, puis renvoyé vers la page
   privée après connexion.
4. **Option « Se souvenir de moi »** : Les utilisateurs peuvent choisir de rester connectés pour
   des connexions futures simplifiées.
5. **Réinitialisation de mot de passe** : Une option « Mot de passe oublié » permet de recevoir
   un lien pour réinitialiser le mot de passe en cas de perte.

## XIII. Modification du compte utilisateur

Les utilisateurs connectés peuvent accéder à une section dédiée pour **modifier les informations**
associées à leur compte. Cette section doit être simple d’utilisation, sécurisée et permettre à
l'utilisateur de mettre à jour ses informations personnelles, consulter ses achats, ainsi que ses
méthodes de paiement et adresses.

**Fonctionnalités de gestion du compte :**

1. **Informations personnelles** :
   o L’utilisateur peut modifier ses **informations personnelles** telles que :
   ▪ **Nom complet** : Utilisé uniquement pour personnaliser les e-mails envoyés à
   l’utilisateur (par exemple, confirmations d’achat).
   ▪ **Adresse e-mail** : L’utilisateur peut changer l’e-mail lié à son compte, qui est
   également utilisé pour les connexions et notifications. Après la modification
   de l'e-mail, un **e-mail de confirmation** sera envoyé à la nouvelle adresse pour
   valider ce changement.
   ▪ **Mot de passe** : L’utilisateur a la possibilité de changer son mot de passe. Pour
   des raisons de sécurité, il devra entrer son **mot de passe actuel** avant de
   pouvoir en définir un nouveau. Des critères de sécurité seront appliqués pour
   le nouveau mot de passe.

2. **Consultation des achats** :
   o L’utilisateur peut consulter les achats qu’il a effectué sur la plateforme, sous forme de
   liste, avec une option pour renouveler un achat précédemment effectué.
   o Affichage des commandes en cours, supprimées, terminées.
3. **Carnet d’adresses** :
   o L’utilisateur peut gérer plusieurs **adresses** pour la facturation et, si nécessaire, pour la
   livraison (si des produits physiques sont également proposés). Il peut :
   ▪ **Ajouter une nouvelle adresse** : Le formulaire inclut des champs pour le
   prénom, nom, adresse 1, adresse 2 (optionnel), ville, région, code postal, pays,
   et numéro de téléphone.
   ▪ **Modifier une adresse existante** : L’utilisateur peut ajuster les informations
   d’une adresse déjà enregistrée.
   ▪ **Supprimer une adresse** : Si une adresse n’est plus utilisée, elle peut être
   supprimée facilement.
4. **Méthodes de paiement** :
   o L’utilisateur peut également gérer ses **méthodes de paiement**.
   o Les fonctionnalités incluent :
   ▪ **Ajouter une nouvelle carte** : L’utilisateur peut ajouter une carte de paiement
   avec les informations suivantes : nom sur la carte, numéro de carte, date
   d’expiration, CVV.
   ▪ **Supprimer une méthode de paiement** : Si une carte n’est plus valide ou que
   l’utilisateur ne souhaite plus l’utiliser, elle peut être supprimée du compte.
   ▪ **Définir une méthode de paiement par défaut** : L’utilisateur peut choisir
   laquelle de ses cartes sera utilisée par défaut lors du prochain paiement.
   **Sécurité des modifications :**

- Toutes les modifications effectuées par l'utilisateur (e-mail, mot de passe, méthodes de
  paiement) doivent être **sécurisées** avec des mesures comme une **demande de validation par
  e-mail** pour les changements d’e-mail, et une demande de **mot de passe actuel** pour les
  modifications sensibles (comme le mot de passe ou les méthodes de paiement).
- Les **informations de paiement** seront cryptées et protégées via une solution sécurisée
  conforme aux normes **PCI-DSS** , garantissant que les données bancaires de l'utilisateur sont
  stockées et traitées de manière sécurisée.

```
Résumé des fonctionnalités principales :
```

1. **Modification des informations personnelles** : L’utilisateur peut changer son nom complet,
   son adresse e-mail (avec validation), et son mot de passe (avec demande de confirmation de
   l’ancien mot de passe).
2. **Gestion des achats** : L’utilisateur peut consulter ou renouveler ses achats directement
   depuis son compte.
3. **Affichage des commandes** en cours, supprimées, et terminées.
4. **Gestion des adresses** : L’utilisateur peut ajouter, modifier ou supprimer des adresses de
   facturation/livraison.
5. **Méthodes de paiement** : L’utilisateur peut ajouter, supprimer ou définir des méthodes de
   paiement par défaut pour ses achats.
6. **Sécurité renforcée** : Les modifications sensibles sont protégées par des validations
   supplémentaires (e-mails, mot de passe actuel) pour garantir la sécurité des données de
   l’utilisateur.

## XIV. Historique des commandes

L’utilisateur doit pouvoir accéder à une page dédiée qui répertorie toutes ses **commandes passées**.
Ces commandes seront **regroupées par année** pour faciliter la recherche et la consultation.
**Fonctionnalités de l'historique des commandes :**

1. **Affichage des commandes par année** :
   o Les commandes passées seront **regroupées par année** , avec chaque année présentée
   sous la forme d’un titre principal. Sous chaque année, la liste des commandes sera
   visible dans l’ordre chronologique, de la plus récente à la plus ancienne.
   o Chaque entrée dans la liste des commandes devra inclure les informations suivantes :
   ▪ **Nom du produit** commandé.
   ▪ **Date de la commande**.
   ▪ **Montant total payé**.
   ▪ **Statut de la commande** (terminée, active, renouvelée, etc.).
2. **Accès détaillé à chaque commande** :
   o En cliquant sur une commande spécifique dans la liste, l’utilisateur pourra accéder à
   un **détail complet** de cette commande, incluant :
   ▪ **Le produit commandé**.
   ▪ **Le mode de paiement** utilisé (sans afficher les détails complets de la carte pour
   des raisons de sécurité, uniquement les 4 derniers chiffres).
   ▪ **L’adresse de facturation** utilisée au moment de la commande.
   ▪ Un **lien pour télécharger la facture** associée à cette commande, au format PDF.
3. **Filtrer par année ou type de commande** :
   o L'utilisateur pourra **filtrer** la liste des commandes en sélectionnant une année
   spécifique, ou en filtrant par **type de produit**
   o Un filtre supplémentaire pourrait permettre à l’utilisateur de consulter uniquement les
   **commandes encore actives** ou celles qui ont été **résiliées**.
4. **Recherche de commande** :
   o Une **barre de recherche** sera disponible pour permettre aux utilisateurs de rechercher
   une commande spécifique par **nom du produit** ou par **date de commande**.
   o Cela permettra à l'utilisateur de retrouver rapidement une commande précise sans
   avoir à parcourir l'intégralité de l'historique.
5. **Téléchargement des factures** :
   o Chaque commande dans l’historique aura un lien permettant de **télécharger la facture**
   associée, au format PDF. Cela offre à l'utilisateur la possibilité de conserver ou
   d'imprimer ses factures pour des raisons de comptabilité ou d'archivage.
   **Sécurité et confidentialité des informations :**

- Les détails des commandes, en particulier ceux relatifs aux **paiements** , seront présentés de
  manière sécurisée, sans afficher les informations complètes de la carte de paiement.
- Toutes les factures et informations seront stockées de manière sécurisée sur les serveurs de
  Althea Systems, et accessibles uniquement aux utilisateurs connectés.

```
Résumé des fonctionnalités principales :
```

1. **Historique par année** : Les commandes sont regroupées par année, avec un accès facile
   aux commandes passées et actives.
2. **Détail de chaque commande** : L’utilisateur peut consulter les détails complets de chaque
   commande, y compris les informations sur le produit, le mode de paiement, et télécharger
   les factures associées.
3. **Filtres et recherche** : L'utilisateur peut filtrer les commandes par année, type de produit, ou
   rechercher une commande spécifique.
4. **Téléchargement des factures** : Un lien de téléchargement pour chaque facture est
   disponible, permettant un archivage et une gestion des commandes simplifiée.

## XV. Page Outils – Formulaire de contact avec Chatbot

Cette page permet à tous les utilisateurs, qu'ils soient connectés ou non, de nous contacter via un
**formulaire de contact** classique, ainsi qu'un **service de chatbot** pour des réponses instantanées. Les
messages envoyés via le formulaire seront accessibles depuis le **backoffice** , tandis que le chatbot
pourra traiter certaines demandes automatiquement.

**Fonctionnalités du formulaire de contact :**

1. **Champs du formulaire** :
   o Le formulaire comprend les champs suivants :
   ▪ **Adresse e-mail** : Le champ obligatoire pour entrer une adresse e-mail valide,
   pour que nous puissions répondre à l'utilisateur.
   ▪ **Sujet du message** : Un champ où l’utilisateur peut indiquer le sujet de sa
   demande (par exemple, « Problème technique », « Question sur la commande
   », « Assistance générale »).
   ▪ **Texte du message** : Un champ texte libre où l’utilisateur peut écrire sa
   demande ou question.
2. **Validation et soumission** :
   o Tous les champs obligatoires doivent être remplis avant de soumettre le formulaire.
   o Une **confirmation visuelle** sera affichée après soumission, informant l’utilisateur que
   son message a bien été envoyé et que nous le contacterons sous peu.
   o Les messages seront accessibles dans le **backoffice** pour un traitement par l'équipe de
   support.

**Ajout du bouton « Contact Me » avec chatbot :**

1. **Bouton « Contact Me »** :
   o Un **bouton « Contact Me »** sera présent sur la page. Ce bouton déclenchera un **chatbot**
   qui apparaîtra sous forme de fenêtre de chat en temps réel.
   o Le chatbot permettra à l’utilisateur d’ **interagir immédiatement** pour des questions
   courantes, l’assistance technique de base, ou pour guider l’utilisateur à travers
   certaines fonctionnalités du site.
2. **Fonctionnalités du chatbot** :
   o **Réponses instantanées** : Le chatbot sera capable de répondre immédiatement aux
   questions fréquentes (par exemple, « Comment modifier mon adresse? », « Quelles
   sont les méthodes de paiement acceptées? »).
   o **Escalade vers un humain** : Si le chatbot ne peut pas répondre à une question complexe
   ou si l’utilisateur souhaite parler à un **agent humain** , le chatbot proposera de transférer

```
la demande vers un membre de l’équipe de support. Dans ce cas, une notification sera
envoyée à l’équipe via le backoffice.
o Saisie des informations utilisateur : Le chatbot peut aussi capturer certaines
informations de base (par exemple, l'adresse e-mail, le sujet de la question) pour
accélérer la gestion de la demande.
```

3. **Interaction avec le backoffice** :
   o Les interactions avec le chatbot seront également enregistrées et **accessibles dans le**
   **backoffice** pour permettre à l’équipe de support de suivre les conversations et
   d’apporter un suivi, si nécessaire.
   o Si un utilisateur utilise le chatbot mais souhaite soumettre un message plus détaillé,
   un lien vers le **formulaire de contact** sera proposé directement depuis la conversation
   du chatbot.

```
Résumé des fonctionnalités principales :
```

1. **Formulaire de contact classique** : Les utilisateurs peuvent entrer leur e-mail, sujet, et
   message pour envoyer une demande.
2. **Bouton « Contact Me » avec chatbot** : Un chatbot interactif est accessible via un bouton,
   permettant aux utilisateurs de recevoir des réponses instantanées.
3. **Escalade vers un agent humain** : Si le chatbot ne peut pas répondre à une demande
   complexe, il propose de transférer la conversation vers un membre de l'équipe de support.
4. **Intégration au backoffice** : Les messages soumis via le formulaire ou les conversations
   avec le chatbot sont centralisés dans le backoffice pour un suivi par l’équipe.

## XVI. Backoffice

Le back-office est un outil réservé aux administrateurs et gestionnaires d'Althéa Systems, leur
permettant de gérer l'ensemble de la plateforme e-commerce. Il doit être fonctionnel, intuitif, sécurisé,
et offrir une gestion complète des ressources avec des tableaux de bord pour visualiser les
performances.

**1. Indicateurs clés en chiffres (cards) :**

```
▪ Chiffre d’affaires du jour / semaine /mois
▪ Nombre de commandes du jour
▪ Alertes produits en rupture de stock (badge rouge si >0)
▪ Messages de contact non traités(badge)
```

**2. Histogramme camembert des ventes par catégorie :**
Un graphique **camembert** présentera la **répartition des ventes par catégorie** sur les 7 derniers jours,
avec une possibilité de modification de la période sur les 5 dernières semaines.
Cela permet de voir facilement quelle catégorie de produits est la plus performante en termes de
volume de ventes.

```
▪ Affichage : 7 derniers jours
▪ Données : Répartition % du CA par catégorie
```

```
▪ Affichage du montant € au survol
```

**3. Actions rapides :** Bouton d’accès direct :

```
▪ « Nouvelle commande »
▪ « Ajouter un produit »
▪ « Voir les messages »
```

**4. Gestion des Produits :
Liste des produits :** Vue tableau avec les colonnes suivantes :

```
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
```

**Actions groupées :**

```
▪ Supprimer la sélection (avec confirmation)
▪ Modifier le statut (publier/dépublier)
▪ Modifier la catégorie
▪ Export de la sélection
```

Le backoffice doit inclure des **pages de gestion** pour chaque produit, avec les fonctionnalités suivantes

```
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
```

```
e) Supprimer un produit :
o Les administrateurs peuvent supprimer un produit spécifique, avec une confirmation
pour éviter les suppressions accidentelles.
```

**5. Fonctionnalités transversales du tableau des produits :**

```
▪ Tri par n’importe quelle colonne (ascendant / descendant)
▪ Recherche globale dans le tableau
▪ Pagination (25/50/10 produits par pages)
▪ Export CSV/Excel
```

Actions rapides (icônes : voir, éditer, supprimer.

**Gestion du carrousel sur la page d’accueil** (3 slides maximum).

```
▪ Upload multiple d’images en drag & drop (miniature)
▪ Réorganisation par glisser-déposer (définir l’ordre pour le carrousel front)
▪ Définir l’image principale (*)
▪ Suppression individuelle
▪ Lien de redirection
▪ Texte avec formatage (gras, italique, liens, couleurs) sous le carrousel
```

**6. Tableau de bord de suivi des ventes :**

Le backoffice inclura également un **tableau de bord** pour afficher les données de vente et de
performance des produits. Ce tableau de bord comportera plusieurs types de graphiques pour une vue
d’ensemble rapide et efficace :
a) **Histogramme des ventes par jour** :
o Un **histogramme** affichera le **total des ventes par jour** sur les 7 derniers jours. Cette
période pourra être **modifiée** pour afficher les ventes par semaine sur les 5 dernières
semaines.
o Ce graphique permet de suivre les tendances de vente sur une période donnée et de
visualiser les pics d’activité.
b) **Histogramme multi-couches des paniers moyens** :
o Un **histogramme multi-couches** affichera le **total des ventes par catégories** en
fonction des paniers moyens sur les 7 derniers jours. La période pourra également être
modifiée pour afficher les paniers moyens sur les 5 dernières semaines.
o Ce graphique permet de comparer les performances des différentes catégories de
produits.

**7. Paramètres avancés :**
URL personnalisée (slug SEO)

**8. Gestion des Catégories :**
Liste des catégories : Vu tableau hiérarchique avec les colonnes :

```
▪ Image(miniature)
▪ Nom(tri)
▪ Description
▪ Nombre de produits(tri)
▪ Ordre d’affichage(tri)
▪ Statut (Active/Inactive)
```

**Actions :**

```
▪ Voir, Éditer, supprimer,
▪ Ajouter une catégorie par un formulaire (nom, description, image, statut, URL personnalisée
(slug)
▪ Réorganiser par drag & drop
▪ Activer / Désactiver les catégories sélectionnées
```

**Détail d’une catégorie :**
Page de consultation avec vue sur les produits associés avec possibilité d’édition.

**9. Accès réservé aux administrateurs :**

- Le backoffice sera accessible uniquement aux **administrateurs** avec les autorisations
  appropriées.
- Une **authentification forte** sera nécessaire pour accéder à cette section, incluant des
  fonctionnalités de sécurité telles que l’authentification à deux facteurs.

**10. Gestion des utilisateurs :**

- Nom complet (tri, recherche)
- Email (tri, recherche)
- Date d’inscription (tri)
- Statut du compte (tri, filtre : actif / inactif/en attente de validation)
- Nombre de commandes
- CA total généré
- Dernière connexion
- Liste des adresses de facturation

Actions administratives :
Envoyer un mail
Réinitialiser le mot de passe
Désactiver le compte
Supprimer le compte (avec avertissement RGPD)

11.Gestion des commandes :

- N° de commande (tri, recherche)
- Date et heure(tri)
- Client (tri, recherche par nom/email)
- Montant TTC (tri)
- Statut (tri, filtre)
- Mode de paiement (tri, filtre)
- Statut du paiement (validé/en attente/Échoué)

Statuts avec code couleur

```
En attente – Commande créée, paiement en attente
```

```
En cours – Paiement validé, traitement en cours
```

```
Terminée – commande finalisée
```

```
Annulée – Commande annulée
```

Détail d’une commande :

- N° de commande
- Date et heure
- Statut actuel(modifiable)
- Historique des changements de statut (avec date et utilisateur)
- Informations de paiement
- Mode de paiement utilisé
- Date du paiement
- Statut :
  Validé,
  En attente,
  Échoué,
  Remboursé

12. Gestion de la facture :

- N° de la facture (généré automatiquement à la validation du paiement)
- Téléchargement de la facture au format PDF
- Renvoyer la facture par mail au client
- Modifier la facture (formulaire de modification)
- Supprimer la facture (génère automatiquement un avoir)

  13.Gestion des factures et avoirs :

Liste des factures

- N° de facture (tri, recherche)
- Date d’émission (tri, filtre)
- Client (tri, recherche)
- N° de commande associée (lien cliquable)
- Montant TTC (tri)
- Statut (tri, filtre : payée, en attente, annulée)

Liste des avoirs

- N° de l’avoir (tri, recherche)
- Facture liée (lien cliquable)
- Date d’émission (tri, filtre)
- Client (tri, filtre)
- Montant (négatif) (tri)
- Motif (annulation, remboursement, erreur)

Actions disponibles :

- Télécharger PDF de l’avoir
- Envoyer par email

## XVII. EN COMPLEMENT :

**Pagination :**
Toutes les listes de produits, que ce soit sur mobile ou desktop, devront être paginées de manière à
offrir une **navigation fluide** et rapide à travers les différents produits. Bien que nous ne précisions pas
de système de pagination particulier, celui-ci doit permettre aux utilisateurs de naviguer rapidement
vers une **page précise** ou d'utiliser une **navigation par lots** (pages suivantes et précédentes).

**Menu :**
Le menu de navigation sera un **menu burger** disponible à la fois pour les utilisateurs **connectés** et **non
connectés**. Ce menu diffère en fonction de l’état de connexion de l’utilisateur :

- **Connecté** :
  o Mes paramètres
  o Mes commandes
  o CGU
  o Mentions légales
  o Contact
  o À propos de Althea Systems
  o Se déconnecter
- **Non connecté** :
  o Se connecter
  o S’inscrire
  o CGU

```
o Mentions légales
o Contact
o À propos de Althea Systems
```

Ce menu doit être **réactif** et s'adapter à la taille de l'écran (mobile et desktop).

**i18n (Internationalisation) :**
Le site web devra être **multilingue** et offrir une **expérience utilisateur adaptée** pour les langues qui
s’écrivent de droite à gauche comme l’arabe ou l’hébreu. Les utilisateurs pourront **changer de langue**
facilement via un bouton de sélection de langue dans le menu. Le **backoffice** peut être uniquement en
anglais pour simplifier la gestion par les administrateurs.

**a11y (Accessibilité) :**
Nous accordons une grande importance à l’ **accessibilité** afin de garantir que **tous** les utilisateurs, y
compris ceux ayant des **handicaps**. Cela implique le respect des **normes d’accessibilité** telles que
**WCAG 2.1**. Les éléments interactifs (boutons, formulaires, menus) doivent être utilisables avec des
**technologies d’assistance** (lecteurs d’écran, navigation clavier) et les contrastes des couleurs doivent
être optimisés pour les personnes malvoyantes.

**Sécurité :**
La **sécurité** est une priorité. Nous nous attendons à ce que les normes de sécurité les plus strictes soient
mises en œuvre. Cela inclut :

- **Chiffrement** des données utilisateur (en particulier les données sensibles comme les
  informations de paiement).
- **Gestion des sessions sécurisée** (authentification, autorisation).
- **Protection contre les failles** telles que les attaques par injection SQL, les attaques XSS et CSRF.
- **Mise en place de certificats SSL** pour sécuriser les communications.
- **Tests de sécurité réguliers** avant et après livraison.

**Choix techniques :**
Nous laissons une grande liberté en ce qui concerne les **choix techniques** , à l'exception des contraintes
techniques suivantes :

- 1 frameworks FrontEnd
- 1 frameworks BackEnd
- 1 Base de données nosql pour le stockage des images
- 1 base de données relationnelle pour le reste

Nous attendons cependant de pouvoir valider les **piles technologiques** choisies (frameworks,
bibliothèques, langages) afin de garantir la **compatibilité avec notre infrastructure** et l'atteinte des
performances attendues. Les solutions devront privilégier la **maintenabilité** , la **scalabilité** , et la
**sécurité**.

## XVIII. Livrables - GIT, SPA, et Documentation Technique :

Pour la gestion et la livraison du projet, les éléments suivants doivent être fournis :

**1. Repository GIT pour le site web (web desktop et mobile) et le backoffice :** - Un **repository GIT** sera utilisé pour héberger le code du site web, ainsi que le **backoffice** utilisé
par les administrateurs.

- Le repository contiendra tout le **code source** lié à ces interfaces et permettra un **suivi de**
  **version** détaillé, assurant une traçabilité des modifications à chaque étape du projet.
- Chaque commit devra inclure des descriptions claires, expliquant les changements apportés
  pour faciliter les revues de code et garantir la cohérence du projet.
- Le code sera **testé** et ne devra comporter **aucune erreur** ou bugs avant livraison finale.

**2. Code propre et bien architecturé :**

- Le code livré devra être **propre** , bien organisé et conforme aux **standards de l'industrie**. Cela
  inclut :
  o **Nomenclature claire** des variables, fonctions et composants.
  o **Architecture modulaire** pour assurer une maintenabilité et une extensibilité à long
  terme.
  o Respect des principes **SOLID** et autres bonnes pratiques de conception de logiciels.
- Le code devra également être **documenté** de manière adéquate, pour permettre aux
  développeurs futurs de comprendre facilement les choix de conception.

**3. Documentation technique complète :**
Une **documentation technique détaillée** doit être fournie pour accompagner les repositories GIT, et
elle devra inclure les éléments suivants :

1. **Guide d'installation** :
   o Dépendances nécessaires.
   o Instructions pour configurer l'environnement de développement, le déploiement et la
   production.
   o Étapes détaillées pour installer et déployer le site web (versions desktop et mobile)
   ainsi que l’application mobile.
2. **Documentation des API** :
   o Tous les **endpoints API** utilisés ou créés dans le cadre du projet devront être
   documentés, y compris les méthodes HTTP, les paramètres attendus, et les réponses
   possibles.
   o Un outil comme **Swagger** ou **Postman** pourra être utilisé pour faciliter cette
   documentation et permettre des tests interactifs.
3. **Structure du code** :
   o Explication de l' **architecture du code** : comment les composants sont organisés,
   comment les modules interagissent entre eux, etc.
   o Description des **principaux composants** , services, et systèmes (backend, frontend,
   services API).
   o Justification des **choix technologiques** , par exemple l’utilisation d’un framework
   particulier (React, Angular, etc.), des bibliothèques ou des outils de gestion d’état.
4. **Tests** :
   o Instructions sur les **tests unitaires** , **tests d’intégration** et **tests fonctionnels** à effectuer.
   o Explication de la mise en place des **tests automatisés** pour garantir la qualité continue
   du produit.
   o Utilisation de frameworks de test comme **Jest** , **Mocha** , ou similaires pour tester les
   différents aspects du code.
5. **Document de Conception Technique (DCT)** : Le **Document de Conception Technique (DCT)**
   comprendra :
   o **Architecture du système** : Vue d'ensemble de l’ **infrastructure technique** , décrivant les
   interactions entre le frontend, le backend, les bases de données, les services API, et les
   systèmes d'authentification.

```
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
augmentation du nombre d’utilisateurs.
```

**6. Suivi de l’évolution des livrables :**

- Les **étapes de développement** du projet devront être visibles et accessibles via les repositories
  GIT tout au long du processus.
- Chaque sprint devra être documenté et inclure des **rapports de progression** , afin que
  l’ensemble des parties prenantes puisse suivre l’évolution du projet.
- Les **mises à jour régulières** et les revues de code permettront de garantir la transparence du
  développement.
  **7. Maquettage et prototype des 2 parties front office et backoffice.**
