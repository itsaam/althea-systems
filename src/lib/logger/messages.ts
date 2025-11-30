// Messages de log en français - Centralisés pour éviter la duplication
export const LogMessages = {
  // AUTH
  auth: {
    connexionReussie: (email: string) => `Connexion réussie pour ${email}`,
    connexionEchouee: (email: string) => `Échec de connexion pour ${email}`,
    deconnexion: (userId: string) => `Déconnexion de l'utilisateur ${userId}`,
    inscriptionReussie: (email: string) => `Inscription réussie pour ${email}`,
    inscriptionEchouee: (raison: string) => `Échec d'inscription: ${raison}`,
    emailVerifie: (email: string) => `Email vérifié pour ${email}`,
    motDePasseReinitialise: (email: string) =>
      `Mot de passe réinitialisé pour ${email}`,
    tokenInvalide: "Token invalide ou expiré",
    nonAutorise: "Accès non autorisé",
  },

  // API
  api: {
    requeteRecue: (method: string, path: string) => `${method} ${path}`,
    reponseEnvoyee: (status: number, duration: number) =>
      `Réponse ${status} en ${duration}ms`,
    erreurServeur: (message: string) => `Erreur serveur: ${message}`,
    erreurValidation: (champs: string) => `Erreur de validation: ${champs}`,
    rateLimitAtteint: (ip: string) => `Limite de requêtes atteinte pour ${ip}`,
  },

  // DB
  db: {
    connexionEtablie: "Connexion à la base de données établie",
    connexionEchouee: (erreur: string) =>
      `Échec de connexion à la base de données: ${erreur}`,
    requeteExecutee: (table: string, operation: string) =>
      `${operation} sur ${table}`,
    erreurRequete: (erreur: string) => `Erreur de requête: ${erreur}`,
    migrationAppliquee: (nom: string) => `Migration appliquée: ${nom}`,
  },

  // STRIPE
  stripe: {
    paiementInitie: (montant: number) => `Paiement initié: ${montant}€`,
    paiementReussi: (id: string) => `Paiement réussi: ${id}`,
    paiementEchoue: (raison: string) => `Paiement échoué: ${raison}`,
    webhookRecu: (type: string) => `Webhook reçu: ${type}`,
    webhookTraite: (type: string) => `Webhook traité: ${type}`,
    remboursementEffectue: (id: string, montant: number) =>
      `Remboursement de ${montant}€ effectué: ${id}`,
  },

  // EMAIL
  email: {
    envoiReussi: (destinataire: string, sujet: string) =>
      `Email envoyé à ${destinataire}: ${sujet}`,
    envoiEchoue: (destinataire: string, erreur: string) =>
      `Échec d'envoi à ${destinataire}: ${erreur}`,
    templateCharge: (nom: string) => `Template email chargé: ${nom}`,
  },

  // CACHE
  cache: {
    hit: (cle: string) => `Cache HIT: ${cle}`,
    miss: (cle: string) => `Cache MISS: ${cle}`,
    set: (cle: string, ttl: number) => `Cache SET: ${cle} (TTL: ${ttl}s)`,
    delete: (cle: string) => `Cache DELETE: ${cle}`,
    clear: (pattern: string) => `Cache CLEAR: ${pattern}`,
  },

  // UPLOAD
  upload: {
    debutUpload: (fichier: string, taille: number) =>
      `Début upload: ${fichier} (${taille} bytes)`,
    uploadReussi: (fichier: string) => `Upload réussi: ${fichier}`,
    uploadEchoue: (fichier: string, erreur: string) =>
      `Upload échoué pour ${fichier}: ${erreur}`,
    fichierSupprime: (fichier: string) => `Fichier supprimé: ${fichier}`,
  },

  // CART
  cart: {
    produitAjoute: (productId: string, qty: number) =>
      `Produit ${productId} ajouté (x${qty})`,
    produitRetire: (productId: string) =>
      `Produit ${productId} retiré du panier`,
    quantiteModifiee: (productId: string, qty: number) =>
      `Quantité modifiée pour ${productId}: ${qty}`,
    panierVide: (userId: string) => `Panier vidé pour l'utilisateur ${userId}`,
  },

  // ORDER
  order: {
    commandeCreee: (id: string, total: number) =>
      `Commande ${id} créée: ${total}€`,
    statutModifie: (id: string, statut: string) =>
      `Commande ${id}: statut changé en ${statut}`,
    commandeAnnulee: (id: string, raison: string) =>
      `Commande ${id} annulée: ${raison}`,
    factureGeneree: (orderId: string) =>
      `Facture générée pour la commande ${orderId}`,
  },

  // PRODUCT
  product: {
    produitCree: (id: string, nom: string) => `Produit créé: ${nom} (${id})`,
    produitModifie: (id: string) => `Produit ${id} modifié`,
    produitSupprime: (id: string) => `Produit ${id} supprimé`,
    stockMisAJour: (id: string, stock: number) =>
      `Stock mis à jour pour ${id}: ${stock}`,
    stockFaible: (id: string, stock: number) =>
      `⚠️ Stock faible pour ${id}: ${stock} restants`,
  },

  // USER
  user: {
    profilModifie: (userId: string) => `Profil modifié: ${userId}`,
    adresseAjoutee: (userId: string) => `Adresse ajoutée pour ${userId}`,
    adresseSupprimee: (userId: string) => `Adresse supprimée pour ${userId}`,
    compteDesactive: (userId: string) => `Compte désactivé: ${userId}`,
  },

  // ADMIN
  admin: {
    actionEffectuee: (admin: string, action: string) =>
      `[ADMIN ${admin}] ${action}`,
    exportGenere: (type: string) => `Export ${type} généré`,
    importEffectue: (type: string, count: number) =>
      `Import ${type}: ${count} éléments`,
  },
} as const;
