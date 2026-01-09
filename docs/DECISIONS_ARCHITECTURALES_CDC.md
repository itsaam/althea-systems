# Décisions Architecturales - Conformité CDC

## Date: 2026-01-10

---

## ✅ Décision: Gestion des méthodes de paiement via Stripe uniquement (sans table DB)

### Contexte

Le CDC Section XIII point 4 demande:

> **4. Méthodes de paiement** :
> - L'utilisateur peut également **gérer ses méthodes de paiement**.
> - Les fonctionnalités incluent :
>   - **Ajouter** une nouvelle carte
>   - **Supprimer** une méthode de paiement
>   - **Définir** une méthode de paiement par défaut

### Question posée

Doit-on créer une table `PaymentMethod` en base de données pour stocker les cartes, ou peut-on utiliser Stripe API uniquement?

### Décision prise

**✅ Utiliser Stripe API uniquement, SANS table `PaymentMethod` en base de données**

### Justification

#### 1. Le CDC demande des fonctionnalités, pas une implémentation

Le CDC spécifie ce que l'utilisateur doit **pouvoir faire**, pas **où** stocker les données.

| Exigence CDC | Implémentation Stripe | Conforme? |
|--------------|----------------------|-----------|
| Ajouter une carte | `stripe.paymentMethods.attach()` | ✅ OUI |
| Supprimer une carte | `stripe.paymentMethods.detach()` | ✅ OUI |
| Définir par défaut | `stripe.customers.update({default_payment_method})` | ✅ OUI |
| Voir les cartes | `stripe.customers.listPaymentMethods()` | ✅ OUI |

**Toutes les fonctionnalités CDC sont couvertes par Stripe API.**

#### 2. Conformité sécurité PCI-DSS (CDC Section XIII)

Le CDC demande explicitement:

> "Les **informations de paiement** seront cryptées et protégées via une solution sécurisée **conforme aux normes PCI-DSS**, garantissant que les données bancaires de l'utilisateur sont stockées et traitées de manière sécurisée."

**Stripe = PCI-DSS Level 1 Certified** (plus haut niveau de certification)

En stockant sur Stripe uniquement:
- ✅ Conformité PCI-DSS automatique
- ✅ Pas de risque de fuite de données bancaires
- ✅ Pas de responsabilité de sécurisation des cartes

En dupliquant en DB:
- ❌ Complexité supplémentaire
- ❌ Risque de désynchronisation Stripe ↔ DB
- ❌ Besoin de sync via webhooks
- ⚠️ Même avec metadata seulement (last4, brand), c'est de la duplication inutile

#### 3. Avantages techniques

**Avec Stripe uniquement:**
- ✅ Stripe = source unique de vérité
- ✅ Pas de sync à gérer
- ✅ Pas de webhooks complexes
- ✅ Architecture plus simple
- ✅ Moins de bugs potentiels

**Avec table DB:**
- ❌ Duplication de données
- ❌ Sync Stripe → DB via webhooks requis
- ❌ Gestion d'erreurs si webhook rate
- ❌ Plus de code à maintenir

### Implémentation

#### Schema Prisma - Model User

```prisma
model User {
  id               String   @id @default(cuid())
  email            String   @unique
  stripeCustomerId String?  @unique // ← Seul champ nécessaire pour Stripe
  // ... autres champs
}
```

**Pas de table `PaymentMethod`**, le `stripeCustomerId` suffit.

#### Exemple d'utilisation

```typescript
// 1. Ajouter une carte
const paymentMethod = await stripe.paymentMethods.attach('pm_xxx', {
  customer: user.stripeCustomerId
});

// 2. Lister les cartes
const methods = await stripe.customers.listPaymentMethods(
  user.stripeCustomerId,
  { type: 'card' }
);

// 3. Définir par défaut
await stripe.customers.update(user.stripeCustomerId, {
  invoice_settings: { default_payment_method: 'pm_xxx' }
});

// 4. Supprimer
await stripe.paymentMethods.detach('pm_xxx');
```

### Conclusion

✅ **Cette approche répond à 100% aux exigences du CDC**
- Toutes les fonctionnalités demandées sont implémentées
- Conformité PCI-DSS garantie par Stripe
- Architecture plus simple et sécurisée

**Référence CDC**: Section XIII point 4 (Méthodes de paiement)

---

## Autres décisions à documenter

_À compléter au fur et à mesure du développement..._
