"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface StockAlerts {
  outOfStock: number;
  lowStock: number;
  threshold: number;
}

export function StockAlertBadge() {
  const [alerts, setAlerts] = useState<StockAlerts>({ 
    outOfStock: 0, 
    lowStock: 0,
    threshold: 5,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stock/alerts")
      .then((res) => res.json())
      .then((data) => {
        setAlerts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur chargement alertes stock:", error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 px-3 py-1 rounded-full text-sm">
        Chargement...
      </div>
    );
  }

  const hasAlerts = alerts.outOfStock > 0 || alerts.lowStock > 0;

  if (!hasAlerts) {
    return (
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
        ✅ Stock OK
      </span>
    );
  }

  return (
    <Link href="/admin/stock/alerts" className="flex gap-2 items-center">
      {alerts.outOfStock > 0 && (
        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-red-600 transition-colors">
          🔴 {alerts.outOfStock} rupture{alerts.outOfStock > 1 ? "s" : ""}
        </span>
      )}
      {alerts.lowStock > 0 && (
        <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors">
          ⚠️ {alerts.lowStock} stock faible (&lt;{alerts.threshold})
        </span>
      )}
    </Link>
  );
}