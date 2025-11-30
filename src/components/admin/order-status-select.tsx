"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function OrderStatusSelect() {
  return (
    <div className="space-y-2">
      <Label>Statut de la commande</Label>
      <Select defaultValue="pending">
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="pending">En attente</SelectItem>
          <SelectItem value="processing">En cours</SelectItem>
          <SelectItem value="shipped">Expédiée</SelectItem>
          <SelectItem value="delivered">Livrée</SelectItem>
          <SelectItem value="cancelled">Annulée</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
