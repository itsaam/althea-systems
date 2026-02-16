import { describe, it, expect } from "vitest";
import {
  getTvaRate,
  calculateTVAAmount,
  calculateTTC,
  calculateHT,
  getPriceBreakdown,
  calculateCartTotals,
  formatEuro,
  isValidAmount,
  calculateRecoverableTVA,
  roundToTwoDecimals,
  TVA_RATES,
  TVA_LABELS,
  type CartItem,
} from "@/lib/tva-utils"; 

describe("TVA Utils - Constantes", () => {
  it("devrait avoir les bons taux de TVA", () => {
    expect(TVA_RATES.TVA_20).toBe(0.2);
    expect(TVA_RATES.TVA_10).toBe(0.1);
    expect(TVA_RATES.TVA_5_5).toBe(0.055);
    expect(TVA_RATES.TVA_0).toBe(0.0);
  });

  it("devrait avoir les bons labels", () => {
    expect(TVA_LABELS.TVA_20).toBe("20%");
    expect(TVA_LABELS.TVA_10).toBe("10%");
    expect(TVA_LABELS.TVA_5_5).toBe("5,5%");
    expect(TVA_LABELS.TVA_0).toBe("0%");
  });
});

describe("TVA Utils - Fonctions de base", () => {
  describe("roundToTwoDecimals", () => {
    it("devrait arrondir correctement", () => {
      expect(roundToTwoDecimals(10.123)).toBe(10.12);
      expect(roundToTwoDecimals(10.126)).toBe(10.13);
      expect(roundToTwoDecimals(10.125)).toBe(10.13);
    });
  });

  describe("getTvaRate", () => {
    it("devrait retourner les bons taux", () => {
      expect(getTvaRate("TVA_20")).toBe(0.2);
      expect(getTvaRate("TVA_10")).toBe(0.1);
      expect(getTvaRate("TVA_5_5")).toBe(0.055);
      expect(getTvaRate("TVA_0")).toBe(0.0);
    });
  });

  describe("calculateTVAAmount", () => {
    it("devrait calculer le montant de TVA correctement", () => {
      expect(calculateTVAAmount(100, "TVA_20")).toBe(20);
      expect(calculateTVAAmount(100, "TVA_10")).toBe(10);
      expect(calculateTVAAmount(100, "TVA_5_5")).toBe(5.5);
      expect(calculateTVAAmount(100, "TVA_0")).toBe(0);
    });

    it("devrait arrondir à 2 décimales", () => {
      expect(calculateTVAAmount(33.33, "TVA_20")).toBe(6.67);
      expect(calculateTVAAmount(9.99, "TVA_20")).toBe(2.0);
    });
  });

  describe("calculateTTC", () => {
    it("devrait calculer correctement le prix TTC", () => {
      expect(calculateTTC(100, "TVA_20")).toBe(120);
      expect(calculateTTC(100, "TVA_10")).toBe(110);
      expect(calculateTTC(100, "TVA_5_5")).toBe(105.5);
      expect(calculateTTC(100, "TVA_0")).toBe(100);
    });

    it("devrait arrondir à 2 décimales", () => {
      expect(calculateTTC(33.33, "TVA_20")).toBe(40.0);
      expect(calculateTTC(9.99, "TVA_20")).toBe(11.99);
    });
  });

  describe("calculateHT", () => {
    it("devrait calculer le prix HT depuis le TTC", () => {
      expect(calculateHT(120, "TVA_20")).toBe(100);
      expect(calculateHT(110, "TVA_10")).toBe(100);
      expect(calculateHT(105.5, "TVA_5_5")).toBe(100);
    });

    it("devrait arrondir à 2 décimales", () => {
      expect(calculateHT(40.0, "TVA_20")).toBe(33.33);
    });
  });
});

