import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface CartSummaryProps {
  subtotal: number;
  shipping: number;
  total: number;
}

export default function CartSummary({
  subtotal,
  shipping,
  total,
}: CartSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Résumé</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span>Sous-total</span>
          <span>{subtotal.toFixed(2)} €</span>
        </div>
        <div className="flex justify-between">
          <span>Livraison</span>
          <span>{shipping === 0 ? "Gratuit" : `${shipping.toFixed(2)} €`}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-lg">
          <span>Total</span>
          <span>{total.toFixed(2)} €</span>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Passer la commande</Button>
      </CardFooter>
    </Card>
  );
}
