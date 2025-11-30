"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PaymentMethods() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Méthodes de paiement</h3>
        <Button>Ajouter une carte</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl">💳</div>
              <div>
                <p className="font-medium">**** **** **** 4242</p>
                <p className="text-sm text-muted-foreground">Expire 12/25</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
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
