/**
 * Utilitaires de calcul TVA pour l'application e-commerce
 * Gère les calculs HT/TTC avec les différents taux de TVA français
 */

import { TvaRate } from "@prisma/client";

/**
 * Taux de TVA en France
 */
export const TVA_RATES: Record<TvaRate, number> = {
  TVA_20: 0.2,    // Taux normal
  TVA_10: 0.1,    // Taux intermédiaire
  TVA_5_5: 0.055, // Taux réduit
  TVA_0: 0.0,     // Exonération
};

/**
 * Labels lisibles pour l'affichage
 */
export const TVA_LABELS: Record<TvaRate, string> = {
  TVA_20: "20%",
  TVA_10: "10%",
  TVA_5_5: "5,5%",
  TVA_0: "0%",
};

/**
 * Arrondit un montant à 2 décimales (standard financier)
 */
export function roundToTwoDecimals(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Convertit TvaRate en coefficient décimal
 * @param tvaRate - Enum TvaRate (TVA_20, TVA_10, etc.)
 * @returns Coefficient de TVA (0.2, 0.1, etc.)
 */
export function getTvaRate(tvaRate: TvaRate): number {
  return TVA_RATES[tvaRate];
}

/**
 * Calcule le montant de TVA à partir d'un prix HT
 * @param priceHT - Prix hors taxes
 * @param tvaRate - Taux de TVA applicable
 * @returns Montant de TVA arrondi à 2 décimales
 * 
 * @example
 * calculateTVAAmount(100, 'TVA_20') // 20.00
 * calculateTVAAmount(50, 'TVA_10')  // 5.00
 */
export function calculateTVAAmount(priceHT: number, tvaRate: TvaRate): number {
  const rate = getTvaRate(tvaRate);
  const tvaAmount = priceHT * rate;
  return roundToTwoDecimals(tvaAmount);
}

/**
 * Calcule le prix TTC à partir d'un prix HT
 * @param priceHT - Prix hors taxes
 * @param tvaRate - Taux de TVA applicable
 * @returns Prix TTC arrondi à 2 décimales
 * 
 * @example
 * calculateTTC(100, 'TVA_20') // 120.00
 * calculateTTC(50, 'TVA_10')  // 55.00
 */
export function calculateTTC(priceHT: number, tvaRate: TvaRate): number {
  const rate = getTvaRate(tvaRate);
  const priceTTC = priceHT * (1 + rate);
  return roundToTwoDecimals(priceTTC);
}

/**
 * Calcule le prix HT à partir d'un prix TTC
 * @param priceTTC - Prix toutes taxes comprises
 * @param tvaRate - Taux de TVA applicable
 * @returns Prix HT arrondi à 2 décimales
 * 
 * @example
 * calculateHT(120, 'TVA_20') // 100.00
 * calculateHT(55, 'TVA_10')  // 50.00
 */
export function calculateHT(priceTTC: number, tvaRate: TvaRate): number {
  const rate = getTvaRate(tvaRate);
  const priceHT = priceTTC / (1 + rate);
  return roundToTwoDecimals(priceHT);
}

/**
 * Interface pour le détail de prix d'un produit
 */
export interface PriceBreakdown {
  priceHT: number;
  tvaRate: TvaRate;
  tvaAmount: number;
  priceTTC: number;
  tvaLabel: string;
}

/**
 * Calcule le détail complet d'un prix (HT, TVA, TTC)
 * @param priceHT - Prix hors taxes
 * @param tvaRate - Taux de TVA applicable
 * @returns Objet avec tous les détails de prix
 * 
 * @example
 * getPriceBreakdown(100, 'TVA_20')
 * // { priceHT: 100, tvaRate: 'TVA_20', tvaAmount: 20, priceTTC: 120, tvaLabel: '20%' }
 */
export function getPriceBreakdown(priceHT: number, tvaRate: TvaRate): PriceBreakdown {
  return {
    priceHT: roundToTwoDecimals(priceHT),
    tvaRate,
    tvaAmount: calculateTVAAmount(priceHT, tvaRate),
    priceTTC: calculateTTC(priceHT, tvaRate),
    tvaLabel: TVA_LABELS[tvaRate],
  };
}

/**
 * Interface pour un article de panier/commande
 */
export interface CartItem {
  priceHT: number;
  tvaRate: TvaRate;
  quantity: number;
}

/**
 * Interface pour le regroupement TVA par taux
 */
export interface TvaBreakdownByRate {
  rate: TvaRate;
  label: string;
  baseHT: number;
  tvaAmount: number;
}

/**
 * Interface pour le total d'un panier/commande
 */
export interface CartTotals {
  subtotalHT: number;
  tvaBreakdown: TvaBreakdownByRate[];
  totalTVA: number;
  totalTTC: number;
  shippingCost?: number;
  grandTotal?: number;
}

/**
 * Calcule les totaux d'un panier avec détail TVA par taux
 * @param items - Liste des articles du panier
 * @param shippingCost - Frais de port (optionnel, en TTC)
 * @returns Détail complet des totaux
 * 
 * @example
 * calculateCartTotals([
 *   { priceHT: 100, tvaRate: 'TVA_20', quantity: 2 },
 *   { priceHT: 50, tvaRate: 'TVA_10', quantity: 1 }
 * ], 5.99)
 */
export function calculateCartTotals(
  items: CartItem[],
  shippingCost: number = 0
): CartTotals {
  // Regrouper les montants HT par taux de TVA
  const tvaGroups = new Map<TvaRate, number>();

  let subtotalHT = 0;

  items.forEach((item) => {
    const itemTotalHT = item.priceHT * item.quantity;
    subtotalHT += itemTotalHT;

    const currentAmount = tvaGroups.get(item.tvaRate) || 0;
    tvaGroups.set(item.tvaRate, currentAmount + itemTotalHT);
  });

  // Calculer la TVA pour chaque taux
  const tvaBreakdown: TvaBreakdownByRate[] = [];
  let totalTVA = 0;

  tvaGroups.forEach((baseHT, rate) => {
    const tvaAmount = calculateTVAAmount(baseHT, rate);
    totalTVA += tvaAmount;

    tvaBreakdown.push({
      rate,
      label: TVA_LABELS[rate],
      baseHT: roundToTwoDecimals(baseHT),
      tvaAmount,
    });
  });

  // Trier par taux décroissant pour l'affichage
  tvaBreakdown.sort((a, b) => getTvaRate(b.rate) - getTvaRate(a.rate));

  const totalTTC = subtotalHT + totalTVA;
  const grandTotal = totalTTC + shippingCost;

  return {
    subtotalHT: roundToTwoDecimals(subtotalHT),
    tvaBreakdown,
    totalTVA: roundToTwoDecimals(totalTVA),
    totalTTC: roundToTwoDecimals(totalTTC),
    shippingCost: shippingCost > 0 ? roundToTwoDecimals(shippingCost) : undefined,
    grandTotal: shippingCost > 0 ? roundToTwoDecimals(grandTotal) : undefined,
  };
}

/**
 * Formate un montant en euros
 * @param amount - Montant à formater
 * @param options - Options de formatage
 * @returns Montant formaté (ex: "120,00 €")
 */
export function formatEuro(
  amount: number,
  options: { showCurrency?: boolean; locale?: string } = {}
): string {
  const { showCurrency = true, locale = "fr-FR" } = options;

  const formatted = amount.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return showCurrency ? `${formatted} €` : formatted;
}

/**
 * Valide qu'un montant est positif et arrondi à 2 décimales
 * @param amount - Montant à valider
 * @returns true si le montant est valide
 */
export function isValidAmount(amount: number): boolean {
  if (amount < 0) return false;
  const rounded = roundToTwoDecimals(amount);
  return Math.abs(amount - rounded) < 0.001; // Tolérance pour les erreurs de floating point
}

/**
 * Calcule la TVA récupérable pour une facture (usage B2B)
 * @param items - Articles de la facture
 * @returns Montant total de TVA récupérable
 */
export function calculateRecoverableTVA(items: CartItem[]): number {
  const totals = calculateCartTotals(items);
  return totals.totalTVA;
}