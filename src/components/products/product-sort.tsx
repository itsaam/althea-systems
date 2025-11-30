"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function ProductSort() {
  return (
    <Select defaultValue="newest">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Trier par" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Plus récent</SelectItem>
        <SelectItem value="price-asc">Prix croissant</SelectItem>
        <SelectItem value="price-desc">Prix décroissant</SelectItem>
        <SelectItem value="name">Nom A-Z</SelectItem>
      </SelectContent>
    </Select>
  );
}
