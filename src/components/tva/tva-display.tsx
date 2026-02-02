/**
 * Composant d'affichage de prix avec détail HT/TVA/TTC
 * Utilisable sur les pages produits, panier, et factures
 */

import React, { useState } from "react";
import { TvaRate } from "@prisma/client";
import {
  getPriceBreakdown,
  formatEuro,
  TVA_LABELS,
  type TvaBreakdownByRate,
} from "@/lib/tva-utils";

interface PriceDisplayProps {
  priceHT: number;
  tvaRate: TvaRate;
  quantity?: number;
  showDetails?: boolean;
  className?: string;
}

/**
 * Affichage de prix produit avec tooltip détail TVA
 */
export function PriceDisplay({
  priceHT,
  tvaRate,
  quantity = 1,
  showDetails = false,
  className = "",
}: PriceDisplayProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const breakdown = getPriceBreakdown(priceHT, tvaRate);
  const totalHT = priceHT * quantity;
  const totalBreakdown = getPriceBreakdown(totalHT, tvaRate);

  return (
    <div className={`price-display ${className}`}>
      {/* Prix principal (TTC) */}
      <div
        className="price-main"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="price-value">{formatEuro(totalBreakdown.priceTTC)}</span>
        {quantity > 1 && (
          <span className="price-unit">
            ({formatEuro(breakdown.priceTTC)} / unité)
          </span>
        )}
      </div>

      {/* Tooltip détail HT + TVA */}
      {showTooltip && (
        <div className="price-tooltip">
          <div className="tooltip-row">
            <span>Prix HT</span>
            <span>{formatEuro(totalBreakdown.priceHT)}</span>
          </div>
          <div className="tooltip-row">
            <span>TVA ({breakdown.tvaLabel})</span>
            <span>{formatEuro(totalBreakdown.tvaAmount)}</span>
          </div>
          <div className="tooltip-row total">
            <span>Prix TTC</span>
            <span>{formatEuro(totalBreakdown.priceTTC)}</span>
          </div>
        </div>
      )}

      {/* Détail visible permanent (optionnel) */}
      {showDetails && (
        <div className="price-details">
          <div className="text-sm text-gray-600">
            {formatEuro(totalBreakdown.priceHT)} HT + {formatEuro(totalBreakdown.tvaAmount)}{" "}
            TVA ({breakdown.tvaLabel})
          </div>
        </div>
      )}
    </div>
  );
}

interface CartTotalsDisplayProps {
  items: Array<{
    name: string;
    priceHT: number;
    tvaRate: TvaRate;
    quantity: number;
  }>;
  shippingCost?: number;
}

/**
 * Affichage des totaux panier avec détail TVA par taux
 */
export function CartTotalsDisplay({ items, shippingCost = 0 }: CartTotalsDisplayProps) {
  // Import dynamique pour éviter la dépendance circulaire
  const { calculateCartTotals } = require("@/lib/tva-utils");
  
  const totals = calculateCartTotals(items, shippingCost);

  return (
    <div className="cart-totals">
      <h3>Récapitulatif</h3>

      {/* Sous-total HT */}
      <div className="totals-row">
        <span>Sous-total HT</span>
        <span>{formatEuro(totals.subtotalHT)}</span>
      </div>

      {/* Détail TVA par taux */}
      {totals.tvaBreakdown.map((tva: TvaBreakdownByRate) => (
        <div key={tva.rate} className="totals-row tva-detail">
          <span>
            TVA {tva.label}
            <span className="text-gray-500 text-sm ml-2">
              (sur {formatEuro(tva.baseHT)} HT)
            </span>
          </span>
          <span>{formatEuro(tva.tvaAmount)}</span>
        </div>
      ))}

      {/* Total TTC */}
      <div className="totals-row subtotal">
        <span>Total TTC</span>
        <span className="font-semibold">{formatEuro(totals.totalTTC)}</span>
      </div>

      {/* Frais de port */}
      {shippingCost > 0 && (
        <div className="totals-row">
          <span>Frais de port</span>
          <span>{formatEuro(shippingCost)}</span>
        </div>
      )}

      {/* Total final */}
      {totals.grandTotal && (
        <div className="totals-row grand-total">
          <span className="font-bold">Total à payer</span>
          <span className="font-bold text-lg">{formatEuro(totals.grandTotal)}</span>
        </div>
      )}
    </div>
  );
}

interface InvoiceTvaTableProps {
  items: Array<{
    name: string;
    priceHT: number;
    tvaRate: TvaRate;
    quantity: number;
  }>;
}

/**
 * Tableau détail TVA pour factures (lignes séparées par taux)
 */
export function InvoiceTvaTable({ items }: InvoiceTvaTableProps) {
  const { calculateCartTotals } = require("@/lib/tva-utils");
  const totals = calculateCartTotals(items);

  return (
    <div className="invoice-tva-table">
      <h4>Détail de la TVA</h4>
      <table>
        <thead>
          <tr>
            <th>Taux TVA</th>
            <th>Base HT</th>
            <th>Montant TVA</th>
            <th>Total TTC</th>
          </tr>
        </thead>
        <tbody>
          {totals.tvaBreakdown.map((tva: TvaBreakdownByRate) => {
            const ttc = tva.baseHT + tva.tvaAmount;
            return (
              <tr key={tva.rate}>
                <td>{tva.label}</td>
                <td>{formatEuro(tva.baseHT)}</td>
                <td>{formatEuro(tva.tvaAmount)}</td>
                <td>{formatEuro(ttc)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="font-bold">
            <td>Total</td>
            <td>{formatEuro(totals.subtotalHT)}</td>
            <td>{formatEuro(totals.totalTVA)}</td>
            <td>{formatEuro(totals.totalTTC)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/**
 * Badge TVA pour affichage rapide du taux
 */
export function TvaBadge({ tvaRate }: { tvaRate: TvaRate }) {
  const label = TVA_LABELS[tvaRate];
  
  const colorClass = {
    TVA_20: "bg-blue-100 text-blue-800",
    TVA_10: "bg-green-100 text-green-800",
    TVA_5_5: "bg-yellow-100 text-yellow-800",
    TVA_0: "bg-gray-100 text-gray-800",
  }[tvaRate];

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${colorClass}`}>
      TVA {label}
    </span>
  );
}

// Export des composants
export default {
  PriceDisplay,
  CartTotalsDisplay,
  InvoiceTvaTable,
  TvaBadge,
};