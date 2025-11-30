"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddressForm() {
  return (
    <form className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">Prénom</Label>
          <Input id="firstName" placeholder="Jean" />
        </div>
        <div>
          <Label htmlFor="lastName">Nom</Label>
          <Input id="lastName" placeholder="Dupont" />
        </div>
      </div>
      <div>
        <Label htmlFor="address">Adresse</Label>
        <Input id="address" placeholder="123 rue de la Paix" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ville</Label>
          <Input id="city" placeholder="Paris" />
        </div>
        <div>
          <Label htmlFor="postalCode">Code postal</Label>
          <Input id="postalCode" placeholder="75000" />
        </div>
      </div>
      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" type="tel" placeholder="06 12 34 56 78" />
      </div>
      <Button type="submit" className="w-full">
        Continuer
      </Button>
    </form>
  );
}
