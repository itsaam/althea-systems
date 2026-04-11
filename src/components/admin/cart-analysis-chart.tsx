"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";
import { MOCK_CART_ANALYSIS, signalDegradedMode } from "@/lib/admin/mock-data";

interface CartAnalysisDataPoint {
  period: string;
  categories: Record<string, number>;
}

type Period = "7days" | "5weeks";

// Palette sobre : foreground + nuances de gris + un accent indigo sur la première catégorie
const BAR_CLASSES = [
  "text-electric-indigo-500",
  "text-foreground",
  "text-foreground/55",
  "text-foreground/35",
  "text-foreground/20",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip(props: any) {
  const { active, payload, label } = props;
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-border/80 bg-background px-3 py-2 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
        {label}
      </p>
      <ul className="mt-2 space-y-1">
        {payload.map(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (entry: any, i: number) => (
            <li
              key={i}
              className="flex items-baseline justify-between gap-3 text-[11px]"
            >
              <span className="font-mono uppercase tracking-[0.16em] text-foreground/55">
                {entry.name}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {Number(entry.value).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                  maximumFractionDigits: 0,
                })}
              </span>
            </li>
          )
        )}
      </ul>
    </div>
  );
}

export default function CartAnalysisChart() {
  const [rawData, setRawData] = useState<CartAnalysisDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("7days");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/dashboard/cart-analysis?period=${period}`
        );
        if (!res.ok) throw new Error("cart-unavailable");
        const json = (await res.json()) as CartAnalysisDataPoint[];
        if (!cancelled) setRawData(json);
      } catch {
        if (!cancelled) {
          setRawData(MOCK_CART_ANALYSIS);
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

  const allCategories = Array.from(
    new Set(rawData.flatMap((item) => Object.keys(item.categories)))
  );

  const chartData = rawData.map((item) => ({
    period: item.period,
    ...item.categories,
  }));

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            <span className="mr-1.5 tabular-nums text-foreground/35">07</span>
            Panier moyen par catégorie
          </p>
          <p className="mt-2 font-display text-[18px] font-medium leading-none tracking-tight text-foreground">
            Distribution quotidienne
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

      <div className="h-[320px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Chargement
            </p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Aucune donnée
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="currentColor"
                className="text-foreground/10"
                vertical={false}
              />
              <XAxis
                dataKey="period"
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fill: "currentColor",
                }}
                className="text-foreground/45"
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  fill: "currentColor",
                }}
                className="text-foreground/45"
                tickFormatter={(v) =>
                  `${v >= 1000 ? (v / 1000).toFixed(0) + "k" : v}`
                }
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{
                  fill: "currentColor",
                  className: "text-foreground/[0.04]",
                }}
              />
              {allCategories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill="currentColor"
                  className={BAR_CLASSES[index % BAR_CLASSES.length]}
                  radius={[2, 2, 0, 0]}
                  maxBarSize={24}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend mono */}
      {!loading && allCategories.length > 0 && (
        <ul className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
          {allCategories.map((cat, idx) => (
            <li
              key={cat}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/55"
            >
              <span
                className={cn(
                  "h-2 w-2",
                  BAR_CLASSES[idx % BAR_CLASSES.length].replace(
                    "text-",
                    "bg-"
                  )
                )}
              />
              {cat}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
