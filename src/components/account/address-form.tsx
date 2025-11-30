"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AddressForm() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Ajouter une adresse</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle adresse</DialogTitle>
        </DialogHeader>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input id="firstName" />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input id="lastName" />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Adresse</Label>
            <Input id="address" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input id="city" />
            </div>
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input id="postalCode" />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Téléphone</Label>
            <Input id="phone" type="tel" />
          </div>
          <Button type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
