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
import { Badge } from "@/components/ui/badge";
import { Package, Euro, AlertTriangle, MessageSquare } from "lucide-react";

interface KPIsData {
  revenue: {
    day: number;
    week: number;
    month: number;
  };
  ordersToday: number;
  lowStockAlerts: number;
  unreadMessages: number;
}

type RevenuePeriod = "day" | "week" | "month";

export default function DashboardCards() {
  const [data, setData] = useState<KPIsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revenuePeriod, setRevenuePeriod] = useState<RevenuePeriod>("day");

  useEffect(() => {
    async function fetchKPIs() {
      try {
        setLoading(true);
        const response = await fetch("/api/admin/dashboard/kpis");
        if (!response.ok) throw new Error("Erreur lors du chargement des KPIs");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchKPIs();
  }, []);

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });
  };

  const revenueLabels: Record<RevenuePeriod, string> = {
    day: "Aujourd'hui",
    week: "Cette semaine",
    month: "Ce mois",
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Chargement...
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 animate-pulse bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Erreur lors du chargement des données
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Chiffre d&apos;affaires
          </CardTitle>
          <Euro className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(data.revenue[revenuePeriod])}
          </div>
          <Select
            value={revenuePeriod}
            onValueChange={(value) => setRevenuePeriod(value as RevenuePeriod)}
          >
            <SelectTrigger className="mt-2 w-full" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{revenueLabels.day}</SelectItem>
              <SelectItem value="week">{revenueLabels.week}</SelectItem>
              <SelectItem value="month">{revenueLabels.month}</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Commandes du jour
          </CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.ordersToday}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.ordersToday === 0
              ? "Aucune commande"
              : data.ordersToday === 1
                ? "1 commande"
                : `${data.ordersToday} commandes`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alertes stock</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {data.lowStockAlerts}
            {data.lowStockAlerts > 0 && (
              <Badge variant="destructive">{data.lowStockAlerts}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.lowStockAlerts === 0
              ? "Aucune alerte"
              : `Produit${data.lowStockAlerts > 1 ? "s" : ""} avec stock faible`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Messages non lus
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold flex items-center gap-2">
            {data.unreadMessages}
            {data.unreadMessages > 0 && (
              <Badge variant="secondary">{data.unreadMessages}</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {data.unreadMessages === 0
              ? "Tous les messages traités"
              : `Message${data.unreadMessages > 1 ? "s" : ""} en attente`}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
