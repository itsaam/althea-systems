import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cards = [
  { title: "Commandes", value: "0", icon: "📦" },
  { title: "Revenus", value: "0 €", icon: "💰" },
  { title: "Utilisateurs", value: "0", icon: "👥" },
  { title: "Produits", value: "0", icon: "🛍️" },
];

export default function DashboardCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <span className="text-2xl">{card.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
