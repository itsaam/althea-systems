import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function OrderReview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Récapitulatif de commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Articles</h4>
          {/* Order items */}
        </div>
        <Separator />
        <div>
          <h4 className="font-medium mb-2">Adresse de livraison</h4>
          {/* Shipping address */}
        </div>
        <Separator />
        <div>
          <h4 className="font-medium mb-2">Méthode de paiement</h4>
          {/* Payment method */}
        </div>
      </CardContent>
    </Card>
  );
}
