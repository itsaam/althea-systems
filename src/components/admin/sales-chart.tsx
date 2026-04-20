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
import {
  MOCK_SALES_5WEEKS,
  MOCK_SALES_7DAYS,
  signalDegradedMode,
} from "@/lib/admin/mock-data";

interface SalesChartDataPoint {
  date: string;
  sales: number;
  orders: number;
}

type Period = "7days" | "5weeks";

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: SalesChartDataPoint }>;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="border border-border/80 bg-background px-3 py-2 shadow-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-foreground/50">
        {d.date}
      </p>
      <p className="mt-1.5 font-display text-[18px] font-semibold leading-none tracking-tight text-foreground tabular-nums">
        {d.sales.toLocaleString("fr-FR", {
          style: "currency",
          currency: "EUR",
          maximumFractionDigits: 0,
        })}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/45">
        <span className="tabular-nums">{d.orders}</span> commandes
      </p>
    </div>
  );
}

export default function SalesChart() {
  const [data, setData] = useState<SalesChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("7days");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/dashboard/sales-chart?period=${period}`
        );
        if (!res.ok) throw new Error("sales-unavailable");
        const json = (await res.json()) as SalesChartDataPoint[];
        if (!cancelled) setData(json);
      } catch {
        if (!cancelled) {
          setData(period === "7days" ? MOCK_SALES_7DAYS : MOCK_SALES_5WEEKS);
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

  return (
    <section className="border-t border-border/60 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            <span className="mr-1.5 tabular-nums text-foreground/35">05</span>
            Évolution des ventes
          </p>
          <p className="mt-2 font-display text-[18px] font-medium leading-none tracking-tight text-foreground">
            Revenu cumulé
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
                  ? "text-primary"
                  : "text-foreground/40 hover:text-foreground/70"
              )}
            >
              {p === "7days" ? "7 jours" : "5 semaines"}
            </button>
          ))}
        </div>
      </header>

      <div className="h-[280px]">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Chargement
            </p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/40">
              Aucune donnée
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="2 4"
                stroke="currentColor"
                className="text-foreground/10"
                vertical={false}
              />
              <XAxis
                dataKey="date"
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
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                width={40}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "currentColor", className: "text-foreground/[0.04]" }}
              />
              <Bar
                dataKey="sales"
                fill="currentColor"
                className="text-foreground"
                radius={[2, 2, 0, 0]}
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
