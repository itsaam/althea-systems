// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  getCurrencyFromCountry,
  convertFromEur,
  isCurrencySupported,
} from "@/lib/currency";

// ─── getCurrencyFromCountry ───────────────────────────────────
describe("getCurrencyFromCountry", () => {
  it("retourne EUR pour la France", () => {
    expect(getCurrencyFromCountry("France")).toBe("eur");
  });

  it("retourne EUR pour les pays de la zone euro", () => {
    expect(getCurrencyFromCountry("Germany")).toBe("eur");
    expect(getCurrencyFromCountry("Italy")).toBe("eur");
    expect(getCurrencyFromCountry("Spain")).toBe("eur");
  });

  it("retourne USD pour les États-Unis", () => {
    expect(getCurrencyFromCountry("United States")).toBe("usd");
    expect(getCurrencyFromCountry("USA")).toBe("usd");
    expect(getCurrencyFromCountry("US")).toBe("usd");
  });

  it("retourne GBP pour le Royaume-Uni", () => {
    expect(getCurrencyFromCountry("United Kingdom")).toBe("gbp");
    expect(getCurrencyFromCountry("UK")).toBe("gbp");
    expect(getCurrencyFromCountry("England")).toBe("gbp");
  });

  it("retourne CAD pour le Canada", () => {
    expect(getCurrencyFromCountry("Canada")).toBe("cad");
  });

  it("retourne JPY pour le Japon", () => {
    expect(getCurrencyFromCountry("Japan")).toBe("jpy");
  });

  it("retourne EUR par défaut pour un pays inconnu", () => {
    expect(getCurrencyFromCountry("Narnia")).toBe("eur");
    expect(getCurrencyFromCountry("")).toBe("eur");
  });

  it("gère les espaces en début/fin", () => {
    expect(getCurrencyFromCountry("  France  ")).toBe("eur");
  });
});

// ─── convertFromEur ───────────────────────────────────────────
describe("convertFromEur", () => {
  it("retourne le même montant pour EUR", () => {
    expect(convertFromEur(100, "eur")).toBe(100);
  });

  it("convertit EUR en USD", () => {
    expect(convertFromEur(100, "usd")).toBe(108); // 100 * 1.08
  });

  it("convertit EUR en GBP", () => {
    expect(convertFromEur(100, "gbp")).toBe(85); // 100 * 0.85
  });

  it("convertit EUR en JPY (grande valeur)", () => {
    expect(convertFromEur(1, "jpy")).toBe(162); // Math.round(1 * 161.5)
  });

  it("arrondit à l'entier", () => {
    expect(convertFromEur(1, "usd")).toBe(1); // Math.round(1.08) = 1
    expect(convertFromEur(10, "usd")).toBe(11); // Math.round(10.8) = 11
  });

  it("retourne le montant si devise inconnue", () => {
    expect(convertFromEur(100, "xyz")).toBe(100);
  });

  it("gère la casse (lowercase)", () => {
    expect(convertFromEur(100, "USD")).toBe(108);
    expect(convertFromEur(100, "GBP")).toBe(85);
  });
});

// ─── isCurrencySupported ──────────────────────────────────────
describe("isCurrencySupported", () => {
  it("accepte les devises supportées", () => {
    expect(isCurrencySupported("eur")).toBe(true);
    expect(isCurrencySupported("usd")).toBe(true);
    expect(isCurrencySupported("gbp")).toBe(true);
    expect(isCurrencySupported("jpy")).toBe(true);
    expect(isCurrencySupported("cad")).toBe(true);
  });

  it("refuse les devises non supportées", () => {
    expect(isCurrencySupported("xyz")).toBe(false);
    expect(isCurrencySupported("")).toBe(false);
    expect(isCurrencySupported("ars")).toBe(false);
  });

  it("est insensible à la casse", () => {
    expect(isCurrencySupported("EUR")).toBe(true);
    expect(isCurrencySupported("USD")).toBe(true);
    expect(isCurrencySupported("GBP")).toBe(true);
  });
});