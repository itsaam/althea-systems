/**
 * Script de test pour le système de logging Winston
 * Exécuter avec: npx tsx src/lib/logger/test-logger.ts
 */

import logger from "./index";
import {
  authLogger,
  apiLogger,
  dbLogger,
  stripeLogger,
  emailLogger,
  cacheLogger,
  orderLogger,
  productLogger,
  cartLogger,
} from "./sections";
import { LogMessages } from "./messages";

console.log("\n🧪 Test du système de logging Winston\n");
console.log("=".repeat(60));

// Test 1: Logger principal
console.log("\n📝 Test 1: Logger principal\n");
logger.info("Test du logger principal");
logger.debug("Message de debug");
logger.warn("Message d'avertissement");
logger.error("Message d'erreur");

// Test 2: Loggers par section
console.log("\n📝 Test 2: Loggers par section\n");

// AUTH
authLogger.info(LogMessages.auth.connexionReussie("test@example.com"));
authLogger.warn(LogMessages.auth.connexionEchouee("hacker@bad.com"));
authLogger.info(LogMessages.auth.inscriptionReussie("nouveau@client.com"));

// API
apiLogger.http(LogMessages.api.requeteRecue("GET", "/api/products"));
apiLogger.info(LogMessages.api.reponseEnvoyee(200, 45));
apiLogger.error(LogMessages.api.erreurServeur("Timeout base de données"));

// DB
dbLogger.info(LogMessages.db.connexionEtablie);
dbLogger.info(LogMessages.db.requeteExecutee("products", "SELECT"));
dbLogger.error(LogMessages.db.erreurRequete("Connection refused"));

// STRIPE
stripeLogger.info(LogMessages.stripe.paiementInitie(149.99));
stripeLogger.info(LogMessages.stripe.paiementReussi("pi_1234567890"));
stripeLogger.info(LogMessages.stripe.webhookRecu("checkout.session.completed"));

// EMAIL
emailLogger.info(
  LogMessages.email.envoiReussi("client@mail.com", "Confirmation de commande")
);
emailLogger.error(
  LogMessages.email.envoiEchoue("bad@mail.com", "SMTP timeout")
);

// CACHE
cacheLogger.debug(LogMessages.cache.hit("product:123"));
cacheLogger.debug(LogMessages.cache.miss("product:456"));
cacheLogger.debug(LogMessages.cache.set("product:456", 3600));

// ORDER
orderLogger.info(LogMessages.order.commandeCreee("ORD-2024-001", 299.99));
orderLogger.info(LogMessages.order.statutModifie("ORD-2024-001", "EXPÉDIÉE"));
orderLogger.info(LogMessages.order.factureGeneree("ORD-2024-001"));

// PRODUCT
productLogger.info(LogMessages.product.produitCree("PROD-001", "Robe Althea"));
productLogger.info(LogMessages.product.stockMisAJour("PROD-001", 50));
productLogger.warn(LogMessages.product.stockFaible("PROD-002", 3));

// CART
cartLogger.info(LogMessages.cart.produitAjoute("PROD-001", 2));
cartLogger.info(LogMessages.cart.quantiteModifiee("PROD-001", 3));
cartLogger.info(LogMessages.cart.panierVide("user-123"));

// Test 3: Logs avec métadonnées
console.log("\n📝 Test 3: Logs avec métadonnées additionnelles\n");

apiLogger.info(LogMessages.api.requeteRecue("POST", "/api/orders"), {
  userId: "user-123",
  ip: "192.168.1.1",
  userAgent: "Mozilla/5.0",
});

orderLogger.info(LogMessages.order.commandeCreee("ORD-2024-002", 599.99), {
  items: 3,
  userId: "user-456",
  paymentMethod: "card",
});

stripeLogger.error(LogMessages.stripe.paiementEchoue("Carte refusée"), {
  customerId: "cus_123",
  amount: 199.99,
  errorCode: "card_declined",
});

console.log("\n" + "=".repeat(60));
console.log("\n✅ Tests terminés!");
console.log("\n📁 Vérifiez les fichiers de logs dans le dossier ./logs/");
console.log("   - combined.log : tous les logs");
console.log("   - error.log    : uniquement les erreurs\n");
