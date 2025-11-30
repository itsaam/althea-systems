"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function ProductFilters() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-3">Catégories</h3>
        <div className="space-y-2">{/* Categories checkboxes */}</div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Prix</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox id="price-1" />
            <Label htmlFor="price-1">0 - 50 €</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="price-2" />
            <Label htmlFor="price-2">50 - 100 €</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="price-3" />
            <Label htmlFor="price-3">100+ €</Label>
          </div>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-3">Disponibilité</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="in-stock" />
          <Label htmlFor="in-stock">En stock uniquement</Label>
        </div>
      </div>
    </div>
  );
}