describe("TVA Utils - Détail prix", () => {
  describe("getPriceBreakdown", () => {
    it("devrait retourner le détail complet avec TVA 20%", () => {
      const breakdown = getPriceBreakdown(100, "TVA_20");
      
      expect(breakdown.priceHT).toBe(100);
      expect(breakdown.tvaRate).toBe("TVA_20");
      expect(breakdown.tvaAmount).toBe(20);
      expect(breakdown.priceTTC).toBe(120);
      expect(breakdown.tvaLabel).toBe("20%");
    });

    it("devrait retourner le détail complet avec TVA 5.5%", () => {
      const breakdown = getPriceBreakdown(100, "TVA_5_5");
      
      expect(breakdown.priceHT).toBe(100);
      expect(breakdown.tvaRate).toBe("TVA_5_5");
      expect(breakdown.tvaAmount).toBe(5.5);
      expect(breakdown.priceTTC).toBe(105.5);
      expect(breakdown.tvaLabel).toBe("5,5%");
    });

    it("devrait gérer les arrondis", () => {
      const breakdown = getPriceBreakdown(9.99, "TVA_20");
      
      expect(breakdown.priceHT).toBe(9.99);
      expect(breakdown.tvaAmount).toBe(2.0);
      expect(breakdown.priceTTC).toBe(11.99);
    });
  });
});

describe("TVA Utils - Calculs panier", () => {
  describe("calculateCartTotals", () => {
    it("devrait calculer les totaux avec un seul taux de TVA", () => {
      const cartItems: CartItem[] = [
        { priceHT: 100, tvaRate: "TVA_20", quantity: 2 },
      ];

      const totals = calculateCartTotals(cartItems);

      expect(totals.subtotalHT).toBe(200);
      expect(totals.totalTVA).toBe(40);
      expect(totals.totalTTC).toBe(240);
      expect(totals.tvaBreakdown).toHaveLength(1);
      expect(totals.tvaBreakdown[0].rate).toBe("TVA_20");
      expect(totals.tvaBreakdown[0].label).toBe("20%");
      expect(totals.tvaBreakdown[0].baseHT).toBe(200);
      expect(totals.tvaBreakdown[0].tvaAmount).toBe(40);
    });

    it("devrait calculer les totaux avec plusieurs taux de TVA", () => {
      const cartItems: CartItem[] = [
        { priceHT: 100, tvaRate: "TVA_20", quantity: 2 }, // 200 HT, 40 TVA
        { priceHT: 50, tvaRate: "TVA_10", quantity: 1 },  // 50 HT, 5 TVA
        { priceHT: 30, tvaRate: "TVA_5_5", quantity: 2 }, // 60 HT, 3.3 TVA
      ];

      const totals = calculateCartTotals(cartItems);

      expect(totals.subtotalHT).toBe(310);
      expect(totals.totalTVA).toBe(48.3);
      expect(totals.totalTTC).toBe(358.3);
      expect(totals.tvaBreakdown).toHaveLength(3);
      
      // Vérifier le tri par taux décroissant
      expect(totals.tvaBreakdown[0].rate).toBe("TVA_20");
      expect(totals.tvaBreakdown[1].rate).toBe("TVA_10");
      expect(totals.tvaBreakdown[2].rate).toBe("TVA_5_5");
    });

    it("devrait inclure les frais de port dans le calcul", () => {
      const cartItems: CartItem[] = [
        { priceHT: 100, tvaRate: "TVA_20", quantity: 1 },
      ];

      const totals = calculateCartTotals(cartItems, 10);

      expect(totals.subtotalHT).toBe(100);
      expect(totals.totalTVA).toBe(20);
      expect(totals.totalTTC).toBe(120);
      expect(totals.shippingCost).toBe(10);
      expect(totals.grandTotal).toBe(130);
    });

    it("devrait gérer un panier vide", () => {
      const totals = calculateCartTotals([]);

      expect(totals.subtotalHT).toBe(0);
      expect(totals.totalTVA).toBe(0);
      expect(totals.totalTTC).toBe(0);
      expect(totals.tvaBreakdown).toHaveLength(0);
      expect(totals.shippingCost).toBeUndefined();
      expect(totals.grandTotal).toBeUndefined();
    });

    it("devrait gérer la TVA 0%", () => {
      const cartItems: CartItem[] = [
        { priceHT: 100, tvaRate: "TVA_0", quantity: 1 },
      ];

      const totals = calculateCartTotals(cartItems);

      expect(totals.subtotalHT).toBe(100);
      expect(totals.totalTVA).toBe(0);
      expect(totals.totalTTC).toBe(100);
    });

    it("devrait regrouper les articles avec le même taux", () => {
      const cartItems: CartItem[] = [
        { priceHT: 50, tvaRate: "TVA_20", quantity: 1 },
        { priceHT: 30, tvaRate: "TVA_20", quantity: 2 },
      ];

      const totals = calculateCartTotals(cartItems);

      expect(totals.tvaBreakdown).toHaveLength(1);
      expect(totals.tvaBreakdown[0].baseHT).toBe(110); // 50 + 60
      expect(totals.tvaBreakdown[0].tvaAmount).toBe(22);
    });
  });
});

