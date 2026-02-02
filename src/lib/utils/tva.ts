/**
 * Utilitaires pour les calculs de TVA
 */

export const TVA_RATES: Record<string, number> = {
  TVA_20: 1.2,
  TVA_10: 1.1,
  TVA_5_5: 1.055,
  TVA_0: 1.0,
} as const;

export const TVA_LABELS: Record<string, string> = {
  TVA_20: "20%",
  TVA_10: "10%",
  TVA_5_5: "5,5%",
  TVA_0: "0%",
} as const;

/**
 * Calcule le prix TTC à partir du prix HT et du taux de TVA
 * @param priceHT - Prix hors taxes
 * @param tva - Code TVA (TVA_20, TVA_10, TVA_5_5, TVA_0)
 * @returns Prix TTC arrondi à 2 décimales
 */
export const calculateTTC = (priceHT: number, tva: string): number => {
  return priceHT * (TVA_RATES[tva] || 1.0);
};

/**
 * Formate le code TVA en pourcentage lisible
 * @param tva - Code TVA (TVA_20, TVA_10, TVA_5_5, TVA_0)
 * @returns Label formaté (ex: "20%")
 */
export const formatTVA = (tva: string): string => {
  return TVA_LABELS[tva] || tva;
};
