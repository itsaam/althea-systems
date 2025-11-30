"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function AddressList() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Mes adresses</h3>
        <Button>Ajouter une adresse</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {/* Addresses will be mapped here */}
        <Card>
          <CardContent className="p-4">
            <p className="font-medium">Adresse principale</p>
            <p className="text-sm text-muted-foreground">
              123 rue de la Paix
              <br />
              75000 Paris
            </p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm">
                Modifier
              </Button>
              <Button variant="outline" size="sm">
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
