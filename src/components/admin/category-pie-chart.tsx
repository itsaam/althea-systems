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
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CategorySalesDataPoint {
  name: string;
  value: number;
  percentage: number;
  [key: string]: string | number; // Index signature for recharts compatibility
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
  "#a29bfe", // Lavande
  "#6c5ce7", // Violet foncé
];

export default function CategoryPieChart() {
  const [data, setData] = useState<CategorySalesDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("7days");

  useEffect(() => {
    async function fetchCategoryData() {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/dashboard/category-sales?period=${period}`
        );
        if (!response.ok)
          throw new Error("Erreur lors du chargement des catégories");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategoryData();
  }, [period]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: CategorySalesDataPoint }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CategorySalesDataPoint;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold mb-1">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            Montant:{" "}
            <span className="font-bold text-foreground">
              {data.value.toLocaleString("fr-FR", {
                style: "currency",
                currency: "EUR",
              })}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Pourcentage:{" "}
            <span className="font-bold text-foreground">
              {data.percentage.toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCustomLabel = (props: any) => {
    const percentage = props.percentage || 0;
    if (percentage < 5) return ""; // Ne pas afficher si trop petit
    return `${percentage.toFixed(0)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Répartition par catégorie</CardTitle>
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
          <div className="h-[300px] flex items-center justify-center">
            <div className="text-muted-foreground">Chargement...</div>
          </div>
        ) : data.length === 0 ? (
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            Aucune vente sur cette période
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: string, entry: any) => {
                  const item = entry.payload as CategorySalesDataPoint;
                  return `${value} (${item.percentage.toFixed(1)}%)`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
