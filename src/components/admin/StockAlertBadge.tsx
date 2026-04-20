"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signalDegradedMode } from "@/lib/admin/mock-data";

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
    let cancelled = false;
    fetch("/api/admin/stock/alerts")
      .then((res) => {
        if (!res.ok) throw new Error("stock-unavailable");
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setAlerts(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Silent fallback — DB unavailable in dev backdoor mode
          setLoading(false);
          signalDegradedMode();
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        Chargement
      </span>
    );
  }

  const hasAlerts = alerts.outOfStock > 0 || alerts.lowStock > 0;

  if (!hasAlerts) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55">
        Stock OK
      </span>
    );
  }

  return (
    <Link
      href="/admin/products"
      className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/70 transition-colors hover:text-primary"
    >
      {alerts.outOfStock > 0 && (
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-destructive"
          />
          <span className="tabular-nums">{alerts.outOfStock}</span>
          {" "}rupture{alerts.outOfStock > 1 ? "s" : ""}
        </span>
      )}
      {alerts.lowStock > 0 && (
        <span className="flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block h-1.5 w-1.5 rounded-full bg-warning"
          />
          <span className="tabular-nums">{alerts.lowStock}</span>
          {" "}stock faible
        </span>
      )}
    </Link>
  );
}
