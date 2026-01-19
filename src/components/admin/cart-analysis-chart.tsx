"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface CartAnalysisDataPoint {
  period: string;
  categories: Record<string, number>;
}

type Period = "7days" | "5weeks";

const COLORS = [
  "#00a8b5", // Turquoise principal
  "#ff6b6b", // Rouge corail
  "#4ecdc4", // Turquoise clair
  "#45b7d1", // Bleu ciel
  "#f7b731", // Jaune doré
  "#5f27cd", // Violet
  "#00d2d3", // Cyan
  "#fd79a8", // Rose
];

export default function CartAnalysisChart() {
  const [rawData, setRawData] = useState<CartAnalysisDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("7days");

  useEffect(() => {
    async function fetchCartAnalysis() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/dashboard/cart-analysis?period=${period}`
        );
        if (!response.ok)
          throw new Error("Erreur lors du chargement de l'analyse");
        const result = await response.json();
        setRawData(result);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCartAnalysis();
  }, [period]);

  // Extraire toutes les catégories uniques
  const allCategories = Array.from(
    new Set(
      rawData.flatMap((item) => Object.keys(item.categories))
    )
  );

  // Transformer les données pour Recharts
  const chartData = rawData.map((item) => ({
    period: item.period,
    ...item.categories,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = (props: any) => {
    const { active, payload, label } = props;
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-2">{label}</p>
          {payload.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              <span
                className="inline-block w-3 h-3 mr-2 rounded"
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}:{" "}
              <span className="font-bold text-foreground">
                {Number(entry.value).toLocaleString("fr-FR", {
                  style: "currency",
                  currency: "EUR",
                })}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Panier moyen par catégorie</CardTitle>
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value as Period)}
          >
            <SelectTrigger className="w-[180px]" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="5weeks">5 dernières semaines</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-muted-foreground">
            Aucune donnée disponible
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="period"
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) =>
                  `${value >= 1000 ? (value / 1000).toFixed(0) + "k" : value}€`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                iconType="circle"
              />
              {allCategories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  fill={COLORS[index % COLORS.length]}
                  radius={[4, 4, 0, 0]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
