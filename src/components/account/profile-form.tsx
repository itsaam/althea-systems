"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ProfileForm() {
  return (
    <form className="space-y-4 max-w-md">
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
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="jean@example.com" />
      </div>
      <div>
        <Label htmlFor="phone">Téléphone</Label>
        <Input id="phone" type="tel" placeholder="06 12 34 56 78" />
      </div>
      <Button type="submit">Enregistrer</Button>
    </form>
  );
}