describe("TVA Utils - Fonctions utilitaires", () => {
  describe("formatEuro", () => {
    it("devrait formater avec le symbole euro par défaut", () => {
    
      expect(formatEuro(120).replace(/\s/g, ' ')).toBe("120,00 €");
      expect(formatEuro(1234.56).replace(/\s/g, ' ')).toBe("1 234,56 €");
    });

    it("devrait formater sans le symbole euro si demandé", () => {
      expect(formatEuro(120, { showCurrency: false }).replace(/\s/g, ' ')).toBe("120,00");
    });

    it("devrait gérer les décimales", () => {
      expect(formatEuro(9.99).replace(/\s/g, ' ')).toBe("9,99 €");
      expect(formatEuro(0.5).replace(/\s/g, ' ')).toBe("0,50 €");
    });
  });

  describe("isValidAmount", () => {
    it("devrait valider les montants positifs arrondis", () => {
      expect(isValidAmount(100)).toBe(true);
      expect(isValidAmount(99.99)).toBe(true);
      expect(isValidAmount(0.01)).toBe(true);
    });

    it("devrait rejeter les montants négatifs", () => {
      expect(isValidAmount(-1)).toBe(false);
      expect(isValidAmount(-0.01)).toBe(false);
    });

    it("devrait rejeter les montants avec trop de décimales", () => {
      expect(isValidAmount(99.999)).toBe(false);
      expect(isValidAmount(100.001)).toBe(false);
    });
  });

  describe("calculateRecoverableTVA", () => {
    it("devrait calculer la TVA récupérable totale", () => {
      const cartItems: CartItem[] = [
        { priceHT: 100, tvaRate: "TVA_20", quantity: 2 }, // 40 TVA
        { priceHT: 50, tvaRate: "TVA_10", quantity: 1 },  // 5 TVA
      ];

      const recoverableTVA = calculateRecoverableTVA(cartItems);
      expect(recoverableTVA).toBe(45);
    });
  });
});

describe("TVA Utils - Cas limites et erreurs", () => {
  it("devrait gérer un prix à 0", () => {
    const breakdown = getPriceBreakdown(0, "TVA_20");
    expect(breakdown.priceTTC).toBe(0);
    expect(breakdown.tvaAmount).toBe(0);
  });

  it("devrait gérer des quantités importantes", () => {
    const cartItems: CartItem[] = [
      { priceHT: 19.99, tvaRate: "TVA_20", quantity: 100 },
    ];

    const totals = calculateCartTotals(cartItems);

    expect(totals.subtotalHT).toBe(1999);
    expect(totals.totalTVA).toBe(399.8);
    expect(totals.totalTTC).toBe(2398.8);
  });

  it("devrait gérer les prix avec beaucoup de décimales", () => {
    const breakdown = getPriceBreakdown(123.456789, "TVA_20");
    
    expect(breakdown.priceHT).toBe(123.46);
    expect(breakdown.tvaAmount).toBe(24.69);
    expect(breakdown.priceTTC).toBe(148.15);
  });

  it("devrait gérer les frais de port à 0", () => {
    const cartItems: CartItem[] = [
      { priceHT: 100, tvaRate: "TVA_20", quantity: 1 },
    ];

    const totals = calculateCartTotals(cartItems, 0);

    expect(totals.shippingCost).toBeUndefined();
    expect(totals.grandTotal).toBeUndefined();
  });
});