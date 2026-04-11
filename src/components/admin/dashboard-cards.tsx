"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MOCK_KPIS, signalDegradedMode } from "@/lib/admin/mock-data";

interface KPIsData {
  revenue: { day: number; week: number; month: number };
  ordersToday: number;
  lowStockAlerts: number;
  unreadMessages: number;
}

type RevenuePeriod = "day" | "week" | "month";

const REVENUE_LABELS: Record<RevenuePeriod, string> = {
  day: "aujourd'hui",
  week: "cette semaine",
  month: "ce mois",
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });
}

function formatDelta(value: number): { label: string; positive: boolean } {
  const rounded = Math.round(value * 10) / 10;
  if (rounded === 0) return { label: "±0.0%", positive: true };
  const sign = rounded > 0 ? "+" : "";
  return { label: `${sign}${rounded.toFixed(1)}%`, positive: rounded >= 0 };
}

interface KpiCardProps {
  index: string;
  label: string;
  value: string;
  hint?: string;
  delta?: { label: string; positive: boolean };
  children?: React.ReactNode;
}

function KpiCard({ index, label, value, hint, delta, children }: KpiCardProps) {
  return (
    <article className="relative flex flex-col justify-between border-t border-border/60 pt-6 pb-5">
      <div>
        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground/50">
            <span className="mr-1.5 tabular-nums text-foreground/35">
              {index}
            </span>
            {label}
          </p>
          {delta && (
            <span
              className={cn(
                "font-mono text-[10px] tabular-nums tracking-tight",
                delta.positive ? "text-foreground/70" : "text-foreground/45"
              )}
            >
              {delta.label}
            </span>
          )}
        </div>
        <p className="mt-5 font-display text-[44px] font-semibold leading-none tracking-[-0.025em] text-foreground tabular-nums">
          {value}
        </p>
        {hint && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            {hint}
          </p>
        )}
      </div>
      {children && <div className="mt-4">{children}</div>}
    </article>
  );
}

export default function DashboardCards() {
  const [data, setData] = useState<KPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("day");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard/kpis");
        if (!res.ok) throw new Error("kpis-unavailable");
        const json = (await res.json()) as KPIsData;
        if (!cancelled) setData(json);
      } catch {
        // Silent fallback — DB unavailable in dev backdoor mode
        if (!cancelled) {
          setData({
            revenue: MOCK_KPIS.revenue,
            ordersToday: MOCK_KPIS.ordersToday,
            lowStockAlerts: MOCK_KPIS.lowStockAlerts,
            unreadMessages: MOCK_KPIS.unreadMessages,
          });
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
  }, []);

  if (loading || !data) {
    return (
      <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-background p-6">
            <div className="h-3 w-24 animate-pulse rounded bg-foreground/5" />
            <div className="mt-6 h-11 w-32 animate-pulse rounded bg-foreground/5" />
            <div className="mt-4 h-3 w-16 animate-pulse rounded bg-foreground/5" />
          </div>
        ))}
      </div>
    );
  }

  const revenueDelta = formatDelta(MOCK_KPIS.deltas.revenue);
  const ordersDelta = formatDelta(MOCK_KPIS.deltas.orders);

  return (
    <div className="grid gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
      <div className="bg-background p-6">
        <KpiCard
          index="01"
          label="Chiffre d'affaires"
          value={formatCurrency(data.revenue[revenuePeriod])}
          hint={REVENUE_LABELS[revenuePeriod]}
          delta={revenueDelta}
        >
          <div className="flex items-center gap-1">
            {(["day", "week", "month"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRevenuePeriod(p)}
                className={cn(
                  "font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                  revenuePeriod === p
                    ? "text-electric-indigo-500"
                    : "text-foreground/40 hover:text-foreground/70"
                )}
              >
                {p === "day" ? "jour" : p === "week" ? "semaine" : "mois"}
                {p !== "month" && (
                  <span className="ml-1 text-foreground/15">/</span>
                )}
              </button>
            ))}
          </div>
        </KpiCard>
      </div>
      <div className="bg-background p-6">
        <KpiCard
          index="02"
          label="Commandes"
          value={data.ordersToday.toString().padStart(2, "0")}
          hint="aujourd'hui"
          delta={ordersDelta}
        />
      </div>
      <div className="bg-background p-6">
        <KpiCard
          index="03"
          label="Alertes stock"
          value={data.lowStockAlerts.toString().padStart(2, "0")}
          hint={
            data.lowStockAlerts === 0
              ? "aucune alerte"
              : "produits en rupture"
          }
        />
      </div>
      <div className="bg-background p-6">
        <KpiCard
          index="04"
          label="Messages"
          value={data.unreadMessages.toString().padStart(2, "0")}
          hint={
            data.unreadMessages === 0 ? "tous traités" : "non lus en attente"
          }
        />
      </div>
    </div>
  );
}
