import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ConfirmationDetailsProps {
  orderId: string;
  orderDate: string;
  total: number;
}

export default function ConfirmationDetails({
  orderId,
  orderDate,
  total,
}: ConfirmationDetailsProps) {
  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="text-4xl mb-4">✅</div>
        <CardTitle>Commande confirmée !</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-muted-foreground">
          <p>
            Numéro de commande: <strong>{orderId}</strong>
          </p>
          <p>Date: {orderDate}</p>
          <p>
            Total: <strong>{total.toFixed(2)} €</strong>
          </p>
        </div>
        <p className="text-sm text-center text-muted-foreground">
          Un email de confirmation vous a été envoyé.
        </p>
        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/orders">Voir mes commandes</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Continuer mes achats</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
