"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SalesChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Graphique des ventes
        </div>
      </CardContent>
    </Card>
  );
}
