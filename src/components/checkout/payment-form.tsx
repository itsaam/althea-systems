"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function PaymentForm() {
  return (
    <form className="space-y-4">
      <div>
        <Label htmlFor="cardNumber">Numéro de carte</Label>
        <Input id="cardNumber" placeholder="4242 4242 4242 4242" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="expiry">Date d&apos;expiration</Label>
          <Input id="expiry" placeholder="MM/AA" />
        </div>
        <div>
          <Label htmlFor="cvc">CVC</Label>
          <Input id="cvc" placeholder="123" />
        </div>
      </div>
      <div>
        <Label htmlFor="cardName">Nom sur la carte</Label>
        <Input id="cardName" placeholder="JEAN DUPONT" />
      </div>
      <Button type="submit" className="w-full">
        Payer
      </Button>
    </form>
  );
}
