"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_CATEGORIES, signalDegradedMode } from "@/lib/admin/mock-data";

interface CategorySalesDataPoint {
  name: string;
  value: number;
  percentage: number;
}

type Period = "7days" | "5weeks";

export default function CategoryPieChart() {
  const [data, setData] = useState<CategorySalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("7days");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/dashboard/category-sales?period=${period}`
        );
        if (!res.ok) throw new Error("categories-unavailable");
        const json = (await res.json()) as CategorySalesDataPoint[];
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData(MOCK_CATEGORIES);
          signalDegradedMode();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [period]);

  const sorted = [...data].sort((a, b) => b.value - a.value);
  const total = sorted.reduce((sum, d) => sum + d.value, 0);

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            <span className="mr-1.5 tabular-nums text-foreground/35">06</span>
            Répartition par catégorie
          </p>
          <p className="mt-2 font-display text-[18px] font-medium leading-none tracking-tight text-foreground">
            Part du revenu
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(["7days", "5weeks"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={cn(
                "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                period === p
                  ? "text-electric-indigo-500"
                  : "text-foreground/40 hover:text-foreground/70"
              )}
            >
              {p === "7days" ? "7 jours" : "5 semaines"}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
            Chargement
          </p>
        </div>
      ) : sorted.length === 0 ? (
        <div className="flex h-[280px] items-center justify-center">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
            Aucune vente sur cette période
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((item, idx) => (
            <li key={item.name} className="group">
              <div className="flex items-baseline justify-between gap-4">
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-mono text-[10px] tabular-nums text-foreground/35">
                    {(idx + 1).toString().padStart(2, "0")}
                  </span>
                  <span className="truncate text-[13px] text-foreground">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline gap-3 shrink-0">
                  <span className="font-mono text-[11px] tabular-nums text-foreground/50">
                    {item.value.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    })}
                  </span>
                  <span className="font-mono text-[11px] tabular-nums text-foreground/70 min-w-[3rem] text-right">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <div className="mt-2 h-[2px] w-full bg-foreground/5">
                <div
                  className={cn(
                    "h-full transition-all duration-700 ease-out",
                    idx === 0 ? "bg-electric-indigo-500" : "bg-foreground/40"
                  )}
                  style={{
                    width: `${total > 0 ? (item.value / total) * 100 : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
