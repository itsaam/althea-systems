"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CategoryPieChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par catégorie</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Graphique en camembert
        </div>
      </CardContent>
    </Card>
  );
}
