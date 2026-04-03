// @vitest-environment node
import { describe, it, expect } from "vitest";
import { TVA_RATES, TVA_LABELS, calculateTTC, formatTVA } from "@/lib/utils/tva";

// ─── TVA_RATES ────────────────────────────────────────────────
describe("TVA_RATES", () => {
  it("contient les bons coefficients multiplicateurs", () => {
    expect(TVA_RATES.TVA_20).toBe(1.2);
    expect(TVA_RATES.TVA_10).toBe(1.1);
    expect(TVA_RATES.TVA_5_5).toBe(1.055);
    expect(TVA_RATES.TVA_0).toBe(1.0);
  });
});

// ─── TVA_LABELS ───────────────────────────────────────────────
describe("TVA_LABELS", () => {
  it("contient les bons labels", () => {
    expect(TVA_LABELS.TVA_20).toBe("20%");
    expect(TVA_LABELS.TVA_10).toBe("10%");
    expect(TVA_LABELS.TVA_5_5).toBe("5,5%");
    expect(TVA_LABELS.TVA_0).toBe("0%");
  });
});

// ─── calculateTTC ─────────────────────────────────────────────
describe("calculateTTC", () => {
  it("calcule TTC avec TVA_20", () => {
    expect(calculateTTC(100, "TVA_20")).toBe(120);
  });

  it("calcule TTC avec TVA_10", () => {
    expect(calculateTTC(100, "TVA_10")).toBeCloseTo(110, 2);
  });

  it("calcule TTC avec TVA_5_5", () => {
    expect(calculateTTC(100, "TVA_5_5")).toBe(105.5);
  });

  it("retourne le même prix pour TVA_0", () => {
    expect(calculateTTC(100, "TVA_0")).toBe(100);
  });

  it("retourne le prix HT si taux inconnu", () => {
    expect(calculateTTC(100, "TVA_INCONNU")).toBe(100);
  });

  it("gère un prix à 0", () => {
    expect(calculateTTC(0, "TVA_20")).toBe(0);
  });

  it("gère des prix décimaux", () => {
    expect(calculateTTC(50.5, "TVA_20")).toBeCloseTo(60.6, 2);
  });
});

// ─── formatTVA ────────────────────────────────────────────────
describe("formatTVA", () => {
  it("formate TVA_20 en 20%", () => {
    expect(formatTVA("TVA_20")).toBe("20%");
  });

  it("formate TVA_10 en 10%", () => {
    expect(formatTVA("TVA_10")).toBe("10%");
  });

  it("formate TVA_5_5 en 5,5%", () => {
    expect(formatTVA("TVA_5_5")).toBe("5,5%");
  });

  it("formate TVA_0 en 0%", () => {
    expect(formatTVA("TVA_0")).toBe("0%");
  });

  it("retourne le code original si inconnu", () => {
    expect(formatTVA("TVA_INCONNU")).toBe("TVA_INCONNU");
  });
});